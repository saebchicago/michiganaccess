// Citation-grade county brief PDF
// Uses jsPDF (already bundled). Dynamic import so the heavy chunk only loads on demand.

export interface BriefStat {
  label: string;
  value: string;
  source: string;
  vintage: string;
  badge: "VERIFIED" | "MODELED" | "PROJECTED" | "no data";
}

export interface BriefPDFInput {
  countyName: string;
  countySlug: string;
  stats: BriefStat[];
  citeText: string;
  retrievedDate: string;
}

export async function generateBriefPDF(input: BriefPDFInput): Promise<void> {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "letter",
  });

  const BLUE = [10, 76, 149] as const;
  const TEAL = [0, 163, 161] as const;
  const GREY = [120, 120, 120] as const;
  const DARK = [30, 30, 30] as const;
  const WHITE = [255, 255, 255] as const;
  const LIGHT = [248, 249, 250] as const;

  // ── Header bar ──
  doc.setFillColor(...BLUE);
  doc.rect(0, 0, 216, 28, "F");
  doc.setTextColor(...WHITE);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(`${input.countyName} County Brief`, 14, 13);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("AccessMI  -  Independent Civic Data Project  -  accessmi.org", 14, 20);
  doc.text(`Generated ${input.retrievedDate}`, 202, 20, { align: "right" });

  // ── Independence disclosure ──
  doc.setFontSize(7);
  doc.setTextColor(...GREY);
  doc.text(
    "AccessMI is an independent civic data and education project. Not affiliated with the State of Michigan or any government agency.",
    14,
    26,
  );

  // ── Stats grid ──
  doc.setTextColor(...DARK);
  let y = 36;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Key Indicators", 14, y);
  y += 5;

  const colW = 92;
  const rowH = 26;

  input.stats.forEach((stat, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 14 + col * colW;
    const boxY = y + row * rowH;

    // Box
    doc.setDrawColor(210, 210, 210);
    doc.setFillColor(...LIGHT);
    doc.roundedRect(x, boxY, colW - 4, rowH - 2, 2, 2, "FD");

    // Value
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...BLUE);
    doc.text(stat.value, x + 4, boxY + 8);

    // Label
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...DARK);
    doc.text(stat.label, x + 4, boxY + 13);

    // Badge + source
    doc.setFontSize(6);
    doc.setTextColor(...GREY);
    const badgeLine =
      stat.badge === "no data"
        ? "no data"
        : `[${stat.badge.toLowerCase()}] ${stat.source} · ${stat.vintage}`;
    doc.text(badgeLine, x + 4, boxY + 18);
    doc.text(stat.source, x + 4, boxY + 21);
  });

  y += Math.ceil(input.stats.length / 2) * rowH + 8;

  // ── Accent rule ──
  doc.setFillColor(...TEAL);
  doc.rect(14, y, 188, 0.5, "F");
  y += 6;

  // ── Cite this page ──
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK);
  doc.text("Cite this source:", 14, y);
  y += 4;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...DARK);

  // Wrap long cite text
  const citeLines = doc.splitTextToSize(input.citeText, 188);
  doc.text(citeLines, 14, y);
  y += citeLines.length * 3.5 + 4;

  // ── Footer ──
  doc.setFillColor(...TEAL);
  doc.rect(0, 270, 216, 2, "F");
  doc.setFontSize(6.5);
  doc.setTextColor(...GREY);
  doc.text(
    "AccessMI is an independent civic data and education project. Not affiliated with the State of Michigan or any government agency.",
    14,
    276,
  );
  doc.text("accessmi.org/methodology  -  accessmi.org/data-sources", 14, 280);
  doc.text(`Page 1 of 1 · Generated ${input.retrievedDate}`, 202, 280, {
    align: "right",
  });

  doc.save(
    `AccessMI_${input.countyName.replace(/\s+/g, "_")}_County_Brief.pdf`,
  );
}
