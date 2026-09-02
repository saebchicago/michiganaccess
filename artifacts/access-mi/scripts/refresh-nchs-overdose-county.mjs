#!/usr/bin/env node
/**
 * Refresh `src/data/nchs-overdose-county.generated.json` (data) and
 * `src/data/nchs-overdose-county.ts` (typed shim) from the National Center
 * for Health Statistics' Vital Statistics Rapid Release: provisional
 * county-level drug overdose death counts.
 *
 *   Source     CDC / NCHS, VSRR Provisional County-Level Drug Overdose
 *              Death Counts (data.cdc.gov)
 *   Dataset    gb4e-bhi7 (Socrata). Metadata is fetched from
 *              /api/views/gb4e-bhi7.json and the title is asserted to
 *              mention "overdose" and "county" so a renumbered dataset
 *              fails loudly instead of parsing the wrong table.
 *   Content    Rolling 12-month-ending counts per county, published
 *              monthly with a lag; counts under 10 are suppressed by NCHS.
 *
 * Provenance VERIFIED: the count is NCHS's own provisional tabulation of
 * death certificates for the county. "Provisional" is carried into the
 * label copy on every surface; NCHS revises as certificates finalize.
 *
 * Suppression: NCHS withholds counts under 10 and marks rows as suppressed.
 * Those become null with status "suppressed", never 0. No rate is computed
 * here - a per-100k rate on a 12-month provisional count in a county with
 * a few thousand residents would be noise, and NCHS does not publish one
 * at this level.
 *
 * Vintage: the latest 12-month period NCHS has published is chosen at run
 * time from the data itself and echoed into provenance.
 *
 * Follows the refresh-hud-chas-county.mjs pending-ci pattern; --require-live
 * makes a fetch or schema failure fatal instead of writing the stub.
 */
import { writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchAndRecord, writeManifest } from "./lib/ingest-manifest.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..");
const registryPath = path.join(projectRoot, "src/data/census-geographies.ts");
const outJsonPath = path.join(projectRoot, "src/data/nchs-overdose-county.generated.json");
const outTsPath = path.join(projectRoot, "src/data/nchs-overdose-county.ts");

const APPLY = process.argv.includes("--apply");
const REQUIRE_LIVE = process.argv.includes("--require-live");

const DATASET_ID = "gb4e-bhi7";
const SOCRATA_METADATA_URL = `https://data.cdc.gov/api/views/${DATASET_ID}.json`;
const SOCRATA_ROWS_URL = `https://data.cdc.gov/resource/${DATASET_ID}.json`;
const SOURCE_LANDING = `https://data.cdc.gov/NCHS/VSRR-Provisional-County-Level-Drug-Overdose-Death-C/${DATASET_ID}`;

async function loadMiCountyFips() {
  const src = await readFile(registryPath, "utf8");
  const start = src.indexOf("MI_COUNTY_FIPS");
  const open = src.indexOf("{", start);
  const close = src.indexOf("}", open);
  const body = src.slice(open + 1, close);
  const fips = new Map();
  const re = /(?:"([^"]+)"|(\b[A-Z][\w. ]*))\s*:\s*"(\d{3})"/g;
  let m;
  while ((m = re.exec(body)) !== null) fips.set(`26${m[3]}`, (m[1] ?? m[2]).trim());
  if (fips.size === 0) throw new Error("No MI county FIPS parsed");
  return fips;
}

const manifestEntries = [];
const BUILD_ID = `refresh-nchs-overdose-county-${new Date().toISOString().replace(/[:.]/g, "-")}`;

async function fetchJson(url, sourceId, vintage) {
  const text = await fetchAndRecord({
    sourceId,
    url,
    headers: { "user-agent": "accessmi-data-refresh", accept: "application/json" },
    vintage,
    minBytes: 200,
    entries: manifestEntries,
  });
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error(`${sourceId}: response was not valid JSON (${err.message})`);
  }
}

