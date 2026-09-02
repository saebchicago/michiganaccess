#!/usr/bin/env node
/**
 * Refresh `src/data/acs-sdoh-county.generated.json` (data) and
 * `src/data/acs-sdoh-county.ts` (typed shim): a bundle of county-level
 * social-determinant measures from the U.S. Census American Community
 * Survey 5-Year detail tables, all 83 Michigan counties.
 *
 * One script, one payload, many measures. Each measure is a ratio of two
 * Census-published counts for the county (numerator / universe), so every
 * value is VERIFIED - a direct tabulation, not a model. The counts that
 * make each ratio are declared per measure in MEASURES below and echoed
 * into provenance so the arithmetic is auditable.
 *
 *   Source   Census ACS 5-Year, api.census.gov/data/<vintage>/acs/acs5
 *   Tables   B17001 (poverty), B17020 (poverty by age), B25070 (rent as %
 *            of income), B25091 (owner costs as % of income), B08201
 *            (vehicles by household), B08303 (travel time to work),
 *            B15003 (educational attainment 25+), C16002 (household
 *            language / limited English), B25014 (occupants per room),
 *            B25003 (tenure)
 *
 * Deliberately NOT here: an uninsured measure. B27010's no-coverage cells
 * are age-nested and easy to mis-index; the platform already ships an
 * uninsured rate from County Health Rankings (SAHIE) and the S2701 subject
 * table is the cleaner source for a follow-up.
 *
 * Margins of error are not propagated through the ratios; the payload
 * carries estimates only and says so in provenance. The Census API caps
 * `get=` at 50 variables, so the fetch is split into table groups.
 *
 * Follows the refresh-acs-broadband-county.mjs "pending-ci" pattern: if
 * CENSUS_API_KEY is not set (or a fetch fails without --require-live) the
 * script writes a stub - all 83 counties, every value null, status
 * "pending-ci", value_label PENDING - so downstream code compiles and
 * renders the coverage state. build-data.yml runs it with the key.
 *
 * Run with --apply to write both files; without --apply it prints a
 * summary. --require-live makes a missing key or failed fetch fatal.
 */
import { writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchAndRecord, writeManifest } from "./lib/ingest-manifest.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..");
const registryPath = path.join(projectRoot, "src/data/census-geographies.ts");
const outJsonPath = path.join(projectRoot, "src/data/acs-sdoh-county.generated.json");
const outTsPath = path.join(projectRoot, "src/data/acs-sdoh-county.ts");

const APPLY = process.argv.includes("--apply");
const REQUIRE_LIVE = process.argv.includes("--require-live");
const CENSUS_API_KEY = process.env.CENSUS_API_KEY ?? "";

const ACS_VINTAGE = 2024; // 2020-2024 5-Year release
const ACS_WINDOW = `${ACS_VINTAGE - 4}-${ACS_VINTAGE}`;
const ACS_BASE = "https://api.census.gov/data";
const ACS_DATASET = `${ACS_VINTAGE}/acs/acs5`;
const SOURCE_LANDING = "https://www.census.gov/programs-surveys/acs/data.html";
const tableUrl = (t) => `https://data.census.gov/table/ACSDT5Y${ACS_VINTAGE}.${t}`;

const v = (table, n) => `${table}_${String(n).padStart(3, "0")}E`;
const range = (table, from, to) => {
  const out = [];
  for (let i = from; i <= to; i++) out.push(v(table, i));
  return out;
};

/**
 * Every measure: percent = sum(numerator) / (sum(universe) - sum(excluded)) * 100.
 * `excluded` removes "not computed" cells from the universe so the share is
 * of households for which the ratio exists, matching how Census presents
 * these tables.
 */
