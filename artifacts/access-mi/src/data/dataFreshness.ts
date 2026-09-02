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
//
// TWO DIMENSIONS, NOT ONE
// -----------------------
// `freshnessStatus` used to be hand-set per entry, and it silently answered
// two different questions depending on who wrote the line:
//
//   "how recently did we pull it?"        (ingest recency)
//   "is our copy the newest release?"     (vintage currency)
//
// That produced entries that contradicted each other on identical inputs -
// cdc-places and census-acs carried the same lastUpdated, the same Annual
// cadence, and the same nextExpectedUpdate, but one said "fresh" (judging
// ingest) and the other "aging" (judging vintage). A reader could not tell
// which dimension a badge referred to, and nothing caught the conflict.
//
// The two questions are now separate fields, and the rendered rollup is
// derived from them rather than typed by hand:
//
//   ingestStatus    derived from lastPulled against updateFrequency and
//                   nextExpectedUpdate. Never hand-set.
//   vintageStatus   declared, because only a human can know whether the
//                   publisher has issued a newer release than the one we
//                   ship. "behind" requires a vintageNote saying so.
//   freshnessStatus derived rollup: the worse of the two.
//
// Dates are not hand-copied either. An entry backed by a generated dataset
// names it in `generatedFrom` and its `lastPulled` is READ from
// provenance-index.generated.json - the machine record of each dataset's
// provenance.ingested_at. The census-acs entry used to claim 2026-07-02
// while the file recorded 2026-08-10: a hand-copied date that drifted 39
// days from the truth it cited. Nothing to hand-copy now, so nothing to
// drift, and the scheduled refresh jobs that rewrite ingested_at update
// this automatically instead of silently invalidating it.

import provenanceIndex from "./provenance-index.generated.json";

const INGESTED_AT: Record<string, string> = provenanceIndex.ingestedAt;

/** Has our copy been pulled recently enough for its own stated cadence? */
export type IngestStatus = "current" | "overdue";

/** Is the release we ship the newest the publisher has issued? */
export type VintageStatus = "current" | "behind";

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
  /**
   * @deprecated Use lastPulled. Retained for back-compat.
   * For entries with `generatedFrom` this is resolved from the provenance
   * index, not declared - see `entry()` below.
   */
  lastUpdated: string;
  /** @deprecated Use sourceYear. Retained for back-compat. */
  currentVersion: string;
  updateFrequency: string;
  nextExpectedUpdate: string;
  isLive: boolean;
  /**
   * Generated dataset whose `provenance.ingested_at` is authoritative for
   * `lastUpdated`. Build-asserted; omit for sources we do not ingest into
   * a committed file.
   */
  generatedFrom?: string;
  /** Declared: is the shipped release the publisher's newest? */
  vintageStatus: VintageStatus;
  /** Required when vintageStatus is "behind" - which release we are missing. */
  vintageNote?: string;
  /** Derived from lastPulled. Never hand-set. */
  ingestStatus: IngestStatus;
  /** Derived rollup of ingestStatus and vintageStatus. Never hand-set. */
  freshnessStatus: "fresh" | "aging" | "stale";
}

/**
 * Date of the most recent platform-wide verification sweep across all
 * datasets. When you run a provenance audit, bump this and update any
 * per-dataset overrides below.
 */
const PLATFORM_LAST_VERIFIED = "2026-07-14";

/**
 * How long a dataset may go unpulled before its ingest is overdue, keyed by
 * substrings of `updateFrequency`. Budgets are deliberately generous - a
 * dataset is only flagged once it is past the point where a refresh should
 * plainly have happened. Longest matching key wins, so "semi-annual" is not
 * captured by "annual".
 */
const CADENCE_BUDGET_DAYS: ReadonlyArray<readonly [string, number]> = [
  ["real-time", 7],
  ["continuous", 7],
  ["live", 7],
  ["hourly", 7],
  ["daily", 7],
  ["weekly", 21],
  ["monthly", 60],
  ["quarterly", 150],
  ["semi-annual", 240],
  ["semiannual", 240],
  ["biannual", 240],
  ["every 2 years", 850],
  ["every 2-3 years", 1250],
  ["every 4-5 years", 1950],
  ["biennial", 850],
  ["annual", 450],
];

function cadenceBudgetDays(updateFrequency: string): number | null {
  const f = updateFrequency.toLowerCase();
  let best: number | null = null;
  let bestKeyLength = -1;
  for (const [key, days] of CADENCE_BUDGET_DAYS) {
    if (f.includes(key) && key.length > bestKeyLength) {
      best = days;
      bestKeyLength = key.length;
    }
  }
  return best;
}

/**
 * Deadline implied by `nextExpectedUpdate`. Accepts a plain date
 * ("2025-10-01") or a year / year-range ("2026", "2024-2025"), in which case
 * the deadline is the end of the last year named. Non-committal values like
 * "Ongoing" yield null and the cadence budget decides on its own.
 */
