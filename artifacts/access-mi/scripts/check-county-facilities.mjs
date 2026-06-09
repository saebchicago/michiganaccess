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
 * Counties whose canonical facility count is publicly known and where
 * a static seed below the floor is a likely indicator of a data gap.
 * Update if MDHHS / HRSA / CMS counts change.
 */
const FACILITY_FLOOR = {
  Saginaw: 5,
  Wayne: 30,
  Oakland: 25,
  Kent: 10,
  Macomb: 15,
  Washtenaw: 8,
};

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

  console.log(
    `[check-county-facilities] static seed: ${facilityCounts.size} counties, ${[...facilityCounts.values()].reduce((a, b) => a + b, 0)} facilities total.`,
  );
  console.log("[check-county-facilities] per-county counts below floor:");

  let flagged = 0;
  for (const [county, floor] of Object.entries(FACILITY_FLOOR)) {
    const seed = facilityCounts.get(county) ?? 0;
    if (seed < floor) {
      console.log(
        `  ${county}: seed=${seed}, MDHHS-floor=${floor}, gap=${floor - seed}`,
      );
      flagged++;
    }
  }
  if (flagged === 0) {
    console.log("  none — every floor-checked county meets its minimum.");
  }
}

main().catch((err) => {
  console.error("[check-county-facilities] failed:", err);
  process.exit(1);
});
