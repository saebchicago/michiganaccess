#!/usr/bin/env node
/**
 * Refresh `src/data/acs-medicaid-adult-county.generated.json`: adults ages
 * 19-64 with Medicaid/means-tested public coverage, per Michigan county,
 * from the ACS 5-year table-based Summary File (table C27007).
 *
 * Why this script exists (2026-11 correction): the Medicaid Coverage at Risk
 * model previously allocated by C27007_003E + C27007_012E. Census metadata
 * defines those as "Male: Under 19 years" (all coverage) and "Female:" (all
 * coverage) - population totals, not Medicaid counts. The statewide sum
 * (6,206,095) was a population figure. This script pulls the variables that
 * do measure Medicaid coverage for working-age adults and refuses to write
 * unless Census's own metadata labels match the construct.
 *
 *   Data      https://www2.census.gov/programs-surveys/acs/summary_file/<y>/table-based-SF/data/5YRData/acsdt5y<y>-c27007.dat
 *   Metadata  https://api.census.gov/data/<y>/acs/acs5/groups/C27007.json  (keyless)
 *
 * Variables (asserted against metadata at run time):
 *   C27007_007E  Male: 19 to 64 years: With Medicaid/means-tested public coverage
 *   C27007_017E  Female: 19 to 64 years: With Medicaid/means-tested public coverage
 * MOE of the sum = sqrt(M007^2 + M017^2) (Census approximation for sums).
 *
 * Construct limit: ACS self-reported "Medicaid/means-tested public coverage"
 * for ages 19-64 is a PROXY for Healthy Michigan Plan (expansion) enrollment.
 * It includes traditional-Medicaid adults and other means-tested coverage,
 * and is survey-based, not administrative. Prefer MDHHS county HMP
 * enrollment when a machine-readable release is available.
 *
 * Usage: node scripts/refresh-medicaid-adult-county.mjs [--apply] [--year 2023]
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.resolve(here, "../src/data/acs-medicaid-adult-county.generated.json");
const APPLY = process.argv.includes("--apply");
const yi = process.argv.indexOf("--year");
const YEAR = yi > -1 ? process.argv[yi + 1] : "2024";

const dataUrl = `https://www2.census.gov/programs-surveys/acs/summary_file/${YEAR}/table-based-SF/data/5YRData/acsdt5y${YEAR}-c27007.dat`;
const metaUrl = `https://api.census.gov/data/${YEAR}/acs/acs5/groups/C27007.json`;

export const EXPECTED_LABELS = {
  C27007_007E: "Estimate!!Total:!!Male:!!19 to 64 years:!!With Medicaid/means-tested public coverage",
  C27007_017E: "Estimate!!Total:!!Female:!!19 to 64 years:!!With Medicaid/means-tested public coverage",
};

async function main() {
  const meta = await (await fetch(metaUrl)).json();
  for (const [v, label] of Object.entries(EXPECTED_LABELS)) {
    const got = meta?.variables?.[v]?.label;
    if (got !== label) throw new Error(`Semantic check failed: ${v} label is "${got}", expected "${label}"`);
  }

  const res = await fetch(dataUrl);
  if (!res.ok) throw new Error(`Summary file HTTP ${res.status}`);
  const text = await res.text();
  const lines = text.split("\n");
  const header = lines[0].trim().split("|");
  const col = (k) => {
    const i = header.indexOf(k);
    if (i < 0) throw new Error(`Column ${k} missing from summary file`);
    return i;
  };
  const [e7, m7, e17, m17] = ["C27007_E007", "C27007_M007", "C27007_E017", "C27007_M017"].map(col);

  const counties = [];
  for (const line of lines) {
    if (!line.startsWith("0500000US26")) continue;
    const f = line.trim().split("|");
    const fips = f[0].slice(-5);
    const vals = [e7, m7, e17, m17].map((i) => Number(f[i]));
    if (vals.some((n) => !Number.isFinite(n) || n < 0)) throw new Error(`Suppressed/invalid value for ${fips}`);
    counties.push({
      fips,
      adultsWithMedicaid: vals[0] + vals[2],
      moe: Math.round(Math.sqrt(vals[1] ** 2 + vals[3] ** 2)),
    });
  }
  counties.sort((a, b) => a.fips.localeCompare(b.fips));
  if (counties.length !== 83) throw new Error(`Expected 83 Michigan counties, got ${counties.length}`);

  const total = counties.reduce((s, c) => s + c.adultsWithMedicaid, 0);
  const out = {
    provenance: {
      // VERIFIED = published Census survey estimates read verbatim (same
      // convention as acs-broadband-county). The county loss ranges built on
      // them are MODELED and labeled so on the page.
      value_label: "VERIFIED",
      source_name: `U.S. Census Bureau, ACS ${YEAR} 5-year Summary File, table C27007`,
      source_url: `https://data.census.gov/table/ACSDT5Y${YEAR}.C27007`,
      download_url: dataUrl,
      metadata_url: metaUrl,
      variables: EXPECTED_LABELS,
      universe: "Civilian noninstitutionalized population ages 19-64",
      construct: "Adults 19-64 reporting Medicaid/means-tested public coverage (survey). Proxy for Healthy Michigan Plan exposure; not administrative HMP enrollment.",
      moe_note: "90% margin of error; sum MOE approximated as sqrt(M007^2 + M017^2).",
      ingested_at: new Date().toISOString(),
      ingest_script: "scripts/refresh-medicaid-adult-county.mjs",
      statewide_total: total,
    },
    counties,
  };
  console.log(`C27007 ${YEAR}: 83 counties, adults 19-64 with Medicaid/means-tested coverage = ${total.toLocaleString()}`);
  if (APPLY) {
    await writeFile(outPath, JSON.stringify(out, null, 2) + "\n");
    console.log(`wrote ${path.relative(process.cwd(), outPath)}`);
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
