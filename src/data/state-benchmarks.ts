/**
 * Michigan statewide benchmark values used across components for comparisons.
 * Single source of truth — update here to affect all comparison displays.
 *
 * Sources:
 *  - foodInsecurityRate: Feeding America Map the Meal Gap, 2022
 *  - primaryCareRatio: County Health Rankings 2024 (state median)
 *  - uninsuredRate: Census ACS 2022 5-year estimates
 *  - medianIncome: Census ACS 2022 5-year estimates
 *  - povertyRate: Census ACS 2022 5-year estimates
 *  - bachelorRate: Census ACS 2022 5-year estimates
 */
export const MI_STATE_BENCHMARKS = {
  foodInsecurityRate: 13.5, // Feeding America Map the Meal Gap, 2022
  primaryCareRatio: 1280,   // patients per PCP, County Health Rankings 2024
  uninsuredRate: 6.5,       // percent, Census ACS 2022
  medianIncome: 63202,      // dollars, Census ACS 2022
  povertyRate: 13.0,        // percent, Census ACS 2022
  bachelorRate: 29.6,       // percent, Census ACS 2022
} as const;