function expectedDeadline(nextExpectedUpdate: string): Date | null {
  const iso = nextExpectedUpdate.match(/^\d{4}-\d{2}-\d{2}$/);
  if (iso) return new Date(nextExpectedUpdate + "T00:00:00Z");
  const years = [...nextExpectedUpdate.matchAll(/\b(20\d{2})\b/g)].map((m) =>
    Number(m[1]),
  );
  if (years.length === 0) return null;
  return new Date(Date.UTC(Math.max(...years) + 1, 0, 1));
}

/**
 * Ingest is overdue when the publisher's own expected-update date has passed,
 * or when we have simply not pulled within the cadence budget.
 */
export function deriveIngestStatus(
  lastPulled: string,
  updateFrequency: string,
  nextExpectedUpdate: string,
  now: Date = new Date(),
): IngestStatus {
  const pulled = Date.parse(lastPulled + "T00:00:00Z");
  if (Number.isNaN(pulled)) return "overdue";

  const deadline = expectedDeadline(nextExpectedUpdate);
  if (deadline && now.getTime() >= deadline.getTime()) return "overdue";

  const budget = cadenceBudgetDays(updateFrequency);
  if (budget === null) return "current";
  const ageDays = (now.getTime() - pulled) / 86_400_000;
  return ageDays > budget ? "overdue" : "current";
}

/** Rendered rollup: the worse of the two dimensions. */
export function deriveFreshnessStatus(
  ingest: IngestStatus,
  vintage: VintageStatus,
): "fresh" | "aging" | "stale" {
  if (ingest === "overdue") return "stale";
  return vintage === "behind" ? "aging" : "fresh";
}

type FreshnessSeed = Omit<
  DataSource,
  | "lastPulled"
  | "sourceYear"
  | "lastVerified"
  | "ingestStatus"
  | "freshnessStatus"
  | "lastUpdated"
> & {
  lastVerified?: string;
  /**
   * Declare only for sources with no committed generated dataset. When
   * `generatedFrom` is set the date comes from the provenance index and
   * declaring it here is rejected by scripts/check-data-freshness.mjs.
   */
  lastUpdated?: string;
};

function entry(partial: FreshnessSeed): DataSource {
  const lastUpdated = partial.generatedFrom
    ? INGESTED_AT[partial.generatedFrom]
    : partial.lastUpdated;

  if (!lastUpdated) {
    throw new Error(
      partial.generatedFrom
        ? `dataFreshness: "${partial.id}" names generatedFrom "${partial.generatedFrom}" but provenance-index.generated.json has no ingest date for it. Run scripts/generate-provenance-index.mjs.`
        : `dataFreshness: "${partial.id}" has no generatedFrom and no lastUpdated.`,
    );
  }

  const ingestStatus = deriveIngestStatus(
    lastUpdated,
    partial.updateFrequency,
    partial.nextExpectedUpdate,
  );
  return {
    ...partial,
    lastUpdated,
    lastPulled: lastUpdated,
    sourceYear: partial.currentVersion,
    lastVerified: partial.lastVerified ?? PLATFORM_LAST_VERIFIED,
    ingestStatus,
    freshnessStatus: deriveFreshnessStatus(ingestStatus, partial.vintageStatus),
  };
}

