import { describe, expect, it } from "vitest";
import {
  COUNTY_CROSS_DOMAIN,
  CROSS_DOMAIN_METRIC_META,
  MI_STATE_AVERAGES,
  formatCrossDomainValue,
} from "@/data/cross-domain-indicators";
import { INTELLIGENCE_DOMAINS } from "@/data/intelligence-domains";

describe("CROSS_DOMAIN_METRIC_META", () => {
  it("covers every CountyCrossDomain field with a named source and vintage", () => {
    const fields = Object.keys(MI_STATE_AVERAGES) as (keyof typeof MI_STATE_AVERAGES)[];
    for (const field of fields) {
      const meta = CROSS_DOMAIN_METRIC_META[field];
      expect(meta, `missing meta for ${field}`).toBeDefined();
      expect(meta.label.length).toBeGreaterThan(0);
      expect(meta.source.length, `empty source for ${field}`).toBeGreaterThan(0);
      expect(meta.vintage.length, `empty vintage for ${field}`).toBeGreaterThan(0);
    }
  });

  it("has no meta entries for fields that do not exist", () => {
    const fields = new Set(Object.keys(MI_STATE_AVERAGES));
    for (const key of Object.keys(CROSS_DOMAIN_METRIC_META)) {
      expect(fields.has(key), `stray meta key ${key}`).toBe(true);
    }
  });

  it("every domain contextMetric resolves to a real meta entry", () => {
    for (const domain of INTELLIGENCE_DOMAINS) {
      expect(domain.contextMetrics.length).toBeGreaterThan(0);
      for (const key of domain.contextMetrics) {
        expect(CROSS_DOMAIN_METRIC_META[key], `${domain.slug}: ${String(key)}`).toBeDefined();
      }
    }
  });

  it("keeps all 83 counties resolvable for context tiles", () => {
    expect(Object.keys(COUNTY_CROSS_DOMAIN)).toHaveLength(83);
  });
});

describe("formatCrossDomainValue", () => {
  it("prefixes currency and localizes numbers", () => {
    expect(formatCrossDomainValue(63498, "currency")).toBe("$63,498");
    expect(formatCrossDomainValue(13.8, "percent")).toBe("13.8");
  });

  it("passes null through so callers can label it honestly", () => {
    expect(formatCrossDomainValue(null, "percent")).toBeNull();
  });
});
