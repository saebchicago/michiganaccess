import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/**
 * Dual-Eligible Exposure - county allocation.
 *
 * Re-runs the proportional-allocation model that backs
 * src/data/dualEligibleExposureFallback.ts against live ACS data so the
 * county distribution tracks the latest 5-year shares.
 *
 * Model (identical to the fallback module, see its header for full sourcing
 * and caveats - notably high relative MoE in the smallest counties):
 *   1. Pull ACS table B27010 (simultaneous Medicare + Medicaid coverage) for
 *      every Michigan county:
 *        acsDualEstimate = B27010_046E (ages 35-64) + B27010_062E (ages 65+).
 *   2. county share = acsDualEstimate / sum(all county acsDualEstimate).
 *   3. Allocate the statewide display range (MACPAC 2022 / KFF 2024-25,
 *      335,000-405,000 dual-eligibles) to each county by that share.
 *      ACS county shares distribute the administrative range; ACS absolute
 *      values are not presented as the dual-eligible count.
 *
 * Hardening conventions mirror census-acs-proxy:
 *   - CENSUS_API_KEY is REQUIRED. Missing key -> 500, never a keyless request.
 *   - Upstream response is content-type-checked; anything other than JSON, a
 *     non-200, or a suppressed/negative county value -> 502 with a snippet.
 *     We never emit 200 with partial or placeholder data; the CLIENT hook owns
 *     the provenance-labeled static fallback when this function is unavailable.
 */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const FUNCTION_VERSION = "1.0";

// Server-side cache so a burst of clients does not each hit the Census API.
// The function takes no parameters (always the full 83-county set), so a single
// key suffices. Client hooks additionally cache for 24h via React Query.
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
let cached: { payload: unknown; ts: number } | null = null;

// Michigan FIPS and the ACS dataset/table that the fallback methodology pins.
const MI_STATE_FIPS = "26";
const ACS_YEAR = "2023";
const ACS_AGE_35_64_VAR = "B27010_046E"; // ages 35-64: simultaneous Medicare + Medicaid
const ACS_AGE_65_VAR = "B27010_062E"; // ages 65+: simultaneous Medicare + Medicaid

// Statewide display range: MACPAC Data Book Dec 2025 (CY2022) 405,000 high;
// KFF State Health Facts 2024/2025 administrative figures anchor the 335,000
// low. ACS county shares distribute this range. Range only.
const DISPLAY_RANGE_LOW = 335_000;
const DISPLAY_RANGE_HIGH = 405_000;

interface DualEligibleCountyEntry {
  county: string;
  slug: string;
  fips: string;
  acsDualEstimate: number;
  allocatedLow: number;
  allocatedHigh: number;
}

function slugify(county: string): string {
  return county.toLowerCase().replace(/\s+/g, "-").replace(/\./g, "");
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  const censusKey = Deno.env.get("CENSUS_API_KEY");
  if (!censusKey) {
    return jsonResponse(
      { error: "CENSUS_API_KEY is not set on the dual-eligible-exposure function" },
      500,
    );
  }

  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return jsonResponse(cached.payload);
  }

  const censusUrl =
    `https://api.census.gov/data/${ACS_YEAR}/acs/acs5` +
    `?get=NAME,${ACS_AGE_35_64_VAR},${ACS_AGE_65_VAR}` +
    `&for=county:*&in=state:${MI_STATE_FIPS}&key=${censusKey}`;

  let rows: string[][];
  try {
    const resp = await fetch(censusUrl);
    const contentType = resp.headers.get("content-type") ?? "";
    const bodyText = await resp.text();

    if (!resp.ok) {
      return jsonResponse(
        {
          error: `Census ACS returned HTTP ${resp.status}`,
          contentType,
          bodySnippet: bodyText.slice(0, 200),
        },
        502,
      );
    }
    if (!contentType.toLowerCase().includes("application/json")) {
      return jsonResponse(
        {
          error: "Census ACS returned 200 but the body was not JSON",
          contentType,
          bodySnippet: bodyText.slice(0, 200),
        },
        502,
      );
    }
    rows = JSON.parse(bodyText) as string[][];
  } catch (err) {
    return jsonResponse({ error: `Census ACS fetch failed: ${String(err)}` }, 502);
  }

  // First row is the header: [NAME, B27010_046E, B27010_062E, state, county].
  const [, ...dataRows] = rows;
  const counties = dataRows.map((row) => {
    const age3564 = Number(row[1]);
    const age65 = Number(row[2]);
    const fips = `${row[3]}${row[4]}`;
    const county = row[0].replace(/ County, Michigan$/, "");
    return { county, fips, age3564, age65, acsDualEstimate: age3564 + age65 };
  });

  // Suppressed ACS values surface as large negatives (e.g. -666666666). Refuse
  // to compute shares from a partial table rather than silently distort them.
  const bad = counties.filter(
    (c) => !Number.isFinite(c.acsDualEstimate) || c.age3564 < 0 || c.age65 < 0,
  );
  if (counties.length === 0 || bad.length > 0) {
    return jsonResponse(
      {
        error: "Census ACS returned suppressed or malformed county values",
        affected: bad.map((c) => c.county),
        countyCount: counties.length,
      },
      502,
    );
  }

  const total = counties.reduce((sum, c) => sum + c.acsDualEstimate, 0);
  if (total <= 0) {
    return jsonResponse({ error: "Census ACS county estimates summed to zero" }, 502);
  }

  const data: DualEligibleCountyEntry[] = counties.map((c) => {
    const share = c.acsDualEstimate / total;
    return {
      county: c.county,
      slug: slugify(c.county),
      fips: c.fips,
      acsDualEstimate: c.acsDualEstimate,
      allocatedLow: Math.max(1, Math.round(DISPLAY_RANGE_LOW * share)),
      allocatedHigh: Math.max(1, Math.round(DISPLAY_RANGE_HIGH * share)),
    };
  });

  const payload = {
    data,
    version: FUNCTION_VERSION,
    acsYear: ACS_YEAR,
    countyCount: data.length,
    fetched_at: new Date().toISOString(),
  };
  cached = { payload, ts: Date.now() };
  return jsonResponse(payload);
});
