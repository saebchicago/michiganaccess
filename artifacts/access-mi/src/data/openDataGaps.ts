/**
 * Open Data Gaps registry - the platform's map of what public data does NOT
 * exist, and why.
 *
 * AccessMI is built entirely on public data, which makes it a map of what
 * government publishes - and, just as precisely, of what it doesn't. This
 * registry names those gaps so residents can see them, understand them, and
 * act on them constructively.
 *
 * TONE RULES (enforced by openDataGaps.test.ts):
 *
 * 1. Two honest lanes, never conflated:
 *      "not-published"     - the government does not publish this data
 *      "not-yet-ingested"  - the data IS published; it is on OUR roadmap.
 *    Blaming agencies for gaps that are ours would be both false and
 *    political. Every entry declares its lane.
 * 2. Non-political by construction. Entries state only: what exists, what is
 *    missing, since when, who holds it, the stated reason, and a constructive
 *    action. Suppression entries explicitly acknowledge the privacy rationale
 *    - small-cell rules protect real people. No blame language: banned terms
 *    are asserted in the test file.
 * 3. Every gap claim is itself a factual claim and carries a citation
 *    (gapSource), exactly like any number on the platform.
 */

export type GapLane = "not-published" | "not-yet-ingested";

export type GapStatus =
  | "never-published"
  | "discontinued"
  | "suppressed-small-cells"
  | "partial-coverage"
  | "pending-ingestion";

export interface OpenDataGap {
  id: string;
  title: string;
  domain:
    | "Health"
    | "Education"
    | "Transparency"
    | "Economy"
    | "Infrastructure"
    | "Safety";
  lane: GapLane;
  status: GapStatus;
  /** What IS available today - always lead with what exists. */
  whatExists: string;
  whatIsMissing: string;
  /** e.g. "Discontinued 2021". */
  since?: string;
  /** The organization that holds or would hold the data. */
  holder: string;
  /** Statute, privacy rule, or stated policy. Omit only with noStatedReason. */
  statedReason?: string;
  /** Set when no reason has been published - itself a factual statement. */
  noStatedReason?: true;
  /** e.g. "10 of 83 counties". */
  coverage?: string;
  /** Resident-framed, non-political. */
  whyItMatters: string;
  /** Citation FOR the gap claim itself. */
  gapSource: { name: string; url?: string };
  action?: {
    kind: "foia" | "link";
    label: string;
    href: string;
  };
}

