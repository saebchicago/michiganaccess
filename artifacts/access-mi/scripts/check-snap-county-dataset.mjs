#!/usr/bin/env node
/**
 * Data-integrity guard for src/data/snapCountyGenerated.json (the USDA FNS-388A
 * SNAP county participation dataset consumed by src/data/snapMichiganFallback.ts).
 *
 * Fails the build if the generated dataset is structurally wrong:
 *   - not exactly 83 Michigan counties, or any unknown / duplicate county
 *   - any FIPS not a 5-digit 26xxx code, or out of sync with the sacrosanct
 *     census-geographies.ts registry
 *   - any enrollment value that is not a positive integer (or null)
 *   - households >= persons on any row where both are present
 *   - missing enrollmentAsOf or a non-https sourceUrl
 *
 * Run by `pnpm build` and the snap-refresh workflow gate.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..");
const dataFile = path.join(projectRoot, "src/data/snapCountyGenerated.json");
const registryFile = path.join(projectRoot, "src/data/census-geographies.ts");

const errors = [];
const fail = (msg) => errors.push(msg);

// Extract the name -> 3-digit FIPS pairs from the census-geographies.ts registry
// (read as text so this guard never imports TypeScript).
async function loadRegistry() {
  const text = await readFile(registryFile, "utf8");
  const block = /MI_COUNTY_FIPS[^{]*{([\s\S]*?)}/.exec(text);
  if (!block) throw new Error("could not locate MI_COUNTY_FIPS in census-geographies.ts");
  const map = new Map();
  const pairRe = /"?([A-Za-z. ]+?)"?\s*:\s*"(\d{3})"/g;
  let m;
  while ((m = pairRe.exec(block[1]))) map.set(m[1].trim(), m[2]);
  return map;
}

async function main() {
  const registry = await loadRegistry();

  let payload;
  try {
    payload = JSON.parse(await readFile(dataFile, "utf8"));
  } catch (e) {
    console.error(`[check-snap-county] cannot read ${path.relative(projectRoot, dataFile)}: ${e.message}`);
    process.exit(1);
  }

  const counties = payload.counties;
  if (!Array.isArray(counties)) {
    console.error("[check-snap-county] payload.counties is not an array");
    process.exit(1);
  }

  if (counties.length !== 83) fail(`expected 83 counties, found ${counties.length}`);

  const seenNames = new Set();
  const seenFips = new Set();
  for (const c of counties) {
    if (seenNames.has(c.county)) fail(`duplicate county name: ${c.county}`);
    seenNames.add(c.county);
    if (seenFips.has(c.fips)) fail(`duplicate FIPS: ${c.fips}`);
    seenFips.add(c.fips);

    if (!/^26\d{3}$/.test(c.fips)) fail(`${c.county}: FIPS "${c.fips}" is not a 26xxx code`);

    const regCode = registry.get(c.county);
    if (!regCode) {
      fail(`${c.county}: not a recognized Michigan county (per census-geographies.ts)`);
    } else if (`26${regCode}` !== c.fips) {
      fail(`${c.county}: FIPS ${c.fips} disagrees with registry (expected 26${regCode})`);
    }

    for (const k of ["enrollmentTotal", "enrollmentHouseholds"]) {
      const v = c[k];
      if (v !== null && !(Number.isInteger(v) && v > 0)) {
        fail(`${c.county}: ${k} ${v} is not a positive integer or null`);
      }
    }
    if (
      c.enrollmentTotal !== null &&
      c.enrollmentHouseholds !== null &&
      c.enrollmentHouseholds >= c.enrollmentTotal
    ) {
      fail(`${c.county}: households (${c.enrollmentHouseholds}) >= persons (${c.enrollmentTotal})`);
    }

    if (!c.enrollmentAsOf || String(c.enrollmentAsOf).trim().length === 0) {
      fail(`${c.county}: missing enrollmentAsOf`);
    }
    if (!/^https:\/\//.test(c.sourceUrl || "")) {
      fail(`${c.county}: sourceUrl "${c.sourceUrl}" is not an https URL`);
    }
  }

  // Every registry county must be present.
  for (const name of registry.keys()) {
    if (!seenNames.has(name)) fail(`registry county missing from dataset: ${name}`);
  }

  if (errors.length > 0) {
    console.error(`[check-snap-county] FAILED with ${errors.length} issue(s):`);
    for (const e of errors) console.error("  - " + e);
    process.exit(1);
  }
  console.log(`[check-snap-county] OK - 83 counties, vintage ${payload.provenance?.vintage ?? "?"}`);
}

main().catch((err) => {
  console.error("[check-snap-county] failed:", err.message);
  process.exit(1);
});
