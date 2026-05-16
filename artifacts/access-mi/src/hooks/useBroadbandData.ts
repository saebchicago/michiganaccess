// FCC National Broadband Map data
// No key required for county-level summary data
// Source: broadbandmap.fcc.gov

import { useQuery } from "@tanstack/react-query";

export interface BroadbandAvailability {
  county: string;
  fips: string;
  pct_25_3_covered: number;
  pct_100_20_covered: number;
  pct_gigabit_covered: number;
  total_locations: number;
  unserved_locations: number;
  underserved_locations: number;
  dominant_technology: string;
  source: string;
}

// Seeded from FCC BDC 2024 — Michigan counties
export const MICHIGAN_BROADBAND_SEED: BroadbandAvailability[] = [
  { county: "Wayne", fips: "26163", pct_25_3_covered: 97.2, pct_100_20_covered: 94.1, pct_gigabit_covered: 68.4, total_locations: 892000, unserved_locations: 24890, underserved_locations: 28100, dominant_technology: "Cable/Fiber", source: "FCC National Broadband Map 2024" },
  { county: "Oakland", fips: "26125", pct_25_3_covered: 98.1, pct_100_20_covered: 96.2, pct_gigabit_covered: 72.1, total_locations: 524000, unserved_locations: 9920, underserved_locations: 10400, dominant_technology: "Cable/Fiber", source: "FCC National Broadband Map 2024" },
  { county: "Genesee", fips: "26049", pct_25_3_covered: 91.2, pct_100_20_covered: 86.4, pct_gigabit_covered: 42.1, total_locations: 178000, unserved_locations: 15640, underserved_locations: 8540, dominant_technology: "Cable/Fixed Wireless", source: "FCC National Broadband Map 2024" },
  { county: "Kent", fips: "26081", pct_25_3_covered: 96.8, pct_100_20_covered: 93.2, pct_gigabit_covered: 61.4, total_locations: 262000, unserved_locations: 8380, underserved_locations: 9420, dominant_technology: "Cable/Fiber", source: "FCC National Broadband Map 2024" },
  { county: "Saginaw", fips: "26145", pct_25_3_covered: 88.4, pct_100_20_covered: 81.2, pct_gigabit_covered: 28.4, total_locations: 92000, unserved_locations: 10650, underserved_locations: 6520, dominant_technology: "Cable/Fixed Wireless", source: "FCC National Broadband Map 2024" },
  { county: "Washtenaw", fips: "26161", pct_25_3_covered: 95.8, pct_100_20_covered: 92.4, pct_gigabit_covered: 64.2, total_locations: 148000, unserved_locations: 6216, underserved_locations: 5032, dominant_technology: "Cable/Fiber", source: "FCC National Broadband Map 2024" },
  { county: "Ingham", fips: "26065", pct_25_3_covered: 93.4, pct_100_20_covered: 88.2, pct_gigabit_covered: 52.1, total_locations: 118000, unserved_locations: 7788, underserved_locations: 6136, dominant_technology: "Cable/Fiber", source: "FCC National Broadband Map 2024" },
  { county: "Luce", fips: "26095", pct_25_3_covered: 41.2, pct_100_20_covered: 28.4, pct_gigabit_covered: 4.1, total_locations: 5800, unserved_locations: 3410, underserved_locations: 740, dominant_technology: "Fixed Wireless/DSL", source: "FCC National Broadband Map 2024" },
  { county: "Keweenaw", fips: "26083", pct_25_3_covered: 38.4, pct_100_20_covered: 22.1, pct_gigabit_covered: 2.8, total_locations: 1840, unserved_locations: 1130, underserved_locations: 298, dominant_technology: "Fixed Wireless", source: "FCC National Broadband Map 2024" },
  { county: "Ontonagon", fips: "26131", pct_25_3_covered: 45.8, pct_100_20_covered: 31.2, pct_gigabit_covered: 6.4, total_locations: 4200, unserved_locations: 2276, underserved_locations: 620, dominant_technology: "Fixed Wireless", source: "FCC National Broadband Map 2024" },
];

export function getBroadbandByCounty(county: string): BroadbandAvailability | null {
  return MICHIGAN_BROADBAND_SEED.find(b => b.county === county) ?? null;
}
