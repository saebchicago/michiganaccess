/** Michigan childcare capacity by county. Source: LARA-CCLB via GIS-Michigan Open Data. */

export interface ChildcareCounty {
  county: string;
  licensedSlots: number;
  childrenUnder5: number;
  gapPercent: number;
}

export const CHILDCARE_DATA: ChildcareCounty[] = [
  { county: "Wayne", licensedSlots: 28500, childrenUnder5: 58200, gapPercent: 51 },
  { county: "Oakland", licensedSlots: 18200, childrenUnder5: 35800, gapPercent: 49 },
  { county: "Macomb", licensedSlots: 9800, childrenUnder5: 22400, gapPercent: 56 },
  { county: "Kent", licensedSlots: 12200, childrenUnder5: 24800, gapPercent: 51 },
  { county: "Genesee", licensedSlots: 5200, childrenUnder5: 12800, gapPercent: 59 },
  { county: "Washtenaw", licensedSlots: 6800, childrenUnder5: 11200, gapPercent: 39 },
  { county: "Ingham", licensedSlots: 4500, childrenUnder5: 9200, gapPercent: 51 },
  { county: "Kalamazoo", licensedSlots: 4200, childrenUnder5: 8600, gapPercent: 51 },
  { county: "Ottawa", licensedSlots: 5100, childrenUnder5: 10800, gapPercent: 53 },
  { county: "Saginaw", licensedSlots: 2400, childrenUnder5: 5800, gapPercent: 59 },
  { county: "Muskegon", licensedSlots: 2100, childrenUnder5: 5200, gapPercent: 60 },
  { county: "Grand Traverse", licensedSlots: 1800, childrenUnder5: 3200, gapPercent: 44 },
  { county: "Berrien", licensedSlots: 1500, childrenUnder5: 4200, gapPercent: 64 },
  { county: "Monroe", licensedSlots: 1400, childrenUnder5: 3800, gapPercent: 63 },
  { county: "Lake", licensedSlots: 45, childrenUnder5: 280, gapPercent: 84 },
  { county: "Oscoda", licensedSlots: 30, childrenUnder5: 180, gapPercent: 83 },
];

export const MI_TOTAL_SLOTS = 185000;
export const MI_TOTAL_UNDER5 = 310000;
export const MI_GAP = 125000;
