#!/usr/bin/env node
/**
 * Refresh `src/data/cdc-places-county.generated.json` (data) and
 * `src/data/cdc-places-county.ts` (typed shim) from the CDC PLACES
 * County release.
 *
 * Extracts the same 17 model-based adult-prevalence measures the ZCTA
 * refresh ships for the 83 Michigan counties in src/data/census-geographies.ts.
 * Every value is MODELED (small-area BRFSS-based estimates via CDC's
 * multilevel regression + poststratification (MRP) methodology), carries
 * the 95% confidence interval as a "low_high" pair, and rounds to one
 * decimal place (the source's own precision).
 *
 * Source: CDC, PLACES: Local Data for Better Health, County Data,
 *   2025 release
 *   https://data.cdc.gov/500-Cities-Places/PLACES-Local-Data-for-Better-Health-County-Data-2025-release/swc5-untb
 *   Socrata JSON endpoint: https://data.cdc.gov/resource/swc5-untb.json
 * Schema note: the county release is long format (one row per county x
 *   measure x data_value_type). We filter to `data_value_type='Crude
 *   prevalence'` to match the ZCTA release's precision and to keep a
 *   uniform prevalence definition across the two ingest paths.
 * Vintage: read from the source's own Socrata metadata at ingest time and
 *   echoed verbatim into the generated file's provenance block. Never
 *   hardcoded here.
 *
 * Run with --apply to write both files; without --apply the script prints
 * a summary + first 3 county rows and exits.
 */
import { writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..");
const registryPath = path.join(projectRoot, "src/data/census-geographies.ts");
const outJsonPath = path.join(
  projectRoot,
  "src/data/cdc-places-county.generated.json",
);
const outTsPath = path.join(projectRoot, "src/data/cdc-places-county.ts");

const APPLY = process.argv.includes("--apply");

const SOCRATA_METADATA_URL = "https://data.cdc.gov/api/views/swc5-untb.json";
const SOCRATA_ROWS_URL = "https://data.cdc.gov/resource/swc5-untb.json";
const SOURCE_LANDING =
  "https://data.cdc.gov/500-Cities-Places/PLACES-Local-Data-for-Better-Health-County-Data-2025-release/swc5-untb";

/**
 * Measure catalog. The first 17 measure ids match the ZCTA ingest exactly
 * so a county view and a ZCTA view share the same platform-stable ids and
 * can be joined on either geography. The next 5 (STROKE, ARTHRITIS,
 * DISABILITY, HEARING, SELFCARE) are county-only: PLACES publishes them
 * at county level but not at ZCTA. `measureid` is the county dataset's
 * own identifier (uppercase PLACES short code); `id` is the platform's
 * stable slug.
 */
const MEASURES = [
  { measureid: "DIABETES",     id: "diabetes",            category: "chronic",    label: "Diagnosed diabetes among adults 18+" },
  { measureid: "OBESITY",      id: "obesity",             category: "chronic",    label: "Obesity among adults 18+ (BMI >= 30)" },
  { measureid: "BPHIGH",       id: "highBloodPressure",   category: "chronic",    label: "High blood pressure among adults 18+" },
  { measureid: "COPD",         id: "copd",                category: "chronic",    label: "COPD among adults 18+" },
  { measureid: "CHD",          id: "coronaryHeartDisease", category: "chronic",   label: "Coronary heart disease among adults 18+" },

  { measureid: "CSMOKING",     id: "currentSmoking",      category: "behavioral", label: "Current cigarette smoking among adults 18+" },
  { measureid: "BINGE",        id: "bingeDrinking",       category: "behavioral", label: "Binge drinking among adults 18+" },
  { measureid: "LPA",          id: "noLeisurePA",         category: "behavioral", label: "No leisure-time physical activity among adults 18+" },
  { measureid: "SLEEP",        id: "shortSleep",          category: "behavioral", label: "Short sleep (<7 hours) among adults 18+" },

  { measureid: "CHECKUP",      id: "routineCheckup",      category: "preventive", label: "Routine checkup in past year, adults 18+" },
  { measureid: "DENTAL",       id: "dentalVisit",         category: "preventive", label: "Dental visit in past year, adults 18+" },
  { measureid: "MAMMOUSE",     id: "mammogram",           category: "preventive", label: "Mammography in past 2 years, women 50-74" },
  { measureid: "COLON_SCREEN", id: "colonScreening",      category: "preventive", label: "Colorectal cancer screening, adults 50-75" },
  { measureid: "CHOLSCREEN",   id: "cholesterolScreen",   category: "preventive", label: "Cholesterol screening in past 5 years, adults 18+" },

  { measureid: "MHLTH",        id: "mentalHealthNotGood", category: "status",     label: "Mental health not good >=14 days, adults 18+" },
  { measureid: "PHLTH",        id: "physicalHealthNotGood", category: "status",   label: "Physical health not good >=14 days, adults 18+" },
  { measureid: "GHLTH",        id: "generalHealthFairPoor", category: "status",   label: "General health fair or poor, adults 18+" },

  { measureid: "STROKE",       id: "stroke",              category: "chronic",    label: "Stroke among adults 18+" },
  { measureid: "ARTHRITIS",    id: "arthritis",           category: "chronic",    label: "Arthritis among adults 18+" },
  { measureid: "DISABILITY",   id: "anyDisability",       category: "status",     label: "Any disability among adults 18+" },
  { measureid: "HEARING",      id: "hearingDisability",   category: "status",     label: "Hearing disability among adults 18+" },
  { measureid: "SELFCARE",     id: "selfCareDisability",  category: "status",     label: "Self-care disability among adults 18+" },
];

const MEASURE_BY_ID = new Map(MEASURES.map((m) => [m.measureid, m]));

async function loadMiCountyFips() {
  const src = await readFile(registryPath, "utf8");
  // MI_COUNTY_FIPS is a Record<CountyName, "NNN"> where "NNN" is the
  // 3-digit county code without the "26" state prefix. Parse the block
  // between `MI_COUNTY_FIPS` and its closing brace, then key by 5-digit
  // FIPS (state + county) since data.cdc.gov returns 5-digit locationids.
  const start = src.indexOf("MI_COUNTY_FIPS");
  if (start < 0) {
    throw new Error("MI_COUNTY_FIPS not found in census-geographies.ts");
  }
  const open = src.indexOf("{", start);
  const close = src.indexOf("}", open);
  if (open < 0 || close < 0) {
    throw new Error("MI_COUNTY_FIPS shape unrecognized");
  }
  const body = src.slice(open + 1, close);
  const fips = new Map();
  const re = /(?:"([^"]+)"|(\b[A-Z][\w. ]*))\s*:\s*"(\d{3})"/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    const name = m[1] ?? m[2];
    if (!name) continue;
    fips.set(`26${m[3]}`, name.trim());
  }
  if (fips.size === 0) {
    throw new Error(
      "No MI county FIPS parsed from census-geographies.ts; check MI_COUNTY_FIPS shape.",
    );
  }
  return fips;
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { "user-agent": "accessmi-data-refresh", accept: "application/json" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  return await res.json();
}

