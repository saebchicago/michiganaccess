/** Michigan county crime rates. Source: FBI Crime Data Explorer / MICR 2022.
 * Label: "Based on 2022 data. For current data: michigan.gov/msp" */

export interface CountyCrime { county: string; violentPer100K: number; propertyPer100K: number; }

export const COUNTY_CRIME: CountyCrime[] = [
  { county: "Wayne", violentPer100K: 1285, propertyPer100K: 2840 },
  { county: "Genesee", violentPer100K: 842, propertyPer100K: 2150 },
  { county: "Saginaw", violentPer100K: 780, propertyPer100K: 2080 },
  { county: "Muskegon", violentPer100K: 645, propertyPer100K: 1920 },
  { county: "Kalamazoo", violentPer100K: 580, propertyPer100K: 2350 },
  { county: "Ingham", violentPer100K: 540, propertyPer100K: 2180 },
  { county: "Kent", violentPer100K: 485, propertyPer100K: 2420 },
  { county: "Jackson", violentPer100K: 460, propertyPer100K: 1850 },
  { county: "Calhoun", violentPer100K: 445, propertyPer100K: 1780 },
  { county: "Berrien", violentPer100K: 420, propertyPer100K: 1650 },
  { county: "Macomb", violentPer100K: 310, propertyPer100K: 1520 },
  { county: "Oakland", violentPer100K: 245, propertyPer100K: 1680 },
  { county: "Washtenaw", violentPer100K: 280, propertyPer100K: 2100 },
  { county: "Bay", violentPer100K: 355, propertyPer100K: 1420 },
  { county: "Monroe", violentPer100K: 210, propertyPer100K: 1280 },
  { county: "Grand Traverse", violentPer100K: 165, propertyPer100K: 1350 },
  { county: "Ottawa", violentPer100K: 120, propertyPer100K: 1150 },
  { county: "Livingston", violentPer100K: 95, propertyPer100K: 980 },
  { county: "Midland", violentPer100K: 145, propertyPer100K: 1100 },
  { county: "Marquette", violentPer100K: 185, propertyPer100K: 1280 },
];

export const MI_AVG_VIOLENT = 450;
export const MI_AVG_PROPERTY = 1680;
