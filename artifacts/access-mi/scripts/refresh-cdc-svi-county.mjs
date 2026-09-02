#!/usr/bin/env node
/**
 * Refresh `src/data/cdc-svi-county.generated.json` (data) and
 * `src/data/cdc-svi-county.ts` (typed shim) from the CDC/ATSDR Social
 * Vulnerability Index county file for Michigan.
 *
 *   Source     CDC/ATSDR, Social Vulnerability Index (SVI), county level
 *   Landing    https://www.atsdr.cdc.gov/place-health/php/svi/index.html
 *   Download   https://svi.cdc.gov/Documents/Data/<year>/csv/states_counties/Michigan_county.csv
 *   Content    Overall and four theme percentile ranks (0-1, ranked against
 *              all US counties) plus the ACS-derived percentages that feed
 *              them (poverty, unemployment, housing cost burden, no diploma,
 *              uninsured, age 65+, age 17 and under, disability, single
 *              parent, limited English, minority, multi-unit, mobile home,
 *              crowding, no vehicle, group quarters).
 *
 * Provenance MODELED: the SVI is ATSDR's own composite ranking, a published
 * model of ACS inputs rather than a direct count. That matches how the
 * platform already labels the tract-level SVI it fetches live
 * (dataCatalog `cdc-atsdr-svi`, access "modeled"). The EP_* inputs are
 * ACS percentages ATSDR republishes; they travel with the same label
 * because ATSDR computes them on its own denominators.
 *
 * Vintage: the newest year in SVI_YEARS that svi.cdc.gov serves wins and
 * is echoed into provenance. -999 is ATSDR's sentinel for a missing value
 * and becomes null, never 0.
 *
 * Follows the refresh-hud-chas-county.mjs pending-ci pattern: any fetch or
 * parse failure with --apply writes the stub (83 counties, nulls, PENDING);
 * --require-live makes it fatal instead.
 */
import { writeFile, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchAndRecord, writeManifest } from "./lib/ingest-manifest.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..");
const registryPath = path.join(projectRoot, "src/data/census-geographies.ts");
const outJsonPath = path.join(projectRoot, "src/data/cdc-svi-county.generated.json");
const outTsPath = path.join(projectRoot, "src/data/cdc-svi-county.ts");

const APPLY = process.argv.includes("--apply");
const REQUIRE_LIVE = process.argv.includes("--require-live");

/** Newest first. */
const SVI_YEARS = [2022, 2020];
const SOURCE_LANDING = "https://www.atsdr.cdc.gov/place-health/php/svi/index.html";
const csvUrl = (y) => `https://svi.cdc.gov/Documents/Data/${y}/csv/states_counties/Michigan_county.csv`;

/** Percentile ranks, 0-1, US-wide county ranking. */
const THEMES = [
  { id: "overall", column: "RPL_THEMES", label: "Overall social vulnerability" },
  { id: "socioeconomic", column: "RPL_THEME1", label: "Socioeconomic status" },
  { id: "householdCharacteristics", column: "RPL_THEME2", label: "Household characteristics" },
  { id: "racialEthnicMinority", column: "RPL_THEME3", label: "Racial and ethnic minority status" },
  { id: "housingTransportation", column: "RPL_THEME4", label: "Housing type and transportation" },
];

