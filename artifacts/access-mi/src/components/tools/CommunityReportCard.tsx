import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { computeHealthScore } from "@/lib/health-score";
import { MI_STATE_AVERAGES } from "@/lib/places-client";
import type { PlacesMeasure } from "@/lib/places-client";

interface Props {
  zipCode: string;
  data: PlacesMeasure[];
}

function generateRecommendations(dataMap: Record<string, number>): string[] {
  const recs: string[] = [];
  const gaps = Object.entries(dataMap)
    .filter(([m]) => MI_STATE_AVERAGES[m] != null)
    .map(([m, v]) => ({
      measure: m,
      gap: v - (MI_STATE_AVERAGES[m] || 0),
      value: v,
    }))
    .filter((g) => g.gap > 1)
    .sort((a, b) => b.gap - a.gap);

  for (const g of gaps.slice(0, 3)) {
    recs.push(
      `${g.measure} intervention needed (${g.value.toFixed(1)}% - ${g.gap.toFixed(1)} points above state average)`,
    );
  }
  if (
    dataMap["Lack of Health Insurance"] &&
    dataMap["Lack of Health Insurance"] > 8
  ) {
    recs.push("Insurance enrollment outreach recommended");
  }
  return recs.slice(0, 3);
}

export default function CommunityReportCard({ zipCode, data }: Props) {
  const handleGenerate = () => {
    const dataMap: Record<string, number> = {};
    data.forEach((d) => {
      dataMap[d.short_question_text] = d.data_value;
    });

    const score = computeHealthScore(dataMap);
    const pop = data[0]?.totalpopulation || 0;
    const recs = generateRecommendations(dataMap);
    const date = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const KEY_MEASURES = [
      "Diabetes",
      "Obesity",
      "Depression",
      "Lack of Health Insurance",
      "Current Smoking",
      "No Leisure-Time Physical Activity",
    ];
    const stats = KEY_MEASURES.map((m) => ({
      name: m,
      value: dataMap[m],
      stateAvg: MI_STATE_AVERAGES[m],
      above:
        dataMap[m] && MI_STATE_AVERAGES[m]
          ? dataMap[m] > MI_STATE_AVERAGES[m] + 1
          : false,
    })).filter((s) => s.value != null);

    const w = window.open("", "_blank");
    if (!w) return;

    w.document
      .write(`<!DOCTYPE html><html><head><title>Community Health Report Card - ZIP ${zipCode}</title>
<style>
body{font-family:system-ui,sans-serif;max-width:800px;margin:0 auto;padding:40px;color:#1a1a1a}
h1{font-size:22px;color:#0A4C95;border-bottom:2px solid #00A3A1;padding-bottom:8px;margin-bottom:4px}
h2{font-size:15px;color:#0A4C95;margin-top:20px}
.meta{font-size:11px;color:#6b7280;margin-bottom:16px}
.score-box{text-align:center;background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin:16px 0}
.score-num{font-size:48px;font-weight:700;color:${score.color}}
.grade{display:inline-block;padding:4px 16px;border-radius:8px;font-size:16px;font-weight:700;color:#fff;background:${score.color}}
.stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:16px 0}
.stat{border:1px solid #e5e7eb;border-radius:8px;padding:10px;text-align:center}
.stat-val{font-size:24px;font-weight:700;color:#0A4C95}
.stat-label{font-size:10px;color:#6b7280}
.stat-cmp{font-size:9px;color:#6b7280;margin-top:2px}
.above{color:#DC2626}.below{color:#22c55e}
.recs{background:#f0fdf4;border-left:3px solid #22c55e;padding:12px;margin:16px 0;font-size:12px}
.footer{margin-top:32px;padding-top:12px;border-top:1px solid #e5e7eb;font-size:9px;color:#9ca3af}
@media print{body{padding:20px}}
</style></head><body>
<h1>Community Health Report Card</h1>
<p class="meta">ZIP Code ${zipCode} · Population: ~${pop.toLocaleString()} · Generated ${date} · Source: Access Michigan (accessmi.org)</p>
<div class="score-box">
<div class="score-num">${score.score}</div>
<div>/100 - <span class="grade">${score.tier?.badge ?? score.grade}</span></div>
<p style="font-size:11px;color:#6b7280;margin-top:4px">${score.tier?.opportunity ?? ""}</p>
<p style="font-size:10px;color:#6b7280;margin-top:8px">Neighborhood Health Score (modeled composite)</p>
</div>
<h2>Key Health Indicators</h2>
<div class="stat-grid">${stats
      .map(
        (s) => `
<div class="stat">
<div class="stat-val">${s.value!.toFixed(1)}%</div>
<div class="stat-label">${s.name}</div>
<div class="stat-cmp ${s.above ? "above" : "below"}">MI avg: ${s.stateAvg?.toFixed(1)}% ${s.above ? "▲ Above" : "✓ At/Below"}</div>
</div>`,
      )
      .join("")}</div>
${score.strengths.length ? `<p style="font-size:12px"><strong style="color:#22c55e">Strengths:</strong> ${score.strengths.join(", ")}</p>` : ""}
${score.concerns.length ? `<p style="font-size:12px"><strong style="color:#DC2626">Concerns:</strong> ${score.concerns.join(", ")}</p>` : ""}
${recs.length ? `<h2>Recommendations</h2><div class="recs"><ol style="margin:0;padding-left:16px">${recs.map((r) => `<li>${r}</li>`).join("")}</ol><p style="font-size:9px;color:#6b7280;margin-top:8px">Population-level suggestions based on data. Not clinical recommendations.</p></div>` : ""}
<h2>Data Sources</h2>
<p style="font-size:10px;color:#6b7280">CDC PLACES 2024 (ZCTA-level) · BRFSS 2022 · Robert Wood Johnson Foundation · CDC Foundation · Census ACS</p>
<div class="footer">
<p>Access Michigan · accessmi.org · Independent civic intelligence platform</p>
<p>Modeled estimates - see accessmi.org/methodology for documentation.</p>
</div></body></html>`);
    w.document.close();
    w.print();
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="text-xs gap-1"
      onClick={handleGenerate}
    >
      <FileText className="h-3 w-3" /> Report Card
    </Button>
  );
}
