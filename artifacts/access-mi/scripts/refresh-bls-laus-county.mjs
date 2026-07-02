#!/usr/bin/env node
/**
 * Refresh `src/data/bls-laus-county.generated.json` (data) and
 * `src/data/bls-laus-county.ts` (typed shim) from the BLS Local Area
 * Unemployment Statistics (LAUS) via the BLS Public API v2.
 *
 * Series ID scheme for LAUS county unemployment RATE (measure code 03):
 *   LAUCN + 2-digit state FIPS + 3-digit county FIPS + 0000000003
 * For Michigan Wayne County (26163) that resolves to
 *   LAUCN261630000000003
 *
 * The task calls for BLS LAUS county unemployment. FRED was proposed at
 * PAUSE F3.5 as an access mechanism, but FRED CSV endpoints blocked
 * from this environment and FRED's API requires an api_key. BLS itself
 * publishes a Public API v2 that is keyless (25 queries/day, up to
 * 25 series per query), so we go direct to the publisher and cite BLS
 * as both source and access mechanism.
 *
 * Provenance VERIFIED - the value is a direct BLS tabulation, taken
 * from the BLS series itself, no aggregation applied. The "preliminary
 * or revised" state is read from the source's own footnote codes
 * ("P" = Preliminary, "T" = subject to revision) and echoed per-series
 * into the generated file's provenance block. Never hardcoded.
 *
 * If any batched request fails (rate limit, network), the script falls
 * back to a pending-ci stub for the whole file so nothing ships with
 * partial data. The stub preserves the 83-county partition.
 *
 * Run with --apply to write both files.
 */
import { writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..");
const registryPath = path.join(projectRoot, "src/data/census-geographies.ts");
const outJsonPath = path.join(
  projectRoot,
  "src/data/bls-laus-county.generated.json",
);
const outTsPath = path.join(projectRoot, "src/data/bls-laus-county.ts");

const APPLY = process.argv.includes("--apply");

const BLS_API = "https://api.bls.gov/publicAPI/v2/timeseries/data/";
const BLS_LAUS_LANDING = "https://www.bls.gov/lau/";
const MEASURE_CODE = "03"; // Unemployment rate
const BATCH_SIZE = 25; // BLS keyless max series per query
const YEARS_BACK = 2;

async function loadMiCountyFips() {
  const src = await readFile(registryPath, "utf8");
  const start = src.indexOf("MI_COUNTY_FIPS");
  if (start < 0) throw new Error("MI_COUNTY_FIPS not found");
  const open = src.indexOf("{", start);
  const close = src.indexOf("}", open);
  const body = src.slice(open + 1, close);
  const fips = new Map();
  const re = /(?:"([^"]+)"|(\b[A-Z][\w. ]*))\s*:\s*"(\d{3})"/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    const name = (m[1] ?? m[2]).trim();
    fips.set(`26${m[3]}`, name);
  }
  if (fips.size === 0) throw new Error("No MI county FIPS parsed");
  return fips;
}

function seriesIdForFips(fips) {
  // fips is 5 digits (e.g. "26163"). Full LAUS series ID is 20 chars:
  //   "LAUCN" (5) + state+county FIPS (5) + zero-padded area code (8)
  //   + measure code (2) = LAUCN + 26163 + 00000000 + 03
  return `LAUCN${fips}00000000${MEASURE_CODE}`;
}

async function fetchBatch(seriesIds, startYear, endYear) {
  const res = await fetch(BLS_API, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "user-agent": "accessmi-data-refresh",
    },
    body: JSON.stringify({
      seriesid: seriesIds,
      startyear: String(startYear),
      endyear: String(endYear),
    }),
  });
  if (!res.ok) throw new Error(`BLS HTTP ${res.status}`);
  const body = await res.json();
  if (body.status !== "REQUEST_SUCCEEDED") {
    throw new Error(
      `BLS API status ${body.status}: ${(body.message ?? []).join("; ")}`,
    );
  }
  return body.Results?.series ?? [];
}

function periodToMonthNumber(period) {
  // period like "M05" -> 5
  const m = /^M(\d{2})$/.exec(period);
  return m ? Number(m[1]) : null;
}

function extractLatest(series) {
  if (!series?.data?.length) return null;
  // BLS returns observations newest-first. Pick the first monthly (Mxx)
  // observation. Ignore the M13 annual roll-up (rarely present for LAUS
  // county but be safe).
  for (const d of series.data) {
    const monthNum = periodToMonthNumber(d.period);
    if (!monthNum || monthNum > 12) continue;
    return d;
  }
  return null;
}

function preliminaryFlagFromFootnotes(footnotes) {
  if (!Array.isArray(footnotes)) return false;
  return footnotes.some((f) => f?.code === "P");
}

function revisedTextFromFootnotes(footnotes) {
  if (!Array.isArray(footnotes)) return null;
  const rev = footnotes.find((f) => f?.code === "T");
  return rev?.text ?? null;
}