/** ATSDR's ACS-derived input percentages (EP_ = estimate percent). */
const INPUTS = [
  { id: "belowPoverty150Pct", column: "EP_POV150", label: "Persons below 150% of poverty" },
  { id: "unemployedPct", column: "EP_UNEMP", label: "Civilian unemployed (16+)" },
  { id: "housingCostBurdenPct", column: "EP_HBURD", label: "Housing cost-burdened occupied units" },
  { id: "noHsDiplomaPct", column: "EP_NOHSDP", label: "Persons 25+ with no high school diploma" },
  { id: "uninsuredPct", column: "EP_UNINSUR", label: "Uninsured (civilian noninstitutionalized)" },
  { id: "age65PlusPct", column: "EP_AGE65", label: "Persons aged 65 and older" },
  { id: "age17UnderPct", column: "EP_AGE17", label: "Persons aged 17 and younger" },
  { id: "disabilityPct", column: "EP_DISABL", label: "Civilian noninstitutionalized with a disability" },
  { id: "singleParentPct", column: "EP_SNGPNT", label: "Single-parent households with children under 18" },
  { id: "limitedEnglishPct", column: "EP_LIMENG", label: "Persons 5+ who speak English less than well" },
  { id: "minorityPct", column: "EP_MINRTY", label: "Racial and ethnic minority persons" },
  { id: "multiUnitHousingPct", column: "EP_MUNIT", label: "Housing in structures with 10+ units" },
  { id: "mobileHomesPct", column: "EP_MOBILE", label: "Mobile homes" },
  { id: "crowdingPct", column: "EP_CROWD", label: "Occupied units with more people than rooms" },
  { id: "noVehiclePct", column: "EP_NOVEH", label: "Households with no vehicle available" },
  { id: "groupQuartersPct", column: "EP_GROUPQ", label: "Persons in group quarters" },
];

function parseCsv(text) {
  const rows = [];
  let cur = [];
  let field = "";
  let inQuote = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuote) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuote = false;
      } else field += c;
      continue;
    }
    if (c === '"') inQuote = true;
    else if (c === ",") {
      cur.push(field);
      field = "";
    } else if (c === "\n") {
      cur.push(field);
      field = "";
      rows.push(cur);
      cur = [];
    } else if (c !== "\r") field += c;
  }
  if (field.length > 0 || cur.length > 0) {
    cur.push(field);
    rows.push(cur);
  }
  return rows;
}

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
const BUILD_ID = `refresh-cdc-svi-county-${new Date().toISOString().replace(/[:.]/g, "-")}`;

async function fetchNewestCsv() {
  const errors = [];
  for (const year of SVI_YEARS) {
    try {
      const text = await fetchAndRecord({
        sourceId: `cdc-svi-county-${year}`,
        url: csvUrl(year),
        headers: { "user-agent": "accessmi-data-refresh", accept: "text/csv,*/*" },
        vintage: String(year),
        minBytes: 20_000,
        entries: manifestEntries,
      });
      return { year, text };
    } catch (err) {
      errors.push(`${year}: ${err.message}`);
    }
  }
  throw new Error(`No SVI county CSV could be fetched. ${errors.join(" | ")}`);
}

/** -999 is ATSDR's missing sentinel. */
function num(raw, what) {
  if (raw === undefined || raw === "") return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) throw new Error(`non-numeric ${what} "${raw}"`);
  if (n <= -999) return null;
  return n;
}

function parseSvi(text, miFips) {
  const rows = parseCsv(text);
  const header = rows[0].map((h) => h.trim().toUpperCase());
  const idx = Object.fromEntries(header.map((h, i) => [h, i]));
  for (const c of ["FIPS", "COUNTY", ...THEMES.map((t) => t.column), ...INPUTS.map((i) => i.column)]) {
    if (idx[c] === undefined) throw new Error(`Schema drift: SVI county CSV missing column "${c}"`);
  }
  const byFips = new Map();
  for (const row of rows.slice(1)) {
    if (row.length < header.length) continue;
    const fips = String(row[idx.FIPS]).padStart(5, "0");
    if (!miFips.has(fips)) continue;
    const themes = {};
    for (const t of THEMES) {
      const v = num(row[idx[t.column]], t.column);
      if (v !== null && (v < 0 || v > 1)) throw new Error(`Sanity: ${t.column} ${v} for ${fips} outside [0, 1]`);
      themes[t.id] = v === null ? null : Math.round(v * 10000) / 10000;
    }
    const inputs = {};
    for (const i of INPUTS) {
      const v = num(row[idx[i.column]], i.column);
      if (v !== null && (v < 0 || v > 100)) throw new Error(`Sanity: ${i.column} ${v} for ${fips} outside [0, 100]`);
      inputs[i.id] = v === null ? null : Math.round(v * 10) / 10;
    }
    byFips.set(fips, { themes, inputs });
  }
  return byFips;
}

