/**
 * Tableau-ready cohort CSV export (UC8 Phase 2).
 * Flat fact table with numeric measures and per-metric provenance columns.
 */

import type { CohortCriteria, ZipCohortProfile } from "@/utils/cohortFilter";

export type TableauColumnType = "dimension" | "measure" | "metadata";

export interface TableauColumnDef {
  key: string;
  label: string;
  type: TableauColumnType;
  description: string;
}

/** Documented schema for Tableau Data Prep / Desktop field mapping. */
export const TABLEAU_COHORT_COLUMNS: TableauColumnDef[] = [
  { key: "zip", label: "ZIP", type: "dimension", description: "5-digit ZIP code" },
  { key: "city", label: "City", type: "dimension", description: "Primary city name" },
  { key: "county", label: "County", type: "dimension", description: "Michigan county" },
  { key: "ej_index", label: "EJ Index", type: "measure", description: "EPA EJScreen composite 0-100" },
  { key: "ej_index_integrity", label: "EJ Index Integrity", type: "metadata", description: "VERIFIED or MODELED" },
  { key: "ej_index_source", label: "EJ Index Source", type: "metadata", description: "Named data source" },
  { key: "ej_index_vintage", label: "EJ Index Vintage", type: "metadata", description: "Data year or N/A" },
  { key: "pm25_percentile", label: "PM2.5 Percentile", type: "measure", description: "EPA national percentile 0-100" },
  { key: "pm25_percentile_integrity", label: "PM2.5 Integrity", type: "metadata", description: "VERIFIED or MODELED" },
  { key: "pm25_percentile_source", label: "PM2.5 Source", type: "metadata", description: "Named data source" },
  { key: "pm25_percentile_vintage", label: "PM2.5 Vintage", type: "metadata", description: "Data year or N/A" },
  { key: "energy_burden_pct", label: "Energy Burden Pct", type: "measure", description: "County ACEEE average %" },
  { key: "energy_burden_pct_integrity", label: "Energy Burden Integrity", type: "metadata", description: "VERIFIED or MODELED" },
  { key: "energy_burden_pct_source", label: "Energy Burden Source", type: "metadata", description: "Named data source" },
  { key: "energy_burden_pct_vintage", label: "Energy Burden Vintage", type: "metadata", description: "Data year" },
  { key: "uninsured_rate", label: "Uninsured Rate Pct", type: "measure", description: "County-allocated %" },
  { key: "uninsured_rate_integrity", label: "Uninsured Integrity", type: "metadata", description: "VERIFIED or MODELED" },
  { key: "uninsured_rate_source", label: "Uninsured Source", type: "metadata", description: "Named data source" },
  { key: "uninsured_rate_vintage", label: "Uninsured Vintage", type: "metadata", description: "Data year" },
  { key: "pcp_ratio", label: "PCP Ratio", type: "measure", description: "Primary care physicians per population" },
  { key: "pcp_ratio_integrity", label: "PCP Ratio Integrity", type: "metadata", description: "VERIFIED or MODELED" },
  { key: "pcp_ratio_source", label: "PCP Ratio Source", type: "metadata", description: "Named data source" },
  { key: "pcp_ratio_vintage", label: "PCP Ratio Vintage", type: "metadata", description: "Data year" },
  { key: "poverty_rate", label: "Poverty Rate Pct", type: "measure", description: "ACS county estimate %" },
  { key: "poverty_rate_integrity", label: "Poverty Integrity", type: "metadata", description: "VERIFIED or MODELED" },
  { key: "poverty_rate_source", label: "Poverty Source", type: "metadata", description: "Named data source" },
  { key: "poverty_rate_vintage", label: "Poverty Vintage", type: "metadata", description: "Data year" },
  { key: "cohort_name", label: "Cohort Name", type: "metadata", description: "Analyst-defined cohort label" },
  { key: "exported_at", label: "Exported At", type: "metadata", description: "ISO-8601 export timestamp" },
];

