/**
 * Pillar Dataset Registry
 *
 * Central registry of all datasets organized by civic intelligence pillar.
 * To add a dataset, add an entry below - no Lovable prompt needed.
 *
 * RULE: Every dataset must reference a REAL public data source.
 * If not yet ingested, set `status: "pending"` and the UI will show
 * "data not yet available" instead of fake values.
 */

import type { GeographyLevel } from "@/models/GeoDimension";

export type Pillar = "health" | "environment" | "mobility" | "economic";

export type IngestionMethod =
  | "supabase-table"
  | "arcgis-proxy"
  | "arcgis-direct"
  | "socrata"
  | "census-acs"
  | "csv-download"
  | "edge-function";

export type DatasetStatus = "live" | "pending";

export interface PillarDataset {
  id: string;
  name: string;
  pillar: Pillar;
  geographyLevel: GeographyLevel;
  /** Key metric fields from the real dataset */
  keyMetrics: string[];
  /** Authoritative source URL */
  sourceUrl: string;
  /** How often this data refreshes */
  refreshCadence: string;
  /** How we ingest this data */
  ingestionMethod: IngestionMethod;
  /** Ingestion detail - table name, endpoint, etc. */
  ingestionTarget: string;
  /** "live" = wired with real data; "pending" = registered but not yet ingested */
  status: DatasetStatus;
  /** Human-readable description */
  description: string;
}

// ── HEALTH PILLAR ───────────────────────────────────────────────────────────

export const HEALTH_DATASETS: PillarDataset[] = [
  {
    id: "health-facilities",
    name: "Health Facilities (Hospitals, Clinics, FQHCs)",
    pillar: "health",
    geographyLevel: "county",
    keyMetrics: ["facility_type", "county", "latitude", "longitude", "specialties", "walk_in", "telehealth_available"],
    sourceUrl: "https://data.michigan.gov",
    refreshCadence: "Quarterly",
    ingestionMethod: "supabase-table",
    ingestionTarget: "facilities",
    status: "live",
    description: "Licensed health facilities across Michigan including hospitals, clinics, FQHCs, and specialty centers. Sourced from state licensing data.",
  },
  {
    id: "health-community-resources",
    name: "Community Health Resources (SUD, Mental Health, Services)",
    pillar: "health",
    geographyLevel: "county",
    keyMetrics: ["resource_type", "county", "is_free", "walk_in_available", "is_24_7", "on_bus_line"],
    sourceUrl: "https://www.michigan.gov/mdhhs",
    refreshCadence: "Monthly",
    ingestionMethod: "supabase-table",
    ingestionTarget: "community_resources",
    status: "live",
    description: "Verified community resources including substance use disorder care, mental health services, food assistance, and housing support.",
  },
  {
    id: "health-county-demographics",
    name: "County Demographics & Population (ACS)",
    pillar: "health",
    geographyLevel: "county",
    keyMetrics: ["B01003_001E", "B19013_001E", "B27001_001E"],
    sourceUrl: "https://data.census.gov",
    refreshCadence: "Annual (ACS 5-Year)",
    ingestionMethod: "census-acs",
    ingestionTarget: "census-acs-proxy",
    status: "live",
    description: "Total population, median household income, and insurance coverage from the American Community Survey.",
  },
  {
    id: "health-county-profiles",
    name: "County Health Outcomes (Uninsured, PCP Ratio, Food Insecurity)",
    pillar: "health",
    geographyLevel: "county",
    keyMetrics: ["uninsured_rate", "primary_care_ratio", "food_insecurity"],
    sourceUrl: "https://www.countyhealthrankings.org/michigan",
    refreshCadence: "Annual",
    ingestionMethod: "supabase-table",
    ingestionTarget: "county_profiles_static",
    status: "live",
    description: "County Health Rankings & Roadmaps data covering uninsured rates, primary care provider ratios, and food insecurity rates for all 83 Michigan counties.",
  },
];

// ── ENVIRONMENT PILLAR ──────────────────────────────────────────────────────

export const ENVIRONMENT_DATASETS: PillarDataset[] = [
  {
    id: "env-pfas-sites",
    name: "PFAS Investigation Sites (EGLE)",
    pillar: "environment",
    geographyLevel: "county",
    keyMetrics: ["Site_Name", "County", "Site_Type", "Investigation_Status"],
    sourceUrl: "https://www.michigan.gov/pfasresponse",
    refreshCadence: "Monthly",
    ingestionMethod: "arcgis-proxy",
    ingestionTarget: "pfas-sites",
    status: "live",
    description: "EGLE PFAS Areas of Interest - active investigation and response sites across Michigan.",
  },
  {
    id: "env-air-quality",
    name: "Air Quality Monitoring Stations (EGLE)",
    pillar: "environment",
    geographyLevel: "state",
    keyMetrics: ["SiteName", "MonitorType", "AqsId"],
    sourceUrl: "https://www.michigan.gov/egle/about/organization/air-quality",
    refreshCadence: "Real-time",
    ingestionMethod: "arcgis-proxy",
    ingestionTarget: "egle-air",
    status: "live",
    description: "EPA-registered air quality monitoring stations operated by EGLE across Michigan.",
  },
  {
    id: "env-ejscreen",
    name: "EPA EJScreen Environmental Justice Index",
    pillar: "environment",
    geographyLevel: "tract",
    keyMetrics: ["EJ_INDEX", "PM25", "OZONE", "DSLPM", "CANCER"],
    sourceUrl: "https://www.epa.gov/ejscreen",
    refreshCadence: "Annual",
    ingestionMethod: "arcgis-direct",
    ingestionTarget: "https://ejscreen.epa.gov/mapper/ejscreenRESTbroker1.aspx",
    status: "pending",
    description: "EPA Environmental Justice screening indices by census tract. Pending direct API integration.",
  },
];

