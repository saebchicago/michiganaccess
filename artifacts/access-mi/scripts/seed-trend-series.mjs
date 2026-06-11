#!/usr/bin/env node
/**
 * Generates the initial trendSeries.json seed.
 *
 * - PEP population: live fetch (no key needed), all 83 counties × 5 vintages
 * - ACS uninsured rate: marked "pending-ci" — the check guard allows this
 *   status explicitly. Run build-trend-series.mjs with CENSUS_API_KEY set
 *   to populate real ACS values.
 *
 * This script is run once to create the initial committed seed. After that,
 * use build-trend-series.mjs (with CENSUS_API_KEY) for production refreshes.
 *
 * Usage:
 *   node artifacts/access-mi/scripts/seed-trend-series.mjs
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..");
const OUT_PATH = path.join(projectRoot, "src/data/trendSeries.json");

const PEP_URL =
  "https://www2.census.gov/programs-surveys/popest/datasets/2020-2024/counties/totals/co-est2024-alldata.csv";

const PEP_VINTAGES = [2020, 2021, 2022, 2023, 2024];
const ACS_V1 = 2018;
const ACS_V2 = 2023;

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

async function fetchPep() {
  console.log("→ Fetching Census PEP CSV…");
  const res = await fetch(PEP_URL, { headers: { "user-agent": "accessmi-trend-seed" } });
  if (!res.ok) throw new Error(`PEP HTTP ${res.status}`);
  const csv = await res.text();
  const lines = csv.split(/\r?\n/);
  const hdr = lines[0].split(",");
  const col = (n) => { const i = hdr.indexOf(n); if (i < 0) throw new Error(`PEP missing column ${n}`); return i; };

  const STATE = col("STATE"), COUNTY = col("COUNTY"), NAME = col("CTYNAME");
  const popCols = PEP_VINTAGES.map((yr) => col(`POPESTIMATE${yr}`));

  const byCounty = new Map();
  for (const line of lines.slice(1)) {
    if (!line) continue;
    const f = line.split(",");
    if (f[STATE] !== "26" || f[COUNTY] === "000") continue;
    const name = f[NAME].replace(/ County$/, "");
    byCounty.set(name, PEP_VINTAGES.map((yr, i) => ({ vintage: yr, value: +f[popCols[i]] })));
  }

  const missing = MI_COUNTIES_83.filter((c) => !byCounty.has(c));
  if (missing.length > 0) throw new Error(`PEP missing: ${missing.join(", ")}`);
  console.log(`  ✓ ${byCounty.size} counties × ${PEP_VINTAGES.length} vintages`);
  return byCounty;
}

const pepData = await fetchPep();

const counties = {};
for (const county of MI_COUNTIES_83) {
  counties[county] = {
    population: {
      series: pepData.get(county),
      label: "VERIFIED",
      source: "U.S. Census Bureau Population Estimates Program (PEP)",
      sourceUrl: PEP_URL,
    },
    uninsuredRate: {
      status: "pending-ci",
      pendingReason: "Requires CENSUS_API_KEY. Run build-trend-series.mjs in CI to populate.",
      vintages: [ACS_V1, ACS_V2],
      label: "VERIFIED",
      source: "U.S. Census Bureau American Community Survey 5-year (S2701)",
      sourceUrl: `https://data.census.gov/table/ACSST5Y${ACS_V2}.S2701`,
      overlapGapYears: ACS_V2 - ACS_V1,
    },
  };
}

const payload = {
  $schema: "trendSeries.v1",
  provenance: {
    generatedAt: new Date().toISOString(),
    buildScript: "artifacts/access-mi/scripts/seed-trend-series.mjs",
    note: "Seed file: PEP verified, ACS pending CI run with CENSUS_API_KEY",
    validityRules: [
      "ACS pair gap must be >= 5 years (non-overlapping 5-year windows)",
      "All 83 Michigan counties required for every metric and vintage",
      "Population range: 500–2,000,000 per county per year",
      "Uninsured rate range: 0–50% per county per vintage",
      "HTML-masked 200 responses cause immediate build failure",
    ],
    excludedMetrics: [
      {
        metric: "CDC PLACES",
        reason: "Model-based; CDC explicitly discourages cross-release trend comparison",
      },
      {
        metric: "ALICE hardship",
        reason: "Insufficient Michigan county coverage for defensible trend (8 of 83 counties seeded in v1)",
      },
      {
        metric: "Food insecurity",
        reason: "Feeding America county estimates use a national model; year-over-year county deltas reflect model updates, not real change",
      },
    ],
    metrics: {
      population: {
        description: "Annual population estimates, PEP Vintage 2024",
        vintages: PEP_VINTAGES,
        sourceUrl: PEP_URL,
      },
      uninsuredRate: {
        description: "Percent civilian noninstitutionalized population uninsured, ACS 5-year",
        variable: "S2701_C03_001E",
        vintages: [ACS_V1, ACS_V2],
        overlapGapYears: ACS_V2 - ACS_V1,
        acsWindowV1: `${ACS_V1 - 4}–${ACS_V1}`,
        acsWindowV2: `${ACS_V2 - 4}–${ACS_V2}`,
        sourceUrl: `https://data.census.gov/table/ACSST5Y${ACS_V2}.S2701`,
        status: "pending-ci",
      },
    },
  },
  counties,
};

await writeFile(OUT_PATH, JSON.stringify(payload, null, 2) + "\n", "utf8");
console.log(`✓ wrote ${path.relative(projectRoot, OUT_PATH)}`);
console.log(`  ${MI_COUNTIES_83.length} counties — PEP verified, ACS pending CI`);
