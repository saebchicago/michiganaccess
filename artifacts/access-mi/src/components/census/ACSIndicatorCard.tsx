/**
 * ACSIndicatorCard - displays a single ACS metric with comparison to state avg
 * and a "So What?" contextual tooltip.
 */
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import { useCensusACS, getCensusValue, getCensusMOE } from "@/hooks/useCensusACS";
import { getCountyFips } from "@/data/census-geographies";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getReliability } from "@/lib/reliability";
import { SuppressedEstimate, MoeUnavailableNote } from "@/components/shared/ReliabilityNote";

interface Props {
  countyName: string;
  tableId: string;
  variableCode: string;
  label: string;
  unit: "dollars" | "count" | "percent" | "ratio";
  stateAvgOverride?: number;
  direction?: "higher-is-better" | "lower-is-better";
  denominatorCode?: string;
}

/** Contextual "So What?" micro-copy based on metric type and value */
function getSoWhat(label: string, numericVal: number | null, stateVal: number | null, unit: string): string | null {
  if (numericVal === null) return null;
  const l = label.toLowerCase();
  if (l.includes("median household income")) {
    const monthly = Math.round(numericVal / 12);
    return `That's roughly $${monthly.toLocaleString()}/month before taxes for a typical household.`;
  }
  if (l.includes("rent") && unit === "dollars") {
    return `Average monthly housing cost. HUD considers >30% of income "cost-burdened."`;
  }
  if (l.includes("poverty")) {
    return `Percent of residents below the federal poverty threshold - affects eligibility for Medicaid, SNAP, and LIHEAP.`;
  }
  if (l.includes("unemploy")) {
    return `Share of the labor force actively seeking work. Higher rates may signal fewer local job opportunities.`;
  }
  if (l.includes("bachelor")) {
    return `Adults 25+ with a 4-year degree. Higher education correlates with better health outcomes.`;
  }
  if (l.includes("owner-occupied") || l.includes("homeowner")) {
    return `Homeownership builds generational wealth and neighborhood stability.`;
  }
  if (l.includes("renter")) {
    return `Higher renter share often means more residents are sensitive to rent increases.`;
  }
  return null;
}

export default function ACSIndicatorCard({
  countyName, tableId, variableCode, label, unit,
  stateAvgOverride, direction = "higher-is-better", denominatorCode,
}: Props) {
  const fips = getCountyFips(countyName);

  const { data, isLoading } = useCensusACS({
    tables: [tableId], geoType: "county", geoFips: fips || "", enabled: !!fips,
  });

  const { data: stateData } = useCensusACS({
    tables: [tableId], geoType: "state", geoFips: "26", enabled: !!fips && !stateAvgOverride,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-4 space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-20" />
          <Skeleton className="h-4 w-28" />
        </CardContent>
      </Card>
    );
  }

  const rawValue = getCensusValue(data, tableId, variableCode);
  const moe = getCensusMOE(data, tableId, variableCode);
  const stateVal = stateAvgOverride ?? getCensusValue(stateData, tableId, variableCode);

  let displayValue = "N/A";
  let numericVal: number | null = null;

  if (rawValue !== null) {
    if (unit === "dollars") {
      displayValue = `$${rawValue.toLocaleString()}`;
      numericVal = rawValue;
    } else if (unit === "percent" && denominatorCode) {
      const denom = getCensusValue(data, tableId, denominatorCode);
      if (denom && denom > 0) {
        numericVal = (rawValue / denom) * 100;
        displayValue = `${numericVal.toFixed(1)}%`;
      }
    } else {
      displayValue = rawValue.toLocaleString();
      numericVal = rawValue;
    }
  }

  const diff = numericVal !== null && stateVal !== null ? numericVal - stateVal : null;
  const isBetter = diff !== null ? (direction === "lower-is-better" ? diff < 0 : diff > 0) : null;
  const isNeutral = diff !== null ? Math.abs(diff / (stateVal || 1)) < 0.05 : true;
  const soWhat = getSoWhat(label, numericVal, stateVal, unit);
  const reliability = getReliability(rawValue, moe);
  const suppressed = reliability.status === "suppressed";

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="py-4 space-y-1">
        <div className="flex items-center gap-1.5">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          {soWhat && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 text-muted-foreground/50 cursor-help shrink-0" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[220px] text-xs">
                {soWhat}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        {suppressed ? (
          <SuppressedEstimate />
        ) : (
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-foreground">{displayValue}</span>
            {moe !== null && moe > 0 && (
              <span className="text-[10px] text-muted-foreground">±{moe.toLocaleString()}</span>
            )}
            {reliability.status === "unavailable" && <MoeUnavailableNote />}
          </div>
        )}
        {!suppressed && diff !== null && (
          <div className="flex items-center gap-1.5">
            {isNeutral ? (
              <Badge variant="secondary" className="text-[10px] gap-0.5 h-5">
                <Minus className="h-3 w-3" /> ≈ State avg
              </Badge>
            ) : (
              <Badge
                variant={isBetter ? "outline" : "destructive"}
                className={`text-[10px] gap-0.5 h-5 ${isBetter ? "border-green-600 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20" : ""}`}
              >
                {isBetter ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {isBetter ? "Better" : "Worse"} than MI
              </Badge>
            )}
          </div>
        )}
        <p className="text-[10px] text-muted-foreground">ACS 5-Year 2023</p>
      </CardContent>
    </Card>
  );
}
