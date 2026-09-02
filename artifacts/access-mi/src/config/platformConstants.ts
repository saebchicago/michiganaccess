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
import {
  PUBLISHERS_TOTAL,
  SOURCES_BREAKDOWN,
  SOURCES_TOTAL,
} from "@/data/sourcesRegistry";
import { ATLAS_LAYERS } from "@/config/atlasLayers";

/**
 * Total verified public data FEEDS powering the platform.
 *
 * Derived from `src/data/sourcesRegistry.ts`. The expected canonical
 * value is 50 (29 federal + 9 state + 12 nonprofit). If the registry
 * grows or shrinks, update the EXPECTED_* constants below in the same
 * commit so the build assertion does not fail silently.
 *
 * Rule: one entry per distinct feed/dataset. A publisher shipping
 * several independent datasets contributes one entry each - this is a
 * feed count, NOT an organization count. See EXPECTED_PUBLISHER_COUNT
 * below for the organization number.
 */
const EXPECTED_SOURCE_COUNT = 50;
const EXPECTED_SOURCE_BREAKDOWN = {
  federal: 29,
  state: 9,
  nonprofit: 12,
} as const;

/**
 * Distinct publisher organizations behind those feeds.
 *
 * Lower than EXPECTED_SOURCE_COUNT because CMS, FEMA, EPA, HUD, and
 * EGLE each ship more than one feed. Copy that says "organizations"
 * must render this number.
 */
const EXPECTED_PUBLISHER_COUNT = 42;

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
    `platformConstants: SOURCES_BREAKDOWN drift  -  registry=${JSON.stringify(SOURCES_BREAKDOWN)}, expected=${JSON.stringify(EXPECTED_SOURCE_BREAKDOWN)}.`,
  );
}

if (PUBLISHERS_TOTAL !== EXPECTED_PUBLISHER_COUNT) {
  throw new Error(
    `platformConstants: distinct publisher orgs is ${PUBLISHERS_TOTAL}, expected ${EXPECTED_PUBLISHER_COUNT}. Update EXPECTED_PUBLISHER_COUNT or fix the registry.`,
  );
}

export const DATA_SOURCE_COUNT = SOURCES_TOTAL;
export const DATA_SOURCE_BREAKDOWN = SOURCES_BREAKDOWN;

/**
 * Distinct publisher entities behind the feeds. Render this - never the
 * feed count - whenever visible copy uses the word "organizations".
 */
export const DATA_PUBLISHER_COUNT = PUBLISHERS_TOTAL;

export const DATA_SOURCE_RULE =
  "One entry per distinct public data feed. A publisher that ships several independent datasets (CMS Hospital Compare, Physician Compare, and NPPES, for example) contributes one entry per dataset, because each carries its own URL, cadence, and vintage. This is a count of feeds, not of organizations.";

export const DATA_PUBLISHER_RULE =
  "Distinct publisher entities (federal agency, state agency, or nonprofit/academic publisher) behind those feeds, counted once each regardless of how many datasets they contribute.";

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

// Resource-count constants removed: the platform now displays only the live
// community_resources count (fetched at runtime in the footer via
// useFooterStats). Earlier builds carried a hardcoded "15,000+" aggregate
// that could not be verified against the live table and collided with it in
// the UI. No hardcoded resource/record count is displayed anywhere else.

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
 * Note: this is NOT the same as DATA_SOURCE_COUNT (50 feeds from
 * DATA_PUBLISHER_COUNT publishers). Most registry feeds ship as static
 * data imports, not live API calls; the four here are the ones with
 * always-on uptime checks.
 */
export const MONITORED_API_FEEDS_COUNT = 4;

/**
 * Number of sources tracked with manual freshness snapshots in
 * DataFreshnessDashboard (the DATA_SOURCES array in that component).
 *
 * This is a monitored subset of the full registry. Most registry
 * sources are static imports with no periodic freshness snapshot;
 * these are the ones for which we maintain last-refresh timestamps
 * and derived status. Must equal DATA_FRESHNESS_SOURCES.length.
 *
 * Went 15 -> 17 on 2026-08-16: bls-laus and hrsa-hpsa are ingested into
 * committed generated datasets and render on live pages, but had no
 * freshness entry, so this rollup under-reported actual coverage.
 * 17 -> 18 on 2026-09-02: hud-chas county cost burden ingested.
 */
export const FRESHNESS_TRACKED_COUNT = 18;

/**
 * Number of sources with live endpoint health checks on the /status page.
 *
 * This is a monitored subset of the full registry. Must equal the
 * length of ENDPOINTS in src/lib/health-check.ts.
 */
export const LIVE_MONITORED_COUNT = 4;

// The hardcoded PLATFORM_RELEASES version timeline was removed: it had frozen
// at v1.4 (Mar 2025) while the maintained, append-only changelog on
// ChangelogPage.tsx continued through 2026. The Impact dashboard now links to
// that changelog as the single source of release history rather than
// duplicating a stale, version-numbered list here.

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
  lastPulled: "2026-07-12",
  lastVerified: "2026-07-14",
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
