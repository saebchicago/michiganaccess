import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import { MapPin, Globe, Building2 } from "lucide-react";
import { GeoResolutionBadge } from "@/components/shared/GeoResolutionBadge";
import type { GeoResolution } from "@/types/data-layers";

export type SnapshotMetric = {
  id: string;
  label: string;
  value: number | string;
  unit?: string;
  trend?: number[];
  years?: number[];
  /** 0-100 rank against the MI distribution for this metric.
   *  Convention: HIGHER percentile = BETTER outcome. */
  percentile?: number;
  geoResolution?: GeoResolution;
  /** Name of the county the value reflects, used for the ZIP-context note. */
  countyName?: string;
  /** Primary-source label (publisher + dataset). Required on tiles whose value is a literal. */
  source?: string;
  /** Vintage of the underlying data (e.g. "2022", "HPS Wave 48 (Aug 2022)"). */
  vintage?: string;
};

export type SnapshotCardProps = {
  title: string;
  geographyType: "state" | "region" | "county";
  metrics: SnapshotMetric[];
  /**
   * Set when this card renders inside a ZIP page. When true, county-level
   * tiles render an extra inline note so visitors know the figure reflects
   * the containing county rather than the ZIP alone.
   */
  zipContext?: { zip: string };
};

const GEO_LABELS: Record<string, { label: string; icon: typeof Globe }> = {
  state: { label: "Statewide", icon: Globe },
  region: { label: "Region", icon: MapPin },
  county: { label: "County", icon: Building2 },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.25 },
  }),
};

function Sparkline({ data, years }: { data: number[]; years?: number[] }) {
  const chartData = data.map((v, i) => ({ v, yr: years?.[i] ?? i }));
  const improving = data.length >= 2 && data[data.length - 1] <= data[0];
  return (
    <div className="h-10 w-full mt-1">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <YAxis domain={["dataMin - 0.3", "dataMax + 0.3"]} hide />
          <Line
            type="monotone"
            dataKey="v"
            stroke={
              improving
                ? "hsl(var(--michigan-forest))"
                : "hsl(var(--michigan-coral))"
            }
            strokeWidth={1.5}
            dot={{ r: 1.5, fill: "hsl(var(--background))", strokeWidth: 1 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function ordinalSuffix(n: number): string {
  const abs = Math.abs(Math.trunc(n));
  const lastTwo = abs % 100;
  if (lastTwo >= 11 && lastTwo <= 13) return "th";
  switch (abs % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

function PercentileBar({ value }: { value: number }) {
  const color =
    value >= 75
      ? "bg-michigan-forest"
      : value >= 40
        ? "bg-michigan-gold"
        : "bg-destructive";
  return (
    <div className="mt-1.5 space-y-0.5">
      <div className="relative h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div className="absolute inset-y-0 left-0 rounded-full bg-muted-foreground/20 w-full" />
        <div
          className={`absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full border-2 border-background ${color}`}
          style={{ left: `calc(${Math.min(value, 100)}% - 6px)` }}
        />
      </div>
      <p className="text-[9px] text-muted-foreground text-right">
        {value}
        {ordinalSuffix(value)} percentile
      </p>
    </div>
  );
}

export default function SnapshotCard({
  title,
  geographyType,
  metrics,
  zipContext,
}: SnapshotCardProps) {
  const geo = GEO_LABELS[geographyType];
  const Icon = geo.icon;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        <Badge
          variant="outline"
          className="text-[10px] uppercase tracking-wider ml-auto"
        >
          {geo.label}
        </Badge>
      </div>
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {metrics.map((m, i) => (
          <motion.div
            key={m.id}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={i}
          >
            <Card className="h-full hover-lift">
              <CardContent className="py-3 space-y-1">
                <p className="text-[11px] text-muted-foreground font-medium">
                  {m.label}
                </p>
                <p className="text-xl font-bold text-foreground">
                  {m.value}
                  {m.unit && (
                    <span className="text-sm font-normal text-muted-foreground ml-0.5">
                      {m.unit}
                    </span>
                  )}
                </p>
                {m.geoResolution && (
                  <div className="pt-1">
                    <GeoResolutionBadge
                      resolution={m.geoResolution}
                      countyName={m.countyName}
                      zip={zipContext?.zip}
                    />
                  </div>
                )}
                {zipContext && m.geoResolution === "county" && m.countyName && (
                  <p className="pt-1 text-[10px] leading-snug text-muted-foreground italic">
                    Reflects {m.countyName} County, which contains ZIP{" "}
                    {zipContext.zip}. Not specific to the ZIP.
                  </p>
                )}
                {(m.source || m.vintage) && (
                  <p className="pt-1 text-[10px] leading-snug text-muted-foreground/80">
                    {m.source}
                    {m.source && m.vintage ? " - " : ""}
                    {m.vintage}
                  </p>
                )}
                {m.trend && m.trend.length >= 2 && (
                  <Sparkline data={m.trend} years={m.years} />
                )}
                {m.percentile !== undefined && (
                  <PercentileBar value={m.percentile} />
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
