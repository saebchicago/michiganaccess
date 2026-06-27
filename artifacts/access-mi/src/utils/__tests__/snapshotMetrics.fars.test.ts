/**
 * FARS county snapshot tile + source-count bump tests.
 *
 * Covers:
 *  - rate computation: deterministic (5-yr count, PEP V2024 population)
 *  - low-count suppression: under FARS_SUPPRESSION_THRESHOLD shows raw
 *    count and labels the rate as suppressed
 *  - source-count bump: SOURCES_REGISTRY now includes "NHTSA FARS" and
 *    SOURCES_TOTAL is 42 (24 federal, 9 state, 9 nonprofit)
 *  - registry: NHTSA FARS entry is in the Federal Agencies category
 */
import { describe, it, expect } from "vitest";
import {
  COUNTY_TRAFFIC_FATALITIES,
  FARS_SOURCE,
  FARS_VINTAGE,
  FARS_SUPPRESSION_THRESHOLD,
} from "@/data/county-traffic-fatalities";
import { COUNTY_PROFILES } from "@/data/michigan-county-profiles";
import { buildCountySnapshotMetrics } from "@/utils/snapshotMetrics";
import {
  SOURCES_BY_CATEGORY,
  SOURCES_REGISTRY,
  SOURCES_TOTAL,
  SOURCES_BREAKDOWN,
} from "@/data/sourcesRegistry";

describe("FARS county dataset", () => {
  it("covers every county that has a profile (and only those)", () => {
    const farsKeys = new Set(Object.keys(COUNTY_TRAFFIC_FATALITIES));
    const profileKeys = new Set(Object.keys(COUNTY_PROFILES));
    expect(farsKeys.size).toBe(83);
    expect(profileKeys.size).toBe(83);
    for (const k of profileKeys) {
      expect(farsKeys.has(k)).toBe(true);
    }
  });

  it("rate matches (count / (5 * pop)) * 100,000 for every non-suppressed county", () => {
    for (const [name, row] of Object.entries(COUNTY_TRAFFIC_FATALITIES)) {
      if (row.suppressed) continue;
      expect(row.ratePer100k).not.toBeNull();
      const pop = COUNTY_PROFILES[name]!.population;
      const expected =
        Math.round((row.fiveYearCount / (5 * pop)) * 100000 * 10) / 10;
      expect(row.ratePer100k).toBeCloseTo(expected, 1);
    }
  });

  it("applies the low-count suppression rule (<6 events => ratePer100k null, suppressed true)", () => {
    for (const row of Object.values(COUNTY_TRAFFIC_FATALITIES)) {
      if (row.fiveYearCount < FARS_SUPPRESSION_THRESHOLD) {
        expect(row.suppressed).toBe(true);
        expect(row.ratePer100k).toBeNull();
      } else {
        expect(row.suppressed).toBe(false);
        expect(row.ratePer100k).not.toBeNull();
      }
    }
  });

  it("declares 2020-2024 as the 5-year window", () => {
    expect(FARS_VINTAGE).toBe("2020-2024");
    expect(FARS_SOURCE).toBe("NHTSA FARS");
    expect(FARS_SUPPRESSION_THRESHOLD).toBe(6);
  });
});

describe("buildCountySnapshotMetrics: traffic-fatalities tile", () => {
  it("renders the rate, unit, source, and vintage for Wayne (high-count county)", () => {
    const metrics = buildCountySnapshotMetrics("Wayne");
    const tile = metrics.find((m) => m.id === "traffic-fatalities");
    expect(tile).toBeDefined();
    expect(tile!.label).toMatch(/Traffic Fatalities/);
    expect(tile!.unit).toBe("per 100k/yr");
    expect(tile!.source).toBe("NHTSA FARS");
    expect(tile!.vintage).toMatch(/2020-2024/);
    expect(tile!.geoResolution).toBe("county");
    // Value is a numeric-looking string with 1 decimal place
    expect(typeof tile!.value).toBe("string");
    expect(tile!.value as string).toMatch(/^\d+\.\d$/);
  });

  it("renders the raw count and a suppression label for a low-count county", () => {
    // Keweenaw has the smallest population in MI and consistently shows
    // <6 fatal events across the 5-year window in current FARS.
    const metrics = buildCountySnapshotMetrics("Keweenaw");
    const tile = metrics.find((m) => m.id === "traffic-fatalities");
    expect(tile).toBeDefined();
    expect(tile!.unit).toBe("in 5 yrs (rate suppressed)");
    expect(tile!.vintage).toMatch(/too few events for a stable rate/);
    expect(tile!.source).toBe("NHTSA FARS");
  });
});

describe("NHTSA FARS registry entry", () => {
  // The absolute SOURCES_TOTAL number is guarded by the claims-anchor
  // V-1 test against platformConstants. This file's contract is narrower:
  // NHTSA FARS must remain a federal entry, and the count must stay
  // consistent across REGISTRY length, SOURCES_TOTAL, and the breakdown
  // sum. Future source additions update V-1, not this file.
  it("SOURCES_TOTAL matches the flat registry length and the category sum", () => {
    expect(SOURCES_REGISTRY.length).toBe(SOURCES_TOTAL);
    expect(
      SOURCES_BREAKDOWN.federal +
        SOURCES_BREAKDOWN.state +
        SOURCES_BREAKDOWN.nonprofit,
    ).toBe(SOURCES_TOTAL);
  });

  it("NHTSA FARS is in the Federal Agencies category", () => {
    const fars = SOURCES_BY_CATEGORY["Federal Agencies"].find(
      (s) => s.name === "NHTSA FARS",
    );
    expect(fars).toBeDefined();
    expect(fars!.org).toBe("NHTSA");
    expect(fars!.url).toContain("fatality-analysis-reporting-system-fars");
  });
});
