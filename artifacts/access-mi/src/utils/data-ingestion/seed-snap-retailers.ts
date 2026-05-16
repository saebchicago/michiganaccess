/**
 * Seed script: USDA SNAP Retailer Locator → snap_retailers
 *
 * Data source: https://usda-fns.hub.arcgis.com/datasets/USDA-FNS::snap-store-locations/
 * Download CSV, filter for Michigan, then run this script.
 *
 * Usage: npx tsx src/utils/data-ingestion/seed-snap-retailers.ts path/to/snap-retailers.csv
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

  const miRows = rows.filter((r) => (r.State || r.state) === "MI");
  console.log(`Found ${miRows.length} Michigan SNAP retailers`);

  const BATCH_SIZE = 200;
  for (let i = 0; i < miRows.length; i += BATCH_SIZE) {
    const batch = miRows.slice(i, i + BATCH_SIZE).map((r) => ({
      store_name: r.Store_Name || r.store_name || "",
      store_type: r.Store_Type || r.store_type || null,
      address: r.Address || r.address || "",
      city: r.City || r.city || "",
      county: r.County || r.county || null,
      state: "MI",
      zip: (r.Zip5 || r.zip || "").substring(0, 5),
      latitude: parseFloat(r.Latitude || r.latitude || "0") || null,
      longitude: parseFloat(r.Longitude || r.longitude || "0") || null,
    }));

    const { error } = await supabase.from("snap_retailers").upsert(batch);
    if (error) console.error(`Batch ${i}: ${error.message}`);
    else console.log(`Upserted ${Math.min(i + BATCH_SIZE, miRows.length)}/${miRows.length}`);
  }
  console.log("Done.");
}

const csvPath = process.argv[2];
if (!csvPath) { console.error("Usage: npx tsx seed-snap-retailers.ts <csv>"); process.exit(1); }
seed(csvPath);
