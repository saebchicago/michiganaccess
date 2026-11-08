// Client-side CSV export utility for coverage-at-risk data tables.
// Each export includes metadata header rows so the file is self-documenting.

type CellValue = string | number | null | undefined;

interface CsvRow {
  [key: string]: CellValue;
}

export function escapeCsv(v: CellValue): string {
  const s = v == null ? "" : String(v);
  return s.includes(",") || s.includes('"') || s.includes("\n")
    ? `"${s.replace(/"/g, '""')}"`
    : s;
}

export function buildCsv(
  headers: string[],
  rows: CsvRow[],
  metaLines: string[],
): string {
  const lines: string[] = [
    ...metaLines.map((m) => `# ${m}`),
    headers.join(","),
    ...rows.map((row) => headers.map((h) => escapeCsv(row[h])).join(",")),
  ];
  return lines.join("\n");
}

export function triggerDownload(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportMedicaidCoverageAtRiskCsv(
  entries: Array<{
    county: string;
    fips: string;
    acsAdultMedicaid: number;
    acsAdultMedicaidMoe: number;
    projectedLossLow: number;
    projectedLossHigh: number;
    methodVersion?: string;
  }>,
): void {
  const date = new Date().toISOString().slice(0, 10);
  const total = entries.reduce((s, e) => s + e.acsAdultMedicaid, 0);
  const meta = [
    `accessmi.org - Michigan Medicaid Coverage at Risk (method ${entries[0]?.methodVersion ?? "2.0"})`,
    `Generated: ${date}`,
    `Scenario: Urban Institute Michigan 2028 reduction in Medicaid expansion enrollment (171,000-355,000), work requirements and six-month redeterminations combined. Low/high are mitigation scenarios, not a confidence interval.`,
    `County allocation basis: ACS 2024 5-year C27007_007E + C27007_017E (adults 19-64 with Medicaid/means-tested coverage). Statewide basis: ${total.toLocaleString()}. Proxy for Healthy Michigan Plan enrollment, not administrative HMP counts.`,
    `Correction 2026-11-08: county ranges published before this date used an invalid basis (C27007_003E + C27007_012E, population totals). Discard earlier exports.`,
    `Methodology: https://accessmi.org/methodology/medicaid-coverage-at-risk`,
    `IMPORTANT: Modeled ranges, not point estimates. Exposure is not disenrollment.`,
  ];
  const headers = [
    "county",
    "fips",
    "acs_adults_19_64_with_medicaid_2024",
    "acs_moe_90",
    "projected_loss_low",
    "projected_loss_high",
  ];
  const rows = entries.map((e) => ({
    county: e.county,
    fips: e.fips,
    acs_adults_19_64_with_medicaid_2024: e.acsAdultMedicaid,
    acs_moe_90: e.acsAdultMedicaidMoe,
    projected_loss_low: e.projectedLossLow,
    projected_loss_high: e.projectedLossHigh,
  }));
  triggerDownload(
    buildCsv(headers, rows, meta),
    `michigan-medicaid-coverage-at-risk-${date}.csv`,
  );
}

export function exportDualEligibleExposureCsv(
  entries: Array<{
    county: string;
    fips: string;
    acsDualEstimate: number;
    allocatedLow: number;
    allocatedHigh: number;
  }>,
): void {
  const date = new Date().toISOString().slice(0, 10);
  const meta = [
    `accessmi.org - Michigan Dual-Eligible Exposure Map`,
    `Generated: ${date}`,
    `Framing: "Two programs, shared geography" - descriptive intersection, not a coverage-loss claim`,
    `Dual-eligible residents are exempt from P.L. 119-21 work requirements (§71119 applies to expansion enrollees only)`,
    `State range: ~335,000–405,000 Michigan dual-eligible residents (MACPAC CY2022 / KFF 2024–2025)`,
    `County allocation: ACS B27010 5-year 2023 county shares × statewide range endpoints`,
    `ACS denominator: 216,635 (sum of B27010_046E + B27010_062E for all 83 Michigan counties)`,
    `Methodology: https://accessmi.org/methodology/dual-eligible-exposure`,
    `IMPORTANT: ACS values are survey estimates with margins of error. Small-county figures have high relative MoE.`,
  ];
  const headers = [
    "county",
    "fips",
    "acs_dual_estimate_b27010_2023",
    "allocated_low",
    "allocated_high",
  ];
  const rows = entries.map((e) => ({
    county: e.county,
    fips: e.fips,
    acs_dual_estimate_b27010_2023: e.acsDualEstimate,
    allocated_low: e.allocatedLow,
    allocated_high: e.allocatedHigh,
  }));
  triggerDownload(
    buildCsv(headers, rows, meta),
    `michigan-dual-eligible-exposure-${date}.csv`,
  );
}

export function exportSnapCoverageAtRiskCsv(
  entries: Array<{
    county: string;
    fips: string;
    currentSnapEnrollment: number;
    projectedAffectedLow: number;
    projectedAffectedHigh: number;
  }>,
): void {
  const date = new Date().toISOString().slice(0, 10);
  const meta = [
    `accessmi.org - Michigan SNAP Coverage at Risk`,
    `Generated: ${date}`,
    `Source: MLPP Michigan estimate (74,000) × USDA FNA (formerly FNS) FY2022 county enrollment share`,
    `Uncertainty band: ±40% (GAO-19-56 historical range). Low = midpoint × 0.60, High = midpoint × 1.40.`,
    `Methodology: https://accessmi.org/methodology/snap-coverage-at-risk`,
    `IMPORTANT: These are modeled ranges, not point estimates. Exposure does not equal loss.`,
  ];
  const headers = [
    "county",
    "fips",
    "snap_enrollment_fy2022",
    "projected_affected_low",
    "projected_affected_high",
  ];
  const rows = entries.map((e) => ({
    county: e.county,
    fips: e.fips,
    snap_enrollment_fy2022: e.currentSnapEnrollment,
    projected_affected_low: e.projectedAffectedLow,
    projected_affected_high: e.projectedAffectedHigh,
  }));
  triggerDownload(
    buildCsv(headers, rows, meta),
    `michigan-snap-coverage-at-risk-${date}.csv`,
  );
}
