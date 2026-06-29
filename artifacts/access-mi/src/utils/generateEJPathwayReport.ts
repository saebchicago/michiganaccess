/**
 * Environmental justice pathway narrative export (UC1 Phase 2).
 * PDF and Word-compatible HTML with embedded source audit trail.
 */

import {
  CAUSAL_PATHWAYS,
  getPathwayById,
  type CausalPathway,
} from "@/data/causalPathways";
import { MICHIGAN_EJSCREEN, EPA_EJSCREEN_SOURCE } from "@/data/ejscreen";

const EJSCREEN_ZCTA_COUNT = Object.keys(MICHIGAN_EJSCREEN).length;

function formatDate(): string {
  return new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function generateEJPathwayReportText(
  pathways: CausalPathway[] = CAUSAL_PATHWAYS,
): string {
  const lines: string[] = [
    "Environmental Justice Pathways Report",
    "Access Michigan (accessmi.org)",
    `Generated ${formatDate()}`,
    "",
    "Independence notice: AccessMI is an independent civic data platform.",
    "Pathways use associative or evidence-backed language per editorial standards.",
    "",
    `EJScreen coverage: ${EJSCREEN_ZCTA_COUNT} Michigan ZCTAs with direct EPA EJScreen data (${EPA_EJSCREEN_SOURCE}).`,
    "Statewide tract ingest is in progress.",
    "",
  ];

  for (const pathway of pathways) {
    lines.push("=".repeat(72));
    lines.push(pathway.title.toUpperCase());
    lines.push(`Confidence: ${pathway.confidenceScore}%`);
    lines.push(`Language standard: ${pathway.languageStandard}`);
    lines.push(`Last reviewed: ${pathway.lastReviewed}`);
    lines.push("");
    lines.push(pathway.summary);
    lines.push("");
    lines.push(pathway.confidenceRationale);
    lines.push("");
    lines.push("Pathway steps:");
    pathway.steps.forEach((step, i) => {
      lines.push(`  ${i + 1}. ${step.label} [${step.integrityLabel}]`);
      lines.push(`     ${step.description}`);
      for (const src of step.sources) {
        lines.push(`     Source: ${src.name} (${src.vintage}) - ${src.url}`);
      }
      lines.push("");
    });
    lines.push("Related tools:");
    for (const r of pathway.relatedRoutes) {
      lines.push(`  - ${r.label}: https://accessmi.org${r.href}`);
    }
    lines.push("");
  }

  lines.push("=".repeat(72));
  lines.push("Methodology and integrity labels:");
  lines.push("  VERIFIED = measured from a primary federal or state source");
  lines.push("  MODELED = derived from verified inputs at county or ZIP level");
  lines.push("  PROJECTED = forward-looking estimate");
  lines.push("");
  lines.push("Full source ledger: https://accessmi.org/data-sources");
  lines.push("Methodology: https://accessmi.org/methodology");
  lines.push("");
  lines.push("Powered by Access Michigan - accessmi.org");

  return lines.join("\n");
}

export async function generateEJPathwayReportPDF(
  pathwayId?: string,
): Promise<void> {
  const pathways = pathwayId
    ? [getPathwayById(pathwayId)].filter((p): p is CausalPathway => !!p)
    : CAUSAL_PATHWAYS;

  if (pathways.length === 0) return;

  const { default: jsPDF } = await import("jspdf");
  const PAGE_W = 216;
  const MARGIN = 14;
  const COL_W = PAGE_W - MARGIN * 2;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" });

  doc.setFillColor(6, 78, 59);
  doc.rect(0, 0, PAGE_W, 30, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Environmental Justice Pathways", MARGIN, 12);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Access Michigan - accessmi.org", MARGIN, 20);
  doc.text(formatDate(), PAGE_W - MARGIN, 20, { align: "right" });
  doc.text("Verified sources and audit trail included", MARGIN, 26);

  let y = 40;
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(8);
  const coverageNote = `EJScreen coverage: ${EJSCREEN_ZCTA_COUNT} sample Michigan ZCTAs (${EPA_EJSCREEN_SOURCE}). County-level layers use labeled modeled allocation where noted.`;
  const coverageWrapped = doc.splitTextToSize(coverageNote, COL_W) as string[];
  doc.text(coverageWrapped, MARGIN, y);
  y += coverageWrapped.length * 4 + 6;

  for (const pathway of pathways) {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(6, 78, 59);
    doc.text(pathway.title, MARGIN, y);
    y += 6;

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text(
      `Confidence ${pathway.confidenceScore}% · ${pathway.languageStandard} · Reviewed ${pathway.lastReviewed}`,
      MARGIN,
      y,
    );
    y += 5;

    doc.setTextColor(40, 40, 40);
    const summaryWrapped = doc.splitTextToSize(pathway.summary, COL_W) as string[];
    doc.text(summaryWrapped, MARGIN, y);
    y += summaryWrapped.length * 4 + 4;

    for (const [i, step] of pathway.steps.entries()) {
      if (y > 255) {
        doc.addPage();
        y = 20;
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text(`${i + 1}. ${step.label} [${step.integrityLabel}]`, MARGIN, y);
      y += 4.5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      const descWrapped = doc.splitTextToSize(step.description, COL_W - 4) as string[];
      doc.text(descWrapped, MARGIN + 2, y);
      y += descWrapped.length * 3.8;
      doc.setFontSize(7.5);
      doc.setTextColor(110, 110, 110);
      for (const src of step.sources) {
        const srcLine = `${src.name} (${src.vintage}) - ${src.url}`;
        const srcWrapped = doc.splitTextToSize(srcLine, COL_W - 6) as string[];
        doc.text(srcWrapped, MARGIN + 4, y);
        y += srcWrapped.length * 3.5;
      }
      doc.setTextColor(40, 40, 40);
      y += 2;
    }
    y += 4;
  }

  if (y > 250) {
    doc.addPage();
    y = 20;
  }
  doc.setDrawColor(200, 200, 200);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 5;
  doc.setFontSize(7.5);
  doc.setTextColor(100, 100, 100);
  const footer = [
    "Integrity: VERIFIED = primary source. MODELED = county-allocated. Do not infer causation beyond language standard.",
    "Source ledger: accessmi.org/data-sources · Methodology: accessmi.org/methodology",
  ];
  for (const line of footer) {
    const wrapped = doc.splitTextToSize(line, COL_W) as string[];
    doc.text(wrapped, MARGIN, y);
    y += wrapped.length * 3.8;
  }

  const slug = pathwayId ?? "all-pathways";
  doc.save(`ej-pathways-${slug}-${Date.now()}.pdf`);
}

/** Word-compatible export (HTML document Microsoft Word can open). */
export function downloadEJPathwayReportWord(pathwayId?: string): void {
  const pathways = pathwayId
    ? [getPathwayById(pathwayId)].filter((p): p is CausalPathway => !!p)
    : CAUSAL_PATHWAYS;

  const body = pathways
    .map(
      (p) => `
    <h2>${p.title}</h2>
    <p><strong>Confidence:</strong> ${p.confidenceScore}% |
    <strong>Standard:</strong> ${p.languageStandard} |
    <strong>Reviewed:</strong> ${p.lastReviewed}</p>
    <p>${p.summary}</p>
    <p><em>${p.confidenceRationale}</em></p>
    <ol>
      ${p.steps
        .map(
          (s) => `
        <li>
          <strong>${s.label}</strong> [${s.integrityLabel}]<br/>
          ${s.description}<br/>
          <small>${s.sources.map((src) => `${src.name} (${src.vintage}) - <a href="${src.url}">${src.url}</a>`).join("<br/>")}</small>
        </li>`,
        )
        .join("")}
    </ol>`,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head><meta charset="utf-8"><title>EJ Pathways Report</title></head>
<body>
  <h1>Environmental Justice Pathways Report</h1>
  <p>Access Michigan (accessmi.org) - Generated ${formatDate()}</p>
  <p>EJScreen coverage: ${EJSCREEN_ZCTA_COUNT} sample ZCTAs. ${EPA_EJSCREEN_SOURCE}</p>
  ${body}
  <hr/>
  <p><small>VERIFIED = primary source. MODELED = derived allocation. accessmi.org/data-sources</small></p>
</body></html>`;

  const blob = new Blob([html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ej-pathways-${pathwayId ?? "all"}-${Date.now()}.doc`;
  a.click();
  URL.revokeObjectURL(url);
}