const MEASURES = [
  {
    id: "povertyPct",
    label: "Population below the poverty line",
    tables: ["B17001"],
    numerator: [v("B17001", 2)],
    universe: [v("B17001", 1)],
    universeLabel: "Population for whom poverty status is determined",
  },
  {
    id: "childPovertyPct",
    label: "Children under 18 below the poverty line",
    tables: ["B17020"],
    numerator: range("B17020", 3, 5),
    universe: [...range("B17020", 3, 5), ...range("B17020", 11, 13)],
    universeLabel: "Children under 18 for whom poverty status is determined",
  },
  {
    id: "rentBurden30Pct",
    label: "Renter households paying 30% or more of income on rent",
    tables: ["B25070"],
    numerator: range("B25070", 7, 10),
    universe: [v("B25070", 1)],
    excluded: [v("B25070", 11)],
    universeLabel: "Renter-occupied units with rent burden computed",
  },
  {
    id: "ownerCostBurden30Pct",
    label: "Owner households paying 30% or more of income on housing",
    tables: ["B25091"],
    numerator: [...range("B25091", 8, 11), ...range("B25091", 19, 22)],
    universe: [v("B25091", 1)],
    excluded: [v("B25091", 12), v("B25091", 23)],
    universeLabel: "Owner-occupied units with cost burden computed",
  },
  {
    id: "noVehicleHouseholdsPct",
    label: "Households with no vehicle available",
    tables: ["B08201"],
    numerator: [v("B08201", 2)],
    universe: [v("B08201", 1)],
    universeLabel: "Households",
  },
  {
    id: "longCommute45Pct",
    label: "Workers commuting 45 minutes or more",
    tables: ["B08303"],
    numerator: range("B08303", 11, 13),
    universe: [v("B08303", 1)],
    universeLabel: "Workers 16+ who did not work from home",
  },
  {
    id: "noHsDiplomaPct",
    label: "Adults 25+ without a high school diploma or GED",
    tables: ["B15003"],
    numerator: range("B15003", 2, 16),
    universe: [v("B15003", 1)],
    universeLabel: "Population 25 years and over",
  },
  {
    id: "bachelorsPlusPct",
    label: "Adults 25+ with a bachelor's degree or higher",
    tables: ["B15003"],
    numerator: range("B15003", 22, 25),
    universe: [v("B15003", 1)],
    universeLabel: "Population 25 years and over",
  },
  {
    id: "limitedEnglishHouseholdsPct",
    label: "Limited-English-speaking households",
    tables: ["C16002"],
    numerator: [v("C16002", 4), v("C16002", 7), v("C16002", 10), v("C16002", 13)],
    universe: [v("C16002", 1)],
    universeLabel: "Households",
  },
  {
    id: "crowdedHouseholdsPct",
    label: "Households with more than one occupant per room",
    tables: ["B25014"],
    numerator: [...range("B25014", 5, 7), ...range("B25014", 11, 13)],
    universe: [v("B25014", 1)],
    universeLabel: "Occupied housing units",
  },
  {
    id: "renterHouseholdsPct",
    label: "Renter-occupied share of households",
    tables: ["B25003"],
    numerator: [v("B25003", 3)],
    universe: [v("B25003", 1)],
    universeLabel: "Occupied housing units",
  },
];

/** Split the distinct variable list into <=45-variable API requests. */
function variableGroups() {
  const all = [...new Set(MEASURES.flatMap((m) => [...m.numerator, ...m.universe, ...(m.excluded ?? [])]))];
  const groups = [];
  for (let i = 0; i < all.length; i += 45) groups.push(all.slice(i, i + 45));
  return groups;
}

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
  while ((m = re.exec(body)) !== null) fips.set(`26${m[3]}`, (m[1] ?? m[2]).trim());
  if (fips.size === 0) throw new Error("No MI county FIPS parsed");
  return fips;
}

const manifestEntries = [];
const BUILD_ID = `refresh-acs-sdoh-county-${new Date().toISOString().replace(/[:.]/g, "-")}`;

