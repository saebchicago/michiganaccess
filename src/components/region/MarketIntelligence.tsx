import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, MapPin, AlertTriangle, Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

      <p className="text-[9px] text-muted-foreground">
        Vulnerability scores derived from uninsured rate, food insecurity, and primary care ratios. Not a clinical SVI — for planning purposes only.
      </p>
    </section>
  );
}
