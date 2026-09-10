#!/usr/bin/env node
/**
 * Refresh `src/data/saipe-county.generated.json` (data) and
 * `src/data/saipe-county.ts` (typed shim): county poverty and median
 * household income for all 83 Michigan counties from the U.S. Census
 * Bureau's Small Area Income and Poverty Estimates (SAIPE).
 *
 *   Source  https://www.census.gov/programs-surveys/saipe.html
 *   File    https://www2.census.gov/programs-surveys/saipe/datasets/
 *             <year>/<year>-state-and-county/est<yy>-mi.txt
 *
 * Why SAIPE and not the ACS detail tables: api.census.gov now rejects
 * every request without an API key ("Missing Key"), and the platform's
 * CENSUS_API_KEY is not usable, which is why the ACS county SDOH bundle
 * still sits in pending-ci. The SAIPE state-and-county release is a flat
 * public file on www2.census.gov with no key and no quota, so these values
 * are read verbatim from a published federal release rather than derived
 * by this repo.
 *
 * SAIPE is itself a model-based small-area estimate program (the Bureau's
 * own description, not this repo's judgment): it blends administrative
 * records with ACS survey data through a statistical model rather than
 * tabulating a census. That places it on the same footing as CDC/ATSDR
 * SVI's ACS-derived inputs elsewhere on this platform, which are labeled
 * MODELED - so these values are labeled MODELED too, not VERIFIED, for
 * consistency across datasets built the same way. The 90% confidence
 * bounds the Bureau publishes are carried through to provenance so a
 * reader can see the uncertainty.
 *
 * Fixed-width fields per the SAIPE record layout, county rows:
 *   state FIPS, county FIPS,
 *   poverty all ages (est, lower, upper), poverty pct all ages (est, lower, upper),
 *   poverty under 18 (est, lower, upper), pct under 18 (est, lower, upper),
 *   poverty ages 5-17 (est, lower, upper), pct ages 5-17 (est, lower, upper),
 *   median household income (est, lower, upper), county name, postal, file, date
 *
 * Run with --apply to write both files. Without --apply it prints a
 * summary. --require-live makes a failed fetch fatal instead of writing
 * the pending-ci stub.
 */
import { writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchAndRecord, writeManifest } from "./lib/ingest-manifest.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..");
const registryPath = path.join(projectRoot, "src/data/census-geographies.ts");
const outJsonPath = path.join(projectRoot, "src/data/saipe-county.generated.json");
const outTsPath = path.join(projectRoot, "src/data/saipe-county.ts");

const APPLY = process.argv.includes("--apply");
const REQUIRE_LIVE = process.argv.includes("--require-live");

/** Most recent SAIPE release first; the first year that serves a Michigan
 * file wins, so a new release is picked up by adding it to the head. */
const CANDIDATE_YEARS = [2025, 2024, 2023];
const SOURCE_LANDING = "https://www.census.gov/programs-surveys/saipe.html";
const fileUrl = (year) =>
  `https://www2.census.gov/programs-surveys/saipe/datasets/${year}/${year}-state-and-county/est${String(year).slice(2)}-mi.txt`;

const MEASURES = [
  {
    id: "povertyPct",
    label: "Population below the poverty line (all ages)",
    unit: "percent",
    field: "pct_all_ages",
  },
  {
    id: "childPovertyPct",
    label: "Children under 18 below the poverty line",
    unit: "percent",
    field: "pct_under_18",
  },
  {
    id: "schoolAgePovertyPct",
    label: "Children ages 5-17 in families below the poverty line",
    unit: "percent",
    field: "pct_ages_5_17",
  },
  {
    id: "medianHouseholdIncome",
    label: "Median household income",
    unit: "dollars",
    field: "median_household_income",
  },
];

const manifestEntries = [];
const BUILD_ID = `refresh-saipe-county-${new Date().toISOString().replace(/[:.]/g, "-")}`;

/**
 * Never regress a populated file to the pending-ci stub. dataset-refresh.yml
 * runs this script with plain --apply and commits whatever changed, so a
 * transient upstream failure (or an egress block, as in a sandboxed agent
 * session - discovered 2026-09-10 when a routine value_label relabeling run
 * silently produced an all-null stub) would otherwise replace real data
 * with nulls. If the committed file already carries real values and this
 * run could not fetch, exit non-zero and leave it untouched; the workflow
 * reports the failure and the data stays at its last good pull. Mirrors
 * refresh-cdc-svi-county.mjs's refuseToRegress.
 */
