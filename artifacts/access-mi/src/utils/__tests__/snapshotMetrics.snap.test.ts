/**
 * USDA SNAP Retailer Locator county snapshot tile + source-count bump tests.
 *
 * Covers:
 *  - dataset coverage: all 83 counties present, every county that has a
 *    profile also has a SNAP row
 *  - rate computation: deterministic (count, PEP V2024 population)
 *  - no suppression: every county renders a numeric rate; zero-retailer
 *    counties (if any) render 0 rather than blanking
 *  - row conservation: sum of per-county retailer counts equals the
 *    Michigan currently-authorized total recorded at generation time
 *  - source-count bump: SOURCES_TOTAL = 43, federal = 25, USDA SNAP entry
 *    present in the Federal Agencies category
 */
import { describe, it, expect } from "vitest";
import {
  COUNTY_SNAP_RETAILERS,
  SNAP_SOURCE,
  SNAP_VINTAGE,
} from "@/data/county-snap-retailers";
import { COUNTY_PROFILES } from "@/data/michigan-county-profiles";
import { buildCountySnapshotMetrics } from "@/utils/snapshotMetrics";
import {
  SOURCES_BY_CATEGORY,
  SOURCES_REGISTRY,
  SOURCES_TOTAL,
  SOURCES_BREAKDOWN,
} from "@/data/sourcesRegistry";

describe("SNAP retailer county dataset", () => {
  it("covers every county that has a profile (and only those)", () => {
    const snapKeys = new Set(Object.keys(COUNTY_SNAP_RETAILERS));
    const profileKeys = new Set(Object.keys(COUNTY_PROFILES));
    expect(snapKeys.size).toBe(83);
    expect(profileKeys.size).toBe(83);
    for (const k of profileKeys) {
      expect(snapKeys.has(k)).toBe(true);
    }
  });

  it("declares 2025-12 as the vintage and the canonical source label", () => {
    expect(SNAP_VINTAGE).toBe("2025-12");
    expect(SNAP_SOURCE).toBe("USDA SNAP Retailer Locator");
  });

  it("rate matches (count / pop) * 10,000 for every county", () => {
    for (const [name, row] of Object.entries(COUNTY_SNAP_RETAILERS)) {
      const pop = COUNTY_PROFILES[name]!.population;
      const expected =
        Math.round((row.retailerCount / pop) * 10000 * 100) / 100;
      expect(row.ratePer10k).toBeCloseTo(expected, 2);
    }
  });

  it("never suppresses; every county has a numeric retailerCount and ratePer10k", () => {
    for (const row of Object.values(COUNTY_SNAP_RETAILERS)) {
      expect(Number.isFinite(row.retailerCount)).toBe(true);
      expect(row.retailerCount).toBeGreaterThanOrEqual(0);
      expect(Number.isFinite(row.ratePer10k)).toBe(true);
      expect(row.ratePer10k).toBeGreaterThanOrEqual(0);
    }
  });

  it("conserves rows: sum of per-county counts equals 9,225 (current set as of 2025-12)", () => {
    const total = Object.values(COUNTY_SNAP_RETAILERS).reduce(
      (s, r) => s + r.retailerCount,
      0,
    );
    expect(total).toBe(9225);
  });

  it("normalizes the two-word and dotted county names from the source", () => {
    // These keys come from the source's "ST CLAIR", "ST JOSEPH",
    // "GRAND TRAVERSE", "VAN BUREN", "PRESQUE ISLE" rows. If normalization
    // regresses the FIPS canonical names get blanked rather than matched.
    expect(COUNTY_SNAP_RETAILERS["St. Clair"]).toBeDefined();
    expect(COUNTY_SNAP_RETAILERS["St. Joseph"]).toBeDefined();
    expect(COUNTY_SNAP_RETAILERS["Grand Traverse"]).toBeDefined();
    expect(COUNTY_SNAP_RETAILERS["Van Buren"]).toBeDefined();
    expect(COUNTY_SNAP_RETAILERS["Presque Isle"]).toBeDefined();
  });
});

describe("buildCountySnapshotMetrics: snap-retailers tile", () => {
  it("renders the rate, unit, source, and vintage for Wayne", () => {
    const metrics = buildCountySnapshotMetrics("Wayne");
    const tile = metrics.find((m) => m.id === "snap-retailers");
    expect(tile).toBeDefined();
    expect(tile!.label).toBe("SNAP Retailers (per 10k)");
    expect(tile!.unit).toBe("per 10k residents");
    expect(tile!.source).toBe("USDA SNAP Retailer Locator");
    expect(tile!.vintage).toMatch(/^2025-12 \(current authorizations\)$/);
    expect(tile!.geoResolution).toBe("county");
    // Value is a numeric-looking string with 2 decimal places
    expect(typeof tile!.value).toBe("string");
    expect(tile!.value as string).toMatch(/^\d+\.\d{2}$/);
  });

  it("renders a numeric rate for a small / rural county (no suppression)", () => {
    const metrics = buildCountySnapshotMetrics("Keweenaw");
    const tile = metrics.find((m) => m.id === "snap-retailers");
    expect(tile).toBeDefined();
    expect(tile!.unit).toBe("per 10k residents");
    expect(tile!.value as string).toMatch(/^\d+\.\d{2}$/);
    // Keweenaw renders a real rate even with a tiny denominator; the
    // suppression rule applies to rare events (FARS), not to retailer
    // counts.
    expect(tile!.source).toBe("USDA SNAP Retailer Locator");
  });
});

describe("source-count bump: 42 -> 43, federal 24 -> 25", () => {
  it("SOURCES_TOTAL is 43", () => {
    expect(SOURCES_TOTAL).toBe(43);
    expect(SOURCES_REGISTRY.length).toBe(43);
  });

  it("federal=25, state=9, nonprofit=9", () => {
    expect(SOURCES_BREAKDOWN).toEqual({
      federal: 25,
      state: 9,
      nonprofit: 9,
    });
  });

  it("USDA SNAP Retailer Locator is the new federal entry", () => {
    const snap = SOURCES_BY_CATEGORY["Federal Agencies"].find(
      (s) => s.name === "USDA SNAP Retailer Locator",
    );
    expect(snap).toBeDefined();
    expect(snap!.org).toBe("USDA-FNS");
    expect(snap!.url).toContain("fns.usda.gov/snap/retailer");
  });
});