/** Socrata column names are lowercased, non-alphanumerics become underscores. */
const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

/**
 * Find the row field that holds each concept. The VSRR dataset has renamed
 * columns between releases, so match on meaning (a field whose name
 * contains the given tokens), assert exactly one match, and record the
 * resolved names in provenance.
 */
function resolveFields(sample) {
  const keys = Object.keys(sample);
  const find = (label, ...tokens) => {
    const hits = keys.filter((k) => tokens.every((t) => norm(k).includes(t)));
    if (hits.length !== 1) {
      throw new Error(`Schema drift: expected exactly one field for ${label} (${tokens.join("+")}), found [${hits.join(", ")}] among [${keys.join(", ")}]`);
    }
    return hits[0];
  };
  return {
    state: find("state abbreviation", "st_abbrev"),
    fips: find("county FIPS", "fips"),
    year: find("year", "year"),
    month: find("month", "month"),
    deaths: find("provisional overdose deaths", "provisional", "death"),
  };
}

function parseCount(raw) {
  if (raw === null || raw === undefined) return { value: null, suppressed: true };
  const s = String(raw).trim();
  if (s === "" || /suppress|not shown|not available|\*/i.test(s)) return { value: null, suppressed: true };
  const n = Number(s.replace(/,/g, ""));
  if (!Number.isFinite(n) || n < 0) throw new Error(`Unparseable overdose count "${s}"`);
  return { value: Math.round(n), suppressed: false };
}

async function fetchLatestMichigan(miFips) {
  const meta = await fetchJson(SOCRATA_METADATA_URL, "nchs-overdose-county-metadata", "socrata");
  const title = String(meta.name ?? "");
  if (!/overdose/i.test(title) || !/county/i.test(title)) {
    throw new Error(`Dataset ${DATASET_ID} title "${title}" does not look like the county overdose release`);
  }
  const rowsUpdatedAt = meta.rowsUpdatedAt ? new Date(Number(meta.rowsUpdatedAt) * 1000).toISOString() : null;

  // Pull every Michigan row (all periods) and pick the latest period in-memory:
  // the dataset is a few thousand rows per state, well under one page.
  const url = `${SOCRATA_ROWS_URL}?$limit=50000&$where=${encodeURIComponent("upper(st_abbrev)='MI'")}`;
  let rows = await fetchJson(url, "nchs-overdose-county-rows", "provisional");
  if (!Array.isArray(rows) || rows.length === 0) {
    // st_abbrev may be named differently; fall back to an unfiltered pull and filter locally.
    rows = await fetchJson(`${SOCRATA_ROWS_URL}?$limit=200000`, "nchs-overdose-county-rows-all", "provisional");
    if (!Array.isArray(rows) || rows.length === 0) throw new Error("NCHS returned no rows");
  }
  const f = resolveFields(rows[0]);
  const mi = rows.filter((r) => String(r[f.state]).toUpperCase() === "MI");
  if (mi.length === 0) throw new Error("No Michigan rows in the NCHS county overdose dataset");

  // Latest period = max (year, month).
  let latest = null;
  for (const r of mi) {
    const y = Number(r[f.year]);
    const mo = Number(r[f.month]);
    if (!Number.isFinite(y) || !Number.isFinite(mo)) continue;
    if (!latest || y > latest.y || (y === latest.y && mo > latest.mo)) latest = { y, mo };
  }
  if (!latest) throw new Error("Could not determine the latest period");
  const period = `${latest.y}-${String(latest.mo).padStart(2, "0")}`;

  const byFips = new Map();
  for (const r of mi) {
    if (Number(r[f.year]) !== latest.y || Number(r[f.month]) !== latest.mo) continue;
    const fips = String(r[f.fips]).padStart(5, "0");
    if (!miFips.has(fips)) continue;
    byFips.set(fips, parseCount(r[f.deaths]));
  }
  return { byFips, period, rowsUpdatedAt, fields: f, title };
}

