/**
 * Community Summary Engine - "3 Things to Know About [Place]"
 * Auto-ranks indicators by deviation from Michigan averages.
 */
import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Place, PlaceIndicator } from "@/models/Place";
import { buildFullIndicators, STATE_AVERAGES } from "@/models/Place";

function DeltaBadge({ value, stateAvg, direction }: { value: number; stateAvg: number; direction: string }) {
  const diff = value - stateAvg;
  const pct = stateAvg !== 0 ? Math.abs(diff / stateAvg * 100) : 0;
  if (pct < 5) return <Badge variant="secondary" className="text-[10px] gap-0.5 h-5"><Minus className="h-3 w-3" /> ≈ Michigan avg</Badge>;
  const isBetter = direction === "lower-is-better" ? diff < 0 : diff > 0;
  return (
    <Badge variant={isBetter ? "outline" : "destructive"} className={`text-[10px] gap-0.5 h-5 ${isBetter ? "border-michigan-forest text-michigan-forest bg-michigan-forest/5" : ""}`}>
      {isBetter ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
      {isBetter ? "Better" : "Worse"} than MI avg
    </Badge>
  );
}

function getPercentileLabel(value: number, stateAvg: number, direction: string): string {
  const ratio = value / stateAvg;
  if (direction === "lower-is-better") {
    if (ratio < 0.7) return "Top 20%";
    if (ratio < 0.9) return "Above avg";
    if (ratio > 1.3) return "Bottom 20%";
    if (ratio > 1.1) return "Below avg";
    return "Average";
  }
  if (ratio > 1.3) return "Top 20%";
  if (ratio > 1.1) return "Above avg";
  if (ratio < 0.7) return "Bottom 20%";
  if (ratio < 0.9) return "Below avg";
  return "Average";
}

export default function CommunitySummary({ place }: { place: Place }) {
  const indicators = useMemo(() => buildFullIndicators(place), [place]);

  const topInsights = useMemo(() => {
    const ranked = indicators
      .filter(ind => ind.numericValue !== 0 && ind.stateAvg !== 0)
      .map(ind => {
        const diff = ind.numericValue - ind.stateAvg;
        const pct = Math.abs(diff / ind.stateAvg * 100);
        const isBetter = ind.direction === "lower-is-better" ? diff < 0 : diff > 0;
        return { ...ind, absPct: pct, isBetter, diff };
      })
      .sort((a, b) => b.absPct - a.absPct)
      .slice(0, 3);
    return ranked;
  }, [indicators]);

  if (topInsights.length === 0) return null;

  return (
    <motion.section
      id="community-summary"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border-2 border-primary/15 bg-gradient-to-br from-primary/5 via-background to-accent/5 p-5 md:p-7"
    >
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">
          3 Things to Know About {place.name.replace(/ County$/, "").replace(/^ZIP /, "ZIP ")}
        </h2>
      </div>

      <div className="space-y-4">
        {topInsights.map((insight, i) => (
          <div key={insight.id} className="flex items-start gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-foreground">{insight.label}</span>
                <DeltaBadge value={insight.numericValue} stateAvg={insight.stateAvg} direction={insight.direction} />
                <Badge variant="outline" className="text-[9px] h-4 px-1.5">{getPercentileLabel(insight.numericValue, insight.stateAvg, insight.direction)}</Badge>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-foreground">{insight.value}</span>
                <span className="text-xs text-muted-foreground">
                  vs {insight.stateAvg}{insight.unit === "$" ? "" : insight.unit} state avg
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{insight.implication}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Mini sparkline placeholder */}
      <div className="mt-4 flex items-center gap-2 text-[10px] text-muted-foreground">
        <div className="flex gap-px">
          {[3, 5, 4, 6, 5, 7, 6, 8, 7, 6].map((h, i) => (
            <div key={i} className="w-1 rounded-full bg-primary/20" style={{ height: `${h * 2}px` }} />
          ))}
        </div>
        <span>Trend data coming soon</span>
      </div>
    </motion.section>
  );
}
