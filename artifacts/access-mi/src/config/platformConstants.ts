/**
 * Platform-wide single source of truth (SSOT) for site-wide factual figures.
 *
 * Every cross-page claim about data sources, indexed records, languages,
 * platform versions, or freshness must import from this file. If a value
 * appears in more than one place in the UI, it belongs here.
 *
 * Counting rules and provenance live alongside the values so reviewers can
 * verify them without re-deriving the rule from code.
 */

import { DATA_FRESHNESS_SOURCES } from "@/data/dataFreshness";
import { SOURCES_BREAKDOWN, SOURCES_TOTAL } from "@/data/sourcesRegistry";
import { ATLAS_LAYERS } from "@/config/atlasLayers";

/**
 * Total verified public source ORGANIZATIONS powering the platform.
 *
 * Derived from `src/data/sourcesRegistry.ts`. The expected canonical
 * value is 41 (23 federal + 9 state + 9 nonprofit). If the registry
 * grows or shrinks, update the EXPECTED_* constants below in the same
 * commit so the build assertion does not fail silently.
 *
 * Rule: count unique source organizations by publisher entity, not API
 * endpoints or downstream tables.
 */
const EXPECTED_SOURCE_COUNT = 41;
const EXPECTED_SOURCE_BREAKDOWN = {
  federal: 23,
  state: 9,
  nonprofit: 9,
} as const;

if (SOURCES_TOTAL !== EXPECTED_SOURCE_COUNT) {
  throw new Error(
    `platformConstants: SOURCES_REGISTRY length is ${SOURCES_TOTAL}, expected ${EXPECTED_SOURCE_COUNT}. Update EXPECTED_SOURCE_COUNT or fix the registry.`,
  );
}
if (
  SOURCES_BREAKDOWN.federal !== EXPECTED_SOURCE_BREAKDOWN.federal ||
  SOURCES_BREAKDOWN.state !== EXPECTED_SOURCE_BREAKDOWN.state ||
  SOURCES_BREAKDOWN.nonprofit !== EXPECTED_SOURCE_BREAKDOWN.nonprofit
) {
  throw new Error(
    `platformConstants: SOURCES_BREAKDOWN drift — registry=${JSON.stringify(SOURCES_BREAKDOWN)}, expected=${JSON.stringify(EXPECTED_SOURCE_BREAKDOWN)}.`,
  );
}

export const DATA_SOURCE_COUNT = SOURCES_TOTAL;
export const DATA_SOURCE_BREAKDOWN = SOURCES_BREAKDOWN;

export const DATA_SOURCE_RULE =
  "Unique source organizations counted by publisher entity (federal agency, state agency, or nonprofit/academic publisher). API endpoints from the same publisher are not double-counted.";

/**
 * Canonical provenance phrasing for metadata and visible copy.
 *
 * Replaces ad-hoc strings like "federal and state agencies" (which omits
 * the 9 nonprofit publishers) so search snippets and on-page chrome stay
 * accurate when the breakdown changes.
 */
export const SOURCE_PROVENANCE = "federal, state, and nonprofit public sources";

/**
 * Human-readable marketing display for source count.
 *
 * Use this in hero copy, footer, button labels, etc. The raw integer
 * DATA_SOURCE_COUNT is used in counter components, schema, and counts
 * that need exact arithmetic.
 */
export const DATA_SOURCE_DISPLAY = String(DATA_SOURCE_COUNT);

/**
 * Number of equity layers shown on /health-equity-atlas. Derived from
 * the layer config; copy that says "Eight equity layers" or "10 layers"
 * is wrong by construction. Use this constant in visible counts.
 */
export const ATLAS_LAYER_COUNT = ATLAS_LAYERS.length;

/**
 * Aggregated records across all integrated datasets and feeds.
 *
 * Rule: sum of records exposed across hospital quality (CMS),
 * provider directories (NPPES, HRSA), Michigan 211 service records,
 * facility-level rows (EPA TRI, EPA ECHO), and curated resource entries.
 * Surfaced as a marketing display only; never used in arithmetic.
 */
export const RESOURCE_COUNT_DISPLAY = "15,000+";

/**
 * Numeric form of the resource count for animated counters and arithmetic.
 * Marketing copy should prefer RESOURCE_COUNT_DISPLAY ("15,000+").
 */
export const RESOURCE_COUNT = 15000;

/** Site-supported UI languages - matches src/i18n locales (en, es, ar, bn). */
export const LANGUAGES_SUPPORTED = 4;

/** All 83 Michigan counties. Constant for consistency with copy. */
export const COUNTIES_COVERED = 83;

