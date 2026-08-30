#!/usr/bin/env node
/**
 * Expand the slim official county table into alice-county.generated.json.
 * Counts come from United For ALICE Michigan Data Sheet 2026 (Year == 2024).
 * Do not invent race / age / household-type rates here.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const csvPath = path.join(root, "src/data/alice-counties-2024.csv");
const outPath = path.join(root, "src/data/alice-county.generated.json");

const SOURCE =
  "United For ALICE / United Way ALICE Michigan Data Sheet 2026 (data year 2024); ALICE Threshold 2024; ACS 2024";

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const header = lines.shift().split(",");
  return lines.map((line) => {
    const cols = line.split(",");
    const row = {};
    header.forEach((key, i) => {
      row[key] = cols[i];
    });
    return row;
  });
}

const rows = parseCsv(fs.readFileSync(csvPath, "utf8"));
if (rows.length !== 83) {
  console.error(`expected 83 counties, got ${rows.length}`);
  process.exit(1);
}

const SOURCE_NOTE =
  "County household counts come from the official sheet. Percents computed from counts. Classification is MODELED.";

const counties = rows.map((r) => {
  const households = Number(r.households);
  const povertyHouseholds = Number(r.povertyHouseholds);
  const aliceHouseholds = Number(r.aliceHouseholds);
  const aboveAliceHouseholds = Number(r.aboveAliceHouseholds);
  return {
    countyFips: r.countyFips,
    countyName: r.countyName,
    year: Number(r.year),
    households,
    povertyHouseholds,
    aliceHouseholds,
    aboveAliceHouseholds,
    povertyPct: Number(r.povertyPct),
    alicePct: Number(r.alicePct),
    belowAliceThresholdPct: Number(r.belowAliceThresholdPct),
    thresholdUnder65: Number(r.thresholdUnder65),
    threshold65plus: Number(r.threshold65plus),
    acsEstimate: r.acsEstimate,
    value_label: "MODELED",
    source: SOURCE,
  };
});

const hh = counties.reduce((s, r) => s + r.households, 0);
const pov = counties.reduce((s, r) => s + r.povertyHouseholds, 0);
const alice = counties.reduce((s, r) => s + r.aliceHouseholds, 0);
const above = counties.reduce((s, r) => s + r.aboveAliceHouseholds, 0);

if (hh !== 4109904 || pov !== 551257 || alice !== 1079772) {
  console.error("county sums do not match published statewide totals", {
    hh,
    pov,
    alice,
  });
  process.exit(1);
}

const payload = {
  provenance: {
    source_name: "United For ALICE Michigan Data Sheet 2026",
    source_url: "https://www.unitedforalice.org/michigan",
    data_sheet_url:
      "https://www.unitedforalice.org/Attachments/StateDataSheet/2026%20ALICE%20-%20Michigan%20Data%20Sheet.xlsx",
    report_url:
      "https://www.unitedforalice.org/Attachments/AllReports/state-of-alice-report-michigan-2026.pdf",
    methodology_url: "https://www.unitedforalice.org/methodology",
    publisher: "United For ALICE / Michigan Association of United Ways",
    data_year: 2024,
    report_year: 2026,
    ingested_at: "2026-08-30",
    ingest_script: "scripts/build-alice-county.mjs",
    michigan_county_registry_size: 83,
    value_label: "MODELED",
    notes: SOURCE_NOTE,
  },
  statewide: {
    countyFips: "26000",
    countyName: "Michigan (Statewide)",
    year: 2024,
    households: hh,
    povertyHouseholds: pov,
    aliceHouseholds: alice,
    aboveAliceHouseholds: above,
    povertyPct: 13.4,
    alicePct: 26.3,
    belowAliceThresholdPct: 39.7,
    survivalBudgetSingleAdult: 29580,
    survivalBudgetFamilyOfFour: 78216,
    federalPovertyLevelSingleAdult: 15060,
    federalPovertyLevelFamilyOfFour: 31200,
    value_label: "MODELED",
    source: SOURCE,
    reportRoundingNote:
      "United For ALICE rounds 39.7% below-threshold to 40% in the 2026 report.",
  },
  counties,
};

fs.writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`);
console.log(`wrote ${path.relative(root, outPath)} (${counties.length} counties`);
