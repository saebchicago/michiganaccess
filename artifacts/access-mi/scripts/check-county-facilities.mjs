#!/usr/bin/env node
/**
 * County-facility integrity check.
 *
 * Reads the static facility seed (`src/data/mockFacilities.ts`) and the
 * county profile registry (`src/data/michigan-county-profiles.ts`),
 * prints per-county facility counts, and flags counties whose count
 * deviates from a reference list of canonical minimums.
 *
 * The live production count comes from Supabase at runtime; this script
 * only audits the static fallback so an offline reviewer can spot
 * places where the seed data is obviously thin. A divergence here
 * almost certainly mirrors a divergence in the live data — which is
 * what the cross-validated audit found for Saginaw (1 in platform vs
 * 5+ from MDHHS).
 */
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..");
const facilitiesPath = path.join(
  projectRoot,
  "src/data/mockFacilities.ts",
);
const profilesPath = path.join(
  projectRoot,
  "src/data/michigan-county-profiles.ts",
);

/**
 * Path to a verified MDHHS / LARA county-by-county facility-count
 * extract. When this file exists, the script fails the build for any
 * county whose seed count is below the verified value. Until the
 * owner-triggered data PR lands the file, the script prints a notice
 * and exits 0 so it can still ship as a guard.
 */
const REFERENCE_PATH = path.join(
  projectRoot,
  "src/data/countyFacilityReference.json",
);

async function main() {
  const facilitiesSrc = await readFile(facilitiesPath, "utf8");
  const profilesSrc = await readFile(profilesPath, "utf8");

  const countyNames = new Set();
  const profileRe = /^\s+([A-Z][A-Za-z'\-\s]+?):\s*\{\s*population:/gm;
  let m;
  while ((m = profileRe.exec(profilesSrc)) !== null) {
    countyNames.add(m[1].trim());
  }

  const facilityCounts = new Map();
  for (const name of countyNames) facilityCounts.set(name, 0);

  const countyFieldRe = /county:\s*"([^"]+)"/g;
  while ((m = countyFieldRe.exec(facilitiesSrc)) !== null) {
    const c = m[1].trim();
    const canonical = c.charAt(0).toUpperCase() + c.slice(1).toLowerCase();
    facilityCounts.set(canonical, (facilityCounts.get(canonical) ?? 0) + 1);
  }

  const totalFacilities = [...facilityCounts.values()].reduce(
    (a, b) => a + b,
    0,
  );
  console.log(
    `[check-county-facilities] static seed: ${facilityCounts.size} counties, ${totalFacilities} facilities total.`,
  );

  if (!existsSync(REFERENCE_PATH)) {
    console.log(
      `[check-county-facilities] notice: no reference extract at ${path.relative(projectRoot, REFERENCE_PATH)}; skipping floor check. Add the MDHHS/LARA extract to enforce.`,
    );
    return;
  }

  const reference = JSON.parse(await readFile(REFERENCE_PATH, "utf8"));
  const shortfalls = [];
  for (const [county, refCount] of Object.entries(reference)) {
    const seed = facilityCounts.get(county) ?? 0;
    if (seed < refCount) {
      shortfalls.push({ county, seed, ref: refCount, gap: refCount - seed });
    }
  }

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
