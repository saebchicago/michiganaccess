/**
 * Acquisition-copy regression guard.
 *
 * The V3 benefits reframe replaced acquisition-framing headlines
 * ("you may qualify", "Get benefits") with neutral educational copy
 * on homepage and benefits surfaces. These tests prevent reversion.
 *
 * Scope: homepage components + BenefitsHubPage.
 * Excluded: UniversalPreScreener.tsx results display (data-driven output
 * shown only after user completes the screener  -  not acquisition framing).
 */

import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const ROOT = path.resolve(__dirname, "../../..");

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf-8");
}

const SURFACES: Record<string, string> = {
  CapabilityStrip: "src/components/home/CapabilityStrip.tsx",
  FrontDoorTriage: "src/components/home/FrontDoorTriage.tsx",
  LiveDemoPreview: "src/components/home/LiveDemoPreview.tsx",
  BenefitsHubPage: "src/pages/BenefitsHubPage.tsx",
};

describe("Acquisition-copy regression: benefits surfaces", () => {
  for (const [name, relPath] of Object.entries(SURFACES)) {
    const src = read(relPath);

    it(`${name} does not use 'you may qualify' acquisition framing`, () => {
      expect(src).not.toMatch(/you may qualify/i);
    });

    it(`${name} does not use 'Get benefits' as a CTA`, () => {
      expect(src).not.toMatch(/\bGet benefits\b/i);
    });
  }
});
