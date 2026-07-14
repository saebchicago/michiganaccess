/**
 * Civic Insight Score - illustrative 0-100 composite from county health
 * highlights (uninsured rate, food insecurity, county type). Not a directly
 * sourced statistic - always render with an IntegrityBadge label="MODELED".
 *
 * Shared by BriefPage and DownloadLocalInsights so the same county produces
 * the same score regardless of which export/page a user pulls it from.
 */
import { COUNTY_PROFILES } from "@/data/michigan-county-profiles";
import { MI_STATE_BENCHMARKS } from "@/data/state-benchmarks";

export function computeCivicScore(county: string): number {
  const profile = COUNTY_PROFILES[county];
  if (!profile) return 50;
  let score = 60;
  const uninsured = parseFloat(
    profile.healthHighlights[0]?.value || "6",
  );
  if (uninsured < 5) score += 15;
  else if (uninsured < 7) score += 5;
  else score -= 5;
  if (profile.countyType === "urban") score += 5;
  if (profile.countyType === "suburban") score += 3;
  const foodIns = parseFloat(
    profile.healthHighlights[2]?.value ||
      String(MI_STATE_BENCHMARKS.foodInsecurityRate),
  );
  if (foodIns < 11) score += 10;
  else if (foodIns > 15) score -= 5;
  return Math.max(10, Math.min(95, score));
}

/** Human-readable description of the methodology above, for disclosures. */
export const CIVIC_SCORE_METHODOLOGY =
  "Threshold-based scoring against MI statewide benchmarks (uninsured rate, food insecurity, county type) - not a statistical model.";
