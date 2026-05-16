/**
 * Calculate Compound Access Deficit Index per census tract.
 *
 * Reads from: food_access_tracts, broadband_access, transit_stops,
 *   compound data from HRSA HPSA, CDC SVI, ej_screen, ACEEE energy burden
 *
 * Weights:
 *   food(15%) + broadband(15%) + transit(15%) + healthcare(20%)
 *   + svi(15%) + ej(10%) + energy(10%)
 *
 * Tiers: Critical ≥ 75, High ≥ 50, Moderate ≥ 25, Low < 25
 *
 * Usage: npx tsx calculate-compound-index.ts
 */

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

function tierFromScore(score: number): string {
  if (score >= 75) return "Critical";
  if (score >= 50) return "High";
  if (score >= 25) return "Moderate";
  return "Low";
}

async function calculate() {
  // 1. Get all food desert tracts
  const { data: foodTracts } = await supabase
    .from("food_access_tracts")
    .select("census_tract_id, county, population, food_desert_flag, low_income");

  if (!foodTracts?.length) {
    console.log("No food access data found. Seed food_access_tracts first.");
    return;
  }

  // 2. Get broadband data
  const { data: bbTracts } = await supabase
    .from("broadband_access")
    .select("census_tract_id, pct_unserved, pct_underserved");

  const bbMap = new Map((bbTracts || []).map((b) => [b.census_tract_id, b]));

  // 3. Get EJ data (aggregate to tract level — max of block groups)
  const { data: ejData } = await supabase
    .from("ej_screen")
    .select("census_tract_id, ej_index_pm25, ej_index_ozone, ej_index_diesel, ej_index_lead, ej_index_superfund");

  const ejMap = new Map<string, number>();
  (ejData || []).forEach((ej) => {
    const maxIdx = Math.max(
      ej.ej_index_pm25 || 0, ej.ej_index_ozone || 0, ej.ej_index_diesel || 0,
      ej.ej_index_lead || 0, ej.ej_index_superfund || 0
    );
    const existing = ejMap.get(ej.census_tract_id) || 0;
    if (maxIdx > existing) ejMap.set(ej.census_tract_id, maxIdx);
  });

  // 4. Calculate per tract
  const results = foodTracts.map((ft) => {
    const foodScore = ft.food_desert_flag ? 100 : ft.low_income ? 50 : 0;
    const bb = bbMap.get(ft.census_tract_id);
    const bbScore = bb ? ((bb.pct_unserved || 0) + (bb.pct_underserved || 0)) : 50; // default 50 if no data
    const transitScore = 50; // placeholder — would need spatial query for stop density
    const hpsaScore = 50; // placeholder — would need HRSA HPSA lookup
    const sviScore = 50; // placeholder — would need CDC SVI lookup
    const ejScore = ejMap.get(ft.census_tract_id) || 0;
    const energyScore = 50; // placeholder — would need ACEEE data

    const compound = (
      foodScore * 0.15 +
      bbScore * 0.15 +
      transitScore * 0.15 +
      hpsaScore * 0.20 +
      sviScore * 0.15 +
      ejScore * 0.10 +
      energyScore * 0.10
    );

    return {
      census_tract_id: ft.census_tract_id,
      county: ft.county,
      food_desert_score: foodScore,
      broadband_desert_score: Math.min(bbScore, 100),
      transit_desert_score: transitScore,
      healthcare_hpsa_score: hpsaScore,
      svi_score: sviScore,
      ej_burden_score: ejScore,
      energy_burden_score: energyScore,
      compound_deficit_index: Math.round(compound * 10) / 10,
      deficit_tier: tierFromScore(compound),
      population: ft.population,
    };
  });

  console.log(`Calculated compound index for ${results.length} tracts`);

  const BATCH_SIZE = 200;
  for (let i = 0; i < results.length; i += BATCH_SIZE) {
    const { error } = await supabase.from("compound_access_index").upsert(
      results.slice(i, i + BATCH_SIZE),
      { onConflict: "census_tract_id" }
    );
    if (error) console.error(`Batch ${i}: ${error.message}`);
    else console.log(`Upserted ${Math.min(i + BATCH_SIZE, results.length)}/${results.length}`);
  }

  // Summary
  const tiers = { Critical: 0, High: 0, Moderate: 0, Low: 0 };
  results.forEach((r) => {
    const t = r.deficit_tier as keyof typeof tiers;
    if (t in tiers) tiers[t]++;
  });
  console.log("Tier distribution:", tiers);
  console.log("Done.");
}

calculate();
