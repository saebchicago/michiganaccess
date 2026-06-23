import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Sliders, MapPin, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { PROPERTY_TAX_RATES } from "@/data/michigan-taxes";
import { COUNTY_PROFILES } from "@/data/michigan-county-profiles";
import { COUNTY_CROSS_DOMAIN } from "@/data/cross-domain-indicators";

interface CityScore { city: string; county: string; score: number; bestFor: string[]; dimensions: Record<string, number>; }

const WEIGHTS_DEFAULT = { affordability: 50, health: 50, schools: 50, safety: 50, environment: 50 };

function getHealthScore(county: string): number {
  const p = COUNTY_PROFILES[county];
  if (!p) return 50;
  const u = parseFloat(p.healthHighlights[0]?.value || "6");
  const food = parseFloat(p.healthHighlights[2]?.value || "12");
  return Math.max(0, Math.min(100, 100 - (u * 4 + food * 1.5)));
}

function getSchoolScore(county: string): number {
  const cd = COUNTY_CROSS_DOMAIN[county];
  if (!cd?.hsGradRate) return 65;
  return Math.max(0, Math.min(100, cd.hsGradRate));
}

function getSafetyScore(county: string): number {
  const cd = COUNTY_CROSS_DOMAIN[county];
  if (!cd?.violentCrimeRate) return 65;
  // Lower crime = higher safety. 0 crime → 100, 1500+ → ~20
  return Math.max(20, Math.min(100, Math.round(100 - cd.violentCrimeRate / 18)));
}

function getEnvironmentScore(county: string): number {
  const cd = COUNTY_CROSS_DOMAIN[county];
  const water = cd?.drinkingWaterCompliance ?? 90;
  const profile = COUNTY_PROFILES[county];
  const isRural = profile?.countyType === "rural";
  // Rural counties get a nature bonus, water compliance matters
  return Math.max(30, Math.min(100, Math.round(water * 0.7 + (isRural ? 30 : profile?.countyType === "suburban" ? 20 : 10))));
}

function rankCities(weights: typeof WEIGHTS_DEFAULT): CityScore[] {
  const totalWeight = weights.affordability + weights.health + weights.schools + weights.safety + weights.environment;
  if (totalWeight === 0) return [];

  return Object.entries(PROPERTY_TAX_RATES).map(([city, data]) => {
    const afford = Math.max(0, 100 - (data.millageRate / 70 * 100));
    const health = getHealthScore(data.county);
    const schools = getSchoolScore(data.county);
    const safety = getSafetyScore(data.county);
    const env = getEnvironmentScore(data.county);

    const wSum = (
      afford * weights.affordability +
      health * weights.health +
      schools * weights.schools +
      safety * weights.safety +
      env * weights.environment
    ) / totalWeight;

    const dims = [
      { label: "Affordability", val: afford },
      { label: "Health", val: health },
      { label: "Schools", val: schools },
      { label: "Safety", val: safety },
      { label: "Environment", val: env },
    ].sort((a, b) => b.val - a.val);

    const bestFor = dims.slice(0, 2).map((d) => d.label);

    return {
      city,
      county: data.county,
      score: Math.round(wSum),
      bestFor,
      dimensions: { Affordability: afford, Health: health, Schools: schools, Safety: safety, Environment: env },
    };
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
          {ranked.slice(0, 25).map((c, i) => (
            <motion.div key={c.city} layout initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}>
              <Link to={`/county/${c.county.toLowerCase().replace(/\s+/g, "-")}`} className="flex items-center gap-2 rounded-lg border border-border p-2 min-h-[44px] hover:bg-muted/50 transition-colors">
                <span className="text-xs font-bold text-muted-foreground w-5 text-right">#{i + 1}</span>
                {i === 0 && <Trophy className="h-3 w-3 text-michigan-gold-deep" />}
                <span className="text-xs font-medium text-foreground flex-1">
                  {c.city} <span className="text-muted-foreground font-normal">({c.county} Co.)</span>
                </span>
                <div className="hidden sm:flex gap-1">
                  {c.bestFor.map((b) => (
                    <Badge key={b} variant="outline" className="text-[8px]">{b}</Badge>
                  ))}
                </div>
                <span className="text-xs font-bold text-primary w-8 text-right">{c.score}</span>
              </Link>
            </motion.div>
          ))}
        </div>

        <p className="text-[9px] text-muted-foreground">
          Scores combine property tax millage rates, CDC health metrics, HS graduation rates (NCES), FBI/MICR crime data, and EGLE environmental data across 25 Michigan cities. Adjust sliders to weight what matters most to you.
        </p>
      </CardContent>
    </Card>
  );
}
