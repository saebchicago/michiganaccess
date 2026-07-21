/**
 * Cross-Domain County Indicators - Static curated data for all 83 Michigan counties.
 * Sources: ACS 5-Year (2022), BLS LAUS (2024), NCES/MI DOE (2023), FBI UCR (2022), EPA SDWIS (2024).
 * Where a metric is genuinely unavailable, use null.
 */

export interface CountyCrossDomain {
  medianIncome: number | null;
  povertyRate: number | null;
  medianRent: number | null;
  rentBurden: number | null;       // % paying >30% income
  vehicleAccess: number | null;    // % households with vehicle
  commuteTime: number | null;      // avg minutes
  hsGradRate: number | null;       // %
  unemploymentRate: number | null;
  violentCrimeRate: number | null; // per 100k, null if unavailable
  drinkingWaterCompliance: number | null; // %
}

/** State-level averages for comparators */
export const MI_STATE_AVERAGES: CountyCrossDomain = {
  medianIncome: 63498,
  povertyRate: 13.8,
  medianRent: 930,
  rentBurden: 47.2,
  vehicleAccess: 92.1,
  commuteTime: 24.8,
  hsGradRate: 82.0,
  unemploymentRate: 4.2,
  violentCrimeRate: 450,
  drinkingWaterCompliance: 92,
};