async function fetchMetadata() {
  const meta = await fetchJson(SOCRATA_METADATA_URL);
  const rowsUpdatedAtIso = new Date(
    Number(meta.rowsUpdatedAt) * 1000,
  ).toISOString();
  return {
    name: meta.name,
    description: meta.description ?? "",
    rowsUpdatedAt: rowsUpdatedAtIso,
    columnCount: (meta.columns ?? []).length,
  };
}

/**
 * Fetch all MI rows for the measures we care about. Long format means one
 * row per (county x measure x data_value_type); we request Crude
 * prevalence rows only, then group by county in-memory. `$limit` is
 * generous because 83 counties * ~40 published measures per county <
 * 4000 rows total for MI-only.
 */
async function fetchMiRows() {
  const measureList = MEASURES.map((m) => `'${m.measureid}'`).join(",");
  const select = [
    "locationid",
    "locationname",
    "measureid",
    "data_value_type",
    "data_value",
    "low_confidence_limit",
    "high_confidence_limit",
    "totalpop18plus",
    "year",
  ].join(",");
  const where = `stateabbr='MI' AND data_value_type='Crude prevalence' AND measureid in(${measureList})`;
  const url =
    `${SOCRATA_ROWS_URL}?$select=${encodeURIComponent(select)}` +
    `&$where=${encodeURIComponent(where)}` +
    `&$limit=5000`;
  return await fetchJson(url);
}

function toNumber(x) {
  if (x === undefined || x === null || x === "") return null;
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}

function extractCountyRecord(fips, countyName, sourceRows) {
  const measures = {};
  let totalPop18Plus = null;
  let year = null;
  for (const m of MEASURES) {
    const row = sourceRows.find((r) => r.measureid === m.measureid);
    if (!row) {
      measures[m.id] = { crudePrevalence: null, ci95: null };
      continue;
    }
    const prev = toNumber(row.data_value);
    const low = toNumber(row.low_confidence_limit);
    const high = toNumber(row.high_confidence_limit);
    measures[m.id] = {
      crudePrevalence:
        prev === null ? null : Math.round(prev * 10) / 10,
      ci95: low !== null && high !== null ? { low, high } : null,
    };
    if (totalPop18Plus === null) totalPop18Plus = toNumber(row.totalpop18plus);
    if (year === null) year = row.year ?? null;
  }
  return {
    countyFips: fips,
    countyName,
    year,
    totalPop18Plus,
    measures,
  };
}

