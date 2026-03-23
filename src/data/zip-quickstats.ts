/** Instant ZIP quick stats — hardcoded for ~30 major Michigan ZIPs.
 * Source: Census ACS 2022, MI Treasury, MI School Data */

export interface ZipQuickStat {
  zip: string;
  city: string;
  county: string;
  population: number;
  medianIncome: number;
  medianRent: number;
  cityTax: string;
  propTaxEst: number;
  gradRate: number;
}

export const ZIP_QUICKSTATS: Record<string, ZipQuickStat> = {
  "48201": { zip: "48201", city: "Detroit (Downtown)", county: "Wayne", population: 12500, medianIncome: 28400, medianRent: 850, cityTax: "2.4%", propTaxEst: 2100, gradRate: 72 },
  "48126": { zip: "48126", city: "Dearborn", county: "Wayne", population: 55800, medianIncome: 52100, medianRent: 950, cityTax: "0%", propTaxEst: 4560, gradRate: 88 },
  "48075": { zip: "48075", city: "Southfield", county: "Oakland", population: 37200, medianIncome: 48600, medianRent: 1050, cityTax: "0%", propTaxEst: 4280, gradRate: 80 },
  "48084": { zip: "48084", city: "Troy", county: "Oakland", population: 42100, medianIncome: 98400, medianRent: 1250, cityTax: "0%", propTaxEst: 6545, gradRate: 96 },
  "48154": { zip: "48154", city: "Livonia", county: "Wayne", population: 48300, medianIncome: 72800, medianRent: 1100, cityTax: "0%", propTaxEst: 5203, gradRate: 93 },
  "48067": { zip: "48067", city: "Royal Oak", county: "Oakland", population: 30200, medianIncome: 68500, medianRent: 1150, cityTax: "0%", propTaxEst: 6561, gradRate: 92 },
  "48103": { zip: "48103", city: "Ann Arbor", county: "Washtenaw", population: 38400, medianIncome: 85200, medianRent: 1400, cityTax: "0%", propTaxEst: 10282, gradRate: 94 },
  "49503": { zip: "49503", city: "Grand Rapids", county: "Kent", population: 42800, medianIncome: 48200, medianRent: 1050, cityTax: "1.5%", propTaxEst: 4922, gradRate: 78 },
  "49001": { zip: "49001", city: "Kalamazoo", county: "Kalamazoo", population: 35100, medianIncome: 35600, medianRent: 880, cityTax: "0%", propTaxEst: 4305, gradRate: 76 },
  "48823": { zip: "48823", city: "East Lansing", county: "Ingham", population: 48600, medianIncome: 36800, medianRent: 1100, cityTax: "1%", propTaxEst: 6026, gradRate: 91 },
  "48912": { zip: "48912", city: "Lansing", county: "Ingham", population: 28400, medianIncome: 42100, medianRent: 890, cityTax: "1%", propTaxEst: 3348, gradRate: 73 },
  "48502": { zip: "48502", city: "Flint", county: "Genesee", population: 22100, medianIncome: 24800, medianRent: 680, cityTax: "1%", propTaxEst: 1406, gradRate: 68 },
  "48601": { zip: "48601", city: "Saginaw", county: "Saginaw", population: 18200, medianIncome: 28900, medianRent: 720, cityTax: "1.5%", propTaxEst: 1522, gradRate: 71 },
  "49684": { zip: "49684", city: "Traverse City", county: "Grand Traverse", population: 21500, medianIncome: 52400, medianRent: 1200, cityTax: "0%", propTaxEst: 5508, gradRate: 90 },
  "49855": { zip: "49855", city: "Marquette", county: "Marquette", population: 18900, medianIncome: 44200, medianRent: 850, cityTax: "0%", propTaxEst: 3588, gradRate: 89 },
  "48310": { zip: "48310", city: "Sterling Heights", county: "Macomb", population: 45200, medianIncome: 62400, medianRent: 1050, cityTax: "0%", propTaxEst: 4623, gradRate: 90 },
  "48009": { zip: "48009", city: "Birmingham", county: "Oakland", population: 22800, medianIncome: 125000, medianRent: 1650, cityTax: "0%", propTaxEst: 9800, gradRate: 97 },
  "48375": { zip: "48375", city: "Novi", county: "Oakland", population: 35400, medianIncome: 98200, medianRent: 1450, cityTax: "0%", propTaxEst: 7200, gradRate: 95 },
  "48197": { zip: "48197", city: "Ypsilanti", county: "Washtenaw", population: 28100, medianIncome: 38200, medianRent: 980, cityTax: "0%", propTaxEst: 4815, gradRate: 79 },
  "49508": { zip: "49508", city: "Wyoming", county: "Kent", population: 38200, medianIncome: 52100, medianRent: 1020, cityTax: "0%", propTaxEst: 3754, gradRate: 82 },
};
