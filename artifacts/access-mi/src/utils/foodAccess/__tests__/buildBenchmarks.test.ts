import { describe, it, expect } from "vitest";
import { buildBenchmarks } from "../buildBenchmarks";
import { MICHIGAN_PROSPERITY_REGIONS } from "@/data/michigan-prosperity-regions";
import { COUNTY_SNAP_RETAILERS } from "@/data/county-snap-retailers";

const REGIONAL_ENROLLMENT_REASON =
  "county SNAP enrollment published only at FY2022; cannot aggregate to region at the state/national benchmark month without blending vintages.";

describe("buildBenchmarks", () => {
  it("returns null for an unknown metric", () => {
    expect(buildBenchmarks("not-a-metric")).toBeNull();
  });

  it("returns a bundle with state, 10 regional, and 1 national for every core metric", () => {
    for (const id of [
      "enrollmentTotal",
      "enrollmentHouseholds",
      "retailerCount",
      "retailersPer10k",
    ]) {
      const b = buildBenchmarks(id);
      expect(b, id).not.toBeNull();
      expect(b?.state.tier).toBe("state");
      expect(b?.regional).toHaveLength(10);
      expect(b?.national.tier).toBe("national");
    }
  });

  it("state benchmarks are all MODELED and present for the four core metrics", () => {
    for (const id of [
      "enrollmentTotal",
      "enrollmentHouseholds",
      "retailerCount",
      "retailersPer10k",
    ]) {
      const b = buildBenchmarks(id);
      expect(b?.state.state, `${id} state coverage`).toBe("present");
      expect(b?.state.label, `${id} state label`).toBe("MODELED");
    }
  });

  it("national benchmarks are all MODELED and present for the four core metrics", () => {
    for (const id of [
      "enrollmentTotal",
      "enrollmentHouseholds",
      "retailerCount",
      "retailersPer10k",
    ]) {
      const b = buildBenchmarks(id);
      expect(b?.national.state, `${id} national coverage`).toBe("present");
      expect(b?.national.label, `${id} national label`).toBe("MODELED");
      expect(b?.national.value, `${id} national value`).not.toBeNull();
      expect(b?.national.sources.length).toBeGreaterThan(0);
    }
  });

  it("regional retailer benchmarks are present and MODELED for all 10 regions", () => {
    for (const id of ["retailerCount", "retailersPer10k"]) {
      const b = buildBenchmarks(id);
      expect(b?.regional).toHaveLength(10);
      for (const r of b!.regional) {
        expect(r.state, `${id} ${r.scope} coverage`).toBe("present");
        expect(r.label, `${id} ${r.scope} label`).toBe("MODELED");
      }
    }
  });

  it("regional enrollment benchmarks are not-ingested with the specific reason", () => {
    for (const id of ["enrollmentTotal", "enrollmentHouseholds"]) {
      const b = buildBenchmarks(id);
      expect(b?.regional).toHaveLength(10);
      for (const r of b!.regional) {
        expect(r.state, `${id} ${r.scope} coverage`).toBe("not-ingested");
        expect(r.value).toBeNull();
        expect(r.label).toBeNull();
        expect(r.reason).toBe(REGIONAL_ENROLLMENT_REASON);
      }
    }
  });

  it("regional retailer-per-10k benchmark is population-weighted (sum / sum)", () => {
    const b = buildBenchmarks("retailersPer10k");
    const someRegion = b?.regional.find((r) => r.state === "present");
    expect(someRegion).toBeDefined();
    expect(someRegion?.numerator).toBeGreaterThan(0);
    expect(someRegion?.denominator).toBeGreaterThan(0);
    const expected =
      (someRegion!.numerator! / someRegion!.denominator!) * 10000;
    expect(someRegion?.value).toBeCloseTo(expected, 4);
  });

  it("national retailer-per-10k is sum(num)/sum(den), not mean of state rates", () => {
    const b = buildBenchmarks("retailersPer10k");
    const nat = b!.national;
    expect(nat.numerator).toBe(248_715);
    expect(nat.denominator).toBe(340_110_988);
    const expected = (nat.numerator! / nat.denominator!) * 10000;
    expect(nat.value).toBeCloseTo(expected, 6);
    // Guard rail: sanity-check the mean-of-state-rates alternative differs
    // enough to fail the equality above. The distributional mean is not
    // computed here; we assert the numeric result matches the pop-weighted
    // formula only.
    expect(nat.value).toBeGreaterThan(7);
    expect(nat.value).toBeLessThan(8);
  });

  it("national retailer count is the reconciled 51-jurisdiction total (248,715)", () => {
    const b = buildBenchmarks("retailerCount");
    expect(b?.national.value).toBe(248_715);
    expect(b?.national.numerator).toBe(248_715);
    expect(b?.national.denominator).toBe(340_110_988);
    // Reconciliation note is carried verbatim in the formula.
    expect(b?.national.formula).toMatch(/Guam \(260 rows\)/);
    expect(b?.national.formula).toMatch(/USVI \(88 rows\)/);
  });

  it("sum of 10 regional retailer counts equals the MI statewide total", () => {
    const b = buildBenchmarks("retailerCount");
    const sum = b!.regional.reduce((a, r) => a + (r.numerator ?? 0), 0);
    expect(sum).toBe(b?.state.value);
    expect(sum).toBe(9225);
    // And no county is double-counted: sum matches the raw COUNTY_SNAP_RETAILERS
    // sum.
    const rawSum = Object.values(COUNTY_SNAP_RETAILERS).reduce(
      (a, r) => a + r.retailerCount,
      0,
    );
    expect(sum).toBe(rawSum);
    // Every one of the 83 counties is covered exactly once by the 10 regions.
    const covered = new Set<string>();
    for (const region of MICHIGAN_PROSPERITY_REGIONS) {
      for (const county of region.counties) {
        expect(covered.has(county), `duplicate: ${county}`).toBe(false);
        covered.add(county);
      }
    }
    expect(covered.size).toBe(83);
  });

  it("state benchmark for enrollmentTotal uses the newest MI monthly figure", () => {
    const b = buildBenchmarks("enrollmentTotal");
    expect(b?.state.value).toBe(1_400_731);
    expect(b?.state.formula).toMatch(/preliminary/i);
  });

  it("state benchmark for enrollmentHouseholds flips from not-ingested to present", () => {
    const b = buildBenchmarks("enrollmentHouseholds");
    expect(b?.state.state).toBe("present");
    expect(b?.state.value).toBe(743_752);
    expect(b?.state.reason).toBeUndefined();
    expect(b?.state.formula).toMatch(/preliminary/i);
  });

  it("national benchmark for enrollmentTotal uses the newest US monthly figure", () => {
    const b = buildBenchmarks("enrollmentTotal");
    expect(b?.national.value).toBe(37_729_410);
    expect(b?.national.formula).toMatch(/preliminary/i);
  });

  it("national benchmark for enrollmentHouseholds uses the newest US monthly figure", () => {
    const b = buildBenchmarks("enrollmentHouseholds");
    expect(b?.national.value).toBe(20_502_831);
    expect(b?.national.formula).toMatch(/preliminary/i);
  });

  it("all benchmark records carry sources with vintage strings", () => {
    for (const id of [
      "enrollmentTotal",
      "enrollmentHouseholds",
      "retailerCount",
      "retailersPer10k",
    ]) {
      const b = buildBenchmarks(id);
      for (const record of [b!.state, b!.national, ...b!.regional]) {
        if (record.state !== "present") continue;
        expect(
          record.sources.length,
          `${id} ${record.scope} sources`,
        ).toBeGreaterThan(0);
        for (const s of record.sources) {
          expect(
            s.vintage.trim().length,
            `${id} ${record.scope} vintage`,
          ).toBeGreaterThan(0);
          expect(s.url).toMatch(/^https:\/\//);
        }
      }
    }
  });

  it("retailer vintage renders as 'December 31, 2025' wherever the retailer source is cited", () => {
    for (const id of ["retailerCount", "retailersPer10k"]) {
      const b = buildBenchmarks(id);
      for (const r of [b!.state, b!.national, ...b!.regional]) {
        if (r.state !== "present") continue;
        const retailerSrc = r.sources.find((s) =>
          s.name.includes("Retailer Locator"),
        );
        if (retailerSrc) {
          expect(retailerSrc.vintage, `${id} ${r.scope}`).toBe(
            "December 31, 2025",
          );
        }
      }
    }
  });

  it("enrollment vintage strings match February 2026 (Preliminary)", () => {
    for (const id of ["enrollmentTotal", "enrollmentHouseholds"]) {
      const b = buildBenchmarks(id);
      const stateSrc = b!.state.sources.find((s) =>
        s.name.includes("USDA FNA"),
      );
      const nationalSrc = b!.national.sources.find((s) =>
        s.name.includes("USDA FNA"),
      );
      expect(stateSrc?.vintage).toBe("February 2026 (Preliminary)");
      expect(nationalSrc?.vintage).toBe("February 2026 (Preliminary)");
    }
  });
});
