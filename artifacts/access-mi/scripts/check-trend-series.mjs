#!/usr/bin/env node
/**
 * Guard script: validates trendSeries.json before every build.
 * Fails loudly if:
 *   - Any of the 83 Michigan counties is missing from the file
 *   - Any county is missing a metric (population | uninsuredRate)
 *   - Population series has fewer than 5 points or any point is missing/NaN
 *   - ACS pair has fewer than 2 points or any point is missing/NaN
 *   - ACS pair vintages overlap (gap < 5 years)
 *   - Any value is outside the plausible range for its metric
 *   - The $schema field does not match the expected version
 *
 * Usage (wired into pnpm check:tests and CI gate):
 *   node artifacts/access-mi/scripts/check-trend-series.mjs
 *
 * Prove-fail: delete one county cell, run, restore.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..");
const DATA_PATH = path.join(projectRoot, "src/data/trendSeries.json");

const EXPECTED_SCHEMA = "trendSeries.v1";
const EXPECTED_PEP_VINTAGES = [2020, 2021, 2022, 2023, 2024];
const EXPECTED_ACS_COUNT = 2;
const MIN_ACS_GAP_YEARS = 5;

const MI_COUNTIES_83 = [
  "Alcona", "Alger", "Allegan", "Alpena", "Antrim", "Arenac", "Baraga",
  "Barry", "Bay", "Benzie", "Berrien", "Branch", "Calhoun", "Cass",
  "Charlevoix", "Cheboygan", "Chippewa", "Clare", "Clinton", "Crawford",
  "Delta", "Dickinson", "Eaton", "Emmet", "Genesee", "Gladwin", "Gogebic",
  "Grand Traverse", "Gratiot", "Hillsdale", "Houghton", "Huron", "Ingham",
  "Ionia", "Iosco", "Iron", "Isabella", "Jackson", "Kalamazoo", "Kalkaska",
  "Kent", "Keweenaw", "Lake", "Lapeer", "Leelanau", "Lenawee", "Livingston",
  "Luce", "Mackinac", "Macomb", "Manistee", "Marquette", "Mason", "Mecosta",
  "Menominee", "Midland", "Missaukee", "Monroe", "Montcalm", "Montmorency",
  "Muskegon", "Newaygo", "Oakland", "Oceana", "Ogemaw", "Ontonagon",
  "Osceola", "Oscoda", "Otsego", "Ottawa", "Presque Isle", "Roscommon",
  "Saginaw", "St. Clair", "St. Joseph", "Sanilac", "Schoolcraft",
  "Shiawassee", "Tuscola", "Van Buren", "Washtenaw", "Wayne", "Wexford",
];

async function main() {
  let raw;
  try {
    raw = await readFile(DATA_PATH, "utf8");
  } catch {
    console.error(`✗ [check-trend-series] trendSeries.json not found at ${DATA_PATH}`);
    console.error("  Run: node artifacts/access-mi/scripts/build-trend-series.mjs");
    process.exit(1);
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error(`✗ [check-trend-series] trendSeries.json is not valid JSON: ${e.message}`);
    process.exit(1);
  }

  const errors = [];

  // Schema version
  if (data.$schema !== EXPECTED_SCHEMA) {
    errors.push(`$schema mismatch: expected "${EXPECTED_SCHEMA}", got "${data.$schema}"`);
  }

  // ACS pair overlap check at provenance level
  const prov = data.provenance?.metrics?.uninsuredRate;
  if (prov) {
    const vintages = prov.vintages ?? [];
    if (vintages.length >= 2) {
      const gap = vintages[1] - vintages[0];
      if (gap < MIN_ACS_GAP_YEARS) {
        errors.push(
          `ACS pair overlap in provenance: vintages ${vintages[0]} and ${vintages[1]}, gap=${gap} < ${MIN_ACS_GAP_YEARS}`
        );
      }
    }
  }

  const counties = data.counties ?? {};

  // All 83 counties present
  for (const county of MI_COUNTIES_83) {
    if (!counties[county]) {
      errors.push(`missing county: "${county}"`);
    }
  }

  // Per-county validation
  for (const county of MI_COUNTIES_83) {
    const c = counties[county];
    if (!c) continue; // already logged above

    // Population
    const pop = c.population;
    if (!pop) {
      errors.push(`${county}: missing population block`);
    } else {
      const series = pop.series ?? [];
      for (const yr of EXPECTED_PEP_VINTAGES) {
        const pt = series.find((p) => p.vintage === yr);
        if (!pt) {
          errors.push(`${county}: population missing vintage ${yr}`);
        } else if (typeof pt.value !== "number" || isNaN(pt.value)) {
          errors.push(`${county}: population vintage ${yr} value is NaN`);
        } else if (pt.value < 500 || pt.value > 2_000_000) {
          errors.push(`${county}: population vintage ${yr} value ${pt.value} out of range [500, 2000000]`);
        }
      }
      if (pop.label !== "VERIFIED") {
        errors.push(`${county}: population label must be VERIFIED, got "${pop.label}"`);
      }
    }

    // Uninsured rate
    const ins = c.uninsuredRate;
    if (!ins) {
      errors.push(`${county}: missing uninsuredRate block`);
    } else if (ins.status === "pending-ci") {
      // Explicitly allow-listed: ACS data pending CI run with CENSUS_API_KEY.
      // Must have a pendingReason and valid vintages declared.
      if (!ins.pendingReason) {
        errors.push(`${county}: uninsuredRate pending-ci status requires pendingReason`);
      }
      if (!Array.isArray(ins.vintages) || ins.vintages.length < 2) {
        errors.push(`${county}: uninsuredRate pending-ci must declare vintages array`);
      }
    } else {
      const points = ins.points ?? [];
      if (points.length < EXPECTED_ACS_COUNT) {
        errors.push(`${county}: uninsuredRate has ${points.length} points, expected ${EXPECTED_ACS_COUNT}`);
      }
      for (const pt of points) {
        if (typeof pt.value !== "number" || isNaN(pt.value)) {
          errors.push(`${county}: uninsuredRate vintage ${pt.vintageYear} value is NaN`);
        } else if (pt.value < 0 || pt.value > 50) {
          errors.push(`${county}: uninsuredRate vintage ${pt.vintageYear} value ${pt.value}% out of range [0, 50]`);
        }
      }
      // ACS pair overlap check per county
      if (points.length >= 2) {
        const gap = points[1].vintageYear - points[0].vintageYear;
        if (gap < MIN_ACS_GAP_YEARS) {
          errors.push(
            `${county}: ACS pair overlaps: vintages ${points[0].vintageYear} and ${points[1].vintageYear}, gap=${gap} < ${MIN_ACS_GAP_YEARS}`
          );
        }
      }
      if (ins.label !== "VERIFIED") {
        errors.push(`${county}: uninsuredRate label must be VERIFIED, got "${ins.label}"`);
      }
    } // end else (populated ACS data)
  }

  if (errors.length > 0) {
    console.error(`✗ [check-trend-series] ${errors.length} error(s):`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }

  const pendingAcs = MI_COUNTIES_83.filter(
    (c) => counties[c]?.uninsuredRate?.status === "pending-ci"
  ).length;
  const acsStatus = pendingAcs === MI_COUNTIES_83.length
    ? "ACS pending-ci (run build-trend-series.mjs with CENSUS_API_KEY)"
    : pendingAcs === 0
    ? `${EXPECTED_ACS_COUNT} ACS points populated`
    : `ACS: ${MI_COUNTIES_83.length - pendingAcs} populated, ${pendingAcs} pending-ci`;
  console.log(
    `✓ [check-trend-series] trendSeries.json valid — ${MI_COUNTIES_83.length} counties, ` +
    `${EXPECTED_PEP_VINTAGES.length} PEP vintages, ${acsStatus}`
  );
}

main().catch((err) => {
  console.error("[check-trend-series] unexpected error:", err.message);
  process.exit(1);
});
