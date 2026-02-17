import { useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { TrendingUp, MapPin, AlertTriangle, Building2, FileDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type Facility } from "@/hooks/useFacilities";
import { getCountyProfile } from "@/data/michigan-county-profiles";
import type { MichiganRegion } from "@/data/michigan-regions";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.25 } }),
};

// SVI proxy: counties with high uninsured + high food insecurity + low PCP ratio
function computeAccessGap(county: string) {
  const p = getCountyProfile(county);
  let sviScore = 0;
  p.healthHighlights.forEach((h) => {
    if (h.label === "Uninsured rate") {
      const v = parseFloat(h.value);
      if (v > 8) sviScore += 2;
      else if (v > 6) sviScore += 1;
    }
    if (h.label === "Food insecurity") {
      const v = parseFloat(h.value);
      if (v > 15) sviScore += 2;
      else if (v > 12) sviScore += 1;
    }
    if (h.label === "Primary care ratio") {
      const v = parseInt(h.value.split(":")[0].replace(/,/g, ""), 10);
      if (v > 2000) sviScore += 2;
      else if (v > 1400) sviScore += 1;
    }
  });
  return { county, sviScore, population: p.population, profile: p };
}

interface Props {
  region: MichiganRegion;
  facilities: Facility[];
}

export default function MarketIntelligence({ region, facilities }: Props) {
  const gaps = useMemo(() => {
    return region.counties
      .map((c) => {
        const gap = computeAccessGap(c);
        const countyFacilities = facilities.filter((f) => f.county === c);
        const pcpCount = countyFacilities.filter(
          (f) => f.facility_type === "fqhc" || f.facility_type === "hospital" || f.specialties?.some((s) => s.toLowerCase().includes("primary"))
        ).length;
        return { ...gap, facilityCount: countyFacilities.length, pcpCount };
      })
      .sort((a, b) => b.sviScore - a.sviScore);
  }, [region, facilities]);

  const systemDensity = useMemo(() => {
    const counts: Record<string, number> = {};
    facilities.forEach((f) => {
      if (f.system_affiliation) {
        counts[f.system_affiliation] = (counts[f.system_affiliation] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [facilities]);

  const highNeedCounties = gaps.filter((g) => g.sviScore >= 3);
  const totalFacilities = facilities.length;

  return (
    <section className="space-y-6">
      <div>
        <h2 className="mb-1 text-xl font-bold text-foreground flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Market Intelligence
        </h2>
        <p className="text-xs text-muted-foreground">
          Ambulatory opportunity analysis based on social vulnerability indicators and facility distribution.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
          <Card>
            <CardContent className="py-4 space-y-1">
              <p className="text-xs text-muted-foreground">Total Facilities</p>
              <p className="text-2xl font-bold text-foreground">{totalFacilities}</p>
              <p className="text-[10px] text-muted-foreground">Across {region.counties.length} counties</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}>
          <Card className={highNeedCounties.length > 0 ? "border-destructive/30" : ""}>
            <CardContent className="py-4 space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> High-Need Counties
              </p>
              <p className="text-2xl font-bold text-foreground">{highNeedCounties.length}</p>
              <p className="text-[10px] text-muted-foreground">SVI proxy score ≥ 3 (elevated vulnerability)</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}>
          <Card>
            <CardContent className="py-4 space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Building2 className="h-3 w-3" /> System Networks
              </p>
              <p className="text-2xl font-bold text-foreground">{systemDensity.length}</p>
              <p className="text-[10px] text-muted-foreground">Active health systems in region</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Access Gap Table */}
      <Card>
        <CardContent className="py-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-3 text-left font-medium text-muted-foreground text-xs">County</th>
                  <th className="py-3 text-center font-medium text-muted-foreground text-xs">Population</th>
                  <th className="py-3 text-center font-medium text-muted-foreground text-xs">Facilities</th>
                  <th className="py-3 text-center font-medium text-muted-foreground text-xs">Primary Care Sites</th>
                  <th className="py-3 text-center font-medium text-muted-foreground text-xs">Vulnerability</th>
                </tr>
              </thead>
              <tbody>
                {gaps.map((g) => (
                  <tr key={g.county} className="border-b last:border-0">
                    <td className="py-2.5 text-xs font-medium text-foreground flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      {g.county}
                    </td>
                    <td className="py-2.5 text-center text-xs text-muted-foreground">{g.population.toLocaleString()}</td>
                    <td className="py-2.5 text-center text-xs text-foreground font-semibold">{g.facilityCount}</td>
                    <td className="py-2.5 text-center text-xs text-foreground">{g.pcpCount}</td>
                    <td className="py-2.5 text-center">
                      <Badge
                        variant={g.sviScore >= 4 ? "destructive" : g.sviScore >= 3 ? "outline" : "secondary"}
                        className={`text-[10px] ${g.sviScore >= 3 ? "border-destructive/40 text-destructive" : ""}`}
                      >
                        {g.sviScore >= 4 ? "Critical" : g.sviScore >= 3 ? "High" : g.sviScore >= 1 ? "Moderate" : "Low"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* System Density */}
      {systemDensity.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-foreground">Regional System Presence</h3>
          <div className="flex flex-wrap gap-2">
            {systemDensity.map(([system, count]) => (
              <Badge key={system} variant="outline" className="text-xs py-1 px-3">
                {system} · {count} site{count > 1 ? "s" : ""}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-[9px] text-muted-foreground">
          Vulnerability scores derived from uninsured rate, food insecurity, and primary care ratios. Not a clinical SVI — for planning purposes only.
        </p>
        <Button size="sm" variant="outline" className="text-xs gap-1.5" onClick={() => downloadMarketBrief(region, gaps, systemDensity, totalFacilities, highNeedCounties.length)}>
          <FileDown className="h-3.5 w-3.5" />
          Download Market Brief
        </Button>
      </div>
    </section>
  );
}

function downloadMarketBrief(
  region: MichiganRegion,
  gaps: { county: string; sviScore: number; population: number; facilityCount: number; pcpCount: number }[],
  systemDensity: [string, number][],
  totalFacilities: number,
  highNeedCount: number
) {
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const rows = (gaps as any[])
    .map((g) => `<tr><td>${g.county}</td><td style="text-align:center">${g.population.toLocaleString()}</td><td style="text-align:center">${g.facilityCount}</td><td style="text-align:center">${g.pcpCount}</td><td style="text-align:center;font-weight:600;color:${g.sviScore >= 4 ? "#dc2626" : g.sviScore >= 3 ? "#ea580c" : "#16a34a"}">${g.sviScore >= 4 ? "Critical" : g.sviScore >= 3 ? "High" : g.sviScore >= 1 ? "Moderate" : "Low"}</td></tr>`)
    .join("");
  const systemList = systemDensity.map(([s, c]) => `${s} (${c} site${c > 1 ? "s" : ""})`).join(" · ");

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Market Brief – ${region.name}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,-apple-system,sans-serif;color:#1a1a1a;padding:40px 48px;max-width:900px;margin:auto}
h1{font-size:20px;margin-bottom:4px}h2{font-size:14px;font-weight:600;margin:20px 0 8px;border-bottom:1px solid #e5e7eb;padding-bottom:4px}
.meta{font-size:11px;color:#6b7280;margin-bottom:16px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px}
.card{border:1px solid #e5e7eb;border-radius:8px;padding:12px}.card .label{font-size:10px;color:#6b7280}.card .value{font-size:22px;font-weight:700}
.card .sub{font-size:9px;color:#9ca3af}table{width:100%;border-collapse:collapse;font-size:12px}th,td{padding:6px 8px;border-bottom:1px solid #f3f4f6;text-align:left}
th{font-size:10px;color:#6b7280;font-weight:500;text-transform:uppercase}.systems{font-size:11px;color:#374151;margin-top:4px}
.footer{margin-top:24px;font-size:9px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:8px}
@media print{body{padding:24px 32px}}</style></head><body>
<h1>Market Brief: ${region.name}</h1>
<p class="meta">Michigan Access · Ambulatory Gap Analysis · ${date}</p>
<div class="grid">
<div class="card"><p class="label">Total Facilities</p><p class="value">${totalFacilities}</p><p class="sub">Across ${region.counties.length} counties</p></div>
<div class="card"><p class="label">High-Need Counties</p><p class="value">${highNeedCount}</p><p class="sub">SVI proxy ≥ 3</p></div>
<div class="card"><p class="label">System Networks</p><p class="value">${systemDensity.length}</p><p class="sub">Active in region</p></div></div>
<h2>County Access Gap Analysis</h2>
<table><thead><tr><th>County</th><th style="text-align:center">Population</th><th style="text-align:center">Facilities</th><th style="text-align:center">PCP Sites</th><th style="text-align:center">Vulnerability</th></tr></thead><tbody>${rows}</tbody></table>
${systemDensity.length > 0 ? `<h2>Regional System Presence</h2><p class="systems">${systemList}</p>` : ""}
<p class="footer">Vulnerability scores derived from uninsured rate, food insecurity, and primary care ratios. Not a clinical SVI — for planning purposes only. Source: Michigan Access (michiganaccess.lovable.app)</p>
</body></html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const w = window.open(url, "_blank");
  if (w) {
    w.onload = () => { w.print(); URL.revokeObjectURL(url); };
  } else {
    const a = document.createElement("a");
    a.href = url;
    a.download = `market-brief-${region.name.toLowerCase().replace(/\s+/g, "-")}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
