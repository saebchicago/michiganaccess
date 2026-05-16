import { Download, FileSpreadsheet, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

// County health data for CSV export
const COUNTY_DATA = [
  { county: "Washtenaw", lifeExpectancy: 81.2, insuredRate: 97.1, pcpPer100k: 128, obesityRate: 26.1, infantMortality: 4.1, diabetesRate: 8.5, healthRank: 1 },
  { county: "Ottawa", lifeExpectancy: 80.8, insuredRate: 95.8, pcpPer100k: 68, obesityRate: 28.5, infantMortality: 4.5, diabetesRate: 9.2, healthRank: 2 },
  { county: "Kent", lifeExpectancy: 79.5, insuredRate: 94.2, pcpPer100k: 95, obesityRate: 31.2, infantMortality: 5.8, diabetesRate: 10.1, healthRank: 8 },
  { county: "Ingham", lifeExpectancy: 78.8, insuredRate: 94.5, pcpPer100k: 110, obesityRate: 32.5, infantMortality: 6.2, diabetesRate: 10.8, healthRank: 15 },
  { county: "Kalamazoo", lifeExpectancy: 78.2, insuredRate: 93.8, pcpPer100k: 98, obesityRate: 33.1, infantMortality: 6.5, diabetesRate: 11.2, healthRank: 18 },
  { county: "Oakland", lifeExpectancy: 79.1, insuredRate: 95.2, pcpPer100k: 105, obesityRate: 29.8, infantMortality: 5.2, diabetesRate: 9.8, healthRank: 5 },
  { county: "Wayne", lifeExpectancy: 75.1, insuredRate: 92.8, pcpPer100k: 112, obesityRate: 38.5, infantMortality: 9.8, diabetesRate: 14.2, healthRank: 72 },
  { county: "Genesee", lifeExpectancy: 74.8, insuredRate: 93.1, pcpPer100k: 85, obesityRate: 37.8, infantMortality: 9.2, diabetesRate: 13.8, healthRank: 75 },
  { county: "Macomb", lifeExpectancy: 77.5, insuredRate: 94.0, pcpPer100k: 72, obesityRate: 34.2, infantMortality: 6.8, diabetesRate: 11.8, healthRank: 30 },
  { county: "Saginaw", lifeExpectancy: 75.5, insuredRate: 92.5, pcpPer100k: 78, obesityRate: 36.5, infantMortality: 8.5, diabetesRate: 13.2, healthRank: 65 },
  { county: "Muskegon", lifeExpectancy: 76.2, insuredRate: 92.0, pcpPer100k: 55, obesityRate: 37.0, infantMortality: 8.0, diabetesRate: 12.5, healthRank: 60 },
  { county: "Berrien", lifeExpectancy: 76.8, insuredRate: 91.8, pcpPer100k: 62, obesityRate: 35.5, infantMortality: 7.5, diabetesRate: 12.0, healthRank: 50 },
  { county: "Lake", lifeExpectancy: 73.5, insuredRate: 89.8, pcpPer100k: 18, obesityRate: 40.2, infantMortality: 10.5, diabetesRate: 15.1, healthRank: 82 },
  { county: "Mackinac", lifeExpectancy: 76.2, insuredRate: 91.5, pcpPer100k: 42, obesityRate: 34.1, infantMortality: 7.2, diabetesRate: 11.5, healthRank: 55 },
];

const EQUITY_DATA = [
  { metric: "Life Expectancy (yrs)", white: 78.1, black: 73.4, hispanic: 80.2, asian: 83.5 },
  { metric: "Infant Mortality (per 1k)", white: 4.8, black: 12.6, hispanic: 5.1, asian: 3.2 },
  { metric: "Uninsured Rate (%)", white: 4.2, black: 7.8, hispanic: 12.5, asian: 5.1 },
  { metric: "Diabetes Prevalence (%)", white: 10.1, black: 15.8, hispanic: 13.2, asian: 9.8 },
  { metric: "Obesity (%)", white: 32.1, black: 41.2, hispanic: 35.8, asian: 12.7 },
  { metric: "Heart Disease (%)", white: 10.5, black: 13.8, hispanic: 9.2, asian: 7.1 },
];

function toCsv(headers: string[], rows: (string | number)[][], metadata?: string[]) {
  const metaLines = metadata ? metadata.map(m => `# ${m}`).join("\n") + "\n" : "";
  return metaLines + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  toast.success(`Downloaded ${filename}`);
}

const EXPORTS = [
  {
    label: "County Health Profile (CSV)",
    description: "14 counties — life expectancy, insurance, PCP, obesity, infant mortality, diabetes, and health ranking.",
    action: () => {
      const headers = ["County", "Life Expectancy", "Insured Rate %", "PCP per 100k", "Obesity Rate %", "Infant Mortality /1k", "Diabetes Rate %", "Health Rank /83"];
      const rows = COUNTY_DATA.map((c) => [c.county, c.lifeExpectancy, c.insuredRate, c.pcpPer100k, c.obesityRate, c.infantMortality, c.diabetesRate, c.healthRank]);
      const meta = [
        "Source: County Health Rankings & Roadmaps, 2025 edition, MDHHS Vital Records, CDC BRFSS",
        "Reference Year: 2023-2024",
        "Documentation: https://accessmi.org/methodology",
        `Generated: ${new Date().toISOString()}`,
      ];
      downloadCsv(`michigan-county-health-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(headers, rows, meta));
    },
  },
  {
    label: "Health Equity Disparity (CSV)",
    description: "Racial/ethnic breakdown for 6 health indicators with computed disparity gaps.",
    action: () => {
      const headers = ["Metric", "White", "Black", "Hispanic", "Asian", "Max-Min Gap"];
      const rows = EQUITY_DATA.map((d) => {
        const vals = [d.white, d.black, d.hispanic, d.asian];
        return [d.metric, d.white, d.black, d.hispanic, d.asian, (Math.max(...vals) - Math.min(...vals)).toFixed(1)];
      });
      const meta = [
        "Source: MDHHS Health Equity Data, CDC WONDER, County Health Rankings & Roadmaps, 2025 edition",
        "Reference Year: 2023-2024",
        "Note: Disparity gap = difference between highest and lowest group value",
        "Documentation: https://accessmi.org/methodology",
        `Generated: ${new Date().toISOString()}`,
      ];
      downloadCsv(`michigan-equity-disparity-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(headers, rows, meta));
    },
  },
];

export default function CSVExportPanel() {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4 text-primary" />
          CHNA Data Exports
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Download structured datasets for Community Health Needs Assessments, grant reporting, and institutional benchmarking.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {EXPORTS.map((exp) => (
          <div key={exp.label} className="flex items-center justify-between gap-4 rounded-lg border border-border/50 bg-background p-3">
            <div>
              <p className="text-sm font-medium text-foreground">{exp.label}</p>
              <p className="text-xs text-muted-foreground">{exp.description}</p>
            </div>
            <Button size="sm" variant="outline" onClick={exp.action} className="shrink-0">
              <Download className="h-3.5 w-3.5 mr-1" />
              Download
            </Button>
          </div>
        ))}
        <p className="text-[10px] text-muted-foreground flex items-center gap-1 pt-1">
          <Shield className="h-3 w-3" />
          All exports contain anonymized, aggregate data with source metadata. Sources: CDC BRFSS, County Health Rankings, MDHHS Health Equity, ACEEE LEAD Tool, EIA SEDS.
        </p>
      </CardContent>
    </Card>
  );
}
