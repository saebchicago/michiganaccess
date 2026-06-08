/**
 * SBA Small Business Lending Data - Michigan County-Level
 * Modeled from SBA FOIA FY2020-2024 (data.sba.gov). Illustrative county-level estimates.
 */

export interface SBACountyData {
  county: string;
  totalLoans: number;
  totalAmount: number;
  avgLoanSize: number;
  jobsSupported: number;
  topIndustry: string;
  minorityOwned: number;
  womenOwned: number;
  veteranOwned: number;
  perCapitaLending: number;
}

export const SBA_COUNTY_DATA: SBACountyData[] = [
  { county: "Wayne", totalLoans: 2150, totalAmount: 685000000, avgLoanSize: 318605, jobsSupported: 14200, topIndustry: "Manufacturing", minorityOwned: 28, womenOwned: 22, veteranOwned: 8, perCapitaLending: 390 },
  { county: "Oakland", totalLoans: 1820, totalAmount: 620000000, avgLoanSize: 340659, jobsSupported: 12800, topIndustry: "Professional Services", minorityOwned: 19, womenOwned: 25, veteranOwned: 7, perCapitaLending: 490 },
  { county: "Kent", totalLoans: 1240, totalAmount: 385000000, avgLoanSize: 310484, jobsSupported: 9200, topIndustry: "Healthcare", minorityOwned: 16, womenOwned: 23, veteranOwned: 6, perCapitaLending: 580 },
  { county: "Macomb", totalLoans: 980, totalAmount: 295000000, avgLoanSize: 301020, jobsSupported: 7100, topIndustry: "Manufacturing", minorityOwned: 14, womenOwned: 20, veteranOwned: 9, perCapitaLending: 335 },
  { county: "Washtenaw", totalLoans: 760, totalAmount: 265000000, avgLoanSize: 348684, jobsSupported: 5800, topIndustry: "Tech & Research", minorityOwned: 21, womenOwned: 27, veteranOwned: 5, perCapitaLending: 720 },
  { county: "Genesee", totalLoans: 520, totalAmount: 142000000, avgLoanSize: 273077, jobsSupported: 3400, topIndustry: "Retail Trade", minorityOwned: 22, womenOwned: 19, veteranOwned: 8, perCapitaLending: 345 },
  { county: "Ingham", totalLoans: 480, totalAmount: 138000000, avgLoanSize: 287500, jobsSupported: 3200, topIndustry: "Government Services", minorityOwned: 20, womenOwned: 24, veteranOwned: 6, perCapitaLending: 475 },
  { county: "Ottawa", totalLoans: 620, totalAmount: 195000000, avgLoanSize: 314516, jobsSupported: 4600, topIndustry: "Manufacturing", minorityOwned: 12, womenOwned: 18, veteranOwned: 7, perCapitaLending: 660 },
  { county: "Kalamazoo", totalLoans: 450, totalAmount: 128000000, avgLoanSize: 284444, jobsSupported: 3000, topIndustry: "Healthcare", minorityOwned: 17, womenOwned: 22, veteranOwned: 6, perCapitaLending: 485 },
  { county: "Berrien", totalLoans: 310, totalAmount: 82000000, avgLoanSize: 264516, jobsSupported: 2100, topIndustry: "Agriculture", minorityOwned: 15, womenOwned: 21, veteranOwned: 8, perCapitaLending: 540 },
  { county: "Saginaw", totalLoans: 280, totalAmount: 72000000, avgLoanSize: 257143, jobsSupported: 1800, topIndustry: "Manufacturing", minorityOwned: 19, womenOwned: 17, veteranOwned: 7, perCapitaLending: 375 },
  { county: "Muskegon", totalLoans: 260, totalAmount: 65000000, avgLoanSize: 250000, jobsSupported: 1700, topIndustry: "Tourism", minorityOwned: 16, womenOwned: 20, veteranOwned: 9, perCapitaLending: 375 },
  { county: "St. Clair", totalLoans: 220, totalAmount: 58000000, avgLoanSize: 263636, jobsSupported: 1500, topIndustry: "Retail Trade", minorityOwned: 8, womenOwned: 19, veteranOwned: 10, perCapitaLending: 360 },
  { county: "Livingston", totalLoans: 310, totalAmount: 98000000, avgLoanSize: 316129, jobsSupported: 2200, topIndustry: "Construction", minorityOwned: 6, womenOwned: 22, veteranOwned: 8, perCapitaLending: 510 },
  { county: "Jackson", totalLoans: 190, totalAmount: 48000000, avgLoanSize: 252632, jobsSupported: 1300, topIndustry: "Manufacturing", minorityOwned: 13, womenOwned: 18, veteranOwned: 7, perCapitaLending: 310 },
  { county: "Monroe", totalLoans: 180, totalAmount: 45000000, avgLoanSize: 250000, jobsSupported: 1200, topIndustry: "Retail Trade", minorityOwned: 9, womenOwned: 20, veteranOwned: 9, perCapitaLending: 300 },
  { county: "Calhoun", totalLoans: 200, totalAmount: 52000000, avgLoanSize: 260000, jobsSupported: 1400, topIndustry: "Food Processing", minorityOwned: 16, womenOwned: 19, veteranOwned: 10, perCapitaLending: 390 },
  { county: "Eaton", totalLoans: 170, totalAmount: 46000000, avgLoanSize: 270588, jobsSupported: 1100, topIndustry: "Professional Services", minorityOwned: 11, womenOwned: 23, veteranOwned: 6, perCapitaLending: 420 },
  { county: "Grand Traverse", totalLoans: 290, totalAmount: 88000000, avgLoanSize: 303448, jobsSupported: 2000, topIndustry: "Tourism", minorityOwned: 5, womenOwned: 26, veteranOwned: 8, perCapitaLending: 920 },
  { county: "Midland", totalLoans: 160, totalAmount: 48000000, avgLoanSize: 300000, jobsSupported: 1000, topIndustry: "Chemical Manufacturing", minorityOwned: 10, womenOwned: 21, veteranOwned: 7, perCapitaLending: 580 },
  { county: "Bay", totalLoans: 150, totalAmount: 38000000, avgLoanSize: 253333, jobsSupported: 950, topIndustry: "Healthcare", minorityOwned: 11, womenOwned: 18, veteranOwned: 8, perCapitaLending: 360 },
  { county: "Marquette", totalLoans: 180, totalAmount: 52000000, avgLoanSize: 288889, jobsSupported: 1200, topIndustry: "Healthcare", minorityOwned: 7, womenOwned: 24, veteranOwned: 9, perCapitaLending: 770 },
  { county: "Lenawee", totalLoans: 120, totalAmount: 30000000, avgLoanSize: 250000, jobsSupported: 800, topIndustry: "Agriculture", minorityOwned: 9, womenOwned: 17, veteranOwned: 8, perCapitaLending: 305 },
  { county: "Allegan", totalLoans: 200, totalAmount: 55000000, avgLoanSize: 275000, jobsSupported: 1400, topIndustry: "Agriculture", minorityOwned: 10, womenOwned: 19, veteranOwned: 7, perCapitaLending: 470 },
  { county: "Isabella", totalLoans: 110, totalAmount: 28000000, avgLoanSize: 254545, jobsSupported: 700, topIndustry: "Education", minorityOwned: 14, womenOwned: 22, veteranOwned: 5, perCapitaLending: 400 },
];

export const MI_SBA_TOTALS = {
  totalLoans: 12500,
  totalAmount: 3200000000,
  avgLoanSize: 256000,
  jobsSupported: 85000,
  minorityOwnedAvg: 18,
  womenOwnedAvg: 21,
  veteranOwnedAvg: 7,
};
