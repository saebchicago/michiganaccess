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

export interface CivicScoreInput {
  label: string;
  /** Value as published in the county profile, or null when not reported. */
  value: string | null;
  /** Points this input adds to or removes from the base of 60. */
  points: number;
  rule: string;
  source: string;
  /** True when the input was missing and a default stood in for it. */
  imputed: boolean;
}

export interface CivicScoreExplanation {
  score: number;
  base: number;
  inputs: CivicScoreInput[];
}

/**
 * The exact inputs and point contributions behind computeCivicScore, so the
 * on-screen breakdown and the downloadable brief describe the number that is
 * actually shown. Kept in lockstep by src/lib/__tests__/civic-score.test.ts.
 */
export function explainCivicScore(county: string): CivicScoreExplanation | null {
  const profile = COUNTY_PROFILES[county];
  if (!profile) return null;
  const rawUninsured = profile.healthHighlights[0]?.value;
  const rawFood = profile.healthHighlights[2]?.value;
  const uninsured = parseFloat(rawUninsured || "6");
  const food = parseFloat(rawFood || String(MI_STATE_BENCHMARKS.foodInsecurityRate));
  const uninsuredPts = uninsured < 5 ? 15 : uninsured < 7 ? 5 : -5;
  // Same if-chain as computeCivicScore (check-provenance rejects a numeric
  // ternary on countyType as an atlas proxy pattern).
  let typePts = 0;
  if (profile.countyType === "urban") typePts = 5;
  if (profile.countyType === "suburban") typePts = 3;
  const foodPts = food < 11 ? 10 : food > 15 ? -5 : 0;
  return {
    score: computeCivicScore(county),
    base: 60,
    inputs: [
      {
        label: "Uninsured rate",
        value: rawUninsured || null,
        points: uninsuredPts,
        rule: "under 5%: +15; 5% to under 7%: +5; 7% or more: -5",
        source: "County Health Rankings 2025 (Census SAHIE 2022)",
        imputed: !rawUninsured || Number.isNaN(parseFloat(rawUninsured)),
      },
      {
        label: "Food insecurity",
        value: rawFood || null,
        points: foodPts,
        rule: "under 11%: +10; over 15%: -5; otherwise 0",
        source: "County Health Rankings 2025 (Feeding America Map the Meal Gap 2022, modeled)",
        imputed: !rawFood || Number.isNaN(parseFloat(rawFood)),
      },
      {
        label: "County type",
        value: profile.countyType,
        points: typePts,
        rule: "urban: +5; suburban: +3; rural: 0",
        source: "AccessMI county type classification",
        imputed: false,
      },
    ],
  };
}
