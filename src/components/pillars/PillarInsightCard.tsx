/**
 * Reusable Pillar Insight Card
 *
 * Accepts { geography, metricConfig, data } and renders patterns like:
 *  - metric per 10,000 residents
 *  - percentile within county/state
 *  - proximity/distance bands
 *  - need vs capacity
 *  - side-by-side comparison
 *
 * Shows "data not yet available" when data is empty or pending.
 */

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, TrendingUp, TrendingDown, Minus, MapPin } from "lucide-react";
import type { GeoDimension } from "@/models/GeoDimension";
import { ratePer, percentileRank } from "@/models/GeoDimension";

export type InsightPattern =
  | "rate-per-population"
  | "percentile"
  | "proximity"
  | "need-vs-capacity"
  | "comparison"
  | "count-summary";

export interface PillarInsightCardProps {
  title: string;
  pattern: InsightPattern;
  geography: GeoDimension;
  /** The primary value */
  value: number | string | null;
  /** Secondary value for comparison */
  compareValue?: number | string | null;
  /** Compare label */
  compareLabel?: string;
  /** Unit for display */
  unit?: string;
  /** Per-N for rate calculations */
  perPopulation?: number;
  /** Percentile distribution values */
  distribution?: number[];
  /** Source attribution */
  source?: string;
  /** Status of the underlying dataset */
  status?: "live" | "pending" | "error" | "empty";
  /** Optional description */
  description?: string;
  /** Icon component */
  icon?: React.ComponentType<{ className?: string }>;
}

function TrendIndicator({ current, compare }: { current: number; compare: number }) {
  if (current > compare) return <TrendingUp className="h-3.5 w-3.5 text-red-500" aria-label="Above average" />;
  if (current < compare) return <TrendingDown className="h-3.5 w-3.5 text-green-500" aria-label="Below average" />;
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" aria-label="At average" />;
}

function DataUnavailable({ reason }: { reason: string }) {
  return (
    <div className="flex items-center gap-2 py-4" role="status">
      <AlertCircle className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      <span className="text-sm text-muted-foreground">{reason}</span>
    </div>
  );
}

export default function PillarInsightCard({
  title,
  pattern,
  geography,
  value,
  compareValue,
  compareLabel,
  unit = "",
  perPopulation = 10000,
  distribution,
  source,
  status = "live",
  description,
  icon: Icon,
}: PillarInsightCardProps) {
  // Handle unavailable states
  if (status === "pending") {
    return (
      <Card>
        <CardContent className="p-5">
          <h3 className="font-semibold text-sm text-foreground mb-1">{title}</h3>
          <DataUnavailable reason="Data not yet available — dataset registered but ingestion pending." />
          {source && <p className="text-[10px] text-muted-foreground mt-2">Source: {source}</p>}
        </CardContent>
      </Card>
    );
  }

  if (status === "error") {
    return (
      <Card>
        <CardContent className="p-5">
          <h3 className="font-semibold text-sm text-foreground mb-1">{title}</h3>
          <DataUnavailable reason="Unable to load data. Please try again later." />
        </CardContent>
      </Card>
    );
  }

  if (value === null || value === undefined) {
    return (
      <Card>
        <CardContent className="p-5">
          <h3 className="font-semibold text-sm text-foreground mb-1">{title}</h3>
          <DataUnavailable reason={`No data available for ${geography.countyName ?? "this area"}.`} />
          {source && <p className="text-[10px] text-muted-foreground mt-2">Source: {source}</p>}
        </CardContent>
      </Card>
    );
  }

  // Compute derived values based on pattern
  let displayValue: string = String(value);
  let percentile: number | null = null;

  if (pattern === "rate-per-population" && typeof value === "number" && geography.population) {
    const rate = ratePer(value, geography.population, perPopulation);
    displayValue = `${rate}`;
    unit = unit || `per ${perPopulation.toLocaleString()}`;
  }

  if (pattern === "percentile" && typeof value === "number" && distribution) {
    percentile = percentileRank(value, distribution);
  }

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-5 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {Icon && (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
              </div>
            )}
            <h3 className="font-semibold text-sm text-foreground leading-tight">{title}</h3>
          </div>
          {status === "live" && (
            <Badge variant="outline" className="text-[10px] shrink-0 text-green-600 border-green-300">
              Live
            </Badge>
          )}
        </div>

        {/* Main metric */}
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-foreground">{displayValue}</span>
          {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
        </div>

        {/* Percentile bar */}
        {percentile !== null && (
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>State percentile</span>
              <span className="font-medium">{percentile}th</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden" role="progressbar" aria-valuenow={percentile} aria-valuemin={0} aria-valuemax={100}>
              <div
                className={`h-full rounded-full transition-all ${percentile > 75 ? "bg-red-500" : percentile > 50 ? "bg-amber-500" : "bg-green-500"}`}
                style={{ width: `${percentile}%` }}
              />
            </div>
          </div>
        )}

        {/* Comparison */}
        {pattern === "comparison" && compareValue !== null && compareValue !== undefined && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {typeof value === "number" && typeof compareValue === "number" && (
              <TrendIndicator current={value} compare={compareValue} />
            )}
            <span>{compareLabel ?? "State average"}: {String(compareValue)}{unit ? ` ${unit}` : ""}</span>
          </div>
        )}

        {/* Need vs capacity */}
        {pattern === "need-vs-capacity" && compareValue !== null && compareValue !== undefined && (
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Need (outcome metric)</span>
              <span className="font-medium text-foreground">{String(value)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Capacity (providers)</span>
              <span className="font-medium text-foreground">{String(compareValue)}</span>
            </div>
            {typeof value === "number" && typeof compareValue === "number" && value > 0 && compareValue < value && (
              <p className="text-amber-600 dark:text-amber-400 font-medium mt-1">
                ⚠ Capacity gap detected — need exceeds available resources.
              </p>
            )}
          </div>
        )}

        {/* Proximity */}
        {pattern === "proximity" && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" aria-hidden="true" />
            <span>Nearest: {displayValue} {unit}</span>
          </div>
        )}

        {/* Description */}
        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
        )}

        {/* Source */}
        {source && (
          <p className="text-[10px] text-muted-foreground pt-1 border-t border-border/30">
            Source: {source}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
