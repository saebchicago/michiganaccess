import { describe, it, expect } from "vitest";
import {
  ZCTA_COUNTY_CROSSWALK,
  getPrimaryCountyForZcta,
} from "../zcta-county-crosswalk";
import { MI_ZCTAS, MI_ZCTA_CODES } from "../mi-zctas";

describe("zcta-county-crosswalk", () => {
  it("covers every MI ZCTA in the registry, no extras", () => {
    const crosswalkKeys = new Set(Object.keys(ZCTA_COUNTY_CROSSWALK));
    const registryKeys = new Set(MI_ZCTA_CODES);
    expect(crosswalkKeys.size).toBe(registryKeys.size);
    for (const zcta of registryKeys) {
      expect(crosswalkKeys.has(zcta), `crosswalk missing ${zcta}`).toBe(true);
    }
  });

  it("every ZCTA has at least one MI overlap; parts are sorted desc", () => {
    for (const [zcta, parts] of Object.entries(ZCTA_COUNTY_CROSSWALK)) {
      expect(parts.length, zcta).toBeGreaterThan(0);
      for (let i = 1; i < parts.length; i++) {
        expect(
          parts[i - 1].areaFraction,
          `${zcta} parts not sorted desc at index ${i}`,
        ).toBeGreaterThanOrEqual(parts[i].areaFraction);
      }
    }
  });

  it("crosswalk primary matches registry primary for every ZCTA", () => {
    for (const [zcta, parts] of Object.entries(ZCTA_COUNTY_CROSSWALK)) {
      const primary = parts[0];
      const entry = MI_ZCTAS[zcta];
      expect(primary.countyName, zcta).toBe(entry.primaryCountyName);
      expect(primary.countyFips, zcta).toBe(entry.primaryCountyFips);
      expect(primary.areaFraction, zcta).toBeCloseTo(
        entry.primaryCountyAreaFraction,
        3,
      );
    }
  });

  it("each part's areaFraction is in (0, 1] and countyFips starts with 26", () => {
    for (const [zcta, parts] of Object.entries(ZCTA_COUNTY_CROSSWALK)) {
      for (const p of parts) {
        expect(p.areaFraction, `${zcta} ${p.countyName}`).toBeGreaterThan(0);
        expect(p.areaFraction).toBeLessThanOrEqual(1);
        expect(p.countyFips).toMatch(/^26\d{3}$/);
      }
    }
  });

  it("sum of parts equals the ZCTA's miAreaFraction from registry", () => {
    for (const [zcta, parts] of Object.entries(ZCTA_COUNTY_CROSSWALK)) {
      const sum = parts.reduce((s, p) => s + p.areaFraction, 0);
      expect(sum, zcta).toBeCloseTo(MI_ZCTAS[zcta].miAreaFraction, 3);
    }
  });

  it("getPrimaryCountyForZcta returns primary for known ZCTA, null for unknown", () => {
    const primary = getPrimaryCountyForZcta("48201");
    expect(primary).not.toBeNull();
    expect(primary?.countyName).toBe("Wayne");
    expect(getPrimaryCountyForZcta("99999")).toBeNull();
  });

  it("known 3-way split ZCTA 48178 spans Livingston, Oakland, Washtenaw", () => {
    const parts = ZCTA_COUNTY_CROSSWALK["48178"];
    expect(parts).toBeDefined();
    expect(parts.length).toBe(3);
    const counties = parts.map((p) => p.countyName).sort();
    expect(counties).toEqual(["Livingston", "Oakland", "Washtenaw"]);
  });
});
