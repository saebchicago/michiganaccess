/**
 * EPA Toxic Release Inventory (TRI), 2022 reporting year.
 * Source: enviro.epa.gov/triexplorer
 * Michigan facilities with significant toxic chemical releases.
 */

export interface TRIFacility {
  name: string;
  city: string;
  county: string;
  zip: string;
  latitude: number;
  longitude: number;
  totalPoundsReleased: number;
  topChemical: string;
  industry: string;
  carcinogensReleased: boolean;
}

export const TRI_FACILITIES: TRIFacility[] = [
  { name: "Marathon Petroleum", city: "Detroit", county: "Wayne", zip: "48217", latitude: 42.2810, longitude: -83.1500, totalPoundsReleased: 2850000, topChemical: "Ammonia", industry: "Petroleum Refining", carcinogensReleased: true },
  { name: "US Steel Great Lakes Works", city: "Ecorse", county: "Wayne", zip: "48229", latitude: 42.2440, longitude: -83.1460, totalPoundsReleased: 1950000, topChemical: "Manganese", industry: "Steel Manufacturing", carcinogensReleased: true },
  { name: "DTE Energy Monroe", city: "Monroe", county: "Monroe", zip: "48161", latitude: 41.8940, longitude: -83.3830, totalPoundsReleased: 1420000, topChemical: "Hydrochloric acid", industry: "Electric Power", carcinogensReleased: false },
  { name: "Dow Chemical", city: "Midland", county: "Midland", zip: "48674", latitude: 43.6150, longitude: -84.2320, totalPoundsReleased: 1180000, topChemical: "Methanol", industry: "Chemical Manufacturing", carcinogensReleased: true },
  { name: "GM Flint Assembly", city: "Flint", county: "Genesee", zip: "48505", latitude: 43.0440, longitude: -83.7150, totalPoundsReleased: 680000, topChemical: "Xylene", industry: "Motor Vehicle", carcinogensReleased: false },
  { name: "Consumers Energy Karn-Weadock", city: "Essexville", county: "Bay", zip: "48732", latitude: 43.6330, longitude: -83.8530, totalPoundsReleased: 620000, topChemical: "Sulfuric acid", industry: "Electric Power", carcinogensReleased: false },
  { name: "Ford Rouge Complex", city: "Dearborn", county: "Wayne", zip: "48120", latitude: 42.2990, longitude: -83.1510, totalPoundsReleased: 540000, topChemical: "Zinc compounds", industry: "Motor Vehicle", carcinogensReleased: false },
  { name: "Verso Paper", city: "Escanaba", county: "Delta", zip: "49829", latitude: 45.7390, longitude: -87.0780, totalPoundsReleased: 480000, topChemical: "Methanol", industry: "Paper Manufacturing", carcinogensReleased: false },
  { name: "AK Steel", city: "Dearborn", county: "Wayne", zip: "48120", latitude: 42.3020, longitude: -83.1530, totalPoundsReleased: 420000, topChemical: "Manganese", industry: "Steel Manufacturing", carcinogensReleased: true },
  { name: "BASF", city: "Wyandotte", county: "Wayne", zip: "48192", latitude: 42.2100, longitude: -83.1560, totalPoundsReleased: 380000, topChemical: "Nitric acid", industry: "Chemical Manufacturing", carcinogensReleased: false },
  { name: "Consumers Energy Campbell", city: "West Olive", county: "Ottawa", zip: "49460", latitude: 42.9200, longitude: -86.1720, totalPoundsReleased: 350000, topChemical: "Hydrochloric acid", industry: "Electric Power", carcinogensReleased: false },
  { name: "Hemlock Semiconductor", city: "Hemlock", county: "Saginaw", zip: "48626", latitude: 43.4180, longitude: -84.2270, totalPoundsReleased: 280000, topChemical: "Hydrochloric acid", industry: "Semiconductor", carcinogensReleased: false },
  { name: "Graphic Packaging", city: "Kalamazoo", county: "Kalamazoo", zip: "49001", latitude: 42.2870, longitude: -85.5870, totalPoundsReleased: 120000, topChemical: "Methanol", industry: "Paper Manufacturing", carcinogensReleased: false },
  { name: "Cascade Engineering", city: "Grand Rapids", county: "Kent", zip: "49512", latitude: 42.8880, longitude: -85.5370, totalPoundsReleased: 95000, topChemical: "Styrene", industry: "Plastics Manufacturing", carcinogensReleased: true },
  { name: "Pfizer", city: "Kalamazoo", county: "Kalamazoo", zip: "49001", latitude: 42.2750, longitude: -85.5920, totalPoundsReleased: 85000, topChemical: "Methanol", industry: "Pharmaceutical", carcinogensReleased: false },
];

export function getTRIByCounty(county: string): TRIFacility[] {
  const normalized = county.toLowerCase().replace(/ county$/i, "").trim();
  return TRI_FACILITIES.filter(
    (f) => f.county.toLowerCase() === normalized
  ).sort((a, b) => b.totalPoundsReleased - a.totalPoundsReleased);
}
