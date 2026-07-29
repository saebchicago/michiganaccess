#!/usr/bin/env node
/**
 * Arithmetic plausibility guard.
 *
 * Every other guard in this repo checks that a number is *labeled* and
 * *sourced*. None of them ever asked whether the number is *possible*.
 * That gap is how the homepage came to advertise "24,282,165 residents in
 * an underserved area" in a state of 10.1 million, and a Wayne County
 * primary-care shortage of 7,283 FTE against a county that warrants roughly
 * 512 (docs/audit-2026-07.md, D8). Every existing guard passed: the value
 * carried a MODELED pill, a named federal source, and a vintage. It was
 * simply impossible.
 *
 * The root cause was aggregation, not ingestion. HRSA designations overlap,
 * so summing their populations counts the same residents many times. This
 * guard therefore checks magnitudes against Michigan's real population,
 * county by county and statewide.
 *
 * Two rule families, both anchored to VERIFIED Census PEP county
 * populations in src/data/trendSeries.json:
 *
 *   POPULATION-SCALE  fields named like population / households / residents
 *                     / persons / people. No county may report more than its
 *                     own population, and the 83-county sum may not exceed
 *                     the state.
 *
 *   STAFFING-SCALE    fields named like *Fte. Capped at 1 clinician per 500
 *                     residents. The conventional HPSA primary-care
 *                     benchmark is 1:3500, so 1:500 is about seven times
 *                     more generous - tripping it means the data is broken,
 *                     not merely unusual.
 *
 * ESCAPE HATCH. A dataset may declare provenance.non_additive_fields, a list
 * of leaf field names that are known not to be real counts of people or
 * staff - typically because the upstream records overlap. Declared fields
 * are exempted and reported in the build log, so the fact stays
 * machine-readable rather than living only in a code comment. Declaring a
 * field is a deliberate, reviewable act; forgetting to fix one is not.
 *
 * Anything undeclared that breaches a bound fails the build.
 *
 * Run via: node scripts/check-plausibility.mjs
 */

import { readFileSync, readdirSync, existsSync } from "fs";
import { join, relative, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DATA_DIR = join(ROOT, "src", "data");

/** Absorbs vintage drift (an ACS 2019-2023 field measured against PEP 2024). */
const TOLERANCE = 1.1;

/** Generous ceiling: 7x the conventional 1:3500 HPSA primary-care benchmark. */
const RESIDENTS_PER_CLINICIAN_FLOOR = 500;

const POPULATION_FIELD = /population|households|residents|persons|people/i;
const STAFFING_FIELD = /fte$/i;

/** Datasets not matching *.generated.json that still carry county records. */
const EXTRA_DATASETS = ["snapCountyGenerated.json"];

let failures = 0;
const exempted = [];

function fail(msg) {
  console.error(`[check-plausibility] FAIL ${msg}`);
  failures++;
}

/** Latest-vintage PEP population per county, plus the state total. */
function loadCountyPopulations() {
  const path = join(DATA_DIR, "trendSeries.json");
  const parsed = JSON.parse(readFileSync(path, "utf8"));
  const byCounty = new Map();
  for (const [countyName, metrics] of Object.entries(parsed.counties ?? {})) {
    const series = metrics?.population?.series;
    if (!Array.isArray(series) || series.length === 0) continue;
    const latest = series.reduce((a, b) => (b.vintage > a.vintage ? b : a));
    byCounty.set(countyName.toLowerCase(), latest.value);
  }
  let statewide = 0;
  for (const v of byCounty.values()) statewide += v;
  return { byCounty, statewide };
}

/** Collect numeric leaves as [dottedPath, leafKey, value]. */
function numericLeaves(node, prefix = "") {
  const out = [];
  if (node === null || typeof node !== "object") return out;
  for (const [key, value] of Object.entries(node)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "number" && Number.isFinite(value)) {
      out.push([path, key, value]);
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      out.push(...numericLeaves(value, path));
    }
  }
  return out;
}

