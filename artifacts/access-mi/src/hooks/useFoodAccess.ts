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

// Suppressed 2026-10-22. The seven hand-entered rows that lived here could not
// be traced to the FARA 2019 file: every population field was rounded to the
// thousand, which tract-level sums from that release do not produce. Rendering
// them under a "USDA FARA 2019" label broke the no-unlabeled-data rule.
// Regenerate from the ERS download (tract file, summed to county) before
// re-populating; consumers already render nothing when a county has no row.
export const MICHIGAN_FOOD_ACCESS: FoodAccessData[] = [];

export function getFoodAccessByCounty(county: string): FoodAccessData | null {
  return MICHIGAN_FOOD_ACCESS.find(f => f.county === county) ?? null;
}