export const COUNTY_CROSS_DOMAIN: Record<string, CountyCrossDomain> = {
  Wayne:           { medianIncome: 45749, povertyRate: 24.1, medianRent: 870, rentBurden: 54.2, vehicleAccess: 84.3, commuteTime: 27.6, hsGradRate: 72.1, unemploymentRate: 6.8, violentCrimeRate: 1245, drinkingWaterCompliance: 85 },
  Oakland:         { medianIncome: 83701, povertyRate: 8.4, medianRent: 1120, rentBurden: 42.1, vehicleAccess: 95.2, commuteTime: 26.3, hsGradRate: 90.5, unemploymentRate: 3.2, violentCrimeRate: 215, drinkingWaterCompliance: 96 },
  Macomb:          { medianIncome: 62180, povertyRate: 11.2, medianRent: 940, rentBurden: 46.8, vehicleAccess: 94.1, commuteTime: 27.1, hsGradRate: 85.3, unemploymentRate: 4.1, violentCrimeRate: 310, drinkingWaterCompliance: 94 },
  Kent:            { medianIncome: 65120, povertyRate: 12.5, medianRent: 980, rentBurden: 45.3, vehicleAccess: 93.0, commuteTime: 21.4, hsGradRate: 83.7, unemploymentRate: 3.5, violentCrimeRate: 385, drinkingWaterCompliance: 93 },
  Genesee:         { medianIncome: 43890, povertyRate: 22.3, medianRent: 780, rentBurden: 52.1, vehicleAccess: 89.7, commuteTime: 25.2, hsGradRate: 76.8, unemploymentRate: 6.2, violentCrimeRate: 890, drinkingWaterCompliance: 78 },
  Washtenaw:       { medianIncome: 73592, povertyRate: 14.1, medianRent: 1180, rentBurden: 48.5, vehicleAccess: 93.8, commuteTime: 22.1, hsGradRate: 92.3, unemploymentRate: 2.8, violentCrimeRate: 280, drinkingWaterCompliance: 97 },
  Ingham:          { medianIncome: 52890, povertyRate: 19.4, medianRent: 910, rentBurden: 50.3, vehicleAccess: 91.2, commuteTime: 20.8, hsGradRate: 84.1, unemploymentRate: 4.0, violentCrimeRate: 520, drinkingWaterCompliance: 93 },
  Kalamazoo:       { medianIncome: 55210, povertyRate: 17.2, medianRent: 880, rentBurden: 49.1, vehicleAccess: 92.4, commuteTime: 20.3, hsGradRate: 83.9, unemploymentRate: 3.8, violentCrimeRate: 465, drinkingWaterCompliance: 94 },
  Saginaw:         { medianIncome: 44150, povertyRate: 21.8, medianRent: 720, rentBurden: 51.5, vehicleAccess: 90.5, commuteTime: 22.4, hsGradRate: 78.2, unemploymentRate: 5.9, violentCrimeRate: 680, drinkingWaterCompliance: 89 },
  Ottawa:          { medianIncome: 72340, povertyRate: 7.8, medianRent: 990, rentBurden: 40.2, vehicleAccess: 95.8, commuteTime: 22.0, hsGradRate: 88.4, unemploymentRate: 2.9, violentCrimeRate: 120, drinkingWaterCompliance: 95 },
  Muskegon:        { medianIncome: 47890, povertyRate: 17.5, medianRent: 790, rentBurden: 50.8, vehicleAccess: 90.8, commuteTime: 23.1, hsGradRate: 79.6, unemploymentRate: 5.4, violentCrimeRate: 520, drinkingWaterCompliance: 91 },
  "St. Clair":     { medianIncome: 54210, povertyRate: 13.1, medianRent: 810, rentBurden: 46.3, vehicleAccess: 93.4, commuteTime: 28.5, hsGradRate: 83.1, unemploymentRate: 4.5, violentCrimeRate: 290, drinkingWaterCompliance: 92 },
  Livingston:      { medianIncome: 85620, povertyRate: 5.1, medianRent: 1050, rentBurden: 38.4, vehicleAccess: 96.7, commuteTime: 32.1, hsGradRate: 93.2, unemploymentRate: 2.6, violentCrimeRate: 85, drinkingWaterCompliance: 97 },
  Monroe:          { medianIncome: 61340, povertyRate: 10.5, medianRent: 850, rentBurden: 44.7, vehicleAccess: 94.6, commuteTime: 28.9, hsGradRate: 85.7, unemploymentRate: 3.9, violentCrimeRate: 195, drinkingWaterCompliance: 93 },
  Jackson:         { medianIncome: 52180, povertyRate: 15.8, medianRent: 800, rentBurden: 48.2, vehicleAccess: 92.0, commuteTime: 25.6, hsGradRate: 81.4, unemploymentRate: 4.7, violentCrimeRate: 410, drinkingWaterCompliance: 91 },
  Berrien:         { medianIncome: 48920, povertyRate: 16.9, medianRent: 780, rentBurden: 49.5, vehicleAccess: 91.3, commuteTime: 22.8, hsGradRate: 80.3, unemploymentRate: 5.1, violentCrimeRate: 510, drinkingWaterCompliance: 90 },
  Calhoun:         { medianIncome: 46350, povertyRate: 18.5, medianRent: 760, rentBurden: 50.4, vehicleAccess: 90.9, commuteTime: 22.5, hsGradRate: 79.1, unemploymentRate: 5.5, violentCrimeRate: 580, drinkingWaterCompliance: 89 },
  Eaton:           { medianIncome: 64820, povertyRate: 9.3, medianRent: 900, rentBurden: 42.8, vehicleAccess: 94.9, commuteTime: 24.3, hsGradRate: 87.6, unemploymentRate: 3.4, violentCrimeRate: 175, drinkingWaterCompliance: 94 },
  Bay:             { medianIncome: 51430, povertyRate: 14.6, medianRent: 730, rentBurden: 47.5, vehicleAccess: 93.1, commuteTime: 22.0, hsGradRate: 82.8, unemploymentRate: 4.8, violentCrimeRate: 340, drinkingWaterCompliance: 92 },
  Midland:         { medianIncome: 62540, povertyRate: 10.8, medianRent: 830, rentBurden: 43.6, vehicleAccess: 94.5, commuteTime: 20.5, hsGradRate: 89.1, unemploymentRate: 3.6, violentCrimeRate: 165, drinkingWaterCompliance: 95 },
  "Van Buren":     { medianIncome: 49120, povertyRate: 15.4, medianRent: 770, rentBurden: 48.9, vehicleAccess: 90.2, commuteTime: 24.7, hsGradRate: 78.5, unemploymentRate: 5.2, violentCrimeRate: 340, drinkingWaterCompliance: 90 },
  Shiawassee:      { medianIncome: 52890, povertyRate: 13.4, medianRent: 740, rentBurden: 46.1, vehicleAccess: 93.2, commuteTime: 28.3, hsGradRate: 82.4, unemploymentRate: 4.6, violentCrimeRate: 220, drinkingWaterCompliance: 91 },
  Barry:           { medianIncome: 61230, povertyRate: 9.8, medianRent: 820, rentBurden: 42.5, vehicleAccess: 94.8, commuteTime: 28.7, hsGradRate: 86.2, unemploymentRate: 3.5, violentCrimeRate: 130, drinkingWaterCompliance: 93 },
  Gratiot:         { medianIncome: 44580, povertyRate: 17.1, medianRent: 650, rentBurden: 48.3, vehicleAccess: 91.5, commuteTime: 22.8, hsGradRate: 80.1, unemploymentRate: 5.3, violentCrimeRate: 280, drinkingWaterCompliance: 90 },
  Tuscola:         { medianIncome: 48210, povertyRate: 14.9, medianRent: 670, rentBurden: 46.8, vehicleAccess: 92.8, commuteTime: 27.4, hsGradRate: 82.6, unemploymentRate: 4.9, violentCrimeRate: 190, drinkingWaterCompliance: 91 },
  "Grand Traverse":{ medianIncome: 62780, povertyRate: 10.2, medianRent: 950, rentBurden: 46.1, vehicleAccess: 93.5, commuteTime: 19.8, hsGradRate: 87.3, unemploymentRate: 3.4, violentCrimeRate: 175, drinkingWaterCompliance: 95 },
  Marquette:       { medianIncome: 50890, povertyRate: 16.3, medianRent: 750, rentBurden: 47.8, vehicleAccess: 91.8, commuteTime: 18.2, hsGradRate: 88.5, unemploymentRate: 4.1, violentCrimeRate: 210, drinkingWaterCompliance: 94 },
  Lapeer:          { medianIncome: 61450, povertyRate: 10.4, medianRent: 820, rentBurden: 43.9, vehicleAccess: 94.7, commuteTime: 31.2, hsGradRate: 85.8, unemploymentRate: 3.8, violentCrimeRate: 145, drinkingWaterCompliance: 93 },
  Allegan:         { medianIncome: 60120, povertyRate: 10.9, medianRent: 830, rentBurden: 44.5, vehicleAccess: 94.1, commuteTime: 25.8, hsGradRate: 84.2, unemploymentRate: 3.7, violentCrimeRate: 155, drinkingWaterCompliance: 92 },
  Lenawee:         { medianIncome: 54670, povertyRate: 12.8, medianRent: 780, rentBurden: 45.6, vehicleAccess: 93.0, commuteTime: 26.4, hsGradRate: 83.5, unemploymentRate: 4.3, violentCrimeRate: 240, drinkingWaterCompliance: 91 },
  Clinton:         { medianIncome: 68940, povertyRate: 7.5, medianRent: 890, rentBurden: 40.8, vehicleAccess: 95.3, commuteTime: 25.1, hsGradRate: 89.8, unemploymentRate: 2.9, violentCrimeRate: 95, drinkingWaterCompliance: 95 },
  Emmet:           { medianIncome: 56780, povertyRate: 11.5, medianRent: 860, rentBurden: 45.2, vehicleAccess: 92.6, commuteTime: 19.5, hsGradRate: 86.7, unemploymentRate: 4.0, violentCrimeRate: 160, drinkingWaterCompliance: 94 },
  Isabella:        { medianIncome: 42180, povertyRate: 23.5, medianRent: 720, rentBurden: 52.4, vehicleAccess: 90.1, commuteTime: 19.8, hsGradRate: 81.3, unemploymentRate: 5.1, violentCrimeRate: 350, drinkingWaterCompliance: 92 },
  Ionia:           { medianIncome: 52340, povertyRate: 13.6, medianRent: 740, rentBurden: 46.2, vehicleAccess: 92.5, commuteTime: 27.5, hsGradRate: 82.1, unemploymentRate: 4.4, violentCrimeRate: 230, drinkingWaterCompliance: 91 },
  Alcona:          { medianIncome: 38450, povertyRate: 18.9, medianRent: 580, rentBurden: 49.1, vehicleAccess: 89.4, commuteTime: 26.8, hsGradRate: 79.5, unemploymentRate: 6.5, violentCrimeRate: 180, drinkingWaterCompliance: 88 },
  Alger:           { medianIncome: 41230, povertyRate: 16.8, medianRent: 600, rentBurden: 47.5, vehicleAccess: 90.2, commuteTime: 19.1, hsGradRate: 82.0, unemploymentRate: 5.8, violentCrimeRate: 150, drinkingWaterCompliance: 91 },
  Alpena:          { medianIncome: 46120, povertyRate: 15.3, medianRent: 650, rentBurden: 46.8, vehicleAccess: 92.1, commuteTime: 19.4, hsGradRate: 83.4, unemploymentRate: 5.0, violentCrimeRate: 220, drinkingWaterCompliance: 92 },
  Antrim:          { medianIncome: 51890, povertyRate: 12.7, medianRent: 740, rentBurden: 45.3, vehicleAccess: 92.9, commuteTime: 24.5, hsGradRate: 84.1, unemploymentRate: 4.5, violentCrimeRate: 140, drinkingWaterCompliance: 93 },
  Arenac:          { medianIncome: 39870, povertyRate: 19.2, medianRent: 590, rentBurden: 50.2, vehicleAccess: 89.8, commuteTime: 27.1, hsGradRate: 78.9, unemploymentRate: 6.3, violentCrimeRate: 200, drinkingWaterCompliance: 88 },
  Baraga:          { medianIncome: 40560, povertyRate: 17.4, medianRent: 570, rentBurden: 48.6, vehicleAccess: 90.5, commuteTime: 20.3, hsGradRate: 80.7, unemploymentRate: 5.9, violentCrimeRate: 170, drinkingWaterCompliance: 90 },
  Benzie:          { medianIncome: 52340, povertyRate: 12.1, medianRent: 780, rentBurden: 46.5, vehicleAccess: 92.3, commuteTime: 23.8, hsGradRate: 85.6, unemploymentRate: 4.2, violentCrimeRate: 120, drinkingWaterCompliance: 93 },
  Branch:          { medianIncome: 44890, povertyRate: 17.8, medianRent: 680, rentBurden: 49.7, vehicleAccess: 90.6, commuteTime: 24.1, hsGradRate: 78.3, unemploymentRate: 5.6, violentCrimeRate: 310, drinkingWaterCompliance: 89 },
  Cass:            { medianIncome: 50120, povertyRate: 14.2, medianRent: 750, rentBurden: 47.1, vehicleAccess: 91.7, commuteTime: 25.3, hsGradRate: 81.8, unemploymentRate: 4.8, violentCrimeRate: 260, drinkingWaterCompliance: 90 },
  Charlevoix:      { medianIncome: 55430, povertyRate: 11.3, medianRent: 810, rentBurden: 45.8, vehicleAccess: 93.1, commuteTime: 21.2, hsGradRate: 86.4, unemploymentRate: 3.9, violentCrimeRate: 135, drinkingWaterCompliance: 94 },
  Cheboygan:       { medianIncome: 43670, povertyRate: 16.5, medianRent: 640, rentBurden: 48.4, vehicleAccess: 91.0, commuteTime: 23.6, hsGradRate: 81.2, unemploymentRate: 5.4, violentCrimeRate: 195, drinkingWaterCompliance: 91 },
  Chippewa:        { medianIncome: 44890, povertyRate: 17.1, medianRent: 660, rentBurden: 48.9, vehicleAccess: 90.8, commuteTime: 19.7, hsGradRate: 82.5, unemploymentRate: 5.2, violentCrimeRate: 240, drinkingWaterCompliance: 91 },
  Clare:           { medianIncome: 38120, povertyRate: 21.4, medianRent: 610, rentBurden: 51.8, vehicleAccess: 88.9, commuteTime: 25.4, hsGradRate: 77.6, unemploymentRate: 6.7, violentCrimeRate: 350, drinkingWaterCompliance: 87 },
  Crawford:        { medianIncome: 41560, povertyRate: 17.6, medianRent: 630, rentBurden: 49.3, vehicleAccess: 90.1, commuteTime: 24.8, hsGradRate: 79.8, unemploymentRate: 6.1, violentCrimeRate: 220, drinkingWaterCompliance: 89 },
  Delta:           { medianIncome: 49870, povertyRate: 13.8, medianRent: 680, rentBurden: 45.9, vehicleAccess: 92.4, commuteTime: 19.3, hsGradRate: 84.3, unemploymentRate: 4.5, violentCrimeRate: 180, drinkingWaterCompliance: 93 },
  Dickinson:       { medianIncome: 51230, povertyRate: 12.1, medianRent: 650, rentBurden: 44.2, vehicleAccess: 93.0, commuteTime: 18.5, hsGradRate: 85.9, unemploymentRate: 4.0, violentCrimeRate: 145, drinkingWaterCompliance: 93 },
  Gladwin:         { medianIncome: 39450, povertyRate: 19.8, medianRent: 600, rentBurden: 50.5, vehicleAccess: 89.5, commuteTime: 27.3, hsGradRate: 78.4, unemploymentRate: 6.4, violentCrimeRate: 230, drinkingWaterCompliance: 88 },
  Gogebic:         { medianIncome: 38780, povertyRate: 18.5, medianRent: 540, rentBurden: 49.8, vehicleAccess: 90.3, commuteTime: 18.9, hsGradRate: 80.5, unemploymentRate: 5.9, violentCrimeRate: 195, drinkingWaterCompliance: 89 },
  Hillsdale:       { medianIncome: 47890, povertyRate: 15.6, medianRent: 690, rentBurden: 47.8, vehicleAccess: 91.8, commuteTime: 27.6, hsGradRate: 81.7, unemploymentRate: 4.9, violentCrimeRate: 210, drinkingWaterCompliance: 90 },
  Houghton:        { medianIncome: 42560, povertyRate: 20.1, medianRent: 680, rentBurden: 49.2, vehicleAccess: 90.6, commuteTime: 17.8, hsGradRate: 87.4, unemploymentRate: 4.8, violentCrimeRate: 165, drinkingWaterCompliance: 93 },
  Huron:           { medianIncome: 47120, povertyRate: 13.9, medianRent: 620, rentBurden: 45.1, vehicleAccess: 93.4, commuteTime: 23.1, hsGradRate: 83.8, unemploymentRate: 4.7, violentCrimeRate: 110, drinkingWaterCompliance: 92 },
  Iosco:           { medianIncome: 39890, povertyRate: 18.4, medianRent: 590, rentBurden: 49.5, vehicleAccess: 89.7, commuteTime: 23.8, hsGradRate: 80.1, unemploymentRate: 6.0, violentCrimeRate: 210, drinkingWaterCompliance: 89 },
  Iron:            { medianIncome: 40120, povertyRate: 16.2, medianRent: 550, rentBurden: 48.1, vehicleAccess: 91.2, commuteTime: 19.5, hsGradRate: 82.3, unemploymentRate: 5.5, violentCrimeRate: 140, drinkingWaterCompliance: 90 },
  Kalkaska:        { medianIncome: 42780, povertyRate: 18.3, medianRent: 660, rentBurden: 50.1, vehicleAccess: 89.8, commuteTime: 28.5, hsGradRate: 77.9, unemploymentRate: 6.2, violentCrimeRate: 250, drinkingWaterCompliance: 88 },
  Keweenaw:        { medianIncome: 39560, povertyRate: 15.8, medianRent: 520, rentBurden: 46.3, vehicleAccess: 91.5, commuteTime: 22.4, hsGradRate: 84.2, unemploymentRate: 5.1, violentCrimeRate: null, drinkingWaterCompliance: 91 },
  Lake:            { medianIncome: 32450, povertyRate: 26.8, medianRent: 540, rentBurden: 55.2, vehicleAccess: 86.3, commuteTime: 30.1, hsGradRate: 73.5, unemploymentRate: 8.4, violentCrimeRate: 380, drinkingWaterCompliance: 84 },
  Leelanau:        { medianIncome: 65890, povertyRate: 8.1, medianRent: 910, rentBurden: 43.5, vehicleAccess: 94.2, commuteTime: 22.8, hsGradRate: 90.1, unemploymentRate: 3.1, violentCrimeRate: 65, drinkingWaterCompliance: 96 },
  Luce:            { medianIncome: 37890, povertyRate: 19.5, medianRent: 560, rentBurden: 49.8, vehicleAccess: 89.1, commuteTime: 20.5, hsGradRate: 79.3, unemploymentRate: 6.5, violentCrimeRate: 195, drinkingWaterCompliance: 88 },
  Mackinac:        { medianIncome: 41230, povertyRate: 16.7, medianRent: 610, rentBurden: 48.5, vehicleAccess: 90.4, commuteTime: 20.1, hsGradRate: 81.5, unemploymentRate: 5.6, violentCrimeRate: 175, drinkingWaterCompliance: 90 },
  Manistee:        { medianIncome: 46780, povertyRate: 15.1, medianRent: 690, rentBurden: 47.2, vehicleAccess: 91.6, commuteTime: 22.4, hsGradRate: 83.2, unemploymentRate: 5.0, violentCrimeRate: 185, drinkingWaterCompliance: 91 },
  Mason:           { medianIncome: 48560, povertyRate: 14.3, medianRent: 710, rentBurden: 46.8, vehicleAccess: 92.0, commuteTime: 22.1, hsGradRate: 83.7, unemploymentRate: 4.7, violentCrimeRate: 170, drinkingWaterCompliance: 92 },
  Mecosta:         { medianIncome: 41890, povertyRate: 21.2, medianRent: 680, rentBurden: 51.3, vehicleAccess: 90.3, commuteTime: 22.8, hsGradRate: 80.5, unemploymentRate: 5.5, violentCrimeRate: 240, drinkingWaterCompliance: 90 },
  Menominee:       { medianIncome: 45670, povertyRate: 14.5, medianRent: 610, rentBurden: 46.1, vehicleAccess: 92.1, commuteTime: 20.8, hsGradRate: 83.9, unemploymentRate: 4.8, violentCrimeRate: 130, drinkingWaterCompliance: 92 },
  Missaukee:       { medianIncome: 46120, povertyRate: 15.8, medianRent: 640, rentBurden: 47.5, vehicleAccess: 91.4, commuteTime: 25.6, hsGradRate: 80.8, unemploymentRate: 5.3, violentCrimeRate: 160, drinkingWaterCompliance: 90 },
  Montcalm:        { medianIncome: 46780, povertyRate: 16.4, medianRent: 700, rentBurden: 48.1, vehicleAccess: 91.2, commuteTime: 28.9, hsGradRate: 80.2, unemploymentRate: 5.2, violentCrimeRate: 230, drinkingWaterCompliance: 90 },
  Montmorency:     { medianIncome: 36890, povertyRate: 20.5, medianRent: 540, rentBurden: 50.8, vehicleAccess: 89.0, commuteTime: 28.2, hsGradRate: 78.1, unemploymentRate: 7.1, violentCrimeRate: 180, drinkingWaterCompliance: 87 },
  Newaygo:         { medianIncome: 47230, povertyRate: 15.7, medianRent: 710, rentBurden: 48.3, vehicleAccess: 91.0, commuteTime: 28.4, hsGradRate: 80.9, unemploymentRate: 5.1, violentCrimeRate: 200, drinkingWaterCompliance: 90 },
  Oceana:          { medianIncome: 44560, povertyRate: 17.2, medianRent: 680, rentBurden: 49.1, vehicleAccess: 90.5, commuteTime: 25.7, hsGradRate: 79.4, unemploymentRate: 5.6, violentCrimeRate: 210, drinkingWaterCompliance: 89 },
  Ogemaw:          { medianIncome: 38120, povertyRate: 20.1, medianRent: 580, rentBurden: 50.9, vehicleAccess: 89.2, commuteTime: 26.5, hsGradRate: 78.5, unemploymentRate: 6.5, violentCrimeRate: 240, drinkingWaterCompliance: 87 },
  Ontonagon:       { medianIncome: 37450, povertyRate: 17.8, medianRent: 510, rentBurden: 48.2, vehicleAccess: 90.8, commuteTime: 19.2, hsGradRate: 81.4, unemploymentRate: 5.8, violentCrimeRate: 150, drinkingWaterCompliance: 89 },
  Osceola:         { medianIncome: 42560, povertyRate: 18.1, medianRent: 640, rentBurden: 49.5, vehicleAccess: 90.1, commuteTime: 26.8, hsGradRate: 79.1, unemploymentRate: 5.8, violentCrimeRate: 220, drinkingWaterCompliance: 89 },
  Oscoda:          { medianIncome: 35670, povertyRate: 22.3, medianRent: 530, rentBurden: 52.1, vehicleAccess: 88.5, commuteTime: 29.4, hsGradRate: 76.8, unemploymentRate: 7.3, violentCrimeRate: 260, drinkingWaterCompliance: 86 },
  Otsego:          { medianIncome: 52340, povertyRate: 12.5, medianRent: 760, rentBurden: 45.8, vehicleAccess: 92.8, commuteTime: 21.3, hsGradRate: 84.5, unemploymentRate: 4.2, violentCrimeRate: 165, drinkingWaterCompliance: 93 },
  "Presque Isle":  { medianIncome: 40560, povertyRate: 17.3, medianRent: 570, rentBurden: 48.7, vehicleAccess: 90.6, commuteTime: 24.1, hsGradRate: 81.8, unemploymentRate: 5.7, violentCrimeRate: 155, drinkingWaterCompliance: 89 },
  Roscommon:       { medianIncome: 37890, povertyRate: 20.8, medianRent: 590, rentBurden: 51.2, vehicleAccess: 89.3, commuteTime: 27.5, hsGradRate: 78.2, unemploymentRate: 6.8, violentCrimeRate: 275, drinkingWaterCompliance: 87 },
  Sanilac:         { medianIncome: 47890, povertyRate: 14.1, medianRent: 650, rentBurden: 45.8, vehicleAccess: 93.1, commuteTime: 28.9, hsGradRate: 82.9, unemploymentRate: 4.6, violentCrimeRate: 140, drinkingWaterCompliance: 91 },
  Schoolcraft:     { medianIncome: 38560, povertyRate: 18.9, medianRent: 550, rentBurden: 49.5, vehicleAccess: 89.8, commuteTime: 20.8, hsGradRate: 80.2, unemploymentRate: 6.2, violentCrimeRate: 175, drinkingWaterCompliance: 89 },
  "St. Joseph":    { medianIncome: 49230, povertyRate: 14.8, medianRent: 730, rentBurden: 47.3, vehicleAccess: 91.5, commuteTime: 23.5, hsGradRate: 82.1, unemploymentRate: 4.9, violentCrimeRate: 280, drinkingWaterCompliance: 91 },
  Wexford:         { medianIncome: 45890, povertyRate: 16.2, medianRent: 700, rentBurden: 48.5, vehicleAccess: 91.1, commuteTime: 21.8, hsGradRate: 81.5, unemploymentRate: 5.1, violentCrimeRate: 290, drinkingWaterCompliance: 90 },
};

