/**
 * Michigan Tax Data - verified from public sources.
 * Sources: Michigan Treasury, IRS, city ordinances, Quadrant Information Services
 * Last verified: March 2026
 */

export const FEDERAL_BRACKETS_SINGLE = [
  { min: 0, max: 11925, rate: 0.10 },
  { min: 11925, max: 48475, rate: 0.12 },
  { min: 48475, max: 103350, rate: 0.22 },
  { min: 103350, max: 197300, rate: 0.24 },
  { min: 197300, max: 250525, rate: 0.32 },
  { min: 250525, max: 626350, rate: 0.35 },
  { min: 626350, max: Infinity, rate: 0.37 },
];

export const FEDERAL_BRACKETS_MARRIED = [
  { min: 0, max: 23850, rate: 0.10 },
  { min: 23850, max: 96950, rate: 0.12 },
  { min: 96950, max: 206700, rate: 0.22 },
  { min: 206700, max: 394600, rate: 0.24 },
  { min: 394600, max: 501050, rate: 0.32 },
  { min: 501050, max: 751600, rate: 0.35 },
  { min: 751600, max: Infinity, rate: 0.37 },
];

export const MI_STATE_INCOME_TAX = 0.0425;
export const MI_PERSONAL_EXEMPTION = 5600;
export const MI_SALES_TAX = 0.06;
export const FICA_SS_RATE = 0.062;
export const FICA_SS_CAP = 176100;
export const FICA_MEDICARE_RATE = 0.0145;

export const CITY_INCOME_TAX: Record<string, { resident: number; nonResident: number }> = {
  "Detroit": { resident: 0.024, nonResident: 0.012 },
  "Highland Park": { resident: 0.02, nonResident: 0.01 },
  "Grand Rapids": { resident: 0.015, nonResident: 0.0075 },
  "Saginaw": { resident: 0.015, nonResident: 0.0075 },
  "Flint": { resident: 0.01, nonResident: 0.005 },
  "Lansing": { resident: 0.01, nonResident: 0.005 },
  "East Lansing": { resident: 0.01, nonResident: 0.005 },
  "Battle Creek": { resident: 0.01, nonResident: 0.005 },
  "Pontiac": { resident: 0.01, nonResident: 0.005 },
  "Jackson": { resident: 0.01, nonResident: 0.005 },
  "Muskegon": { resident: 0.01, nonResident: 0.005 },
  "Hamtramck": { resident: 0.01, nonResident: 0.005 },
  "Port Huron": { resident: 0.01, nonResident: 0.005 },
  "Walker": { resident: 0.01, nonResident: 0.005 },
  "Albion": { resident: 0.01, nonResident: 0.005 },
  "Big Rapids": { resident: 0.01, nonResident: 0.005 },
  "Benton Harbor": { resident: 0.01, nonResident: 0.005 },
  "Grayling": { resident: 0.01, nonResident: 0.005 },
  "Hudson": { resident: 0.01, nonResident: 0.005 },
  "Ionia": { resident: 0.01, nonResident: 0.005 },
  "Lapeer": { resident: 0.01, nonResident: 0.005 },
  "Muskegon Heights": { resident: 0.01, nonResident: 0.005 },
  "Portland": { resident: 0.01, nonResident: 0.005 },
  "Springfield": { resident: 0.01, nonResident: 0.005 },
};

