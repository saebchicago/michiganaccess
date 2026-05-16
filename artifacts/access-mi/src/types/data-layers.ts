export interface FoodAccessTract {
  id: string;
  census_tract_id: string;
  county: string;
  county_fips: string;
  tract_fips: string;
  population: number | null;
  low_income: boolean;
  low_access_1mi: boolean;
  low_access_10mi: boolean;
  la_kids_1mi: number | null;
  la_seniors_1mi: number | null;
  la_no_car_1mi: number | null;
  snap_count: number | null;
  pct_snap: number | null;
  median_family_income: number | null;
  food_desert_flag: boolean;
  data_year: number;
}

export interface SnapRetailer {
  id: string;
  store_name: string;
  store_type: string | null;
  address: string;
  city: string;
  county: string | null;
  zip: string;
  latitude: number | null;
  longitude: number | null;
}

export interface BroadbandAccess {
  id: string;
  census_tract_id: string;
  county: string;
  county_fips: string;
  total_locations: number | null;
  served_locations: number | null;
  underserved_locations: number | null;
  unserved_locations: number | null;
  pct_served: number | null;
  pct_underserved: number | null;
  pct_unserved: number | null;
  max_download_speed: number | null;
  provider_count: number | null;
  fiber_available: boolean;
  bead_eligible: boolean;
}

export interface TransitStop {
  id: string;
  agency: string;
  stop_id: string;
  stop_name: string;
  latitude: number;
  longitude: number;
  wheelchair_boarding: number;
  routes_served: string[] | null;
  county: string | null;
  city: string | null;
}

export interface MaternalInfantHealth {
  id: string;
  county: string;
  infant_mortality_rate: number | null;
  infant_mortality_rate_black: number | null;
  infant_mortality_rate_white: number | null;
  preterm_birth_rate: number | null;
  low_birth_weight_rate: number | null;
  prenatal_care_first_trimester: number | null;
  teen_birth_rate: number | null;
  birthing_hospitals: number | null;
  ob_gyn_per_10k: number | null;
  midwives_per_10k: number | null;
  data_years: string;
}

export interface EjScreen {
  id: string;
  block_group_id: string;
  census_tract_id: string;
  county: string;
  county_fips: string;
  pct_minority: number | null;
  pct_low_income: number | null;
  demographic_index: number | null;
  pm25_concentration: number | null;
  ozone_concentration: number | null;
  diesel_pm: number | null;
  air_toxics_cancer_risk: number | null;
  lead_paint_indicator: number | null;
  superfund_proximity: number | null;
  ej_index_pm25: number | null;
  ej_index_ozone: number | null;
  ej_index_diesel: number | null;
  ej_index_lead: number | null;
  ej_index_superfund: number | null;
}

export interface CompoundAccessIndex {
  id: string;
  census_tract_id: string;
  county: string;
  food_desert_score: number;
  broadband_desert_score: number;
  transit_desert_score: number;
  healthcare_hpsa_score: number;
  svi_score: number;
  ej_burden_score: number;
  energy_burden_score: number;
  compound_deficit_index: number;
  deficit_tier: string | null;
  population: number | null;
}

export type DeficitTier = "Critical" | "High" | "Moderate" | "Low";

export const DEFICIT_TIER_COLORS: Record<DeficitTier, string> = {
  Critical: "bg-red-600 text-white",
  High: "bg-orange-500 text-white",
  Moderate: "bg-yellow-400 text-black",
  Low: "bg-green-600 text-white",
};
