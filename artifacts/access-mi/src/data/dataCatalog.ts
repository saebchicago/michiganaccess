/**
 * Governed catalog of every dataset Access Michigan puts in front of a
 * user. This is the single source of truth behind /civic-data-hub and
 * /data-validation; both pages render from this array and neither is
 * allowed to keep a local list.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * Before this catalog, three separate lists described the platform's
 * data: `sourcesRegistry.ts` (the feed registry), a `DATA_CATALOG`
 * literal inside CivicDataHubPage.tsx, and a `DATA_SOURCES` literal
 * inside DataValidationPage.tsx. Nothing reconciled them, so they drifted
 * - the same publisher was listed under different URLs, cadences
 * disagreed, and several publishers powering rendered figures appeared
 * on no registry at all. Every entry here is now checked against the
 * feed registry by `scripts/check-data-catalog.mjs` at build time.
 *
 * TWO KINDS OF ENTRY
 * ------------------
 *   kind: "ingested"   We pull this data in and compute rendered figures
 *                      from it. Must name a `registryFeed` that exists in
 *                      sourcesRegistry.ts. Cadence and URL host are checked
 *                      against that feed; any legitimate difference must be
 *                      explained in `cadenceNote` / `urlNote`.
 *
 *   kind: "reference"  We link users to it but compute nothing from it.
 *                      Has no registryFeed and is NOT counted in
 *                      DATA_SOURCE_COUNT. Must still name its publisher
 *                      and declare where on the site it is linked.
 *
 * The distinction is load-bearing: the platform's "N verified data
 * sources" claim covers ingested feeds only. Reference links are a
 * convenience for users and must never inflate that number.
 *
 * ADDING AN ENTRY
 * ---------------
 * Append below, then run `pnpm check:data-catalog`. The guard will tell
 * you exactly which invariant you missed. Every `poweredSurfaces` path
 * must be a route that actually exists.
 */

import { SOURCES_REGISTRY } from "./sourcesRegistry";

export type CatalogDomain =
  | "Health"
  | "Social"
  | "Environment"
  | "Safety"
  | "Infrastructure"
  | "Civic";

export type CatalogGeography =
  | "State"
  | "County"
  | "ZIP"
  | "Tract"
  | "Facility"
  | "City";

/**
 * How the value reaches the page. Mirrors the IntegrityBadge vocabulary:
 *   live_api  fetched at request time from a public API
 *   static    ingested snapshot committed to the repo
 *   modeled   published estimate, not a direct measurement
 *   curated   hand-maintained reference list, no numeric claims
 */
export type CatalogAccess = "live_api" | "static" | "modeled" | "curated";

export interface CatalogEntry {
  /** Stable slug. Never reuse or renumber - used in URLs and tests. */
  id: string;
  name: string;
  kind: "ingested" | "reference";
  /**
   * Exact `SourceEntry.name` from sourcesRegistry.ts. Required for
   * ingested entries, forbidden for reference entries.
   */
  registryFeed?: string;
  /** Publisher shown in the UI. For ingested entries the guard checks
   *  this equals the linked feed's `org`. */
  publisherOrg: string;
  domain: CatalogDomain;
  geography: CatalogGeography;
  access: CatalogAccess;
  cadence: string;
  /** Required when `cadence` differs from the linked feed's frequency. */
  cadenceNote?: string;
  sourceUrl: string;
  /** Required when `sourceUrl`'s host differs from the linked feed's host. */
  urlNote?: string;
  description: string;
  /** Routes this dataset actually appears on. Must be non-empty and real. */
  poweredSurfaces: string[];
}