function buildStub(miFips, reason) {
  return [...miFips.entries()].sort().map(([fips, name]) => ({
    countyFips: fips,
    countyName: name,
    seriesId: seriesIdForFips(fips),
    status: "pending-ci",
    latestPeriod: null,
    latestPeriodMonth: null,
    latestPeriodYear: null,
    unemploymentRate: null,
    preliminary: null,
    revisionNote: null,
    pendingReason: reason,
  }));
}

function buildPopulated(miFips, seriesById) {
  const records = [];
  const missing = [];
  for (const [fips, name] of [...miFips.entries()].sort()) {
    const seriesId = seriesIdForFips(fips);
    const series = seriesById.get(seriesId);
    const latest = extractLatest(series);
    if (!series || !latest) {
      missing.push(`${name} (${fips})`);
      records.push({
        countyFips: fips,
        countyName: name,
        seriesId,
        status: "no-data",
        latestPeriod: null,
        latestPeriodMonth: null,
        latestPeriodYear: null,
        unemploymentRate: null,
        preliminary: null,
        revisionNote: null,
        pendingReason: "BLS returned no monthly observation for this county.",
      });
      continue;
    }
    const val = Number(latest.value);
    records.push({
      countyFips: fips,
      countyName: name,
      seriesId,
      status: "populated",
      latestPeriod: `${latest.periodName} ${latest.year}`,
      latestPeriodMonth: periodToMonthNumber(latest.period),
      latestPeriodYear: Number(latest.year),
      unemploymentRate: Number.isFinite(val) ? val : null,
      preliminary: preliminaryFlagFromFootnotes(latest.footnotes),
      revisionNote: revisedTextFromFootnotes(latest.footnotes),
      pendingReason: null,
    });
  }
  return { records, missing };
}

function buildProvenance(ingestedAt, populated, latestVintage) {
  return {
    source_name:
      "U.S. Bureau of Labor Statistics, Local Area Unemployment Statistics (LAUS)",
    source_url: BLS_LAUS_LANDING,
    access_mechanism: "BLS Public API v2 (api.bls.gov)",
    api_url: BLS_API,
    measure: "Unemployment rate (measure code 03)",
    series_id_pattern:
      "LAUCN + 2-digit state FIPS + 3-digit county FIPS + 00000000 + 03",
    ingested_at: ingestedAt,
    ingest_script: "scripts/refresh-bls-laus-county.mjs",
    michigan_county_registry: "src/data/census-geographies.ts",
    michigan_county_registry_size: 83,
    value_label: "VERIFIED",
    populated,
    latest_vintage: latestVintage,
    preliminary_flag_meaning:
      "BLS marks the newest monthly release Preliminary (footnote code 'P') and subsequent releases revise it. The 'preliminary' boolean per record reflects the newest month's own P flag verbatim.",
    notes:
      "Each county carries its newest available monthly unemployment rate from LAUS, with the source's own Preliminary or revision footnote carried through. Populated=false means the ingest environment could not reach BLS (rate limit or network) and the file must be re-run in CI to populate.",
  };
}

function buildTsShim(populated) {
  return `/**
 * Typed accessor for BLS LAUS county unemployment. The JSON payload
 * lives in bls-laus-county.generated.json so the fixture is diffable
 * and the vintage metadata (per-county preliminary/revised flags read
 * from BLS footnote codes) can be read at build time without touching
 * this shim.
 */
import raw from "./bls-laus-county.generated.json";

export interface BlsLausCountyRecord {
  countyFips: string;
  countyName: string;
  seriesId: string;
  /** "populated" when BLS supplied a monthly observation, "pending-ci"
   * when the ingest environment could not reach BLS, or "no-data"
   * when the county's series returned no monthly observation. */
  status: "populated" | "pending-ci" | "no-data";
  /** Human-readable label, e.g. "May 2026", or null. */
  latestPeriod: string | null;
  latestPeriodMonth: number | null;
  latestPeriodYear: number | null;
  /** Unemployment rate, percent (typically 0-25), or null. */
  unemploymentRate: number | null;
  /** True if BLS flagged the newest month as Preliminary (footnote P). */
  preliminary: boolean | null;
  /** Revision note if BLS flagged the value as subject to revision
   * (footnote T), else null. */
  revisionNote: string | null;
  pendingReason: string | null;
}

export interface BlsLausCountyProvenance {
  source_name: string;
  source_url: string;
  access_mechanism: string;
  api_url: string;
  measure: string;
  series_id_pattern: string;
  ingested_at: string;
  ingest_script: string;
  michigan_county_registry: string;
  michigan_county_registry_size: number;
  value_label: "VERIFIED";
  populated: boolean;
  latest_vintage: string | null;
  preliminary_flag_meaning: string;
  notes: string;
}

interface Payload {
  provenance: BlsLausCountyProvenance;
  counties: BlsLausCountyRecord[];
}

const payload = raw as Payload;

export const BLS_LAUS_COUNTY_PROVENANCE: BlsLausCountyProvenance =
  payload.provenance;
export const BLS_LAUS_COUNTY_RECORDS: readonly BlsLausCountyRecord[] =
  payload.counties;

const BY_FIPS = new Map<string, BlsLausCountyRecord>(
  payload.counties.map((c) => [c.countyFips, c]),
);
const BY_NAME = new Map<string, BlsLausCountyRecord>(
  payload.counties.map((c) => [c.countyName, c]),
);

export function getBlsLausForCountyFips(
  fips: string,
): BlsLausCountyRecord | null {
  return BY_FIPS.get(fips) ?? null;
}

export function getBlsLausForCountyName(
  name: string,
): BlsLausCountyRecord | null {
  return BY_NAME.get(name) ?? null;
}

/** True iff every county has a real unemployment rate observation. */
export const BLS_LAUS_IS_POPULATED = ${populated};
`;
}

