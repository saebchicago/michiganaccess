/** ALICE (Asset Limited, Income Constrained, Employed) data for Michigan.
 * Source: United For ALICE / Michigan Association of United Ways, 2023 data.
 * URL: unitedforalice.org/michigan */

export const ALICE_STATEWIDE = {
  totalHouseholds: 4_000_000,
  belowThreshold: 0.41,
  poverty: 0.14,
  alice: 0.27,
  aboveThreshold: 0.59,
  survivalBudgetSingleAdult: 29_604,
  survivalBudgetFamily4: 82_380,
};

export const ALICE_BY_RACE = [
  { group: "Black", pctBelow: 62, color: "#DC2626" },
  { group: "Hispanic", pctBelow: 44, color: "#F59E0B" },
  { group: "White", pctBelow: 38, color: "#3B82F6" },
  { group: "Asian", pctBelow: 30, color: "#10B981" },
];

export const ALICE_BY_AGE = [
  { group: "Under 25", pctBelow: 65, color: "#8B5CF6" },
  { group: "25-44", pctBelow: 40, color: "#3B82F6" },
  { group: "45-64", pctBelow: 35, color: "#10B981" },
  { group: "65+", pctBelow: 51, color: "#F59E0B" },
];

export const ALICE_BY_HOUSEHOLD = [
  { group: "Single female w/ kids", pctBelow: 75, color: "#DC2626" },
  { group: "Single male w/ kids", pctBelow: 62, color: "#F59E0B" },
  { group: "Single adult", pctBelow: 48, color: "#3B82F6" },
  { group: "Couple w/ kids", pctBelow: 32, color: "#10B981" },
];

export function estimateAliceRate(countyType: "urban" | "suburban" | "rural"): number {
  switch (countyType) {
    case "rural": return 48;
    case "suburban": return 36;
    case "urban": return 43;
  }
}