/** Fetch every variable group; return Map<fips, Map<variable, number>>. */
async function fetchAcs() {
  const byFips = new Map();
  const groups = variableGroups();
  for (let gi = 0; gi < groups.length; gi++) {
    const vars = groups[gi];
    const params = new URLSearchParams({
      get: `NAME,${vars.join(",")}`,
      for: "county:*",
      in: "state:26",
      key: CENSUS_API_KEY,
    });
    const text = await fetchAndRecord({
      sourceId: `census-acs5-sdoh-county-group${gi + 1}`,
      url: `${ACS_BASE}/${ACS_DATASET}?${params}`,
      headers: { "user-agent": "accessmi-data-refresh", accept: "application/json" },
      vintage: ACS_WINDOW,
      minBytes: 500,
      entries: manifestEntries,
    });
    let rows;
    try {
      rows = JSON.parse(text);
    } catch (err) {
      throw new Error(`ACS group ${gi + 1} response was not valid JSON: ${err.message}`);
    }
    if (!Array.isArray(rows) || rows.length < 2) throw new Error(`ACS group ${gi + 1} returned no rows`);
    const header = rows[0];
    const idx = Object.fromEntries(header.map((h, i) => [h, i]));
    for (const c of [...vars, "state", "county"]) {
      if (idx[c] === undefined) throw new Error(`Schema drift: ACS response missing "${c}"`);
    }
    for (const r of rows.slice(1)) {
      const fips = `${r[idx.state]}${r[idx.county]}`;
      const cells = byFips.get(fips) ?? new Map();
      for (const c of vars) {
        const n = Number(r[idx[c]]);
        // Census encodes suppressed/unavailable estimates as negative sentinels.
        cells.set(c, Number.isFinite(n) && n >= 0 ? n : null);
      }
      byFips.set(fips, cells);
    }
  }
  return byFips;
}

const sum = (cells, vars) => {
  let s = 0;
  for (const c of vars) {
    const n = cells.get(c);
    if (n === null || n === undefined) return null;
    s += n;
  }
  return s;
};

function computeValues(cells) {
  const values = {};
  for (const m of MEASURES) {
    const num = sum(cells, m.numerator);
    const uni = sum(cells, m.universe);
    const exc = m.excluded ? sum(cells, m.excluded) : 0;
    if (num === null || uni === null || exc === null) {
      values[m.id] = null;
      continue;
    }
    const denom = uni - exc;
    if (denom <= 0 || num > denom) {
      throw new Error(`Sanity: ${m.id} numerator ${num} vs denominator ${denom}`);
    }
    values[m.id] = Math.round((num / denom) * 1000) / 10;
  }
  return values;
}

const nullValues = () => Object.fromEntries(MEASURES.map((m) => [m.id, null]));

function buildStubCounties(miFips, reason) {
  return [...miFips.entries()].sort().map(([fips, name]) => ({
    countyFips: fips,
    countyName: name,
    status: "pending-ci",
    values: nullValues(),
    pendingReason: reason,
  }));
}

function buildPopulatedCounties(miFips, byFips) {
  const records = [];
  const missing = [];
  for (const [fips, name] of [...miFips.entries()].sort()) {
    const cells = byFips.get(fips);
    if (!cells) {
      missing.push(`${name} (${fips})`);
      continue;
    }
    records.push({ countyFips: fips, countyName: name, status: "populated", values: computeValues(cells), pendingReason: null });
  }
  return { records, missing };
}

function buildProvenance(ingestedAt, populated, pendingReason) {
  const tables = [...new Set(MEASURES.flatMap((m) => m.tables))].sort();
  return {
    source_name: `U.S. Census Bureau ACS 5-Year (${ACS_WINDOW}), county SDOH bundle`,
    source_url: SOURCE_LANDING,
    api_base: ACS_BASE,
    dataset: ACS_DATASET,
    vintage_window: ACS_WINDOW,
    tables,
    table_urls: Object.fromEntries(tables.map((t) => [t, tableUrl(t)])),
    measure_count: MEASURES.length,
    ingested_at: ingestedAt,
    ingest_script: "scripts/refresh-acs-sdoh-county.mjs",
    michigan_county_registry: "src/data/census-geographies.ts",
    michigan_county_registry_size: 83,
    value_label: populated ? "VERIFIED" : "PENDING",
    populated,
    pending_reason: pendingReason,
    notes:
      "Each measure is numerator / (universe - not-computed cells) * 100 from Census-published county counts; the exact variables are listed per measure. Values are direct tabulations (VERIFIED). Margins of error are not propagated through the ratios; this payload carries estimates only. Negative Census sentinels (suppressed or unavailable estimates) become null, never zero. When status = 'pending-ci' the ingest environment lacked CENSUS_API_KEY or could not reach api.census.gov; build-data.yml re-runs this script with the key to populate. The broadband subscription file (acs-broadband-county) is a separate ingest and may sit on an older ACS window.",
  };
}

