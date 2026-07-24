import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { COUNTY_PROFILES } from "@/data/michigan-county-profiles";
import {
  computeCompoundDeficit,
  tierFromScore,
  CADI_PROVENANCE,
  type CompoundDeficitScore,
} from "@/utils/compoundDeficit";

const RAW_SOURCE = readFileSync(
  join(process.cwd(), "src/utils/compoundDeficit.ts"),
  "utf8",
);

/**
 * Executable code only. The file's header comment necessarily *names* the
 * fabrication vectors it removed, so asserting against the raw text would
 * match the explanation rather than any live code path.
 */
const SOURCE = RAW_SOURCE.replace(/\/\*[\s\S]*?\*\//g, "").replace(
  /\/\/.*$/gm,
  "",
);

describe("compoundDeficit (CADI)", () => {
  it("scores only the three sourced dimensions", () => {
    const score = computeCompoundDeficit("Wayne", COUNTY_PROFILES.Wayne);
    expect(Object.keys(score).sort()).toEqual(
      ["compound", "food", "providerShortage", "tier", "uninsured"].sort(),
    );
  });

  it("no longer exposes the previously fabricated dimensions", () => {
    const score = computeCompoundDeficit(
      "Wayne",
      COUNTY_PROFILES.Wayne,
    ) as CompoundDeficitScore & Record<string, unknown>;
    for (const dropped of ["broadband", "transit", "svi", "ej", "energy"]) {
      expect(score[dropped], `${dropped} should be gone`).toBeUndefined();
    }
  });

  it("derives no score from countyType, the old fabrication vector", () => {
    // The prior implementation set broadband/transit/ej/energy purely from
    // countyType, so every rural county shared identical sub-scores.
    expect(SOURCE).not.toMatch(/countyType/);
  });

  it("does not reuse the CDC SVI name for a locally invented composite", () => {
    // `svi` previously held (uninsured + food) * 2.5 under CDC's index name.
    expect(SOURCE).not.toMatch(/\bsviScore\b/);
  });

  it("produces genuinely differentiated scores across the 83 counties", () => {
    const scores = Object.entries(COUNTY_PROFILES).map(
      ([name, p]) => computeCompoundDeficit(name, p).compound,
    );
    expect(scores).toHaveLength(83);
    // The old index collapsed counties onto shared values; require real spread.
    expect(new Set(scores).size).toBeGreaterThan(60);
  });

  it("keeps every dimension and the composite within 0-100", () => {
    for (const [name, p] of Object.entries(COUNTY_PROFILES)) {
      const s = computeCompoundDeficit(name, p);
      for (const key of [
        "uninsured",
        "food",
        "providerShortage",
        "compound",
      ] as const) {
        expect(s[key], `${name}.${key} out of range`).toBeGreaterThanOrEqual(0);
        expect(s[key], `${name}.${key} out of range`).toBeLessThanOrEqual(100);
      }
    }
  });

  it("ranks a known high-barrier county above a known low-barrier one", () => {
    // Lake is the county this platform's own ALICE data flags as worst-off;
    // Livingston is among the most affluent. Directionality should hold.
    const lake = computeCompoundDeficit("Lake", COUNTY_PROFILES.Lake).compound;
    const livingston = computeCompoundDeficit(
      "Livingston",
      COUNTY_PROFILES.Livingston,
    ).compound;
    expect(lake).toBeGreaterThan(livingston);
  });

  it("returns a stable score for an unknown county rather than throwing", () => {
    const score = computeCompoundDeficit("Nowhere", COUNTY_PROFILES.Wayne);
    expect(Number.isFinite(score.compound)).toBe(true);
  });

  it("carries a MODELED provenance label with a named source", () => {
    expect(CADI_PROVENANCE.label).toBe("MODELED");
    expect(CADI_PROVENANCE.source.length).toBeGreaterThan(0);
    expect(CADI_PROVENANCE.note).toMatch(/uninsured/i);
  });

  it("maps scores to tiers at the documented thresholds", () => {
    expect(tierFromScore(80)).toBe("Critical");
    expect(tierFromScore(60)).toBe("High");
    expect(tierFromScore(30)).toBe("Moderate");
    expect(tierFromScore(10)).toBe("Low");
  });
});
