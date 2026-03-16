import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Activity, HeartPulse, ShieldPlus, TimerReset } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { TREND_EXPLORER_SERIES } from "@/data/michigan-intelligence";

const trendIcons = {
  lifeExpectancy: HeartPulse,
  diabetes: Activity,
  primaryCareAccess: ShieldPlus,
  obesity: TimerReset,
};

const trendLabels = {
  lifeExpectancy: "Life expectancy",
  diabetes: "Diabetes",
  primaryCareAccess: "Primary care access",
  obesity: "Obesity",
};

const trendUnits = {
  lifeExpectancy: "yrs",
  diabetes: "%",
  primaryCareAccess: "index",
  obesity: "%",
};

export default function TrendExplorer() {
  const [selectedIndex, setSelectedIndex] = useState(TREND_EXPLORER_SERIES.length - 1);
  const selectedPoint = TREND_EXPLORER_SERIES[selectedIndex];

  const highlightCards = useMemo(() => {
    return (Object.keys(trendIcons) as Array<keyof typeof trendIcons>).map((key) => ({
      id: key,
      icon: trendIcons[key],
      label: trendLabels[key],
      value: selectedPoint[key],
      unit: trendUnits[key],
    }));
  }, [selectedPoint]);

  return (
    <Card className="border-border/60 bg-card/90 shadow-sm">
      <CardContent className="space-y-6 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] uppercase tracking-[0.2em]">
                Trend Explorer
              </Badge>
              <span className="text-xs text-muted-foreground">2000–present</span>
            </div>
            <h3 className="text-lg font-semibold text-foreground">See how Michigan’s health profile changes over time</h3>
            <p className="text-sm text-muted-foreground">
              Move across the timeline to understand how life expectancy, chronic disease, and access evolved together.
            </p>
          </div>
          <div className="min-w-[220px] rounded-2xl border border-border/60 bg-background px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Selected year</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{selectedPoint.year}</p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {highlightCards.map((card) => (
            <motion.div
              key={card.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="h-full border-border/60 bg-background/80">
                <CardContent className="space-y-2 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <card.icon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{card.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {card.value}
                    <span className="ml-1 text-sm font-medium text-muted-foreground">{card.unit}</span>
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="space-y-3">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={TREND_EXPLORER_SERIES}>
              <defs>
                <linearGradient id="lifeExpectancy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="diabetes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <RechartsTooltip
                contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }}
                formatter={(value: number, key: keyof typeof trendLabels) => [`${value} ${trendUnits[key]}`, trendLabels[key]]}
              />
              <Area type="monotone" dataKey="lifeExpectancy" stroke="#0ea5e9" fill="url(#lifeExpectancy)" strokeWidth={2.5} />
              <Area type="monotone" dataKey="diabetes" stroke="#ef4444" fill="url(#diabetes)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>

          <Slider
            value={[selectedIndex]}
            min={0}
            max={TREND_EXPLORER_SERIES.length - 1}
            step={1}
            onValueChange={([value]) => setSelectedIndex(value)}
            aria-label="Select a year in the trend explorer"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>{TREND_EXPLORER_SERIES[0].year}</span>
            <span className="font-medium text-foreground">{selectedPoint.year} highlight</span>
            <span>{TREND_EXPLORER_SERIES[TREND_EXPLORER_SERIES.length - 1].year}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
