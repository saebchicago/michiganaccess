/**
 * Seed script: FCC Broadband Data Collection → broadband_access
 *
 * Data source: https://broadbandmap.fcc.gov/data-download/
 * Download "Fixed Broadband" CSV for Michigan, then run this script.
 *
 * Usage: npx tsx src/utils/data-ingestion/seed-broadband.ts path/to/fcc-broadband.csv
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

  console.log(`Processing ${lines.length - 1} rows...`);
  console.log("Aggregating location-level data to tract level...");

  // Aggregate by tract
  const tractMap = new Map<string, {
    county: string; countyFips: string; total: number;
    served: number; underserved: number; unserved: number;
    maxSpeed: number; providers: Set<string>; hasFiber: boolean;
  }>();

  lines.slice(1).forEach((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = values[i] || ""));

    const tractId = row.census_tract || row.block_geoid?.substring(0, 11) || "";
    if (!tractId) return;

    if (!tractMap.has(tractId)) {
      tractMap.set(tractId, {
        county: row.county_name || "",
        countyFips: row.county_fips || tractId.substring(2, 5),
        total: 0, served: 0, underserved: 0, unserved: 0,
        maxSpeed: 0, providers: new Set(), hasFiber: false,
      });
    }

    const t = tractMap.get(tractId)!;
    t.total++;
    const speed = parseInt(row.max_advertised_download_speed || "0");
    if (speed >= 100) t.served++;
    else if (speed >= 25) t.underserved++;
    else t.unserved++;
    if (speed > t.maxSpeed) t.maxSpeed = speed;
    if (row.provider_id) t.providers.add(row.provider_id);
    if (row.technology_code === "50") t.hasFiber = true;
  });

  const tracts = Array.from(tractMap.entries()).map(([tractId, t]) => ({
    census_tract_id: tractId,
    county: t.county,
    county_fips: t.countyFips,
    total_locations: t.total,
    served_locations: t.served,
    underserved_locations: t.underserved,
    unserved_locations: t.unserved,
    pct_served: t.total > 0 ? Math.round((t.served / t.total) * 1000) / 10 : null,
    pct_underserved: t.total > 0 ? Math.round((t.underserved / t.total) * 1000) / 10 : null,
    pct_unserved: t.total > 0 ? Math.round((t.unserved / t.total) * 1000) / 10 : null,
    max_download_speed: t.maxSpeed,
    provider_count: t.providers.size,
    fiber_available: t.hasFiber,
    bead_eligible: (t.unserved + t.underserved) / Math.max(t.total, 1) > 0.2,
  }));

  console.log(`Aggregated to ${tracts.length} tracts`);

  const BATCH_SIZE = 100;
  for (let i = 0; i < tracts.length; i += BATCH_SIZE) {
    const { error } = await supabase.from("broadband_access").upsert(
      tracts.slice(i, i + BATCH_SIZE),
      { onConflict: "census_tract_id" }
    );
    if (error) console.error(`Batch ${i}: ${error.message}`);
    else console.log(`Upserted ${Math.min(i + BATCH_SIZE, tracts.length)}/${tracts.length}`);
  }
  console.log("Done.");
}

const csvPath = process.argv[2];
if (!csvPath) { console.error("Usage: npx tsx seed-broadband.ts <csv>"); process.exit(1); }
seed(csvPath);
