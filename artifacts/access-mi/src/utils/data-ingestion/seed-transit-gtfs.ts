/**
 * Seed script: GTFS static feeds → transit_stops
 *
 * Sources:
 *   DDOT: https://data.detroitmi.gov/ (GTFS download)
 *   SMART: https://www.smartbus.org/About/Developer-Center
 *   AAATA/TheRide: https://www.theride.org/about-us/data
 *
 * Usage: npx tsx seed-transit-gtfs.ts <agency-name> <path-to-stops.txt>
 * Example: npx tsx seed-transit-gtfs.ts DDOT ./gtfs-ddot/stops.txt
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

async function seed(agency: string, stopsPath: string) {
  const raw = readFileSync(stopsPath, "utf-8");
  const lines = raw.split("\n").filter(Boolean);
  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));

  const stops = lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = values[i] || ""));
    return {
      agency,
      stop_id: row.stop_id || "",
      stop_name: row.stop_name || "",
      latitude: parseFloat(row.stop_lat || "0"),
      longitude: parseFloat(row.stop_lon || "0"),
      wheelchair_boarding: parseInt(row.wheelchair_boarding || "0") || 0,
    };
  }).filter((s) => s.stop_id && s.latitude !== 0);

  console.log(`Parsed ${stops.length} stops for ${agency}`);

  const BATCH_SIZE = 200;
  for (let i = 0; i < stops.length; i += BATCH_SIZE) {
    const { error } = await supabase.from("transit_stops").upsert(
      stops.slice(i, i + BATCH_SIZE),
      { onConflict: "agency,stop_id" }
    );
    if (error) console.error(`Batch ${i}: ${error.message}`);
    else console.log(`Upserted ${Math.min(i + BATCH_SIZE, stops.length)}/${stops.length}`);
  }
  console.log("Done.");
}

const agency = process.argv[2];
const stopsPath = process.argv[3];
if (!agency || !stopsPath) {
  console.error("Usage: npx tsx seed-transit-gtfs.ts <agency> <stops.txt>");
  process.exit(1);
}
seed(agency, stopsPath);
