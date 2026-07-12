import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/**
 * Census ACS proxy.
 *
 * Fetches US Census Bureau ACS data for the client without exposing
 * the Census API key. Hardens the upstream call against the failure
 * mode that flatlined every score on the platform: when the Census
 * API was rate-limited it returned an HTML error page, the previous
 * proxy crashed inside `await resp.json()`, and the client hook
 * silently substituted constant defaults so every county got the
 * same composite score.
 *
 * Hard rules in this version:
 *   - CENSUS_API_KEY is REQUIRED. If unset, the function returns 500
 *     immediately with an actionable error message. We do not fall
 *     back to keyless requests because that is what got us
 *     rate-limited in the first place.
 *   - Every upstream response is content-type-checked before parsing.
 *     If Census returns anything other than `application/json`, the
 *     function returns a structured 502 with the upstream status and
 *     a 200-character body snippet. We do not silently swallow the
 *     error and we never return 200 with placeholder data.
 *   - Partial-success responses are explicitly forbidden. If any
 *     requested table fails upstream, the whole response is a 502
 *     with the per-table errors enumerated. Half-empty payloads are
 *     what let the client believe everything was fine.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PROXY_VERSION = "3.0";
const CACHE_TTL_MS = 60 * 60 * 1000;
const cache = new Map<string, { data: unknown; ts: number }>();

function cacheGet(key: string): unknown | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

/**
 * Known key variables per ACS table. The Census API returns 400 if any
 * requested variable does not exist for the chosen dataset/year, so we
 * enumerate explicitly rather than speculatively requesting families.
 */
const TABLE_VARIABLES: Record<string, string[]> = {
  B01001: ["B01001_001E", "B01001_002E", "B01001_026E", "B01001_001M"],
  B02001: [
    "B02001_001E",
    "B02001_002E",
    "B02001_003E",
    "B02001_004E",
    "B02001_005E",
    "B02001_006E",
    "B02001_007E",
    "B02001_008E",
    "B02001_001M",
    "B02001_002M",
    "B02001_003M",
    "B02001_004M",
    "B02001_005M",
    "B02001_006M",
    "B02001_007M",
    "B02001_008M",
  ],
  B03003: [
    "B03003_001E",
    "B03003_002E",
    "B03003_003E",
    "B03003_001M",
    "B03003_002M",
    "B03003_003M",
  ],
  B19013: ["B19013_001E", "B19013_001M"],
  B17001: ["B17001_001E", "B17001_002E", "B17001_001M", "B17001_002M"],
  B23025: [
    "B23025_001E",
    "B23025_002E",
    "B23025_003E",
    "B23025_004E",
    "B23025_005E",
    "B23025_007E",
    "B23025_001M",
    "B23025_002M",
    "B23025_003M",
    "B23025_004M",
    "B23025_005M",
    "B23025_007M",
  ],
  B25064: ["B25064_001E", "B25064_001M"],
  B25001: ["B25001_001E", "B25001_001M"],
  B25003: [
    "B25003_001E",
    "B25003_002E",
    "B25003_003E",
    "B25003_001M",
    "B25003_002M",
    "B25003_003M",
  ],
  B15003: [
    "B15003_001E",
    "B15003_017E",
    "B15003_021E",
    "B15003_022E",
    "B15003_023E",
    "B15003_025E",
    "B15003_001M",
    "B15003_017M",
    "B15003_021M",
    "B15003_022M",
    "B15003_023M",
    "B15003_025M",
  ],
  B27001: ["B27001_001E", "B27001_001M"],
  B08301: [
    "B08301_001E",
    "B08301_002E",
    "B08301_010E",
    "B08301_019E",
    "B08301_021E",
    "B08301_001M",
    "B08301_002M",
    "B08301_010M",
    "B08301_019M",
    "B08301_021M",
  ],
  B16001: [
    "B16001_001E",
    "B16001_002E",
    "B16001_003E",
    "B16001_001M",
    "B16001_002M",
    "B16001_003M",
  ],
  B25070: [
    "B25070_001E",
    "B25070_007E",
    "B25070_008E",
    "B25070_009E",
    "B25070_010E",
  ],
};

function buildGeoStr(geoType: string, geoFips: string): string {
  const stateFips = "26";
  switch (geoType) {
    case "state":
      return `for=state:${stateFips}`;
    case "county":
      return geoFips
        ? `for=county:${geoFips}&in=state:${stateFips}`
        : `for=county:*&in=state:${stateFips}`;
    case "place":
      return `for=place:${geoFips}&in=state:${stateFips}`;
    case "tract":
      if (geoFips.includes(":")) {
        const [c, t] = geoFips.split(":");
        return `for=tract:${t}&in=state:${stateFips}+county:${c}`;
      }
      return `for=tract:*&in=state:${stateFips}+county:${geoFips}`;
    case "zcta":
      return `for=zip%20code%20tabulation%20area:${geoFips}&in=state:${stateFips}`;
    default:
      return `for=county:*&in=state:${stateFips}`;
  }
}

/**
 * Strict response parser. Returns the parsed JSON on success or a
 * structured error describing what came back. Callers must surface
 * the error; they may not paper over it with defaults.
 */
async function readJsonStrict(
  resp: Response,
): Promise<
  | { ok: true; data: unknown }
  | { ok: false; status: number; contentType: string; bodySnippet: string }
