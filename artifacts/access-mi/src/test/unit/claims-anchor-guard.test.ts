/**
 * Anchor guard for CLAIMS.md VERIFIED rows.
 * Each test asserts a distinctive snippet exists in the evidence file cited in
 * CLAIMS.md. If the anchor drifts (renamed constant, deleted copy, etc.) the
 * test fails  -  alerting that a claim needs re-verification or CLAIMS.md update.
 *
 * Mutation-proven: mutating any anchor text below causes exit 1 in the suite.
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../../..");

function read(rel: string) {
  return readFileSync(resolve(root, rel), "utf8");
}

describe("Claims anchor guard  -  VERIFIED rows", () => {
  // V-1: 42 sources build assertion (was 41 before NHTSA FARS integration).
  it("V-1: platformConstants.ts asserts SOURCES_TOTAL === 42", () => {
    const src = read("src/config/platformConstants.ts");
    expect(src).toContain("EXPECTED_SOURCE_COUNT = 42");
    expect(src).toContain("SOURCES_TOTAL !== EXPECTED_SOURCE_COUNT");
  });

  // V-2: DATA_SOURCE_DISPLAY used in AboutPage
  it("V-2: AboutPage uses DATA_SOURCE_DISPLAY in '42 verified sources' copy", () => {
    const src = read("src/pages/AboutPage.tsx");
    expect(src).toContain("DATA_SOURCE_DISPLAY");
    expect(src).toContain("verified sources. Structured for action.");
  });

  // V-3: AccessChat renders "Ask Access Michigan" and calls chat-mistral
  it("V-3: AccessChat renders 'Ask Access Michigan' and calls chat-mistral", () => {
    const src = read("src/components/AccessChat.tsx");
    expect(src).toContain("Ask Access Michigan");
    expect(src).toContain("chat-mistral");
  });

  // V-4: GA4 (G-367X8MQ1F6) loaded in index.html
  it("V-4: index.html loads GA4 with the canonical measurement ID", () => {
    const src = read("index.html");
    expect(src).toMatch(/googletagmanager\.com\/gtag\/js\?id=G-367X8MQ1F6/);
    expect(src).toContain('gtag("config", "G-367X8MQ1F6")');
  });

  // V-5: No ad network scripts in index.html
  it("V-5: index.html contains no ad-network script tags", () => {
    const src = read("index.html");
    expect(src).not.toMatch(/doubleclick|adsense|adsbygoogle|amazon-adsystem/);
  });

  // V-9: Independence claim in Footer
  it("V-9: Footer renders independence and non-affiliation disclaimer", () => {
    const src = read("src/components/layout/Footer.tsx");
    expect(src).toContain("not affiliated with the State of Michigan");
  });

  // V-10: 83-county FIPS registry has exactly 83 entries
  it("V-10: census-geographies.ts contains exactly 83 three-digit FIPS codes", () => {
    const src = read("src/data/census-geographies.ts");
    const matches = src.match(/"[0-9]{3}"/g) ?? [];
    expect(matches.length).toBe(83);
  });

  // V-11: AirNow real-time hook fetches from Supabase proxy
  it("V-11: useAirQuality hook fetches airnow-proxy endpoint", () => {
    const src = read("src/hooks/useAirQuality.ts");
    expect(src).toContain("airnow-proxy");
  });

  // V-12: ClinicalTrials.gov live API client
  it("V-12: clinicaltrials-client.ts uses live clinicaltrials.gov API base", () => {
    const src = read("src/lib/clinicaltrials-client.ts");
    expect(src).toContain("clinicaltrials.gov/api/v2");
  });

  // V-14: EJScreen data file is present with source label
  it("V-14: ejscreen.ts declares EPA_EJSCREEN_SOURCE", () => {
    const src = read("src/data/ejscreen.ts");
    expect(src).toContain("EPA_EJSCREEN_SOURCE");
    expect(src).toContain("EPA EJSCREEN v2.3");
  });

  // V-15: CMS Hospital Compare in sourcesRegistry
  it("V-15: sourcesRegistry.ts contains CMS Hospital Compare entry", () => {
    const src = read("src/data/sourcesRegistry.ts");
    expect(src).toContain("CMS Hospital Compare");
  });

  // V-16: HRSA Data Warehouse in sourcesRegistry
  it("V-16: sourcesRegistry.ts contains HRSA Data Warehouse entry", () => {
    const src = read("src/data/sourcesRegistry.ts");
    expect(src).toContain("HRSA Data Warehouse");
  });

  // V-17: CDC PLACES in sourcesRegistry
  it("V-17: sourcesRegistry.ts contains CDC PLACES entry", () => {
    const src = read("src/data/sourcesRegistry.ts");
    expect(src).toContain("CDC PLACES");
  });

  // V-18: localStorage disclosure in PrivacyPage
  it("V-18: PrivacyPage discloses localStorage use", () => {
    const src = read("src/pages/PrivacyPage.tsx");
    expect(src).toContain("localStorage");
  });
});

describe("Claims anchor guard  -  FALSE-fixed rows", () => {
  // F-1 fix: PrivacyPage no longer says "client-side" for appeal generator
  it("F-1 fix: PrivacyPage does not claim AI tools process data 'client-side'", () => {
    const src = read("src/pages/PrivacyPage.tsx");
    expect(src).not.toContain(
      "process data client-side. We do not store, transmit",
    );
    // Replacement copy is present
    expect(src).toContain("processed via secure server functions");
  });
});
