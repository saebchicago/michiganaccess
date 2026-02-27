/**
 * Download Local Insights — Professional CSV & Executive Brief PDF exports
 * with comparative benchmarking, signal classification, and sparse data handling.
 * Privacy First: all generation happens client-side via Blob.
 */
import { useCallback, useMemo, useState } from "react";
import { Download, FileSpreadsheet, FileText, ShieldCheck, CheckCircle2, Loader2, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import type { Place, PlaceIndicator } from "@/models/Place";
import { buildFullIndicators, buildStandouts } from "@/models/Place";
import { MICHIGAN_REGIONS } from "@/data/michigan-regions";
import { COUNTY_PROFILES } from "@/data/michigan-county-profiles";

interface Props {
  place: Place;
}

/* ── Signal Classification ── */
function classifySignal(ind: PlaceIndicator): "Strength" | "Pressure" | "Emerging Risk" | "Opportunity" | "Neutral" {
  const diff = ind.numericValue - ind.stateAvg;
  const pct = ind.stateAvg !== 0 ? Math.abs(diff / ind.stateAvg) * 100 : 0;
  const isBetter = ind.direction === "lower-is-better" ? diff < 0 : diff > 0;
  if (pct < 5) return "Neutral";
  if (isBetter && pct >= 10) return "Strength";
  if (!isBetter && pct >= 20) return "Pressure";
  if (!isBetter && pct >= 10) return "Emerging Risk";
  if (isBetter) return "Opportunity";
  return "Neutral";
}

/* ── Sparse Data Handler ── */
function sanitizeValue(val: string | number | null | undefined, numericValue: number): string {
  if (val === null || val === undefined || val === "") return "Data Suppressed";
  if (typeof numericValue === "number" && (numericValue === 0 || isNaN(numericValue))) {
    // Check if the string value is explicitly "0" or a zero rate — allow legit zeros for some metrics
    const str = String(val);
    if (str === "0" || str === "0%" || str === "$0" || str === "0:1") return "Insufficient Sample Size";
  }
  return String(val);
}

function sanitizeDeviation(numericValue: number, stateAvg: number): string {
  if (numericValue === 0 || stateAvg === 0 || isNaN(numericValue) || isNaN(stateAvg)) return "N/A";
  return ((numericValue - stateAvg) / stateAvg * 100).toFixed(1) + "%";
}

/* ── File Name Builder ── */
function buildFileName(place: Place, ext: "csv" | "pdf"): string {
  const datePart = new Date().toISOString().split("T")[0];
  const namePart = place.name.replace(/[^a-zA-Z0-9]+/g, "_").replace(/_+$/, "");
  return `AccessMI_Report_${namePart}_${datePart}.${ext}`;
}

/* ── CSV Generator ── */
function generateCSV(place: Place, indicators: PlaceIndicator[]): string {
  const headers = [
    "Domain", "Indicator", "Local Value", "Unit", "Michigan State Median",
    "Deviation (%)", "Indicator Signal", "Direction Preference",
    "Plain-Language Interpretation", "Data Source", "Source URL", "Data Year", "Geography Level",
  ];

  const rows = indicators.map(ind => {
    const localValue = sanitizeValue(ind.value, ind.numericValue);
    const deviation = sanitizeDeviation(ind.numericValue, ind.stateAvg);
    const signal = classifySignal(ind);
    const dirLabel = ind.direction === "lower-is-better"
      ? (ind.numericValue > ind.stateAvg ? "Above avg (worse)" : ind.numericValue < ind.stateAvg ? "Below avg (better)" : "At average")
      : (ind.numericValue > ind.stateAvg ? "Above avg (better)" : ind.numericValue < ind.stateAvg ? "Below avg (worse)" : "At average");

    return [
      ind.domain,
      `"${ind.label}"`,
      `"${localValue}"`,
      ind.unit,
      ind.stateAvg.toString(),
      deviation,
      signal,
      dirLabel,
      `"${ind.implication.replace(/"/g, '""')}"`,
      `"${ind.source}"`,
      ind.sourceUrl,
      ind.updated,
      `"${ind.grain}"`,
    ];
  });

  return [
    `# AccessMI Report: ${place.name}`,
    `# Generated: ${new Date().toISOString().split("T")[0]}`,
    `# Geography Level: ${place.geoGrainLabel}`,
    `# Comparison Baseline: Michigan State Medians`,
    `# Source: accessmichigan.org | Privacy First: Generated client-side`,
    `# Note: "Data Suppressed" = value withheld for small populations; "Insufficient Sample Size" = metric not reliably measured`,
    "",
    headers.join(","),
    ...rows.map(r => r.join(",")),
  ].join("\n");
}

/* ── SVG Bar Chart for Executive Brief ── */
function generateBarChartSVG(indicators: PlaceIndicator[]): string {
  const top = indicators.slice(0, 6);
  const barH = 28, gap = 8, labelW = 140, chartW = 400, maxBarW = 240;
  const totalH = top.length * (barH + gap) + 20;
  const maxVal = Math.max(...top.map(i => Math.max(i.numericValue, i.stateAvg)), 1);

  const bars = top.map((ind, idx) => {
    const y = idx * (barH + gap) + 10;
    const localW = Math.max((ind.numericValue / maxVal) * maxBarW, 4);
    const stateW = Math.max((ind.stateAvg / maxVal) * maxBarW, 4);
    const signal = classifySignal(ind);
    const color = signal === "Strength" ? "#16a34a" : signal === "Pressure" ? "#dc2626" : signal === "Emerging Risk" ? "#ea580c" : "#6b7280";
    return `
      <text x="0" y="${y + 18}" font-size="11" fill="#374151">${ind.label}</text>
      <rect x="${labelW}" y="${y}" width="${stateW}" height="${barH / 2}" rx="3" fill="#e5e7eb"/>
      <rect x="${labelW}" y="${y + barH / 2}" width="${localW}" height="${barH / 2}" rx="3" fill="${color}"/>
      <text x="${labelW + localW + 4}" y="${y + barH - 4}" font-size="9" fill="${color}">${sanitizeValue(ind.value, ind.numericValue)}</text>
      <text x="${labelW + stateW + 4}" y="${y + 10}" font-size="9" fill="#9ca3af">MI: ${ind.stateAvg}</text>
    `;
  }).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${chartW}" height="${totalH}" viewBox="0 0 ${chartW} ${totalH}">
    <text x="${labelW}" y="8" font-size="8" fill="#9ca3af">█ MI Avg  █ Local</text>
    ${bars}
  </svg>`;
}

/* ── Executive Brief PDF (HTML → Print) ── */
function generateExecutiveBrief(place: Place, indicators: PlaceIndicator[]): string {
  const standouts = buildStandouts(indicators);
  const strengths = indicators.filter(i => classifySignal(i) === "Strength").slice(0, 3);
  const pressures = indicators.filter(i => classifySignal(i) === "Pressure" || classifySignal(i) === "Emerging Risk").slice(0, 3);
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const chartSVG = generateBarChartSVG(indicators);

  const scorecard = indicators.slice(0, 8).map(ind => {
    const signal = classifySignal(ind);
    const dev = sanitizeDeviation(ind.numericValue, ind.stateAvg);
    const val = sanitizeValue(ind.value, ind.numericValue);
    const color = signal === "Strength" ? "#16a34a" : signal === "Pressure" ? "#dc2626" : signal === "Emerging Risk" ? "#ea580c" : "#6b7280";
    return `<tr>
      <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;font-size:13px;">${ind.label}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;">${val}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;font-size:13px;">${ind.stateAvg}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;font-size:13px;">${dev}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;font-size:13px;color:${color};font-weight:600;">${signal}</td>
    </tr>`;
  }).join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${place.name} Community Brief — Access Michigan</title>
<style>
  @media print { body { margin: 0; } .no-print { display: none; } @page { size: letter; margin: 0.5in; } }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; color: #1a1a2e; max-width: 800px; margin: 0 auto; padding: 32px; line-height: 1.5; }
  .header { border-bottom: 3px solid #1e3a5f; padding-bottom: 16px; margin-bottom: 24px; }
  .header h1 { font-size: 22px; margin: 0 0 4px; color: #1e3a5f; }
  .header p { font-size: 12px; color: #6b7280; margin: 0; }
  .section { margin-bottom: 20px; }
  .section h2 { font-size: 15px; color: #1e3a5f; border-bottom: 1px solid #d1d5db; padding-bottom: 6px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; padding: 8px 10px; background: #f1f5f9; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; border-bottom: 2px solid #cbd5e1; }
  .insight-list { list-style: none; padding: 0; }
  .insight-list li { padding: 6px 0; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
  .insight-list li::before { content: "→ "; color: #1e3a5f; font-weight: bold; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
  .badge-strength { background: #dcfce7; color: #166534; }
  .badge-pressure { background: #fef2f2; color: #991b1b; }
  .chart-section { text-align: center; margin: 16px 0; }
  .footer { margin-top: 28px; padding-top: 12px; border-top: 2px solid #1e3a5f; font-size: 10px; color: #9ca3af; }
  .btn-print { background: #1e3a5f; color: white; border: none; padding: 10px 24px; border-radius: 6px; cursor: pointer; font-size: 14px; margin-bottom: 20px; }
</style></head><body>
<button class="btn-print no-print" onclick="window.print()">🖨️ Print / Save as PDF</button>
<div class="header">
  <h1>${place.name} — Community Brief</h1>
  <p>Executive Summary · Generated ${today} · accessmichigan.org</p>
  <p>Geography: ${place.geoGrainLabel} · Population: ${place.countyProfile.population.toLocaleString()}</p>
</div>

<div class="section">
  <h2>Community Health Scorecard</h2>
  <table><thead><tr><th>Indicator</th><th>Local Value</th><th>MI Median</th><th>Deviation</th><th>Signal</th></tr></thead><tbody>${scorecard}</tbody></table>
</div>

<div class="section chart-section">
  <h2>Local vs. State Average</h2>
  ${chartSVG}
</div>

<div class="section" style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
  <div>
    <h2>Top Strengths</h2>
    <ul class="insight-list">${strengths.length > 0 ? strengths.map(s => `<li><span class="badge badge-strength">${s.label}</span> ${sanitizeValue(s.value, s.numericValue)} (${sanitizeDeviation(s.numericValue, s.stateAvg)} vs MI)</li>`).join("") : "<li>No notable strengths detected above threshold</li>"}</ul>
  </div>
  <div>
    <h2>Top Pressures</h2>
    <ul class="insight-list">${pressures.length > 0 ? pressures.map(p => `<li><span class="badge badge-pressure">${p.label}</span> ${sanitizeValue(p.value, p.numericValue)} (${sanitizeDeviation(p.numericValue, p.stateAvg)} vs MI)</li>`).join("") : "<li>No notable pressures detected above threshold</li>"}</ul>
  </div>
</div>

${standouts.length > 0 ? `<div class="section">
  <h2>What Stands Out</h2>
  <ul class="insight-list">${standouts.map(s => `<li>${s.label}: ${s.delta} — ${s.direction === "better" ? "Favorable" : "Needs attention"}</li>`).join("")}</ul>
</div>` : ""}

<div class="section">
  <h2>Data Provenance</h2>
  <table><thead><tr><th>Source</th><th>Coverage</th><th>Year</th></tr></thead><tbody>
    <tr><td style="padding:6px 10px;font-size:12px;">County Health Rankings</td><td style="padding:6px 10px;font-size:12px;">Health outcomes & behaviors</td><td style="padding:6px 10px;font-size:12px;">2025</td></tr>
    <tr><td style="padding:6px 10px;font-size:12px;">U.S. Census ACS 5-Year</td><td style="padding:6px 10px;font-size:12px;">Demographics, economics, housing</td><td style="padding:6px 10px;font-size:12px;">2022</td></tr>
    <tr><td style="padding:6px 10px;font-size:12px;">MDHHS / BLS LAUS</td><td style="padding:6px 10px;font-size:12px;">Employment, workforce</td><td style="padding:6px 10px;font-size:12px;">2024</td></tr>
    <tr><td style="padding:6px 10px;font-size:12px;">DOE LEAD Tool</td><td style="padding:6px 10px;font-size:12px;">Energy burden estimates</td><td style="padding:6px 10px;font-size:12px;">2024</td></tr>
    <tr><td style="padding:6px 10px;font-size:12px;">EPA SDWIS / FBI UCR</td><td style="padding:6px 10px;font-size:12px;">Water quality, safety</td><td style="padding:6px 10px;font-size:12px;">2022–2024</td></tr>
  </tbody></table>
</div>

<div class="footer">
  <p><strong>Disclaimer:</strong> This report is generated by Access Michigan, an independent civic project. Data is sourced from public federal and state databases. All values represent community-level aggregates — no personal or identifiable information is collected, stored, or transmitted. "Data Suppressed" indicates values withheld for populations too small to report reliably.</p>
  <p>© ${new Date().getFullYear()} Access Michigan · accessmichigan.org · Privacy First Architecture</p>
</div>
</body></html>`;
}

/* ── Download Helpers ── */
function downloadBlob(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/* ── Regional Comparison CSV ── */
function generateRegionalCSV(place: Place): string | null {
  const region = MICHIGAN_REGIONS.find(r =>
    r.counties.includes(place.parentCounty || place.name.replace(/ County$/, "") as any)
  );
  if (!region) return null;

  const headers = ["County", "Population", "County Type", "Uninsured Rate", "Primary Care Ratio", "Food Insecurity", "Median Income", "Poverty Rate", "Unemployment Rate", "HS Graduation Rate"];

  const rows = region.counties.map(county => {
    const profile = COUNTY_PROFILES[county];
    if (!profile) return null;
    const hh = profile.healthHighlights;
    return [
      county,
      profile.population,
      profile.countyType,
      hh[0]?.value || "N/A",
      hh[1]?.value || "N/A",
      hh[2]?.value || "N/A",
      `"$${profile.population > 0 ? "—" : "—"}"`, // placeholder
      profile.countyType,
      "—",
      "—",
    ].join(",");
  }).filter(Boolean);

  return [
    `# Regional Comparison: ${region.name}`,
    `# Counties: ${region.counties.length}`,
    `# Generated: ${new Date().toISOString().split("T")[0]}`,
    `# Source: County Health Rankings, Census ACS | accessmichigan.org`,
    "",
    headers.join(","),
    ...rows,
  ].join("\n");
}

/* ── Component ── */
export default function DownloadLocalInsights({ place }: Props) {
  const indicators = useMemo(() => buildFullIndicators(place), [place]);
  const [downloading, setDownloading] = useState<"csv" | "pdf" | null>(null);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState<"csv" | "pdf" | null>(null);

  const signalCounts = useMemo(() => {
    const counts = { Strength: 0, Pressure: 0, "Emerging Risk": 0, Opportunity: 0, Neutral: 0 };
    indicators.forEach(ind => { counts[classifySignal(ind)]++; });
    return counts;
  }, [indicators]);

  const simulateProgress = useCallback((format: "csv" | "pdf", action: () => void) => {
    setDownloading(format);
    setProgress(0);
    setCompleted(null);
    let p = 0;
    const interval = setInterval(() => {
      p += 25;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        action();
        setDownloading(null);
        setCompleted(format);
        setTimeout(() => setCompleted(null), 3000);
      }
    }, 120);
  }, []);

  const handleCSV = useCallback(() => {
    simulateProgress("csv", () => {
      const csv = generateCSV(place, indicators);
      downloadBlob(csv, buildFileName(place, "csv"), "text/csv;charset=utf-8;");
      toast.success("CSV downloaded", { description: `${indicators.length} indicators with Michigan benchmarks` });
    });
  }, [place, indicators, simulateProgress]);

  const handlePDF = useCallback(() => {
    simulateProgress("pdf", () => {
      const html = generateExecutiveBrief(place, indicators);
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(html);
        win.document.close();
        toast.success("Executive Brief opened", { description: "Use Print → Save as PDF for a polished report" });
      } else {
        // Fallback: download as HTML
        downloadBlob(html, buildFileName(place, "pdf").replace(".pdf", ".html"), "text/html;charset=utf-8;");
        toast.success("Brief downloaded as HTML", { description: "Open in browser and print to PDF" });
      }
    });
  }, [place, indicators, simulateProgress]);

  return (
    <Card className="border-primary/10 overflow-hidden">
      <CardContent className="py-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-foreground">Download Local Insights</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {indicators.length} indicators · Benchmarked against Michigan state medians
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {signalCounts.Strength > 0 && (
                  <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
                    {signalCounts.Strength} Strengths
                  </Badge>
                )}
                {signalCounts.Pressure > 0 && (
                  <Badge variant="outline" className="text-[10px] bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800">
                    {signalCounts.Pressure} Pressures
                  </Badge>
                )}
                {signalCounts["Emerging Risk"] > 0 && (
                  <Badge variant="outline" className="text-[10px] bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800">
                    {signalCounts["Emerging Risk"]} Risks
                  </Badge>
                )}
                {signalCounts.Opportunity > 0 && (
                  <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
                    {signalCounts.Opportunity} Opportunities
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {downloading && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Preparing {downloading === "csv" ? "CSV" : "Executive Brief"}…
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}

        {/* Success state */}
        {completed && !downloading && (
          <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {completed === "csv" ? "CSV" : "Executive Brief"} ready — check your downloads
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={handleCSV} disabled={!!downloading} className="gap-1.5 transition-transform hover:scale-[1.03] active:scale-95">
            <Download className="h-3.5 w-3.5" /> Download CSV
          </Button>
          <Button size="sm" variant="outline" onClick={handlePDF} disabled={!!downloading} className="gap-1.5 transition-transform hover:scale-[1.03] active:scale-95">
            <FileText className="h-3.5 w-3.5" /> Executive Brief
          </Button>
          {place.region && (
            <Button
              size="sm"
              variant="outline"
              disabled={!!downloading}
              className="gap-1.5"
              onClick={() => {
                const csv = generateRegionalCSV(place);
                if (csv) {
                  const datePart = new Date().toISOString().split("T")[0];
                  const regionName = place.region!.name.replace(/[^a-zA-Z0-9]+/g, "_");
                  downloadBlob(csv, `AccessMI_Regional_${regionName}_${datePart}.csv`, "text/csv;charset=utf-8;");
                  toast.success("Regional comparison downloaded", { description: `${place.region!.counties.length} counties in ${place.region!.name}` });
                }
              }}
            >
              <Map className="h-3.5 w-3.5" /> Regional Comparison
            </Button>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-start gap-1.5 pt-1 border-t border-border/50">
          <ShieldCheck className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            <strong>Privacy First:</strong> Files are generated entirely in your browser — no data is sent to any server.
            Includes domain, local value, state median, deviation %, signal classification, and source for every indicator.
            File naming: <code className="text-[9px] bg-muted px-1 rounded">AccessMI_Report_[Place]_[Date]</code>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
