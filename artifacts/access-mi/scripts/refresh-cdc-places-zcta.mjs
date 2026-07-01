#!/usr/bin/env node
/**
 * Refresh `src/data/cdc-places-zcta.generated.json` (data) and
 * `src/data/cdc-places-zcta.ts` (typed shim) from the CDC PLACES ZCTA
 * release.
 *
 * Extracts 17 model-based adult-prevalence measures for the 992 Michigan
 * ZCTAs in src/data/mi-zctas.ts. Every value is MODELED (small-area
 * BRFSS-based estimates), carries the 95% confidence interval as a
 * "low_high" pair, and rounds to one decimal place (the source's own
 * precision). Missing values in the source render as null (suppressed);
 * ZCTAs missing entirely from the source (small denominator) are recorded
 * with all measures null.
 *
 * Source: CDC, PLACES: ZCTA Data (GIS Friendly Format), 2025 release
 *   https://data.cdc.gov/500-Cities-Places/PLACES-ZCTA-Data-GIS-Friendly-Format-2025-release/kee5-23sr
 *   Socrata JSON endpoint: https://data.cdc.gov/resource/kee5-23sr.json
 * Vintage: 2025 PLACES release. Underlying BRFSS data years and the exact
 *   modeling vintage are read from the source's own metadata and echoed
 *   verbatim in the generated file's provenance block. This label is
 *   NEVER hardcoded here.
 *
 * Run with --apply to write both files; without --apply the script prints
 * a summary + first 3 ZCTA rows and exits.
 */
import { writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..");
const registryPath = path.join(projectRoot, "src/data/mi-zctas.ts");
const outJsonPath = path.join(
  projectRoot,
  "src/data/cdc-places-zcta.generated.json",
);
const outTsPath = path.join(projectRoot, "src/data/cdc-places-zcta.ts");

const APPLY = process.argv.includes("--apply");

const SOCRATA_METADATA_URL = "https://data.cdc.gov/api/views/kee5-23sr.json";
const SOCRATA_ROWS_URL = "https://data.cdc.gov/resource/kee5-23sr.json";
const SOURCE_LANDING =
  "https://data.cdc.gov/500-Cities-Places/PLACES-ZCTA-Data-GIS-Friendly-Format-2025-release/kee5-23sr";

/**
 * Measure catalog. Each entry: PLACES field prefix -> the platform's
 * stable id, label, and category. The 17 measures are the exact set
 * agreed in the PR discovery (chronic outcomes + behavioral risk +
 * preventive services + mental/general status; flu vaccine substituted
 * with cholesterol screening because PLACES does not publish fluvax at
 * ZCTA).
 */
const MEASURES = [
  { field: "diabetes",     id: "diabetes",           category: "chronic",     label: "Diagnosed diabetes among adults 18+" },
  { field: "obesity",      id: "obesity",            category: "chronic",     label: "Obesity among adults 18+ (BMI >= 30)" },
  { field: "bphigh",       id: "highBloodPressure",  category: "chronic",     label: "High blood pressure among adults 18+" },
  { field: "copd",         id: "copd",               category: "chronic",     label: "COPD among adults 18+" },
  { field: "chd",          id: "coronaryHeartDisease", category: "chronic",   label: "Coronary heart disease among adults 18+" },

  { field: "csmoking",     id: "currentSmoking",     category: "behavioral",  label: "Current cigarette smoking among adults 18+" },
  { field: "binge",        id: "bingeDrinking",      category: "behavioral",  label: "Binge drinking among adults 18+" },
  { field: "lpa",          id: "noLeisurePA",        category: "behavioral",  label: "No leisure-time physical activity among adults 18+" },
  { field: "sleep",        id: "shortSleep",         category: "behavioral",  label: "Short sleep (<7 hours) among adults 18+" },

  { field: "checkup",      id: "routineCheckup",     category: "preventive",  label: "Routine checkup in past year, adults 18+" },
  { field: "dental",       id: "dentalVisit",        category: "preventive",  label: "Dental visit in past year, adults 18+" },
  { field: "mammouse",     id: "mammogram",          category: "preventive",  label: "Mammography in past 2 years, women 50-74" },
  { field: "colon_screen", id: "colonScreening",     category: "preventive",  label: "Colorectal cancer screening, adults 50-75" },
  { field: "cholscreen",   id: "cholesterolScreen",  category: "preventive",  label: "Cholesterol screening in past 5 years, adults 18+" },

  { field: "mhlth",        id: "mentalHealthNotGood", category: "status",     label: "Mental health not good >=14 days, adults 18+" },
  { field: "phlth",        id: "physicalHealthNotGood", category: "status",   label: "Physical health not good >=14 days, adults 18+" },
  { field: "ghlth",        id: "generalHealthFairPoor", category: "status",   label: "General health fair or poor, adults 18+" },
];

async function loadMiZctaSet() {
  const src = await readFile(registryPath, "utf8");
  const keys = new Set();
  for (const m of src.matchAll(/^\s*"(\d{5})":\s*\{/gm)) {
    keys.add(m[1]);
  }
  if (keys.size === 0) {
    throw new Error(
      "No ZCTAs parsed from mi-zctas.ts; run refresh-mi-zcta-registry.mjs first",
    );
  }
  return keys;
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
 * Page through the Socrata resource using $limit + $offset until all
 * matching rows are returned. Filter to MI ZCTAs via a `zcta5 in (...)`
 * clause; batch the ZCTA list so the URL doesn't grow beyond the SoQL
 * limit (Socrata rejects overly long WHERE clauses).
 */
async function fetchMiRows(miZctaSet) {
  const codes = [...miZctaSet];
  const CHUNK = 200;
  const results = new Map();
  for (let i = 0; i < codes.length; i += CHUNK) {
    const chunk = codes.slice(i, i + CHUNK);
    const inClause = chunk.map((c) => `'${c}'`).join(",");
    const select = [
      "zcta5",
      "totalpopulation",
      ...MEASURES.flatMap((m) => [
        `${m.field}_crudeprev`,
        `${m.field}_crude95ci`,
      ]),
    ].join(",");
    const url =
      `${SOCRATA_ROWS_URL}?$select=${encodeURIComponent(select)}` +
      `&$where=${encodeURIComponent(`zcta5 in(${inClause})`)}` +
      `&$limit=${CHUNK * 2}`;
    const rows = await fetchJson(url);
    for (const r of rows) {
      results.set(r.zcta5, r);
    }
  }
  return results;
}

function parseCiInterval(text) {
  if (!text) return null;
  const m = /^\s*\(?\s*([\d.]+)\s*[,-]\s*([\d.]+)\s*\)?\s*$/.exec(text);
  if (!m) return null;
  const low = Number(m[1]);
  const high = Number(m[2]);
  if (!Number.isFinite(low) || !Number.isFinite(high)) return null;
  return { low, high };
}

function extractZctaRow(zcta, sourceRow) {
  const measures = {};
  for (const m of MEASURES) {
    if (!sourceRow) {
      measures[m.id] = { crudePrevalence: null, ci95: null };
      continue;
    }
    const rawPrev = sourceRow[`${m.field}_crudeprev`];
    const rawCi = sourceRow[`${m.field}_crude95ci`];
    const prev = rawPrev === undefined || rawPrev === null || rawPrev === ""
      ? null
      : Number(rawPrev);
    measures[m.id] = {
      crudePrevalence: Number.isFinite(prev) ? Math.round(prev * 10) / 10 : null,
      ci95: parseCiInterval(rawCi),
    };
  }
  const rawPop = sourceRow?.totalpopulation;
  const totalPopulation =
    rawPop === undefined || rawPop === null || rawPop === ""
      ? null
      : Number(rawPop);
  return {
    zcta5: zcta,
    totalPopulation: Number.isFinite(totalPopulation) ? totalPopulation : null,
    measures,
  };
}

function buildJsonPayload(meta, ingestedAt, rows, suppressedZctas) {
  return {
    provenance: {
      source_name: "CDC PLACES: ZCTA Data (GIS Friendly Format), 2025 release",
      dataset_id: "kee5-23sr",
      source_url: SOURCE_LANDING,
      socrata_metadata_url: SOCRATA_METADATA_URL,
      socrata_rows_updated_at: meta.rowsUpdatedAt,
      release_label: meta.name,
      release_description: meta.description.slice(0, 600),
      ingested_at: ingestedAt,
      ingest_script: "scripts/refresh-cdc-places-zcta.mjs",
      michigan_zcta_registry: "src/data/mi-zctas.ts",
      michigan_zcta_registry_size: rows.length,
      michigan_zctas_suppressed_by_source: suppressedZctas,
      measure_count: MEASURES.length,
      value_units: "crude prevalence, percent (0-100)",
      value_label: "MODELED",
      weighting: "individual estimates; no post-hoc weighting applied here",
      notes:
        "PLACES publishes model-based adult prevalence estimates. Values are unadjusted (crude). CI is the source's own 95% credible interval, low_high. Prevalences are rounded to one decimal place, matching the source's precision. ZCTAs absent from the source are almost always small-population suppressions.",
    },
    measures: MEASURES.map((m) => ({
      id: m.id,
      category: m.category,
      label: m.label,
      places_field: `${m.field}_CrudePrev`,
      value_label: "MODELED",
    })),
    zctas: rows,
  };
}

function buildTsShim() {
  return `/**
 * Typed accessor for the CDC PLACES ZCTA generated data. The JSON payload
 * lives in cdc-places-zcta.generated.json so the fixture is diffable and
 * the vintage metadata can be read at build time without touching this
 * shim.
 */
import raw from "./cdc-places-zcta.generated.json";

/**
 * One published measure at one ZCTA. \`crudePrevalence\` is percent (0-100),
 * one decimal place; \`ci95\` is the source's 95% credible interval, or
 * null if PLACES suppressed the cell.
 */
export interface CdcPlacesMeasureValue {
  crudePrevalence: number | null;
  ci95: { low: number; high: number } | null;
}

/** All 17 measures for one ZCTA, keyed by the platform's stable measure id. */
export type CdcPlacesZctaMeasures = Record<string, CdcPlacesMeasureValue>;

/** One MI ZCTA's PLACES snapshot: 18+ population and 17 measures. */
export interface CdcPlacesZctaRecord {
  zcta5: string;
  totalPopulation: number | null;
  measures: CdcPlacesZctaMeasures;
}

/** Provenance block regenerated on every refresh. */
export interface CdcPlacesProvenance {
  source_name: string;
  dataset_id: string;
  source_url: string;
  socrata_metadata_url: string;
  socrata_rows_updated_at: string;
  release_label: string;
  release_description: string;
  ingested_at: string;
  ingest_script: string;
  michigan_zcta_registry: string;
  michigan_zcta_registry_size: number;
  michigan_zctas_suppressed_by_source: number;
  measure_count: number;
  value_units: string;
  value_label: "MODELED";
  weighting: string;
  notes: string;
}

/** Static description of one measure (stable id, category, PLACES field). */
export interface CdcPlacesMeasureDef {
  id: string;
  category: "chronic" | "behavioral" | "preventive" | "status";
  label: string;
  places_field: string;
  value_label: "MODELED";
}

interface Payload {
  provenance: CdcPlacesProvenance;
  measures: CdcPlacesMeasureDef[];
  zctas: CdcPlacesZctaRecord[];
}

const payload = raw as Payload;

export const CDC_PLACES_ZCTA_PROVENANCE: CdcPlacesProvenance =
  payload.provenance;
export const CDC_PLACES_MEASURES: readonly CdcPlacesMeasureDef[] =
  payload.measures;
export const CDC_PLACES_ZCTA_RECORDS: readonly CdcPlacesZctaRecord[] =
  payload.zctas;

const BY_ZCTA = new Map<string, CdcPlacesZctaRecord>(
  payload.zctas.map((r) => [r.zcta5, r]),
);

/** Look up one MI ZCTA's PLACES record, or null if not published. */
export function getPlacesForZcta(zcta5: string): CdcPlacesZctaRecord | null {
  return BY_ZCTA.get(zcta5) ?? null;
}

/** Look up one measure at one ZCTA, or null if the ZCTA has no record. */
export function getPlacesMeasure(
  zcta5: string,
  measureId: string,
): CdcPlacesMeasureValue | null {
  const record = BY_ZCTA.get(zcta5);
  if (!record) return null;
  return record.measures[measureId] ?? null;
}
`;
}

async function main() {
  const miZctas = await loadMiZctaSet();
  console.log(`[refresh-cdc-places-zcta] MI ZCTAs in registry: ${miZctas.size}`);
  console.log(`[refresh-cdc-places-zcta] fetching source metadata...`);
  const meta = await fetchMetadata();
  console.log(
    `[refresh-cdc-places-zcta] release: ${meta.name} (${meta.columnCount} columns, rowsUpdated ${meta.rowsUpdatedAt})`,
  );

  console.log(`[refresh-cdc-places-zcta] paging Socrata rows...`);
  const sourceRows = await fetchMiRows(miZctas);
  console.log(
    `[refresh-cdc-places-zcta] source rows for MI ZCTAs: ${sourceRows.size}`,
  );

  let suppressedZctas = 0;
  const rows = [];
  for (const zcta of [...miZctas].sort()) {
    const raw = sourceRows.get(zcta);
    if (!raw) suppressedZctas++;
    rows.push(extractZctaRow(zcta, raw ?? null));
  }
  console.log(
    `[refresh-cdc-places-zcta] MI ZCTAs suppressed by source: ${suppressedZctas}`,
  );

  console.log("[refresh-cdc-places-zcta] first 3 ZCTA snapshots:");
  for (const r of rows.slice(0, 3)) {
    const dbp = r.measures.diabetes?.crudePrevalence;
    const obp = r.measures.obesity?.crudePrevalence;
    const smk = r.measures.currentSmoking?.crudePrevalence;
    console.log(
      `  ${r.zcta5}  pop18+=${r.totalPopulation}  diabetes=${dbp}%  obesity=${obp}%  smoke=${smk}%`,
    );
  }

  // --- Sanity gates. Fail loud rather than write silent garbage. Bands
  //     chosen from the current MI baseline (992 registry / 983 published /
  //     9 suppressed; diabetes non-null on every published row) with
  //     generous headroom for legitimate year-over-year drift.

  // Gate 1: ZCTA count band. The registry is static (Census 2020) until
  // 2030, so a 900-1100 band is very generous. Anything outside is either
  // a registry-load failure or a schema break.
  if (rows.length < 900 || rows.length > 1100) {
    throw new Error(
      `Sanity: ingested row count ${rows.length} is outside the expected 900-1100 band. Registry drift or load failure suspected.`,
    );
  }

  // Gate 2: source-side suppression fraction. PLACES has suppressed ~1% of
  // MI ZCTAs historically (tiny UP + island denominators). If more than 20%
  // come back with no source row, the Socrata query returned garbage or
  // was rate-limited into partial pages.
  const publishedFraction = 1 - suppressedZctas / rows.length;
  if (publishedFraction < 0.8) {
    throw new Error(
      `Sanity: only ${(publishedFraction * 100).toFixed(1)}% of MI ZCTAs got source data (expected >= 80%). Likely a paging failure or Socrata rate limit; retry.`,
    );
  }

  // Gate 3: schema-drift bellwether. Diabetes prevalence is a universal
  // adult measure - if PLACES renamed the field or the parser broke, this
  // count collapses. Assert that at least 90% of the published rows have
  // a non-null diabetes value.
  const publishedRows = rows.filter((_, i) => sourceRows.has(rows[i].zcta5));
  const diabetesPresent = publishedRows.filter(
    (r) => r.measures.diabetes.crudePrevalence !== null,
  ).length;
  if (
    publishedRows.length === 0 ||
    diabetesPresent / publishedRows.length < 0.9
  ) {
    throw new Error(
      `Sanity: only ${diabetesPresent}/${publishedRows.length} published rows carry a non-null diabetes value. PLACES may have renamed the field or the parser broke.`,
    );
  }

  // Gate 4: value-range sanity. Every non-null crude prevalence must lie
  // in [0, 100] (the source publishes percent). A value outside that band
  // means the parser or the source moved.
  for (const r of rows) {
    for (const id in r.measures) {
      const v = r.measures[id].crudePrevalence;
      if (v === null) continue;
      if (!Number.isFinite(v) || v < 0 || v > 100) {
        throw new Error(
          `Sanity: crudePrevalence ${v} for ${id} at ${r.zcta5} is outside [0, 100].`,
        );
      }
    }
  }

  console.log(
    `[refresh-cdc-places-zcta] sanity gates passed (${diabetesPresent}/${publishedRows.length} rows with diabetes; ${(publishedFraction * 100).toFixed(1)}% published overall).`,
  );

  const ingestedAt = new Date().toISOString();
  const payload = buildJsonPayload(meta, ingestedAt, rows, suppressedZctas);
  const shim = buildTsShim();

  if (!APPLY) {
    console.log(
      `\n[refresh-cdc-places-zcta] dry-run. Re-run with --apply to write ${path.relative(projectRoot, outJsonPath)} + ${path.relative(projectRoot, outTsPath)}.`,
    );
    return;
  }
  await writeFile(outJsonPath, JSON.stringify(payload, null, 2), "utf8");
  await writeFile(outTsPath, shim, "utf8");
  console.log(
    `\n[refresh-cdc-places-zcta] wrote ${path.relative(projectRoot, outJsonPath)} (${rows.length} ZCTAs, ${MEASURES.length} measures) and ${path.relative(projectRoot, outTsPath)}.`,
  );
}

main().catch((err) => {
  console.error("[refresh-cdc-places-zcta] failed:", err);
  process.exit(1);
});
