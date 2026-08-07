import { describe, expect, it } from "vitest";
import { detectTopic, queryCivicData } from "@/lib/civicQueryEngine";

/**
 * Regression tests for /ask answer integrity.
 *
 * Each case below was a confirmed defect where the engine returned a
 * confidently-worded answer that did not address the question. The engine is a
 * keyword matcher over county datasets, which is fine - but it must not present
 * an adjacent measure as though it were the one asked for.
 */
describe("civicQueryEngine - topic routing", () => {
  it("routes mental-health questions to mental_health, not health_access", () => {
    // `health_access` is declared first and lists the bare keyword "health", so
    // declaration-order matching sent every mental-health question there and
    // answered with uninsured rate + PCP ratio.
    expect(detectTopic("mental health services in Kent County")).toBe(
      "mental_health",
    );
    expect(detectTopic("depression support in Wayne County")).toBe(
      "mental_health",
    );
  });

  it("prefers the longest matching keyword across topics", () => {
    expect(detectTopic("blood pressure in Wayne County")).toBe(
      "chronic_disease",
    );
    // Generic health wording still reaches health_access.
    expect(detectTopic("health insurance coverage in Wayne County")).toBe(
      "health_access",
    );
  });

  it("routes stroke and arthritis to chronic_disease", () => {
    // Both exist in the CDC PLACES rollup and have resolver branches, but were
    // absent from TOPIC_KEYWORDS, so they fell through to `general` and
    // returned population/poverty/unemployment at high confidence.
    expect(detectTopic("stroke in Wayne County")).toBe("chronic_disease");
    expect(detectTopic("arthritis in Kent County")).toBe("chronic_disease");
  });
});

describe("civicQueryEngine - answers address the question", () => {
  it("answers a stroke question with stroke data", () => {
    const a = queryCivicData("stroke in Wayne County");
    expect(a.dataPoints.length).toBeGreaterThan(0);
    expect(a.dataPoints.some((p) => /stroke/i.test(p.label))).toBe(true);
  });

  it("says cancer is unavailable instead of substituting other conditions", () => {
    const a = queryCivicData("cancer rates in Wayne County");
    expect(a.dataPoints).toHaveLength(1);
    expect(a.dataPoints[0].valueLabel).toBe("PENDING");
    expect(a.dataPoints[0].label).toMatch(/cancer/i);
    // The old behavior silently returned these three instead.
    expect(a.dataPoints.some((p) => /diabetes|obesity/i.test(p.label))).toBe(
      false,
    );
    expect(a.confidence).toBe("none");
  });

  it("answers a broadband question with broadband data, never with vehicle access", () => {
    const a = queryCivicData("broadband access in Alcona County");
    const broadband = a.dataPoints.find((p) => /broadband/i.test(p.label));

    // Assert the invariant, not a snapshot. This previously asserted
    // PENDING outright, which encoded a transient empty-dataset state as an
    // expectation - so it failed the moment the 2026-08-07 refresh populated
    // all 83 counties with real ACS rates. What must hold in either state is
    // that a broadband question yields a broadband-labeled point carrying a
    // valid provenance label.
    expect(broadband).toBeDefined();
    expect(["VERIFIED", "PENDING"]).toContain(broadband?.valueLabel);
    if (broadband?.valueLabel === "VERIFIED") {
      expect(broadband.value).toMatch(/^\d+(\.\d+)?%$/);
      expect(broadband.source).toMatch(/ACS/i);
    }

    // Vehicle access is retained as related context (no data removed) but must
    // be flagged so it cannot read as the broadband answer.
    const vehicle = a.dataPoints.find((p) => /vehicle/i.test(p.label));
    if (vehicle) {
      expect(vehicle.isFallback).toBe(true);
      expect(vehicle.note).toMatch(/not a broadband figure/i);
    }
  });
});

describe("civicQueryEngine - confidence reflects match quality", () => {
  it("never reports high confidence when the answer is a fallback", () => {
    // Unspecific chronic-disease question returns the generic top three, which
    // are flagged isFallback. Previously this read "medium"/"high" purely
    // because three or more rows came back.
    const a = queryCivicData("chronic disease in Wayne County");
    expect(a.dataPoints.length).toBeGreaterThan(0);
    expect(a.dataPoints.every((p) => p.isFallback)).toBe(true);
    expect(a.confidence).toBe("thin");
  });

  it("reports none when every point is PENDING", () => {
    expect(queryCivicData("cancer rates in Wayne County").confidence).toBe(
      "none",
    );
  });

  it("still answers a directly-supported question without downgrading it", () => {
    const a = queryCivicData("diabetes in Wayne County");
    expect(a.dataPoints.some((p) => /diabetes/i.test(p.label))).toBe(true);
    expect(a.dataPoints.every((p) => !p.isFallback)).toBe(true);
    expect(a.confidence).not.toBe("none");
  });
});
