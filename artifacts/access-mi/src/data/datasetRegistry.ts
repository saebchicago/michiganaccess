/**
 * Michigan Civic Dataset Registry
 *
 * To add a new dataset, simply add an entry to the appropriate array below.
 * No Lovable prompt needed - just edit this file.
 */

import type { CivicSource } from "./civicSources";

// ── STATEWIDE - ArcGIS ─────────────────────────────────────────────────────

export const STATEWIDE_DATASETS: CivicSource[] = [
  {
    id: "mi-county-boundaries",
    name: "Michigan County Boundaries",
    provider: "ArcGIS",
    endpoint:
      "https://services1.arcgis.com/VdSAmGfE7jMMbR2h/arcgis/rest/services/Michigan_Counties/FeatureServer/0",
    geography: "state",
    category: "civic",
    description:
      "Official boundaries for all 83 Michigan counties, sourced from the State of Michigan GIS Open Data portal.",
  },
  {
    id: "mdot-transport-regions",
    name: "MDOT Transportation Regions",
    provider: "ArcGIS",
    endpoint:
      "https://services1.arcgis.com/VdSAmGfE7jMMbR2h/arcgis/rest/services/MDOT_Regions/FeatureServer/0",
    geography: "state",
    category: "transport",
    description:
      "Michigan Department of Transportation region boundaries used for infrastructure planning.",
  },
  {
    id: "mi-air-quality-stations",
    name: "Air Quality Monitoring Stations",
    provider: "ArcGIS",
    endpoint:
      "https://services1.arcgis.com/VdSAmGfE7jMMbR2h/arcgis/rest/services/AirQuality_Monitors/FeatureServer/0",
    geography: "state",
    category: "environment",
    description:
      "EPA-registered air quality monitoring station locations across Michigan.",
  },
  {
    id: "mi-flood-risk-zones",
    name: "Flood Risk Zones",
    provider: "ArcGIS",
    endpoint:
      "https://services1.arcgis.com/VdSAmGfE7jMMbR2h/arcgis/rest/services/Flood_Hazard_Zones/FeatureServer/0",
    geography: "state",
    category: "environment",
    description:
      "FEMA-derived flood hazard areas across Michigan, used for risk assessment and planning.",
  },
  {
    id: "mi-public-health-regions",
    name: "Public Health Regions",
    provider: "ArcGIS",
    endpoint:
      "https://services1.arcgis.com/VdSAmGfE7jMMbR2h/arcgis/rest/services/MDHHS_Health_Regions/FeatureServer/0",
    geography: "state",
    category: "health",
    description:
      "MDHHS public health jurisdiction regions used for epidemiological reporting.",
  },
];

// ── DETROIT - Socrata ───────────────────────────────────────────────────────

export const DETROIT_DATASETS: CivicSource[] = [
  {
    id: "det-blight-violations",
    name: "Blight Violations",
    provider: "Socrata",
    endpoint: "https://data.detroitmi.gov/resource/ti6p-wcg4.json",
    geography: "city",
    category: "housing",
    description:
      "Active blight violation records in the City of Detroit, including property conditions and enforcement actions.",
  },
  {
    id: "det-building-permits",
    name: "Building Permits",
    provider: "Socrata",
    endpoint: "https://data.detroitmi.gov/resource/but4-ky7y.json",
    geography: "city",
    category: "housing",
    description:
      "Building permits issued by the City of Detroit, indicating construction and renovation activity.",
  },
  {
    id: "det-police-incidents",
    name: "Police Incidents",
    provider: "Socrata",
    endpoint: "https://data.detroitmi.gov/resource/6gdg-y3kf.json",
    geography: "city",
    category: "safety",
    description:
      "Reported police incidents in Detroit, used for safety trend analysis and community awareness.",
  },
  {
    id: "det-demolition-activity",
    name: "Demolition Activity",
    provider: "Socrata",
    endpoint: "https://data.detroitmi.gov/resource/rv44-e9di.json",
    geography: "city",
    category: "housing",
    description:
      "Demolition records for blighted properties in Detroit as part of the city's renewal programs.",
  },
  {
    id: "det-neighborhood-indicators",
    name: "Neighborhood Indicators",
    provider: "Socrata",
    endpoint: "https://data.detroitmi.gov/resource/shfq-3gce.json",
    geography: "city",
    category: "civic",
    description:
      "Composite neighborhood health indicators covering education, safety, and economic metrics.",
  },
];

// ── Combined registry ───────────────────────────────────────────────────────

export const ALL_DATASETS: CivicSource[] = [
  ...STATEWIDE_DATASETS,
  ...DETROIT_DATASETS,
];

export function getDatasetById(id: string): CivicSource | undefined {
  return ALL_DATASETS.find((d) => d.id === id);
}
