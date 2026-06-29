import { describe, it, expect, beforeEach } from "vitest";
import {
  loadCohortLibrary,
  saveCohortToLibrary,
  deleteCohortFromLibrary,
  COHORT_LIBRARY_KEY,
  MAX_SAVED_COHORTS,
} from "@/hooks/useCohortLibrary";

describe("cohort library", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("saves and loads a cohort", () => {
    saveCohortToLibrary({
      name: "Test cohort",
      criteria: { minEjIndex: 70 },
      enabled: { minEjIndex: true },
      resultCount: 3,
    });
    const lib = loadCohortLibrary();
    expect(lib).toHaveLength(1);
    expect(lib[0].name).toBe("Test cohort");
    expect(lib[0].criteria.minEjIndex).toBe(70);
  });

  it("deletes a saved cohort", () => {
    const saved = saveCohortToLibrary({
      name: "Remove me",
      criteria: { minPovertyRate: 15 },
      enabled: { minPovertyRate: true },
      resultCount: 0,
    });
    deleteCohortFromLibrary(saved.id);
    expect(loadCohortLibrary()).toHaveLength(0);
  });

  it("caps library at MAX_SAVED_COHORTS", () => {
    for (let i = 0; i < MAX_SAVED_COHORTS + 5; i++) {
      saveCohortToLibrary({
        name: `Cohort ${i}`,
        criteria: { minPovertyRate: 10 + i },
        enabled: { minPovertyRate: true },
        resultCount: i,
      });
    }
    expect(loadCohortLibrary().length).toBeLessThanOrEqual(MAX_SAVED_COHORTS);
  });

  it("uses versioned storage key", () => {
    expect(COHORT_LIBRARY_KEY).toContain("v1");
  });
});