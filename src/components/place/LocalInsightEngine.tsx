/**
 * Local Insight Engine — renders cross-domain indicators with comparators,
 * directionality, "What stands out" section, and full provenance.
 */
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Heart, Home, Zap, Droplets, Bus, Shield, GraduationCap, Apple,
  TrendingUp, TrendingDown, AlertTriangle, Info, ExternalLink, Minus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Place, PlaceIndicator } from "@/models/Place";
import { buildPlaceIndicators, buildStandouts } from "@/models/Place";

const DOMAIN_ICONS: Record<string, React.ElementType> = {
  health: Heart,
  housing: Home,
  energy: Zap,
  environment: Droplets,
  transportation: Bus,
  safety: Shield,
  education: GraduationCap,
  food: Apple,
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.3 } }),
};

function DeltaChip({ value, stateAvg, direction }: { value: number; stateAvg: number; direction: string }) {
  const diff = value - stateAvg;
  if (Math.abs(diff) < 0.1 || stateAvg === 0) return <Minus className="h-3 w-3 text-muted-foreground" />;
  const isBetter = direction === "lower-is-better" ? diff < 0 : diff > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold ${isBetter ? "text-michigan-forest" : "text-destructive"}`}>
      {isBetter ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
      {diff > 0 ? "+" : ""}{diff.toFixed(1)} vs state
    </span>
  );
}

export default function LocalInsightEngine({ place }: { place: Place }) {
  const indicators = useMemo(() => buildPlaceIndicators(place), [place]);
  const standouts = useMemo(() => buildStandouts(indicators), [indicators]);

  return (
    <div className="space-y-8">
      {/* What Stands Out */}
      {standouts.length > 0 && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" /> What stands out here
          </p>
          <ul className="space-y-1.5">
            {standouts.map(s => (
              <li key={s.label} className="flex items-center gap-2 text-sm text-foreground">
                <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${s.direction === "worse" ? "bg-destructive" : s.direction === "better" ? "bg-michigan-forest" : "bg-muted-foreground"}`} />
                <span className="font-medium">{s.label}:</span>
                <span className="text-muted-foreground">{s.delta}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Fallback Notice */}
      {place.isFallback && (
        <div className="rounded-lg border border-michigan-gold/20 bg-michigan-gold/5 px-4 py-3">
          <p className="text-xs text-muted-foreground flex items-start gap-1.5">
            <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-michigan-gold" />
            <span>
              <strong>Data grain:</strong> {place.geoGrainLabel}.
              {place.fallbackLabel && <> Showing <strong>{place.fallbackLabel}</strong>.</>}
              {" "}True {place.placeType}-level data is limited in public datasets.{" "}
              <Link to="/data-validation" className="text-primary hover:underline">Why this fallback →</Link>
            </span>
          </p>
        </div>
      )}

      {/* Indicator Grid */}
      <section>
        <h2 className="text-xl font-bold text-foreground mb-5 flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" /> Cross-Domain Indicators
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <TooltipProvider delayDuration={200}>
            {indicators.map((ind, i) => {
              const Icon = DOMAIN_ICONS[ind.domain] || Heart;
              return (
                <motion.div key={ind.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                  <Card className="h-full hover:shadow-md transition-shadow">
                    <CardContent className="py-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Icon className="h-3.5 w-3.5 text-primary" />
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{ind.label}</p>
                        </div>
                        <DeltaChip value={ind.numericValue} stateAvg={ind.stateAvg} direction={ind.direction} />
                      </div>
                      <p className="text-2xl font-bold text-foreground">{ind.value}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{ind.implication}</p>
                      <div className="flex items-center justify-between pt-1 border-t border-border/50">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-[10px] text-muted-foreground cursor-help underline decoration-dotted">
                              {ind.source}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="max-w-xs">
                            <p className="text-xs"><strong>Source:</strong> {ind.source}</p>
                            <p className="text-xs"><strong>Updated:</strong> {ind.updated}</p>
                            <p className="text-xs"><strong>Grain:</strong> {ind.grain}</p>
                          </TooltipContent>
                        </Tooltip>
                        <Badge variant="outline" className="text-[9px] h-4 px-1.5">{ind.grain.split(" ")[0]}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </TooltipProvider>
        </div>
      </section>
    </div>
  );
}
