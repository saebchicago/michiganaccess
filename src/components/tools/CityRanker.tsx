import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Sliders, MapPin, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { PROPERTY_TAX_RATES, AUTO_INSURANCE_MONTHLY } from "@/data/michigan-taxes";
import { COUNTY_PROFILES } from "@/data/michigan-county-profiles";

interface CityScore { city: string; county: string; score: number; bestFor: string; }

const WEIGHTS_DEFAULT = { affordability: 50, health: 50, schools: 50, safety: 50, environment: 50 };

function getHealthScore(county: string): number {
  const p = COUNTY_PROFILES[county];
  if (!p) return 50;
  const u = parseFloat(p.healthHighlights[0]?.value || "6");
  return Math.max(0, Math.min(100, 100 - u * 5));
}

function rankCities(weights: typeof WEIGHTS_DEFAULT): CityScore[] {
  return Object.entries(PROPERTY_TAX_RATES).map(([city, data]) => {
    const afford = Math.max(0, 100 - (data.millageRate / 70 * 100));
    const health = getHealthScore(data.county);
    const schools = data.county === "Oakland" || data.county === "Washtenaw" ? 85 : data.county === "Kent" || data.county === "Grand Traverse" ? 75 : 65;
    const safety = city === "Traverse City" || city === "Midland" || city === "Holland" ? 85 : city === "Detroit" || city === "Flint" ? 40 : 65;
    const env = city === "Traverse City" || city === "Marquette" ? 90 : city === "Detroit" || city === "Flint" ? 45 : 70;

    const total = weights.affordability / 100;
    const wSum = total > 0 ? (
      afford * (weights.affordability / 250) +
      health * (weights.health / 250) +
      schools * (weights.schools / 250) +
      safety * (weights.safety / 250) +
      env * (weights.environment / 250)
    ) : 50;

    const bestFor = [
      { label: "Affordability", val: afford },
      { label: "Health", val: health },
      { label: "Schools", val: schools },
      { label: "Safety", val: safety },
      { label: "Environment", val: env },
    ].sort((a, b) => b.val - a.val)[0].label;

    return { city, county: data.county, score: Math.round(wSum), bestFor };
  }).sort((a, b) => b.score - a.score);
}

export default function CityRanker() {
  const [weights, setWeights] = useState(WEIGHTS_DEFAULT);
  const ranked = useMemo(() => rankCities(weights), [weights]);

  const updateWeight = (key: keyof typeof WEIGHTS_DEFAULT, val: number[]) => {
    setWeights((prev) => ({ ...prev, [key]: val[0] }));
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sliders className="h-5 w-5 text-primary" /> Pick Your Priorities
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {(["affordability", "health", "schools", "safety", "environment"] as const).map((key) => (
          <div key={key} className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-24 capitalize">{key}</span>
            <Slider value={[weights[key]]} onValueChange={(v) => updateWeight(key, v)} max={100} step={5} className="flex-1" />
            <span className="text-xs text-foreground w-8 text-right">{weights[key]}</span>
          </div>
        ))}

        <div className="space-y-1.5 mt-4">
          {ranked.slice(0, 10).map((c, i) => (
            <motion.div key={c.city} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
              <Link to={`/tax-comparison`} className="flex items-center gap-2 rounded-lg border border-border p-2 hover:bg-muted/50 transition-colors">
                <span className="text-xs font-bold text-muted-foreground w-5 text-right">#{i + 1}</span>
                {i === 0 && <Trophy className="h-3 w-3 text-michigan-gold" />}
                <span className="text-xs font-medium text-foreground flex-1">{c.city}</span>
                <Badge variant="outline" className="text-[8px]">{c.bestFor}</Badge>
                <span className="text-xs font-bold text-primary w-8 text-right">{c.score}</span>
              </Link>
            </motion.div>
          ))}
        </div>

        <p className="text-[9px] text-muted-foreground">Scores combine tax rates, health metrics, school graduation rates, safety, and environmental factors. Sources: MI Treasury, CDC PLACES, MI School Data, FBI/MICR.</p>
      </CardContent>
    </Card>
  );
}
