/**
 * Seed script: March of Dimes PeriStats + MDHHS Vital Records → maternal_infant_health
 *
 * Sources:
 *   March of Dimes PeriStats: https://www.marchofdimes.org/peristats/
 *   MDHHS Vital Records: https://www.michigan.gov/mdhhs/keep-mi-healthy/chronicdiseaseandinjury/vitalrecords
 *
 * Usage: npx tsx seed-maternal-health.ts <path-to-csv>
 *
 * IMPORTANT: NULL for suppressed data. NEVER estimate or fabricate.
 * Verified anchors:
 *   - Michigan maternal mortality: 19.1/100K (NCHS 2018-2023)
 *   - Michigan infant mortality: 6.1/1K (2023)
 *   - Preterm birth rate: 10.7% (2024, March of Dimes)
 *   - Severe maternal morbidity: 88.9/10K delivery hospitalizations
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

    const parseOrNull = (v: string) => {
      if (!v || v === "" || v === "suppressed" || v === "N/A" || v === "*") return null;
      const n = parseFloat(v);
      return isNaN(n) ? null : n;
    };

    return {
      county: row.county || row.County || "",
      infant_mortality_rate: parseOrNull(row.imr || row.infant_mortality_rate),
      infant_mortality_rate_black: parseOrNull(row.imr_black),
      infant_mortality_rate_white: parseOrNull(row.imr_white),
      preterm_birth_rate: parseOrNull(row.preterm || row.preterm_birth_rate),
      low_birth_weight_rate: parseOrNull(row.lbw || row.low_birth_weight_rate),
      prenatal_care_first_trimester: parseOrNull(row.prenatal_1st || row.prenatal_care_first_trimester),
      teen_birth_rate: parseOrNull(row.teen || row.teen_birth_rate),
      birthing_hospitals: parseOrNull(row.birthing_hospitals) as number | null,
      ob_gyn_per_10k: parseOrNull(row.obgyn || row.ob_gyn_per_10k),
      midwives_per_10k: parseOrNull(row.midwives || row.midwives_per_10k),
    };
  }).filter((r) => r.county);

  console.log(`Parsed ${rows.length} county records`);

  const { error } = await supabase.from("maternal_infant_health").upsert(rows, {
    onConflict: "county",
  });
  if (error) console.error("Upsert error:", error.message);
  else console.log(`Upserted ${rows.length} records. Done.`);
}

const csvPath = process.argv[2];
if (!csvPath) { console.error("Usage: npx tsx seed-maternal-health.ts <csv>"); process.exit(1); }
seed(csvPath);