function checkDataset(fileName, populations) {
  const filePath = join(DATA_DIR, fileName);
  if (!existsSync(filePath)) return;

  let parsed;
  try {
    parsed = JSON.parse(readFileSync(filePath, "utf8"));
  } catch (err) {
    fail(`${fileName} - could not parse JSON: ${err.message}`);
    return;
  }

  const counties = parsed.counties;
  if (!Array.isArray(counties) || counties.length === 0) return;

  const rel = relative(ROOT, filePath).replace(/\\/g, "/");
  const declared = new Set(parsed.provenance?.non_additive_fields ?? []);
  const statewideSums = new Map();

  for (const county of counties) {
    const countyName = county.countyName;
    if (typeof countyName !== "string") continue;
    const countyPop = populations.byCounty.get(countyName.toLowerCase());

    for (const [path, key, value] of numericLeaves(county)) {
      const isPopulation = POPULATION_FIELD.test(key);
      const isStaffing = STAFFING_FIELD.test(key);
      if (!isPopulation && !isStaffing) continue;

      if (declared.has(key)) {
        exempted.push(`${rel}: ${key}`);
        continue;
      }

      statewideSums.set(path, (statewideSums.get(path) ?? 0) + value);

      if (countyPop === undefined) continue;

      if (isPopulation && value > countyPop * TOLERANCE) {
        fail(
          `${rel} - ${countyName} County reports ${value.toLocaleString()} for "${path}", ` +
            `but the county's population is ${countyPop.toLocaleString()}. ` +
            `A count of people cannot exceed the people who live there. ` +
            `Either the value is wrong, or the field is not a real population ` +
            `count and belongs in provenance.non_additive_fields.`,
        );
      }

      if (isStaffing) {
        const ceiling = countyPop / RESIDENTS_PER_CLINICIAN_FLOOR;
        if (value > ceiling) {
          fail(
            `${rel} - ${countyName} County reports ${value.toLocaleString()} for "${path}", ` +
              `which is more than one clinician per ${RESIDENTS_PER_CLINICIAN_FLOOR} residents ` +
              `(ceiling ${Math.round(ceiling).toLocaleString()} for a population of ` +
              `${countyPop.toLocaleString()}). Overlapping source records are the usual cause. ` +
              `Either the value is wrong, or the field belongs in provenance.non_additive_fields.`,
          );
        }
      }
    }
  }

  for (const [path, sum] of statewideSums) {
    const key = path.split(".").pop();
    if (!POPULATION_FIELD.test(key)) continue;
    if (sum > populations.statewide * TOLERANCE) {
      fail(
        `${rel} - "${path}" sums to ${Math.round(sum).toLocaleString()} across all counties, ` +
          `but Michigan's population is ${populations.statewide.toLocaleString()}. ` +
          `Summing this field double-counts. Either the aggregation is wrong, or the ` +
          `field belongs in provenance.non_additive_fields.`,
      );
    }
  }
}

function main() {
  const populations = loadCountyPopulations();
  if (populations.byCounty.size === 0) {
    fail("could not load county populations from trendSeries.json");
    process.exit(1);
  }

  const files = readdirSync(DATA_DIR)
    .filter((f) => f.endsWith(".generated.json"))
    .concat(EXTRA_DATASETS);

  for (const file of files) checkDataset(file, populations);

  if (exempted.length > 0) {
    console.log(
      `[check-plausibility] ${exempted.length} field(s) exempted via provenance.non_additive_fields:`,
    );
    for (const e of [...new Set(exempted)]) console.log(`    ${e}`);
  }

  if (failures > 0) {
    console.error(
      `\n[check-plausibility] ${failures} implausible figure(s). A number that exceeds ` +
        `the population it describes is wrong no matter how well it is labeled.`,
    );
    process.exit(1);
  }

  console.log(
    `[check-plausibility] ok - county and statewide magnitudes are consistent with ` +
      `${populations.statewide.toLocaleString()} Michigan residents across ` +
      `${populations.byCounty.size} counties.`,
  );
}

main();
