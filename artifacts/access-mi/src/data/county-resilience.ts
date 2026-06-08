/**
 * Resilience inputs for 25 major Michigan counties.
 * Sources: FEMA disaster declarations, SBA FOIA loan data, Census ACS 2022,
 * County Health Rankings & Roadmaps, 2025 edition, United For ALICE 2023, FCC broadband data.
 * Values are illustrative composites - not validated survey data.
 */

import type { ResilienceInput } from "@/lib/resilience-score";

export const COUNTY_RESILIENCE: ResilienceInput[] = [
  { county: "Wayne",       disasterCount: 25, sbaPerCapita: 320, medianIncome: 48_200, healthScore: 45, aliceRate: 48, broadbandPct: 86 },
  { county: "Oakland",     disasterCount: 20, sbaPerCapita: 580, medianIncome: 82_500, healthScore: 72, aliceRate: 30, broadbandPct: 94 },
  { county: "Macomb",      disasterCount: 19, sbaPerCapita: 410, medianIncome: 60_100, healthScore: 58, aliceRate: 36, broadbandPct: 92 },
  { county: "Kent",        disasterCount: 16, sbaPerCapita: 490, medianIncome: 66_800, healthScore: 65, aliceRate: 34, broadbandPct: 91 },
  { county: "Genesee",     disasterCount: 22, sbaPerCapita: 280, medianIncome: 45_600, healthScore: 42, aliceRate: 46, broadbandPct: 85 },
  { county: "Washtenaw",   disasterCount: 12, sbaPerCapita: 620, medianIncome: 76_400, healthScore: 75, aliceRate: 28, broadbandPct: 95 },
  { county: "Ingham",      disasterCount: 14, sbaPerCapita: 390, medianIncome: 55_900, healthScore: 60, aliceRate: 38, broadbandPct: 90 },
  { county: "Ottawa",      disasterCount: 10, sbaPerCapita: 510, medianIncome: 72_300, healthScore: 70, aliceRate: 26, broadbandPct: 92 },
  { county: "Kalamazoo",   disasterCount: 13, sbaPerCapita: 370, medianIncome: 56_500, healthScore: 62, aliceRate: 37, broadbandPct: 89 },
  { county: "Saginaw",     disasterCount: 18, sbaPerCapita: 260, medianIncome: 44_800, healthScore: 44, aliceRate: 45, broadbandPct: 84 },
  { county: "Muskegon",    disasterCount: 14, sbaPerCapita: 240, medianIncome: 47_200, healthScore: 48, aliceRate: 44, broadbandPct: 82 },
  { county: "Berrien",     disasterCount: 12, sbaPerCapita: 290, medianIncome: 50_100, healthScore: 50, aliceRate: 42, broadbandPct: 80 },
  { county: "Grand Traverse", disasterCount: 8, sbaPerCapita: 440, medianIncome: 63_200, healthScore: 68, aliceRate: 32, broadbandPct: 85 },
  { county: "Livingston",  disasterCount: 10, sbaPerCapita: 530, medianIncome: 85_600, healthScore: 74, aliceRate: 24, broadbandPct: 93 },
  { county: "St. Clair",   disasterCount: 15, sbaPerCapita: 300, medianIncome: 52_800, healthScore: 52, aliceRate: 40, broadbandPct: 83 },
  { county: "Jackson",     disasterCount: 13, sbaPerCapita: 270, medianIncome: 50_400, healthScore: 50, aliceRate: 41, broadbandPct: 81 },
  { county: "Monroe",      disasterCount: 14, sbaPerCapita: 340, medianIncome: 59_200, healthScore: 55, aliceRate: 36, broadbandPct: 87 },
  { county: "Calhoun",     disasterCount: 14, sbaPerCapita: 250, medianIncome: 47_900, healthScore: 46, aliceRate: 44, broadbandPct: 80 },
  { county: "Eaton",       disasterCount: 11, sbaPerCapita: 380, medianIncome: 64_100, healthScore: 63, aliceRate: 32, broadbandPct: 88 },
  { county: "Bay",         disasterCount: 16, sbaPerCapita: 270, medianIncome: 49_500, healthScore: 49, aliceRate: 42, broadbandPct: 83 },
  { county: "Midland",     disasterCount: 15, sbaPerCapita: 400, medianIncome: 62_700, healthScore: 64, aliceRate: 30, broadbandPct: 89 },
  { county: "Allegan",     disasterCount: 9,  sbaPerCapita: 350, medianIncome: 63_500, healthScore: 60, aliceRate: 34, broadbandPct: 78 },
  { county: "Marquette",   disasterCount: 10, sbaPerCapita: 310, medianIncome: 51_200, healthScore: 58, aliceRate: 38, broadbandPct: 72 },
  { county: "Emmet",       disasterCount: 7,  sbaPerCapita: 420, medianIncome: 58_900, healthScore: 66, aliceRate: 33, broadbandPct: 76 },
  { county: "Luce",        disasterCount: 5,  sbaPerCapita: 180, medianIncome: 38_400, healthScore: 40, aliceRate: 50, broadbandPct: 62 },
];

export function getResilienceInput(county: string): ResilienceInput | undefined {
  return COUNTY_RESILIENCE.find(
    (c) => c.county.toLowerCase() === county.toLowerCase(),
  );
}
