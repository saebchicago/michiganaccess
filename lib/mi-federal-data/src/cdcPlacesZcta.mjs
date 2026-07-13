/**
 * Shared CDC PLACES ZCTA fetch/parse logic for Michigan.
 *
 * Consumed by both accessmi.org (artifacts/access-mi/scripts/refresh-cdc-places-zcta.mjs)
 * and ourintel.org (scripts/ingest/cdc-places-zcta.js, Michigan-only path), so
 * the two projects share one canonical fetch, one canonical measure catalog,
 * and one canonical set of sanity gates instead of independently
 * re-deriving (and drifting on) the same federal source.
 *
 * This module is pure I/O-in/data-out: it does not write files, does not
 * know about either app's manifest/archival conventions, and does not know
 * about either app's on-disk output shape. Each consumer wraps these
 * functions with its own persistence and its own output adapter.
 *
 * Source: CDC, PLACES: ZCTA Data (GIS Friendly Format), 2025 release.
 * https://data.cdc.gov/500-Cities-Places/PLACES-ZCTA-Data-GIS-Friendly-Format-2025-release/kee5-23sr
 * Confirmed live against this exact resource id (kee5-23sr) independently by
 * both projects: accessmi.org's refresh-cdc-places-zcta.mjs (pre-existing),
 * and ourintel's --discover run against chronicdata.cdc.gov (2026-07-12,
 * PR #119) -- chronicdata.cdc.gov and data.cdc.gov are mirrors of the same
 * underlying Socrata resource.
 */

export const DATASET_ID = "kee5-23sr";
export const SOCRATA_METADATA_URL = `https://data.cdc.gov/api/views/${DATASET_ID}.json`;
export const SOCRATA_ROWS_URL = `https://data.cdc.gov/resource/${DATASET_ID}.json`;
export const SOURCE_LANDING = `https://data.cdc.gov/500-Cities-Places/PLACES-ZCTA-Data-GIS-Friendly-Format-2025-release/${DATASET_ID}`;

/**
 * Measure catalog: 40 measures. The first 17 are accessmi.org's original,
 * already-proven curated set (chronic outcomes + behavioral risk +
 * preventive services + mental/general status). The remaining 23 extend
 * that set with ourintel's disability and SDOH-module measures (food
 * insecurity, housing insecurity, utility shutoffs, transportation
 * lacking, social isolation) plus a handful of additional chronic/
 * preventive/status measures ourintel had and accessmi.org did not.
 *
 * `field` is the CDC PLACES column prefix (lowercase; the live resource's
 * columns are `{field}_crudeprev` / `{field}_crude95ci`). `id` is this
 * catalog's stable semantic id (camelCase, matching accessmi.org's existing
 * convention for its original 17). `category` groups measures for display.
 *
 * @typedef {"chronic"|"behavioral"|"preventive"|"status"|"access"|"disability"|"sdoh"} MeasureCategory
 * @typedef {{ field: string, id: string, category: MeasureCategory, label: string }} MeasureDef
 */

