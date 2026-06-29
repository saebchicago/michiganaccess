/**
 * Power BI-friendly cohort export (UC8 Phase 2).
 * JSON package with table schema metadata for Power Query import.
 */

import {
  TABLEAU_COHORT_COLUMNS,
  type TableauCohortExportInput,
} from "@/utils/exportCohortTableau";
import type { ZipCohortProfile } from "@/utils/cohortFilter";

export interface PowerBiCohortPackage {
  schemaVersion: "accessmi-powerbi-cohort-v1";
  exportedAt: string;
  cohortName: string;
  criteria: TableauCohortExportInput["criteria"];
  resultCount: number;
  methodologyUrl: string;
  sourcesUrl: string;
  tables: {
    name: "CohortZips";
    columns: typeof TABLEAU_COHORT_COLUMNS;
    rows: Record<string, string | number | null>[];
  }[];
}

function rowObject(
  profile: ZipCohortProfile,
  meta: { name: string; exportedAt: string },
): Record<string, string | number | null> {
  const m = profile.metrics;
  return {
    zip: profile.zip,
    city: profile.city,
    county: profile.county,
    ej_index: m.ej_index.value,
    ej_index_integrity: m.ej_index.integrityLabel,
    ej_index_source: m.ej_index.source,
    ej_index_vintage: m.ej_index.vintage,
    pm25_percentile: m.pm25_percentile.value,
    pm25_percentile_integrity: m.pm25_percentile.integrityLabel,
    pm25_percentile_source: m.pm25_percentile.source,
    pm25_percentile_vintage: m.pm25_percentile.vintage,
    energy_burden_pct: m.energy_burden_pct.value,
    energy_burden_pct_integrity: m.energy_burden_pct.integrityLabel,
    energy_burden_pct_source: m.energy_burden_pct.source,
    energy_burden_pct_vintage: m.energy_burden_pct.vintage,
    uninsured_rate: m.uninsured_rate.value,
    uninsured_rate_integrity: m.uninsured_rate.integrityLabel,
    uninsured_rate_source: m.uninsured_rate.source,
    uninsured_rate_vintage: m.uninsured_rate.vintage,
    pcp_ratio: m.pcp_ratio.value,
    pcp_ratio_integrity: m.pcp_ratio.integrityLabel,
    pcp_ratio_source: m.pcp_ratio.source,
    pcp_ratio_vintage: m.pcp_ratio.vintage,
    poverty_rate: m.poverty_rate.value,
    poverty_rate_integrity: m.poverty_rate.integrityLabel,
    poverty_rate_source: m.poverty_rate.source,
    poverty_rate_vintage: m.poverty_rate.vintage,
    cohort_name: meta.name,
    exported_at: meta.exportedAt,
  };
}

export function buildPowerBiCohortPackage(
  input: TableauCohortExportInput,
): PowerBiCohortPackage {
  const exportedAt = input.exportedAt ?? new Date().toISOString();
  const name = input.name?.trim() || "AccessMI Cohort";

  return {
    schemaVersion: "accessmi-powerbi-cohort-v1",
    exportedAt,
    cohortName: name,
    criteria: input.criteria,
    resultCount: input.results.length,
    methodologyUrl: "https://accessmi.org/methodology",
    sourcesUrl: "https://accessmi.org/data-sources",
    tables: [
      {
        name: "CohortZips",
        columns: TABLEAU_COHORT_COLUMNS,
        rows: input.results.map((r) => rowObject(r, { name, exportedAt })),
      },
    ],
  };
}

export function downloadPowerBiCohortPackage(input: TableauCohortExportInput): void {
  const payload = buildPowerBiCohortPackage(input);
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `accessmi-cohort-powerbi-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}