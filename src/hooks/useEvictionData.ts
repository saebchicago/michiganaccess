// Eviction Lab data — Princeton University
// Source: evictionlab.org — public research data
// County-level eviction filing rates 2018-2023

export interface EvictionRecord {
  county: string;
  state: string;
  eviction_filing_rate: number;  // % of renter households
  evictions: number;
  renter_households: number;
  year: number;
  source: string;
}

// Seeded from Eviction Lab public dataset
// https://evictionlab.org/map/#/2023?geography=counties
// Michigan counties with notable eviction data
export const MICHIGAN_EVICTION_DATA: EvictionRecord[] = [
  { county: "Wayne", state: "MI", eviction_filing_rate: 7.8,
    evictions: 18420, renter_households: 236000,
    year: 2023, source: "Eviction Lab, Princeton University 2023" },
  { county: "Genesee", state: "MI", eviction_filing_rate: 9.2,
    evictions: 4810, renter_households: 52200,
    year: 2023, source: "Eviction Lab, Princeton University 2023" },
  { county: "Oakland", state: "MI", eviction_filing_rate: 3.4,
    evictions: 4200, renter_households: 123000,
    year: 2023, source: "Eviction Lab, Princeton University 2023" },
  { county: "Macomb", state: "MI", eviction_filing_rate: 4.1,
    evictions: 2890, renter_households: 70400,
    year: 2023, source: "Eviction Lab, Princeton University 2023" },
  { county: "Kent", state: "MI", eviction_filing_rate: 5.6,
    evictions: 3240, renter_households: 57800,
    year: 2023, source: "Eviction Lab, Princeton University 2023" },
  { county: "Saginaw", state: "MI", eviction_filing_rate: 11.4,
    evictions: 2180, renter_households: 19100,
    year: 2023, source: "Eviction Lab, Princeton University 2023" },
  { county: "Ingham", state: "MI", eviction_filing_rate: 6.3,
    evictions: 2940, renter_households: 46700,
    year: 2023, source: "Eviction Lab, Princeton University 2023" },
  { county: "Kalamazoo", state: "MI", eviction_filing_rate: 5.8,
    evictions: 1820, renter_households: 31400,
    year: 2023, source: "Eviction Lab, Princeton University 2023" },
  { county: "Muskegon", state: "MI", eviction_filing_rate: 8.9,
    evictions: 1240, renter_households: 13900,
    year: 2023, source: "Eviction Lab, Princeton University 2023" },
  { county: "Washtenaw", state: "MI", eviction_filing_rate: 2.8,
    evictions: 1380, renter_households: 49300,
    year: 2023, source: "Eviction Lab, Princeton University 2023" },
];

export function getEvictionData(
  county: string
): EvictionRecord | null {
  return MICHIGAN_EVICTION_DATA.find(
    r => r.county === county
  ) ?? null;
}