function buildJsonPayload(meta, ingestedAt, records) {
  return {
    provenance: {
      source_name:
        "CDC PLACES: Local Data for Better Health, County Data, 2025 release",
      dataset_id: "swc5-untb",
      source_url: SOURCE_LANDING,
      socrata_metadata_url: SOCRATA_METADATA_URL,
      socrata_rows_updated_at: meta.rowsUpdatedAt,
      release_label: meta.name,
      release_description: meta.description.slice(0, 600),
      ingested_at: ingestedAt,
      ingest_script: "scripts/refresh-cdc-places-county.mjs",
      michigan_county_registry: "src/data/census-geographies.ts",
      michigan_county_registry_size: records.length,
      measure_count: MEASURES.length,
      value_units: "crude prevalence, percent (0-100)",
      value_label: "MODELED",
      weighting:
        "individual estimates; no post-hoc weighting applied here",
      notes:
        "PLACES publishes model-based adult prevalence estimates using multilevel regression and poststratification (MRP) applied to BRFSS. County-level estimates are unadjusted (crude), rounded to one decimal place. CI is the source's own 95% credible interval, low_high. The county release is long format (one row per county x measure x data_value_type); we filter to Crude prevalence rows to match the ZCTA ingest.",
    },
    measures: MEASURES.map((m) => ({
      id: m.id,
      category: m.category,
      label: m.label,
      places_measureid: m.measureid,
      value_label: "MODELED",
    })),
    counties: records,
  };
}

function buildTsShim() {
  return `/**
 * Typed accessor for the CDC PLACES County generated data. The JSON
 * payload lives in cdc-places-county.generated.json so the fixture is
 * diffable and the vintage metadata can be read at build time without
 * touching this shim.
 *
 * County-level companion to cdc-places-zcta.ts. The 17 measure ids match
 * one-for-one with the ZCTA shim so a county view and a ZCTA view can be
 * built against a single measure catalog.
 */
import raw from "./cdc-places-county.generated.json";

export interface CdcPlacesCountyMeasureValue {
  crudePrevalence: number | null;
  ci95: { low: number; high: number } | null;
}

export type CdcPlacesCountyMeasures = Record<
  string,
  CdcPlacesCountyMeasureValue
>;

export interface CdcPlacesCountyRecord {
  countyFips: string;
  countyName: string;
  year: string | null;
  totalPop18Plus: number | null;
  measures: CdcPlacesCountyMeasures;
}

export interface CdcPlacesCountyProvenance {
  source_name: string;
  dataset_id: string;
  source_url: string;
  socrata_metadata_url: string;
  socrata_rows_updated_at: string;
  release_label: string;
  release_description: string;
  ingested_at: string;
  ingest_script: string;
  michigan_county_registry: string;
  michigan_county_registry_size: number;
  measure_count: number;
  value_units: string;
  value_label: "MODELED";
  weighting: string;
  notes: string;
}

export interface CdcPlacesCountyMeasureDef {
  id: string;
  category: "chronic" | "behavioral" | "preventive" | "status";
  label: string;
  places_measureid: string;
  value_label: "MODELED";
}

interface Payload {
  provenance: CdcPlacesCountyProvenance;
  measures: CdcPlacesCountyMeasureDef[];
  counties: CdcPlacesCountyRecord[];
}

const payload = raw as Payload;

export const CDC_PLACES_COUNTY_PROVENANCE: CdcPlacesCountyProvenance =
  payload.provenance;
export const CDC_PLACES_COUNTY_MEASURES: readonly CdcPlacesCountyMeasureDef[] =
  payload.measures;
export const CDC_PLACES_COUNTY_RECORDS: readonly CdcPlacesCountyRecord[] =
  payload.counties;

const BY_FIPS = new Map<string, CdcPlacesCountyRecord>(
  payload.counties.map((c) => [c.countyFips, c]),
);
const BY_NAME = new Map<string, CdcPlacesCountyRecord>(
  payload.counties.map((c) => [c.countyName, c]),
);

/** Look up one MI county's PLACES record by 5-digit FIPS, or null. */
export function getPlacesForCountyFips(
  fips: string,
): CdcPlacesCountyRecord | null {
  return BY_FIPS.get(fips) ?? null;
}

/** Look up one MI county's PLACES record by canonical name, or null. */
export function getPlacesForCountyName(
  name: string,
): CdcPlacesCountyRecord | null {
  return BY_NAME.get(name) ?? null;
}

/** Look up one measure at one county, or null if the county has no record. */
export function getPlacesCountyMeasure(
  countyFips: string,
  measureId: string,
): CdcPlacesCountyMeasureValue | null {
  const record = BY_FIPS.get(countyFips);
  if (!record) return null;
  return record.measures[measureId] ?? null;
}
`;
}

