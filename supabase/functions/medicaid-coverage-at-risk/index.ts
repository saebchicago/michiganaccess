import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/**
 * Medicaid Coverage at Risk - county projection.
 *
 * Re-runs the proportional-allocation model that backs
 * src/data/medicaidCoverageAtRiskFallback.ts against live ACS data so the
 * county distribution tracks the latest 5-year enrollment shares.
 *
 * Model (identical to the fallback module, see its header for full sourcing):
 *   1. Pull ACS table C27007 (means-tested public coverage) for every Michigan
 *      county: medicaidEnrollment = C27007_003E (male) + C27007_012E (female).
 *   2. county share = countyEnrollment / sum(all county enrollment).
 *   3. Allocate the Urban Institute Michigan-specific P.L. 119-21 work-
 *      requirements projection range (171,000-355,000 adults by 2028) to each
 *      county by that share. Range only - never a point estimate.
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
const ACS_MALE_VAR = "C27007_003E"; // Male: with Medicaid/means-tested public coverage
const ACS_FEMALE_VAR = "C27007_012E"; // Female: with Medicaid/means-tested public coverage

// Urban Institute, March 2026 - Michigan-specific P.L. 119-21 (OBBBA) work
// requirements projection. Range only; do not present as point estimates.
// https://www.urban.org/research/publication/projected-reductions-medicaid-expansion-enrollment-under-obbbas-work
const URBAN_MICHIGAN_LOW = 171_000;
const URBAN_MICHIGAN_HIGH = 355_000;

const PROJECTION_SOURCE_NAME =
  "Modeled from Urban Institute / CBO P.L. 119-21 Medicaid work requirements score (county-allocated)";
const METHODOLOGY_URL = "/methodology/medicaid-coverage-at-risk";
const PROJECTION_AS_OF = "2026-04";

interface MedicaidCoverageRangeEntry {
  county: string;
  slug: string;
  fips: string;
  currentEnrollment: number;
  projectedLossLow: number;
  projectedLossHigh: number;
  projectionSourceName: string;
  methodologyUrl: string;
  projectionAsOf: string;
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
      { error: "CENSUS_API_KEY is not set on the medicaid-coverage-at-risk function" },
      500,
    );
  }

  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return jsonResponse(cached.payload);
  }

  const censusUrl =
    `https://api.census.gov/data/${ACS_YEAR}/acs/acs5` +
    `?get=NAME,${ACS_MALE_VAR},${ACS_FEMALE_VAR}` +
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

  // First row is the header: [NAME, C27007_003E, C27007_012E, state, county].
  const [, ...dataRows] = rows;
  const counties = dataRows.map((row) => {
    const male = Number(row[1]);
    const female = Number(row[2]);
    const fips = `${row[3]}${row[4]}`;
    const county = row[0].replace(/ County, Michigan$/, "");
    return { county, fips, male, female, enrollment: male + female };
  });

  // Suppressed ACS values surface as large negatives (e.g. -666666666). Refuse
  // to compute shares from a partial table rather than silently distort them.
  const bad = counties.filter(
    (c) => !Number.isFinite(c.enrollment) || c.male < 0 || c.female < 0,
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

  const total = counties.reduce((sum, c) => sum + c.enrollment, 0);
  if (total <= 0) {
    return jsonResponse({ error: "Census ACS county enrollment summed to zero" }, 502);
  }

  const data: MedicaidCoverageRangeEntry[] = counties.map((c) => {
    const share = c.enrollment / total;
    return {
      county: c.county,
      slug: slugify(c.county),
      fips: c.fips,
      currentEnrollment: c.enrollment,
      projectedLossLow: Math.max(1, Math.round(URBAN_MICHIGAN_LOW * share)),
      projectedLossHigh: Math.max(1, Math.round(URBAN_MICHIGAN_HIGH * share)),
      projectionSourceName: PROJECTION_SOURCE_NAME,
      methodologyUrl: METHODOLOGY_URL,
      projectionAsOf: PROJECTION_AS_OF,
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
