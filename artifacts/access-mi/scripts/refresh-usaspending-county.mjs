#!/usr/bin/env node
/**
 * Refresh `src/data/usaspending-county.generated.json` (data) and
 * `src/data/federalSpending.ts` (typed shim) from USASpending.gov for all
 * 83 Michigan counties.
 *
 *   Source     USASpending.gov API v2 (Treasury / Bureau of the Fiscal Service)
 *   Landing    https://www.usaspending.gov/
 *   Endpoints  POST /api/v2/search/spending_by_geography/   (county totals)
 *              POST /api/v2/search/spending_by_category/cfda/ (per-county programs)
 *
 * Provenance VERIFIED: these are published federal transaction obligations,
 * not estimates. Two caveats travel with every figure and are recorded in
 * provenance so the UI can print them:
 *   1. Geography is the RECIPIENT's location. Statewide programs paid to a
 *      state agency land entirely in the county where that agency sits
 *      (Medicaid and SNAP concentrate in Ingham County / Lansing), so a
 *      county figure is not "federal dollars spent on this county's
 *      residents".
 *   2. Program buckets are aggregated from CFDA program numbers, which cover
 *      assistance listings only; contract obligations without a CFDA number
 *      fall into the county total but into no bucket.
 *
 * Replaces the previous hand-seeded 20-county table. Any figure the API does
 * not return is null, never 0 - except a county the API reports with no
 * awards at all, which is a real 0 and is labelled as such by status.
 *
 * Follows the refresh-cdc-svi-county.mjs pending-ci pattern: any fetch or
 * parse failure with --apply writes the stub (83 counties, nulls, PENDING);
 * --require-live makes it fatal instead.
 */
import { writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchAndRecord, writeManifest } from "./lib/ingest-manifest.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..");
const registryPath = path.join(projectRoot, "src/data/census-geographies.ts");
const outJsonPath = path.join(projectRoot, "src/data/usaspending-county.generated.json");
const outTsPath = path.join(projectRoot, "src/data/federalSpending.ts");

const APPLY = process.argv.includes("--apply");
const REQUIRE_LIVE = process.argv.includes("--require-live");

const API = "https://api.usaspending.gov/api/v2";
const SOURCE_LANDING = "https://www.usaspending.gov/";

const manifestEntries = [];
const BUILD_ID = `refresh-usaspending-county-${new Date().toISOString().replace(/[:.]/g, "-")}`;

/** Newest complete federal fiscal year first. FY runs Oct 1 - Sep 30. */
function fiscalYearCandidates() {
  const now = new Date();
  const fyOfToday = now.getUTCMonth() >= 9 ? now.getUTCFullYear() + 1 : now.getUTCFullYear();
  // The most recently completed FY, then the one before it as a fallback.
  return [fyOfToday - 1, fyOfToday - 2];
}

const fyWindow = (fy) => ({ start_date: `${fy - 1}-10-01`, end_date: `${fy}-09-30` });

/**
 * CFDA prefix -> the bucket the UI already renders. Order matters: the first
 * matching rule wins. Specific program numbers beat agency-wide prefixes.
 */
const BUCKETS = [
  { field: "medicaid_millions", label: "Medicaid", match: (c) => c === "93.778" },
  { field: "snap_millions", label: "SNAP / food assistance", match: (c) => ["10.551", "10.561", "10.555", "10.557", "10.559", "10.558"].includes(c) },
  { field: "housing_millions", label: "Housing (HUD)", match: (c) => c.startsWith("14.") },
  { field: "energy_millions", label: "Energy and weatherization", match: (c) => c.startsWith("81.") || c === "93.568" },
  { field: "education_millions", label: "Education", match: (c) => c.startsWith("84.") },
  { field: "infrastructure_millions", label: "Transportation and infrastructure", match: (c) => c.startsWith("20.") || c.startsWith("23.") || c.startsWith("11.") || c.startsWith("66.") || c.startsWith("97.") },
  { field: "health_grants_millions", label: "Other health and human services", match: (c) => c.startsWith("93.") },
];
const BUCKET_FIELDS = BUCKETS.map((b) => b.field);

async function postJson(sourceId, endpoint, body, vintage) {
  const text = await fetchAndRecord({
    sourceId,
    url: `${API}${endpoint}`,
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json", "user-agent": "accessmi-data-refresh" },
    body: JSON.stringify(body),
    vintage,
    minBytes: 20,
    entries: manifestEntries,
  });
  const json = JSON.parse(text);
  if (!json || !Array.isArray(json.results)) {
    throw new Error(`${sourceId}: response has no results array`);
  }
  return json;
}

