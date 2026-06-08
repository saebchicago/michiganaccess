/**
 * HUD Fair Market Rents, FY2025 - 15 major Michigan ZIPs.
 * Source: huduser.gov/portal/datasets/fmr.html
 * FMR = 40th-percentile gross rent for standard-quality units.
 */

export interface HudFmr {
  zip: string;
  fmr0br: number;
  fmr1br: number;
  fmr2br: number;
  fmr3br: number;
  fmr4br: number;
  county: string;
}

export const HUD_FMR_DATA: Record<string, HudFmr> = {
  "48201": { zip: "48201", fmr0br: 820, fmr1br: 920, fmr2br: 1120, fmr3br: 1410, fmr4br: 1580, county: "Wayne" },
  "48126": { zip: "48126", fmr0br: 820, fmr1br: 920, fmr2br: 1120, fmr3br: 1410, fmr4br: 1580, county: "Wayne" },
  "48075": { zip: "48075", fmr0br: 870, fmr1br: 980, fmr2br: 1190, fmr3br: 1500, fmr4br: 1680, county: "Oakland" },
  "48084": { zip: "48084", fmr0br: 870, fmr1br: 980, fmr2br: 1190, fmr3br: 1500, fmr4br: 1680, county: "Oakland" },
  "48103": { zip: "48103", fmr0br: 890, fmr1br: 1010, fmr2br: 1230, fmr3br: 1560, fmr4br: 1740, county: "Washtenaw" },
  "49503": { zip: "49503", fmr0br: 720, fmr1br: 810, fmr2br: 990, fmr3br: 1260, fmr4br: 1410, county: "Kent" },
  "48823": { zip: "48823", fmr0br: 680, fmr1br: 760, fmr2br: 930, fmr3br: 1180, fmr4br: 1320, county: "Ingham" },
  "48502": { zip: "48502", fmr0br: 590, fmr1br: 660, fmr2br: 810, fmr3br: 1030, fmr4br: 1150, county: "Genesee" },
  "48601": { zip: "48601", fmr0br: 560, fmr1br: 630, fmr2br: 770, fmr3br: 980, fmr4br: 1090, county: "Saginaw" },
  "49001": { zip: "49001", fmr0br: 660, fmr1br: 740, fmr2br: 910, fmr3br: 1150, fmr4br: 1290, county: "Kalamazoo" },
  "49684": { zip: "49684", fmr0br: 680, fmr1br: 770, fmr2br: 950, fmr3br: 1200, fmr4br: 1340, county: "Grand Traverse" },
  "49855": { zip: "49855", fmr0br: 580, fmr1br: 650, fmr2br: 800, fmr3br: 1020, fmr4br: 1140, county: "Marquette" },
  "48154": { zip: "48154", fmr0br: 820, fmr1br: 920, fmr2br: 1120, fmr3br: 1410, fmr4br: 1580, county: "Wayne" },
  "48009": { zip: "48009", fmr0br: 870, fmr1br: 980, fmr2br: 1190, fmr3br: 1500, fmr4br: 1680, county: "Oakland" },
  "48197": { zip: "48197", fmr0br: 890, fmr1br: 1010, fmr2br: 1230, fmr3br: 1560, fmr4br: 1740, county: "Washtenaw" },
};

/** Michigan statewide average FMR for a 2-bedroom unit. */
export const MI_FMR_AVERAGE_2BR = 1020;

export const HUD_FMR_SOURCE = "HUD Fair Market Rents, FY2025. huduser.gov/portal/datasets/fmr.html";
