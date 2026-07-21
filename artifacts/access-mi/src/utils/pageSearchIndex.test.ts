import { describe, expect, it } from "vitest";
import { PAGE_SEARCH_INDEX, searchPages } from "@/utils/pageSearchIndex";
import { ROUTE_MANIFEST } from "@/routes/manifest";

describe("PAGE_SEARCH_INDEX", () => {
  it("contains no dynamic-param routes or excluded paths", () => {
    for (const entry of PAGE_SEARCH_INDEX) {
      expect(entry.href.includes(":"), entry.href).toBe(false);
      expect(entry.href).not.toBe("/embed");
      expect(entry.href).not.toBe("/admin/search-trends");
      expect(entry.href).not.toBe("/");
    }
  });

  it("only indexes hrefs that exist in the route manifest", () => {
    const known = new Set(ROUTE_MANIFEST.map((r) => r.path));
    for (const entry of PAGE_SEARCH_INDEX) {
      expect(known.has(entry.href), entry.href).toBe(true);
    }
  });

  it("covers far more pages than the old hand-maintained list", () => {
    expect(PAGE_SEARCH_INDEX.length).toBeGreaterThan(100);
  });

  it("applies curated overrides", () => {
    const caseStudies = PAGE_SEARCH_INDEX.find((p) => p.href === "/case-studies");
    expect(caseStudies?.label).toBe("Illustrative Scenarios");
  });
});

describe("searchPages", () => {
  it("finds key pages by label", () => {
    expect(searchPages("insights").map((p) => p.href)).toContain("/insights");
    expect(searchPages("find care").map((p) => p.href)).toContain("/find-care");
  });

  it("finds pages via sitemap synonyms", () => {
    // Sitemap labels the health map "Interactive Health Map".
    expect(searchPages("interactive health").map((p) => p.href)).toContain(
      "/health-map",
    );
  });

  it("ranks label matches above description matches and respects the limit", () => {
    const results = searchPages("health", 6);
    expect(results.length).toBeLessThanOrEqual(6);
    expect(results[0].label.toLowerCase()).toContain("health");
  });

  it("returns nothing for a blank query", () => {
    expect(searchPages("  ")).toHaveLength(0);
  });
});
