import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

interface CHNAExportProps {
  zip: string;
  county: string;
  equityScore: number;
  equityTier: number;
  topConcerns: string[];
}

export default function CHNAExport({ zip, county, equityScore, equityTier, topConcerns }: CHNAExportProps) {
  const [exporting, setExporting] = useState(false);

  const exportToPDF = async () => {
    setExporting(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" });

      // Page 1: Cover
      pdf.setFillColor(10, 76, 149);
      pdf.rect(0, 0, 216, 40, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text("Community Health Needs Assessment", 20, 18);
      pdf.text(`Data Packet: ZIP ${zip}`, 20, 30);

      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      pdf.text(`${county} County, Michigan`, 20, 52);
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 60);
      pdf.text("Source: accessmi.org \u2014 Michigan Equity Intelligence", 20, 68);

      // Equity Score
      pdf.setFontSize(32);
      pdf.setFont("helvetica", "bold");
      const scoreColor = equityScore < 40 ? [220, 50, 50] : equityScore < 60 ? [245, 158, 11] : [0, 163, 161];
      pdf.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
      pdf.text(`${equityScore}/100`, 20, 95);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(80, 80, 80);
      pdf.text(`Equity Score \u2014 Tier ${equityTier} of 5`, 20, 103);
      pdf.text("Source: accessmi.org composite \u2014 CDC PLACES, Census ACS, HUD", 20, 110);

      // Top concerns
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(0, 0, 0);
      pdf.text("Top Community Health Priorities:", 20, 126);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      topConcerns.slice(0, 5).forEach((c, i) => { pdf.text(`${i + 1}. ${c}`, 24, 136 + i * 8); });

      // Page 2: Narrative stub
      pdf.addPage();
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(0, 0, 0);
      pdf.text("CHNA Narrative Stub", 20, 20);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "italic");
      pdf.setTextColor(100, 100, 100);
      pdf.text("Replace this stub with your organization's specific findings and context.", 20, 30);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      const stub = `ZIP code ${zip} in ${county} County presents an equity score of ${equityScore}/100, placing it in Tier ${equityTier} on the Access Michigan five-tier framework. [INSERT ORGANIZATION] conducted this community health needs assessment as part of its IRS 501(r) obligation and strategic commitment to community benefit. Key health priorities identified through data analysis include: ${topConcerns.slice(0, 3).join(", ")}. [INSERT ADDITIONAL CONTEXT AND COMMUNITY INPUT HERE].`;
      const lines = pdf.splitTextToSize(stub, 176);
      pdf.text(lines, 20, 45);

      // Page 3: Data sources
      pdf.addPage();
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("Data Sources & Methodology", 20, 20);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      const sources = [
        "Census ACS 5-Year Estimates 2022 \u2014 api.census.gov",
        "CDC PLACES 2024 \u2014 data.cdc.gov",
        "HUD Fair Market Rents \u2014 huduser.gov",
        "HRSA Health Center Finder \u2014 findahealthcenter.hrsa.gov",
        "USASpending.gov FY2024",
        "FEMA National Risk Index 2023",
        "FCC National Broadband Map 2024",
        "USDA Food Access Research Atlas 2019",
        "EGLE MPART (PFAS) 2026",
        "Data compiled by accessmi.org \u2014 accessmi.org/methodology",
      ];
      sources.forEach((src, i) => { pdf.text(`\u2022 ${src}`, 20, 32 + i * 7); });

      // Footer on all pages
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(7);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`accessmi.org \u2014 Michigan Equity Intelligence \u2014 ${new Date().toLocaleDateString()} \u2014 Page ${i} of ${pageCount}`, 20, 272);
      }

      pdf.save(`CHNA-${zip}-${county}-${new Date().toISOString().slice(0, 10)}.pdf`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <button onClick={exportToPDF} disabled={exporting}
      className="flex items-center gap-2 px-3 py-1.5 bg-michigan-forest text-white rounded-lg text-xs font-medium hover:bg-michigan-forest/90 transition-colors disabled:opacity-50">
      {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
      {exporting ? "Generating..." : "Export CHNA Packet"}
    </button>
  );
}
