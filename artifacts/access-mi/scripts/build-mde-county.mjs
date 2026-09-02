#!/usr/bin/env node
/**
 * Build `src/data/mde-county.generated.json` from a hand-dropped county
 * export of MI School Data (Michigan Department of Education / CEPI).
 *
 * WHY A MANUAL DROP, NOT A REFRESH SCRIPT
 * mischooldata.org serves report exports from an ASP.NET report viewer
 * whose download URLs rotate every school year and are not documented as a
 * stable bulk endpoint. A scheduled fetch of such a URL would go red on
 * dataset-refresh.yml every Tuesday after the first rotation. ALICE has the
 * same shape of source (an annual publisher file with no API) and the repo
 * already settled the pattern for it: commit the slim official table as a
 * CSV, expand it with a builder, run the builder by hand when the file is
 * updated. This script follows build-alice-county.mjs exactly, with one
 * difference: it is NOT in either package.json build chain. The generated
 * file is committed, so nothing at build time depends on the builder
 * running (check-build-parity has nothing to police here).
 *
 * INPUT  src/data/mde-county-<school-year>.csv, e.g. mde-county-2024-25.csv.
 *        Columns (header row required, in this order):
 *          countyFips,countyName,schoolYear,chronicAbsenteeismPct,
 *          grade3ElaProficientPct,gradRate4yr,economicallyDisadvantagedPct,
 *          enrollment
 *        Leading comment lines (starting with #) record the export's
 *        provenance and are copied into the payload:
 *          # download_url: <the MI School Data report URL used>
 *          # download_date: YYYY-MM-DD
 *          # sha256: <sha256 of the export as downloaded>
 *        Use the COUNTY location level of each MI School Data report, not
 *        district files: districts and ISDs cross county lines, and rolling
 *        them up would force a MODELED label. County-level exports are
 *        MDE's own tabulation and ship VERIFIED.
 *        MDE suppresses cells under 10 students. Leave such cells empty or
 *        write "<10"; they become null with the measure listed in
 *        `suppressed`, never 0.
 *
 * OUTPUT src/data/mde-county.generated.json. When no CSV is present the
 *        builder writes the pending-ci stub (83 counties, every value null,
 *        value_label PENDING) so the platform compiles and renders the
 *        coverage state honestly. The newest school year wins when several
 *        CSVs exist.
 *
 * Run with --apply to write; without it, the builder prints a summary.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.join(root, "src/data");
const registryPath = path.join(dataDir, "census-geographies.ts");
const outPath = path.join(dataDir, "mde-county.generated.json");
const APPLY = process.argv.includes("--apply");

const SOURCE_NAME =
  "Michigan Department of Education / CEPI, MI School Data county reports";
const SOURCE_URL = "https://www.mischooldata.org/";
const SUPPRESSION_RULE =
  "MDE suppresses cells under 10 students. Suppressed measures are null and named in `suppressed`; they are never rendered as 0.";

export const MEASURES = [
  {
    id: "chronicAbsenteeismPct",
    label: "Chronically absent students (missed 10%+ of school days)",
    report: "Student Attendance / Chronic Absenteeism",
  },
  {
    id: "grade3ElaProficientPct",
    label: "3rd graders proficient or advanced, M-STEP English language arts",
    report: "M-STEP Assessment Results, grade 3 ELA",
  },
  {
    id: "gradRate4yr",
    label: "Four-year cohort graduation rate",
    report: "Graduation / Dropout Rate",
  },
  {
    id: "economicallyDisadvantagedPct",
    label: "Students flagged economically disadvantaged",
    report: "Student Counts, economically disadvantaged",
  },
];

function loadMiCountyFips() {
  const src = fs.readFileSync(registryPath, "utf8");
  const start = src.indexOf("MI_COUNTY_FIPS");
  const open = src.indexOf("{", start);
  const close = src.indexOf("}", open);
  const body = src.slice(open + 1, close);
  const fips = new Map();
  const re = /(?:"([^"]+)"|(\b[A-Z][\w. ]*))\s*:\s*"(\d{3})"/g;
  let m;
  while ((m = re.exec(body)) !== null) fips.set(`26${m[3]}`, (m[1] ?? m[2]).trim());
  if (fips.size !== 83) throw new Error(`expected 83 counties in registry, got ${fips.size}`);
  return fips;
}

function findNewestCsv() {
  const files = fs
    .readdirSync(dataDir)
    .filter((f) => /^mde-county-\d{4}-\d{2}\.csv$/.test(f))
    .sort();
  return files.length ? path.join(dataDir, files[files.length - 1]) : null;
}

function parseCsvWithComments(text) {
  const meta = {};
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const body = [];
  for (const line of lines) {
    if (line.startsWith("#")) {
      const m = /^#\s*([\w-]+)\s*:\s*(.+)$/.exec(line);
      if (m) meta[m[1]] = m[2].trim();
      continue;
    }
    body.push(line);
  }
  const header = body.shift().split(",").map((h) => h.trim());
  const rows = body.map((line) => {
    const cols = line.split(",");
    const row = {};
    header.forEach((k, i) => (row[k] = (cols[i] ?? "").trim()));
    return row;
  });
  return { meta, header, rows };
}

function cell(raw, id, suppressed) {
  if (raw === "" || raw === "<10" || /^suppress/i.test(raw) || raw === "*") {
    suppressed.push(id);
    return null;
  }
  const n = Number(raw);
  if (!Number.isFinite(n)) throw new Error(`non-numeric ${id} value "${raw}"`);
  if (n < 0 || n > 100) throw new Error(`${id} ${n} outside [0, 100]`);
  return Math.round(n * 10) / 10;
}

function stubCounties(miFips, reason) {
  return [...miFips.entries()].sort().map(([countyFips, countyName]) => ({
    countyFips,
    countyName,
    status: "pending-ci",
    schoolYear: null,
    values: Object.fromEntries(MEASURES.map((m) => [m.id, null])),
    suppressed: [],
    enrollment: null,
    pendingReason: reason,
  }));
}

function buildFromCsv(csvPath, miFips) {
  const { meta, header, rows } = parseCsvWithComments(fs.readFileSync(csvPath, "utf8"));
  const expected = ["countyFips", "countyName", "schoolYear", ...MEASURES.map((m) => m.id), "enrollment"];
  if (header.join(",") !== expected.join(",")) {
    throw new Error(`CSV header must be exactly: ${expected.join(",")}`);
  }
  for (const k of ["download_url", "download_date", "sha256"]) {
    if (!meta[k]) throw new Error(`CSV is missing the "# ${k}:" provenance comment line`);
  }
  if (rows.length !== 83) throw new Error(`expected 83 county rows, got ${rows.length}`);
  const years = new Set(rows.map((r) => r.schoolYear));
  if (years.size !== 1) throw new Error(`schoolYear must be uniform; found ${[...years].join(", ")}`);
  const schoolYear = [...years][0];
  if (!/^\d{4}-\d{2}$/.test(schoolYear)) throw new Error(`schoolYear "${schoolYear}" must look like 2024-25`);

  const seen = new Set();
  const counties = rows.map((r) => {
    if (!miFips.has(r.countyFips)) throw new Error(`unknown countyFips ${r.countyFips}`);
    if (miFips.get(r.countyFips) !== r.countyName) {
      throw new Error(`countyName "${r.countyName}" does not match registry for ${r.countyFips} (${miFips.get(r.countyFips)})`);
    }
    if (seen.has(r.countyFips)) throw new Error(`duplicate row for ${r.countyFips}`);
    seen.add(r.countyFips);
    const suppressed = [];
    const values = Object.fromEntries(MEASURES.map((m) => [m.id, cell(r[m.id], m.id, suppressed)]));
    const enrollment = r.enrollment === "" ? null : Number(r.enrollment);
    if (enrollment !== null && (!Number.isInteger(enrollment) || enrollment < 0)) {
      throw new Error(`enrollment "${r.enrollment}" for ${r.countyName} is not a non-negative integer`);
    }
    return {
      countyFips: r.countyFips,
      countyName: r.countyName,
      status: suppressed.length === 0 ? "populated" : "partial",
      schoolYear,
      values,
      suppressed,
      enrollment,
      pendingReason: null,
    };
  });
  return { counties, schoolYear, meta, csvName: path.basename(csvPath) };
}

const miFips = loadMiCountyFips();
const csvPath = findNewestCsv();
let counties;
let populated = false;
let schoolYear = null;
let meta = {};
let csvName = null;
let pendingReason = null;
if (csvPath) {
  ({ counties, schoolYear, meta, csvName } = buildFromCsv(csvPath, miFips));
  populated = true;
} else {
  pendingReason =
    "No src/data/mde-county-<school-year>.csv has been dropped yet. Export the county-level MI School Data reports, add the file with its provenance comment lines, and run scripts/build-mde-county.mjs --apply.";
  counties = stubCounties(miFips, pendingReason);
}

const payload = {
  provenance: {
    source_name: SOURCE_NAME,
    source_url: SOURCE_URL,
    publisher: "Michigan Department of Education / Center for Educational Performance and Information (CEPI)",
    school_year: schoolYear,
    source_csv: csvName,
    download_url: meta.download_url ?? null,
    download_date: meta.download_date ?? null,
    file_sha256: meta.sha256 ?? null,
    ingested_at: new Date().toISOString().slice(0, 10),
    ingest_script: "scripts/build-mde-county.mjs",
    michigan_county_registry: "src/data/census-geographies.ts",
    michigan_county_registry_size: 83,
    value_label: populated ? "VERIFIED" : "PENDING",
    populated,
    pending_reason: pendingReason,
    suppression_rule: SUPPRESSION_RULE,
    notes:
      "County-level MI School Data report exports are MDE's own tabulations and ship VERIFIED. District and ISD files are deliberately not rolled up to counties (boundaries cross county lines). When status = 'pending-ci' no county export has been dropped yet; the values are null, not zero.",
  },
  measures: MEASURES.map((m) => ({ ...m, unit: "percent", value_label: "VERIFIED" })),
  counties,
};

if (!APPLY) {
  console.log(`[build-mde-county] dry-run: ${populated ? `${csvName} (${schoolYear})` : "no CSV; stub"}; re-run with --apply to write ${path.relative(root, outPath)}.`);
} else {
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2) + "\n");
  console.log(`[build-mde-county] wrote ${path.relative(root, outPath)} (83 counties, populated=${populated}${schoolYear ? `, ${schoolYear}` : ""})`);
}
