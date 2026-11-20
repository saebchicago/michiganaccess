import { describe, expect, it } from "vitest";
import pendingItems from "@/data/catalog-pending-items.json";
import catalog from "@/data/source-catalog.generated.json";

describe("catalog pending items", () => {
  it("has unique ids and complete, dated entries", () => {
    const ids = pendingItems.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const item of pendingItems) {
      expect(["everyone", "agents"]).toContain(item.audience);
      expect(item.title.length).toBeGreaterThan(0);
      expect(item.text.length).toBeGreaterThan(0);
      expect(item.reviewed).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(`${item.title} ${item.text}`).not.toMatch(/\u2014/);
    }
  });

  it("is carried into the generated catalog unchanged", () => {
    expect((catalog as { _meta: { pendingItems?: unknown } })._meta.pendingItems).toEqual(pendingItems);
  });

  it("matches the catalog's license state", () => {
    const sources = (catalog as { sources: Array<{ license: unknown; licenseReviewStatus?: string; attributionUnverified?: boolean }> }).sources;
    const licenseItem = pendingItems.find((i) => i.id === "license-review");
    if (licenseItem) {
      expect(sources.every((s) => s.license === null && s.licenseReviewStatus === "pending")).toBe(true);
      const unverified = sources.filter((s) => s.attributionUnverified).length;
      expect(licenseItem.text).toContain(["Zero", "One", "Two", "Three", "Four"][unverified] ?? String(unverified));
    }
  });
});
