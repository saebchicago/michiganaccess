import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// In-memory cache (per isolate, ~60 min TTL)
const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 60 * 60 * 1000;

function cacheGet(key: string): unknown | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

// Version marker for deployment verification
const PROXY_VERSION = "2.0";

/**
 * Known key variables for each table — avoids speculative enumeration.
 * Census API returns 400 if any variable doesn't exist, so we must be precise.
 */
const TABLE_VARIABLES: Record<string, string[]> = {
  B01001: ["B01001_001E","B01001_002E","B01001_026E","B01001_001M"],
  B02001: ["B02001_001E","B02001_002E","B02001_003E","B02001_004E","B02001_005E","B02001_006E","B02001_007E","B02001_008E"],
  B03003: ["B03003_001E","B03003_002E","B03003_003E"],
  B19013: ["B19013_001E","B19013_001M"],
  B17001: ["B17001_001E","B17001_002E","B17001_001M","B17001_002M"],
  B23025: ["B23025_001E","B23025_002E","B23025_003E","B23025_004E","B23025_005E","B23025_007E"],
  B25064: ["B25064_001E","B25064_001M"],
  B25001: ["B25001_001E"],
  B25003: ["B25003_001E","B25003_002E","B25003_003E"],
  B15003: ["B15003_001E","B15003_017E","B15003_021E","B15003_022E","B15003_023E","B15003_025E"],
  B27001: ["B27001_001E"],
  B08301: ["B08301_001E","B08301_002E","B08301_010E","B08301_019E","B08301_021E"],
  B16001: ["B16001_001E","B16001_002E","B16001_003E"],
  B25070: ["B25070_001E","B25070_007E","B25070_008E","B25070_009E","B25070_010E"],
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const tables = url.searchParams.get("tables")?.split(",") || [];
    const geoType = url.searchParams.get("geoType") || "county";
    const geoFips = url.searchParams.get("geoFips") || "";
    const year = url.searchParams.get("year") || "2023";
    const dataset = url.searchParams.get("dataset") || "acs/acs5";

    if (tables.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing 'tables' parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geoStr = buildGeoStr(geoType, geoFips);
    const results: Record<string, unknown> = {};

    for (const table of tables) {
      const cacheKey = `${dataset}:${year}:${table}:${geoType}:${geoFips}`;
      const cached = cacheGet(cacheKey);
      if (cached) {
        results[table] = cached;
        continue;
      }

      // Get known variables for this table, or try discovery
      let vars = TABLE_VARIABLES[table];

      if (!vars) {
        // For unknown tables, try fetching the group metadata to discover variables
        try {
          const groupUrl = `https://api.census.gov/data/${year}/${dataset}/groups/${table}.json`;
          const groupResp = await fetch(groupUrl);
          if (groupResp.ok) {
            const groupData = await groupResp.json();
            vars = Object.keys(groupData.variables || {})
              .filter((v: string) => v.endsWith("E") && !v.endsWith("EA"))
              .slice(0, 30); // limit to 30 vars
          } else {
            await groupResp.text();
            vars = [];
          }
        } catch {
          vars = [];
        }
      }

      if (vars.length === 0) {
        results[table] = { name: "", variables: {}, error: "No known variables for table" };
        continue;
      }

      // Census API allows ~50 vars per request
      const allData: Record<string, string | number | null> = {};
      let geoName = "";

      const chunks: string[][] = [];
      for (let i = 0; i < vars.length; i += 48) {
        chunks.push(vars.slice(i, i + 48));
      }

      for (const chunk of chunks) {
        const varStr = ["NAME", ...chunk].join(",");
        const apiUrl = `https://api.census.gov/data/${year}/${dataset}?get=${varStr}&${geoStr}`;

        const resp = await fetch(apiUrl);
        if (!resp.ok) {
          console.warn(`Census API ${resp.status} for ${table}: ${await resp.text()}`);
          continue;
        }

        const data = await resp.json();
        if (!Array.isArray(data) || data.length < 2) continue;

        const headers = data[0] as string[];

        if (data.length === 2) {
          // Single geography
          const row = data[1] as (string | null)[];
          geoName = row[0] || geoName;
          for (let j = 1; j < headers.length; j++) {
            if (headers[j] === "state" || headers[j] === "county") continue;
            const val = row[j];
            allData[headers[j]] = val !== null && val !== "" ? (isNaN(Number(val)) ? val : Number(val)) : null;
          }
        } else {
          // Multiple geographies — return as array under _multi
          const rows = data.slice(1).map((row: (string | null)[]) => {
            const obj: Record<string, string | number | null> = {};
            for (let j = 0; j < headers.length; j++) {
              const val = row[j];
              obj[headers[j]] = val !== null && val !== "" ? (isNaN(Number(val)) ? val : Number(val)) : null;
            }
            return obj;
          });
          (allData as any)._multi = rows;
        }
      }

      const tableResult = { name: geoName, variables: allData };
      cache.set(cacheKey, { data: tableResult, ts: Date.now() });
      results[table] = tableResult;
    }

    return new Response(
      JSON.stringify({
        version: PROXY_VERSION,
        year: Number(year),
        dataset,
        geoType,
        geoFips,
        tables: results,
        source: "U.S. Census Bureau ACS",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Census ACS proxy error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
