import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";
import { COUNTY_PROFILES } from "@/data/michigan-county-profiles";

interface CountyDeficit {
  county: string;
  food: number;
  broadband: number;
  transit: number;
  healthcare: number;
  svi: number;
  ej: number;
  energy: number;
  compound: number;
  tier: string;
  population: number;
}

function computeDeficits(): CountyDeficit[] {
  return Object.entries(COUNTY_PROFILES).map(([name, p]) => {
    const h = p.healthHighlights;
    const uninsured = parseFloat(h[0]?.value || "0");
    const food = parseFloat(h[2]?.value || "0");
    const isRural = p.countyType === "rural";
    const isUrban = p.countyType === "urban";

    const foodScore = food > 18 ? 80 : food > 14 ? 60 : food > 10 ? 40 : 20;
    const broadbandScore = isRural ? 70 : isUrban ? 20 : 35;
    const transitScore = isRural ? 85 : isUrban ? 25 : 55;
    const healthcareScore = uninsured > 8 ? 75 : uninsured > 5 ? 45 : 20;
    const sviScore = (uninsured + food) * 2.5;
    const ejScore = isUrban ? 55 : isRural ? 30 : 40;
    const energyScore = isRural ? 65 : isUrban ? 50 : 40;

    const compound = Math.round(
      (foodScore * 0.15 + broadbandScore * 0.15 + transitScore * 0.15 +
       healthcareScore * 0.20 + sviScore * 0.15 + ejScore * 0.10 + energyScore * 0.10) * 10
    ) / 10;

    const tier = compound >= 75 ? "Critical" : compound >= 50 ? "High" : compound >= 25 ? "Moderate" : "Low";

    return {
      county: name, food: foodScore, broadband: broadbandScore, transit: transitScore,
      healthcare: healthcareScore, svi: Math.min(sviScore, 100), ej: ejScore,
      energy: energyScore, compound, tier, population: p.population,
    };
  }).sort((a, b) => b.compound - a.compound);
}

const TIER_COLORS: Record<string, string> = {
  Critical: "bg-red-600 text-white",
  High: "bg-orange-500 text-white",
  Moderate: "bg-yellow-400 text-black",
  Low: "bg-green-600 text-white",
};

function MiniRadar({ data }: { data: CountyDeficit }) {
  const radarData = [
    { axis: "Food", value: data.food },
    { axis: "Broadband", value: data.broadband },
    { axis: "Transit", value: data.transit },
    { axis: "Healthcare", value: data.healthcare },
    { axis: "SVI", value: data.svi },
    { axis: "EJ", value: data.ej },
    { axis: "Energy", value: data.energy },
  ];

  return (
    <ResponsiveContainer width="100%" height={180}>
      <RadarChart data={radarData}>
        <PolarGrid stroke="hsl(214, 20%, 85%)" />
        <PolarAngleAxis dataKey="axis" tick={{ fontSize: 9 }} />
        <Tooltip formatter={(v: number) => [`${v.toFixed(0)}/100`]} />
        <Radar dataKey="value" stroke="hsl(0, 80%, 55%)" fill="hsl(0, 80%, 55%)" fillOpacity={0.2} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

export default function CompoundDeficitRanking() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const data = useMemo(() => computeDeficits(), []);

  const tierCounts = useMemo(() => {
    const counts = { Critical: 0, High: 0, Moderate: 0, Low: 0 };
    data.forEach((d) => { const t = d.tier as keyof typeof counts; if (t in counts) counts[t]++; });
    return counts;
  }, [data]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            Compound Access Deficit Index — 83 County Rankings
          </CardTitle>
          <CardDescription>
            Weighted index: food (15%) + broadband (15%) + transit (15%) + healthcare (20%) + SVI (15%) + EJ (10%) + energy (10%).
            Higher = more compounding barriers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Tier summary */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {(["Critical", "High", "Moderate", "Low"] as const).map((tier) => (
              <div key={tier} className="text-center rounded-lg border border-border p-2">
                <Badge className={`${TIER_COLORS[tier]} text-[10px] mb-1`}>{tier}</Badge>
                <p className="text-lg font-bold text-foreground">{tierCounts[tier]}</p>
                <p className="text-[9px] text-muted-foreground">counties</p>
              </div>
            ))}
          </div>

          {/* Rankings table */}
          <div className="space-y-1">
            {data.slice(0, 30).map((d, i) => (
              <div key={d.county}>
                <button
                  onClick={() => setExpanded(expanded === d.county ? null : d.county)}
                  className="w-full flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted transition-colors text-left"
                >
                  <span className="text-xs text-muted-foreground w-6 text-right tabular-nums">{i + 1}</span>
                  <span className="text-sm font-medium text-foreground flex-1">{d.county}</span>
                  <span className="text-sm font-bold text-foreground tabular-nums w-12 text-right">{d.compound.toFixed(1)}</span>
                  <Badge className={`${TIER_COLORS[d.tier]} text-[9px] w-16 justify-center`}>{d.tier}</Badge>
                  <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${expanded === d.county ? "rotate-180" : ""}`} />
                </button>
                {expanded === d.county && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="px-3 pb-3 overflow-hidden"
                  >
                    <div className="grid gap-4 sm:grid-cols-2 p-3 bg-muted/30 rounded-lg">
                      <MiniRadar data={d} />
                      <div className="space-y-1 text-xs">
                        <p className="text-muted-foreground">Population: {d.population.toLocaleString()}</p>
                        <p>Food: {d.food}/100 · Broadband: {d.broadband}/100</p>
                        <p>Transit: {d.transit}/100 · Healthcare: {d.healthcare}/100</p>
                        <p>SVI: {d.svi.toFixed(0)}/100 · EJ: {d.ej}/100 · Energy: {d.energy}/100</p>
                        <Link to={`/brief?county=${d.county}`} className="text-primary hover:underline text-xs mt-2 block">
                          View county brief →
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
          </div>

          <p className="text-[10px] text-muted-foreground mt-4">
            Showing top 30. Compound index uses county-profile proxies until tract-level data is seeded.
            Source: Access Michigan Compound Index v1 methodology.{" "}
            <Link to="/methodology" className="text-primary hover:underline">Full methodology →</Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