async function loadMiCountyFips() {
  const src = await readFile(registryPath, "utf8");
  const start = src.indexOf("MI_COUNTY_FIPS");
  const open = src.indexOf("{", start);
  const close = src.indexOf("}", open);
  const body = src.slice(open + 1, close);
  const map = new Map();
  const re = /(?:"([^"]+)"|(\b[A-Z][\w. ]*))\s*:\s*"(\d{3})"/g;
  let m;
  while ((m = re.exec(body)) !== null) map.set((m[1] ?? m[2]).trim(), `26${m[3]}`);
  if (map.size !== 83) throw new Error(`Registry parse produced ${map.size} counties, expected 83.`);
  return map;
}

const toMillions = (dollars) => (dollars === null || dollars === undefined ? null : Math.round((dollars / 1_000_000) * 10) / 10);

async function fetchCountyTotals(fips, fy) {
  const totals = new Map();
  // The geography endpoint accepts the whole state in one call.
  const json = await postJson("usaspending-county-totals", "/search/spending_by_geography/", {
    scope: "recipient_location",
    geo_layer: "county",
    geo_layer_filters: fips,
    filters: { time_period: [fyWindow(fy)] },
    spending_level: "transactions",
  }, `FY${fy}`);
  for (const r of json.results) {
    totals.set(String(r.shape_code), {
      totalDollars: typeof r.aggregated_amount === "number" ? r.aggregated_amount : null,
      population: typeof r.population === "number" ? r.population : null,
      perCapita: typeof r.per_capita === "number" ? Math.round(r.per_capita) : null,
    });
  }
  if (totals.size === 0) throw new Error(`No county totals returned for FY${fy}.`);
  return totals;
}

async function fetchCountyPrograms(countyFips, fy) {
  const json = await postJson(`usaspending-cfda-${countyFips}`, "/search/spending_by_category/cfda/", {
    filters: {
      time_period: [fyWindow(fy)],
      recipient_locations: [{ country: "USA", state: "MI", county: countyFips.slice(2) }],
    },
    limit: 100,
    spending_level: "transactions",
  }, `FY${fy}`);

  const buckets = Object.fromEntries(BUCKET_FIELDS.map((f) => [f, 0]));
  let matchedDollars = 0;
  const topPrograms = [];
  for (const r of json.results) {
    const code = String(r.code ?? "").trim();
    const amount = typeof r.amount === "number" ? r.amount : null;
    if (amount === null || !code) continue;
    if (topPrograms.length < 5) topPrograms.push({ cfda: code, name: String(r.name ?? ""), dollars: amount });
    const rule = BUCKETS.find((b) => b.match(code));
    if (!rule) continue;
    buckets[rule.field] += amount;
    matchedDollars += amount;
  }
  return {
    buckets: Object.fromEntries(BUCKET_FIELDS.map((f) => [f, toMillions(buckets[f])])),
    cfdaCoveredDollars: matchedDollars,
    topPrograms,
  };
}

function buildProvenance({ ingestedAt, populated, fy, pendingReason }) {
  return {
    source_name: "USASpending.gov (Treasury, Bureau of the Fiscal Service)",
    source_url: SOURCE_LANDING,
    api_endpoints: [
      `${API}/search/spending_by_geography/`,
      `${API}/search/spending_by_category/cfda/`,
    ],
    fiscal_year: fy,
    geography_basis: "recipient_location",
    geography_caveat:
      "Awards are attributed to the recipient's location. Statewide programs paid to a state agency are counted in the county where that agency is located (Medicaid and SNAP concentrate in Ingham County), so a county figure is not federal spending on that county's residents.",
    program_bucket_basis: "CFDA assistance listing numbers",
    program_bucket_caveat:
      "Program buckets aggregate CFDA-numbered assistance only. Contract obligations without a CFDA number are inside the county total but in no bucket, so buckets do not sum to the total.",
    ingested_at: ingestedAt,
    ingest_script: "scripts/refresh-usaspending-county.mjs",
    michigan_county_registry: "src/data/census-geographies.ts",
    michigan_county_registry_size: 83,
    value_label: populated ? "VERIFIED" : "PENDING",
    populated,
    pending_reason: pendingReason,
    notes:
      "Replaces the previous hand-seeded 20-county federal spending table. Missing figures are null, never 0.",
  };
}

function stubCounty(name, fips, reason) {
  return {
    county: name,
    fips,
    status: "pending-ci",
    total_awards_millions: null,
    population: null,
    per_capita_dollars: null,
    ...Object.fromEntries(BUCKET_FIELDS.map((f) => [f, null])),
    cfda_covered_millions: null,
    top_programs: [],
    fy: null,
    source: "USASpending.gov (pending first successful pull)",
    pending_reason: reason,
  };
}

