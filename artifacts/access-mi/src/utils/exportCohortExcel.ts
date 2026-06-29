/**
 * Excel-friendly cohort export (UC8 Phase 2).
 * UTF-8 BOM CSV opens cleanly in Excel with numeric columns preserved.
 */

import { buildTableauCohortCsv, type TableauCohortExportInput } from "@/utils/exportCohortTableau";

const EXCEL_BOM = "\uFEFF";

export function buildExcelCohortCsv(input: TableauCohortExportInput): string {
  return EXCEL_BOM + buildTableauCohortCsv(input);
}

export function downloadExcelCohortCsv(input: TableauCohortExportInput): void {
  const csv = buildExcelCohortCsv(input);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `accessmi-cohort-excel-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}