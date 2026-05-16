/**
 * Seed script: USDA Food Access Research Atlas → food_access_tracts
 *
 * Data source: https://www.ers.usda.gov/data-products/food-access-research-atlas/
 * Download the Excel file, convert to CSV, then run this script.
 *
 * Usage (developer-only, not user-facing):
 *   npx tsx src/utils/data-ingestion/seed-food-access.ts path/to/food-access.csv
 *
 * Filter: State FIPS = 26 (Michigan)
 * Sets food_desert_flag = true where low_income AND (low_access_1mi OR low_access_10mi)
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function seed(csvPath: string) {
  const raw = readFileSync(csvPath, "utf-8");
  const lines = raw.split("\n").filter(Boolean);
  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));

  const rows = lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = values[i] || ""));
    return row;
  });

  // Filter Michigan (state FIPS 26)
  const miRows = rows.filter((r) => r.State === "26" || r.STATEFP === "26");
  console.log(`Found ${miRows.length} Michigan tracts`);

  const BATCH_SIZE = 100;
  for (let i = 0; i < miRows.length; i += BATCH_SIZE) {
    const batch = miRows.slice(i, i + BATCH_SIZE).map((r) => {
      const lowIncome = r.LILATracts_1And10 === "1" || r.LowIncomeTracts === "1";
      const lowAccess1 = r.LA1and10 === "1" || r.lapop1_10 !== "0";
      const lowAccess10 = r.LA1and20 === "1";
      return {
        census_tract_id: `${r.State || r.STATEFP}${r.County || r.COUNTYFP}${r.Tract || r.TRACTCE}`,
        county: r.CountyName || r.county || "",
        state_fips: "26",
        county_fips: r.County || r.COUNTYFP || "",
        tract_fips: r.Tract || r.TRACTCE || "",
        population: parseInt(r.POP2010 || r.Pop2010 || "0") || null,
        low_income: lowIncome,
        low_access_1mi: r.LA1and10 === "1",
        low_access_10mi: r.LA1and20 === "1",
        la_kids_1mi: parseInt(r.lakids1 || "0") || null,
        la_seniors_1mi: parseInt(r.laseniors1 || "0") || null,
        la_no_car_1mi: parseInt(r.lahunv1 || "0") || null,
        snap_count: parseInt(r.TractSNAP || "0") || null,
        pct_snap: parseFloat(r.PctSNAP || "0") || null,
        median_family_income: parseInt(r.MedianFamilyIncome || "0") || null,
        food_desert_flag: lowIncome && (lowAccess1 || lowAccess10),
      };
    });

    const { error } = await supabase.from("food_access_tracts").upsert(batch, {
      onConflict: "census_tract_id",
    });
    if (error) console.error(`Batch ${i}: ${error.message}`);
    else console.log(`Upserted ${Math.min(i + BATCH_SIZE, miRows.length)}/${miRows.length}`);
  }

  console.log("Done.");
}

const csvPath = process.argv[2];
if (!csvPath) {
  console.error("Usage: npx tsx seed-food-access.ts <path-to-csv>");
  process.exit(1);
}
seed(csvPath);