async function refuseToRegress(existingPath, reason) {
  let existing = null;
  try {
    existing = JSON.parse(await readFile(existingPath, "utf8"));
  } catch {
    return; // no committed file yet - a stub is the honest first state
  }
  if (existing?.provenance?.populated === true) {
    throw new Error(
      `Refusing to overwrite a populated ${path.basename(existingPath)} with a pending-ci stub: ${reason}`,
    );
  }
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

const num = (token) => {
  if (token === undefined) return null;
  const t = token.trim();
  if (t === "" || t === "." || t === "N" || t === "NA") return null;
  const n = Number(t.replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
};

/**
 * Parse one SAIPE Michigan release into Map<countyFips, row>. State rows
 * (county FIPS 000) are kept separately for the statewide comparison.
 */
function parseSaipe(text, year) {
  const yy = String(year).slice(2);
  // Trailing columns (postal code, file name, release date) are dropped
  // first, then the geography name is peeled off the end. The name cannot
  // be located by run-of-spaces alone: the statewide row leaves only one
  // space before "Michigan", while county rows leave many.
  const tailRe = new RegExp(`\\s+MI\\s+est${yy}-mi\\.txt.*$`);
  const rowRe = /^\s*(\d{2})\s+(\d{1,3})\s+(.*?)\s+([A-Za-z][A-Za-z.'\- ]*)$/;
  const counties = new Map();
  let state = null;
  for (const raw of text.split(/\r?\n/)) {
    if (!raw.trim()) continue;
    if (!tailRe.test(raw)) continue;
    const m = rowRe.exec(raw.replace(tailRe, ""));
    if (!m) continue;
    const stateFips = m[1];
    if (stateFips !== "26") continue;
    const countyFips = `26${m[2].padStart(3, "0")}`;
    const cells = m[3].trim().split(/\s+/);
    const name = m[4].trim().replace(/\s+County$/i, "");
    const row = {
      countyFips,
      name,
      poverty_all_ages: num(cells[0]),
      poverty_all_ages_lower: num(cells[1]),
      poverty_all_ages_upper: num(cells[2]),
      pct_all_ages: num(cells[3]),
      pct_all_ages_lower: num(cells[4]),
      pct_all_ages_upper: num(cells[5]),
      poverty_under_18: num(cells[6]),
      pct_under_18: num(cells[9]),
      pct_under_18_lower: num(cells[10]),
      pct_under_18_upper: num(cells[11]),
      pct_ages_5_17: num(cells[15]),
      median_household_income: num(cells[18]),
      median_household_income_lower: num(cells[19]),
      median_household_income_upper: num(cells[20]),
    };
    if (countyFips === "26000") state = row;
    else counties.set(countyFips, row);
  }
  return { counties, state };
}

async function fetchLatest() {
  const errors = [];
  for (const year of CANDIDATE_YEARS) {
    const url = fileUrl(year);
    try {
      const text = await fetchAndRecord({
        sourceId: `census-saipe-mi-${year}`,
        url,
        headers: {
          "user-agent": "accessmi-data-refresh",
          accept: "text/plain,*/*",
        },
        vintage: String(year),
        minBytes: 5000,
        entries: manifestEntries,
      });
      if (/<html/i.test(text.slice(0, 400))) {
        throw new Error("response was HTML, not the SAIPE fixed-width release");
      }
      const parsed = parseSaipe(text, year);
      if (parsed.counties.size < 83) {
        throw new Error(`parsed only ${parsed.counties.size} county rows`);
      }
      return { ...parsed, year, url };
    } catch (err) {
      errors.push(`${year}: ${err.message}`);
    }
  }
  throw new Error(`No SAIPE release could be read (${errors.join("; ")})`);
}

function buildRecords(miFips, parsed) {
  const records = [];
  const missing = [];
  for (const [fips, name] of [...miFips.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const row = parsed?.counties.get(fips);
    if (!row) {
      missing.push(name);
      continue;
    }
    records.push({
      countyFips: fips,
      countyName: name,
      status: "populated",
      values: {
        povertyPct: row.pct_all_ages,
        childPovertyPct: row.pct_under_18,
        schoolAgePovertyPct: row.pct_ages_5_17,
        medianHouseholdIncome: row.median_household_income,
      },
      confidence: {
        povertyPct: [row.pct_all_ages_lower, row.pct_all_ages_upper],
        childPovertyPct: [row.pct_under_18_lower, row.pct_under_18_upper],
        medianHouseholdIncome: [
          row.median_household_income_lower,
          row.median_household_income_upper,
        ],
      },
      peopleInPoverty: row.poverty_all_ages,
      childrenInPoverty: row.poverty_under_18,
      pendingReason: null,
    });
  }
  return { records, missing };
}

function buildStub(miFips, reason) {
  return [...miFips.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([fips, name]) => ({
      countyFips: fips,
      countyName: name,
      status: "pending-ci",
      values: {
        povertyPct: null,
        childPovertyPct: null,
        schoolAgePovertyPct: null,
        medianHouseholdIncome: null,
      },
      confidence: {
        povertyPct: [null, null],
        childPovertyPct: [null, null],
        medianHouseholdIncome: [null, null],
      },
      peopleInPoverty: null,
      childrenInPoverty: null,
      pendingReason: reason,
    }));
}

function buildTsShim(populated) {
  return `/**
 * Typed accessor for Census SAIPE county poverty and median household
 * income. Payload in saipe-county.generated.json; regenerated by
 * scripts/refresh-saipe-county.mjs. Do not hand-edit.
 */
import raw from "./saipe-county.generated.json";

export type SaipeMeasureId =
  | "povertyPct"
  | "childPovertyPct"
  | "schoolAgePovertyPct"
  | "medianHouseholdIncome";

export interface SaipeMeasure {
  id: SaipeMeasureId;
  label: string;
  unit: "percent" | "dollars";
  value_label: "MODELED";
}

export interface SaipeCountyRecord {
  countyFips: string;
  countyName: string;
  status: "populated" | "pending-ci";
  values: Record<SaipeMeasureId, number | null>;
  /** Census 90% confidence bounds [lower, upper] where published. */
  confidence: Record<"povertyPct" | "childPovertyPct" | "medianHouseholdIncome", (number | null)[]>;
  peopleInPoverty: number | null;
  childrenInPoverty: number | null;
  pendingReason: string | null;
}

export interface SaipeProvenance {
  source_name: string;
  source_url: string;
  download_url: string | null;
  estimate_year: number | null;
  ingested_at: string;
  ingest_script: string;
  michigan_county_registry: string;
  michigan_county_registry_size: number;
  statewide: Record<string, number | null> | null;
  value_label: "MODELED" | "PENDING";
  populated: boolean;
  pending_reason: string | null;
  notes: string;
}

interface Payload {
  provenance: SaipeProvenance;
  measures: SaipeMeasure[];
  counties: SaipeCountyRecord[];
}

const payload = raw as Payload;

export const SAIPE_PROVENANCE: SaipeProvenance = payload.provenance;
export const SAIPE_MEASURES: readonly SaipeMeasure[] = payload.measures;
export const SAIPE_COUNTY_RECORDS: readonly SaipeCountyRecord[] = payload.counties;

const BY_FIPS = new Map<string, SaipeCountyRecord>(payload.counties.map((c) => [c.countyFips, c]));
const BY_NAME = new Map<string, SaipeCountyRecord>(payload.counties.map((c) => [c.countyName, c]));

export function getSaipeForCountyFips(fips: string): SaipeCountyRecord | null {
  return BY_FIPS.get(fips) ?? null;
}

export function getSaipeForCountyName(name: string): SaipeCountyRecord | null {
  return BY_NAME.get(name.replace(/\\s+County$/i, "").trim()) ?? null;
}

/** One measure for one county, or null while pending or unpublished. */
export function getSaipeValue(countyName: string, measureId: SaipeMeasureId): number | null {
  const rec = getSaipeForCountyName(countyName);
  if (!rec || rec.status !== "populated") return null;
  return rec.values[measureId] ?? null;
}

/** Michigan statewide figures from the same release, for benchmarking. */
export const SAIPE_STATEWIDE = payload.provenance.statewide;

/** Vintage label for point-of-use citation, e.g. "SAIPE 2024". */
export function saipeVintageLabel(): string {
  return payload.provenance.estimate_year ? \`SAIPE \${payload.provenance.estimate_year}\` : "pending first pull";
}

export const SAIPE_IS_POPULATED = ${populated};
`;
}

async function main() {
  const miFips = await loadMiCountyFips();
  console.log(`[refresh-saipe-county] MI counties in registry: ${miFips.size}`);

  let parsed = null;
  let populated = false;
  let pendingReason = null;
  try {
    parsed = await fetchLatest();
    populated = true;
  } catch (err) {
    if (REQUIRE_LIVE) throw err;
    pendingReason = `Could not fetch or parse the SAIPE release (${err.message}). Re-run on build-data.yml to populate.`;
  }

  let records;
  if (populated) {
    const built = buildRecords(miFips, parsed);
    if (built.missing.length > 0) {
      const reason = `SAIPE ${parsed.year} had no row for ${built.missing.length} counties: ${built.missing.join(", ")}`;
      if (REQUIRE_LIVE) throw new Error(reason);
      populated = false;
      pendingReason = reason;
    } else {
      records = built.records;
    }
  }
  if (!populated) {
    await refuseToRegress(outJsonPath, pendingReason);
    console.warn(`[refresh-saipe-county] ${pendingReason}`);
    records = buildStub(miFips, pendingReason);
  }

  if (records.length !== 83) throw new Error(`Sanity: county count ${records.length} != 83.`);
  if (populated) {
    for (const r of records) {
      const p = r.values.povertyPct;
      const inc = r.values.medianHouseholdIncome;
      if (p === null) throw new Error(`Sanity: ${r.countyName} has no published poverty rate.`);
      if (p <= 0 || p > 60) throw new Error(`Sanity: ${r.countyName} poverty ${p}% outside 0-60.`);
      if (inc !== null && (inc < 15000 || inc > 250000)) {
        throw new Error(`Sanity: ${r.countyName} median income ${inc} outside 15k-250k.`);
      }
    }
    console.log(`[refresh-saipe-county] SAIPE ${parsed.year}; first 3 counties:`);
    for (const r of records.slice(0, 3)) {
      console.log(
        `  ${r.countyFips} ${r.countyName}  poverty=${r.values.povertyPct}%  child=${r.values.childPovertyPct}%  income=$${r.values.medianHouseholdIncome}`,
      );
    }
  }

  const st = parsed?.state ?? null;
  const payload = {
    provenance: {
      source_name: "U.S. Census Bureau Small Area Income and Poverty Estimates (SAIPE), state and county",
      source_url: SOURCE_LANDING,
      download_url: parsed?.url ?? null,
      estimate_year: parsed?.year ?? null,
      ingested_at: new Date().toISOString(),
      ingest_script: "scripts/refresh-saipe-county.mjs",
      michigan_county_registry: "src/data/census-geographies.ts",
      michigan_county_registry_size: miFips.size,
      statewide: st
        ? {
            povertyPct: st.pct_all_ages,
            childPovertyPct: st.pct_under_18,
            schoolAgePovertyPct: st.pct_ages_5_17,
            medianHouseholdIncome: st.median_household_income,
          }
        : null,
      value_label: populated ? "MODELED" : "PENDING",
      populated,
      pending_reason: pendingReason,
      notes:
        "Values are the Census Bureau's published SAIPE county estimates read from the fixed-width state-and-county release; this repo performs no modeling and no rescaling of its own. SAIPE is itself a model-based program, so each value ships with the Bureau's own 90% confidence bounds, and is labeled MODELED for consistency with this platform's other small-area statistical estimates (e.g. CDC/ATSDR SVI). No API key is used or required. A suppressed or unpublished cell becomes null, never zero.",
    },
    measures: MEASURES.map((m) => ({
      id: m.id,
      label: m.label,
      unit: m.unit,
      value_label: "MODELED",
    })),
    counties: records,
  };

  if (!APPLY) {
    console.log(
      `\n[refresh-saipe-county] dry-run. Re-run with --apply to write ${path.relative(projectRoot, outJsonPath)} + ${path.relative(projectRoot, outTsPath)}.`,
    );
    return;
  }
  await writeFile(outJsonPath, JSON.stringify(payload, null, 2) + "\n", "utf8");
  await writeFile(outTsPath, buildTsShim(populated ? "true" : "false"), "utf8");
  console.log(
    `\n[refresh-saipe-county] wrote ${path.relative(projectRoot, outJsonPath)} (83 counties, populated=${populated}) and ${path.relative(projectRoot, outTsPath)}.`,
  );

  if (manifestEntries.length > 0) {
    const manifestPath = await writeManifest({ projectRoot, buildId: BUILD_ID, entries: manifestEntries });
    console.log(`  archival manifest: ${path.relative(projectRoot, manifestPath)}`);
  }
}

main().catch(async (err) => {
  console.error("[refresh-saipe-county] failed:", err);
  if (manifestEntries.length > 0) {
    try {
      await writeManifest({ projectRoot, buildId: BUILD_ID, entries: manifestEntries });
    } catch {
      /* manifest is advisory here; the ingest failure is what matters */
    }
  }
  process.exit(1);
});
