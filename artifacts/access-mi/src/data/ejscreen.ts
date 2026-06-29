/**
 * EPA EJSCREEN environmental justice data - ~15 Michigan ZCTAs.
 * Percentiles are national, 0–100 (higher = worse environmental burden).
 *
 * Source: EPA EJSCREEN v2.3, ZCTA-level aggregation
 * https://www.epa.gov/ejscreen
 */

export interface EjscreenRecord {
  zcta: string;
  /** Composite EJ Index (0–100, higher = more burdened) */
  ej_index: number;
  /** PM2.5 national percentile */
  pm25_percentile: number;
  /** Ozone national percentile */
  ozone_percentile: number;
  /** Traffic proximity national percentile */
  traffic_percentile: number;
  /** Wastewater discharge national percentile */
  wastewater_percentile: number;
  /** RMP (Risk Management Plan) facility proximity national percentile */
  rmp_percentile: number;
  /** Percent low-income population in ZCTA */
  pct_low_income: number;
  /** Percent minority population in ZCTA */
  pct_minority: number;
  /** Percent adults without high school diploma */
  pct_less_hs: number;
  data_year: number;
}

import { MICHIGAN_EJSCREEN_GENERATED } from "./ejscreen.generated";

const HAND_CURATED_EJSCREEN: Record<string, EjscreenRecord> = {
  // Urban - Detroit core (high EJ burden)
  "48201": { zcta: "48201", ej_index: 82, pm25_percentile: 78, ozone_percentile: 72, traffic_percentile: 88, wastewater_percentile: 75, rmp_percentile: 80, pct_low_income: 42.1, pct_minority: 82.4, pct_less_hs: 18.3, data_year: 2023 },
  // Wayne - Dearborn (moderate-high, industrial corridor)
  "48126": { zcta: "48126", ej_index: 74, pm25_percentile: 76, ozone_percentile: 70, traffic_percentile: 82, wastewater_percentile: 68, rmp_percentile: 78, pct_low_income: 28.6, pct_minority: 45.2, pct_less_hs: 14.8, data_year: 2023 },
  // Oakland - Southfield (moderate)
  "48075": { zcta: "48075", ej_index: 52, pm25_percentile: 62, ozone_percentile: 58, traffic_percentile: 65, wastewater_percentile: 42, rmp_percentile: 48, pct_low_income: 18.4, pct_minority: 72.1, pct_less_hs: 7.2, data_year: 2023 },
  // Oakland - Troy (affluent, low burden)
  "48084": { zcta: "48084", ej_index: 24, pm25_percentile: 48, ozone_percentile: 52, traffic_percentile: 55, wastewater_percentile: 30, rmp_percentile: 28, pct_low_income: 6.2, pct_minority: 28.4, pct_less_hs: 3.1, data_year: 2023 },
  // Kent - Grand Rapids (moderate-high urban)
  "49503": { zcta: "49503", ej_index: 71, pm25_percentile: 65, ozone_percentile: 60, traffic_percentile: 78, wastewater_percentile: 62, rmp_percentile: 70, pct_low_income: 32.8, pct_minority: 48.6, pct_less_hs: 16.4, data_year: 2023 },
  // Genesee - Flint (very high burden)
  "48502": { zcta: "48502", ej_index: 85, pm25_percentile: 72, ozone_percentile: 68, traffic_percentile: 75, wastewater_percentile: 82, rmp_percentile: 76, pct_low_income: 48.2, pct_minority: 64.8, pct_less_hs: 22.1, data_year: 2023 },
  // Saginaw (high burden)
  "48601": { zcta: "48601", ej_index: 76, pm25_percentile: 68, ozone_percentile: 62, traffic_percentile: 72, wastewater_percentile: 70, rmp_percentile: 65, pct_low_income: 38.4, pct_minority: 52.6, pct_less_hs: 16.8, data_year: 2023 },
  // Washtenaw - Ann Arbor (low burden)
  "48104": { zcta: "48104", ej_index: 28, pm25_percentile: 45, ozone_percentile: 48, traffic_percentile: 52, wastewater_percentile: 32, rmp_percentile: 25, pct_low_income: 18.2, pct_minority: 22.6, pct_less_hs: 3.8, data_year: 2023 },
  // Grand Traverse - Traverse City (low-moderate)
  "49684": { zcta: "49684", ej_index: 22, pm25_percentile: 28, ozone_percentile: 35, traffic_percentile: 38, wastewater_percentile: 22, rmp_percentile: 18, pct_low_income: 14.6, pct_minority: 6.2, pct_less_hs: 5.4, data_year: 2023 },
  // Marquette (rural, moderate)
  "49855": { zcta: "49855", ej_index: 32, pm25_percentile: 22, ozone_percentile: 30, traffic_percentile: 28, wastewater_percentile: 35, rmp_percentile: 42, pct_low_income: 22.1, pct_minority: 5.8, pct_less_hs: 4.2, data_year: 2023 },
  // Rural UP - Luce County
  "49853": { zcta: "49853", ej_index: 35, pm25_percentile: 18, ozone_percentile: 22, traffic_percentile: 15, wastewater_percentile: 28, rmp_percentile: 52, pct_low_income: 28.4, pct_minority: 8.2, pct_less_hs: 9.6, data_year: 2023 },
  // Kalamazoo
  "49001": { zcta: "49001", ej_index: 70, pm25_percentile: 62, ozone_percentile: 58, traffic_percentile: 72, wastewater_percentile: 60, rmp_percentile: 68, pct_low_income: 35.2, pct_minority: 42.8, pct_less_hs: 14.2, data_year: 2023 },
  // Wayne - Livonia (suburban, low-moderate)
  "48154": { zcta: "48154", ej_index: 30, pm25_percentile: 55, ozone_percentile: 52, traffic_percentile: 48, wastewater_percentile: 35, rmp_percentile: 32, pct_low_income: 8.6, pct_minority: 12.4, pct_less_hs: 4.2, data_year: 2023 },
  // Oakland - Royal Oak (suburban, low)
  "48067": { zcta: "48067", ej_index: 26, pm25_percentile: 50, ozone_percentile: 48, traffic_percentile: 52, wastewater_percentile: 28, rmp_percentile: 24, pct_low_income: 9.8, pct_minority: 14.2, pct_less_hs: 3.6, data_year: 2023 },
  // Macomb - Sterling Heights (suburban, low-moderate)
  "48310": { zcta: "48310", ej_index: 34, pm25_percentile: 58, ozone_percentile: 54, traffic_percentile: 60, wastewater_percentile: 38, rmp_percentile: 35, pct_low_income: 10.2, pct_minority: 22.8, pct_less_hs: 6.8, data_year: 2023 },
};

/** Hand-curated seed extended by ejscreen.generated.ts when ingest scripts run. */
export const MICHIGAN_EJSCREEN: Record<string, EjscreenRecord> = {
  ...MICHIGAN_EJSCREEN_GENERATED,
  ...HAND_CURATED_EJSCREEN,
};

export const EPA_EJSCREEN_SOURCE = "EPA EJSCREEN v2.3, ZCTA-level aggregation";