function buildTsShim(populated) {
  const idUnion = MEASURES.map((m) => `  | "${m.id}"`).join("\n");
  return `/**
 * Typed accessor for the ACS 5-Year county SDOH bundle. The JSON payload
 * lives in acs-sdoh-county.generated.json so the fixture is diffable and the
 * vintage can be read at build time without touching this shim.
 * Regenerated by scripts/refresh-acs-sdoh-county.mjs; do not hand-edit.
 */
import raw from "./acs-sdoh-county.generated.json";

export type AcsSdohMeasureId =
${idUnion};

export interface AcsSdohMeasure {
  id: AcsSdohMeasureId;
  label: string;
  tables: string[];
  numerator: string[];
  universe: string[];
  excluded: string[];
  universeLabel: string;
  unit: "percent";
  value_label: "VERIFIED";
}

export interface AcsSdohCountyRecord {
  countyFips: string;
  countyName: string;
  /** "populated" when Census values are present; "pending-ci" when the
   * ingest environment lacked CENSUS_API_KEY and build-data.yml must re-run. */
  status: "populated" | "pending-ci";
  /** Percent (one decimal) per measure, or null when Census suppressed it. */
  values: Record<AcsSdohMeasureId, number | null>;
  pendingReason: string | null;
}

export interface AcsSdohCountyProvenance {
  source_name: string;
  source_url: string;
  api_base: string;
  dataset: string;
  vintage_window: string;
  tables: string[];
  table_urls: Record<string, string>;
  measure_count: number;
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
  provenance: AcsSdohCountyProvenance;
  measures: AcsSdohMeasure[];
  counties: AcsSdohCountyRecord[];
}

const payload = raw as Payload;

export const ACS_SDOH_COUNTY_PROVENANCE: AcsSdohCountyProvenance = payload.provenance;
export const ACS_SDOH_MEASURES: readonly AcsSdohMeasure[] = payload.measures;
export const ACS_SDOH_COUNTY_RECORDS: readonly AcsSdohCountyRecord[] = payload.counties;

const BY_FIPS = new Map<string, AcsSdohCountyRecord>(
  payload.counties.map((c) => [c.countyFips, c]),
);
const BY_NAME = new Map<string, AcsSdohCountyRecord>(
  payload.counties.map((c) => [c.countyName, c]),
);

export function getAcsSdohForCountyFips(fips: string): AcsSdohCountyRecord | null {
  return BY_FIPS.get(fips) ?? null;
}

export function getAcsSdohForCountyName(name: string): AcsSdohCountyRecord | null {
  return BY_NAME.get(name.replace(/\\s+County$/i, "").trim()) ?? null;
}

/** One measure for one county, or null when pending or suppressed. */
export function getAcsSdohValue(
  countyName: string,
  measureId: AcsSdohMeasureId,
): number | null {
  const rec = getAcsSdohForCountyName(countyName);
  if (!rec || rec.status !== "populated") return null;
  return rec.values[measureId] ?? null;
}

/** True iff every county carries Census values. */
export const ACS_SDOH_IS_POPULATED = ${populated};
`;
}

