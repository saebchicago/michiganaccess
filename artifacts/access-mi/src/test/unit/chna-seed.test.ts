import { describe, it, expect } from "vitest";
import {
  CHNA_METRICS,
  CHNA_PRIORITIES,
  CHNA_DRIVERS,
  PRIORITY_DRIVER_MAP,
} from "@/data/chnaSeed";

const VALID_INTEGRITY_LABELS = [
  "VERIFIED",
  "MODELED",
  "PROJECTED",
  "PENDING",
] as const;

/**
 * Source strings that indicate a figure was transcribed from someone else's
 * report rather than confirmed against a primary federal or state release.
 * Mirrors the build guard in scripts/check-integrity-labels.mjs.
 */
const SECONDARY_SOURCE_PATTERNS = [/CHNA/i, /Planet Detroit/i, /\bvia\b/i];

describe("CHNA seed data", () => {
  it("never labels a secondary-sourced metric VERIFIED", () => {
    for (const m of CHNA_METRICS) {
      const isSecondary = SECONDARY_SOURCE_PATTERNS.some((p) =>
        p.test(m.source),
      );
      if (isSecondary) {
        expect(
          m.integrityLabel,
          `Metric ${m.id} cites the secondary source "${m.source}" but claims ${m.integrityLabel}. VERIFIED is reserved for figures confirmed against a primary federal or state release.`,
        ).not.toBe("VERIFIED");
      }
    }
  });

  it("every metric has a non-empty integrityLabel", () => {
    for (const m of CHNA_METRICS) {
      expect(
        VALID_INTEGRITY_LABELS.includes(m.integrityLabel),
        `Metric ${m.id} has invalid integrityLabel: "${m.integrityLabel}"`,
      ).toBe(true);
    }
  });

  it("every metric has a non-empty source", () => {
    for (const m of CHNA_METRICS) {
      expect(
        m.source.trim().length,
        `Metric ${m.id} missing source`,
      ).toBeGreaterThan(0);
    }
  });

  it("every metric has a non-empty vintage", () => {
    for (const m of CHNA_METRICS) {
      expect(
        m.vintage.trim().length,
        `Metric ${m.id} missing vintage`,
      ).toBeGreaterThan(0);
    }
  });

  it("every metric references a valid priorityId", () => {
    const priorityIds = new Set(CHNA_PRIORITIES.map((p) => p.id));
    for (const m of CHNA_METRICS) {
      expect(
        priorityIds.has(m.priorityId),
        `Metric ${m.id} has unknown priorityId "${m.priorityId}"`,
      ).toBe(true);
    }
  });

  it("every metric references a valid driverId", () => {
    const driverIds = new Set(CHNA_DRIVERS.map((d) => d.id));
    for (const m of CHNA_METRICS) {
      expect(
        driverIds.has(m.driverId),
        `Metric ${m.id} has unknown driverId "${m.driverId}"`,
      ).toBe(true);
    }
  });

  it("every priority in PRIORITY_DRIVER_MAP exists in CHNA_PRIORITIES", () => {
    const priorityIds = new Set(CHNA_PRIORITIES.map((p) => p.id));
    for (const pid of Object.keys(PRIORITY_DRIVER_MAP)) {
      expect(
        priorityIds.has(pid),
        `PRIORITY_DRIVER_MAP references unknown priority "${pid}"`,
      ).toBe(true);
    }
  });

  it("metric count per priority is at least 2", () => {
    for (const priority of CHNA_PRIORITIES) {
      const count = CHNA_METRICS.filter(
        (m) => m.priorityId === priority.id,
      ).length;
      expect(
        count,
        `Priority "${priority.id}" has fewer than 2 metrics`,
      ).toBeGreaterThanOrEqual(2);
    }
  });
});
