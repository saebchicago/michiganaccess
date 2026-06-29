import { describe, it, expect } from "vitest";
import { writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import {
  buildCohortApiBundle,
  filterCohortApiBundle,
} from "@/utils/buildCohortApiBundle";

const here = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(here, "../../..");
const shouldWrite = process.env.WRITE_COHORT_API_BUNDLE === "1";

describe("cohortApiBundle", () => {
  it("builds a statewide ZIP profile bundle", () => {
    const bundle = buildCohortApiBundle();
    expect(bundle.schemaVersion).toBe("accessmi-cohort-api-v1");
    expect(bundle.zipCount).toBeGreaterThan(100);
    expect(bundle.profiles[0]?.zip).toMatch(/^\d{5}$/);
  });

  it("filters bundle with same thresholds as cohort builder", () => {
    const bundle = buildCohortApiBundle();
    const matches = filterCohortApiBundle(bundle, { minEjIndex: 70 });
    for (const m of matches) {
      expect(m.ej_index).toBeGreaterThanOrEqual(70);
      expect(m.ej_index_integrity).toBe("VERIFIED");
    }
  });

  it("writes API bundle artifacts when WRITE_COHORT_API_BUNDLE=1", () => {
    if (!shouldWrite) return;

    const bundle = buildCohortApiBundle();
    const json = JSON.stringify(bundle);

    const publicOut = resolve(projectRoot, "public/data/cohort-api-bundle.json");
    writeFileSync(publicOut, json, "utf-8");

    const netlifyOut = resolve(
      projectRoot,
      "../../netlify/functions/_data/cohort-api-bundle.json",
    );
    mkdirSync(dirname(netlifyOut), { recursive: true });
    writeFileSync(netlifyOut, json, "utf-8");

    expect(bundle.zipCount).toBeGreaterThan(0);
  });
});