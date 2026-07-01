import { describe, it, expect } from "vitest";
import { MI_ZCTAS, MI_ZCTA_CODES, isMiZcta } from "../mi-zctas";
import { MI_COUNTY_FIPS } from "../census-geographies";

describe("mi-zctas registry", () => {
  it("has a plausible MI ZCTA count (900-1100 band)", () => {
    expect(MI_ZCTAS).toBeDefined();
    expect(MI_ZCTA_CODES.length).toBeGreaterThanOrEqual(900);
    expect(MI_ZCTA_CODES.length).toBeLessThanOrEqual(1100);
  });

  it("keys are 5-digit ZCTA codes; codes list matches record keys", () => {
    for (const code of MI_ZCTA_CODES) {
      expect(code).toMatch(/^\d{5}$/);
      expect(MI_ZCTAS[code]).toBeDefined();
    }
    expect(new Set(MI_ZCTA_CODES).size).toBe(MI_ZCTA_CODES.length);
  });

  it("every entry has a MI county FIPS (starts with 26) and known county name", () => {
    const countyNames = new Set(Object.keys(MI_COUNTY_FIPS));
    for (const [zcta, entry] of Object.entries(MI_ZCTAS)) {
      expect(entry.primaryCountyFips, zcta).toMatch(/^26\d{3}$/);
      expect(
        countyNames.has(entry.primaryCountyName),
        `${zcta} -> ${entry.primaryCountyName}`,
      ).toBe(true);
    }
  });

  it("miAreaFraction is > 0.5 for every entry (registry membership rule)", () => {
    for (const [zcta, entry] of Object.entries(MI_ZCTAS)) {
      expect(entry.miAreaFraction, zcta).toBeGreaterThan(0.5);
      expect(entry.miAreaFraction).toBeLessThanOrEqual(1);
    }
  });

  it("primaryCountyAreaFraction is in (0, 1] and <= miAreaFraction", () => {
    for (const [zcta, entry] of Object.entries(MI_ZCTAS)) {
      expect(entry.primaryCountyAreaFraction, zcta).toBeGreaterThan(0);
      expect(entry.primaryCountyAreaFraction).toBeLessThanOrEqual(1);
      expect(entry.primaryCountyAreaFraction).toBeLessThanOrEqual(
        entry.miAreaFraction + 1e-6,
      );
    }
  });

  it("spansMiCounties matches overlappingMiCountyCount > 1", () => {
    for (const [zcta, entry] of Object.entries(MI_ZCTAS)) {
      expect(entry.spansMiCounties, zcta).toBe(
        entry.overlappingMiCountyCount > 1,
      );
    }
  });

  it("zctaAreaLandM2 is a positive integer", () => {
    for (const [zcta, entry] of Object.entries(MI_ZCTAS)) {
      expect(Number.isInteger(entry.zctaAreaLandM2), zcta).toBe(true);
      expect(entry.zctaAreaLandM2).toBeGreaterThan(0);
    }
  });

  it("isMiZcta returns true for known ZCTAs, false for non-MI", () => {
    expect(isMiZcta(MI_ZCTA_CODES[0])).toBe(true);
    expect(isMiZcta("99999")).toBe(false);
    expect(isMiZcta("10001")).toBe(false); // Manhattan, NYC
  });

  it("known Detroit ZCTA 48201 is present and primary is Wayne", () => {
    expect(MI_ZCTAS["48201"]).toBeDefined();
    expect(MI_ZCTAS["48201"].primaryCountyName).toBe("Wayne");
  });

  it("Traverse City ZCTA 49684 is area-weighted primary Leelanau (rural land >> city)", () => {
    // A demonstration of the area-weighted caveat: 49684 is the Traverse
    // City ZIP but only ~33% of its land area sits in Grand Traverse; the
    // rest reaches into the rural Leelanau peninsula (~61%) and a sliver
    // of Benzie. Population-weighted primary would likely be Grand
    // Traverse. Every consumer that renders primary county must label
    // the weighting basis in provenance.
    expect(MI_ZCTAS["49684"]).toBeDefined();
    expect(MI_ZCTAS["49684"].primaryCountyName).toBe("Leelanau");
    expect(MI_ZCTAS["49684"].spansMiCounties).toBe(true);
    expect(MI_ZCTAS["49684"].overlappingMiCountyCount).toBe(3);
  });
});