async function main() {
  const miCountyFips = await loadMiCountyFips();
  console.log(
    `[refresh-cdc-places-county] MI counties in registry: ${miCountyFips.size}`,
  );
  console.log(`[refresh-cdc-places-county] fetching source metadata...`);
  const meta = await fetchMetadata();
  console.log(
    `[refresh-cdc-places-county] release: ${meta.name} (${meta.columnCount} columns, rowsUpdated ${meta.rowsUpdatedAt})`,
  );

  console.log(`[refresh-cdc-places-county] fetching MI rows (Crude only)...`);
  const rawRows = await fetchMiRows();
  console.log(
    `[refresh-cdc-places-county] source rows fetched (MI x ${MEASURES.length} measures, Crude): ${rawRows.length}`,
  );

  // Group by FIPS.
  const byFips = new Map();
  for (const row of rawRows) {
    const fips = row.locationid;
    if (!byFips.has(fips)) byFips.set(fips, []);
    byFips.get(fips).push(row);
  }

  let countiesWithNoRows = 0;
  const records = [];
  for (const [fips, countyName] of [...miCountyFips.entries()].sort()) {
    const rowsForCounty = byFips.get(fips) ?? [];
    if (rowsForCounty.length === 0) countiesWithNoRows++;
    records.push(extractCountyRecord(fips, countyName, rowsForCounty));
  }
  console.log(
    `[refresh-cdc-places-county] MI counties with zero source rows: ${countiesWithNoRows}`,
  );

  console.log("[refresh-cdc-places-county] first 3 county snapshots:");
  for (const r of records.slice(0, 3)) {
    const dbp = r.measures.diabetes?.crudePrevalence;
    const obp = r.measures.obesity?.crudePrevalence;
    const smk = r.measures.currentSmoking?.crudePrevalence;
    console.log(
      `  ${r.countyFips} ${r.countyName}  pop18+=${r.totalPop18Plus}  diabetes=${dbp}%  obesity=${obp}%  smoke=${smk}%`,
    );
  }

  // --- Sanity gates. County-level PLACES is expected to have full 83
  //     coverage (no suppressions the way ZCTA has) so the gates are
  //     tighter than the ZCTA analog.

  // Gate 1: exact county count.
  if (records.length !== 83) {
    throw new Error(
      `Sanity: ingested county count ${records.length} != 83. Registry drift or MI_COUNTY_FIPS load failure suspected.`,
    );
  }

  // Gate 2: no county should be missing from the source. County-level
  // PLACES publishes all US counties in the 2025 release; a zero result
  // means the Socrata query was rate-limited or the schema moved.
  if (countiesWithNoRows > 0) {
    throw new Error(
      `Sanity: ${countiesWithNoRows} MI county(ies) returned zero source rows. Expected all 83 to have measures.`,
    );
  }

  // Gate 3: schema-drift bellwether. Diabetes is a universal measure -
  // every county in a 2025 release must carry a non-null diabetes value.
  const diabetesPresent = records.filter(
    (r) => r.measures.diabetes.crudePrevalence !== null,
  ).length;
  if (diabetesPresent < 83) {
    throw new Error(
      `Sanity: only ${diabetesPresent}/83 counties carry a non-null diabetes value. PLACES may have renamed the field or the parser broke.`,
    );
  }

  // Gate 4: value-range sanity. Every non-null crude prevalence must lie
  // in [0, 100].
  for (const r of records) {
    for (const id in r.measures) {
      const v = r.measures[id].crudePrevalence;
      if (v === null) continue;
      if (!Number.isFinite(v) || v < 0 || v > 100) {
        throw new Error(
          `Sanity: crudePrevalence ${v} for ${id} at ${r.countyName} (${r.countyFips}) is outside [0, 100].`,
        );
      }
    }
  }

  console.log(
    `[refresh-cdc-places-county] sanity gates passed (${diabetesPresent}/83 counties with diabetes; 0 missing counties).`,
  );

  const ingestedAt = new Date().toISOString();
  const payload = buildJsonPayload(meta, ingestedAt, records);
  const shim = buildTsShim();

  if (!APPLY) {
    console.log(
      `\n[refresh-cdc-places-county] dry-run. Re-run with --apply to write ${path.relative(projectRoot, outJsonPath)} + ${path.relative(projectRoot, outTsPath)}.`,
    );
    return;
  }
  await writeFile(outJsonPath, JSON.stringify(payload, null, 2), "utf8");
  await writeFile(outTsPath, shim, "utf8");
  console.log(
    `\n[refresh-cdc-places-county] wrote ${path.relative(projectRoot, outJsonPath)} (${records.length} counties, ${MEASURES.length} measures) and ${path.relative(projectRoot, outTsPath)}.`,
  );
}

main().catch((err) => {
  console.error("[refresh-cdc-places-county] failed:", err);
  process.exit(1);
});
