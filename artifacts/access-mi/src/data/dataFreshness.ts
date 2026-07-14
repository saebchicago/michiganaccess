// Track freshness of all data sources on the platform
// Displayed on /methodology and /data pages
//
// Three-field freshness model (preferred):
//   sourceYear     vintage of the underlying data (e.g., "2022 5-Year ACS")
//   lastPulled     when we ingested it into the platform (YYYY-MM-DD)
//   lastVerified   when a human last confirmed it is still current (YYYY-MM-DD)
//
// Legacy single-stamp fields (lastUpdated, currentVersion) are retained
// for back-compat with components that have not yet migrated; they
// duplicate lastPulled and sourceYear respectively.

export interface DataSource {
  id: string;
  name: string;
  category: string;
  url: string;
  /** When the platform last ingested this dataset (YYYY-MM-DD). */
  lastPulled: string;
  /** When a human last confirmed the dataset is still current (YYYY-MM-DD). */
  lastVerified: string;
  /** Vintage of the underlying data (e.g., "2022 5-Year ACS"). */
  sourceYear: string;
  /** @deprecated Use lastPulled. Retained for back-compat. */
  lastUpdated: string;
  /** @deprecated Use sourceYear. Retained for back-compat. */
  currentVersion: string;
  updateFrequency: string;
  nextExpectedUpdate: string;
  isLive: boolean;
  freshnessStatus: "fresh" | "aging" | "stale";
}

/**
 * Date of the most recent platform-wide verification sweep across all
 * datasets. When you run a provenance audit, bump this and update any
 * per-dataset overrides below.
 */
const PLATFORM_LAST_VERIFIED = "2026-07-14";

function entry(
  partial: Omit<DataSource, "lastPulled" | "sourceYear" | "lastVerified"> & {
    lastVerified?: string;
  },
): DataSource {
  return {
    ...partial,
    lastPulled: partial.lastUpdated,
    sourceYear: partial.currentVersion,
    lastVerified: partial.lastVerified ?? PLATFORM_LAST_VERIFIED,
  };
}

