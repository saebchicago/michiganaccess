/**
 * ACSIndicatorCard — displays a single ACS metric with comparison to state avg.
 */
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useCensusACS, getCensusValue, getCensusMOE } from "@/hooks/useCensusACS";
import { getCountyFips } from "@/data/census-geographies";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  countyName: string;
  tableId: string;
  variableCode: string;
  label: string;
  unit: "dollars" | "count" | "percent" | "ratio";
  stateAvgOverride?: number;
  direction?: "higher-is-better" | "lower-is-better";
  /** For percent: provide denominator variable code */
  denominatorCode?: string;
}

export default function ACSIndicatorCard({
  countyName,
  tableId,
  variableCode,
  label,
  unit,
  stateAvgOverride,
  direction = "higher-is-better",
  denominatorCode,
}: Props) {
  const fips = getCountyFips(countyName);

  const { data, isLoading } = useCensusACS({
    tables: [tableId],
    geoType: "county",
    geoFips: fips || "",
    enabled: !!fips,
  });

  const { data: stateData } = useCensusACS({
    tables: [tableId],
    geoType: "state",
    geoFips: "26",
    enabled: !!fips && !stateAvgOverride,
  });

  if (isLoading) {
    return <Card><CardContent className="py-4"><Skeleton className="h-16 w-full" /></CardContent></Card>;
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

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="py-4 space-y-1">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-foreground">{displayValue}</span>
          {moe !== null && moe > 0 && (
            <span className="text-[10px] text-muted-foreground">±{moe.toLocaleString()}</span>
          )}
        </div>
        {diff !== null && (
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