export const PROPERTY_TAX_RATES: Record<string, { millageRate: number; medianHomeValue: number; county: string }> = {
  "Detroit": { millageRate: 67.8, medianHomeValue: 62000, county: "Wayne" },
  "Dearborn": { millageRate: 52.1, medianHomeValue: 175000, county: "Wayne" },
  "Livonia": { millageRate: 47.3, medianHomeValue: 220000, county: "Wayne" },
  "Troy": { millageRate: 38.5, medianHomeValue: 340000, county: "Oakland" },
  "Southfield": { millageRate: 55.2, medianHomeValue: 155000, county: "Oakland" },
  "Royal Oak": { millageRate: 48.6, medianHomeValue: 270000, county: "Oakland" },
  "Ann Arbor": { millageRate: 53.4, medianHomeValue: 385000, county: "Washtenaw" },
  "Ypsilanti": { millageRate: 62.1, medianHomeValue: 155000, county: "Washtenaw" },
  "Sterling Heights": { millageRate: 40.2, medianHomeValue: 230000, county: "Macomb" },
  "Grand Rapids": { millageRate: 42.8, medianHomeValue: 230000, county: "Kent" },
  "Wyoming": { millageRate: 38.5, medianHomeValue: 195000, county: "Kent" },
  "Kalamazoo": { millageRate: 49.2, medianHomeValue: 175000, county: "Kalamazoo" },
  "Muskegon": { millageRate: 48.7, medianHomeValue: 120000, county: "Muskegon" },
  "Lansing": { millageRate: 55.8, medianHomeValue: 120000, county: "Ingham" },
  "East Lansing": { millageRate: 52.4, medianHomeValue: 230000, county: "Ingham" },
  "Flint": { millageRate: 62.5, medianHomeValue: 45000, county: "Genesee" },
  "Saginaw": { millageRate: 55.3, medianHomeValue: 55000, county: "Saginaw" },
  "Traverse City": { millageRate: 32.4, medianHomeValue: 340000, county: "Grand Traverse" },
  "Marquette": { millageRate: 36.8, medianHomeValue: 195000, county: "Marquette" },
  "Midland": { millageRate: 35.2, medianHomeValue: 175000, county: "Midland" },
  "Battle Creek": { millageRate: 45.1, medianHomeValue: 115000, county: "Calhoun" },
  "Jackson": { millageRate: 50.2, medianHomeValue: 110000, county: "Jackson" },
  "Pontiac": { millageRate: 58.4, medianHomeValue: 95000, county: "Oakland" },
  "Holland": { millageRate: 40.1, medianHomeValue: 245000, county: "Ottawa" },
  "Bay City": { millageRate: 48.9, medianHomeValue: 95000, county: "Bay" },
  "Albion": { millageRate: 52.6, medianHomeValue: 65000, county: "Calhoun" },
  "Big Rapids": { millageRate: 40.8, medianHomeValue: 130000, county: "Mecosta" },
  "Benton Harbor": { millageRate: 60.3, medianHomeValue: 55000, county: "Berrien" },
  "Grayling": { millageRate: 34.5, medianHomeValue: 120000, county: "Crawford" },
  "Hudson": { millageRate: 42.1, medianHomeValue: 95000, county: "Lenawee" },
  "Ionia": { millageRate: 44.7, medianHomeValue: 120000, county: "Ionia" },
  "Lapeer": { millageRate: 41.3, medianHomeValue: 155000, county: "Lapeer" },
  "Muskegon Heights": { millageRate: 56.8, medianHomeValue: 55000, county: "Muskegon" },
  "Portland": { millageRate: 39.2, medianHomeValue: 145000, county: "Ionia" },
  "Springfield": { millageRate: 43.5, medianHomeValue: 110000, county: "Calhoun" },
  "Highland Park": { millageRate: 70.2, medianHomeValue: 35000, county: "Wayne" },
  "Hamtramck": { millageRate: 64.5, medianHomeValue: 65000, county: "Wayne" },
  "Port Huron": { millageRate: 46.2, medianHomeValue: 105000, county: "St. Clair" },
  "Walker": { millageRate: 36.8, medianHomeValue: 215000, county: "Kent" },
};

export const AUTO_INSURANCE_MONTHLY: Record<string, number> = {
  "Detroit": 559, "Highland Park": 753, "Hamtramck": 773, "Dearborn": 481,
  "Southfield": 380, "Flint": 391, "Pontiac": 410, "Saginaw": 340,
  "Lansing": 265, "East Lansing": 245, "Grand Rapids": 260, "Kalamazoo": 235,
  "Ann Arbor": 233, "Troy": 220, "Livonia": 280, "Royal Oak": 260,
  "Sterling Heights": 270, "Wyoming": 240, "Holland": 210, "Muskegon": 310,
  "Battle Creek": 290, "Jackson": 285, "Bay City": 240, "Midland": 215,
  "Traverse City": 195, "Marquette": 190, "Ypsilanti": 350,
  "Albion": 275, "Big Rapids": 220, "Benton Harbor": 345, "Grayling": 200,
  "Hudson": 210, "Ionia": 225, "Lapeer": 230, "Muskegon Heights": 340,
  "Portland": 215, "Springfield": 260, "Port Huron": 265, "Walker": 235,
};

export const CITIES = Object.keys(PROPERTY_TAX_RATES).sort();