export const DATA_FRESHNESS_SOURCES: DataSource[] = [
  entry({
    id: "cdc-places",
    name: "CDC PLACES Health Metrics",
    category: "Health",
    url: "https://data.cdc.gov",
    lastUpdated: "2024-05-01",
    updateFrequency: "Annual",
    currentVersion: "PLACES 2024 Release",
    nextExpectedUpdate: "2025-05-01",
    isLive: true,
    freshnessStatus: "stale",
  }),
  entry({
    id: "census-acs",
    name: "Census ACS 5-Year Estimates",
    category: "Demographics",
    url: "https://api.census.gov",
    lastUpdated: "2023-12-07",
    updateFrequency: "Annual",
    currentVersion: "2022 5-Year ACS",
    nextExpectedUpdate: "2024-12-01",
    isLive: true,
    freshnessStatus: "stale",
  }),
  entry({
    id: "hud-fmr",
    name: "HUD Fair Market Rents",
    category: "Housing",
    url: "https://www.huduser.gov",
    lastUpdated: "2024-10-01",
    updateFrequency: "Annual",
    currentVersion: "FY2025",
    nextExpectedUpdate: "2025-10-01",
    isLive: false,
    freshnessStatus: "stale",
  }),
  entry({
    id: "egle-mpart",
    name: "EGLE MPART PFAS Sites",
    category: "Environment",
    url: "https://gis-egle.hub.arcgis.com",
    lastUpdated: "2026-03-01",
    updateFrequency: "Continuous",
    currentVersion: "March 2026",
    nextExpectedUpdate: "Ongoing",
    isLive: false,
    freshnessStatus: "aging",
  }),
  entry({
    id: "usaspending",
    name: "USASpending.gov Federal Awards",
    category: "Finance",
    url: "https://api.usaspending.gov",
    lastUpdated: "2025-11-01",
    updateFrequency: "Quarterly + real-time",
    currentVersion: "FY2024",
    nextExpectedUpdate: "FY2025 Q4",
    isLive: true,
    freshnessStatus: "stale",
  }),
  entry({
    id: "alice",
    name: "United Way ALICE Report",
    category: "Economic",
    url: "https://unitedforalice.org/michigan",
    lastUpdated: "2025-05-01",
    updateFrequency: "Every 2 years",
    currentVersion: "2025 Report (2023 data)",
    nextExpectedUpdate: "2027",
    isLive: false,
    freshnessStatus: "fresh",
  }),
  entry({
    id: "fema-nri",
    name: "FEMA National Risk Index",
    category: "Disaster",
    url: "https://hazards.fema.gov/nri/",
    lastUpdated: "2023-01-01",
    updateFrequency: "Every 2-3 years",
    currentVersion: "2023 NRI",
    nextExpectedUpdate: "2025-2026",
    isLive: false,
    freshnessStatus: "aging",
  }),
  entry({
    id: "fema-declarations",
    name: "FEMA Disaster Declarations",
    category: "Disaster",
    url: "https://www.fema.gov/api/open",
    lastUpdated: "2026-03-01",
    updateFrequency: "Real-time",
    currentVersion: "Live API",
    nextExpectedUpdate: "Ongoing",
    isLive: true,
    freshnessStatus: "aging",
  }),
  entry({
    id: "usda-fara",
    name: "USDA Food Access Research Atlas",
    category: "Food",
    url: "https://www.ers.usda.gov",
    lastUpdated: "2022-01-01",
    updateFrequency: "Every 4-5 years",
    currentVersion: "2019 FARA",
    nextExpectedUpdate: "2024-2025",
    isLive: false,
    freshnessStatus: "stale",
  }),
  entry({
    id: "fcc-broadband",
    name: "FCC National Broadband Map",
    category: "Infrastructure",
    url: "https://broadbandmap.fcc.gov",
    lastUpdated: "2024-06-01",
    updateFrequency: "Biannual",
    currentVersion: "BDC 2024",
    nextExpectedUpdate: "2025-06-01",
    isLive: false,
    freshnessStatus: "stale",
  }),
  entry({
    id: "epa-echo",
    name: "EPA ECHO Facility Data",
    category: "Environment",
    url: "https://echo.epa.gov",
    lastUpdated: "2026-03-01",
    updateFrequency: "Real-time",
    currentVersion: "Live API",
    nextExpectedUpdate: "Ongoing",
    isLive: true,
    freshnessStatus: "aging",
  }),
  entry({
    id: "hmda",
    name: "CFPB HMDA Mortgage Data",
    category: "Housing Equity",
    url: "https://ffiec.cfpb.gov",
    lastUpdated: "2024-06-01",
    updateFrequency: "Annual",
    currentVersion: "2023 HMDA",
    nextExpectedUpdate: "2025-06-01",
    isLive: false,
    freshnessStatus: "stale",
  }),
  entry({
    id: "lead-risk",
    name: "HUD ELHD + MDHHS Lead Data",
    category: "Health",
    url: "https://hudgis-hud.opendata.arcgis.com",
    lastUpdated: "2024-01-01",
    updateFrequency: "Annual",
    currentVersion: "2023 data",
    nextExpectedUpdate: "2025-01-01",
    isLive: false,
    freshnessStatus: "stale",
  }),
  entry({
    id: "eviction-lab",
    name: "Eviction Lab (Princeton)",
    category: "Housing",
    url: "https://evictionlab.org",
    lastUpdated: "2024-01-01",
    updateFrequency: "Annual",
    currentVersion: "2023 data",
    nextExpectedUpdate: "2025-01-01",
    isLive: false,
    freshnessStatus: "stale",
  }),
  entry({
    id: "mitn-lobbying",
    name: "Michigan MiTN Lobbying",
    category: "Transparency",
    url: "https://mitn.michigan.gov",
    lastUpdated: "2024-12-01",
    updateFrequency: "Biannual",
    currentVersion: "2024 reporting period",
    nextExpectedUpdate: "2025-06-01",
    isLive: false,
    freshnessStatus: "stale",
  }),
];

export const DATA_FRESHNESS_SUMMARY = {
  totalSources: DATA_FRESHNESS_SOURCES.length,
  fresh: DATA_FRESHNESS_SOURCES.filter((s) => s.freshnessStatus === "fresh")
    .length,
  aging: DATA_FRESHNESS_SOURCES.filter((s) => s.freshnessStatus === "aging")
    .length,
  stale: DATA_FRESHNESS_SOURCES.filter((s) => s.freshnessStatus === "stale")
    .length,
  liveAPIs: DATA_FRESHNESS_SOURCES.filter((s) => s.isLive).length,
};