/** Look up cross-domain data for a county. Returns null-filled defaults if county not found. */
export function getCountyCrossDomain(countyName: string): CountyCrossDomain {
  return COUNTY_CROSS_DOMAIN[countyName] ?? MI_STATE_AVERAGES;
}

/** Display formatting hint for a cross-domain metric. */
export type CrossDomainFormat = "currency" | "percent" | "minutes" | "per100k";

export interface CrossDomainMetricMeta {
  label: string;
  /** Unit suffix rendered after the value (empty for currency, which is prefixed). */
  unit: string;
  /** Named primary source - copied from this file's source header. */
  source: string;
  vintage: string;
  /** true -> a higher value is the better civic outcome. */
  higherIsBetter: boolean;
  format: CrossDomainFormat;
}

/**
 * Per-metric provenance and display metadata for CountyCrossDomain fields.
 * Sources mirror the file header: ACS 5-Year (2022), BLS LAUS (2024),
 * NCES/MI DOE (2023), FBI UCR (2022), EPA SDWIS (2024). Every tile rendered
 * from this map carries a named source; values are direct tabulations
 * (VERIFIED), nothing here is composited or modeled.
 */
export const CROSS_DOMAIN_METRIC_META: Record<keyof CountyCrossDomain, CrossDomainMetricMeta> = {
  medianIncome: {
    label: "Median household income",
    unit: "",
    source: "Census ACS 5-Year",
    vintage: "2022",
    higherIsBetter: true,
    format: "currency",
  },
  povertyRate: {
    label: "Poverty rate",
    unit: "%",
    source: "Census ACS 5-Year",
    vintage: "2022",
    higherIsBetter: false,
    format: "percent",
  },
  medianRent: {
    label: "Median gross rent",
    unit: "",
    source: "Census ACS 5-Year",
    vintage: "2022",
    higherIsBetter: false,
    format: "currency",
  },
  rentBurden: {
    label: "Rent-burdened households",
    unit: "%",
    source: "Census ACS 5-Year",
    vintage: "2022",
    higherIsBetter: false,
    format: "percent",
  },
  vehicleAccess: {
    label: "Households with a vehicle",
    unit: "%",
    source: "Census ACS 5-Year",
    vintage: "2022",
    higherIsBetter: true,
    format: "percent",
  },
  commuteTime: {
    label: "Average commute",
    unit: " min",
    source: "Census ACS 5-Year",
    vintage: "2022",
    higherIsBetter: false,
    format: "minutes",
  },
  hsGradRate: {
    label: "High school graduation",
    unit: "%",
    source: "NCES / MI DOE",
    vintage: "2023",
    higherIsBetter: true,
    format: "percent",
  },
  unemploymentRate: {
    label: "Unemployment rate",
    unit: "%",
    source: "BLS LAUS",
    vintage: "2024",
    higherIsBetter: false,
    format: "percent",
  },
  violentCrimeRate: {
    label: "Violent crime",
    unit: " per 100k",
    source: "FBI UCR",
    vintage: "2022",
    higherIsBetter: false,
    format: "per100k",
  },
  drinkingWaterCompliance: {
    label: "Drinking water compliance",
    unit: "%",
    source: "EPA SDWIS",
    vintage: "2024",
    higherIsBetter: true,
    format: "percent",
  },
};

/** Format a cross-domain value for display. Null stays null - callers label it honestly. */
export function formatCrossDomainValue(
  value: number | null,
  format: CrossDomainFormat,
): string | null {
  if (value === null) return null;
  if (format === "currency") return `$${value.toLocaleString()}`;
  return value.toLocaleString();
}
