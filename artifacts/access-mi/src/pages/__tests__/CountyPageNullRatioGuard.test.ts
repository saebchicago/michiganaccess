/**
 * Structural guard for the null-ratio display fix (#63).
 *
 * Keweenaw County's primary care ratio is "-" (no data). Without a guard,
 * NaN comparisons silently return false, causing "Above state avg",
 * "Above US avg", and "Adequate" badges to all render simultaneously.
 *
 * These tests read the CountyPage source to verify the guard patterns
 * exist and are structurally correct.
 */

import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const ROOT = path.resolve(__dirname, "../../..");
const src = fs.readFileSync(
  path.join(ROOT, "src/pages/CountyPage.tsx"),
  "utf-8",
);

describe("CountyPage null-ratio guard", () => {
  it("derives hasNumericVal using Number.isFinite", () => {
    expect(src).toMatch(/Number\.isFinite\(numericVal\)/);
  });

  it("gates the benchmark badge block on hasNumericVal", () => {
    expect(src).toMatch(/bench && hasNumericVal/);
  });

  it("renders a fallback note when bench exists but value is non-numeric", () => {
    expect(src).toMatch(/bench && !hasNumericVal/);
    expect(src).toContain("Comparison unavailable");
  });

  it("guards ratioSeverity assignment with Number.isFinite on the parsed ratio number", () => {
    expect(src).toMatch(/Number\.isFinite\(ratioNum\) && ratioNum > 0/);
  });

  it("ratioSeverity is only assigned inside the isFinite guard, not outside it", () => {
    // The assignment must appear nested inside Number.isFinite(ratioNum)  -  verify the guard
    // wraps the assignment by checking the source order: isFinite guard precedes the assignment.
    const isFinitePos = src.indexOf(
      "Number.isFinite(ratioNum) && ratioNum > 0",
    );
    // Use negative lookahead to count true assignments (= not followed by another =)
    const assignments = [...src.matchAll(/ratioSeverity\s*=(?!=)/g)];
    expect(assignments.length).toBe(1);
    expect(assignments[0].index).toBeGreaterThan(isFinitePos);
  });
});
