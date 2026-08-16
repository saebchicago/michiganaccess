import { describe, expect, it } from "vitest";

import {
  DATA_FRESHNESS_SOURCES,
  DATA_FRESHNESS_SUMMARY,
  deriveFreshnessStatus,
  deriveIngestStatus,
} from "@/data/dataFreshness";
import { FRESHNESS_TRACKED_COUNT } from "@/config/platformConstants";

const NOW = new Date("2026-08-16T00:00:00Z");

describe("deriveIngestStatus", () => {
  it("is current when pulled recently and no deadline has passed", () => {
    expect(deriveIngestStatus("2026-07-02", "Annual", "2026-12-01", NOW)).toBe(
      "current",
    );
  });

  it("is overdue once the publisher's expected-update date has passed", () => {
    expect(deriveIngestStatus("2026-08-15", "Annual", "2025-10-01", NOW)).toBe(
      "overdue",
    );
  });

  it("treats a year range as a deadline at the end of its last year", () => {
    // "2024-2025" -> deadline 2026-01-01, already past on 2026-08-16.
    expect(
      deriveIngestStatus("2022-01-01", "Every 4-5 years", "2024-2025", NOW),
    ).toBe("overdue");
    // "2026-2027" -> deadline 2028-01-01, still ahead.
    expect(
      deriveIngestStatus("2026-08-01", "Every 2-3 years", "2026-2027", NOW),
    ).toBe("current");
  });

  it("falls back to the cadence budget when the deadline is non-committal", () => {
    // A real-time feed unpulled for months is overdue even though
    // "Ongoing" names no date. This is the case that used to read "aging".
    expect(deriveIngestStatus("2026-03-01", "Real-time", "Ongoing", NOW)).toBe(
      "overdue",
    );
    expect(deriveIngestStatus("2026-08-14", "Real-time", "Ongoing", NOW)).toBe(
      "current",
    );
  });

  it("does not let 'annual' swallow longer cadence phrases", () => {
    // ~472 days is past the annual budget but well inside "every 2 years".
    expect(
      deriveIngestStatus("2025-05-01", "Every 2 years", "2027", NOW),
    ).toBe("current");
    expect(deriveIngestStatus("2025-05-01", "Annual", "2027", NOW)).toBe(
      "overdue",
    );
  });

  it("treats an unparseable pull date as overdue rather than current", () => {
    expect(deriveIngestStatus("not-a-date", "Annual", "Ongoing", NOW)).toBe(
      "overdue",
    );
  });
});

describe("deriveFreshnessStatus", () => {
  it("rolls up to the worse of the two dimensions", () => {
    expect(deriveFreshnessStatus("current", "current")).toBe("fresh");
    expect(deriveFreshnessStatus("current", "behind")).toBe("aging");
    expect(deriveFreshnessStatus("overdue", "current")).toBe("stale");
    expect(deriveFreshnessStatus("overdue", "behind")).toBe("stale");
  });
});

describe("freshness registry", () => {
  it("matches the tracked-count constant", () => {
    expect(DATA_FRESHNESS_SOURCES.length).toBe(FRESHNESS_TRACKED_COUNT);
    expect(DATA_FRESHNESS_SUMMARY.totalSources).toBe(FRESHNESS_TRACKED_COUNT);
  });

  it("has unique ids", () => {
    const ids = DATA_FRESHNESS_SOURCES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("derives every rollup from its own two dimensions", () => {
    for (const s of DATA_FRESHNESS_SOURCES) {
      expect(
        deriveFreshnessStatus(s.ingestStatus, s.vintageStatus),
        `${s.id} rollup`,
      ).toBe(s.freshnessStatus);
    }
  });

  it("explains every dataset it declares behind", () => {
    for (const s of DATA_FRESHNESS_SOURCES) {
      if (s.vintageStatus === "behind") {
        expect(s.vintageNote?.length ?? 0, `${s.id}`).toBeGreaterThanOrEqual(
          30,
        );
      } else {
        expect(s.vintageNote, `${s.id}`).toBeUndefined();
      }
    }
  });

  it("keeps lastPulled and the deprecated lastUpdated in step", () => {
    for (const s of DATA_FRESHNESS_SOURCES) {
      expect(s.lastPulled, s.id).toBe(s.lastUpdated);
      expect(s.lastPulled, s.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("counts the two dimensions separately in the summary", () => {
    expect(DATA_FRESHNESS_SUMMARY.ingestOverdue).toBe(
      DATA_FRESHNESS_SOURCES.filter((s) => s.ingestStatus === "overdue").length,
    );
    expect(DATA_FRESHNESS_SUMMARY.vintageBehind).toBe(
      DATA_FRESHNESS_SOURCES.filter((s) => s.vintageStatus === "behind").length,
    );
    expect(
      DATA_FRESHNESS_SUMMARY.fresh +
        DATA_FRESHNESS_SUMMARY.aging +
        DATA_FRESHNESS_SUMMARY.stale,
    ).toBe(DATA_FRESHNESS_SOURCES.length);
  });
});
