import {
  MONITORED_API_FEEDS_COUNT,
  DATA_SOURCE_COUNT,
  PLATFORM_FRESHNESS,
  getFreshnessSummary,
} from "@/config/platformConstants";

/**
 * Rows for the "Platform Transparency" panel on /about.
 *
 * Every row here must be either a policy commitment (something the project
 * decides and can state) or a figure derived from a guarded constant. Four
 * entries used to be neither:
 *
 *   uptime          "99.8% (30-day)"                 - nothing measures uptime
 *   lastAudit       "March 2026"                     - hand-typed, four months stale
 *   errorsReported  "0 open | 2 resolved this month" - no issue tracker behind it,
 *                                                      and "this month" decays daily
 *   dataFreshness   "Most data updated within 30 days" - an unchecked claim about
 *                                                      the registry
 *
 * They are the same class the compound access index shed in Round 6: a specific
 * number with no instrumentation, sitting on the very page that argues the
 * platform is trustworthy. Replaced with the real signals - the freshness
 * registry, the live-monitored feed count that /status actually pings via
 * runHealthChecks() in src/lib/health-check.ts, and the maintained
 * platform-wide verification date.
 */
const freshness = getFreshnessSummary();

export const PLATFORM_HEALTH = {
  dataFreshness: {
    status: freshness.stale > 0 ? "amber" : "green",
    label: `${freshness.fresh} of ${freshness.total} tracked datasets fresh`,
  },
  monitoredFeeds: {
    status: "green",
    label: `${MONITORED_API_FEEDS_COUNT} of ${DATA_SOURCE_COUNT} sources health-checked live`,
  },
  openSource: { status: "green", label: "GitHub repository" },
  funding: { status: "amber", label: "Self-funded portfolio project" },
  conflicts: { status: "green", label: "Zero advertiser relationships" },
  dataSold: { status: "green", label: "Never sold or shared" },
  errorsReported: {
    status: "green",
    label: "Corrections published in the changelog",
  },
  lastAudit: PLATFORM_FRESHNESS.lastVerified,
};
