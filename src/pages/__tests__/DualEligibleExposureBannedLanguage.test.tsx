/**
 * Civic neutrality enforcement: banned language for V3 Feature 3 (Dual-Eligible Exposure).
 *
 * Scans the four source files for phrases that violate editorial rules:
 *
 *   BANNED ADVOCACY LANGUAGE (inherited from V2 Feature 3 baseline):
 *     "devastating" / "devastate"
 *     "crisis"
 *     "coverage cliff"
 *     "losing medicaid" / "losing medicare"
 *     "kicked off"
 *     "stripped of"
 *     "will lose coverage"
 *     "gutted"
 *     "Trump's cuts" / "Trump cuts"
 *     "victims"
 *
 *   BANNED FRAMING — specific to dual-eligible feature:
 *     "compounding exposure" — explicitly rejected framing
 *     "compounding risk"
 *     "will lose Medicare" — dual-eligibles are not losing Medicare under P.L. 119-21 work requirements
 *     "will lose Medicaid" — dual-eligibles are exempt from work requirements
 *     "at risk of losing" — present-tense active claim; not supported for dual-eligibles
 *
 *   BANNED PAYER/INSURER NAMES:
 *     Blue Cross, BCBSM, Corewell, Priority Health, Molina, Meridian,
 *     United, Humana, Aetna, Cigna, Kaiser (as insurer)
 *
 *   REQUIRED PHRASES — must appear verbatim:
 *     "Dual-eligible residents are exempt from P.L. 119-21 work requirements" — anchor phrase
 *     "MACPAC" — primary source
 *     "ACS B27010" — county allocation source
 *     "§71119" — exemption provision
 *     "§71101" — MSP streamlining rule delay (methodology page)
 */

import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

// ── Source files in scope ─────────────────────────────────────────────────────

const FEATURE_FILES = [
  "src/pages/DualEligibleExposurePage.tsx",
  "src/pages/methodology/DualEligibleExposureMethodology.tsx",
  "src/data/dualEligibleExposureFallback.ts",
  "src/hooks/useDualEligibleExposure.ts",
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

// ── Tests: banned advocacy language ──────────────────────────────────────────

describe("DualEligibleExposure — civic neutrality: banned advocacy language", () => {
  for (const relPath of FEATURE_FILES) {
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

      it("does not use 'kicked off'", () => {
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

      it("does not use 'losing Medicare'", () => {
        assertNotPresent(src, /losing\s+medicare/i, relPath);
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

// ── Tests: banned dual-eligible-specific framing ──────────────────────────────

describe("DualEligibleExposure — civic neutrality: banned dual-eligible framing", () => {
  for (const relPath of FEATURE_FILES) {
    describe(relPath, () => {
      const src = readSourceFile(relPath);

      it("does not use 'compounding exposure'", () => {
        assertNotPresent(src, /compounding\s+exposure/i, relPath);
      });

      it("does not use 'compounding risk'", () => {
        assertNotPresent(src, /compounding\s+risk/i, relPath);
      });

      it("does not assert 'will lose Medicare'", () => {
        assertNotPresent(src, /will\s+lose\s+medicare/i, relPath);
      });

      it("does not assert 'will lose Medicaid'", () => {
        assertNotPresent(src, /will\s+lose\s+medicaid/i, relPath);
      });

      it("does not use present-tense 'at risk of losing' for dual-eligibles", () => {
        assertNotPresent(src, /at\s+risk\s+of\s+losing/i, relPath);
      });
    });
  }
});

// ── Tests: banned payer/insurer names ─────────────────────────────────────────

describe("DualEligibleExposure — civic neutrality: no payer or insurer names", () => {
  for (const relPath of FEATURE_FILES) {
    describe(relPath, () => {
      const src = readSourceFile(relPath);

      it("does not name Blue Cross or BCBSM", () => {
        assertNotPresent(src, /blue\s*cross|bcbsm/i, relPath);
      });

      it("does not name Corewell", () => {
        assertNotPresent(src, /\bcorewell\b/i, relPath);
      });

      it("does not name Priority Health", () => {
        assertNotPresent(src, /priority\s+health/i, relPath);
      });

      it("does not name Molina", () => {
        assertNotPresent(src, /\bmolina\b/i, relPath);
      });

      it("does not name Meridian", () => {
        assertNotPresent(src, /\bmeridian\b/i, relPath);
      });

      it("does not name United (as insurer)", () => {
        assertNotPresent(src, /united\s+health/i, relPath);
      });

      it("does not name Humana", () => {
        assertNotPresent(src, /\bhumana\b/i, relPath);
      });

      it("does not name Aetna", () => {
        assertNotPresent(src, /\baetna\b/i, relPath);
      });

      it("does not name Cigna", () => {
        assertNotPresent(src, /\bcigna\b/i, relPath);
      });
    });
  }
});

// ── Tests: required framing ───────────────────────────────────────────────────

describe("DualEligibleExposure — civic neutrality: required framing", () => {
  it("data page contains anchor phrase verbatim", () => {
    const src = readSourceFile("src/pages/DualEligibleExposurePage.tsx");
    expect(src).toContain(
      "Dual-eligible residents are exempt from P.L. 119-21 work requirements. This map shows where they live."
    );
  });

  it("data page anchor phrase appears at least twice (subtitle and callout h2)", () => {
    const src = readSourceFile("src/pages/DualEligibleExposurePage.tsx");
    const count = (src.match(
      /Dual-eligible residents are exempt from P\.L\. 119-21 work requirements\. This map shows where they live\./g
    ) || []).length;
    expect(count).toBeGreaterThanOrEqual(2);
  });

  it("methodology page contains anchor phrase verbatim", () => {
    const src = readSourceFile("src/pages/methodology/DualEligibleExposureMethodology.tsx");
    expect(src).toContain(
      "Dual-eligible residents are exempt from P.L. 119-21 work requirements. This map shows where they live."
    );
  });

  it("data page uses P.L. 119-21 (enacted law reference)", () => {
    const src = readSourceFile("src/pages/DualEligibleExposurePage.tsx");
    expect(src).toMatch(/P\.L\.\s*119-21/i);
  });

  it("methodology page uses P.L. 119-21", () => {
    const src = readSourceFile("src/pages/methodology/DualEligibleExposureMethodology.tsx");
    expect(src).toMatch(/P\.L\.\s*119-21/i);
  });

  it("methodology page cites MACPAC", () => {
    const src = readSourceFile("src/pages/methodology/DualEligibleExposureMethodology.tsx");
    expect(src).toContain("MACPAC");
  });

  it("fallback data file cites MACPAC", () => {
    const src = readSourceFile("src/data/dualEligibleExposureFallback.ts");
    expect(src).toContain("MACPAC");
  });

  it("methodology page cites ACS B27010", () => {
    const src = readSourceFile("src/pages/methodology/DualEligibleExposureMethodology.tsx");
    expect(src).toContain("ACS B27010");
  });

  it("fallback data file cites ACS B27010", () => {
    const src = readSourceFile("src/data/dualEligibleExposureFallback.ts");
    expect(src).toContain("ACS B27010");
  });

  it("methodology page cites §71119 work requirement exemption", () => {
    const src = readSourceFile("src/pages/methodology/DualEligibleExposureMethodology.tsx");
    expect(src).toContain("§71119");
  });

  it("methodology page cites §71101 MSP provision", () => {
    const src = readSourceFile("src/pages/methodology/DualEligibleExposureMethodology.tsx");
    expect(src).toContain("§71101");
  });
});
