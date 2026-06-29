import { describe, it, expect } from "vitest";
import { SERVICE_AREA_TEMPLATES } from "@/data/serviceAreaTemplates";
import { ZIP_TO_COUNTY } from "@/data/michiganZips";

const KNOWN_COUNTIES = new Set(
  Object.values(ZIP_TO_COUNTY).map((v) => v.county),
);

describe("serviceAreaTemplates", () => {
  it("defines geographic templates without empty county lists", () => {
    expect(SERVICE_AREA_TEMPLATES.length).toBeGreaterThanOrEqual(4);
    for (const template of SERVICE_AREA_TEMPLATES) {
      expect(template.counties.length).toBeGreaterThan(0);
      expect(template.label).not.toMatch(/health|hospital|ford|corewell/i);
    }
  });

  it("only references counties present in ZIP_TO_COUNTY", () => {
    for (const template of SERVICE_AREA_TEMPLATES) {
      for (const county of template.counties) {
        expect(KNOWN_COUNTIES.has(county)).toBe(true);
      }
    }
  });
});