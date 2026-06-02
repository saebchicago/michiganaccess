import type { CHNADomain, CHNAPriority, CHNASystem } from "@/types/chna";
import {
  CHNA_DRIVERS,
  CHNA_METRICS,
  PRIORITY_DRIVER_MAP,
} from "@/data/chnaSeed";

const DOMAIN_LABELS: Record<CHNADomain, string> = {
  workforce: "Workforce and Economic Stability",
  air: "Air Quality",
  water: "Water Quality",
  access: "Healthcare Access",
};

function geoLabel(geography: string, note?: string | null): string {
  if (note) return note;
  const map: Record<string, string> = {
    state: "Michigan",
    county: "County",
    city: "City",
    tract: "Census Tract",
  };
  return map[geography] ?? geography;
}

export function generateCHNABriefText(
  priority: CHNAPriority,
  system: CHNASystem,
): string {
  const date = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const domains = PRIORITY_DRIVER_MAP[priority.id] ?? [];
  const scope =
    priority.scope === "enterprise"
      ? "Enterprise priority"
      : `Hospital-specific: ${priority.hospitals?.join(", ")}`;

  const lines: string[] = [
    "CHNA Explorer — Access Michigan (accessmi.org)",
    `${system.label} · Community Health Needs Assessment ${system.vintage}`,
    `Generated ${date}`,
    "",
    `Priority: ${priority.label} (${scope})`,
    `Service area: ${system.counties.join(", ")} counties${system.cities ? `; ${system.cities.join(", ")}` : ""}`,
    "",
  ];

  for (const domain of domains) {
    const driver = CHNA_DRIVERS.find((d) => d.domain === domain);
    if (!driver) continue;
    const metrics = CHNA_METRICS.filter(
      (m) => m.priorityId === priority.id && m.driverId === driver.id,
    );
    if (metrics.length === 0) continue;

    lines.push(DOMAIN_LABELS[domain].toUpperCase());
    for (const m of metrics) {
      const geo = geoLabel(m.geography, m.note ?? null);
      const val =
        typeof m.value === "number" ? m.value.toLocaleString() : m.value;
      lines.push(
        `  ${m.label}: ${val}${m.unit} [${geo}] (${m.source}, ${m.vintage}, ${m.integrityLabel})`,
      );
    }
    lines.push("");
  }

  lines.push(
    "Data integrity:",
    "  VERIFIED = directly measured from a primary federal or state source",
    "  MODELED = derived from verified inputs via an EPA or FEMA analytical model",
    "  PROJECTED = forward-looking estimate",
    "",
    `Source: ${system.label} CHNA (${system.vintage}), citing BRFSS, MDHHS, CDC, MDEQ.`,
    "Powered by Access Michigan — accessmi.org",
  );

  return lines.join("\n");
}

export async function generateCHNABriefPDF(
  priority: CHNAPriority,
  system: CHNASystem,
): Promise<void> {
  const { default: jsPDF } = await import("jspdf");

  const PAGE_W = 216;
  const MARGIN = 14;
  const COL_W = PAGE_W - MARGIN * 2;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "letter",
  });

  // Header band
  doc.setFillColor(10, 76, 149);
  doc.rect(0, 0, PAGE_W, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text("CHNA Priority Brief", MARGIN, 13);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`${system.label} · ${system.vintage} CHNA`, MARGIN, 21);
  doc.text(
    new Date().toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    }),
    PAGE_W - MARGIN,
    21,
    { align: "right" },
  );
  doc.text("accessmi.org", PAGE_W - MARGIN, 26, { align: "right" });

  // Priority heading
  let y = 38;
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(`Priority: ${priority.label}`, MARGIN, y);
  y += 6;
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  const scopeStr =
    priority.scope === "enterprise"
      ? "Enterprise priority"
      : `Hospital-specific: ${priority.hospitals?.join(", ")}`;
  doc.text(
    `${scopeStr} · Service area: ${system.counties.join(", ")} counties`,
    MARGIN,
    y,
  );
  y += 9;

  const domains = PRIORITY_DRIVER_MAP[priority.id] ?? [];

  for (const domain of domains) {
    const driver = CHNA_DRIVERS.find((d) => d.domain === domain);
    if (!driver) continue;
    const metrics = CHNA_METRICS.filter(
      (m) => m.priorityId === priority.id && m.driverId === driver.id,
    );
    if (metrics.length === 0) continue;

    if (y > 255) {
      doc.addPage();
      y = 20;
    }

    // Domain header
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(10, 76, 149);
    doc.text(DOMAIN_LABELS[domain].toUpperCase(), MARGIN, y);
    y += 1.5;
    doc.setDrawColor(10, 76, 149);
    doc.setLineWidth(0.25);
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
    y += 5;

    doc.setTextColor(30, 30, 30);
    for (const m of metrics) {
      if (y > 262) {
        doc.addPage();
        y = 20;
      }
      const geo = geoLabel(m.geography, m.note ?? null);
      const val =
        typeof m.value === "number" ? m.value.toLocaleString() : m.value;
      doc.setFontSize(9.5);
      doc.setFont("helvetica", "normal");
      doc.text(`${m.label}: ${val}${m.unit} [${geo}]`, MARGIN + 2, y);
      y += 4.5;
      doc.setFontSize(7.5);
      doc.setTextColor(120, 120, 120);
      doc.text(
        `${m.source}  ·  ${m.vintage}  ·  ${m.integrityLabel}`,
        MARGIN + 4,
        y,
      );
      doc.setTextColor(30, 30, 30);
      y += 5.5;
    }
    y += 2;
  }

  // Footer
  if (y > 252) {
    doc.addPage();
    y = 20;
  }
  y += 3;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.25);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 5;
  doc.setFontSize(7.5);
  doc.setTextColor(120, 120, 120);
  const footerLines = [
    "Data integrity: VERIFIED = directly measured from a primary federal or state source. MODELED = derived from verified inputs via an EPA or FEMA analytical model.",
    `Source: ${system.label} CHNA (${system.vintage}), citing BRFSS, MDHHS, CDC, MDEQ as primary sources.`,
    "This document is for informational purposes only. Powered by Access Michigan (accessmi.org).",
  ];
  for (const fl of footerLines) {
    const wrapped = doc.splitTextToSize(fl, COL_W) as string[];
    doc.text(wrapped, MARGIN, y);
    y += wrapped.length * 4;
  }

  doc.save(`chna-brief-${priority.id}-${system.vintage}.pdf`);
}