/** @type {MeasureDef[]} */
export const MEASURES = [
  // accessmi.org's original 17 (verbatim ids/categories/labels, unchanged).
  { field: "diabetes", id: "diabetes", category: "chronic", label: "Diagnosed diabetes among adults 18+" },
  { field: "obesity", id: "obesity", category: "chronic", label: "Obesity among adults 18+ (BMI >= 30)" },
  { field: "bphigh", id: "highBloodPressure", category: "chronic", label: "High blood pressure among adults 18+" },
  { field: "copd", id: "copd", category: "chronic", label: "COPD among adults 18+" },
  { field: "chd", id: "coronaryHeartDisease", category: "chronic", label: "Coronary heart disease among adults 18+" },
  { field: "csmoking", id: "currentSmoking", category: "behavioral", label: "Current cigarette smoking among adults 18+" },
  { field: "binge", id: "bingeDrinking", category: "behavioral", label: "Binge drinking among adults 18+" },
  { field: "lpa", id: "noLeisurePA", category: "behavioral", label: "No leisure-time physical activity among adults 18+" },
  { field: "sleep", id: "shortSleep", category: "behavioral", label: "Short sleep (<7 hours) among adults 18+" },
  { field: "checkup", id: "routineCheckup", category: "preventive", label: "Routine checkup in past year, adults 18+" },
  { field: "dental", id: "dentalVisit", category: "preventive", label: "Dental visit in past year, adults 18+" },
  { field: "mammouse", id: "mammogram", category: "preventive", label: "Mammography in past 2 years, women 50-74" },
  { field: "colon_screen", id: "colonScreening", category: "preventive", label: "Colorectal cancer screening, adults 50-75" },
  { field: "cholscreen", id: "cholesterolScreen", category: "preventive", label: "Cholesterol screening in past 5 years, adults 18+" },
  { field: "mhlth", id: "mentalHealthNotGood", category: "status", label: "Mental health not good >=14 days, adults 18+" },
  { field: "phlth", id: "physicalHealthNotGood", category: "status", label: "Physical health not good >=14 days, adults 18+" },
  { field: "ghlth", id: "generalHealthFairPoor", category: "status", label: "General health fair or poor, adults 18+" },

  // Extended from ourintel's 40-measure set (PR #118/#119).
  { field: "access2", id: "healthcareAccessBarrier", category: "access", label: "Could not see a doctor due to cost in past year, adults 18+" },
  { field: "arthritis", id: "arthritis", category: "chronic", label: "Arthritis among adults 18+" },
  { field: "bpmed", id: "bloodPressureMedication", category: "preventive", label: "Taking blood pressure medication among adults 18+ with hypertension" },
  { field: "cancer", id: "cancer", category: "chronic", label: "Cancer (excluding skin) among adults 18+" },
  { field: "casthma", id: "currentAsthma", category: "chronic", label: "Current asthma among adults 18+" },
  { field: "depression", id: "depression", category: "status", label: "Depression among adults 18+" },
  { field: "highchol", id: "highCholesterol", category: "chronic", label: "High cholesterol among adults 18+ screened in past 5 years" },
  { field: "stroke", id: "stroke", category: "chronic", label: "Stroke among adults 18+" },
  { field: "hearing", id: "hearingDisability", category: "disability", label: "Hearing disability among adults 18+" },
  { field: "vision", id: "visionDisability", category: "disability", label: "Vision disability among adults 18+" },
  { field: "cognition", id: "cognitiveDisability", category: "disability", label: "Cognitive disability among adults 18+" },
  { field: "mobility", id: "mobilityDisability", category: "disability", label: "Mobility disability among adults 18+" },
  { field: "selfcare", id: "selfcareDisability", category: "disability", label: "Self-care disability among adults 18+" },
  { field: "indeplive", id: "independentLivingDisability", category: "disability", label: "Independent living disability among adults 18+" },
  { field: "disability", id: "anyDisability", category: "disability", label: "Any disability among adults 18+" },
  { field: "loneliness", id: "loneliness", category: "sdoh", label: "Feeling socially isolated among adults 18+" },
  { field: "foodstamp", id: "foodStampsReceived", category: "sdoh", label: "Received food stamps in past 12 months among adults 18+" },
  { field: "foodinsecu", id: "foodInsecurity", category: "sdoh", label: "Food insecurity in past 12 months among adults 18+" },
  { field: "housinsecu", id: "housingInsecurity", category: "sdoh", label: "Housing insecurity in past 12 months among adults 18+" },
  { field: "shututility", id: "utilityShutoff", category: "sdoh", label: "Utility services shut off in past 12 months among adults 18+" },
  { field: "lacktrpt", id: "transportationLacking", category: "sdoh", label: "Lack of reliable transportation in past 12 months among adults 18+" },
  { field: "emotionspt", id: "emotionalSupportLacking", category: "sdoh", label: "Lack of social/emotional support among adults 18+" },
  { field: "teethlost", id: "allTeethLost", category: "chronic", label: "All teeth lost among adults 65+" },
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Fetch the dataset's Socrata metadata (release name/description, last
 * rows-updated timestamp). Callers echo this verbatim into their own
 * provenance block rather than hardcoding a release label.
 * @param {{ fetchImpl?: typeof fetch }} [opts]
 */