export interface TableauCohortExportInput {
  name?: string;
  criteria: CohortCriteria;
  results: ZipCohortProfile[];
  exportedAt?: string;
}

function csvEscape(value: string | number | null | undefined): string {
  if (value == null) return "";
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function formatCriteriaLine(criteria: CohortCriteria): string {
  const parts: string[] = [];
  if (criteria.counties?.length) parts.push(`counties=${criteria.counties.join("|")}`);
  if (criteria.minEjIndex != null) parts.push(`min_ej_index=${criteria.minEjIndex}`);
  if (criteria.minPm25Percentile != null)
    parts.push(`min_pm25_percentile=${criteria.minPm25Percentile}`);
  if (criteria.minEnergyBurdenPct != null)
    parts.push(`min_energy_burden_pct=${criteria.minEnergyBurdenPct}`);
  if (criteria.minUninsuredRate != null)
    parts.push(`min_uninsured_rate=${criteria.minUninsuredRate}`);
  if (criteria.minPcpRatio != null) parts.push(`min_pcp_ratio=${criteria.minPcpRatio}`);
  if (criteria.minPovertyRate != null) parts.push(`min_poverty_rate=${criteria.minPovertyRate}`);
  return parts.join("; ") || "none";
}

function rowForProfile(
  profile: ZipCohortProfile,
  meta: { name: string; exportedAt: string },
): string[] {
  const m = profile.metrics;
  return [
    profile.zip,
    profile.city,
    profile.county,
    m.ej_index.value ?? "",
    m.ej_index.integrityLabel,
    m.ej_index.source,
    m.ej_index.vintage,
    m.pm25_percentile.value ?? "",
    m.pm25_percentile.integrityLabel,
    m.pm25_percentile.source,
    m.pm25_percentile.vintage,
    m.energy_burden_pct.value ?? "",
    m.energy_burden_pct.integrityLabel,
    m.energy_burden_pct.source,
    m.energy_burden_pct.vintage,
    m.uninsured_rate.value ?? "",
    m.uninsured_rate.integrityLabel,
    m.uninsured_rate.source,
    m.uninsured_rate.vintage,
    m.pcp_ratio.value ?? "",
    m.pcp_ratio.integrityLabel,
    m.pcp_ratio.source,
    m.pcp_ratio.vintage,
    m.poverty_rate.value ?? "",
    m.poverty_rate.integrityLabel,
    m.poverty_rate.source,
    m.poverty_rate.vintage,
    meta.name,
    meta.exportedAt,
  ].map((v) => csvEscape(v));
}

export function buildTableauCohortCsv(input: TableauCohortExportInput): string {
  const exportedAt = input.exportedAt ?? new Date().toISOString();
  const name = input.name?.trim() || "AccessMI Cohort";
  const headerKeys = TABLEAU_COHORT_COLUMNS.map((c) => c.key);

  const commentLines = [
    "# AccessMI Cohort Export - Tableau Packaged CSV",
    `# Exported: ${exportedAt}`,
    `# Cohort: ${name}`,
    `# ZIP count: ${input.results.length}`,
    `# Filter criteria: ${formatCriteriaLine(input.criteria)}`,
    "# Methodology: https://accessmi.org/methodology",
    "# Data sources: https://accessmi.org/data-sources",
    "# Schema version: accessmi-tableau-cohort-v1",
    "#",
    "# Column guide (type = dimension | measure | metadata):",
    ...TABLEAU_COHORT_COLUMNS.map(
      (c) => `#   ${c.key} (${c.type}) - ${c.description}`,
    ),
    "#",
  ];

  const headerRow = headerKeys.join(",");
  const dataRows = input.results.map((r) =>
    rowForProfile(r, { name, exportedAt }).join(","),
  );

  return [...commentLines, headerRow, ...dataRows].join("\n");
}

export function downloadTableauCohortCsv(input: TableauCohortExportInput): void {
  const csv = buildTableauCohortCsv(input);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `accessmi-cohort-tableau-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}