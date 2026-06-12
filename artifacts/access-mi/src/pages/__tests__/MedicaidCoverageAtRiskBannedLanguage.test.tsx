/**
 * Civic neutrality enforcement: banned language / banned figures.
 *
 * Scans the source files for V2 Feature 3 (Medicaid Coverage at Risk) for phrases
 * that violate editorial rules:
 *
 *   BANNED FIGURES  -  from the superseded House bill, not P.L. 119-21 (enacted):
 *     "247,000" / "247K" (pre-enactment KFF state allocation low)
 *     "412,000" / "412K" (pre-enactment KFF state allocation high)
 *     "$19.3 billion" / "$32.1 billion" (pre-enactment KFF spending)
 *     "700,000" in context of "at risk" (pre-enactment MLPP figure, traces to House bill)
 *
 *   BANNED ADVOCACY LANGUAGE  -  partisan / outcome-asserted framing:
 *     "devastating" / "devastate"
 *     "crisis"
 *     "coverage cliff"
 *     "losing medicaid"
 *     "kicked off"
 *     "stripped of"
 *     "will lose coverage"
 *     "gutted"
 *     "Trump's cuts" / "Trump cuts"
 *     "victims"
 *
 * These tests read the raw source files at import time (not rendered output).
 */

import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

// ── Source files in scope ─────────────────────────────────────────────────────

const FEATURE3_FILES = [
  "src/pages/MedicaidCoverageAtRiskPage.tsx",
  "src/pages/methodology/MedicaidCoverageAtRiskMethodology.tsx",
  "src/data/medicaidCoverageAtRiskFallback.ts",
  "src/hooks/useMedicaidCoverageAtRisk.ts",
];

// 3 levels up from src/pages/__tests__/ → project root
const ROOT = path.resolve(__dirname, "../../..");

function readSourceFile(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf-8");
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function assertNotPresent(source: string, pattern: RegExp, file: string) {
  expect(
    pattern.test(source),
    `Banned pattern /${pattern.source}/${pattern.flags} found in ${file}`
  ).toBe(false);
}

// ── Tests: banned figures ─────────────────────────────────────────────────────

describe("MedicaidCoverageAtRisk  -  civic neutrality: banned figures", () => {
  for (const relPath of FEATURE3_FILES) {
    describe(relPath, () => {
      const src = readSourceFile(relPath);

      it("does not cite superseded '247,000' or '247K' (pre-enactment KFF low)", () => {
        assertNotPresent(src, /247[,_]?000|247K/i, relPath);
      });

      it("does not cite superseded '412,000' or '412K' (pre-enactment KFF high)", () => {
        assertNotPresent(src, /412[,_]?000|412K/i, relPath);
      });

      it("does not cite superseded '$19.3 billion' (pre-enactment House bill)", () => {
        assertNotPresent(src, /\$19\.3\s*billion/i, relPath);
      });

      it("does not cite superseded '$32.1 billion' (pre-enactment House bill)", () => {
        assertNotPresent(src, /\$32\.1\s*billion/i, relPath);
      });
    });
  }
});

// ── Tests: banned advocacy language ──────────────────────────────────────────

describe("MedicaidCoverageAtRisk  -  civic neutrality: banned advocacy language", () => {
  for (const relPath of FEATURE3_FILES) {
    describe(relPath, () => {
      const src = readSourceFile(relPath);

      it("does not use 'devastating' or 'devastate'", () => {
        assertNotPresent(src, /devastat/i, relPath);
      });

      it("does not use 'crisis'", () => {
        assertNotPresent(src, /\bcrisis\b/i, relPath);
      });

      it("does not use 'coverage cliff'", () => {
        assertNotPresent(src, /coverage\s+cliff/i, relPath);
      });

      it("does not use 'kicked off' in coverage context", () => {
        assertNotPresent(src, /kicked\s+off/i, relPath);
      });

      it("does not use 'stripped of'", () => {
        assertNotPresent(src, /stripped\s+of/i, relPath);
      });

      it("does not assert 'will lose coverage'", () => {
        assertNotPresent(src, /will\s+lose\s+coverage/i, relPath);
      });

      it("does not use 'losing Medicaid'", () => {
        assertNotPresent(src, /losing\s+medicaid/i, relPath);
      });

      it("does not use 'gutted'", () => {
        assertNotPresent(src, /\bgutted\b/i, relPath);
      });

      it("does not use \"Trump's cuts\" or \"Trump cuts\"", () => {
        assertNotPresent(src, /trump.{0,4}cuts/i, relPath);
      });

      it("does not use 'victims'", () => {
        assertNotPresent(src, /\bvictims\b/i, relPath);
      });
    });
  }
});

// ── Tests: required framing ───────────────────────────────────────────────────

describe("MedicaidCoverageAtRisk  -  civic neutrality: required framing", () => {
  it("data page contains 'Exposure is not disenrollment' verbatim", () => {
    const src = readSourceFile("src/pages/MedicaidCoverageAtRiskPage.tsx");
    expect(src).toContain("Exposure is not disenrollment");
  });

  it("methodology page contains 'Exposure is not disenrollment' verbatim", () => {
    const src = readSourceFile(
      "src/pages/methodology/MedicaidCoverageAtRiskMethodology.tsx"
    );
    expect(src).toContain("Exposure is not disenrollment");
  });

  it("data page uses P.L. 119-21 (enacted law reference)", () => {
    const src = readSourceFile("src/pages/MedicaidCoverageAtRiskPage.tsx");
    expect(src).toMatch(/P\.L\.\s*119-21/i);
  });

  it("methodology page uses P.L. 119-21", () => {
    const src = readSourceFile(
      "src/pages/methodology/MedicaidCoverageAtRiskMethodology.tsx"
    );
    expect(src).toMatch(/P\.L\.\s*119-21/i);
  });

  it("data page cites Urban Institute statewide low figure 171,000", () => {
    const src = readSourceFile("src/pages/MedicaidCoverageAtRiskPage.tsx");
    expect(src).toMatch(/171[,_]?000/);
  });

  it("data page cites Urban Institute statewide high figure 355,000", () => {
    const src = readSourceFile("src/pages/MedicaidCoverageAtRiskPage.tsx");
    expect(src).toMatch(/355[,_]?000/);
  });

  it("methodology page cites Urban Institute statewide low figure 171,000", () => {
    const src = readSourceFile(
      "src/pages/methodology/MedicaidCoverageAtRiskMethodology.tsx"
    );
    expect(src).toMatch(/171[,_]?000/);
  });

  it("methodology page cites Urban Institute statewide high figure 355,000", () => {
    const src = readSourceFile(
      "src/pages/methodology/MedicaidCoverageAtRiskMethodology.tsx"
    );
    expect(src).toMatch(/355[,_]?000/);
  });

  it("methodology page cites Urban Institute", () => {
    const src = readSourceFile(
      "src/pages/methodology/MedicaidCoverageAtRiskMethodology.tsx"
    );
    expect(src).toContain("Urban Institute");
  });

  it("methodology page cites ACS B27010", () => {
    const src = readSourceFile(
      "src/pages/methodology/MedicaidCoverageAtRiskMethodology.tsx"
    );
    expect(src).toContain("ACS B27010");
  });

  it("fallback data file cites Urban Institute source URL", () => {
    const src = readSourceFile("src/data/medicaidCoverageAtRiskFallback.ts");
    expect(src).toContain("urban.org");
  });

  it("fallback data file cites CBO publication number 61570", () => {
    const src = readSourceFile("src/data/medicaidCoverageAtRiskFallback.ts");
    expect(src).toContain("61570");
  });
});
