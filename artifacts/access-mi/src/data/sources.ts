// src/data/sources.ts
//
// Single source of truth for data provenance and embed attribution.
// Every factual claim and every embed references an entry here by id.
// Citation strings are never hardcoded in components. They are derived
// from this registry so attribution stays consistent across all 83
// counties and every tool.
//
// Hard rule: a claim whose source fails validateDataSource() does not ship.

export type ClaimLabel = "VERIFIED" | "MODELED" | "PROJECTED";

export type SourceTier =
  | "primary-federal"
  | "primary-state"
  | "secondary"
  | "derived";

export interface License {
  name: string; // e.g. 'Public Domain (17 U.S.C. 105)', 'CC BY 4.0'
  url?: string;
  attributionRequired: boolean;
}

export interface DataSource {
  id: string; // stable key, e.g. 'acs-b27010'
  label: ClaimLabel; // default label for claims citing this source
  tier: SourceTier;
  provider: string; // 'U.S. Census Bureau'
  title: string; // full title
  shortTitle?: string; // used in the citation string, e.g. 'ACS 5-Year'
  datasetId?: string; // machine key, e.g. 'B27010'
  datasetLabel?: string; // display, e.g. 'Table B27010'
  vintage: string; // '2023' or '2019-2023'
  url: string; // canonical link to the table or series
  license: License;
  accessedAt: string; // ISO date the data was pulled
  lastVerifiedAt: string; // ISO date a human last confirmed it
  methodologyUrl?: string; // required for MODELED and PROJECTED
  notes?: string;
}

export interface EmbedSource {
  id: string;
  kind: "iframe" | "widget" | "chart" | "image";
  provider: string;
  title: string;
  originalUrl: string; // link to the original work
  embedUrl?: string; // the src actually rendered, if different
  authoredByAccessMI: boolean; // true means credit the data, not the embed
  dataSourceIds: string[]; // ids in DATA_SOURCES that back this embed
  license: License;
  lastVerifiedAt: string;
  notes?: string;
}

// Common license presets to reduce repetition and typos.

export const PUBLIC_DOMAIN_FEDERAL: License = {
  name: "Public Domain (17 U.S.C. 105)",
  attributionRequired: false, // not legally required; we attribute for trust
};

export const CC_BY_4: License = {
  name: "CC BY 4.0",
  url: "https://creativecommons.org/licenses/by/4.0/",
  attributionRequired: true,
};

// Registry. Keyed by id for O(1) lookup and referential checks.
// ILLUSTRATIVE entries below show the shape. Verify and replace before ship.

export const DATA_SOURCES: Record<string, DataSource> = {
  // ILLUSTRATIVE - verify and replace before ship
  "acs-b27010": {
    id: "acs-b27010",
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
  },
  // ILLUSTRATIVE - verify and replace before ship
  "cdc-places-access": {
    id: "cdc-places-access",
    label: "VERIFIED",
    tier: "primary-federal",
    provider: "Centers for Disease Control and Prevention",
    title: "PLACES: Local Data for Better Health, County Data",
    shortTitle: "CDC PLACES",
    datasetId: "ACCESS2",
    datasetLabel: "Measure ACCESS2",
    vintage: "2024",
    url: "https://www.cdc.gov/places/",
    license: PUBLIC_DOMAIN_FEDERAL,
    accessedAt: "2026-06-08",
    lastVerifiedAt: "2026-06-08",
  },
};

export const EMBED_SOURCES: Record<string, EmbedSource> = {
  // ILLUSTRATIVE - verify and replace before ship
  "acs-coverage-chart": {
    id: "acs-coverage-chart",
    kind: "chart",
    provider: "AccessMI",
    title: "County health coverage by type",
    originalUrl: "https://accessmi.org/methodology#coverage",
    authoredByAccessMI: true,
    dataSourceIds: ["acs-b27010"],
    license: PUBLIC_DOMAIN_FEDERAL,
    lastVerifiedAt: "2026-06-08",
  },
};

// Derivation. Produces the agreed citation string from a source.
// Example output:
// [VERIFIED] U.S. Census Bureau, ACS 5-Year, Table B27010, 2023. Accessed 2026-06-08.

export function formatCitation(source: DataSource): string {
  const head = `[${source.label}]`;
  const parts = [source.provider, source.shortTitle ?? source.title];
  if (source.datasetLabel) {
    parts.push(source.datasetLabel);
  }
  parts.push(source.vintage);
  return `${head} ${parts.join(", ")}. Accessed ${source.accessedAt}.`;
}

// Produces the visible embed credit line.
// Example: Source: CDC PLACES - County health coverage by type

export function formatEmbedCredit(embed: EmbedSource): string {
  if (embed.authoredByAccessMI) {
    const dataProviders = embed.dataSourceIds
      .map((id) => DATA_SOURCES[id]?.provider)
      .filter(Boolean)
      .join(", ");
    return `Data: ${dataProviders || "unknown"}. Chart: AccessMI.`;
  }
  return `Source: ${embed.provider} - ${embed.title}`;
}

// Lookups.

export function getDataSource(id: string): DataSource | undefined {
  return DATA_SOURCES[id];
}

export function getEmbedSource(id: string): EmbedSource | undefined {
  return EMBED_SOURCES[id];
}

// Validation. Returns a list of violations. Empty means it ships.
// Assert empty in the test suite (npm test) to enforce the accuracy rules.
//
// Note on the VERIFIED tier check: project rule requires a primary federal
// source for every stat, so VERIFIED is restricted to primary-federal here.
// If primary-state sources are later accepted as VERIFIED, relax this one line.

export function validateDataSource(source: DataSource): string[] {
  const issues: string[] = [];

  if (!source.url) {
    issues.push(`${source.id}: missing url`);
  }
  if (!source.accessedAt) {
    issues.push(`${source.id}: missing accessedAt`);
  }
  if (!source.lastVerifiedAt) {
    issues.push(`${source.id}: missing lastVerifiedAt`);
  }
  if (!source.license || !source.license.name) {
    issues.push(`${source.id}: missing license`);
  }

  if (source.label === "VERIFIED") {
    if (source.tier !== "primary-federal") {
      issues.push(`${source.id}: VERIFIED requires a primary-federal tier`);
    }
    if (!source.datasetId) {
      issues.push(`${source.id}: VERIFIED requires a datasetId`);
    }
  }

  if (source.label === "MODELED" || source.label === "PROJECTED") {
    if (!source.methodologyUrl) {
      issues.push(`${source.id}: ${source.label} requires a methodologyUrl`);
    }
  }

  return issues;
}

export function validateEmbedSource(embed: EmbedSource): string[] {
  const issues: string[] = [];

  if (!embed.provider) {
    issues.push(`${embed.id}: missing provider`);
  }
  if (!embed.license || !embed.license.name) {
    issues.push(`${embed.id}: missing license`);
  }
  if (!embed.authoredByAccessMI && !embed.originalUrl) {
    issues.push(`${embed.id}: third-party embed requires an originalUrl`);
  }
  for (const id of embed.dataSourceIds) {
    if (!DATA_SOURCES[id]) {
      issues.push(`${embed.id}: references unknown data source ${id}`);
    }
  }

  return issues;
}

// Whole-registry check for referential integrity. Run in tests.

export function validateRegistry(): string[] {
  const issues: string[] = [];
  for (const source of Object.values(DATA_SOURCES)) {
    issues.push(...validateDataSource(source));
  }
  for (const embed of Object.values(EMBED_SOURCES)) {
    issues.push(...validateEmbedSource(embed));
  }
  return issues;
}
