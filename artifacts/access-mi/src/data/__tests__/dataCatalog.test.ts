import { describe, expect, it } from "vitest";

import {
  DATA_CATALOG,
  INGESTED_CATALOG,
  REFERENCE_CATALOG,
  getCatalogEntry,
  getRegistryFeed,
} from "@/data/dataCatalog";
import {
  PUBLISHERS_TOTAL,
  SOURCES_REGISTRY,
  SOURCES_TOTAL,
  getFeedsByOrg,
} from "@/data/sourcesRegistry";
import {
  DATA_PUBLISHER_COUNT,
  DATA_SOURCE_COUNT,
} from "@/config/platformConstants";

/**
 * These mirror `scripts/check-data-catalog.mjs` at the type layer. The
 * build guard parses the source text; this suite exercises the real
 * imported objects, so a refactor that breaks the guard's parser cannot
 * quietly disable every invariant at once.
 */
describe("data catalog", () => {
  it("is non-empty and splits into ingested plus reference", () => {
    expect(DATA_CATALOG.length).toBeGreaterThan(0);
    expect(INGESTED_CATALOG.length + REFERENCE_CATALOG.length).toBe(
      DATA_CATALOG.length,
    );
    expect(INGESTED_CATALOG.length).toBeGreaterThan(0);
  });

  it("has unique ids and names", () => {
    const ids = DATA_CATALOG.map((d) => d.id);
    const names = DATA_CATALOG.map((d) => d.name);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(names).size).toBe(names.length);
  });

  it("resolves every ingested entry to a registry feed", () => {
    for (const entry of INGESTED_CATALOG) {
      const feed = getRegistryFeed(entry);
      expect(feed, `${entry.id} -> ${entry.registryFeed}`).toBeDefined();
      expect(entry.publisherOrg, `${entry.id} publisher`).toBe(feed!.org);
    }
  });

  it("keeps reference entries outside the counted feed registry", () => {
    for (const entry of REFERENCE_CATALOG) {
      expect(entry.registryFeed, `${entry.id}`).toBeUndefined();
      expect(getRegistryFeed(entry)).toBeUndefined();
    }
  });

  it("documents every cadence that differs from its feed", () => {
    for (const entry of INGESTED_CATALOG) {
      const feed = getRegistryFeed(entry)!;
      if (entry.cadence !== feed.frequency) {
        expect(
          entry.cadenceNote?.length ?? 0,
          `${entry.id} needs a cadenceNote`,
        ).toBeGreaterThanOrEqual(30);
      }
    }
  });

  it("documents every source URL host that differs from its feed", () => {
    const host = (u: string) =>
      new URL(u).host.replace(/^www\./, "").toLowerCase();
    for (const entry of INGESTED_CATALOG) {
      const feed = getRegistryFeed(entry)!;
      if (host(entry.sourceUrl) !== host(feed.url)) {
        expect(
          entry.urlNote?.length ?? 0,
          `${entry.id} needs a urlNote`,
        ).toBeGreaterThanOrEqual(30);
      }
    }
  });

  it("uses https source URLs and names at least one surface", () => {
    for (const entry of DATA_CATALOG) {
      expect(entry.sourceUrl.startsWith("https://"), entry.id).toBe(true);
      expect(() => new URL(entry.sourceUrl)).not.toThrow();
      expect(entry.poweredSurfaces.length, entry.id).toBeGreaterThan(0);
    }
  });

  it("looks entries up by id", () => {
    const first = DATA_CATALOG[0];
    expect(getCatalogEntry(first.id)).toBe(first);
    expect(getCatalogEntry("no-such-entry")).toBeUndefined();
  });
});

describe("feed and publisher counts", () => {
  it("counts feeds and publishers as distinct numbers", () => {
    expect(DATA_SOURCE_COUNT).toBe(SOURCES_TOTAL);
    expect(DATA_PUBLISHER_COUNT).toBe(PUBLISHERS_TOTAL);
    // Publishers can never exceed feeds, and this platform genuinely has
    // publishers shipping more than one feed - so they must not be equal.
    expect(PUBLISHERS_TOTAL).toBeLessThan(SOURCES_TOTAL);
  });

  it("agrees with a direct recount of the registry", () => {
    expect(PUBLISHERS_TOTAL).toBe(
      new Set(SOURCES_REGISTRY.map((s) => s.org)).size,
    );
  });

  it("returns every feed a multi-feed publisher contributes", () => {
    const cms = getFeedsByOrg("CMS");
    expect(cms.length).toBeGreaterThan(1);
    expect(cms.every((f) => f.org === "CMS")).toBe(true);
    expect(getFeedsByOrg("Not A Publisher")).toEqual([]);
  });

  it("credits every publisher backing an ingested catalog entry", () => {
    const credited = new Set(SOURCES_REGISTRY.map((s) => s.org));
    for (const entry of INGESTED_CATALOG) {
      expect(credited.has(entry.publisherOrg), entry.publisherOrg).toBe(true);
    }
  });
});
