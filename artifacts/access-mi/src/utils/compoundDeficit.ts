/**
 * Compound Access Deficit Index (CADI).
 *
 * Single authoritative scoring function shared by every surface that
 * displays the CADI score — atlas map layer, county detail panel, and
 * the rankings table. Keeping the formula here prevents the prior split
 * where the map used uninsured*2 + food*1.5 while the rankings table
 * used a 7-axis weighted index, producing different numbers for the
 * same county on the same page.
 *
 * Scale: 0–100. Higher = more compounding access barriers.
 *
 * Methodology mirrors the tract-level Supabase batch job at
 * src/utils/data-ingestion/calculate-compound-index.ts so the
 * county-proxy view and the tract-level view stay on the same scale.
 */

import type { CountyProfile } from "@/data/michigan-county-profiles";

export interface CompoundDeficitScore {
  food: number;
  broadband: number;
  transit: number;
  healthcare: number;
  svi: number;
  ej: number;
  energy: number;
  compound: number;
  tier: "Critical" | "High" | "Moderate" | "Low";
}

export function tierFromScore(score: number): CompoundDeficitScore["tier"] {
  if (score >= 75) return "Critical";
  if (score >= 50) return "High";
  if (score >= 25) return "Moderate";
  return "Low";
}

/**
 * County-proxy CADI: derived from COUNTY_PROFILES until tract-level data
 * is fully seeded. Same weights as the tract job:
 *   food 15% + broadband 15% + transit 15% + healthcare 20%
 *   + svi 15% + ej 10% + energy 10%
 */
export function computeCompoundDeficit(
  profile: CountyProfile,
): CompoundDeficitScore {
  const h = profile.healthHighlights;
  const uninsured = parseFloat(h[0]?.value || "0");
  const food = parseFloat(h[2]?.value || "0");
  const isRural = profile.countyType === "rural";
  const isUrban = profile.countyType === "urban";

  const foodScore = food > 18 ? 80 : food > 14 ? 60 : food > 10 ? 40 : 20;
  const broadbandScore = isRural ? 70 : isUrban ? 20 : 35;
  const transitScore = isRural ? 85 : isUrban ? 25 : 55;
  const healthcareScore = uninsured > 8 ? 75 : uninsured > 5 ? 45 : 20;
  const sviScore = Math.min((uninsured + food) * 2.5, 100);
  const ejScore = isUrban ? 55 : isRural ? 30 : 40;
  const energyScore = isRural ? 65 : isUrban ? 50 : 40;

  const compound =
    Math.round(
      (foodScore * 0.15 +
        broadbandScore * 0.15 +
        transitScore * 0.15 +
        healthcareScore * 0.2 +
        sviScore * 0.15 +
        ejScore * 0.1 +
        energyScore * 0.1) *
        10,
    ) / 10;

  return {
    food: foodScore,
    broadband: broadbandScore,
    transit: transitScore,
    healthcare: healthcareScore,
    svi: sviScore,
    ej: ejScore,
    energy: energyScore,
    compound,
    tier: tierFromScore(compound),
  };
}
