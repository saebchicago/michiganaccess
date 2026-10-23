#!/usr/bin/env node
/**
 * Refresh `src/data/usda-fara-county.generated.json` from the USDA ERS
 * Food Access Research Atlas (FARA) 2019 tract layer.
 *
 * USDA publishes FARA at the census-tract level only. Every county figure
 * written here is a sum (or count) of USDA tract values, so every field is
 * labeled MODELED in the provenance block, per the "county rollups are
 * MODELED unless the publisher ships the county figure" rule.
 *
 * Measure: USDA's "1 and 10" low-access definition. A tract is low access
 * (la1and10 = 1) when at least 500 people or 33% of residents live more than
 * 1 mile (urban tracts) or 10 miles (rural tracts) from a supermarket.
 * Low-income low-access (lilatracts_1and10) is USDA's "food desert" tract
 * flag under the same distances.
 *
 * County fields:
 *   totalTracts                     tracts in the county in FARA 2019
 *   lowAccessTracts                 count of tracts with la1and10 = 1
 *   lowAccessPct                    lowAccessTracts / totalTracts * 100
 *   lilaTracts                      count of tracts with lilatracts_1and10 = 1
 *   lowAccessPop                    sum of lapop1_10
 *   lowIncomeLowAccessPop           sum of lalowi1_10
 *   seniorLowAccessPop              sum of laseniors1 (urban) / laseniors10 (rural)
 *   noVehicleLowAccessHousingUnits  sum of lahunv1 (urban) / lahunv10 (rural)
 *
 * USDA leaves count fields blank on tracts it did not flag; blanks are summed
 * as zero. Tract population figures are 2010 Census based (FARA 2019 design).
 *
 * Source (primary, keyless ArcGIS REST service run by USDA ERS):
 *   https://gisportal.ers.usda.gov/server/rest/services/Hosted/FARA_General2019/FeatureServer/0
 * Product page: https://www.ers.usda.gov/data-products/food-access-research-atlas
 *
 * Usage:
 *   node scripts/refresh-usda-fara-county.mjs            # dry run: prints summary
 *   node scripts/refresh-usda-fara-county.mjs --apply    # writes the JSON
 *   ... --from <tracts.json>   read a saved tract array instead of fetching
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SERVICE =
  "https://gisportal.ers.usda.gov/server/rest/services/Hosted/FARA_General2019/FeatureServer/0";
const FIELDS = [
  "geoid10",
  "cnty_name",
  "urban",
  "la1and10",
  "lilatracts_1and10",
  "lapop1_10",
  "lalowi1_10",
  "laseniors1",
  "laseniors10",
  "lahunv1",
  "lahunv10",
];
const EXPECTED_COUNTIES = 83;

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..");
const outPath = path.join(projectRoot, "src/data/usda-fara-county.generated.json");

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const fromIdx = args.indexOf("--from");
const fromFile = fromIdx >= 0 ? args[fromIdx + 1] : null;

async function fetchTracts() {
  const rows = [];
  let offset = 0;
  for (;;) {
    const q = new URLSearchParams({
      where: "st_name='Michigan'",
      outFields: FIELDS.join(","),
      returnGeometry: "false",
      orderByFields: "geoid10",
      resultOffset: String(offset),
      resultRecordCount: "2000",
      f: "json",
    });
    const res = await fetch(`${SERVICE}/query?${q}`);
    if (!res.ok) throw new Error(`USDA FARA query failed: HTTP ${res.status}`);
    const body = await res.json();
    if (body.error) throw new Error(`USDA FARA query error: ${JSON.stringify(body.error)}`);
    const feats = body.features ?? [];
    rows.push(...feats.map((f) => f.attributes));
    if (!body.exceededTransferLimit && feats.length < 2000) break;
    offset += feats.length;
  }
  return rows;
}

const n = (v) => (typeof v === "number" && Number.isFinite(v) ? v : 0);

function aggregate(tracts) {
  const byFips = new Map();
  for (const t of tracts) {
    const fips = String(t.geoid10).slice(0, 5);
    if (!byFips.has(fips)) {
      byFips.set(fips, {
        county: t.cnty_name,
        fips,
        totalTracts: 0,
        lowAccessTracts: 0,
        lilaTracts: 0,
        lowAccessPop: 0,
        lowIncomeLowAccessPop: 0,
        seniorLowAccessPop: 0,
        noVehicleLowAccessHousingUnits: 0,
      });
    }
    const c = byFips.get(fips);
    const urban = t.urban === 1;
    c.totalTracts += 1;
    if (t.la1and10 === 1) c.lowAccessTracts += 1;
    if (t.lilatracts_1and10 === 1) c.lilaTracts += 1;
    c.lowAccessPop += n(t.lapop1_10);
    c.lowIncomeLowAccessPop += n(t.lalowi1_10);
    c.seniorLowAccessPop += n(urban ? t.laseniors1 : t.laseniors10);
    c.noVehicleLowAccessHousingUnits += n(urban ? t.lahunv1 : t.lahunv10);
  }
  return [...byFips.values()]
    .map((c) => ({
      ...c,
      lowAccessPct: Math.round((c.lowAccessTracts / c.totalTracts) * 1000) / 10,
      lowAccessPop: Math.round(c.lowAccessPop),
      lowIncomeLowAccessPop: Math.round(c.lowIncomeLowAccessPop),
      seniorLowAccessPop: Math.round(c.seniorLowAccessPop),
      noVehicleLowAccessHousingUnits: Math.round(c.noVehicleLowAccessHousingUnits),
    }))
    .sort((a, b) => a.fips.localeCompare(b.fips));
}

const tracts = fromFile ? JSON.parse(await readFile(fromFile, "utf8")) : await fetchTracts();
const counties = aggregate(tracts);
if (counties.length !== EXPECTED_COUNTIES) {
  throw new Error(`Expected ${EXPECTED_COUNTIES} Michigan counties, got ${counties.length}`);
}

const payload = {
  provenance: {
    source_name: "USDA ERS Food Access Research Atlas 2019",
    source_url: SERVICE,
    product_page: "https://www.ers.usda.gov/data-products/food-access-research-atlas",
    value_label: "MODELED",
    method:
      "County figures are sums or counts of USDA tract values (1 mile urban / 10 miles rural definition). USDA publishes tract data only.",
    tracts: tracts.length,
    michigan_county_registry_size: EXPECTED_COUNTIES,
    ingested_at: new Date().toISOString(),
    ingest_script: "scripts/refresh-usda-fara-county.mjs",
  },
  counties,
};

const wayne = counties.find((c) => c.county === "Wayne");
console.log(
  `[refresh-usda-fara-county] tracts=${tracts.length} counties=${counties.length} Wayne=${JSON.stringify(wayne)}`,
);
if (apply) {
  await writeFile(outPath, JSON.stringify(payload, null, 2) + "\n", "utf8");
  console.log(`[refresh-usda-fara-county] wrote ${path.relative(projectRoot, outPath)}`);
}
