import { describe, it, expect } from "vitest";
import {
  getReliability,
  isRenderable,
  RELIABILITY_FLAG_THRESHOLD,
  RELIABILITY_SUPPRESS_THRESHOLD,
} from "@/lib/reliability";

describe("getReliability", () => {
  describe("boundary at the flag threshold (0.30)", () => {
    it("is reliable exactly at ratio 0.30 (inclusive lower tier)", () => {
      const result = getReliability(100, 30);
      expect(result.ratio).toBeCloseTo(0.3);
      expect(result.status).toBe("reliable");
    });

    it("is flagged just above 0.30", () => {
      const result = getReliability(100, 30.01);
      expect(result.status).toBe("flagged");
    });

    it("is reliable just below 0.30", () => {
      const result = getReliability(100, 29.99);
      expect(result.status).toBe("reliable");
    });
  });

  describe("boundary at the suppress threshold (0.50)", () => {
    it("is flagged exactly at ratio 0.50 (inclusive lower tier)", () => {
      const result = getReliability(100, 50);
      expect(result.ratio).toBeCloseTo(0.5);
      expect(result.status).toBe("flagged");
    });

    it("is suppressed just above 0.50", () => {
      const result = getReliability(100, 50.01);
      expect(result.status).toBe("suppressed");
    });

    it("is flagged just below 0.50", () => {
      const result = getReliability(100, 49.99);
      expect(result.status).toBe("flagged");
    });
  });

  describe("zero estimate with nonzero MOE", () => {
    it("suppresses when estimate is 0 and MOE is positive", () => {
      const result = getReliability(0, 12);
      expect(result.status).toBe("suppressed");
      expect(result.ratio).toBeNull();
    });

    it("is reliable when estimate and MOE are both 0", () => {
      const result = getReliability(0, 0);
      expect(result.status).toBe("reliable");
      expect(result.ratio).toBe(0);
    });
  });

  describe("missing MOE", () => {
    it("is unavailable when MOE is null, never reliable", () => {
      const result = getReliability(100, null);
      expect(result.status).toBe("unavailable");
      expect(result.ratio).toBeNull();
    });

    it("is unavailable when MOE is null even for a zero estimate", () => {
      const result = getReliability(0, null);
      expect(result.status).toBe("unavailable");
    });

    it("is unavailable when estimate is null regardless of MOE", () => {
      const result = getReliability(null, 5);
      expect(result.status).toBe("unavailable");
      expect(result.ratio).toBeNull();
    });

    it("is unavailable when both are null", () => {
      const result = getReliability(null, null);
      expect(result.status).toBe("unavailable");
    });
  });

  describe("ratio sign", () => {
    it("uses the absolute value of the ratio for a negative estimate", () => {
      // Some derived deltas can be negative; reliability math should not
      // flip sign-dependent on which side of zero the estimate falls.
      const result = getReliability(-100, 40);
      expect(result.ratio).toBeCloseTo(0.4);
      expect(result.status).toBe("flagged");
    });
  });

  describe("exported thresholds", () => {
    it("flag threshold is 0.30 and suppress threshold is 0.50", () => {
      expect(RELIABILITY_FLAG_THRESHOLD).toBe(0.3);
      expect(RELIABILITY_SUPPRESS_THRESHOLD).toBe(0.5);
    });
  });
});

describe("isRenderable", () => {
  it("is true for reliable, flagged, and unavailable", () => {
    expect(isRenderable({ status: "reliable", ratio: 0.1 })).toBe(true);
    expect(isRenderable({ status: "flagged", ratio: 0.35 })).toBe(true);
    expect(isRenderable({ status: "unavailable", ratio: null })).toBe(true);
  });

  it("is false only for suppressed", () => {
    expect(isRenderable({ status: "suppressed", ratio: 0.6 })).toBe(false);
  });
});
