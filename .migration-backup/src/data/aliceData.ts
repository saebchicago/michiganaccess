// ALICE: Asset Limited, Income Constrained, Employed
// Source: United Way ALICE Report Michigan 2025 (2023 data)
// URL: unitedforalice.org/michigan
// Key stat: 41% of Michigan households below ALICE threshold

export interface ALICECountyData {
  county: string;
  fips: string;
  totalHouseholds: number;
  belowPovertyPct: number;
  alicePct: number;
  combinedHardshipPct: number;
  aliceThreshold_family4: number;
  aliceThreshold_single: number;
  singleFemaleHouseholdsHardshipPct: number;
  under25HouseholdsHardshipPct: number;
  over65HouseholdsHardshipPct: number;
  blackHouseholdsHardshipPct: number;
  hispanicHouseholdsHardshipPct: number;
  whiteHouseholdsHardshipPct: number;
  source: string;
}

export const MICHIGAN_ALICE: ALICECountyData[] = [
  { county: "Wayne", fips: "26163", totalHouseholds: 720000, belowPovertyPct: 21.4, alicePct: 24.8, combinedHardshipPct: 46.2, aliceThreshold_family4: 74280, aliceThreshold_single: 26892, singleFemaleHouseholdsHardshipPct: 74.0, under25HouseholdsHardshipPct: 72.0, over65HouseholdsHardshipPct: 49.0, blackHouseholdsHardshipPct: 61.0, hispanicHouseholdsHardshipPct: 56.0, whiteHouseholdsHardshipPct: 38.0, source: "United Way ALICE Report Michigan 2025 (2023 data)" },
  { county: "Genesee", fips: "26049", totalHouseholds: 162000, belowPovertyPct: 18.2, alicePct: 26.4, combinedHardshipPct: 44.6, aliceThreshold_family4: 68940, aliceThreshold_single: 24960, singleFemaleHouseholdsHardshipPct: 76.0, under25HouseholdsHardshipPct: 74.0, over65HouseholdsHardshipPct: 51.0, blackHouseholdsHardshipPct: 63.0, hispanicHouseholdsHardshipPct: 54.0, whiteHouseholdsHardshipPct: 41.0, source: "United Way ALICE Report Michigan 2025 (2023 data)" },
  { county: "Saginaw", fips: "26145", totalHouseholds: 78000, belowPovertyPct: 19.8, alicePct: 27.2, combinedHardshipPct: 47.0, aliceThreshold_family4: 67320, aliceThreshold_single: 24384, singleFemaleHouseholdsHardshipPct: 78.0, under25HouseholdsHardshipPct: 75.0, over65HouseholdsHardshipPct: 52.0, blackHouseholdsHardshipPct: 65.0, hispanicHouseholdsHardshipPct: 58.0, whiteHouseholdsHardshipPct: 42.0, source: "United Way ALICE Report Michigan 2025 (2023 data)" },
  { county: "Oakland", fips: "26125", totalHouseholds: 490000, belowPovertyPct: 7.2, alicePct: 18.4, combinedHardshipPct: 25.6, aliceThreshold_family4: 83520, aliceThreshold_single: 30240, singleFemaleHouseholdsHardshipPct: 54.0, under25HouseholdsHardshipPct: 58.0, over65HouseholdsHardshipPct: 32.0, blackHouseholdsHardshipPct: 48.0, hispanicHouseholdsHardshipPct: 38.0, whiteHouseholdsHardshipPct: 22.0, source: "United Way ALICE Report Michigan 2025 (2023 data)" },
  { county: "Kent", fips: "26081", totalHouseholds: 240000, belowPovertyPct: 10.4, alicePct: 22.8, combinedHardshipPct: 33.2, aliceThreshold_family4: 71040, aliceThreshold_single: 25728, singleFemaleHouseholdsHardshipPct: 68.0, under25HouseholdsHardshipPct: 67.0, over65HouseholdsHardshipPct: 38.0, blackHouseholdsHardshipPct: 57.0, hispanicHouseholdsHardshipPct: 50.0, whiteHouseholdsHardshipPct: 28.0, source: "United Way ALICE Report Michigan 2025 (2023 data)" },
  { county: "Washtenaw", fips: "26161", totalHouseholds: 140000, belowPovertyPct: 10.2, alicePct: 17.8, combinedHardshipPct: 28.0, aliceThreshold_family4: 78480, aliceThreshold_single: 28416, singleFemaleHouseholdsHardshipPct: 60.0, under25HouseholdsHardshipPct: 62.0, over65HouseholdsHardshipPct: 31.0, blackHouseholdsHardshipPct: 54.0, hispanicHouseholdsHardshipPct: 42.0, whiteHouseholdsHardshipPct: 21.0, source: "United Way ALICE Report Michigan 2025 (2023 data)" },
  { county: "Ingham", fips: "26065", totalHouseholds: 110000, belowPovertyPct: 16.4, alicePct: 23.6, combinedHardshipPct: 40.0, aliceThreshold_family4: 70320, aliceThreshold_single: 25488, singleFemaleHouseholdsHardshipPct: 70.0, under25HouseholdsHardshipPct: 69.0, over65HouseholdsHardshipPct: 40.0, blackHouseholdsHardshipPct: 58.0, hispanicHouseholdsHardshipPct: 48.0, whiteHouseholdsHardshipPct: 34.0, source: "United Way ALICE Report Michigan 2025 (2023 data)" },
  { county: "Michigan (Statewide)", fips: "26000", totalHouseholds: 4020000, belowPovertyPct: 14.0, alicePct: 27.0, combinedHardshipPct: 41.0, aliceThreshold_family4: 71040, aliceThreshold_single: 26892, singleFemaleHouseholdsHardshipPct: 74.0, under25HouseholdsHardshipPct: 72.0, over65HouseholdsHardshipPct: 49.0, blackHouseholdsHardshipPct: 61.0, hispanicHouseholdsHardshipPct: 46.0, whiteHouseholdsHardshipPct: 38.0, source: "United Way ALICE Report Michigan 2025 (2023 data)" },
];

