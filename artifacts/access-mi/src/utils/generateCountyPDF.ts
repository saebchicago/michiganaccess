// Generate a branded 1-page county health brief PDF
// Uses jsPDF (already installed)

// Brand RGB equivalents of the CSS palette. jsPDF can't read CSS
// custom properties at runtime, so the palette is duplicated here.
// Keep in sync with --color-navy / --color-teal in src/index.css.
const BRAND_NAVY_RGB = [14, 42, 71] as const; // #0E2A47
const BRAND_TEAL_RGB = [28, 114, 147] as const; // #1C7293

interface CountyPDFData {
  countyName: string;
  population?: number;
  combinedHardshipPct?: number;
  uninsuredPct?: number;
  foodInsecurityPct?: number;
  facilityCount?: number;
  maternalAccess?: string;
  broadbandPct?: number;
  topNeeds?: string[];
}

export async function generateCountyPDF(data: CountyPDFData): Promise<void> {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "letter",
  });

  // ── Header ──
  doc.setFillColor(...BRAND_NAVY_RGB);
  doc.rect(0, 0, 216, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(`${data.countyName} County Health Brief`, 14, 16);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("accessmi.org \u2014 Michigan Civic Intelligence Platform", 14, 23);
  doc.text(
    new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    200,
    23,
    { align: "right" },
  );

  // ── Population ──
  doc.setTextColor(30, 30, 30);
  let y = 36;
  if (data.population) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Population: ${data.population.toLocaleString()}`, 14, y);
    y += 8;
  }

  // ── Key Indicators (2x3 grid) ──
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Key Indicators", 14, y);
  y += 6;

  const metrics = [
    {
      label: "ALICE Hardship",
      value:
        data.combinedHardshipPct != null
          ? `${data.combinedHardshipPct}%`
          : "N/A",
      source: "United For ALICE 2023",
    },
    {
      label: "Uninsured Rate",
      value:
        data.uninsuredPct != null ? `${data.uninsuredPct}%` : "~4% (state avg)",
      source: "ACS 5-Year Estimates",
    },
    {
      label: "Food Insecurity",
      value:
        data.foodInsecurityPct != null ? `${data.foodInsecurityPct}%` : "N/A",
      source: "Feeding America 2024",
    },
    {
      label: "Healthcare Facilities",
      value: data.facilityCount != null ? String(data.facilityCount) : "N/A",
      source: "HRSA / Supabase",
    },
    {
      label: "Maternity Care Access",
      value: data.maternalAccess || "N/A",
      source: "March of Dimes 2024",
    },
    {
      label: "Broadband Coverage",
      value: data.broadbandPct != null ? `${data.broadbandPct}%` : "N/A",
      source: "FCC BDC 2024",
    },
  ];

  const colW = 92;
  const rowH = 22;
  for (let i = 0; i < metrics.length; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 14 + col * colW;
    const boxY = y + row * rowH;

    // Box
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(248, 249, 250);
    doc.roundedRect(x, boxY, colW - 4, rowH - 2, 2, 2, "FD");

    // Value
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...BRAND_NAVY_RGB);
    doc.text(metrics[i].value, x + 4, boxY + 8);

    // Label
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text(metrics[i].label, x + 4, boxY + 13);

    // Source
    doc.setFontSize(6);
    doc.setTextColor(150, 150, 150);
    doc.text(metrics[i].source, x + 4, boxY + 17);
  }

  y += Math.ceil(metrics.length / 2) * rowH + 6;

  // ── Top CHNA Needs ──
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Top Community Health Needs", 14, y);
  y += 6;

  const needs = data.topNeeds ?? [
    "Mental & Behavioral Health Access",
    "Primary Care & Specialist Access",
    "Housing Stability & SDOH",
    "Chronic Disease Management",
    "Food Security & Nutrition",
  ];

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  for (let i = 0; i < needs.length; i++) {
    doc.setTextColor(...BRAND_NAVY_RGB);
    doc.text(`${i + 1}.`, 16, y + i * 6);
    doc.setTextColor(30, 30, 30);
    doc.text(needs[i], 22, y + i * 6);
  }
  y += needs.length * 6 + 8;

  // ── Teal accent bar ──
  doc.setFillColor(...BRAND_TEAL_RGB);
  doc.rect(14, y, 188, 0.5, "F");
  y += 6;

  // ── Source attribution ──
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  const sources =
    "Sources: HRSA, CDC PLACES, Census ACS, Feeding America, March of Dimes, United For ALICE, FCC BDC, MDHHS";
  doc.text(sources, 14, y);
  y += 4;
  doc.text(
    "All data from public records. Estimates labeled where applicable. Visit accessmi.org/methodology for details.",
    14,
    y,
  );

  // ── Footer ──
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Generated by accessmi.org \u2014 ${new Date().toLocaleDateString()} \u2014 Page 1 of 1`,
    14,
    268,
  );

  doc.save(`${data.countyName}_County_Health_Brief.pdf`);
}
