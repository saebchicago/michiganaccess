import { Link } from "react-router-dom";
import { X, ArrowRight, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CountyData {
  county: string;
  compound?: number;
  food_desert_tracts?: number;
  broadband_unserved?: number;
  infant_mortality?: number | null;
  ej_max?: number;
  energy_burden?: number;
  uninsured?: number;
  poverty?: number;
  population?: number;
}

interface Props {
  county: CountyData | null;
  onClose: () => void;
}

function MetricRow({
  label,
  value,
  unit,
  warn,
}: {
  label: string;
  value: string | number | null;
  unit?: string;
  warn?: boolean;
}) {
  if (value === null || value === undefined) {
    return (
      <div className="flex justify-between py-1.5 border-b border-border/30">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-xs text-muted-foreground italic">
          Data unavailable
        </span>
      </div>
    );
  }
  return (
    <div className="flex justify-between py-1.5 border-b border-border/30">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={`text-xs font-semibold ${warn ? "text-michigan-coral-deep" : "text-foreground"}`}
      >
        {typeof value === "number" ? value.toLocaleString() : value}
        {unit || ""}
      </span>
    </div>
  );
}

export default function CountyDetailPanel({ county, onClose }: Props) {
  if (!county) return null;

  return (
    <Card className="border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">
              {county.county} County
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {county.population && (
          <p className="text-[10px] text-muted-foreground mb-2">
            Population: {county.population.toLocaleString()}
          </p>
        )}

        {county.compound !== undefined && (
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 mb-3 text-center">
            <p className="text-2xl font-bold text-primary">
              {county.compound.toFixed(1)}
            </p>
            <p className="text-[10px] text-muted-foreground">
              Compound Access Deficit Index
            </p>
          </div>
        )}

        <div className="space-y-0">
          <MetricRow
            label="Food desert tracts"
            value={county.food_desert_tracts ?? null}
          />
          <MetricRow
            label="Broadband % unserved"
            value={county.broadband_unserved ?? null}
            unit="%"
            warn={(county.broadband_unserved || 0) > 20}
          />
          <MetricRow
            label="Infant mortality rate"
            value={county.infant_mortality ?? null}
            unit="/1K"
            warn={(county.infant_mortality || 0) > 7}
          />
          <MetricRow
            label="EJ Index (max)"
            value={county.ej_max ?? null}
            unit="th pctl"
          />
          <MetricRow
            label="Energy burden"
            value={county.energy_burden ?? null}
            unit="%"
            warn={(county.energy_burden || 0) > 6}
          />
          <MetricRow
            label="Uninsured rate"
            value={county.uninsured ?? null}
            unit="%"
            warn={(county.uninsured || 0) > 8}
          />
          <MetricRow
            label="Poverty rate"
            value={county.poverty ?? null}
            unit="%"
            warn={(county.poverty || 0) > 18}
          />
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
            <Link to={`/brief?county=${county.county}`}>
              County Brief <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
            <Link to={`/find-care?location=${county.county}`}>
              Find Care <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
