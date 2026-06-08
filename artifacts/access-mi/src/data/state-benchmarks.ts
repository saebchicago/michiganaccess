/**
 * Michigan statewide benchmark values used across components for comparisons.
 * Single source of truth - update here to affect all comparison displays.
 *
 * Sources:
 *  - foodInsecurityRate: Feeding America, Map the Meal Gap 2024, Michigan state summary
 *    https://map.feedingamerica.org/county/2022/overall/michigan
 *  - primaryCareRatio: County Health Rankings & Roadmaps, 2025 edition (state median)
 *    https://www.countyhealthrankings.org/health-data/michigan
 *  - uninsuredRate: County Health Rankings & Roadmaps, 2025 edition
 *    https://www.countyhealthrankings.org/health-data/michigan
 *  - medianIncome: Census ACS 2022 5-year estimates
 *  - povertyRate: Census ACS 2022 5-year estimates
 *  - bachelorRate: Census ACS 2022 5-year estimates
 */
export const MI_STATE_BENCHMARKS = {
  foodInsecurityRate: 13.3, // Feeding America, Map the Meal Gap 2024, Michigan state summary
  primaryCareRatio: 1240,   // patients per PCP, County Health Rankings & Roadmaps 2025 edition
  uninsuredRate: 5,         // percent, County Health Rankings & Roadmaps 2025 edition
  medianIncome: 63202,      // dollars, Census ACS 2022
  povertyRate: 13.0,        // percent, Census ACS 2022
  bachelorRate: 29.6,       // percent, Census ACS 2022
} as const;
