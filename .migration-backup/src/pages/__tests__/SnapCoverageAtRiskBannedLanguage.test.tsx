/**
 * Civic neutrality enforcement: banned language / banned figures.
 *
 * Scans the source files for Feature 2 (SNAP Coverage at Risk) for phrases
 * that violate the editorial rules in V3_SOURCE_AUDIT.md and CLAUDE.md:
 *
 *   BANNED FIGURES — from the superseded House bill, not P.L. 119-21:
 *     "3–4 million" or "3-4 million"
 *     "$285 billion", "$295 billion"
 *
 *   BANNED ADVOCACY LANGUAGE — partisan / outcome-asserted framing:
 *     "devastating" / "devastate"
 *     "crisis"
 *     "Trump's cuts" / "Trump cuts"
 *     "victims"
 *     "will lose" (followed by "coverage" or "benefits")
 *     "slashed" (as in "benefits will be slashed")
 *
 * These tests read the compiled source files at import time. They do not
 * require rendering — the assertion is over raw text content.
 */

import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

// ── Source files in scope ─────────────────────────────────────────────────────

const FEATURE2_FILES = [
  "src/pages/SnapCoverageAtRiskPage.tsx",
  "src/pages/methodology/SnapCoverageAtRiskMethodology.tsx",
  "src/data/snapCoverageAtRiskFallback.ts",
  "src/hooks/useSnapCoverageAtRisk.ts",
];

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

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("SnapCoverageAtRisk — civic neutrality: banned figures", () => {
  for (const relPath of FEATURE2_FILES) {
    describe(relPath, () => {
      const src = readSourceFile(relPath);

      it("does not cite superseded '3–4 million' or '3-4 million' figure", () => {
        assertNotPresent(src, /3[–\-]4\s*million/i, relPath);
      });

      it("does not cite superseded '$285 billion' figure", () => {
        assertNotPresent(src, /\$285\s*billion/i, relPath);
      });

      it("does not cite superseded '$295 billion' figure", () => {
        assertNotPresent(src, /\$295\s*billion/i, relPath);
      });
    });
  }
});

describe("SnapCoverageAtRisk — civic neutrality: banned advocacy language", () => {
  for (const relPath of FEATURE2_FILES) {
    describe(relPath, () => {
      const src = readSourceFile(relPath);

      it("does not use 'devastating' or 'devastate'", () => {
        assertNotPresent(src, /devastat/i, relPath);
      });

      it("does not use 'crisis'", () => {
        assertNotPresent(src, /\bcrisis\b/i, relPath);
      });

      it("does not use \"Trump's cuts\" or \"Trump cuts\"", () => {
        assertNotPresent(src, /trump.{0,4}cuts/i, relPath);
      });

      it("does not use 'victims'", () => {
        assertNotPresent(src, /\bvictims\b/i, relPath);
      });

      it("does not assert 'will lose coverage'", () => {
        assertNotPresent(src, /will\s+lose\s+coverage/i, relPath);
      });

      it("does not assert 'will lose benefits'", () => {
        assertNotPresent(src, /will\s+lose\s+benefits/i, relPath);
      });

      it("does not use 'slashed' in benefit context", () => {
        assertNotPresent(src, /benefits\s+will\s+be\s+slashed/i, relPath);
      });
    });
  }
});

describe("SnapCoverageAtRisk — civic neutrality: required framing", () => {
  it("SnapCoverageAtRiskPage contains 'Exposure does not equal loss'", () => {
    const src = readSourceFile("src/pages/SnapCoverageAtRiskPage.tsx");
    expect(src).toContain("Exposure does not equal loss");
  });

  it("SnapCoverageAtRiskPage uses P.L. 119-21 (enacted law reference)", () => {
    const src = readSourceFile("src/pages/SnapCoverageAtRiskPage.tsx");
    expect(src).toMatch(/P\.L\.\s*119-21/i);
  });

  it("methodology page contains 'Exposure does not equal loss'", () => {
    const src = readSourceFile(
      "src/pages/methodology/SnapCoverageAtRiskMethodology.tsx"
    );
    expect(src).toContain("Exposure does not equal loss");
  });

  it("methodology page cites CBO publication number 61367", () => {
    const src = readSourceFile(
      "src/pages/methodology/SnapCoverageAtRiskMethodology.tsx"
    );
    expect(src).toContain("61367");
  });

  it("methodology page cites MLPP figure 74,000", () => {
    const src = readSourceFile(
      "src/pages/methodology/SnapCoverageAtRiskMethodology.tsx"
    );
    expect(src).toMatch(/74,000|74_000/);
  });

  it("fallback data file cites GAO-19-56 uncertainty band", () => {
    const src = readSourceFile("src/data/snapCoverageAtRiskFallback.ts");
    expect(src).toContain("GAO-19-56");
  });

  it("fallback data comments cite MLPP source URL", () => {
    const src = readSourceFile("src/data/snapCoverageAtRiskFallback.ts");
    expect(src).toContain("mlpp.org");
  });
});