> {
  const contentType = resp.headers.get("content-type") ?? "";
  const bodyText = await resp.text();

  if (!resp.ok) {
    return {
      ok: false,
      status: resp.status,
      contentType,
      bodySnippet: bodyText.slice(0, 200),
    };
  }

  if (!contentType.toLowerCase().includes("application/json")) {
    return {
      ok: false,
      status: resp.status,
      contentType,
      bodySnippet: bodyText.slice(0, 200),
    };
  }

  try {
    return { ok: true, data: JSON.parse(bodyText) };
  } catch (err) {
    return {
      ok: false,
      status: resp.status,
      contentType,
      bodySnippet: `JSON parse failed: ${
        err instanceof Error ? err.message : "unknown"
      } | body: ${bodyText.slice(0, 160)}`,
    };
  }
}

interface TableResult {
  name: string;
  variables: Record<string, string | number | null>;
}

interface TableError {
  table: string;
  upstreamStatus: number;
  contentType: string;
  bodySnippet: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const censusKey = Deno.env.get("CENSUS_API_KEY");
  if (!censusKey) {
    return new Response(
      JSON.stringify({
        error: "CENSUS_API_KEY is not configured",
        proxyVersion: PROXY_VERSION,
        hint: "Set the CENSUS_API_KEY secret on the census-acs-proxy edge function in Supabase. Anonymous requests are rate-limited by the Census API and break this proxy.",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  try {
    const url = new URL(req.url);
    const tables = url.searchParams.get("tables")?.split(",") ?? [];
    const geoType = url.searchParams.get("geoType") ?? "county";
    const geoFips = url.searchParams.get("geoFips") ?? "";
    const year = url.searchParams.get("year") ?? "2022";
    const dataset = url.searchParams.get("dataset") ?? "acs/acs5";

    if (tables.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing 'tables' parameter" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const geoStr = buildGeoStr(geoType, geoFips);
    const results: Record<string, TableResult> = {};
    const tableErrors: TableError[] = [];

    for (const table of tables) {
      const cacheKey = `${dataset}:${year}:${table}:${geoType}:${geoFips}`;
      const cached = cacheGet(cacheKey) as TableResult | null;
      if (cached) {
        results[table] = cached;
        continue;
      }

      const vars = TABLE_VARIABLES[table];
      if (!vars || vars.length === 0) {
        // Unknown tables are now a hard failure rather than a silent
        // empty payload. Add them to TABLE_VARIABLES explicitly so the
        // proxy stays auditable.
        tableErrors.push({
          table,
          upstreamStatus: 0,
          contentType: "",
          bodySnippet: `Table '${table}' is not in the allowlist (TABLE_VARIABLES). Add the expected variables before requesting it from the client.`,
        });
        continue;
      }

      const allData: Record<string, string | number | null> = {};
      let geoName = "";

      const chunks: string[][] = [];
      for (let i = 0; i < vars.length; i += 48) {
        chunks.push(vars.slice(i, i + 48));
      }

      let chunkFailed = false;
      for (const chunk of chunks) {
        const varStr = ["NAME", ...chunk].join(",");
        const apiUrl =
          `https://api.census.gov/data/${year}/${dataset}` +
          `?get=${varStr}&${geoStr}&key=${censusKey}`;

        const resp = await fetch(apiUrl);
        const parsed = await readJsonStrict(resp);

        if (!parsed.ok) {
          tableErrors.push({
            table,
            upstreamStatus: parsed.status,
            contentType: parsed.contentType,
            bodySnippet: parsed.bodySnippet,
          });
          chunkFailed = true;
          break;
        }

        const data = parsed.data;
        if (!Array.isArray(data) || data.length < 2) {
          tableErrors.push({
            table,
            upstreamStatus: resp.status,
            contentType: resp.headers.get("content-type") ?? "",
            bodySnippet: `Census response was JSON but not the expected array-of-arrays shape (length=${
              Array.isArray(data) ? data.length : "non-array"
            }).`,
          });
          chunkFailed = true;
          break;
        }

        const headers = data[0] as string[];

        if (data.length === 2) {
          const row = data[1] as (string | null)[];
          geoName = row[0] || geoName;
          for (let j = 1; j < headers.length; j++) {
            if (headers[j] === "state" || headers[j] === "county") continue;
            const val = row[j];
            allData[headers[j]] =
              val !== null && val !== ""
                ? isNaN(Number(val))
                  ? val
                  : Number(val)
                : null;
          }
        } else {
          const rows = data.slice(1).map((row: unknown) => {
            const obj: Record<string, string | number | null> = {};
            const r = row as (string | null)[];
            for (let j = 0; j < headers.length; j++) {
              const val = r[j];
              obj[headers[j]] =
                val !== null && val !== ""
                  ? isNaN(Number(val))
                    ? val
                    : Number(val)
                  : null;
            }
            return obj;
          });
          (allData as Record<string, unknown>)._multi = rows;
        }
      }

      if (chunkFailed) continue;

      const tableResult: TableResult = { name: geoName, variables: allData };
      cache.set(cacheKey, { data: tableResult, ts: Date.now() });
      results[table] = tableResult;
    }

    if (tableErrors.length > 0) {
      // Failing loudly: a partial response would let the client paper
      // over the gap with defaults. Return 502 so the hook treats this
      // as upstream-failed and the UI renders the "data unavailable"
      // state.
      return new Response(
        JSON.stringify({
          error: "Census upstream returned an error for at least one table",
          proxyVersion: PROXY_VERSION,
          year: Number(year),
          dataset,
          geoType,
          geoFips,
          tableErrors,
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({
        proxyVersion: PROXY_VERSION,
        year: Number(year),
        dataset,
        geoType,
        geoFips,
        tables: results,
        source: "U.S. Census Bureau ACS",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("Census ACS proxy error:", err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Unknown error",
        proxyVersion: PROXY_VERSION,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