function buildStub(miFips, reason) {
  return [...miFips.entries()].sort().map(([countyFips, countyName]) => ({
    countyFips,
    countyName,
    status: "pending-ci",
    provisionalDeaths12mo: null,
    pendingReason: reason,
  }));
}

function buildPopulated(miFips, byFips) {
  const records = [];
  const missing = [];
  for (const [fips, name] of [...miFips.entries()].sort()) {
    const row = byFips.get(fips);
    if (!row) {
      missing.push(`${name} (${fips})`);
      continue;
    }
    records.push({
      countyFips: fips,
      countyName: name,
      status: row.suppressed ? "suppressed" : "populated",
      provisionalDeaths12mo: row.value,
      pendingReason: null,
    });
  }
  return { records, missing };
}

function buildProvenance({ ingestedAt, populated, period, rowsUpdatedAt, fields, title, pendingReason }) {
  return {
    source_name: "CDC / NCHS Vital Statistics Rapid Release, provisional county-level drug overdose death counts",
    source_url: SOURCE_LANDING,
    dataset_id: DATASET_ID,
    dataset_title: title,
    socrata_metadata_url: SOCRATA_METADATA_URL,
    socrata_rows_updated_at: rowsUpdatedAt,
    period_ending: period,
    period_definition: "12-month-ending count for the month shown (provisional)",
    resolved_fields: fields,
    ingested_at: ingestedAt,
    ingest_script: "scripts/refresh-nchs-overdose-county.mjs",
    michigan_county_registry: "src/data/census-geographies.ts",
    michigan_county_registry_size: 83,
    value_label: populated ? "VERIFIED" : "PENDING",
    populated,
    pending_reason: pendingReason,
    notes:
      "Provisional counts of drug overdose deaths by county of residence, 12-month-ending, from NCHS's Vital Statistics Rapid Release. NCHS suppresses counts under 10; suppressed counties carry status 'suppressed' and a null count, never 0. Counts are provisional and revised as death certificates finalize; every surface says 'provisional'. No per-100k rate is computed: NCHS publishes none at this level and a rate on small provisional counts would be noise. When status = 'pending-ci' the ingest environment could not reach data.cdc.gov; the scheduled dataset-refresh workflow populates the file.",
  };
}

function buildTsShim(populated) {
  return `/**
 * Typed accessor for NCHS provisional county drug overdose death counts.
 * Payload in nchs-overdose-county.generated.json; regenerated by
 * scripts/refresh-nchs-overdose-county.mjs. Do not hand-edit.
 */
import raw from "./nchs-overdose-county.generated.json";

export interface OverdoseCountyRecord {
  countyFips: string;
  countyName: string;
  /** "suppressed" = NCHS withheld a count under 10 (null, never 0). */
  status: "populated" | "suppressed" | "pending-ci";
  /** 12-month-ending provisional count, or null. */
  provisionalDeaths12mo: number | null;
  pendingReason: string | null;
}

export interface OverdoseCountyProvenance {
  source_name: string;
  source_url: string;
  dataset_id: string;
  dataset_title: string | null;
  socrata_metadata_url: string;
  socrata_rows_updated_at: string | null;
  /** e.g. "2026-03" - the month the 12-month window ends. */
  period_ending: string | null;
  period_definition: string;
  resolved_fields: Record<string, string> | null;
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
  provenance: OverdoseCountyProvenance;
  counties: OverdoseCountyRecord[];
}

const payload = raw as Payload;

export const OVERDOSE_COUNTY_PROVENANCE: OverdoseCountyProvenance = payload.provenance;
export const OVERDOSE_COUNTY_RECORDS: readonly OverdoseCountyRecord[] = payload.counties;

const BY_FIPS = new Map<string, OverdoseCountyRecord>(payload.counties.map((c) => [c.countyFips, c]));
const BY_NAME = new Map<string, OverdoseCountyRecord>(payload.counties.map((c) => [c.countyName, c]));

export function getOverdoseForCountyFips(fips: string): OverdoseCountyRecord | null {
  return BY_FIPS.get(fips) ?? null;
}

export function getOverdoseForCountyName(name: string): OverdoseCountyRecord | null {
  return BY_NAME.get(name.replace(/\\s+County$/i, "").trim()) ?? null;
}

/** Human-readable period, e.g. "12 months ending Mar 2026", or null. */
export function overdosePeriodLabel(): string | null {
  const p = OVERDOSE_COUNTY_PROVENANCE.period_ending;
  if (!p) return null;
  const [y, m] = p.split("-").map(Number);
  const month = new Date(Date.UTC(y, m - 1, 1)).toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  return \`12 months ending \${month} \${y}\`;
}

export const OVERDOSE_IS_POPULATED = ${populated};
`;
}