export const DATA_FRESHNESS_SOURCES: DataSource[] = [
  entry({
    // Matches cdc-places-county.generated.json provenance: 2025 release
    // (Socrata rows updated 2025-12-04), ingested 2026-07-02.
    id: "cdc-places",
    name: "CDC PLACES Health Metrics",
    category: "Health",
    url: "https://data.cdc.gov",
    generatedFrom: "cdc-places-county.generated.json",
    updateFrequency: "Annual",
    currentVersion: "PLACES 2025 Release",
    nextExpectedUpdate: "2026-12-01",
    isLive: true,
    vintageStatus: "current",
    lastVerified: "2026-07-29",
  }),
  entry({
    // Matches acs-broadband-county.generated.json and trendSeries.json:
    // the shipped window is 2019-2023 (2023 5-Year ACS). The 2020-2024
    // release is out, so this is one cycle behind, not two.
    id: "census-acs",
    name: "Census ACS 5-Year Estimates",
    category: "Demographics",
    url: "https://api.census.gov",
    generatedFrom: "acs-broadband-county.generated.json",
    updateFrequency: "Annual",
    currentVersion: "2023 5-Year ACS (2019-2023)",
    nextExpectedUpdate: "2026-12-01",
    isLive: true,
    vintageStatus: "behind",
    vintageNote:
      "We ship the 2023 5-Year ACS (2019-2023); the 2020-2024 release is published. One cycle behind.",
    lastVerified: "2026-07-29",
  }),
  entry({
    // Added 2026-08-16: this dataset ships county unemployment rates on
    // /county and /data but carried no freshness entry, so the tracked-source
    // rollup under-reported what the platform actually ingests.
    id: "bls-laus",
    name: "BLS Local Area Unemployment Statistics",
    category: "Economy",
    url: "https://www.bls.gov/lau/",
    generatedFrom: "bls-laus-county.generated.json",
    updateFrequency: "Monthly",
    currentVersion: "June 2026 (Preliminary)",
    nextExpectedUpdate: "Ongoing",
    isLive: false,
    vintageStatus: "behind",
    vintageNote:
      "We ship the June 2026 preliminary series; BLS has released later monthly estimates since our last pull.",
  }),
  entry({
    // Added 2026-08-16: same omission as bls-laus - HPSA designations back
    // /find-care and /health-map but were not tracked for freshness.
    id: "hrsa-hpsa",
    name: "HRSA Health Professional Shortage Areas",
    category: "Health",
    url: "https://data.hrsa.gov/",
    generatedFrom: "hrsa-hpsa-county.generated.json",
    updateFrequency: "Quarterly",
    currentVersion: "HRSA detail files dated 2026-06-30",
    nextExpectedUpdate: "Ongoing",
    isLive: false,
    vintageStatus: "current",
  }),
  entry({
    // Added 2026-09-02: county housing cost burden from HUD's CHAS special
    // tabulation. The ingest script tries the newest county file HUD serves
    // (2018-2022, then 2017-2021) and records the one used in provenance;
    // this string names the newest candidate and is corrected if the first
    // scheduled pull lands on the older one.
    id: "hud-chas",
    name: "HUD CHAS Housing Cost Burden",
    category: "Housing",
    url: "https://www.huduser.gov/portal/datasets/cp.html",
    generatedFrom: "hud-chas-county.generated.json",
    updateFrequency: "Annual",
    currentVersion: "CHAS 2018-2022 (5-year county file)",
    nextExpectedUpdate: "2026-10-31",
    isLive: false,
    vintageStatus: "current",
  }),
  entry({
    // Added 2026-09-02: the county SDOH bundle pulls the 2020-2024 ACS
    // release. The separate broadband file (census-acs above) still sits on
    // 2019-2023 and keeps its own "behind" entry until it is bumped.
    id: "census-acs-sdoh",
    name: "Census ACS 5-Year County SDOH Bundle",
    category: "Demographics",
    url: "https://api.census.gov",
    generatedFrom: "acs-sdoh-county.generated.json",
    updateFrequency: "Annual",
    currentVersion: "2024 5-Year ACS (2020-2024)",
    nextExpectedUpdate: "2026-12-15",
    isLive: false,
    vintageStatus: "current",
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
    vintageStatus: "behind",
    vintageNote:
      "We ship FY2025 Fair Market Rents; HUD has since published the FY2026 schedule.",
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
    vintageStatus: "current",
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
    vintageStatus: "behind",
    vintageNote:
      "We ship FY2024 obligations; FY2025 is closed and published.",
  }),
  entry({
    // Anchored 2026-08-30: the county payload moved to the official 2026
    // Michigan Data Sheet (2024 data, all 83 counties) but this entry still
    // hand-declared 2025-05-01 / "2025 Report (2023 data)", so the freshness
    // page reported a vintage the platform no longer ships. The date now
    // resolves from alice-county.generated.json via the provenance index.
    id: "alice",
    name: "United Way ALICE Report",
    category: "Economic",
    url: "https://unitedforalice.org/michigan",
    generatedFrom: "alice-county.generated.json",
    updateFrequency: "Every 2 years",
    currentVersion: "2026 Report (2024 data)",
    nextExpectedUpdate: "2028",
    isLive: false,
    vintageStatus: "current",
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
    vintageStatus: "behind",
    vintageNote:
      "We ship the 2023 National Risk Index; FEMA's next release window (2025-2026) has opened.",
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
    vintageStatus: "current",
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
    vintageStatus: "behind",
    vintageNote:
      "We ship the 2019 Food Access Research Atlas; the 2024-2025 update window has passed.",
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
    vintageStatus: "behind",
    vintageNote:
      "We ship the 2024 Broadband Data Collection; newer semiannual filings are published.",
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
    vintageStatus: "current",
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
    vintageStatus: "behind",
    vintageNote:
      "We ship 2023 HMDA loan-level data; the 2024 release is published.",
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
    vintageStatus: "behind",
    vintageNote:
      "We ship 2023 lead-risk data; the expected 2025 refresh has passed.",
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
    vintageStatus: "behind",
    vintageNote:
      "We ship 2023 eviction filings; the expected 2025 refresh has passed.",
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
    vintageStatus: "behind",
    vintageNote:
      "We ship the 2024 reporting period; the mid-2025 filing period has closed.",
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
  /** Datasets we have not re-pulled within their own stated cadence. */
  ingestOverdue: DATA_FRESHNESS_SOURCES.filter(
    (s) => s.ingestStatus === "overdue",
  ).length,
  /** Datasets where the publisher has issued a newer release than we ship. */
  vintageBehind: DATA_FRESHNESS_SOURCES.filter(
    (s) => s.vintageStatus === "behind",
  ).length,
};
