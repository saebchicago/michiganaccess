/**
 * Michigan climate-health scenario registry (UC2 Phase 1).
 * Projections use conservative literature-backed multipliers only.
 * All outputs are labeled PROJECTED with confidence bands.
 */

export type ClimateHazardType = "heat" | "air" | "compound" | "flood" | "coastal";
export type ClimateScenarioSeverity = "moderate" | "severe";

export interface ClimateScenarioSource {
  name: string;
  url: string;
  vintage: string;
}

export interface ClimateScenario {
  id: string;
  title: string;
  summary: string;
  hazardType: ClimateHazardType;
  defaultSeverity: ClimateScenarioSeverity;
  durationDays: number;
  /** Display parameter for heat scenarios */
  temperatureDeltaF: number;
  /** Display parameter for air scenarios */
  pm25SpikePercentile: number;
  /** Plus/minus band on projected utilization change (display only) */
  confidenceBandPct: number;
  methodologyNote: string;
  sources: ClimateScenarioSource[];
  relatedRoutes: { label: string; href: string }[];
  lastReviewed: string;
}

export const CLIMATE_SCENARIOS: ClimateScenario[] = [
  {
    id: "heat-wave",
    title: "Extreme Heat Wave",
    summary:
      "Multi-day heat index above regional thresholds. Models elevated heat-related utilization pressure where energy burden and social vulnerability are already high.",
    hazardType: "heat",
    defaultSeverity: "moderate",
    durationDays: 5,
    temperatureDeltaF: 10,
    pm25SpikePercentile: 0,
    confidenceBandPct: 40,
    methodologyNote:
      "Heat sensitivity uses ACEEE energy burden and FEMA social vulnerability where available. ED utilization change is a conservative county-level projection, not a forecast.",
    sources: [
      {
        name: "NOAA Climate.gov - Extreme Heat",
        url: "https://www.climate.gov/news-features/understanding-climate/climate-change-extreme-heat",
        vintage: "2024",
      },
      {
        name: "CDC Extreme Heat",
        url: "https://www.cdc.gov/disasters/extremeheat/index.html",
        vintage: "2024",
      },
    ],
    relatedRoutes: [
      { label: "Energy Burden", href: "/energy-burden" },
      { label: "Disaster Intelligence", href: "/environment/disaster" },
      { label: "Service Area Builder", href: "/service-area" },
    ],
    lastReviewed: "2026-06-29",
  },
  {
    id: "air-quality-event",
    title: "Regional Air Quality Event",
    summary:
      "Ozone or PM2.5 action-day conditions across urban and industrial corridors. Models respiratory utilization pressure layered on baseline access gaps.",
    hazardType: "air",
    defaultSeverity: "moderate",
    durationDays: 3,
    temperatureDeltaF: 0,
    pm25SpikePercentile: 85,
    confidenceBandPct: 40,
    methodologyNote:
      "Air event sensitivity uses poverty and uninsured proxies from County Health Rankings allocations. Respiratory pressure is associative at county level.",
    sources: [
      {
        name: "EPA AirNow",
        url: "https://www.airnow.gov/",
        vintage: "2024",
      },
      {
        name: "CDC PLACES",
        url: "https://www.cdc.gov/places",
        vintage: "2024 release",
      },
    ],
    relatedRoutes: [
      { label: "Air Quality", href: "/environment/air" },
      { label: "EJ Pathways", href: "/environment/justice" },
      { label: "Cohort Builder", href: "/cohort-builder" },
    ],
    lastReviewed: "2026-06-29",
  },
  {
    id: "compound-heat-air",
    title: "Compound Heat and Air Quality Event",
    summary:
      "Concurrent heat stress and poor air quality, a pattern linked to higher compound burden in legacy industrial metros and high energy-burden counties.",
    hazardType: "compound",
    defaultSeverity: "severe",
    durationDays: 4,
    temperatureDeltaF: 8,
    pm25SpikePercentile: 75,
    confidenceBandPct: 45,
    methodologyNote:
      "Compound scenario applies capped additive stress from heat and air modules. Overlap discount prevents double counting at county level.",
    sources: [
      {
        name: "FEMA National Risk Index",
        url: "https://www.fema.gov/flood-maps/products-tools/national-risk-index",
        vintage: "2023",
      },
      {
        name: "ACEEE Energy Burden Index",
        url: "https://www.aceee.org",
        vintage: "2023",
      },
    ],
    relatedRoutes: [
      { label: "Environment Hub", href: "/environment" },
      { label: "Health Equity Atlas", href: "/health-equity-atlas" },
      { label: "Cohort Builder", href: "/cohort-builder" },
    ],
    lastReviewed: "2026-06-29",
  },
  {
    id: "flood-event",
    title: "Inland Flood Event",
    summary:
      "Heavy rainfall and riverine flooding stress counties with high FEMA flood risk and limited community resilience. Models displacement and acute care utilization pressure.",
    hazardType: "flood",
    defaultSeverity: "moderate",
    durationDays: 7,
    temperatureDeltaF: 0,
    pm25SpikePercentile: 0,
    confidenceBandPct: 42,
    methodologyNote:
      "Flood sensitivity uses FEMA National Risk Index flood scores where available. Counties without NRI coverage use poverty-based resilience proxies (MODELED).",
    sources: [
      {
        name: "FEMA National Risk Index",
        url: "https://www.fema.gov/flood-maps/products-tools/national-risk-index",
        vintage: "2023",
      },
      {
        name: "NOAA National Centers for Environmental Information",
        url: "https://www.ncei.noaa.gov/",
        vintage: "2024",
      },
    ],
    relatedRoutes: [
      { label: "Disaster Intelligence", href: "/environment/disaster" },
      { label: "Deep Map", href: "/map/layers" },
      { label: "Scenario Studio", href: "/scenario-studio" },
    ],
    lastReviewed: "2026-06-29",
  },
  {
    id: "great-lakes-level",
    title: "Great Lakes High Water Level",
    summary:
      "Elevated lake levels and shoreline erosion affect coastal counties. Models infrastructure stress and access disruption for lakeshore communities.",
    hazardType: "coastal",
    defaultSeverity: "moderate",
    durationDays: 30,
    temperatureDeltaF: 0,
    pm25SpikePercentile: 0,
    confidenceBandPct: 38,
    methodologyNote:
      "Coastal exposure applies to Great Lakes shoreline counties only. Utilization pressure is associative and labeled PROJECTED.",
    sources: [
      {
        name: "US Army Corps of Engineers - Detroit District",
        url: "https://www.lre.usace.army.mil/",
        vintage: "2024",
      },
      {
        name: "NOAA Great Lakes Environmental Research Laboratory",
        url: "https://www.glerl.noaa.gov/",
        vintage: "2024",
      },
    ],
    relatedRoutes: [
      { label: "Environment Hub", href: "/environment" },
      { label: "Service Area Builder", href: "/service-area" },
      { label: "Climate Vulnerability", href: "/environment/climate" },
    ],
    lastReviewed: "2026-06-29",
  },
];

/** Michigan counties with Great Lakes shoreline exposure (MODELED scope list). */
export const GREAT_LAKES_COASTAL_COUNTIES = [
  "Alcona",
  "Alger",
  "Allegan",
  "Alpena",
  "Antrim",
  "Baraga",
  "Benzie",
  "Berrien",
  "Charlevoix",
  "Cheboygan",
  "Chippewa",
  "Emmet",
  "Huron",
  "Iosco",
  "Keweenaw",
  "Leelanau",
  "Luce",
  "Mackinac",
  "Manistee",
  "Marquette",
  "Mason",
  "Menominee",
  "Monroe",
  "Muskegon",
  "Oceana",
  "Ontonagon",
  "Presque Isle",
  "Schoolcraft",
  "St. Clair",
  "Van Buren",
  "Wayne",
  "Macomb",
  "Ottawa",
] as const;

export function getClimateScenarioById(id: string): ClimateScenario | undefined {
  return CLIMATE_SCENARIOS.find((s) => s.id === id);
}