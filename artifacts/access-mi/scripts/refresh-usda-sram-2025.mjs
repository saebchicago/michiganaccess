#!/usr/bin/env node
/**
 * Refresh the Michigan tract subset of USDA ERS 2025 SNAP-authorized Retailer
 * Access Map (SRAM) directly from ERS's public ArcGIS REST service.
 *
 * This deliberately starts with the documented STRAIGHT-LINE map service.
 * USDA also publishes a driving-distance service, but its current endpoint
 * redirects through eAuth in some environments; do not silently relabel this
 * extract as network/road-distance data.
 *
 * Source documentation:
 * https://www.ers.usda.gov/developer/geospatial-apis
 * https://www.ers.usda.gov/data-products/food-access-research-atlas/documentation/snap-authorized-retailer-access-map-reference-guide
 */
import { writeFile, rename } from "node:fs/promises";
import { resolve } from "node:path";

const SOURCE_PAGE =
  "https://www.ers.usda.gov/data-products/food-access-research-atlas/download-the-data";
const MAP_SERVICE =
  "https://gisportal.ers.usda.gov/server/rest/services/FARA/FARA_2025_StraightLine/MapServer/7";
const QUERY_URL = `${MAP_SERVICE}/query`;
const OUT = resolve(
  process.cwd(),
  "src/data/usda-sram-2025-mi.generated.json",
);
const TMP = `${OUT}.tmp`;
const PAGE_SIZE = 1800;
const FIELDS = [
  "CensusTract20",
  "County20",
  "Urban",
  "POP2020",
  "LowIncomeTracts",
  "SD_SRAM_LILATracts_1And10",
  "SD_SRAM_LILATracts_halfAnd10",
  "SD_SRAM_LILATracts_1And20",
  "SD_SRAM_LILATracts_Vehicle",
  "SD_SRAM_HUNVFlag",
  "SD_SRAM_LA1and10",
  "SD_SRAM_LAhalfand10",
  "SD_SRAM_LA1and20",
  "SD_SRAM_LATractsVehicle_20",
  "TractHUNV",
].join(",");

function numberOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function flagOrNull(value) {
  const n = numberOrNull(value);
  if (n === null) return null;
  if (n !== 0 && n !== 1) throw new Error(`Expected binary flag, got ${value}`);
  return n;
}

async function fetchPage(offset) {
  const params = new URLSearchParams({
    where: "CensusTract20 LIKE '26%'",
    outFields: FIELDS,
    returnGeometry: "false",
    resultOffset: String(offset),
    resultRecordCount: String(PAGE_SIZE),
    orderByFields: "CensusTract20 ASC",
    f: "json",
  });
  const response = await fetch(`${QUERY_URL}?${params.toString()}`, {
    headers: { "user-agent": "AccessMI data refresh (accessmi.org)" },
  });
  if (!response.ok) {
    throw new Error(`USDA SRAM fetch failed: HTTP ${response.status}`);
  }
  const body = await response.json();
  if (body?.error) {
    throw new Error(
      `USDA SRAM ArcGIS error: ${body.error.code ?? "unknown"} ${body.error.message ?? ""}`,
    );
  }
  if (!Array.isArray(body?.features)) {
    throw new Error("USDA SRAM response did not contain a features array");
  }
  return body.features;
}

async function main() {
  const features = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const page = await fetchPage(offset);
    features.push(...page);
    if (page.length < PAGE_SIZE) break;
    if (offset > 10000) throw new Error("USDA SRAM pagination exceeded sanity limit");
  }

  if (features.length < 1000 || features.length > 5000) {
    throw new Error(
      `USDA SRAM Michigan tract count failed plausibility check: ${features.length}`,
    );
  }

  const seen = new Set();
  const records = features.map(({ attributes }) => {
    const tractGEOID = String(attributes?.CensusTract20 ?? "").padStart(11, "0");
    if (!/^26\d{9}$/.test(tractGEOID)) {
      throw new Error(`Unexpected Michigan tract GEOID: ${tractGEOID}`);
    }
    if (seen.has(tractGEOID)) throw new Error(`Duplicate tract GEOID: ${tractGEOID}`);
    seen.add(tractGEOID);

    const population2020 = numberOrNull(attributes.POP2020);
    if (population2020 !== null && (population2020 < 0 || population2020 > 100000)) {
      throw new Error(`Implausible tract population ${population2020} for ${tractGEOID}`);
    }

    return {
      tractGEOID,
      countyName: String(attributes.County20 ?? "").trim(),
      urban: flagOrNull(attributes.Urban),
      population2020,
      lowIncomeTract: flagOrNull(attributes.LowIncomeTracts),
      lowIncomeLowAccess1And10: flagOrNull(attributes.SD_SRAM_LILATracts_1And10),
      lowIncomeLowAccessHalfAnd10: flagOrNull(
        attributes.SD_SRAM_LILATracts_halfAnd10,
      ),
      lowIncomeLowAccess1And20: flagOrNull(attributes.SD_SRAM_LILATracts_1And20),
      lowIncomeLowAccessVehicleOr20: flagOrNull(
        attributes.SD_SRAM_LILATracts_Vehicle,
      ),
      noVehicleHighLowAccessFlag: flagOrNull(attributes.SD_SRAM_HUNVFlag),
      lowAccess1And10: flagOrNull(attributes.SD_SRAM_LA1and10),
      lowAccessHalfAnd10: flagOrNull(attributes.SD_SRAM_LAhalfand10),
      lowAccess1And20: flagOrNull(attributes.SD_SRAM_LA1and20),
      lowAccessVehicleOr20: flagOrNull(attributes.SD_SRAM_LATractsVehicle_20),
      tractHouseholdsNoVehicle: numberOrNull(attributes.TractHUNV),
    };
  });

  const countyNames = new Set(records.map((r) => r.countyName).filter(Boolean));
  if (countyNames.size < 70 || countyNames.size > 83) {
    throw new Error(
      `USDA SRAM county coverage failed plausibility check: ${countyNames.size} distinct county labels`,
    );
  }

  const payload = {
    provenance: {
      source_name: "USDA Economic Research Service — Food Access Research Atlas, 2025 SRAM",
      source_url: SOURCE_PAGE,
      map_service: MAP_SERVICE,
      distance_method: "straight-line (Euclidean)",
      release_date: "2026-07-27",
      retailer_vintage: "June 2025 SNAP-authorized retailers",
      tract_geography: "2020 Census tracts",
      socioeconomic_context: "2020–2024 ACS",
      ingested_at: new Date().toISOString(),
      ingest_script: "scripts/refresh-usda-sram-2025.mjs",
      value_label: "VERIFIED",
      populated: true,
      record_count: records.length,
      notes:
        "Source-native tract indicators from USDA ERS. This extract uses the documented straight-line service and must not be described as road-network/driving-distance access. AccessMI does not create an unqualified food-desert label from these fields.",
    },
    records,
  };

  await writeFile(TMP, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  await rename(TMP, OUT);
  console.log(
    `[refresh-usda-sram-2025] wrote ${records.length} Michigan tracts across ${countyNames.size} county labels`,
  );
}

main().catch((error) => {
  console.error(`[refresh-usda-sram-2025] ${error instanceof Error ? error.stack : error}`);
  process.exit(1);
});