async function main() {
  const miFips = await loadMiCountyFips();
  console.log(`[refresh-nchs-overdose-county] MI counties in registry: ${miFips.size}`);

  let records;
  let populated = false;
  let period = null;
  let rowsUpdatedAt = null;
  let fields = null;
  let title = null;
  let pendingReason = null;
  try {
    const got = await fetchLatestMichigan(miFips);
    ({ period, rowsUpdatedAt, fields, title } = got);
    const built = buildPopulated(miFips, got.byFips);
    if (built.missing.length > 0) throw new Error(`NCHS period ${period} lacks ${built.missing.length} MI counties: ${built.missing.join(", ")}`);
    records = built.records;
    populated = true;
    const shown = records.filter((r) => r.status === "populated").length;
    console.log(`[refresh-nchs-overdose-county] period ${period}: ${shown} counties with counts, ${83 - shown} suppressed`);
  } catch (err) {
    if (REQUIRE_LIVE) throw err;
    pendingReason = `Could not fetch or parse the NCHS county overdose dataset (${err.message}). Re-run scripts/refresh-nchs-overdose-county.mjs --apply on the scheduled dataset-refresh workflow to populate real values.`;
    console.warn(`[refresh-nchs-overdose-county] ${pendingReason}`);
    records = buildStub(miFips, pendingReason);
  }
  if (records.length !== 83) throw new Error(`Sanity: county count ${records.length} != 83.`);

  const payload = {
    provenance: buildProvenance({ ingestedAt: new Date().toISOString(), populated, period, rowsUpdatedAt, fields, title, pendingReason }),
    counties: records,
  };
  const shim = buildTsShim(populated ? "true" : "false");

  if (!APPLY) {
    console.log(`\n[refresh-nchs-overdose-county] dry-run (populated=${populated}). Re-run with --apply to write.`);
    return;
  }
  await writeFile(outJsonPath, JSON.stringify(payload, null, 2) + "\n", "utf8");
  await writeFile(outTsPath, shim, "utf8");
  console.log(`\n[refresh-nchs-overdose-county] wrote ${path.relative(projectRoot, outJsonPath)} (83 counties, populated=${populated}) and ${path.relative(projectRoot, outTsPath)}.`);
  if (manifestEntries.length > 0) {
    const manifestPath = await writeManifest({ projectRoot, buildId: BUILD_ID, entries: manifestEntries });
    console.log(`  archival manifest: ${path.relative(projectRoot, manifestPath)}`);
  }
}

main().catch(async (err) => {
  console.error("[refresh-nchs-overdose-county] failed:", err);
  if (manifestEntries.length > 0) {
    try {
      await writeManifest({ projectRoot, buildId: BUILD_ID, entries: manifestEntries });
    } catch (manifestErr) {
      console.error("[refresh-nchs-overdose-county] also failed to write archival manifest:", manifestErr.message);
    }
  }
  process.exit(1);
});
