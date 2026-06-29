/**
 * CHNA-aligned service area data pack export (UC4 Phase 1 hardening).
 * Packaged CSV with provenance header for analyst and CHNA workflows.
 */

import { ZIP_TO_COUNTY } from "@/data/michiganZips";
import { ZIP_QUICKSTATS } from "@/data/zip-quickstats";
import { IRS_ZIP_DATA } from "@/data/irs-zip-income";
import { MICHIGAN_GEOCARE } from "@/data/geocare";
import { buildZipCohortProfile } from "@/utils/cohortFilter";

export interface ServiceAreaDataPackInput {
  zips: string[];
  label?: string;
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

export function buildServiceAreaDataPackCsv(input: ServiceAreaDataPackInput): string {
  const exportedAt = input.exportedAt ?? new Date().toISOString();
  const label = input.label?.trim() || "Custom service area";
  const zips = [...new Set(input.zips)].sort();

  const counties = Array.from(
    new Set(zips.map((z) => ZIP_TO_COUNTY[z]?.county).filter(Boolean) as string[]),
  ).sort();

  const headers = [
    "ZIP",
    "City",
    "County",
    "Population",
    "Median_Income",
    "EITC_Pct",
    "FQHC_Penetration_Pct",
    "FQHC_Unserved_Low_Income",
    "EJ_Index",
    "EJ_Index_Integrity",
    "PM25_Percentile",
    "Energy_Burden_Pct",
    "Uninsured_Rate_Pct",
    "Poverty_Rate_Pct",
    "Pack_Label",
    "Exported_At",
  ];

  const commentLines = [
    "# AccessMI Service Area Data Pack",
    `# Exported: ${exportedAt}`,
    `# Label: ${label}`,
    `# ZIP count: ${zips.length}`,
    `# Counties: ${counties.join("|") || "none"}`,
    "# Methodology: https://accessmi.org/methodology",
    "# CHNA Explorer: https://accessmi.org/chna-explorer",
    "# Schema version: accessmi-service-area-pack-v1",
    "#",
  ];

  const rows = zips.map((zip) => {
    const lookup = ZIP_TO_COUNTY[zip];
    const qs = ZIP_QUICKSTATS[zip];
    const irs = IRS_ZIP_DATA[zip];
    const gc = MICHIGAN_GEOCARE[zip];
    const cohort = buildZipCohortProfile(zip);

    return [
      zip,
      lookup?.city ?? "",
      lookup?.county ?? "",
      qs?.population ?? "",
      qs?.medianIncome ?? "",
      irs?.eitcPct ?? "",
      gc && !gc.is_suppressed ? Math.round(gc.hcp_penetration_rate * 100) : "",
      gc && !gc.is_suppressed ? gc.unserved_low_income : "",
      cohort?.metrics.ej_index.value ?? "",
      cohort?.metrics.ej_index.integrityLabel ?? "",
      cohort?.metrics.pm25_percentile.value ?? "",
      cohort?.metrics.energy_burden_pct.value ?? "",
      cohort?.metrics.uninsured_rate.value ?? "",
      cohort?.metrics.poverty_rate.value ?? "",
      label,
      exportedAt,
    ].map(csvEscape);
  });

  return [...commentLines, headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

export function downloadServiceAreaDataPack(input: ServiceAreaDataPackInput): void {
  const csv = buildServiceAreaDataPackCsv(input);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `accessmi-service-area-pack-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}