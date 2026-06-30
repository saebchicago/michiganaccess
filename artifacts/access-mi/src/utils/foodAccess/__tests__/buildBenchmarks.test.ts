import { describe, it, expect } from "vitest";
import { buildBenchmarks } from "../buildBenchmarks";

describe("buildBenchmarks", () => {
  it("returns null for an unknown metric", () => {
    expect(buildBenchmarks("not-a-metric")).toBeNull();
  });

  it("returns a bundle with state, 10 regional, and 1 national for retailerCount", () => {
    const b = buildBenchmarks("retailerCount");
    expect(b).not.toBeNull();
    expect(b?.state.tier).toBe("state");
    expect(b?.regional).toHaveLength(10);
    expect(b?.national.tier).toBe("national");
  });

  it("regional benchmarks always carry MODELED, even on VERIFIED county inputs", () => {
    const b = buildBenchmarks("retailerCount");
    for (const r of b?.regional ?? []) {
      if (r.state === "present") {
        expect(r.label).toBe("MODELED");
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
      someRegion!.denominator! > 0
        ? (someRegion!.numerator! / someRegion!.denominator!) * 10000
        : 0;
    expect(someRegion?.value).toBeCloseTo(expected, 4);
  });

  it("state benchmark is MODELED (sourced inputs, computed rate)", () => {
    const b = buildBenchmarks("retailerCount");
    expect(b?.state.state).toBe("present");
    expect(b?.state.label).toBe("MODELED");
    expect(b?.state.value).toBeGreaterThan(9000);
  });

  it("national benchmark is not-ingested with a sourced pointer", () => {
    const b = buildBenchmarks("retailerCount");
    expect(b?.national.state).toBe("not-ingested");
    expect(b?.national.value).toBeNull();
    expect(b?.national.label).toBeNull();
    expect(b?.national.sources.length).toBeGreaterThan(0);
    expect(b?.national.sources[0].url).toMatch(/^https:\/\//);
    expect(b?.national.reason).toBeTruthy();
  });

  it("enrollmentHouseholds state benchmark is honestly not-ingested", () => {
    const b = buildBenchmarks("enrollmentHouseholds");
    expect(b?.state.state).toBe("not-ingested");
    expect(b?.state.value).toBeNull();
    expect(b?.state.reason).toBeTruthy();
  });
});
