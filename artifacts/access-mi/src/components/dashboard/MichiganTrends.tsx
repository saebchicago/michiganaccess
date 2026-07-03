import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, HelpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendChart } from "@/components/charts/TrendChart";
import {
  TREND_LABELS,
  type TrendClassification,
  type TrendDirection,
  classify,
} from "@/lib/trend";
import { MICHIGAN_TRENDS } from "@/data/michigan-trends";

const CLASS_BADGE: Record<TrendClassification, string> = {
  IMPROVING: "text-michigan-forest-deep",
  STABLE: "text-muted-foreground",
  CONCERN: "text-amber-700",
  INSUFFICIENT: "text-muted-foreground",
};

function ClassIcon({ label }: { label: TrendClassification }) {
  if (label === "IMPROVING") return <TrendingDown className="h-3 w-3" />;
  if (label === "CONCERN") return <TrendingUp className="h-3 w-3" />;
  if (label === "STABLE") return <Minus className="h-3 w-3" />;
  return <HelpCircle className="h-3 w-3" />;
}

export default function MichiganTrends() {
  const trendKeys = Object.keys(
    MICHIGAN_TRENDS,
  ) as (keyof typeof MICHIGAN_TRENDS)[];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="space-y-4"
    >
      <div className="text-center mb-2">
        <Badge
          variant="outline"
          className="mb-2 text-xs uppercase tracking-wider border-primary/30 text-primary"
        >
          Temporal Depth
        </Badge>
        <h2 className="text-xl font-bold text-foreground">
          Michigan Over Time
        </h2>
        <p className="text-sm text-muted-foreground">
          8-year trends from published state and federal data
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {trendKeys.map((key) => {
          const trend = MICHIGAN_TRENDS[key];
          const latest = trend.data[trend.data.length - 1];
          const points = trend.data.map((p) => ({
            vintage: p.year,
            value: p.value,
          }));
          const direction: TrendDirection =
            trend.improving === "down" ? "down_is_better" : "up_is_better";
          const classification = classify(points, direction);

          return (
            <Card key={key} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">
                      {trend.label}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {latest.value.toLocaleString()}
                      {trend.unit}
                    </p>
                  </div>
                  <div
                    className={`flex items-center gap-1 text-xs font-medium ${CLASS_BADGE[classification]}`}
                    aria-label={`Trend classification: ${TREND_LABELS[classification]}`}
                  >
                    <ClassIcon label={classification} />
                    {TREND_LABELS[classification]}
                  </div>
                </div>

                <TrendChart
                  data={points}
                  direction={direction}
                  unit={trend.unit}
                  height={100}
                  overrideColor={trend.color}
                  classification={classification}
                  ariaLabel={`${trend.label} trend, ${points[0].vintage} to ${points[points.length - 1].vintage}`}
                />

                <p className="text-[10px] text-muted-foreground leading-relaxed mt-2">
                  {trend.insight}
                </p>
                <p className="text-[9px] text-muted-foreground mt-1">
                  Source: {trend.source}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </motion.div>
  );
}
