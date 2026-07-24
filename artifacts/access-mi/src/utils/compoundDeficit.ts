/**
 * Compound Access Deficit Index (CADI).
 *
 * Single authoritative scoring function shared by every surface that
 * displays the CADI score - atlas map layer, county detail panel, and
 * the rankings table. Keeping the formula here prevents a split where
 * different surfaces show different numbers for the same county.
 *
 * Scale: 0-100. Higher = more compounding access barriers.
 *
 * -- Round 6 rewrite: sourced inputs only ------------------------------
 * This index previously combined seven dimensions, five of which were not
 * measured. `broadband`, `transit`, `ej`, and `energy` were constants keyed
 * off `countyType` alone (every rural county scored transit=85, every urban
 * county broadband=20), and `svi` was `(uninsured + food) * 2.5` presented
 * under the name of CDC's Social Vulnerability Index, which it had no
 * relationship to. Together those five carried 65% of the weight, so two
 * counties differing only in those dimensions received identical scores.
 *
 * The index now scores only dimensions with a real per-county source:
 *
 *   1. Uninsured rate        - County Health Rankings 2025 (SAHIE 2022)
 *   2. Food insecurity       - County Health Rankings 2025 (Map the Meal Gap 2022)
 *   3. Primary care shortage - HRSA HPSA facility detail files (Jun 2026)
 *
 * Dropped dimensions are NOT silently folded into a proxy; they are gone
 * until a real per-county source exists. Two candidates were evaluated and
 * rejected: `acs-broadband-county.generated.json` is entirely
 * `"status":"pending-ci"` (ACS_BROADBAND_IS_POPULATED === false), and
 * `ejscreen.ts` covers 15 ZCTAs, not 83 counties.
 *
 * Weighting is equal thirds. Any other split would be an unsourced editorial
 * judgment about which barrier matters more - the class of invented number
 * this rewrite exists to remove.
 *
 * Normalization is min-max across the observed 83-county distribution rather
 * than hand-picked cutoffs, so a score states where a county falls within
 * Michigan's real range. Provider shortage needs no normalization: it is
 * already a proportion (FTEs still needed / total FTEs needed).
 *
 * Because two of the three inputs are themselves modeled estimates (Map the
 * Meal Gap, and the HPSA county rollup), the composite is MODELED.
 *
 * NOTE: scores are not comparable to pre-Round-6 values.
 */

import {
  COUNTY_PROFILES,
  COUNTY_UNINSURED_SOURCE,
  COUNTY_FOOD_INSECURITY_SOURCE,
  type CountyProfile,
} from "@/data/michigan-county-profiles";
import { getHpsaForCountyName } from "@/data/hrsa-hpsa-county";

/** Named sources behind each scored dimension, for on-surface citation. */
export const CADI_SOURCES = [
  COUNTY_UNINSURED_SOURCE,
  COUNTY_FOOD_INSECURITY_SOURCE,
  "HRSA HPSA facility detail files (Jun 2026)",
] as const;

/** Provenance for surfaces that render the score. */
export const CADI_PROVENANCE = {
  label: "MODELED" as const,
  source: "County Health Rankings 2025; HRSA HPSA",
  vintage: "2022-2026",
  note: "Equal-weighted composite of three sourced dimensions: uninsured rate, food insecurity, and primary care shortage.",
};

export interface CompoundDeficitScore {
  /** 0-100, min-max across the 83-county uninsured range. */
  uninsured: number;
  /** 0-100, min-max across the 83-county food insecurity range. */
  food: number;
  /** 0-100. Share of needed primary care FTEs not yet in place. */
  providerShortage: number;
  /** 0-100 equal-weighted composite of the three above. */
  compound: number;
  tier: "Critical" | "High" | "Moderate" | "Low";
}

export function tierFromScore(score: number): CompoundDeficitScore["tier"] {
  if (score >= 75) return "Critical";
  if (score >= 50) return "High";
  if (score >= 25) return "Moderate";
  return "Low";
}

/** healthHighlights is ordered [uninsured, primary-care ratio, food insecurity]. */
const UNINSURED_INDEX = 0;
const FOOD_INDEX = 2;

function parseMeasure(profile: CountyProfile, index: number): number | null {
  const raw = profile.healthHighlights[index]?.value;
  if (!raw) return null;
  const n = parseFloat(raw.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : null;
}

/**
 * Observed min/max across all 83 counties, computed once at module load.
 * Places a county within Michigan's real range instead of against
 * invented cutoffs.
 */
const RANGES = (() => {
  const uninsured: number[] = [];
  const food: number[] = [];
  for (const profile of Object.values(COUNTY_PROFILES)) {
    const u = parseMeasure(profile, UNINSURED_INDEX);
    const f = parseMeasure(profile, FOOD_INDEX);
    if (u !== null) uninsured.push(u);
    if (f !== null) food.push(f);
  }
  return {
    uninsured: {
      min: uninsured.length ? Math.min(...uninsured) : 0,
      max: uninsured.length ? Math.max(...uninsured) : 0,
    },
    food: {
      min: food.length ? Math.min(...food) : 0,
      max: food.length ? Math.max(...food) : 0,
    },
  };
})();

function normalize(
  value: number | null,
  range: { min: number; max: number },
): number | null {
  if (value === null) return null;
  const span = range.max - range.min;
  if (span <= 0) return 0;
  const pct = ((value - range.min) / span) * 100;
  return Math.max(0, Math.min(100, pct));
}

/**
 * Share of needed primary care capacity still missing, 0-100. A county with
 * no designated shortage area scores 0: HRSA has not identified a primary
 * care shortage there. A county absent from the rollup returns null so it is
 * excluded from the average rather than counted as "no barrier."
 */
function providerShortageScore(county: string): number | null {
  const pc = getHpsaForCountyName(county)?.disciplines.primaryCare;
  if (!pc) return null;
  const total = pc.providerFte + pc.shortageFte;
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, (pc.shortageFte / total) * 100));
}

/**
 * County-level CADI. Requires the county name so provider shortage can be
 * resolved from the HRSA rollup - a profile alone does not identify a county.
 *
 * Dimensions with no data for a county are excluded from that county's
 * average rather than defaulted, so a missing input never silently reads as
 * "no barrier."
 */
export function computeCompoundDeficit(
  county: string,
  profile: CountyProfile,
): CompoundDeficitScore {
  const uninsured = normalize(
    parseMeasure(profile, UNINSURED_INDEX),
    RANGES.uninsured,
  );
  const food = normalize(parseMeasure(profile, FOOD_INDEX), RANGES.food);
  const providerShortage = providerShortageScore(county);

  const present = [uninsured, food, providerShortage].filter(
    (v): v is number => v !== null,
  );
  const compound =
    present.length > 0
      ? Math.round((present.reduce((a, b) => a + b, 0) / present.length) * 10) /
        10
      : 0;

  return {
    uninsured: uninsured ?? 0,
    food: food ?? 0,
    providerShortage: providerShortage ?? 0,
    compound,
    tier: tierFromScore(compound),
  };
}
