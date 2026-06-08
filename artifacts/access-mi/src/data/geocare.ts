/**
 * HRSA GeoCare Navigator - FQHC penetration rates for ~12 Michigan ZCTAs.
 * Shows how many low-income residents are served by Health Center Program
 * grantees relative to the total low-income population.
 *
 * Source: HRSA GeoCare Navigator 2023
 * https://geocare.hrsa.gov/
 */

export interface GeocareRecord {
  zcta: string;
  total_population: number;
  low_income_population: number;
  /** Number of Health Center Program patients from this ZCTA */
  hcp_patients: number;
  /** HCP patients / low-income population */
  hcp_penetration_rate: number;
  /** Low-income residents NOT served by an HCP grantee */
  unserved_low_income: number;
  /** Whether data is suppressed due to small cell sizes */
  is_suppressed: boolean;
  data_year: number;
}

export const MICHIGAN_GEOCARE: Record<string, GeocareRecord> = {
  // Detroit - moderate penetration (large FQHC presence but large need)
  "48201": { zcta: "48201", total_population: 12500, low_income_population: 5250, hcp_patients: 1680, hcp_penetration_rate: 0.32, unserved_low_income: 3570, is_suppressed: false, data_year: 2023 },
  // Dearborn - moderate
  "48126": { zcta: "48126", total_population: 55800, low_income_population: 15960, hcp_patients: 4150, hcp_penetration_rate: 0.26, unserved_low_income: 11810, is_suppressed: false, data_year: 2023 },
  // Troy - affluent, low penetration
  "48084": { zcta: "48084", total_population: 42100, low_income_population: 2610, hcp_patients: 180, hcp_penetration_rate: 0.07, unserved_low_income: 2430, is_suppressed: false, data_year: 2023 },
  // Southfield - moderate
  "48075": { zcta: "48075", total_population: 37200, low_income_population: 6846, hcp_patients: 1780, hcp_penetration_rate: 0.26, unserved_low_income: 5066, is_suppressed: false, data_year: 2023 },
  // Grand Rapids - moderate-high
  "49503": { zcta: "49503", total_population: 42800, low_income_population: 14038, hcp_patients: 4910, hcp_penetration_rate: 0.35, unserved_low_income: 9128, is_suppressed: false, data_year: 2023 },
  // Flint - high penetration (many FQHCs post-water-crisis)
  "48502": { zcta: "48502", total_population: 22100, low_income_population: 10652, hcp_patients: 3730, hcp_penetration_rate: 0.35, unserved_low_income: 6922, is_suppressed: false, data_year: 2023 },
  // Saginaw - moderate
  "48601": { zcta: "48601", total_population: 18200, low_income_population: 6988, hcp_patients: 1956, hcp_penetration_rate: 0.28, unserved_low_income: 5032, is_suppressed: false, data_year: 2023 },
  // Kalamazoo - moderate
  "49001": { zcta: "49001", total_population: 35100, low_income_population: 12355, hcp_patients: 3460, hcp_penetration_rate: 0.28, unserved_low_income: 8895, is_suppressed: false, data_year: 2023 },
  // Ann Arbor - low penetration (few FQHCs, affluent area)
  "48104": { zcta: "48104", total_population: 38400, low_income_population: 6989, hcp_patients: 490, hcp_penetration_rate: 0.07, unserved_low_income: 6499, is_suppressed: false, data_year: 2023 },
  // Livonia - low
  "48154": { zcta: "48154", total_population: 48300, low_income_population: 4154, hcp_patients: 290, hcp_penetration_rate: 0.07, unserved_low_income: 3864, is_suppressed: false, data_year: 2023 },
  // Rural UP - suppressed
  "49853": { zcta: "49853", total_population: 3200, low_income_population: 910, hcp_patients: 0, hcp_penetration_rate: 0, unserved_low_income: 910, is_suppressed: true, data_year: 2023 },
  // Traverse City - low-moderate
  "49684": { zcta: "49684", total_population: 21500, low_income_population: 3139, hcp_patients: 340, hcp_penetration_rate: 0.11, unserved_low_income: 2799, is_suppressed: false, data_year: 2023 },
};

export const HRSA_GEOCARE_SOURCE = "HRSA GeoCare Navigator 2023";