// ── MOBILITY PILLAR ─────────────────────────────────────────────────────────

export const MOBILITY_DATASETS: PillarDataset[] = [
  {
    id: "mobility-mdot-workzones",
    name: "MDOT Active Work Zones",
    pillar: "mobility",
    geographyLevel: "state",
    keyMetrics: ["ProjectName", "Route", "County", "StartDate", "EndDate"],
    sourceUrl: "https://mdotjboss.state.mi.us",
    refreshCadence: "Daily",
    ingestionMethod: "arcgis-proxy",
    ingestionTarget: "mdot-workzones",
    status: "live",
    description: "Active MDOT road construction and work zones affecting travel across Michigan.",
  },
  {
    id: "mobility-ev-stations",
    name: "EV Charging Stations (NREL AFDC)",
    pillar: "mobility",
    geographyLevel: "state",
    keyMetrics: ["Station_Name", "City", "EV_Level2_EVSE_Num", "EV_DC_Fast_Count", "EV_Network"],
    sourceUrl: "https://afdc.energy.gov/stations",
    refreshCadence: "Weekly",
    ingestionMethod: "arcgis-proxy",
    ingestionTarget: "ev-stations",
    status: "live",
    description: "Electric vehicle charging station locations in Michigan from the DOE Alternative Fuels Data Center.",
  },
  {
    id: "mobility-ddot-routes",
    name: "DDOT Bus Routes (Detroit)",
    pillar: "mobility",
    geographyLevel: "county",
    keyMetrics: ["RouteName", "RouteNumber"],
    sourceUrl: "https://www.rideddot.com",
    refreshCadence: "Quarterly",
    ingestionMethod: "arcgis-proxy",
    ingestionTarget: "ddot-routes",
    status: "live",
    description: "Detroit Department of Transportation (DDOT) fixed-route bus network.",
  },
];

// ── ECONOMIC PILLAR ─────────────────────────────────────────────────────────

export const ECONOMIC_DATASETS: PillarDataset[] = [
  {
    id: "econ-acs-poverty",
    name: "Poverty & Unemployment (ACS)",
    pillar: "economic",
    geographyLevel: "county",
    keyMetrics: ["B17001_002E", "B23025_005E", "B19013_001E"],
    sourceUrl: "https://data.census.gov",
    refreshCadence: "Annual (ACS 5-Year)",
    ingestionMethod: "census-acs",
    ingestionTarget: "census-acs-proxy",
    status: "live",
    description: "Poverty status, unemployment, and median household income from the American Community Survey for all Michigan counties.",
  },
  {
    id: "econ-det-blight",
    name: "Detroit Blight Violations",
    pillar: "economic",
    geographyLevel: "county",
    keyMetrics: ["violation_address", "violation_date", "violation_description"],
    sourceUrl: "https://data.detroitmi.gov/datasets/blight-violations",
    refreshCadence: "Weekly",
    ingestionMethod: "socrata",
    ingestionTarget: "https://data.detroitmi.gov/resource/ti6p-wcg4.json",
    status: "live",
    description: "Active blight violation records in the City of Detroit indicating property conditions and neighborhood stress.",
  },
  {
    id: "econ-det-demolitions",
    name: "Detroit Demolition Activity",
    pillar: "economic",
    geographyLevel: "county",
    keyMetrics: ["address", "demolition_date", "contractor_name"],
    sourceUrl: "https://data.detroitmi.gov/datasets/demolitions",
    refreshCadence: "Monthly",
    ingestionMethod: "socrata",
    ingestionTarget: "https://data.detroitmi.gov/resource/rv44-e9di.json",
    status: "live",
    description: "Demolition records for blighted properties in Detroit as part of city renewal programs.",
  },
  {
    id: "econ-financial-programs",
    name: "Financial Assistance Programs",
    pillar: "economic",
    geographyLevel: "state",
    keyMetrics: ["program_name", "program_type", "fpl_threshold", "coverage_area"],
    sourceUrl: "https://www.michigan.gov/mdhhs",
    refreshCadence: "Quarterly",
    ingestionMethod: "supabase-table",
    ingestionTarget: "financial_programs",
    status: "live",
    description: "State and federal financial assistance programs available to Michigan residents.",
  },
];

// ── Combined registry ───────────────────────────────────────────────────────

export const ALL_PILLAR_DATASETS: PillarDataset[] = [
  ...HEALTH_DATASETS,
  ...ENVIRONMENT_DATASETS,
  ...MOBILITY_DATASETS,
  ...ECONOMIC_DATASETS,
];

export function getPillarDatasets(pillar: Pillar): PillarDataset[] {
  return ALL_PILLAR_DATASETS.filter((d) => d.pillar === pillar);
}

export function getDatasetConfig(id: string): PillarDataset | undefined {
  return ALL_PILLAR_DATASETS.find((d) => d.id === id);
}

export const PILLAR_META: Record<Pillar, { label: string; description: string; color: string }> = {
  health: {
    label: "Health Access",
    description: "Healthcare facilities, community resources, and population health outcomes.",
    color: "text-red-600 dark:text-red-400",
  },
  environment: {
    label: "Environmental Risk",
    description: "PFAS contamination, air quality, and environmental justice indicators.",
    color: "text-green-600 dark:text-green-400",
  },
  mobility: {
    label: "Mobility & Transit",
    description: "Public transit coverage, road infrastructure, and EV charging access.",
    color: "text-blue-600 dark:text-blue-400",
  },
  economic: {
    label: "Economic Stress",
    description: "Poverty, unemployment, housing blight, and financial assistance availability.",
    color: "text-amber-600 dark:text-amber-400",
  },
};