function buildTsShim(populated) {
  return `/**
 * Typed accessor for county-level federal award obligations.
 * Payload in usaspending-county.generated.json; regenerated by
 * scripts/refresh-usaspending-county.mjs. Do not hand-edit.
 *
 * Figures are USASpending.gov transaction obligations attributed to the
 * RECIPIENT's location, so statewide programs paid to a state agency sit in
 * that agency's county. Program buckets cover CFDA assistance listings only
 * and therefore do not sum to the county total. Both caveats are carried in
 * FEDERAL_SPENDING_PROVENANCE and must be surfaced wherever these figures
 * are rendered.
 */
import raw from "./usaspending-county.generated.json";

export interface FederalProgramShare {
  cfda: string;
  name: string;
  dollars: number;
}

export interface CountyFederalSpending {
  county: string;
  fips: string;
  status: "populated" | "pending-ci";
  /** Total federal obligations, in millions of dollars, or null when pending. */
  total_awards_millions: number | null;
  population: number | null;
  per_capita_dollars: number | null;
  medicaid_millions: number | null;
  snap_millions: number | null;
  housing_millions: number | null
  ;
  infrastructure_millions: number | null;
  health_grants_millions: number | null;
  education_millions: number | null;
  energy_millions: number | null;
  /** Sum of the CFDA-numbered dollars that landed in a bucket, in millions. */
  cfda_covered_millions: number | null;
  top_programs: FederalProgramShare[];
  fy: number | null;
  source: string;
  pending_reason?: string | null;
}

export interface FederalSpendingProvenance {
  source_name: string;
  source_url: string;
  api_endpoints: string[];
  fiscal_year: number | null;
  geography_basis: string;
  geography_caveat: string;
  program_bucket_basis: string;
  program_bucket_caveat: string;
  ingested_at: string;
  ingest_script: string;
  michigan_county_registry: string;
  michigan_county_registry_size: number;
  value_label: "VERIFIED" | "PENDING";
  populated: boolean;
  pending_reason: string | null;
  notes: string;
}

interface Payload {
  provenance: FederalSpendingProvenance;
  buckets: Array<{ field: string; label: string }>;
  counties: CountyFederalSpending[];
}

const payload = raw as unknown as Payload;

export const FEDERAL_SPENDING_PROVENANCE: FederalSpendingProvenance = payload.provenance;
export const FEDERAL_SPENDING_BUCKETS = payload.buckets;
export const FEDERAL_SPENDING_IS_POPULATED = ${populated};

/**
 * A county whose figures came back from USASpending. Every numeric field is a
 * real published number here (0 is a real 0), which is why the pending rows
 * are filtered out rather than defaulted.
 */
export type PopulatedCountyFederalSpending = Omit<
  CountyFederalSpending,
  | "total_awards_millions"
  | "medicaid_millions"
  | "snap_millions"
  | "housing_millions"
  | "infrastructure_millions"
  | "health_grants_millions"
  | "education_millions"
  | "energy_millions"
  | "cfda_covered_millions"
  | "fy"
> & {
  total_awards_millions: number;
  medicaid_millions: number;
  snap_millions: number;
  housing_millions: number;
  infrastructure_millions: number;
  health_grants_millions: number;
  education_millions: number;
  energy_millions: number;
  cfda_covered_millions: number;
  fy: number;
};

function isPopulated(c: CountyFederalSpending): c is PopulatedCountyFederalSpending {
  return (
    c.status === "populated" &&
    c.total_awards_millions !== null &&
    c.medicaid_millions !== null &&
    c.snap_millions !== null &&
    c.housing_millions !== null &&
    c.infrastructure_millions !== null &&
    c.health_grants_millions !== null &&
    c.education_millions !== null &&
    c.energy_millions !== null &&
    c.cfda_covered_millions !== null &&
    c.fy !== null
  );
}

/** Every Michigan county with a published total, newest complete fiscal year. */
export const MICHIGAN_FEDERAL_SPENDING: PopulatedCountyFederalSpending[] =
  payload.counties.filter(isPopulated);

/** All 83 records including pending ones, for provenance and audit views. */
export const FEDERAL_SPENDING_ALL_COUNTIES: readonly CountyFederalSpending[] = payload.counties;

export function getCountyFederalSpending(county: string): CountyFederalSpending | null {
  const key = county.replace(/\\s+County$/i, "").trim().toLowerCase();
  return payload.counties.find((c) => c.county.toLowerCase() === key) ?? null;
}

/**
 * Share of a county's federal obligations that arrives as safety-net
 * assistance (Medicaid, food, housing, energy), 0-100, or null when the
 * inputs are missing. This is a ratio of published figures, not a model of
 * county revenue: the previous "federal dependency" score was an unsourced
 * illustrative table and has been removed.
 */
export function getSafetyNetShare(county: string): number | null {
  const rec = getCountyFederalSpending(county);
  if (!rec || !isPopulated(rec) || rec.total_awards_millions === 0) return null;
  const sum =
    rec.medicaid_millions + rec.snap_millions + rec.housing_millions + rec.energy_millions;
  return Math.round((sum / rec.total_awards_millions) * 1000) / 10;
}

/**
 * Superseded name for the safety-net share. The old federal "dependency"
 * score was an unsourced illustrative table; this returns a ratio of
 * published obligations instead, or null when unknown.
 */
export function getFederalDependencyScore(county: string): number | null {
  return getSafetyNetShare(county);
}

/** Back-compat alias for the safety-net share. Returns null when unknown. */
export function n(county: string): number | null {
  return getSafetyNetShare(county);
}


`;
}

