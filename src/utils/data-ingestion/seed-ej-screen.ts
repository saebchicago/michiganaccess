/**
 * Seed script: EPA EJScreen v2.3 (archived 2024) → ej_screen
 *
 * Data source: Zenodo doi:10.5281/zenodo.14767363
 * Download CSV, filter for Michigan (State FIPS 26), then run.
 *
 * Usage: npx tsx seed-ej-screen.ts <path-to-ejscreen.csv>
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

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
  const miRows = rows.filter((r) => {
    const bgId = r.ID || r.GEOID || r.block_group_id || "";
    return bgId.startsWith("26");
  });

  console.log(`Found ${miRows.length} Michigan block groups`);

  const parse = (v: string) => {
    if (!v || v === "" || v === "None" || v === "NA") return null;
    const n = parseFloat(v);
    return isNaN(n) ? null : n;
  };

  const BATCH_SIZE = 200;
  for (let i = 0; i < miRows.length; i += BATCH_SIZE) {
    const batch = miRows.slice(i, i + BATCH_SIZE).map((r) => {
      const bgId = r.ID || r.GEOID || r.block_group_id || "";
      return {
        block_group_id: bgId,
        census_tract_id: bgId.substring(0, 11),
        county: r.CNTY_NAME || r.county || "",
        county_fips: bgId.substring(2, 5),
        pct_minority: parse(r.MINORPCT),
        pct_low_income: parse(r.LOWINCPCT),
        demographic_index: parse(r.DEMOGIDX_2),
        pm25_concentration: parse(r.PM25),
        ozone_concentration: parse(r.OZONE),
        diesel_pm: parse(r.DSLPM),
        air_toxics_cancer_risk: parse(r.CANCER),
        traffic_proximity: parse(r.PTRAF),
        lead_paint_indicator: parse(r.LDPNT),
        superfund_proximity: parse(r.PNPL),
        rmp_facility_proximity: parse(r.PRMP),
        hazardous_waste_proximity: parse(r.PTSDF),
        wastewater_discharge: parse(r.PWDIS),
        ej_index_pm25: parse(r.P_PM25_D2) as number | null,
        ej_index_ozone: parse(r.P_OZONE_D2) as number | null,
        ej_index_diesel: parse(r.P_DSLPM_D2) as number | null,
        ej_index_lead: parse(r.P_LDPNT_D2) as number | null,
        ej_index_superfund: parse(r.P_PNPL_D2) as number | null,
        supplemental_index_pm25: parse(r.P_PM25_D5) as number | null,
      };
    });

    const { error } = await supabase.from("ej_screen").upsert(batch, {
      onConflict: "block_group_id",
    });
    if (error) console.error(`Batch ${i}: ${error.message}`);
    else console.log(`Upserted ${Math.min(i + BATCH_SIZE, miRows.length)}/${miRows.length}`);
  }
  console.log("Done.");
}

const csvPath = process.argv[2];
if (!csvPath) { console.error("Usage: npx tsx seed-ej-screen.ts <csv>"); process.exit(1); }
seed(csvPath);