async function main() {
  const miFips = await loadMiCountyFips();
  console.log(`[refresh-acs-sdoh-county] MI counties in registry: ${miFips.size}; measures: ${MEASURES.length}; API requests: ${variableGroups().length}`);

  const hasKey = CENSUS_API_KEY.length > 0;
  if (REQUIRE_LIVE && !hasKey) {
    throw new Error("CENSUS_API_KEY is empty and --require-live was passed. Refusing to write pending-ci stub in CI mode.");
  }

  let records;
  let populated = false;
  let pendingReason = null;
  if (!hasKey) {
    pendingReason = "Requires CENSUS_API_KEY. build-data.yml runs refresh-acs-sdoh-county.mjs with the key set to populate real values.";
  } else {
    try {
      const byFips = await fetchAcs();
      const built = buildPopulatedCounties(miFips, byFips);
      if (built.missing.length > 0) throw new Error(`ACS returned no rows for ${built.missing.length} counties: ${built.missing.join(", ")}`);
      records = built.records;
      populated = true;
    } catch (err) {
      if (REQUIRE_LIVE) throw err;
      pendingReason = `Could not fetch or parse ACS (${err.message}). Re-run on build-data.yml to populate.`;
    }
  }
  if (!populated) {
    console.warn(`[refresh-acs-sdoh-county] ${pendingReason}`);
    records = buildStubCounties(miFips, pendingReason);
  }

  if (records.length !== 83) throw new Error(`Sanity: county count ${records.length} != 83.`);
  if (populated) {
    for (const r of records) {
      for (const [id, val] of Object.entries(r.values)) {
        if (val !== null && (val < 0 || val > 100)) throw new Error(`Sanity: ${id} ${val} for ${r.countyName} outside [0, 100].`);
      }
    }
    console.log("[refresh-acs-sdoh-county] first 3 counties:");
    for (const r of records.slice(0, 3)) {
      console.log(`  ${r.countyFips} ${r.countyName}  poverty=${r.values.povertyPct}%  rentBurden=${r.values.rentBurden30Pct}%  noVehicle=${r.values.noVehicleHouseholdsPct}%`);
    }
  } else {
    console.log("[refresh-acs-sdoh-county] stub: 83 counties in pending-ci state.");
  }

  const payload = {
    provenance: buildProvenance(new Date().toISOString(), populated, pendingReason),
    measures: MEASURES.map((m) => ({
      id: m.id,
      label: m.label,
      tables: m.tables,
      numerator: m.numerator,
      universe: m.universe,
      excluded: m.excluded ?? [],
      universeLabel: m.universeLabel,
      unit: "percent",
      value_label: "VERIFIED",
    })),
    counties: records,
  };
  const shim = buildTsShim(populated ? "true" : "false");

  if (!APPLY) {
    console.log(`\n[refresh-acs-sdoh-county] dry-run. Re-run with --apply to write ${path.relative(projectRoot, outJsonPath)} + ${path.relative(projectRoot, outTsPath)}.`);
    return;
  }
  await writeFile(outJsonPath, JSON.stringify(payload, null, 2) + "\n", "utf8");
  await writeFile(outTsPath, shim, "utf8");
  console.log(`\n[refresh-acs-sdoh-county] wrote ${path.relative(projectRoot, outJsonPath)} (${records.length} counties, populated=${populated}) and ${path.relative(projectRoot, outTsPath)}.`);

  if (manifestEntries.length > 0) {
    const manifestPath = await writeManifest({ projectRoot, buildId: BUILD_ID, entries: manifestEntries });
    console.log(`  archival manifest: ${path.relative(projectRoot, manifestPath)}`);
  }
}

main().catch(async (err) => {
  console.error("[refresh-acs-sdoh-county] failed:", err);
  if (manifestEntries.length > 0) {
    try {
      const manifestPath = await writeManifest({ projectRoot, buildId: BUILD_ID, entries: manifestEntries });
      console.error(`[refresh-acs-sdoh-county] archival manifest written despite failure: ${path.relative(projectRoot, manifestPath)}`);
    } catch (manifestErr) {
      console.error("[refresh-acs-sdoh-county] also failed to write archival manifest:", manifestErr.message);
    }
  }
  process.exit(1);
});
