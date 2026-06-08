// src/data/sources.test.ts
//
// Run with: npm test
// Two layers: live registry must be clean, and the validators themselves
// must have teeth (negative cases prove they actually catch violations).

import { describe, it, expect } from "vitest";
import {
  validateRegistry,
  validateDataSource,
  validateEmbedSource,
  formatCitation,
  formatEmbedCredit,
  PUBLIC_DOMAIN_FEDERAL,
  type DataSource,
  type EmbedSource,
} from "./sources";

// Fixture builders keep behavior tests independent of registry contents.

function makeDataSource(overrides: Partial<DataSource> = {}): DataSource {
  return {
    id: "fixture-source",
    label: "VERIFIED",
    tier: "primary-federal",
    provider: "U.S. Census Bureau",
    title: "American Community Survey 5-Year Estimates",
    shortTitle: "ACS 5-Year",
    datasetId: "B27010",
    datasetLabel: "Table B27010",
    vintage: "2023",
    url: "https://data.census.gov/table/ACSDT5Y2023.B27010",
    license: PUBLIC_DOMAIN_FEDERAL,
    accessedAt: "2026-06-08",
    lastVerifiedAt: "2026-06-08",
    ...overrides,
  };
}

function makeEmbedSource(overrides: Partial<EmbedSource> = {}): EmbedSource {
  return {
    id: "fixture-embed",
    kind: "chart",
    provider: "AccessMI",
    title: "County health coverage by type",
    originalUrl: "https://accessmi.org/methodology#coverage",
    authoredByAccessMI: true,
    dataSourceIds: ["acs-b27010"],
    license: PUBLIC_DOMAIN_FEDERAL,
    lastVerifiedAt: "2026-06-08",
    ...overrides,
  };
}

describe("registry integrity", () => {
  it("validateRegistry returns no issues", () => {
    expect(validateRegistry()).toEqual([]);
  });
});

describe("validateDataSource", () => {
  it("passes a valid VERIFIED federal source", () => {
    expect(validateDataSource(makeDataSource())).toEqual([]);
  });

  it("flags VERIFIED that is not primary-federal", () => {
    const issues = validateDataSource(makeDataSource({ tier: "secondary" }));
    expect(issues).toContain(
      "fixture-source: VERIFIED requires a primary-federal tier",
    );
  });

  it("flags VERIFIED with no datasetId", () => {
    const issues = validateDataSource(makeDataSource({ datasetId: undefined }));
    expect(issues).toContain("fixture-source: VERIFIED requires a datasetId");
  });

  it("flags MODELED with no methodologyUrl", () => {
    const issues = validateDataSource(
      makeDataSource({
        label: "MODELED",
        tier: "derived",
        datasetId: undefined,
      }),
    );
    expect(issues).toContain(
      "fixture-source: MODELED requires a methodologyUrl",
    );
  });

  it("passes MODELED when a methodologyUrl is present", () => {
    const issues = validateDataSource(
      makeDataSource({
        label: "MODELED",
        tier: "derived",
        datasetId: undefined,
        methodologyUrl: "https://accessmi.org/methodology#composite",
      }),
    );
    expect(issues).toEqual([]);
  });

  it("flags a missing url", () => {
    const issues = validateDataSource(makeDataSource({ url: "" }));
    expect(issues).toContain("fixture-source: missing url");
  });
});

describe("validateEmbedSource", () => {
  it("passes an authored embed with a resolvable data source", () => {
    expect(validateEmbedSource(makeEmbedSource())).toEqual([]);
  });

  it("flags a third-party embed with no originalUrl", () => {
    const issues = validateEmbedSource(
      makeEmbedSource({ authoredByAccessMI: false, originalUrl: "" }),
    );
    expect(issues).toContain(
      "fixture-embed: third-party embed requires an originalUrl",
    );
  });

  it("flags a reference to an unknown data source", () => {
    const issues = validateEmbedSource(
      makeEmbedSource({ dataSourceIds: ["does-not-exist"] }),
    );
    expect(issues).toContain(
      "fixture-embed: references unknown data source does-not-exist",
    );
  });
});

describe("formatCitation", () => {
  it("produces the agreed citation string", () => {
    expect(formatCitation(makeDataSource())).toBe(
      "[VERIFIED] U.S. Census Bureau, ACS 5-Year, Table B27010, 2023. Accessed 2026-06-08.",
    );
  });
});

describe("formatEmbedCredit", () => {
  it("credits the data and AccessMI for an authored chart", () => {
    expect(formatEmbedCredit(makeEmbedSource())).toBe(
      "Data: U.S. Census Bureau. Chart: AccessMI.",
    );
  });

  it("credits the provider and title for a third-party embed", () => {
    const credit = formatEmbedCredit(
      makeEmbedSource({
        authoredByAccessMI: false,
        provider: "CDC",
        title: "PLACES county map",
      }),
    );
    expect(credit).toBe("Source: CDC - PLACES county map");
  });
});
