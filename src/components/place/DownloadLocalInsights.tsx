/**
 * Download Local Insights — CSV export of all Place indicators
 * with comparison markers (vs Michigan avg, direction, signal category).
 */
import { useCallback, useMemo } from "react";
import { Download, FileSpreadsheet, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Place, PlaceIndicator } from "@/models/Place";
import { buildFullIndicators } from "@/models/Place";

interface Props {
  place: Place;
}

function classifyForExport(ind: PlaceIndicator): string {
  const diff = ind.numericValue - ind.stateAvg;
  const pct = ind.stateAvg !== 0 ? Math.abs(diff / ind.stateAvg) * 100 : 0;
  const isBetter = ind.direction === "lower-is-better" ? diff < 0 : diff > 0;
  if (pct < 5) return "Neutral";
  if (isBetter && pct >= 10) return "Strength";
  if (!isBetter && pct >= 20) return "Pressure";
  if (!isBetter && pct >= 10) return "Emerging Risk";
  if (isBetter) return "Opportunity";
  return "Emerging Risk";
}

function generateCSV(place: Place, indicators: PlaceIndicator[]): string {
  const headers = [
    "Domain", "Indicator", "Value", "Unit", "State Average",
    "Deviation (%)", "Direction", "Signal Classification",
    "Interpretation", "Data Source", "Year", "Geography Level",
  ];

  const rows = indicators.map(ind => {
    const diff = ind.numericValue - ind.stateAvg;
    const pct = ind.stateAvg !== 0 ? ((diff / ind.stateAvg) * 100).toFixed(1) : "N/A";
    const direction = ind.direction === "lower-is-better"
      ? (diff > 0 ? "Above avg (worse)" : diff < 0 ? "Below avg (better)" : "At average")
      : (diff > 0 ? "Above avg (better)" : diff < 0 ? "Below avg (worse)" : "At average");
    const classification = classifyForExport(ind);

    return [
      ind.domain, ind.label, ind.value, ind.unit,
      ind.stateAvg.toString(), `${pct}%`, direction, classification,
      `"${ind.implication.replace(/"/g, '""')}"`,
      ind.source, ind.updated, ind.grain,
    ];
  });

  const csvContent = [
    `# ${place.name} Community Data Export — Access Michigan`,
    `# Generated: ${new Date().toISOString().split("T")[0]}`,
    `# Geography: ${place.geoGrainLabel}`,
    `# Comparison: Michigan State Averages`,
    `# Source: accessmichigan.org`,
    "",
    headers.join(","),
    ...rows.map(r => r.join(",")),
  ].join("\n");

  return csvContent;
}

export default function DownloadLocalInsights({ place }: Props) {
  const indicators = useMemo(() => buildFullIndicators(place), [place]);

  const handleDownload = useCallback(() => {
    const csv = generateCSV(place, indicators);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${place.slug}-community-data-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [place, indicators]);

  return (
    <Card className="border-primary/10">
      <CardContent className="py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <FileSpreadsheet className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-foreground">Download Local Insights</h3>
              <p className="text-xs text-muted-foreground">
                {indicators.length} indicators with Michigan comparison markers · CSV format
              </p>
            </div>
          </div>
          <Button size="sm" onClick={handleDownload} className="gap-1.5 shrink-0">
            <Download className="h-3.5 w-3.5" /> Download CSV
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
          <ShieldCheck className="h-3 w-3" />
          Includes domain, value, state average, deviation %, signal classification, and source for every indicator.
        </p>
      </CardContent>
    </Card>
  );
}
