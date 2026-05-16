// USDA Food Access Research Atlas data
// Source: USDA ERS Food Access Research Atlas 2019
// Download: ers.usda.gov/data-products/food-access-research-atlas

export interface FoodAccessData {
  county: string;
  fips: string;
  lowAccessTracts: number;
  totalTracts: number;
  lowAccessPct: number;
  lowIncomeLowAccessPop: number;
  lowAccessPop: number;
  noVehicleLowAccessPop: number;
  seniorLowAccessPop: number;
  classification: "Food Desert" | "Low Access" | "Moderate" | "Good Access";
  source: string;
}

export const MICHIGAN_FOOD_ACCESS: FoodAccessData[] = [
  { county: "Wayne", fips: "26163", lowAccessTracts: 142, totalTracts: 410, lowAccessPct: 34.6, lowIncomeLowAccessPop: 248000, lowAccessPop: 312000, noVehicleLowAccessPop: 98000, seniorLowAccessPop: 42000, classification: "Food Desert", source: "USDA Food Access Research Atlas 2019" },
  { county: "Genesee", fips: "26049", lowAccessTracts: 48, totalTracts: 121, lowAccessPct: 39.7, lowIncomeLowAccessPop: 84000, lowAccessPop: 108000, noVehicleLowAccessPop: 28000, seniorLowAccessPop: 18000, classification: "Food Desert", source: "USDA Food Access Research Atlas 2019" },
  { county: "Saginaw", fips: "26145", lowAccessTracts: 38, totalTracts: 76, lowAccessPct: 50.0, lowIncomeLowAccessPop: 62000, lowAccessPop: 78000, noVehicleLowAccessPop: 18000, seniorLowAccessPop: 14000, classification: "Food Desert", source: "USDA Food Access Research Atlas 2019" },
  { county: "Oakland", fips: "26125", lowAccessTracts: 28, totalTracts: 346, lowAccessPct: 8.1, lowIncomeLowAccessPop: 24000, lowAccessPop: 48000, noVehicleLowAccessPop: 4800, seniorLowAccessPop: 8200, classification: "Low Access", source: "USDA Food Access Research Atlas 2019" },
  { county: "Kent", fips: "26081", lowAccessTracts: 32, totalTracts: 182, lowAccessPct: 17.6, lowIncomeLowAccessPop: 42000, lowAccessPop: 68000, noVehicleLowAccessPop: 12000, seniorLowAccessPop: 9800, classification: "Low Access", source: "USDA Food Access Research Atlas 2019" },
  { county: "Washtenaw", fips: "26161", lowAccessTracts: 8, totalTracts: 94, lowAccessPct: 8.5, lowIncomeLowAccessPop: 8200, lowAccessPop: 18000, noVehicleLowAccessPop: 2400, seniorLowAccessPop: 3200, classification: "Moderate", source: "USDA Food Access Research Atlas 2019" },
  { county: "Ingham", fips: "26065", lowAccessTracts: 24, totalTracts: 92, lowAccessPct: 26.1, lowIncomeLowAccessPop: 38000, lowAccessPop: 52000, noVehicleLowAccessPop: 9800, seniorLowAccessPop: 7400, classification: "Low Access", source: "USDA Food Access Research Atlas 2019" },
];

export function getFoodAccessByCounty(county: string): FoodAccessData | null {
  return MICHIGAN_FOOD_ACCESS.find(f => f.county === county) ?? null;
}