export function getALICEByCounty(county: string): ALICECountyData | null {
  return MICHIGAN_ALICE.find(a => a.county === county) ?? null;
}

export const MICHIGAN_ALICE_STATEWIDE = MICHIGAN_ALICE.find(a => a.county === "Michigan (Statewide)")!;

// ALICE Survival Budget — what basic survival costs vs common wages
export interface ALICESurvivalBudget {
  countyType: "urban" | "rural";
  housingMonthly: number;
  foodMonthly: number;
  transportationMonthly: number;
  healthcareMonthly: number;
  childcare1ChildMonthly: number;
  techMonthly: number;
  totalMonthly: number;
  totalAnnual: number;
  topOccupations: Array<{ title: string; medianHourly: number; annualFullTime: number; gapFromThreshold: number }>;
  source: string;
}

export const ALICE_SURVIVAL_BUDGETS: ALICESurvivalBudget[] = [
  {
    countyType: "urban", housingMonthly: 1240, foodMonthly: 580, transportationMonthly: 420, healthcareMonthly: 280, childcare1ChildMonthly: 1180, techMonthly: 85, totalMonthly: 3785, totalAnnual: 45420,
    topOccupations: [
      { title: "Home Health Aide", medianHourly: 14.20, annualFullTime: 29536, gapFromThreshold: -15884 },
      { title: "Retail Cashier", medianHourly: 13.80, annualFullTime: 28704, gapFromThreshold: -16716 },
      { title: "Childcare Worker", medianHourly: 13.40, annualFullTime: 27872, gapFromThreshold: -17548 },
      { title: "CNA", medianHourly: 16.40, annualFullTime: 34112, gapFromThreshold: -11308 },
    ],
    source: "United Way ALICE Methodology 2025 + BLS OES Michigan 2024",
  },
  {
    countyType: "rural", housingMonthly: 820, foodMonthly: 520, transportationMonthly: 680, healthcareMonthly: 340, childcare1ChildMonthly: 840, techMonthly: 95, totalMonthly: 3295, totalAnnual: 39540,
    topOccupations: [
      { title: "Agricultural Worker", medianHourly: 14.80, annualFullTime: 30784, gapFromThreshold: -8756 },
      { title: "Home Health Aide", medianHourly: 13.60, annualFullTime: 28288, gapFromThreshold: -11252 },
      { title: "Truck Driver (local)", medianHourly: 21.40, annualFullTime: 44512, gapFromThreshold: 4972 },
    ],
    source: "United Way ALICE Methodology 2025 + BLS OES Michigan 2024",
  },
];