async function main() {
  const miFips = await loadMiCountyFips();
  const fipsList = [...miFips.values()];
  console.log(`[refresh-usaspending-county] MI counties in registry: ${miFips.size}`);

  let counties = null;
  let populated = false;
  let fy = null;
  let pendingReason = null;

  const errors = [];
  for (const candidate of fiscalYearCandidates()) {
    try {
      const totals = await fetchCountyTotals(fipsList, candidate);
      const rows = [];
      for (const [name, fips] of miFips) {
        const t = totals.get(fips) ?? null;
        if (!t || t.totalDollars === null) {
          rows.push(stubCounty(name, fips, `USASpending returned no FY${candidate} total for this county.`));
          continue;
        }
        const programs = await fetchCountyPrograms(fips, candidate);
        rows.push({
          county: name,
          fips,
          status: "populated",
          total_awards_millions: toMillions(t.totalDollars),
          population: t.population,
          per_capita_dollars: t.perCapita,
          ...programs.buckets,
          cfda_covered_millions: toMillions(programs.cfdaCoveredDollars),
          top_programs: programs.topPrograms,
          fy: candidate,
          source: `USASpending.gov FY${candidate}`,
          pending_reason: null,
        });
      }
      const populatedCount = rows.filter((r) => r.status === "populated").length;
      if (populatedCount < 60) throw new Error(`Only ${populatedCount} of 83 counties returned FY${candidate} totals.`);
      counties = rows;
      populated = true;
      fy = candidate;
      console.log(`[refresh-usaspending-county] FY${candidate}: ${populatedCount} of 83 counties populated.`);
      break;
    } catch (err) {
      errors.push(`FY${candidate}: ${err.message}`);
      console.warn(`[refresh-usaspending-county] FY${candidate} failed: ${err.message}`);
    }
  }

  if (!populated) {
    const detail = errors.join(" | ");
    if (REQUIRE_LIVE) throw new Error(`No USASpending fiscal year could be fetched. ${detail}`);
    pendingReason = `Could not fetch USASpending county data (${detail}). Re-run scripts/refresh-usaspending-county.mjs --apply on the scheduled dataset-refresh workflow.`;
    counties = [...miFips].map(([name, fips]) => stubCounty(name, fips, pendingReason));
  }

  if (counties.length !== 83) throw new Error(`Sanity: county count ${counties.length} != 83.`);

  const payload = {
    provenance: buildProvenance({ ingestedAt: new Date().toISOString(), populated, fy, pendingReason }),
    buckets: BUCKETS.map((b) => ({ field: b.field, label: b.label })),
    counties,
  };

  if (!APPLY) {
    console.log(`\n[refresh-usaspending-county] dry-run (populated=${populated}). Re-run with --apply to write.`);
    return;
  }
  await writeFile(outJsonPath, JSON.stringify(payload, null, 2) + "\n", "utf8");
  await writeFile(outTsPath, buildTsShim(populated ? "true" : "false"), "utf8");
  console.log(`\n[refresh-usaspending-county] wrote ${path.relative(projectRoot, outJsonPath)} and ${path.relative(projectRoot, outTsPath)}.`);
  if (manifestEntries.length > 0) {
    const manifestPath = await writeManifest({ projectRoot, buildId: BUILD_ID, entries: manifestEntries });
    console.log(`  archival manifest: ${path.relative(projectRoot, manifestPath)}`);
  }
}

main().catch(async (err) => {
  console.error("[refresh-usaspending-county] failed:", err);
  if (manifestEntries.length > 0) {
    try {
      await writeManifest({ projectRoot, buildId: BUILD_ID, entries: manifestEntries });
    } catch (manifestErr) {
      console.error("[refresh-usaspending-county] also failed to write archival manifest:", manifestErr.message);
    }
  }
  process.exit(1);
});
