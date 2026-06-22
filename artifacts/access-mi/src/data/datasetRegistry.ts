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

// ── DETROIT - ArcGIS Hub ────────────────────────────────────────────────────
// Detroit migrated all open data from Socrata (data.detroitmi.gov) to
// ArcGIS Hub (data-detroitmi.hub.arcgis.com). Each entry below was verified
// live via FeatureServer query returning expected fields.
// Dataset "Neighborhood Indicators" (shfq-3gce) had no ArcGIS Hub equivalent
// and was removed per owner policy (no fabricated fallback).

export const DETROIT_DATASETS: CivicSource[] = [
  {
    id: "det-blight-violations",
    name: "Blight Violations",
    provider: "ArcGIS",
    endpoint:
      "https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/blight_tickets/FeatureServer/0",
    geography: "city",
    category: "housing",
    description:
      "Blight violation tickets issued by the City of Detroit, including property address, ordinance details, and payment status. Source: City of Detroit Open Data (data-detroitmi.hub.arcgis.com).",
  },
  {
    id: "det-building-permits",
    name: "Building Permits",
    provider: "ArcGIS",
    endpoint:
      "https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/bseed_building_permits/FeatureServer/0",
    geography: "city",
    category: "housing",
    description:
      "Building permits issued by the City of Detroit BSEED, indicating construction and renovation activity. Source: City of Detroit Open Data (data-detroitmi.hub.arcgis.com).",
  },
  {
    id: "det-police-incidents",
    name: "Police Incidents",
    provider: "ArcGIS",
    endpoint:
      "https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/RMS_Crime_Incidents/FeatureServer/0",
    geography: "city",
    category: "safety",
    description:
      "RMS crime incident reports from Detroit Police Department, used for safety trend analysis and community awareness. Source: City of Detroit Open Data (data-detroitmi.hub.arcgis.com).",
  },
  {
    id: "det-demolition-activity",
    name: "Demolition Activity",
    provider: "ArcGIS",
    endpoint:
      "https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/city_completed_demolitions/FeatureServer/0",
    geography: "city",
    category: "housing",
    description:
      "Completed demolition records for blighted properties in Detroit as part of city renewal programs. Source: City of Detroit Open Data (data-detroitmi.hub.arcgis.com).",
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