const nullThemes = () => Object.fromEntries(THEMES.map((t) => [t.id, null]));
const nullInputs = () => Object.fromEntries(INPUTS.map((i) => [i.id, null]));

function buildStubCounties(miFips, reason) {
  return [...miFips.entries()].sort().map(([countyFips, countyName]) => ({
    countyFips,
    countyName,
    status: "pending-ci",
    themes: nullThemes(),
    inputs: nullInputs(),
    pendingReason: reason,
  }));
}

function buildPopulatedCounties(miFips, byFips) {
  const records = [];
  const missing = [];
  for (const [fips, name] of [...miFips.entries()].sort()) {
    const row = byFips.get(fips);
    if (!row) {
      missing.push(`${name} (${fips})`);
      continue;
    }
    records.push({ countyFips: fips, countyName: name, status: "populated", ...row, pendingReason: null });
  }
  return { records, missing };
}

function buildProvenance({ ingestedAt, populated, year, csvSha256, pendingReason }) {
  return {
    source_name: `CDC/ATSDR Social Vulnerability Index ${year ?? "(year pending)"}, Michigan county file`,
    source_url: SOURCE_LANDING,
    download_url: year ? csvUrl(year) : null,
    csv_sha256: csvSha256,
    svi_year: year,
    candidate_years: SVI_YEARS,
    ranking_universe: "United States counties (RPL_* percentile ranks, 0 = least vulnerable, 1 = most)",
    ingested_at: ingestedAt,
    ingest_script: "scripts/refresh-cdc-svi-county.mjs",
    michigan_county_registry: "src/data/census-geographies.ts",
    michigan_county_registry_size: 83,
    value_label: populated ? "MODELED" : "PENDING",
    populated,
    pending_reason: pendingReason,
    notes:
      "The SVI is ATSDR's composite percentile ranking of ACS 5-year inputs, so every value is MODELED: a published model, not a direct count. Theme ranks are US-wide county percentiles (0-1); the EP_* inputs are ATSDR's own ACS-derived percentages and are republished here with the same label. -999 in the source means the value is unavailable and becomes null, never 0. When status = 'pending-ci' the ingest environment could not reach svi.cdc.gov; the scheduled dataset-refresh workflow populates the file.",
  };
}

function buildTsShim(populated) {
  const themeUnion = THEMES.map((t) => `  | "${t.id}"`).join("\n");
  const inputUnion = INPUTS.map((i) => `  | "${i.id}"`).join("\n");
  return `/**
 * Typed accessor for the CDC/ATSDR Social Vulnerability Index county file.
 * Payload in cdc-svi-county.generated.json; regenerated by
 * scripts/refresh-cdc-svi-county.mjs. Do not hand-edit.
 */
import raw from "./cdc-svi-county.generated.json";

export type SviThemeId =
${themeUnion};

export type SviInputId =
${inputUnion};

export interface SviCountyRecord {
  countyFips: string;
  countyName: string;
  status: "populated" | "pending-ci";
  /** US-wide county percentile ranks, 0 (least vulnerable) to 1 (most), or null. */
  themes: Record<SviThemeId, number | null>;
  /** ATSDR's ACS-derived input percentages (one decimal), or null. */
  inputs: Record<SviInputId, number | null>;
  pendingReason: string | null;
}

export interface SviCountyProvenance {
  source_name: string;
  source_url: string;
  download_url: string | null;
  csv_sha256: string | null;
  svi_year: number | null;
  candidate_years: number[];
  ranking_universe: string;
  ingested_at: string;
  ingest_script: string;
  michigan_county_registry: string;
  michigan_county_registry_size: number;
  value_label: "MODELED" | "PENDING";
  populated: boolean;
  pending_reason: string | null;
  notes: string;
}

interface Payload {
  provenance: SviCountyProvenance;
  themes: Array<{ id: SviThemeId; column: string; label: string; value_label: "MODELED" }>;
  inputs: Array<{ id: SviInputId; column: string; label: string; value_label: "MODELED" }>;
  counties: SviCountyRecord[];
}

const payload = raw as Payload;

export const SVI_COUNTY_PROVENANCE: SviCountyProvenance = payload.provenance;
export const SVI_THEMES = payload.themes;
export const SVI_INPUTS = payload.inputs;
export const SVI_COUNTY_RECORDS: readonly SviCountyRecord[] = payload.counties;

const BY_FIPS = new Map<string, SviCountyRecord>(payload.counties.map((c) => [c.countyFips, c]));
const BY_NAME = new Map<string, SviCountyRecord>(payload.counties.map((c) => [c.countyName, c]));

export function getSviForCountyFips(fips: string): SviCountyRecord | null {
  return BY_FIPS.get(fips) ?? null;
}

export function getSviForCountyName(name: string): SviCountyRecord | null {
  return BY_NAME.get(name.replace(/\\s+County$/i, "").trim()) ?? null;
}

/** Overall SVI percentile as 0-100, or null while pending. */
export function getSviOverallPercentile(countyName: string): number | null {
  const rec = getSviForCountyName(countyName);
  const v = rec?.status === "populated" ? rec.themes.overall : null;
  return v === null || v === undefined ? null : Math.round(v * 1000) / 10;
}

export const SVI_IS_POPULATED = ${populated};
`;
}