async function main() {
  const miFips = await loadMiCountyFips();
  console.log(`[refresh-bls-laus-county] MI counties: ${miFips.size}`);

  const now = new Date();
  const endYear = now.getUTCFullYear();
  const startYear = endYear - YEARS_BACK;

  const fipsList = [...miFips.keys()].sort();
  const batches = [];
  for (let i = 0; i < fipsList.length; i += BATCH_SIZE) {
    batches.push(fipsList.slice(i, i + BATCH_SIZE));
  }
  console.log(
    `[refresh-bls-laus-county] ${batches.length} BLS batch(es) of up to ${BATCH_SIZE} series (${startYear}-${endYear})`,
  );

  const seriesById = new Map();
  let batchFailure = null;
  for (let b = 0; b < batches.length; b++) {
    const seriesIds = batches[b].map(seriesIdForFips);
    try {
      const seriesArr = await fetchBatch(seriesIds, startYear, endYear);
      console.log(
        `  batch ${b + 1}/${batches.length}: ${seriesArr.length} series returned`,
      );
      for (const s of seriesArr) {
        seriesById.set(s.seriesID, s);
      }
    } catch (err) {
      batchFailure = err.message;
      console.warn(
        `  batch ${b + 1}/${batches.length} FAILED (${err.message}) - falling back to pending-ci stub for the whole file`,
      );
      break;
    }
  }

  let records;
  let populated;
  let latestVintage = null;
  if (batchFailure) {
    records = buildStub(
      miFips,
      `Requires BLS API access from the ingest environment. Batch ${batches.findIndex((_, i) => i)} failed: ${batchFailure}. Re-run refresh-bls-laus-county.mjs in an environment that can reach api.bls.gov.`,
    );
    populated = false;
  } else {
    const built = buildPopulated(miFips, seriesById);
    records = built.records;
    populated = built.missing.length === 0;
    if (built.missing.length > 0) {
      console.warn(
        `[refresh-bls-laus-county] no monthly obs for ${built.missing.length} counties: ${built.missing.join(", ")}`,
      );
    }
    // Read the newest period across all populated records for the
    // dataset-level vintage.
    let newest = null;
    for (const r of records) {
      if (r.latestPeriod && r.latestPeriodYear && r.latestPeriodMonth) {
        const key = r.latestPeriodYear * 100 + r.latestPeriodMonth;
        if (!newest || key > newest.key) {
          newest = {
            key,
            label: r.latestPeriod,
            preliminary: r.preliminary,
          };
        }
      }
    }
    if (newest) {
      latestVintage = `${newest.label}${newest.preliminary ? " (Preliminary)" : ""}`;
    }
  }

  if (records.length !== 83) {
    throw new Error(`Sanity: county count ${records.length} != 83`);
  }

  if (populated) {
    for (const r of records) {
      const v = r.unemploymentRate;
      if (v === null) continue;
      if (!Number.isFinite(v) || v < 0 || v > 40) {
        throw new Error(
          `Sanity: unemploymentRate ${v} for ${r.countyName} outside [0, 40].`,
        );
      }
    }
    console.log("[refresh-bls-laus-county] first 3 counties:");
    for (const r of records.slice(0, 3)) {
      console.log(
        `  ${r.countyFips} ${r.countyName}  ${r.latestPeriod}  rate=${r.unemploymentRate}%${r.preliminary ? " (P)" : ""}`,
      );
    }
    console.log(`[refresh-bls-laus-county] latest vintage: ${latestVintage}`);
  } else {
    console.log("[refresh-bls-laus-county] pending-ci stub written.");
  }

  const ingestedAt = new Date().toISOString();
  const payload = {
    provenance: buildProvenance(ingestedAt, populated, latestVintage),
    counties: records,
  };
  const shim = buildTsShim(populated ? "true" : "false");

  if (!APPLY) {
    console.log(
      `\n[refresh-bls-laus-county] dry-run. Re-run with --apply to write ${path.relative(projectRoot, outJsonPath)} + ${path.relative(projectRoot, outTsPath)}.`,
    );
    return;
  }
  await writeFile(outJsonPath, JSON.stringify(payload, null, 2), "utf8");
  await writeFile(outTsPath, shim, "utf8");
  console.log(
    `\n[refresh-bls-laus-county] wrote ${path.relative(projectRoot, outJsonPath)} (${records.length} counties, populated=${populated}) and ${path.relative(projectRoot, outTsPath)}.`,
  );
}

main().catch((err) => {
  console.error("[refresh-bls-laus-county] failed:", err);
  process.exit(1);
});
