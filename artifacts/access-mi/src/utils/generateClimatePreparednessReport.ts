/**
 * Climate preparedness narrative export (UC2 Phase 1).
 */

import {
  CLIMATE_SCENARIOS,
  getClimateScenarioById,
  type ClimateScenarioSeverity,
} from "@/data/climateScenarios";
import {
  projectClimateScenario,
  type CountyClimateProjection,
} from "@/utils/climateScenarioModel";

function formatDate(): string {
  return new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function generateClimatePreparednessReportText(
  scenarioId: string,
  severity: ClimateScenarioSeverity,
  counties?: string[],
  projections: CountyClimateProjection[] = projectClimateScenario(
    scenarioId,
    severity,
    counties,
  ),
): string {
  const scenario = getClimateScenarioById(scenarioId);
  if (!scenario) return "Scenario not found.";

  const lines: string[] = [
    "Climate and Health Vulnerability Preparedness Report",
    "Access Michigan (accessmi.org)",
    `Generated ${formatDate()}`,
    "",
    "Independence notice: AccessMI is an independent civic data platform.",
    "All utilization and vulnerability deltas are PROJECTED with confidence bands.",
    "",
    `Scenario: ${scenario.title}`,
    `Severity: ${severity}`,
    `Duration: ${scenario.durationDays} days`,
    `Confidence band: +/- ${scenario.confidenceBandPct}% on utilization projections`,
    "",
    scenario.summary,
    "",
    scenario.methodologyNote,
    "",
    "Sources:",
    ...scenario.sources.map((s) => `  - ${s.name} (${s.vintage}) - ${s.url}`),
    "",
    `Counties analyzed: ${projections.length}`,
    "",
    "Top projected vulnerability counties:",
  ];

  for (const row of projections.slice(0, 15)) {
    lines.push(
      `  ${row.county}: baseline ${row.baselineVulnerability} -> projected ${row.projectedVulnerability} ` +
        `(ED +${row.edIncreasePct.low}-${row.edIncreasePct.high}% mid ${row.edIncreasePct.mid}% PROJECTED) ` +
        `| facilities ${row.facilityCount} | access gap ${row.accessGapScore}`,
    );
  }

  lines.push("");
  lines.push("Integrity labels:");
  lines.push("  VERIFIED = primary federal or state source");
  lines.push("  MODELED = derived from verified county inputs");
  lines.push("  PROJECTED = scenario-modeled estimate with uncertainty band");
  lines.push("");
  lines.push("Methodology: https://accessmi.org/methodology/environmental");
  lines.push("Powered by Access Michigan - accessmi.org");

  return lines.join("\n");
}

export async function generateClimatePreparednessReportPDF(
  scenarioId: string,
  severity: ClimateScenarioSeverity,
  counties?: string[],
): Promise<void> {
  const scenario = getClimateScenarioById(scenarioId);
  if (!scenario) return;

  const projections = projectClimateScenario(scenarioId, severity, counties);
  const text = generateClimatePreparednessReportText(
    scenarioId,
    severity,
    counties,
    projections,
  );

  const { default: jsPDF } = await import("jspdf");
  const PAGE_W = 216;
  const MARGIN = 14;
  const COL_W = PAGE_W - MARGIN * 2;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" });

  doc.setFillColor(30, 64, 120);
  doc.rect(0, 0, PAGE_W, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Climate Preparedness Report", MARGIN, 11);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Access Michigan - accessmi.org", MARGIN, 18);
  doc.text(formatDate(), PAGE_W - MARGIN, 18, { align: "right" });

  let y = 36;
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(8);
  const chunks = doc.splitTextToSize(text, COL_W) as string[];
  for (const line of chunks) {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, MARGIN, y);
    y += 3.8;
  }

  doc.save(`accessmi-climate-${scenarioId}-${Date.now()}.pdf`);
}