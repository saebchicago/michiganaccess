import { describe, it, expect } from "vitest";
import {
  isProvenanceLabel,
  resolveCompositeLabel,
} from "../resolveCompositeLabel";

describe("resolveCompositeLabel", () => {
  describe("weakest-link rule", () => {
    it("returns VERIFIED when all inputs are VERIFIED", () => {
      expect(resolveCompositeLabel(["VERIFIED"])).toBe("VERIFIED");
      expect(resolveCompositeLabel(["VERIFIED", "VERIFIED"])).toBe("VERIFIED");
    });

    it("downgrades to MODELED when any input is MODELED", () => {
      expect(resolveCompositeLabel(["VERIFIED", "MODELED"])).toBe("MODELED");
      expect(resolveCompositeLabel(["MODELED", "VERIFIED"])).toBe("MODELED");
      expect(resolveCompositeLabel(["MODELED", "MODELED"])).toBe("MODELED");
    });

    it("downgrades to PROJECTED when any input is PROJECTED", () => {
      expect(resolveCompositeLabel(["VERIFIED", "PROJECTED"])).toBe(
        "PROJECTED",
      );
      expect(resolveCompositeLabel(["MODELED", "PROJECTED"])).toBe("PROJECTED");
      expect(resolveCompositeLabel(["VERIFIED", "MODELED", "PROJECTED"])).toBe(
        "PROJECTED",
      );
    });

    it("order of inputs does not affect the result", () => {
      const a = resolveCompositeLabel(["PROJECTED", "VERIFIED", "MODELED"]);
      const b = resolveCompositeLabel(["VERIFIED", "MODELED", "PROJECTED"]);
      const c = resolveCompositeLabel(["MODELED", "PROJECTED", "VERIFIED"]);
      expect(a).toBe("PROJECTED");
      expect(b).toBe("PROJECTED");
      expect(c).toBe("PROJECTED");
    });
  });

  describe("fitted / aggregated escalation", () => {
    it("upgrades VERIFIED to MODELED when isFitted is true", () => {
      expect(resolveCompositeLabel(["VERIFIED"], { isFitted: true })).toBe(
        "MODELED",
      );
      expect(
        resolveCompositeLabel(["VERIFIED", "VERIFIED"], { isFitted: true }),
      ).toBe("MODELED");
    });

    it("upgrades VERIFIED to MODELED when isAggregated is true", () => {
      expect(resolveCompositeLabel(["VERIFIED"], { isAggregated: true })).toBe(
        "MODELED",
      );
    });

    it("does not further weaken MODELED or PROJECTED", () => {
      expect(resolveCompositeLabel(["MODELED"], { isFitted: true })).toBe(
        "MODELED",
      );
      expect(resolveCompositeLabel(["PROJECTED"], { isAggregated: true })).toBe(
        "PROJECTED",
      );
      expect(
        resolveCompositeLabel(["VERIFIED", "PROJECTED"], { isFitted: true }),
      ).toBe("PROJECTED");
    });
  });

  describe("input validation", () => {
    it("throws on empty input", () => {
      expect(() => resolveCompositeLabel([])).toThrow(/at least one label/i);
    });
  });

  describe("isProvenanceLabel", () => {
    it("returns true for the three known labels", () => {
      expect(isProvenanceLabel("VERIFIED")).toBe(true);
      expect(isProvenanceLabel("MODELED")).toBe(true);
      expect(isProvenanceLabel("PROJECTED")).toBe(true);
    });

    it("returns false for anything else", () => {
      expect(isProvenanceLabel("verified")).toBe(false);
      expect(isProvenanceLabel("PENDING")).toBe(false);
      expect(isProvenanceLabel("")).toBe(false);
      expect(isProvenanceLabel(null)).toBe(false);
      expect(isProvenanceLabel(undefined)).toBe(false);
      expect(isProvenanceLabel(42)).toBe(false);
    });
  });
});