async function main() {
  const miFips = await loadMiCountyFips();
  console.log(`[refresh-cdc-svi-county] MI counties in registry: ${miFips.size}`);

  let records;
  let populated = false;
  let year = null;
  let csvSha256 = null;
  let pendingReason = null;
  try {
    const got = await fetchNewestCsv();
    year = got.year;
    csvSha256 = createHash("sha256").update(got.text).digest("hex");
    const built = buildPopulatedCounties(miFips, parseSvi(got.text, miFips));
    if (built.missing.length > 0) throw new Error(`SVI file lacks ${built.missing.length} MI counties: ${built.missing.join(", ")}`);
    records = built.records;
    populated = true;
    console.log(`[refresh-cdc-svi-county] fetched SVI ${year} (sha256 ${csvSha256.slice(0, 12)}...)`);
  } catch (err) {
    if (REQUIRE_LIVE) throw err;
    pendingReason = `Could not fetch or parse the SVI county CSV (${err.message}). Re-run scripts/refresh-cdc-svi-county.mjs --apply on the scheduled dataset-refresh workflow to populate real values.`;
    console.warn(`[refresh-cdc-svi-county] ${pendingReason}`);
    records = buildStubCounties(miFips, pendingReason);
  }
  if (records.length !== 83) throw new Error(`Sanity: county count ${records.length} != 83.`);

  const payload = {
    provenance: buildProvenance({ ingestedAt: new Date().toISOString(), populated, year, csvSha256, pendingReason }),
    themes: THEMES.map((t) => ({ ...t, value_label: "MODELED" })),
    inputs: INPUTS.map((i) => ({ ...i, value_label: "MODELED" })),
    counties: records,
  };
  const shim = buildTsShim(populated ? "true" : "false");

  if (!APPLY) {
    console.log(`\n[refresh-cdc-svi-county] dry-run (populated=${populated}). Re-run with --apply to write.`);
    return;
  }
  await writeFile(outJsonPath, JSON.stringify(payload, null, 2) + "\n", "utf8");
  await writeFile(outTsPath, shim, "utf8");
  console.log(`\n[refresh-cdc-svi-county] wrote ${path.relative(projectRoot, outJsonPath)} (83 counties, populated=${populated}) and ${path.relative(projectRoot, outTsPath)}.`);
  if (manifestEntries.length > 0) {
    const manifestPath = await writeManifest({ projectRoot, buildId: BUILD_ID, entries: manifestEntries });
    console.log(`  archival manifest: ${path.relative(projectRoot, manifestPath)}`);
  }
}

main().catch(async (err) => {
  console.error("[refresh-cdc-svi-county] failed:", err);
  if (manifestEntries.length > 0) {
    try {
      await writeManifest({ projectRoot, buildId: BUILD_ID, entries: manifestEntries });
    } catch (manifestErr) {
      console.error("[refresh-cdc-svi-county] also failed to write archival manifest:", manifestErr.message);
    }
  }
  process.exit(1);
});
