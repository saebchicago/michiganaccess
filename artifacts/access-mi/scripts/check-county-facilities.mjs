#!/usr/bin/env node
/**
 * County-facility integrity check.
 *
 * Counts facilities per county in `src/data/verifiedHealthFacilities.json`
 * and fails the build if any county drops below the reference count in
 * `src/data/countyFacilityReference.json`. Both files come from the same
 * `scripts/build-facility-dataset.mjs` extract, so the guard catches
 * accidental row deletion / structural change between refreshes.
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

  const seedCounts = new Map();
  for (const f of facilities) {
    if (!f.county) continue;
    seedCounts.set(f.county, (seedCounts.get(f.county) ?? 0) + 1);
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

  if (shortfalls.length === 0) {
    console.log(
      `[check-county-facilities] ok — every county meets its reference count.`,
    );
    return;
  }

  console.error(
    `[check-county-facilities] FAIL — ${shortfalls.length} county(ies) below the verified reference:`,
  );
  for (const s of shortfalls) {
    console.error(
      `  ${s.county}: seed=${s.seed}, reference=${s.ref}, gap=${s.gap}`,
    );
  }
  process.exit(1);
}

main().catch((err) => {
  console.error("[check-county-facilities] failed:", err);
  process.exit(1);
});
