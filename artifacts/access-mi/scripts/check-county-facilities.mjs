#!/usr/bin/env node
/**
 * County-facility integrity check.
 *
 * Counts facilities per county in `src/data/verifiedHealthFacilities.json`
 * and fails the build if any county drops below the reference count in
 * `src/data/countyFacilityReference.json`. Both files come from the same
 * `scripts/build-facility-dataset.mjs` extract, so the guard catches
 * accidental row deletion / structural change between refreshes.
 *
 * Also validates `countyFacilityReference.json`'s `breakdown` field (added
 * 2026-09-09 alongside the hospital / health-center-site split rendered on
 * the county brief): every reference county must carry a breakdown entry
 * whose hospital/fqhc counts are non-negative integers, sum to that
 * county's `counts` total, and whose statewide sums match the extract's own
 * tally by facility type. Added 2026-09-10; the breakdown shipped with no
 * guard coverage of its own.
 */
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..");
const FACILITIES_PATH = path.join(
  projectRoot,
  "src/data/verifiedHealthFacilities.json",
);
const REFERENCE_PATH = path.join(
  projectRoot,
  "src/data/countyFacilityReference.json",
);

async function main() {
  if (!existsSync(FACILITIES_PATH)) {
    console.log(
      `[check-county-facilities] notice: no verified extract at ${path.relative(projectRoot, FACILITIES_PATH)}; skipping. Run scripts/build-facility-dataset.mjs.`,
    );
    return;
  }
  if (!existsSync(REFERENCE_PATH)) {
    console.log(
      `[check-county-facilities] notice: no reference at ${path.relative(projectRoot, REFERENCE_PATH)}; skipping.`,
    );
    return;
  }

  const facilitiesPayload = JSON.parse(
    await readFile(FACILITIES_PATH, "utf8"),
  );
  const referencePayload = JSON.parse(await readFile(REFERENCE_PATH, "utf8"));
  const facilities = facilitiesPayload.facilities ?? [];
  const reference = referencePayload.counts ?? {};
  const breakdown = referencePayload.breakdown ?? {};

  const seedCounts = new Map();
  const seedTypeCounts = new Map();
  for (const f of facilities) {
    if (!f.county) continue;
    seedCounts.set(f.county, (seedCounts.get(f.county) ?? 0) + 1);
    if (f.type) seedTypeCounts.set(f.type, (seedTypeCounts.get(f.type) ?? 0) + 1);
  }

  const shortfalls = [];
  for (const [county, refCount] of Object.entries(reference)) {
    const seed = seedCounts.get(county) ?? 0;
    if (seed < refCount) {
      shortfalls.push({ county, seed, ref: refCount, gap: refCount - seed });
    }
  }

  console.log(
    `[check-county-facilities] verified extract: ${facilities.length} rows across ${seedCounts.size} counties (${facilitiesPayload.provenance?.fetched_at?.slice(0, 10) ?? "unknown vintage"}).`,
  );

  // ── Breakdown validation ────────────────────────────────────────────
  const breakdownErrors = [];
  const breakdownTotals = { hospital: 0, fqhc: 0 };

  for (const [county, refCount] of Object.entries(reference)) {
    const b = breakdown[county];
    if (!b) {
      breakdownErrors.push(`${county}: no breakdown entry (reference count ${refCount})`);
      continue;
    }
    for (const key of ["hospital", "fqhc"]) {
      const v = b[key];
      if (!Number.isInteger(v) || v < 0) {
        breakdownErrors.push(`${county}: breakdown.${key} is ${JSON.stringify(v)}, expected a non-negative integer`);
      }
    }
    if (Number.isInteger(b.hospital) && Number.isInteger(b.fqhc)) {
      breakdownTotals.hospital += b.hospital;
      breakdownTotals.fqhc += b.fqhc;
      const sum = b.hospital + b.fqhc;
      if (sum !== refCount) {
        breakdownErrors.push(
          `${county}: breakdown hospital(${b.hospital}) + fqhc(${b.fqhc}) = ${sum}, but counts["${county}"] = ${refCount}`,
        );
      }
    }
  }

  for (const type of ["hospital", "fqhc"]) {
    const extractTotal = seedTypeCounts.get(type) ?? 0;
    if (breakdownTotals[type] !== extractTotal) {
      breakdownErrors.push(
        `statewide ${type}: breakdown sums to ${breakdownTotals[type]} but the verified extract has ${extractTotal} rows of type "${type}"`,
      );
    }
  }

  if (breakdownErrors.length > 0) {
    console.error(
      `[check-county-facilities] FAIL - ${breakdownErrors.length} breakdown error(s):`,
    );
    for (const e of breakdownErrors) console.error(`  ${e}`);
  } else {
    console.log(
      `[check-county-facilities] ok - breakdown reconciles: ${breakdownTotals.hospital} hospital + ${breakdownTotals.fqhc} fqhc rows across ${Object.keys(breakdown).length} counties.`,
    );
  }

  if (shortfalls.length === 0 && breakdownErrors.length === 0) {
    console.log(
      `[check-county-facilities] ok - every county meets its reference count.`,
    );
    return;
  }

  if (shortfalls.length > 0) {
    console.error(
      `[check-county-facilities] FAIL - ${shortfalls.length} county(ies) below the verified reference:`,
    );
    for (const s of shortfalls) {
      console.error(
        `  ${s.county}: seed=${s.seed}, reference=${s.ref}, gap=${s.gap}`,
      );
    }
  }
  process.exit(1);
}

main().catch((err) => {
  console.error("[check-county-facilities] failed:", err);
  process.exit(1);
});