/**
 * Count of registered political parties on the Michigan ballot.
 *
 * Derived from the canonical list in src/data/michiganParties.ts
 * (Democratic, Republican, Libertarian, Green, Working Class,
 * U.S. Taxpayers, Natural Law). The Transparency Hub and the All
 * Parties page previously hardcoded "8" in copy while the data
 * file only ever held 7 entries; this constant makes the copy and
 * the underlying data the same number.
 *
 * Source: Michigan Secretary of State Bureau of Elections, 2025.
 * If a party gains or loses ballot access, update both
 * src/data/michiganParties.ts and this constant in the same commit
 * so they cannot drift again.
 */
export const MICHIGAN_POLITICAL_PARTY_COUNT = 7;

/**
 * Number of external data-source APIs the platform actively monitors
 * for live availability on the /status page.
 *
 * Derived from src/lib/health-check.ts (CDC PLACES, NWS Weather,
 * FDA Recalls, ClinicalTrials.gov). Use this anywhere copy claims
 * "monitored feeds", "verified feeds", or similar so the number on
 * the page and the number /status actually pings cannot diverge.
 *
 * Note: this is NOT the same as DATA_SOURCE_COUNT (41 publisher
 * organizations). Most of the 41 publishers ship as static data
 * imports, not live API calls; the four here are the ones with
 * always-on uptime checks.
 */
export const MONITORED_API_FEEDS_COUNT = 4;

/**
 * Canonical platform release timeline.
 *
 * One log, not three. Older "v2.0 – v9.2" entries previously living in
 * ChangelogPage represented inflated version numbering for substantive
 * work; that content is renumbered as v1.5+ continuations of this
 * baseline. See PlatformChangelog for the full append-only release
 * notes; this array is the single source for landmark/milestone
 * releases referenced by the Impact page and About page.
 */
export interface PlatformRelease {
  version: string;
  date: string;
  title: string;
  desc: string;
}

export const PLATFORM_RELEASES: PlatformRelease[] = [
  {
    version: "v1.0",
    date: "Dec 2024",
    title: "Foundation",
    desc: "83-county coverage, Find Care, community resources, health map.",
  },
  {
    version: "v1.1",
    date: "Jan 2025",
    title: "Data Layer",
    desc: "Census ACS integration, county comparisons, data explorer.",
  },
  {
    version: "v1.2",
    date: "Feb 2025",
    title: "Civic Access",
    desc: "Elections, officials, transparency, public safety pages.",
  },
  {
    version: "v1.3",
    date: "Feb 2025",
    title: "Intelligence Suite",
    desc: "CHNA Explorer, equity scorecard, market intelligence.",
  },
  {
    version: "v1.4",
    date: "Mar 2025",
    title: "Partner Tools",
    desc: "Detection Gap, quality comparison, energy burden dashboard.",
  },
];

/** Founding marker derived from the first release. */
export const PLATFORM_LAUNCH = PLATFORM_RELEASES[0]!.date;
export const CURRENT_VERSION =
  PLATFORM_RELEASES[PLATFORM_RELEASES.length - 1]!.version;

/**
 * Three-field freshness model - replaces single "Updated <month>" stamps.
 *
 *   sourceYear     vintage of the underlying data (e.g., "2022 5-Year ACS")
 *   lastPulled     when we ingested it into the platform (YYYY-MM-DD)
 *   lastVerified   when a human last confirmed it is still current (YYYY-MM-DD)
 *
 * The dataset registry (`src/data/dataFreshness.ts`) carries the same
 * three fields per dataset. Site-wide "as of" banners read from there;
 * this helper provides the platform-wide rollup.
 */
export interface FreshnessTriple {
  sourceYear: string;
  lastPulled: string;
  lastVerified: string;
}

/**
 * Most recent platform-wide verification pass.
 * Update when running a full provenance audit across all datasets.
 */
export const PLATFORM_FRESHNESS: FreshnessTriple = {
  sourceYear: "Mixed (see /methodology for per-dataset vintage)",
  lastPulled: "2026-03-01",
  lastVerified: "2026-03-15",
};

/** Counts of fresh / aging / stale datasets, computed from the registry. */
export function getFreshnessSummary() {
  const total = DATA_FRESHNESS_SOURCES.length;
  const fresh = DATA_FRESHNESS_SOURCES.filter(
    (s) => s.freshnessStatus === "fresh",
  ).length;
  const aging = DATA_FRESHNESS_SOURCES.filter(
    (s) => s.freshnessStatus === "aging",
  ).length;
  const stale = DATA_FRESHNESS_SOURCES.filter(
    (s) => s.freshnessStatus === "stale",
  ).length;
  return { total, fresh, aging, stale };
}
