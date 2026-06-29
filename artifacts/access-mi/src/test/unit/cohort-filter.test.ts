import { describe, it, expect } from "vitest";
import {
  filterCohort,
  buildZipCohortProfile,
  criteriaToSearchParams,
  criteriaFromSearchParams,
  COHORT_PRESETS,
} from "@/utils/cohortFilter";

describe("cohortFilter", () => {
  it("builds a profile for a known ZIP", () => {
    const p = buildZipCohortProfile("48201");
    expect(p?.zip).toBe("48201");
    expect(p?.county).toBe("Wayne");
    expect(p?.metrics.ej_index.value).toBe(82);
  });

  it("filters high EJ index ZIPs", () => {
    const matches = filterCohort({ minEjIndex: 70 });
    expect(matches.length).toBeGreaterThan(0);
    for (const m of matches) {
      expect(m.metrics.ej_index.value).toBeGreaterThanOrEqual(70);
    }
  });

  it("round-trips criteria via URL params", () => {
    const original = COHORT_PRESETS[0].criteria;
    const restored = criteriaFromSearchParams(criteriaToSearchParams(original));
    expect(restored.minPm25Percentile).toBe(original.minPm25Percentile);
    expect(restored.minUninsuredRate).toBe(original.minUninsuredRate);
  });

  it("returns empty when no numeric filters are active", () => {
    expect(filterCohort({})).toEqual([]);
    expect(filterCohort({ counties: ["Wayne"] })).toEqual([]);
  });

  it("presets define valid thresholds", () => {
    for (const preset of COHORT_PRESETS) {
      expect(preset.label.length).toBeGreaterThan(0);
      const results = filterCohort(preset.criteria);
      expect(Array.isArray(results)).toBe(true);
    }
  });
});