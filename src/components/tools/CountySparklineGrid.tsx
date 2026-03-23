import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Grid3x3, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { COUNTY_PROFILES } from "@/data/michigan-county-profiles";
import { COUNTY_CROSS_DOMAIN, MI_STATE_AVERAGES } from "@/data/cross-domain-indicators";

type MetricKey =
  | "uninsured"
  | "food_insecurity"
  | "poverty"
  | "graduation"
  | "violent_crime"
  | "rent_burden"
  | "unemployment";

interface MetricDef {
  label: string;
  extract: (county: string) => number | null;
  unit: string;
  higherIsBetter: boolean;
}

const METRICS: Record<MetricKey, MetricDef> = {
  uninsured: {
    label: "Uninsured Rate",
    extract: (c) => {
      const p = COUNTY_PROFILES[c];
      return p ? parseFloat(p.healthHighlights[0]?.value || "0") : null;
    },
    unit: "%",
    higherIsBetter: false,
  },
  food_insecurity: {
    label: "Food Insecurity",
    extract: (c) => {
      const p = COUNTY_PROFILES[c];
      return p ? parseFloat(p.healthHighlights[2]?.value || "0") : null;
    },
    unit: "%",
    higherIsBetter: false,
  },
  poverty: {
    label: "Poverty Rate",
    extract: (c) => COUNTY_CROSS_DOMAIN[c]?.povertyRate ?? null,
    unit: "%",
    higherIsBetter: false,
  },
  graduation: {
    label: "HS Graduation Rate",
    extract: (c) => COUNTY_CROSS_DOMAIN[c]?.hsGradRate ?? null,
    unit: "%",
    higherIsBetter: true,
  },
  violent_crime: {
    label: "Violent Crime Rate",
    extract: (c) => COUNTY_CROSS_DOMAIN[c]?.violentCrimeRate ?? null,
    unit: "/100K",
    higherIsBetter: false,
  },
  rent_burden: {
    label: "Rent Burden",
    extract: (c) => COUNTY_CROSS_DOMAIN[c]?.rentBurden ?? null,
    unit: "%",
    higherIsBetter: false,
  },
  unemployment: {
    label: "Unemployment",
    extract: (c) => COUNTY_CROSS_DOMAIN[c]?.unemploymentRate ?? null,
    unit: "%",
    higherIsBetter: false,
  },
};

function getBarColor(value: number, min: number, max: number, higherIsBetter: boolean): string {
  if (max === min) return "bg-yellow-400";
  const ratio = (value - min) / (max - min);
  // For "higher is better" metrics, high ratio is good (green). Otherwise inverted.
  const goodness = higherIsBetter ? ratio : 1 - ratio;
  if (goodness >= 0.7) return "bg-green-500";
  if (goodness >= 0.4) return "bg-yellow-400";
  if (goodness >= 0.2) return "bg-orange-500";
  return "bg-red-500";
}

export default function CountySparklineGrid() {
  const [metric, setMetric] = useState<MetricKey>("uninsured");
  const def = METRICS[metric];

  const counties = useMemo(() => Object.keys(COUNTY_PROFILES), []);

  const { data, min, max } = useMemo(() => {
    const values: { county: string; value: number | null }[] = counties.map((c) => ({
      county: c,
      value: def.extract(c),
    }));
    const nums = values.map((v) => v.value).filter((v): v is number => v !== null);
    return {
      data: values,
      min: Math.min(...nums, 0),
      max: Math.max(...nums, 1),
    };
  }, [counties, def]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Grid3x3 className="h-5 w-5 text-primary" /> 83-County Overview
          </CardTitle>
          <div className="relative">
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value as MetricKey)}
              className="appearance-none rounded-md border border-border bg-background px-3 py-1.5 pr-8 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {(Object.entries(METRICS) as [MetricKey, MetricDef][]).map(([key, m]) => (
                <option key={key} value={key}>
                  {m.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-1.5 max-h-[520px] overflow-y-auto pr-1">
          {data.map(({ county, value }) => {
            const slug = county.toLowerCase().replace(/\s+/g, "-");
            const barWidth =
              value !== null && max > min
                ? Math.max(8, ((value - min) / (max - min)) * 100)
                : 0;
            const color =
              value !== null
                ? getBarColor(value, min, max, def.higherIsBetter)
                : "bg-muted";

            return (
              <Link
                key={county}
                to={`/county/${slug}`}
                className="group flex flex-col items-center rounded-md border border-border p-1.5 hover:border-primary/40 hover:bg-muted/40 transition-colors"
                title={`${county}: ${value !== null ? value + def.unit : "N/A"}`}
              >
                <span className="text-[9px] font-medium text-foreground truncate w-full text-center leading-tight">
                  {county}
                </span>
                <div className="w-full h-2 bg-muted/60 rounded-full mt-1 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${color}`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                <span className="text-[8px] text-muted-foreground mt-0.5">
                  {value !== null ? `${value}${def.unit}` : "—"}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center justify-between mt-3 text-[9px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500" /> Good
            <span className="h-2 w-2 rounded-full bg-yellow-400" /> Moderate
            <span className="h-2 w-2 rounded-full bg-orange-500" /> Concerning
            <span className="h-2 w-2 rounded-full bg-red-500" /> Critical
          </div>
          <span>Click any county for detail</span>
        </div>

        <p className="text-[9px] text-muted-foreground mt-2">
          Sources: Census ACS 2022, CDC PLACES, MI DOE, FBI UCR, BLS LAUS. State avg: {
            metric === "poverty" ? `${MI_STATE_AVERAGES.povertyRate}%` :
            metric === "graduation" ? `${MI_STATE_AVERAGES.hsGradRate}%` :
            metric === "violent_crime" ? `${MI_STATE_AVERAGES.violentCrimeRate}/100K` :
            metric === "rent_burden" ? `${MI_STATE_AVERAGES.rentBurden}%` :
            metric === "unemployment" ? `${MI_STATE_AVERAGES.unemploymentRate}%` :
            ""
          }
        </p>
      </CardContent>
    </Card>
  );
}