export async function fetchMetadata(opts = {}) {
  const fetchImpl = opts.fetchImpl ?? fetch;
  const res = await fetchImpl(SOCRATA_METADATA_URL, {
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error(`CDC PLACES metadata fetch failed: HTTP ${res.status}`);
  const meta = await res.json();
  return {
    name: meta.name,
    description: meta.description ?? "",
    rowsUpdatedAt: new Date(Number(meta.rowsUpdatedAt) * 1000).toISOString(),
    columnCount: (meta.columns ?? []).length,
  };
}

/**
 * Page through the Socrata resource for a given ZCTA list, batching so
 * the URL never grows beyond SoQL's practical length limit. Returns
 * Map<zcta5, rawSocrataRow>; ZCTAs absent from the response are simply
 * missing from the map (suppression, not an error).
 * @param {string[]} zctaList
 * @param {{ fetchImpl?: typeof fetch, chunkSize?: number, retryDelaysMs?: number[] }} [opts]
 */
export async function fetchZctaRows(zctaList, opts = {}) {
  const fetchImpl = opts.fetchImpl ?? fetch;
  const chunkSize = opts.chunkSize ?? 200;
  const retryDelaysMs = opts.retryDelaysMs ?? [2000, 5000];

  const select = [
    "zcta5",
    "totalpopulation",
    ...MEASURES.flatMap((m) => [`${m.field}_crudeprev`, `${m.field}_crude95ci`]),
  ].join(",");

  const results = new Map();
  for (let i = 0; i < zctaList.length; i += chunkSize) {
    const chunk = zctaList.slice(i, i + chunkSize);
    const inClause = chunk.map((c) => `'${c}'`).join(",");
    const url =
      `${SOCRATA_ROWS_URL}?$select=${encodeURIComponent(select)}` +
      `&$where=${encodeURIComponent(`zcta5 in(${inClause})`)}` +
      `&$limit=${chunk.length + 10}`;

    let rows = null;
    let lastErr = null;
    for (let attempt = 0; attempt <= retryDelaysMs.length; attempt++) {
      try {
        const res = await fetchImpl(url, { headers: { accept: "application/json" } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        rows = await res.json();
        break;
      } catch (err) {
        lastErr = err;
        if (attempt < retryDelaysMs.length) await sleep(retryDelaysMs[attempt]);
      }
    }
    if (rows === null) throw new Error(`CDC PLACES ZCTA batch fetch failed: ${lastErr?.message}`);
    for (const r of rows) results.set(r.zcta5, r);
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

/**
 * Pure row shaper: one raw Socrata row (or undefined, if the ZCTA is
 * absent from the resource) into { zcta5, totalPopulation, measures }.
 * @param {string} zcta
 * @param {Record<string, string> | undefined} sourceRow
 */
export function extractZctaRow(zcta, sourceRow) {
  const measures = {};
  for (const m of MEASURES) {
    if (!sourceRow) {
      measures[m.id] = { crudePrevalence: null, ci95: null };
      continue;
    }
    const rawPrev = sourceRow[`${m.field}_crudeprev`];
    const rawCi = sourceRow[`${m.field}_crude95ci`];
    const prev = rawPrev === undefined || rawPrev === null || rawPrev === "" ? null : Number(rawPrev);
    measures[m.id] = {
      crudePrevalence: Number.isFinite(prev) ? Math.round(prev * 10) / 10 : null,
      ci95: parseCiInterval(rawCi),
    };
  }
  const rawPop = sourceRow?.totalpopulation;
  const totalPopulation = rawPop === undefined || rawPop === null || rawPop === "" ? null : Number(rawPop);
  return {
    zcta5: zcta,
    totalPopulation: Number.isFinite(totalPopulation) ? totalPopulation : null,
    measures,
  };
}

/**
 * Pure provenance-block builder. `ingestScript`/`registryLabel` are
 * caller-supplied so the block correctly names whichever consumer ran it.
 */
export function buildProvenance({ meta, ingestedAt, rowCount, suppressedCount, ingestScript, registryLabel }) {
  return {
    source_name: "CDC PLACES: ZCTA Data (GIS Friendly Format), 2025 release",
    dataset_id: DATASET_ID,
    source_url: SOURCE_LANDING,
    socrata_metadata_url: SOCRATA_METADATA_URL,
    socrata_rows_updated_at: meta.rowsUpdatedAt,
    release_label: meta.name,
    release_description: meta.description.slice(0, 600),
    ingested_at: ingestedAt,
    ingest_script: ingestScript,
    michigan_zcta_registry: registryLabel,
    michigan_zcta_registry_size: rowCount,
    michigan_zctas_suppressed_by_source: suppressedCount,
    measure_count: MEASURES.length,
    value_units: "crude prevalence, percent (0-100)",
    value_label: "MODELED",
    weighting: "individual estimates; no post-hoc weighting applied here",
    notes:
      "PLACES publishes model-based adult prevalence estimates. Values are unadjusted (crude). CI is the source's own 95% credible interval, low_high. Prevalences are rounded to one decimal place, matching the source's precision. ZCTAs absent from the source are almost always small-population suppressions.",
    shared_package: "mi-federal-data (saebchicago/michiganaccess, lib/mi-federal-data)",
  };
}

/**
 * Sanity gates, generalized from accessmi.org's original 4 (row-count
 * band, source-suppression fraction, diabetes-presence bellwether,
 * value-range check). Same defaults as accessmi.org's proven values.
 * Throws with a descriptive message on the first failed gate; never
 * returns a boolean/silently-passing result.
 *
 * @param {ReturnType<typeof extractZctaRow>[]} rows
 * @param {Map<string, unknown>} sourceRowsMap
 * @param {{ minRows?: number, maxRows?: number, minPublishedFraction?: number, minDiabetesPresence?: number }} [opts]
 */
export function runSanityGates(rows, sourceRowsMap, opts = {}) {
  const minRows = opts.minRows ?? 900;
  const maxRows = opts.maxRows ?? 1100;
  const minPublishedFraction = opts.minPublishedFraction ?? 0.8;
  const minDiabetesPresence = opts.minDiabetesPresence ?? 0.9;

  if (rows.length < minRows || rows.length > maxRows) {
    throw new Error(
      `Sanity: ingested row count ${rows.length} is outside the expected ${minRows}-${maxRows} band. Registry drift or load failure suspected.`,
    );
  }

  const suppressedCount = rows.filter((r) => !sourceRowsMap.has(r.zcta5)).length;
  const publishedFraction = 1 - suppressedCount / rows.length;
  if (publishedFraction < minPublishedFraction) {
    throw new Error(
      `Sanity: only ${(publishedFraction * 100).toFixed(1)}% of ZCTAs got source data (expected >= ${(minPublishedFraction * 100).toFixed(0)}%). Likely a paging failure or Socrata rate limit; retry.`,
    );
  }

  const publishedRows = rows.filter((r) => sourceRowsMap.has(r.zcta5));
  const diabetesPresent = publishedRows.filter((r) => r.measures.diabetes.crudePrevalence !== null).length;
  if (publishedRows.length === 0 || diabetesPresent / publishedRows.length < minDiabetesPresence) {
    throw new Error(
      `Sanity: only ${diabetesPresent}/${publishedRows.length} published rows carry a non-null diabetes value. PLACES may have renamed the field or the parser broke.`,
    );
  }

  for (const r of rows) {
    for (const id in r.measures) {
      const v = r.measures[id].crudePrevalence;
      if (v === null) continue;
      if (!Number.isFinite(v) || v < 0 || v > 100) {
        throw new Error(`Sanity: crudePrevalence ${v} for ${id} at ${r.zcta5} is outside [0, 100].`);
      }
    }
  }

  return { suppressedCount, publishedFraction, diabetesPresent, publishedCount: publishedRows.length };
}