export const DATA_CATALOG: CatalogEntry[] = [
  // ── Health ──────────────────────────────────────────────────────────
  {
    id: "cdc-places",
    name: "CDC PLACES / BRFSS",
    kind: "ingested",
    registryFeed: "CDC PLACES / BRFSS",
    publisherOrg: "CDC",
    domain: "Health",
    geography: "County",
    access: "modeled",
    cadence: "Annual",
    sourceUrl: "https://www.cdc.gov/places/",
    description:
      "Small-area estimates of adult chronic disease prevalence and health behaviors - 22 county measures and 17 ZCTA measures, model-based (MRP), not direct counts.",
    poweredSurfaces: ["/county/:slug", "/data", "/zip/:zipcode"],
  },
  {
    id: "cdc-atsdr-svi",
    name: "CDC/ATSDR Social Vulnerability Index",
    kind: "ingested",
    registryFeed: "CDC/ATSDR Social Vulnerability Index",
    publisherOrg: "ATSDR",
    domain: "Health",
    geography: "Tract",
    access: "modeled",
    cadence: "Every 2 years",
    sourceUrl: "https://www.atsdr.cdc.gov/placeandhealth/svi/",
    description:
      "Census tract vulnerability percentiles across socioeconomic status, household composition, minority status, and housing/transport themes.",
    poweredSurfaces: ["/health-equity-atlas", "/county/:slug"],
  },
  {
    id: "cms-hospital-compare",
    name: "CMS Hospital Compare",
    kind: "ingested",
    registryFeed: "CMS Hospital Compare",
    publisherOrg: "CMS",
    domain: "Health",
    geography: "Facility",
    access: "static",
    cadence: "Quarterly",
    sourceUrl: "https://data.cms.gov/",
    description:
      "Hospital quality measures, safety indicators, and facility characteristics for every Medicare-certified hospital.",
    poweredSurfaces: ["/find-care", "/quality"],
  },
  {
    id: "cms-provider-data",
    name: "CMS Provider Data Catalog",
    kind: "ingested",
    registryFeed: "CMS Physician Compare",
    publisherOrg: "CMS",
    domain: "Health",
    geography: "Facility",
    access: "static",
    cadence: "Quarterly",
    sourceUrl: "https://data.cms.gov/provider-data/",
    description:
      "Clinician enrollment, group affiliation, and Medicare utilization records used for provider lookup.",
    poweredSurfaces: ["/find-care", "/provider-data"],
  },
  {
    id: "hrsa-hpsa",
    name: "HRSA Health Professional Shortage Areas",
    kind: "ingested",
    registryFeed: "HRSA Data Warehouse",
    publisherOrg: "HRSA",
    domain: "Health",
    geography: "County",
    access: "static",
    cadence: "Quarterly",
    cadenceNote:
      "The HRSA Data Warehouse republishes HPSA designations quarterly; the UDS patient-volume tables inside it carry an annual vintage. We track the quarterly warehouse refresh.",
    sourceUrl: "https://data.hrsa.gov/",
    description:
      "Designated primary care, dental, and mental health shortage areas, plus FQHC service-site locations.",
    poweredSurfaces: ["/find-care", "/health-map", "/county/:slug"],
  },
  {
    id: "leapfrog-safety-grade",
    name: "Leapfrog Hospital Safety Grade",
    kind: "ingested",
    registryFeed: "Leapfrog Group",
    publisherOrg: "Leapfrog",
    domain: "Health",
    geography: "Facility",
    access: "static",
    cadence: "Biannual",
    sourceUrl: "https://www.hospitalsafetygrade.org/",
    description:
      "Letter safety grades assigned to acute-care hospitals from errors, injuries, accidents, and infection measures.",
    poweredSurfaces: ["/find-care", "/quality"],
  },
  {
    id: "county-health-rankings",
    name: "County Health Rankings",
    kind: "ingested",
    registryFeed: "County Health Rankings",
    publisherOrg: "UW Pop Health",
    domain: "Health",
    geography: "County",
    access: "static",
    cadence: "Annual",
    sourceUrl:
      "https://www.countyhealthrankings.org/explore-health-rankings/michigan",
    urlNote:
      "Michigan landing page on the publisher's own host; the registry entry points at the site root.",
    description:
      "County health outcomes and factors - length and quality of life, health behaviors, clinical care, social and economic factors, physical environment. Produced by the University of Wisconsin Population Health Institute with Robert Wood Johnson Foundation funding.",
    poweredSurfaces: ["/county/:slug", "/compare"],
  },
  {
    id: "openfda",
    name: "openFDA",
    kind: "ingested",
    registryFeed: "FDA openFDA",
    publisherOrg: "FDA",
    domain: "Health",
    geography: "State",
    access: "live_api",
    cadence: "Live",
    cadenceNote:
      "The openFDA endpoints stream continuously; the underlying recall and labeling datasets behind them are rebuilt on a roughly daily cycle.",
    sourceUrl: "https://open.fda.gov/",
    urlNote:
      "Documentation portal for the same service the registry lists by its API host (api.fda.gov).",
    description:
      "Drug approvals, product labeling, recalls, and adverse event reports.",
    poweredSurfaces: ["/learn"],
  },
  {
    id: "mi-moda",
    name: "Michigan MODA Overdose Dashboard",
    kind: "ingested",
    registryFeed: "MDHHS Health Data",
    publisherOrg: "MDHHS",
    domain: "Health",
    geography: "County",
    access: "modeled",
    cadence: "Varies",
    sourceUrl: "https://www.michigan.gov/opioids/category-data",
    urlNote:
      "Opioid data section of the same MDHHS web estate the registry entry points at.",
    description:
      "Overdose Data to Action - county overdose mortality and a composite community vulnerability index.",
    poweredSurfaces: ["/support-groups", "/data"],
  },
  {
    id: "mi-suddr",
    name: "MI-SUDDR",
    kind: "ingested",
    registryFeed: "MI-SUDDR",
    publisherOrg: "MI-SUDDR",
    domain: "Health",
    geography: "County",
    access: "modeled",
    cadence: "Annual",
    sourceUrl: "https://mi-suddr.com/resources-2",
    description:
      "Michigan Substance Use Disorder Data Repository - treatment admissions and substance trend series.",
    poweredSurfaces: ["/support-groups"],
  },
  {
    id: "monitoring-the-future",
    name: "Monitoring the Future",
    kind: "ingested",
    registryFeed: "Monitoring the Future",
    publisherOrg: "U-M ISR",
    domain: "Health",
    geography: "State",
    access: "static",
    cadence: "Annual",
    sourceUrl: "https://monitoringthefuture.org",
    description:
      "Long-running national survey of adolescent substance use prevalence.",
    poweredSurfaces: ["/support-groups"],
  },
  {
    id: "samhsa",
    name: "SAMHSA",
    kind: "ingested",
    registryFeed: "SAMHSA",
    publisherOrg: "SAMHSA",
    domain: "Health",
    geography: "State",
    access: "curated",
    cadence: "Ongoing",
    sourceUrl: "https://www.samhsa.gov/find-help/national-helpline",
    description:
      "National helpline and treatment locator references, plus federal behavioural health spending lines.",
    poweredSurfaces: ["/support-groups", "/learn"],
  },
  {
    id: "hhs-medicaid-spending",
    name: "HHS Medicaid Provider Spending",
    kind: "reference",
    publisherOrg: "HHS",
    domain: "Health",
    geography: "State",
    access: "curated",
    cadence: "Annual",
    sourceUrl: "https://opendata.hhs.gov/datasets/medicaid-provider-spending/",
    description:
      "State-level Medicaid provider spending and utilization. Linked for users to download directly - Access Michigan computes no figure from it.",
    poweredSurfaces: ["/provider-data"],
  },

  // ── Social ──────────────────────────────────────────────────────────
  {
    id: "united-for-alice",
    name: "United For ALICE - Michigan",
    kind: "ingested",
    registryFeed: "United For ALICE",
    publisherOrg: "MI United Ways",
    domain: "Social",
    geography: "County",
    access: "static",
    cadence: "Annual",
    sourceUrl: "https://www.unitedforalice.org/county-reports/Michigan",
    urlNote:
      "Michigan county-report index on the publisher's own host; the registry entry points at the state landing page.",
    description:
      "Asset-Limited, Income-Constrained, Employed household counts and survival-budget thresholds by county.",
    poweredSurfaces: ["/county/:slug", "/benefits"],
  },
  {
    id: "hud-chas",
    name: "HUD CHAS Housing Cost Burden",
    kind: "ingested",
    registryFeed: "HUD CHAS",
    publisherOrg: "HUD",
    domain: "Social",
    geography: "County",
    access: "static",
    cadence: "Annual",
    sourceUrl: "https://www.huduser.gov/portal/datasets/cp.html",
    description:
      "Share of households paying more than 30% and more than 50% of income on housing, by HUD income band and tenure, from HUD's CHAS special tabulation of ACS 5-year microdata.",
    poweredSurfaces: ["/county/:slug", "/brief", "/ask"],
  },
  {
    id: "census-acs-sdoh-county",
    name: "Census ACS 5-Year County SDOH Bundle",
    kind: "ingested",
    registryFeed: "Census ACS API",
    publisherOrg: "Census",
    domain: "Social",
    geography: "County",
    access: "static",
    cadence: "Annual",
    sourceUrl: "https://api.census.gov/data/2024/acs/acs5",
    description:
      "Eleven county social-determinant ratios computed from ACS 5-year detail-table counts: poverty and child poverty, renter and owner cost burden, no-vehicle households, 45-minute-plus commutes, adults without a diploma and with a bachelor's degree, limited-English households, crowding, and renter share.",
    poweredSurfaces: ["/county/:slug", "/brief", "/ask", "/health-equity-atlas"],
  },
  {
    id: "mde-county-education",
    name: "MDE County K-12 Indicators",
    kind: "ingested",
    registryFeed: "Michigan Dept of Education",
    publisherOrg: "MDE",
    domain: "Social",
    geography: "County",
    access: "static",
    cadence: "Annual",
    sourceUrl: "https://www.mischooldata.org/",
    description:
      "Chronic absenteeism, 3rd-grade M-STEP English language arts proficiency, four-year graduation rate, and economically disadvantaged share from MI School Data's county-level report exports. MDE suppresses cells under 10 students; those render as unavailable, never zero.",
    poweredSurfaces: ["/early-childhood", "/county/:slug", "/brief", "/ask"],
  },
  {
    id: "cdc-atsdr-svi-county",
    name: "CDC/ATSDR SVI County Rankings",
    kind: "ingested",
    registryFeed: "CDC/ATSDR Social Vulnerability Index",
    publisherOrg: "ATSDR",
    domain: "Social",
    geography: "County",
    access: "modeled",
    cadence: "Every 2 years",
    sourceUrl: "https://www.atsdr.cdc.gov/place-health/php/svi/index.html",
    description:
      "Overall and four-theme social vulnerability percentile ranks for every Michigan county, ranked against all US counties, with ATSDR's ACS-derived input percentages. A committed county file alongside the tract-level SVI fetched live for the compound index.",
    poweredSurfaces: ["/county/:slug", "/brief", "/ask"],
  },
  {
    id: "nchs-overdose-county",
    name: "NCHS Provisional County Overdose Deaths",
    kind: "ingested",
    registryFeed: "NCHS Vital Statistics Rapid Release",
    publisherOrg: "CDC",
    domain: "Health",
    geography: "County",
    access: "static",
    cadence: "Monthly",
    sourceUrl: "https://data.cdc.gov/NCHS/VSRR-Provisional-County-Level-Drug-Overdose-Death-C/gb4e-bhi7",
    description:
      "Provisional 12-month-ending drug overdose death counts by county of residence from NCHS's Vital Statistics Rapid Release. Counts under 10 are suppressed by NCHS and render as unavailable, never zero; no per-100k rate is computed.",
    poweredSurfaces: ["/county/:slug", "/brief", "/ask"],
  },
  {
    id: "michigan-211",
    name: "Michigan 2-1-1",
    kind: "ingested",
    registryFeed: "Michigan 211",
    publisherOrg: "United Way",
    domain: "Social",
    geography: "County",
    access: "live_api",
    cadence: "Daily",
    sourceUrl: "https://mi211.org",
    description:
      "Community resource referral database covering food, housing, utilities, and transportation assistance.",
    poweredSurfaces: ["/resources", "/financial-help"],
  },
  {
    id: "census-acs",
    name: "Census ACS 5-Year Estimates",
    kind: "ingested",
    registryFeed: "Census ACS API",
    publisherOrg: "Census",
    domain: "Social",
    geography: "Tract",
    access: "static",
    cadence: "Annual",
    sourceUrl: "https://data.census.gov/",
    urlNote:
      "Human-facing data portal for the same programme the registry lists by its API host (api.census.gov).",
    description:
      "Demographic, economic, housing, and social characteristics at state, county, tract, and ZCTA level.",
    poweredSurfaces: ["/county/:slug", "/zip/:zipcode", "/compare"],
  },
  {
    id: "mdhhs-sdoh",
    name: "MDHHS Social Determinants of Health Strategy",
    kind: "ingested",
    registryFeed: "MDHHS Health Data",
    publisherOrg: "MDHHS",
    domain: "Social",
    geography: "County",
    access: "curated",
    cadence: "Varies",
    sourceUrl:
      "https://www.michigan.gov/mdhhs/inside-mdhhs/legislationpolicy/2022-2024-social-determinants-of-health-strategy",
    urlNote:
      "Policy section of the same MDHHS web estate the registry entry points at.",
    description:
      "State social determinants of health strategy, regional hubs, and equity indicator definitions.",
    poweredSurfaces: ["/health-equity-atlas", "/methodology"],
  },

  // ── Environment ─────────────────────────────────────────────────────
  {
    id: "epa-airnow",
    name: "EPA AirNow",
    kind: "ingested",
    registryFeed: "AirNow API",
    publisherOrg: "EPA",
    domain: "Environment",
    geography: "County",
    access: "live_api",
    cadence: "Hourly",
    sourceUrl: "https://www.airnow.gov/",
    description:
      "Real-time Air Quality Index readings from EPA-registered monitoring stations.",
    poweredSurfaces: ["/environment/air", "/environment"],
  },
  {
    id: "aceee-energy-burden",
    name: "ACEEE Energy Burden Research",
    kind: "ingested",
    registryFeed: "ACEEE Energy Burden Research",
    publisherOrg: "ACEEE",
    domain: "Environment",
    geography: "County",
    access: "modeled",
    cadence: "Periodic",
    sourceUrl: "https://www.aceee.org/research-report/u2006",
    description:
      "Modeled low-income energy burden estimates. Published research findings, not a measured county series - rendered under a MODELED label.",
    poweredSurfaces: ["/energy-burden", "/environment/energy"],
  },
  {
    id: "eia-seds",
    name: "EIA State Energy Data System",
    kind: "ingested",
    registryFeed: "EIA v2 API",
    publisherOrg: "DOE",
    domain: "Environment",
    geography: "State",
    access: "static",
    cadence: "Annual",
    cadenceNote:
      "SEDS is an annual consolidated release. The registry entry tracks the same publisher's v2 API, whose price series update monthly.",
    sourceUrl: "https://www.eia.gov/state/seds/",
    urlNote:
      "SEDS product pages on the publisher's main host; the registry entry points at the API host (api.eia.gov).",
    description:
      "State-level energy consumption, prices, and expenditures used for Michigan-versus-national comparisons.",
    poweredSurfaces: ["/environment/energy", "/environment"],
  },
  {
    id: "egle-drinking-water",
    name: "EGLE Drinking Water",
    kind: "reference",
    publisherOrg: "EGLE",
    domain: "Environment",
    geography: "Facility",
    access: "curated",
    cadence: "Ongoing",
    sourceUrl:
      "https://www.michigan.gov/egle/about/organization/drinking-water-and-environmental-health",
    description:
      "Public water system violations, advisories, and compliance records. Linked for lookup - Access Michigan computes no figure from it.",
    poweredSurfaces: ["/environment/water"],
  },

  // ── Safety ──────────────────────────────────────────────────────────
  {
    id: "nhtsa-fars",
    name: "NHTSA FARS",
    kind: "ingested",
    registryFeed: "NHTSA FARS",
    publisherOrg: "NHTSA",
    domain: "Safety",
    geography: "County",
    access: "static",
    cadence: "Annual",
    sourceUrl:
      "https://www.nhtsa.gov/research-data/fatality-analysis-reporting-system-fars",
    description:
      "Fatal traffic crash census by county, aggregated to a five-year window and expressed per 100,000 residents.",
    poweredSurfaces: ["/transportation", "/county/:slug"],
  },
  {
    id: "fbi-cde",
    name: "FBI Crime Data Explorer",
    kind: "ingested",
    registryFeed: "FBI Crime Data Explorer",
    publisherOrg: "FBI",
    domain: "Safety",
    geography: "County",
    access: "static",
    cadence: "Annual",
    sourceUrl: "https://cde.ucr.cjis.gov/",
    description:
      "Uniform Crime Reporting and Michigan Incident Crime Reporting violent and property offence rates.",
    poweredSurfaces: ["/public-safety"],
  },
  {
    id: "msp-traffic-stops",
    name: "MSP Traffic Stop Data",
    kind: "reference",
    publisherOrg: "MSP",
    domain: "Safety",
    geography: "State",
    access: "curated",
    cadence: "Annual",
    sourceUrl:
      "https://www.michigan.gov/msp/public-information/transparency/accordion/reports/traffic-stop-data-main",
    description:
      "Michigan State Police traffic stop and use-of-force transparency reports. Linked for review - Access Michigan computes no figure from it.",
    poweredSurfaces: ["/public-safety"],
  },

  // ── Infrastructure ──────────────────────────────────────────────────
  {
    id: "mpsc-edockets",
    name: "MPSC E-Dockets",
    kind: "ingested",
    registryFeed: "MPSC E-Dockets",
    publisherOrg: "MPSC",
    domain: "Infrastructure",
    geography: "State",
    access: "curated",
    cadence: "Ongoing",
    sourceUrl: "https://mi-psc.my.site.com/s/",
    description:
      "Michigan Public Service Commission rate cases and utility filings, including reliability metrics reported by regulated utilities.",
    poweredSurfaces: ["/partners/utilities-regulators", "/outages"],
  },

  // ── Civic ───────────────────────────────────────────────────────────
  {
    id: "mi-sos-foia",
    name: "Michigan SOS FOIA Portal",
    kind: "reference",
    publisherOrg: "Michigan SOS",
    domain: "Civic",
    geography: "State",
    access: "curated",
    cadence: "Ongoing",
    sourceUrl: "https://www.michigan.gov/sos",
    description:
      "Public records requests, campaign finance filings, and election administration. Linked as a starting point for records requests.",
    poweredSurfaces: ["/transparency", "/foia"],
  },
];

// ── Derived views ─────────────────────────────────────────────────────

export const INGESTED_CATALOG = DATA_CATALOG.filter(
  (d) => d.kind === "ingested",
);

export const REFERENCE_CATALOG = DATA_CATALOG.filter(
  (d) => d.kind === "reference",
);

export const CATALOG_DOMAINS: CatalogDomain[] = [
  "Health",
  "Social",
  "Environment",
  "Safety",
  "Infrastructure",
  "Civic",
];

export function getCatalogEntry(id: string): CatalogEntry | undefined {
  return DATA_CATALOG.find((d) => d.id === id);
}

/** The registry feed backing an ingested catalog entry, if any. */
export function getRegistryFeed(entry: CatalogEntry) {
  if (!entry.registryFeed) return undefined;
  return SOURCES_REGISTRY.find((s) => s.name === entry.registryFeed);
}