export const OPEN_DATA_GAPS: OpenDataGap[] = [
  // ── Lane 1: not published by government ─────────────────────────────────
  {
    id: "foia-statewide-counts",
    title: "Statewide FOIA request statistics",
    domain: "Transparency",
    lane: "not-published",
    status: "never-published",
    whatExists:
      "Individual public bodies keep their own FOIA logs, and Michigan FOIA (MCL 15.231-15.246) guarantees the right to request them.",
    whatIsMissing:
      "Michigan does not publish a statewide aggregate count of FOIA requests, response times, or denial rates, so no one can measure how the law performs overall.",
    holder: "Michigan public bodies (no statewide aggregator designated)",
    noStatedReason: true,
    whyItMatters:
      "Without statewide numbers, residents and lawmakers cannot tell whether public-records access is improving or eroding. Requesting your own local body's FOIA log is the first, fully legal step.",
    gapSource: {
      name: "Michigan FOIA, MCL 15.231-15.246 (no reporting mandate)",
      url: "https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-Act-442-of-1976",
    },
    action: {
      kind: "foia",
      label: "Request your local body's FOIA log",
      href: "/foia?topic=foia-statewide-counts",
    },
  },
  {
    id: "kindergarten-readiness",
    title: "Kindergarten readiness assessment",
    domain: "Education",
    lane: "not-published",
    status: "discontinued",
    whatExists:
      "Third-grade M-STEP English proficiency (38.9% statewide) is published annually and serves as the earliest broad academic indicator.",
    whatIsMissing:
      "Michigan discontinued its statewide Kindergarten Entry Assessment in 2021, so no county-level school-readiness indicator exists.",
    since: "Discontinued 2021",
    holder: "Michigan Department of Education",
    noStatedReason: true,
    whyItMatters:
      "Early-childhood programs like Rx Kids and PreK for All can only be evaluated against outcomes that are measured. The earliest available academic signal now arrives in third grade.",
    gapSource: {
      name: "Michigan Department of Education KEA program history",
      url: "https://www.michigan.gov/mde",
    },
  },
  {
    id: "infant-mortality-small-counties",
    title: "Infant mortality by race in small counties",
    domain: "Health",
    lane: "not-published",
    status: "suppressed-small-cells",
    whatExists:
      "MDHHS publishes county infant mortality rates, including by race where counts permit.",
    whatIsMissing:
      "Rates are suppressed where fewer than 20 events occurred - in several counties (including Macomb and Ottawa for Black infant mortality) no rate can be published.",
    holder: "Michigan Department of Health & Human Services",
    statedReason:
      "Small-cell suppression (<20 events) protects the privacy of identifiable families. This is a privacy protection, not a withholding.",
    whyItMatters:
      "Suppression is the right call for privacy - and it also means racial disparities in small counties are invisible in the data. Multi-year pooling at the state level is the standard remedy.",
    gapSource: {
      name: "MDHHS Vital Records suppression policy (<20 events)",
      url: "https://www.michigan.gov/mdhhs",
    },
  },
  {
    id: "traffic-fatality-rates-small-counties",
    title: "Traffic fatality rates in small counties",
    domain: "Safety",
    lane: "not-published",
    status: "suppressed-small-cells",
    whatExists:
      "NHTSA FARS publishes every fatal crash; county counts are available for all 83 counties.",
    whatIsMissing:
      "Per-capita rates for counties with fewer than 6 fatal events over 5 years are statistically unstable, so this platform suppresses the rate (the count still shows).",
    holder: "NHTSA (FARS) / this platform's suppression rule",
    statedReason:
      "Rates built on tiny counts swing wildly year to year and would mislead more than inform; the threshold mirrors the MDHHS small-cell convention.",
    whyItMatters:
      "A county showing 'suppressed' still displays its underlying count - only the unstable rate is withheld. It is a reminder that small-population statistics need multi-year windows.",
    gapSource: {
      name: "NHTSA FARS; platform suppression threshold documented in county-traffic-fatalities.ts",
      url: "https://www.nhtsa.gov/research-data/fatality-analysis-reporting-system-fars",
    },
  },
  {
    id: "dual-eligible-michigan-figure",
    title: "Michigan dual-eligible policy exposure",
    domain: "Health",
    lane: "not-published",
    status: "never-published",
    whatExists:
      "CMS publishes national dual-eligible enrollment; this platform derives a proportional Michigan estimate and labels it as derived.",
    whatIsMissing:
      "No Michigan-specific dual-eligible exposure figure has been published by CMS, KFF, MACPAC, or MDHHS for the provision analyzed on this platform.",
    holder: "CMS / MDHHS",
    noStatedReason: true,
    whyItMatters:
      "State-level publication would replace a modeled estimate with a measured one for a population navigating both Medicare and Medicaid.",
    gapSource: {
      name: "Dual-Eligible Exposure methodology (derivation disclosed)",
      url: "/methodology/dual-eligible-exposure",
    },
    action: {
      kind: "link",
      label: "See the methodology and its disclosed derivation",
      href: "/methodology/dual-eligible-exposure",
    },
  },
  {
    id: "county-pums-allocation",
    title: "County-level Medicaid allocation microdata",
    domain: "Health",
    lane: "not-published",
    status: "never-published",
    whatExists:
      "The Census Bureau publishes PUMS microdata at PUMA geography and county-level ACS summary tables.",
    whatIsMissing:
      "County-level PUMS-style microdata that would allow precise coverage-at-risk allocation is not available in published tables; this platform uses a disclosed ACS-share proxy instead.",
    holder: "U.S. Census Bureau",
    statedReason:
      "Microdata below PUMA geography would risk re-identification; the Census Bureau's disclosure-avoidance rules prevent it.",
    whyItMatters:
      "The proxy is disclosed on the methodology page. Better small-area estimates from the Bureau would tighten every county allocation built on them.",
    gapSource: {
      name: "Medicaid Coverage at Risk methodology",
      url: "/methodology/medicaid-coverage-at-risk",
    },
  },
  {
    id: "lobbying-by-industry",
    title: "Per-industry lobbying expenditure",
    domain: "Transparency",
    lane: "not-published",
    status: "never-published",
    whatExists:
      "The Michigan Secretary of State publishes registered lobbyist counts and aggregate expenditure reports.",
    whatIsMissing:
      "Michigan's lobbying disclosures do not break expenditures down by industry, so no per-industry spending comparison can be sourced.",
    holder: "Michigan Secretary of State (lobby registration)",
    noStatedReason: true,
    whyItMatters:
      "Industry-level breakdowns are published by several other states and by the federal system; a Michigan breakdown would let residents see who spends on what.",
    gapSource: {
      name: "Michigan lobby registration reports (aggregate only)",
      url: "https://www.michigan.gov/sos",
    },
  },
  {
    id: "places-cancer",
    title: "Cancer prevalence in CDC PLACES",
    domain: "Health",
    lane: "not-published",
    status: "never-published",
    whatExists:
      "CDC PLACES publishes 17 county-level measures used across this platform - diabetes, obesity, blood pressure, stroke, arthritis and more.",
    whatIsMissing:
      "Cancer prevalence is not in the PLACES measure set, so county cancer questions on /ask return an explicit PENDING answer rather than a substitute.",
    holder: "CDC (PLACES program)",
    statedReason:
      "PLACES models BRFSS self-report measures; cancer surveillance lives in separate registries (SEER/NPCR) with different geography and release rules.",
    whyItMatters:
      "Knowing which system holds which measure prevents wrong conclusions - cancer data exists, in a different federal registry at different geography.",
    gapSource: {
      name: "CDC PLACES measure definitions, 2025 release",
      url: "https://www.cdc.gov/places/",
    },
  },
  {
    id: "places-trend-comparability",
    title: "Chronic-disease trend lines",
    domain: "Health",
    lane: "not-published",
    status: "never-published",
    whatExists:
      "CDC PLACES publishes annual cross-sections used throughout this platform.",
    whatIsMissing:
      "CDC explicitly discourages comparing PLACES estimates across releases, so honest county trend lines for these measures cannot be built from it.",
    holder: "CDC (PLACES program)",
    statedReason:
      "PLACES is model-based; year-over-year differences reflect model updates as much as real change.",
    whyItMatters:
      "Any site showing PLACES 'trends' is showing model noise. This platform excludes those trends and says so - direct BRFSS surveillance would be the honest trend source.",
    gapSource: {
      name: "trendSeries.json excludedMetrics (CDC guidance quoted)",
    },
  },
  // ── Lane 2: published, not yet on this platform ─────────────────────────
  {
    id: "snap-monthly-county",
    title: "Monthly SNAP participation by county",
    domain: "Economy",
    lane: "not-yet-ingested",
    status: "pending-ingestion",
    whatExists:
      "MDHHS publishes monthly county SNAP participation tables; annual county figures are already on this platform.",
    whatIsMissing:
      "The monthly tables are published but not yet parsed into the platform.",
    holder: "MDHHS (published) / this platform (parsing pending)",
    statedReason:
      "Our gap, not the government's: the CSV parse is on the roadmap.",
    whyItMatters:
      "Monthly figures show benefit cliffs and seasonal swings that annual averages smooth away.",
    gapSource: {
      name: "snapCoverageRegistry.ts SNAP_NOT_INGESTED",
    },
  },
  {
    id: "gsrp-headstart-capacity",
    title: "GSRP and Head Start capacity",
    domain: "Education",
    lane: "not-yet-ingested",
    status: "pending-ingestion",
    whatExists:
      "Michigan publishes Great Start Readiness Program allocations; federal Head Start publishes program locations and funded enrollment.",
    whatIsMissing:
      "Neither is ingested here yet, so county preschool capacity cannot be compared to eligible population on this platform.",
    holder: "MDE / HHS (published) / this platform (ingestion pending)",
    statedReason: "Our gap, not the government's: on the ingestion roadmap.",
    whyItMatters:
      "Capacity-vs-eligibility is the single clearest early-childhood access measure a county can act on.",
    gapSource: {
      name: "EarlyChildhoodPage 'What we don't have yet' roadmap note",
      url: "/early-childhood",
    },
  },
  {
    id: "ejscreen-coverage",
    title: "EPA EJScreen environmental-justice index",
    domain: "Infrastructure",
    lane: "not-yet-ingested",
    status: "partial-coverage",
    whatExists:
      "EPA publishes EJScreen tract-level indices statewide; this platform has ingested 15 ZCTAs.",
    whatIsMissing:
      "Full 83-county EJScreen coverage awaits direct API integration; the pillar registry lists it as pending.",
    holder: "EPA (published) / this platform (integration pending)",
    statedReason:
      "Our gap, not the government's: pending direct API integration.",
    coverage: "15 ZCTAs of statewide coverage ingested",
    whyItMatters:
      "Environmental burden is one of the compound-access dimensions the platform deliberately dropped rather than fabricate - real coverage would let it return honestly.",
    gapSource: {
      name: "pillarRegistry.ts env-ejscreen (pending)",
    },
  },
  {
    id: "alice-trend-depth",
    title: "ALICE hardship trends",
    domain: "Economy",
    lane: "not-yet-ingested",
    status: "partial-coverage",
    whatExists:
      "United For ALICE publishes county hardship reports; current-year figures for all 83 counties are on this platform.",
    whatIsMissing:
      "Only 8 of 83 counties have enough seeded history here for a defensible trend line, so no ALICE trend is shown.",
    holder: "United For ALICE (published) / this platform (history partial)",
    statedReason:
      "Our gap, not the government's: 8 of 83 counties seeded in v1; showing a 'trend' from that coverage would mislead.",
    coverage: "8 of 83 counties with multi-year history",
    whyItMatters:
      "Hardship trends answer 'is it getting better?' - the question residents ask most, and the one this platform declines to fake.",
    gapSource: {
      name: "trendSeries.json excludedMetrics (ALICE coverage note)",
    },
  },
];

/** Rollup used by the /data-gaps summary tiles - derived, never retyped. */
export function summarizeGaps() {
  const total = OPEN_DATA_GAPS.length;
  const notPublished = OPEN_DATA_GAPS.filter(
    (g) => g.lane === "not-published",
  ).length;
  const notYetIngested = OPEN_DATA_GAPS.filter(
    (g) => g.lane === "not-yet-ingested",
  ).length;
  const suppressed = OPEN_DATA_GAPS.filter(
    (g) => g.status === "suppressed-small-cells",
  ).length;
  return { total, notPublished, notYetIngested, suppressed };
}

export function getGapById(id: string): OpenDataGap | undefined {
  return OPEN_DATA_GAPS.find((g) => g.id === id);
}

export const GAP_LANE_LABELS: Record<GapLane, string> = {
  "not-published": "Not published by government",
  "not-yet-ingested": "Published - not yet on this platform",
};

export const GAP_STATUS_LABELS: Record<GapStatus, string> = {
  "never-published": "Never published",
  discontinued: "Discontinued",
  "suppressed-small-cells": "Suppressed for privacy",
  "partial-coverage": "Partial coverage",
  "pending-ingestion": "Ingestion pending",
};
