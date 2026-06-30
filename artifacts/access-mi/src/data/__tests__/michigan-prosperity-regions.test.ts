import { describe, it, expect } from "vitest";
import { MI_COUNTY_FIPS } from "../census-geographies";
import {
  MICHIGAN_PROSPERITY_REGIONS,
  PROSPERITY_REGIONS_SOURCE,
  assertRegionsCoverAllCounties,
  getProsperityRegionById,
  getProsperityRegionByNumber,
  getProsperityRegionForCounty,
} from "../michigan-prosperity-regions";

describe("michigan-prosperity-regions", () => {
  it("declares exactly 10 regions, numbered 1 through 10", () => {
    expect(MICHIGAN_PROSPERITY_REGIONS).toHaveLength(10);
    const numbers = MICHIGAN_PROSPERITY_REGIONS.map((r) => r.number).sort(
      (a, b) => a - b,
    );
    expect(numbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it("partitions all 83 Michigan counties exactly once (disjoint + complete)", () => {
    const allAssignments = MICHIGAN_PROSPERITY_REGIONS.flatMap(
      (r) => r.counties,
    );
    // Disjoint: no county appears in more than one region.
    const seen = new Map<string, number>();
    for (const c of allAssignments) {
      seen.set(c, (seen.get(c) ?? 0) + 1);
    }
    const duplicates = Array.from(seen.entries())
      .filter(([, count]) => count > 1)
      .map(([county, count]) => `${county} (x${count})`);
    expect(duplicates).toEqual([]);

    // Complete: every county listed in census-geographies appears.
    const censusCounties = new Set(Object.keys(MI_COUNTY_FIPS));
    const assigned = new Set(allAssignments);
    expect(assigned.size).toBe(83);
    expect(censusCounties.size).toBe(83);

    const missing = Array.from(censusCounties).filter((c) => !assigned.has(c));
    const extra = Array.from(assigned).filter((c) => !censusCounties.has(c));
    expect(missing).toEqual([]);
    expect(extra).toEqual([]);
  });

  it("module-load invariant assertion does not throw", () => {
    expect(() => assertRegionsCoverAllCounties()).not.toThrow();
  });

  it("documents the source of record", () => {
    expect(PROSPERITY_REGIONS_SOURCE.url).toMatch(
      /^https:\/\/www\.michigan\.gov/,
    );
    expect(PROSPERITY_REGIONS_SOURCE.authority).toContain("Michigan");
    expect(PROSPERITY_REGIONS_SOURCE.capturedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("resolves the EMCOG-confirmed Region 5 to East Central with 8 counties", () => {
    const r5 = getProsperityRegionByNumber(5);
    expect(r5).not.toBeNull();
    expect(r5?.name).toBe("East Central Michigan Prosperity Region");
    expect(r5?.shortName).toBe("East Central");
    expect(r5?.counties.sort()).toEqual(
      [
        "Arenac",
        "Bay",
        "Clare",
        "Gladwin",
        "Gratiot",
        "Isabella",
        "Midland",
        "Saginaw",
      ].sort(),
    );
  });

  it("distinguishes Region 6 (East Michigan) from Region 5 (East Central)", () => {
    const r6 = getProsperityRegionByNumber(6);
    expect(r6).not.toBeNull();
    expect(r6?.name).toBe("East Michigan Prosperity Region");
    expect(r6?.counties.sort()).toEqual(
      [
        "Genesee",
        "Huron",
        "Lapeer",
        "Sanilac",
        "Shiawassee",
        "St. Clair",
        "Tuscola",
      ].sort(),
    );
  });

  it("looks up region by county for a sample of canonical names", () => {
    expect(getProsperityRegionForCounty("Wayne")?.number).toBe(10);
    expect(getProsperityRegionForCounty("Marquette")?.number).toBe(1);
    expect(getProsperityRegionForCounty("Grand Traverse")?.number).toBe(2);
    expect(getProsperityRegionForCounty("Genesee")?.number).toBe(6);
    expect(getProsperityRegionForCounty("Ingham")?.number).toBe(7);
    expect(getProsperityRegionForCounty("Not A County")).toBeNull();
  });

  it("looks up region by slug", () => {
    expect(getProsperityRegionById("upper-peninsula")?.number).toBe(1);
    expect(getProsperityRegionById("detroit-metro")?.number).toBe(10);
    expect(getProsperityRegionById("unknown")).toBeNull();
  });
});
