#!/usr/bin/env node
/**
 * Build trendSeries.json — county-level vintage series for:
 *   (a) population: Census PEP annual 2020-2024 (5 points, no key needed)
 *   (b) uninsuredRate: ACS 5-year S2701_C05_001E, 2018 + 2023 non-overlapping
 *       pair (requires CENSUS_API_KEY)
 *
 * Validation enforced before any write:
 *   - All 83 Michigan counties present for every metric + vintage
 *   - Population: plausible range 500–2,000,000 per county per year
 *   - Uninsured: plausible range 0–50%
 *   - ACS pair gap >= 5 years (non-overlapping guarantee)
 *   - HTML-masked 200 responses caught and logged before JSON.parse
 *
 * Output: artifacts/access-mi/src/data/trendSeries.json
 *
 * Usage:
 *   node artifacts/access-mi/scripts/build-trend-series.mjs
 *   CENSUS_API_KEY=<key> node artifacts/access-mi/scripts/build-trend-series.mjs
 *   node artifacts/access-mi/scripts/build-trend-series.mjs --dry-run
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..");
const OUT_PATH = path.join(projectRoot, "src/data/trendSeries.json");

const DRY_RUN = process.argv.includes("--dry-run");

const CENSUS_API_KEY = process.env.CENSUS_API_KEY ?? "";

const PEP_URL =
  "https://www2.census.gov/programs-surveys/popest/datasets/2020-2024/counties/totals/co-est2024-alldata.csv";
const ACS_BASE = "https://api.census.gov/data";

const PEP_VINTAGES = [2020, 2021, 2022, 2023, 2024];
const ACS_V1 = 2018; // survey years 2014-2018
const ACS_V2 = 2023; // survey years 2019-2023

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

function fail(msg) {
  console.error(`✗ [build-trend-series] ${msg}`);
  process.exit(1);
}

function assertNotHtml(text, label) {
  const head = text.slice(0, 300).trimStart().toLowerCase();
  if (head.startsWith("<!doctype") || head.startsWith("<html") || head.startsWith("<")) {
    fail(
      `HTML response (200-masked error) from ${label}.\n  First 300 chars: ${text.slice(0, 300)}`
    );
  }
}

// ── PEP fetch ────────────────────────────────────────────────────────────────

async function fetchPep() {
  console.log("→ Fetching Census PEP CSV…");
  const res = await fetch(PEP_URL, { headers: { "user-agent": "accessmi-trend-build" } });
  if (!res.ok) fail(`PEP fetch HTTP ${res.status}`);
  const csv = await res.text();
  const lines = csv.split(/\r?\n/);
  const hdr = lines[0].split(",");
  const col = (n) => {
    const i = hdr.indexOf(n);
    if (i < 0) fail(`PEP CSV missing column: ${n}`);
    return i;
  };

  const STATE = col("STATE"), COUNTY = col("COUNTY"), NAME = col("CTYNAME");
  const popCols = PEP_VINTAGES.map((yr) => col(`POPESTIMATE${yr}`));

  const byCounty = new Map();
  for (const line of lines.slice(1)) {
    if (!line) continue;
    const f = line.split(",");
    if (f[STATE] !== "26" || f[COUNTY] === "000") continue;
    const name = f[NAME].replace(/ County$/, "");
    const series = PEP_VINTAGES.map((yr, i) => ({ vintage: yr, value: +f[popCols[i]] }));
    byCounty.set(name, series);
  }

  // Validate coverage
  const missing = MI_COUNTIES_83.filter((c) => !byCounty.has(c));
  if (missing.length > 0) fail(`PEP missing counties: ${missing.join(", ")}`);

  // Validate plausible ranges
  for (const [county, series] of byCounty) {
    for (const { vintage, value } of series) {
      if (value < 500 || value > 2_000_000) {
        fail(`PEP implausible value ${value} for ${county} ${vintage}`);
      }
    }
  }

  console.log(`  ✓ PEP: ${byCounty.size} counties × ${PEP_VINTAGES.length} vintages`);
  return byCounty;
}

// ── ACS fetch ────────────────────────────────────────────────────────────────

async function fetchAcs(year) {
  if (!CENSUS_API_KEY) {
    fail(
      `CENSUS_API_KEY is not set. ACS data requires an API key.\n` +
      `  Set CENSUS_API_KEY=<your key> and re-run.\n` +
      `  Get a free key at: https://api.census.gov/data/key_signup.html`
    );
  }

  const url =
    `${ACS_BASE}/${year}/acs/acs5/subject` +
    `?get=NAME,S2701_C05_001E&for=county:*&in=state:26&key=${CENSUS_API_KEY}`;

  console.log(`→ Fetching ACS ${year} (S2701 uninsured)…`);
  const res = await fetch(url, { headers: { "user-agent": "accessmi-trend-build" } });
  const text = await res.text();
  assertNotHtml(text, `ACS ${year}`);
  if (!res.ok) fail(`ACS ${year} HTTP ${res.status}: ${text.slice(0, 200)}`);

  const rows = JSON.parse(text);
  // rows[0] is header: [NAME, S2701_C03_001E, state, county]
  const byFips = new Map();
  for (const r of rows.slice(1)) {
    const fips = r[2] + r[3]; // state + county
    const pct = parseFloat(r[1]);
    byFips.set(fips, pct);
  }
  return byFips;
}

function fipsForCounty(name) {
  // Mirrors MI_COUNTY_FIPS from census-geographies.ts
  const table = {
    Alcona: "001", Alger: "003", Allegan: "005", Alpena: "007", Antrim: "009",
    Arenac: "011", Baraga: "013", Barry: "015", Bay: "017", Benzie: "019",
    Berrien: "021", Branch: "023", Calhoun: "025", Cass: "027", Charlevoix: "029",
    Cheboygan: "031", Chippewa: "033", Clare: "035", Clinton: "037", Crawford: "039",
    Delta: "041", Dickinson: "043", Eaton: "045", Emmet: "047", Genesee: "049",
    Gladwin: "051", Gogebic: "053", "Grand Traverse": "055", Gratiot: "057", Hillsdale: "059",
    Houghton: "061", Huron: "063", Ingham: "065", Ionia: "067", Iosco: "069",
    Iron: "071", Isabella: "073", Jackson: "075", Kalamazoo: "077", Kalkaska: "079",
    Kent: "081", Keweenaw: "083", Lake: "085", Lapeer: "087", Leelanau: "089",
    Lenawee: "091", Livingston: "093", Luce: "095", Mackinac: "097", Macomb: "099",
    Manistee: "101", Marquette: "103", Mason: "105", Mecosta: "107", Menominee: "109",
    Midland: "111", Missaukee: "113", Monroe: "115", Montcalm: "117", Montmorency: "119",
    Muskegon: "121", Newaygo: "123", Oakland: "125", Oceana: "127", Ogemaw: "129",
    Ontonagon: "131", Osceola: "133", Oscoda: "135", Otsego: "137", Ottawa: "139",
    "Presque Isle": "141", Roscommon: "143", Saginaw: "145", Sanilac: "151",
    Schoolcraft: "153", Shiawassee: "155", "St. Clair": "147", "St. Joseph": "149",
    Tuscola: "157", "Van Buren": "159", Washtenaw: "161", Wayne: "163", Wexford: "165",
  };
  const code = table[name];
  return code ? `26${code}` : null;
}

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
  // Validate ACS pair is non-overlapping before fetching anything
  const gap = ACS_V2 - ACS_V1;
  if (gap < 5) fail(`ACS vintages overlap: gap=${gap} years (must be >= 5)`);
  console.log(`ACS pair: ${ACS_V1} (${ACS_V1 - 4}–${ACS_V1}) vs ${ACS_V2} (${ACS_V2 - 4}–${ACS_V2}), gap=${gap} years ✓`);

  const [pepData, acsV1Data, acsV2Data] = await Promise.all([
    fetchPep(),
    fetchAcs(ACS_V1),
    fetchAcs(ACS_V2),
  ]);

  // Build per-county ACS map + validate coverage
  const acsByCounty = new Map();
  const acsErrors = [];
  for (const county of MI_COUNTIES_83) {
    const fips = fipsForCounty(county);
    if (!fips) { acsErrors.push(`no FIPS for ${county}`); continue; }
    const v1 = acsV1Data.get(fips);
    const v2 = acsV2Data.get(fips);
    if (v1 == null) acsErrors.push(`ACS ${ACS_V1} missing for ${county} (${fips})`);
    if (v2 == null) acsErrors.push(`ACS ${ACS_V2} missing for ${county} (${fips})`);
    if (v1 != null && (v1 < 0 || v1 > 50)) acsErrors.push(`ACS ${ACS_V1} implausible ${v1}% for ${county}`);
    if (v2 != null && (v2 < 0 || v2 > 50)) acsErrors.push(`ACS ${ACS_V2} implausible ${v2}% for ${county}`);
    if (v1 != null && v2 != null) {
      acsByCounty.set(county, [
        { vintageYear: ACS_V1, vintageLabel: `${ACS_V1} ACS 5-yr (${ACS_V1 - 4}–${ACS_V1})`, value: v1 },
        { vintageYear: ACS_V2, vintageLabel: `${ACS_V2} ACS 5-yr (${ACS_V2 - 4}–${ACS_V2})`, value: v2 },
      ]);
    }
  }
  if (acsErrors.length > 0) fail(`ACS validation errors:\n  ${acsErrors.join("\n  ")}`);
  console.log(`  ✓ ACS: ${acsByCounty.size} counties × 2 vintages`);

  // Assemble output
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
        points: acsByCounty.get(county),
        label: "VERIFIED",
        source: "U.S. Census Bureau American Community Survey 5-year (S2701)",
        sourceUrl: `https://data.census.gov/table/ACSST5Y${ACS_V2}.S2701`,
        overlapGapYears: gap,
        marginOfErrorNote:
          "Small-population counties (e.g. Keweenaw) have high margins of error; treat point estimates with caution.",
      },
    };
  }

  const payload = {
    $schema: "trendSeries.v1",
    provenance: {
      generatedAt: new Date().toISOString(),
      buildScript: "artifacts/access-mi/scripts/build-trend-series.mjs",
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
          variable: "S2701_C05_001E",
          vintages: [ACS_V1, ACS_V2],
          overlapGapYears: gap,
          acsWindowV1: `${ACS_V1 - 4}–${ACS_V1}`,
          acsWindowV2: `${ACS_V2 - 4}–${ACS_V2}`,
          sourceUrl: `https://data.census.gov/table/ACSST5Y${ACS_V2}.S2701`,
        },
      },
    },
    counties,
  };

  // Print sample
  const sample = ["Wayne", "Saginaw", "Keweenaw", "Marquette", "Oakland"];
  console.log("\n5-county sample:");
  for (const c of sample) {
    const pop = counties[c].population.series;
    const pct = counties[c].uninsuredRate.points;
    const popDelta = ((pop.at(-1).value - pop[0].value) / pop[0].value * 100).toFixed(1);
    const uninsSign = pct[1].value <= pct[0].value ? "" : "+";
    console.log(
      `  ${c.padEnd(14)}: pop ${pop.at(-1).value.toLocaleString()} (${popDelta.startsWith("-") ? "" : "+"}${popDelta}%), ` +
      `uninsured ${pct[0].value}%→${pct[1].value}% (${uninsSign}${(pct[1].value - pct[0].value).toFixed(1)}pp)`
    );
  }

  if (DRY_RUN) {
    console.log("\n[build-trend-series] --dry-run: skipping write");
    return;
  }

  await writeFile(OUT_PATH, JSON.stringify(payload, null, 2) + "\n", "utf8");
  console.log(`\n✓ wrote ${path.relative(projectRoot, OUT_PATH)}`);
  console.log(`  ${MI_COUNTIES_83.length} counties × 2 metrics`);
}

main().catch((err) => {
  console.error("[build-trend-series] failed:", err.message);
  process.exit(1);
});
