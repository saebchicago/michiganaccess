/**
 * IRS Statistics of Income, Tax Year 2021.
 * Source: irs.gov/statistics/soi-tax-stats
 * ZIP-level income, EITC, charitable giving, and self-employment data for Michigan.
 */

export interface IRSZipIncome {
  zip: string;
  city: string;
  county: string;
  totalReturns: number;
  avgAGI: number;
  medianAGIBracket: string;
  eitcReturns: number;
  eitcPct: number;
  eitcTotalAmount: number;
  charitablePct: number;
  avgCharitable: number;
  selfEmployedPct: number;
}

export const MI_IRS_STATE_AVERAGES = {
  avgAGI: 52800,
  eitcPct: 19.2,
  charitablePct: 22,
  avgCharitable: 3800,
  selfEmployedPct: 11,
};

export const IRS_ZIP_DATA: Record<string, IRSZipIncome> = {
  "48201": { zip: "48201", city: "Detroit", county: "Wayne", totalReturns: 8200, avgAGI: 28500, medianAGIBracket: "$25K-$50K", eitcReturns: 3100, eitcPct: 37.8, eitcTotalAmount: 8200000, charitablePct: 12, avgCharitable: 1800, selfEmployedPct: 8 },
  "48126": { zip: "48126", city: "Dearborn", county: "Wayne", totalReturns: 22500, avgAGI: 42100, medianAGIBracket: "$25K-$50K", eitcReturns: 5400, eitcPct: 24.0, eitcTotalAmount: 13500000, charitablePct: 18, avgCharitable: 2400, selfEmployedPct: 11 },
  "48075": { zip: "48075", city: "Southfield", county: "Oakland", totalReturns: 15800, avgAGI: 48200, medianAGIBracket: "$25K-$50K", eitcReturns: 3200, eitcPct: 20.3, eitcTotalAmount: 7800000, charitablePct: 22, avgCharitable: 3100, selfEmployedPct: 9 },
  "48084": { zip: "48084", city: "Troy", county: "Oakland", totalReturns: 18200, avgAGI: 95400, medianAGIBracket: "$75K-$100K", eitcReturns: 1200, eitcPct: 6.6, eitcTotalAmount: 2800000, charitablePct: 35, avgCharitable: 6200, selfEmployedPct: 14 },
  "48103": { zip: "48103", city: "Ann Arbor", county: "Washtenaw", totalReturns: 21000, avgAGI: 78300, medianAGIBracket: "$50K-$75K", eitcReturns: 2100, eitcPct: 10.0, eitcTotalAmount: 4900000, charitablePct: 32, avgCharitable: 5800, selfEmployedPct: 12 },
  "49503": { zip: "49503", city: "Grand Rapids", county: "Kent", totalReturns: 16500, avgAGI: 38900, medianAGIBracket: "$25K-$50K", eitcReturns: 4200, eitcPct: 25.5, eitcTotalAmount: 10500000, charitablePct: 24, avgCharitable: 3400, selfEmployedPct: 10 },
  "48823": { zip: "48823", city: "East Lansing", county: "Ingham", totalReturns: 14200, avgAGI: 35600, medianAGIBracket: "$25K-$50K", eitcReturns: 2800, eitcPct: 19.7, eitcTotalAmount: 6200000, charitablePct: 20, avgCharitable: 2800, selfEmployedPct: 7 },
  "48502": { zip: "48502", city: "Flint", county: "Genesee", totalReturns: 5800, avgAGI: 22400, medianAGIBracket: "$10K-$25K", eitcReturns: 2600, eitcPct: 44.8, eitcTotalAmount: 7100000, charitablePct: 8, avgCharitable: 1200, selfEmployedPct: 6 },
  "48601": { zip: "48601", city: "Saginaw", county: "Saginaw", totalReturns: 9200, avgAGI: 26800, medianAGIBracket: "$25K-$50K", eitcReturns: 3400, eitcPct: 37.0, eitcTotalAmount: 8800000, charitablePct: 10, avgCharitable: 1500, selfEmployedPct: 7 },
  "49001": { zip: "49001", city: "Kalamazoo", county: "Kalamazoo", totalReturns: 11800, avgAGI: 34200, medianAGIBracket: "$25K-$50K", eitcReturns: 3500, eitcPct: 29.7, eitcTotalAmount: 8500000, charitablePct: 16, avgCharitable: 2600, selfEmployedPct: 9 },
  "48154": { zip: "48154", city: "Livonia", county: "Wayne", totalReturns: 24500, avgAGI: 62800, medianAGIBracket: "$50K-$75K", eitcReturns: 2800, eitcPct: 11.4, eitcTotalAmount: 6500000, charitablePct: 28, avgCharitable: 4200, selfEmployedPct: 11 },
  "48067": { zip: "48067", city: "Royal Oak", county: "Oakland", totalReturns: 16800, avgAGI: 58500, medianAGIBracket: "$50K-$75K", eitcReturns: 1800, eitcPct: 10.7, eitcTotalAmount: 4100000, charitablePct: 26, avgCharitable: 4800, selfEmployedPct: 13 },
  "48310": { zip: "48310", city: "Sterling Heights", county: "Macomb", totalReturns: 19200, avgAGI: 52100, medianAGIBracket: "$50K-$75K", eitcReturns: 2400, eitcPct: 12.5, eitcTotalAmount: 5600000, charitablePct: 20, avgCharitable: 3200, selfEmployedPct: 10 },
  "49684": { zip: "49684", city: "Traverse City", county: "Grand Traverse", totalReturns: 12800, avgAGI: 54200, medianAGIBracket: "$50K-$75K", eitcReturns: 1800, eitcPct: 14.1, eitcTotalAmount: 4000000, charitablePct: 28, avgCharitable: 4600, selfEmployedPct: 16 },
  "49855": { zip: "49855", city: "Marquette", county: "Marquette", totalReturns: 8500, avgAGI: 42800, medianAGIBracket: "$25K-$50K", eitcReturns: 1500, eitcPct: 17.6, eitcTotalAmount: 3400000, charitablePct: 22, avgCharitable: 3200, selfEmployedPct: 11 },
  "48009": { zip: "48009", city: "Birmingham", county: "Oakland", totalReturns: 11200, avgAGI: 142000, medianAGIBracket: "$100K+", eitcReturns: 380, eitcPct: 3.4, eitcTotalAmount: 850000, charitablePct: 48, avgCharitable: 12500, selfEmployedPct: 18 },
  "48375": { zip: "48375", city: "Novi", county: "Oakland", totalReturns: 15600, avgAGI: 98500, medianAGIBracket: "$75K-$100K", eitcReturns: 950, eitcPct: 6.1, eitcTotalAmount: 2200000, charitablePct: 38, avgCharitable: 7200, selfEmployedPct: 15 },
  "48197": { zip: "48197", city: "Ypsilanti", county: "Washtenaw", totalReturns: 12400, avgAGI: 36800, medianAGIBracket: "$25K-$50K", eitcReturns: 3200, eitcPct: 25.8, eitcTotalAmount: 7800000, charitablePct: 15, avgCharitable: 2200, selfEmployedPct: 8 },
  "48146": { zip: "48146", city: "Lincoln Park", county: "Wayne", totalReturns: 8900, avgAGI: 31200, medianAGIBracket: "$25K-$50K", eitcReturns: 2800, eitcPct: 31.5, eitcTotalAmount: 7200000, charitablePct: 10, avgCharitable: 1400, selfEmployedPct: 7 },
  "48180": { zip: "48180", city: "Taylor", county: "Wayne", totalReturns: 14200, avgAGI: 34800, medianAGIBracket: "$25K-$50K", eitcReturns: 4100, eitcPct: 28.9, eitcTotalAmount: 10200000, charitablePct: 12, avgCharitable: 1600, selfEmployedPct: 8 },
  "48335": { zip: "48335", city: "Farmington Hills", county: "Oakland", totalReturns: 14800, avgAGI: 72400, medianAGIBracket: "$50K-$75K", eitcReturns: 1600, eitcPct: 10.8, eitcTotalAmount: 3700000, charitablePct: 30, avgCharitable: 5400, selfEmployedPct: 13 },
  "48228": { zip: "48228", city: "Detroit West", county: "Wayne", totalReturns: 11500, avgAGI: 24800, medianAGIBracket: "$10K-$25K", eitcReturns: 4800, eitcPct: 41.7, eitcTotalAmount: 12800000, charitablePct: 7, avgCharitable: 1100, selfEmployedPct: 5 },
  "48205": { zip: "48205", city: "Detroit East", county: "Wayne", totalReturns: 7800, avgAGI: 21200, medianAGIBracket: "$10K-$25K", eitcReturns: 3500, eitcPct: 44.9, eitcTotalAmount: 9500000, charitablePct: 6, avgCharitable: 900, selfEmployedPct: 4 },
  "49508": { zip: "49508", city: "Wyoming", county: "Kent", totalReturns: 13500, avgAGI: 41200, medianAGIBracket: "$25K-$50K", eitcReturns: 3200, eitcPct: 23.7, eitcTotalAmount: 7800000, charitablePct: 18, avgCharitable: 2800, selfEmployedPct: 9 },
  "48170": { zip: "48170", city: "Plymouth", county: "Wayne", totalReturns: 12200, avgAGI: 82500, medianAGIBracket: "$75K-$100K", eitcReturns: 1100, eitcPct: 9.0, eitcTotalAmount: 2500000, charitablePct: 34, avgCharitable: 5800, selfEmployedPct: 14 },
  "48085": { zip: "48085", city: "Rochester Hills", county: "Oakland", totalReturns: 16500, avgAGI: 88200, medianAGIBracket: "$75K-$100K", eitcReturns: 1300, eitcPct: 7.9, eitcTotalAmount: 3000000, charitablePct: 36, avgCharitable: 6400, selfEmployedPct: 14 },
  "48912": { zip: "48912", city: "Lansing", county: "Ingham", totalReturns: 10200, avgAGI: 32400, medianAGIBracket: "$25K-$50K", eitcReturns: 3100, eitcPct: 30.4, eitcTotalAmount: 7600000, charitablePct: 14, avgCharitable: 1800, selfEmployedPct: 8 },
  "48043": { zip: "48043", city: "Mt. Clemens", county: "Macomb", totalReturns: 7600, avgAGI: 34500, medianAGIBracket: "$25K-$50K", eitcReturns: 2200, eitcPct: 28.9, eitcTotalAmount: 5400000, charitablePct: 12, avgCharitable: 1600, selfEmployedPct: 7 },
  "48071": { zip: "48071", city: "Madison Heights", county: "Oakland", totalReturns: 11800, avgAGI: 38900, medianAGIBracket: "$25K-$50K", eitcReturns: 2400, eitcPct: 20.3, eitcTotalAmount: 5800000, charitablePct: 14, avgCharitable: 2000, selfEmployedPct: 9 },
  "49546": { zip: "49546", city: "Kentwood", county: "Kent", totalReturns: 10500, avgAGI: 52800, medianAGIBracket: "$50K-$75K", eitcReturns: 1800, eitcPct: 17.1, eitcTotalAmount: 4200000, charitablePct: 24, avgCharitable: 3800, selfEmployedPct: 10 },
};
