/**
 * Shared SDOH Priority Heat Visual - shows 3-level intensity for key domains.
 * Pure CSS bars, no chart library.
 */
import { Heart, Home, Zap, Bus, Brain, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { COUNTY_PROFILES } from "@/data/michigan-county-profiles";
import { getCountyCrossDomain, MI_STATE_AVERAGES } from "@/data/cross-domain-indicators";

type Intensity = "low" | "medium" | "high";

interface DomainHeat {
  icon: typeof Heart;
  label: string;
  intensity: Intensity;
  detail: string;
}

const INTENSITY_COLORS: Record<Intensity, string> = {
  low: "bg-michigan-forest",
  medium: "bg-michigan-gold",
  high: "bg-destructive",
};

const INTENSITY_LABELS: Record<Intensity, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

const INTENSITY_WIDTH: Record<Intensity, string> = {
  low: "w-1/4",
  medium: "w-1/2",
  high: "w-3/4",
};

function getVal(hh: { label: string; value: string }[] | undefined, search: string): number {
  if (!hh) return NaN;
  const v = hh.find((h) => h.label.toLowerCase().includes(search.toLowerCase()))?.value;
  return v ? parseFloat(v) : NaN;
}

export function buildDomainHeat(county: string): DomainHeat[] {
  const profile = COUNTY_PROFILES[county];
  if (!profile) return [];
  const cd = getCountyCrossDomain(county);
  const hh = profile.healthHighlights;

  const uninsured = getVal(hh, "uninsured");
  const food = getVal(hh, "food");

  const domains: DomainHeat[] = [
    {
      icon: Home,
      label: "Housing",
      intensity: cd.rentBurden !== null && cd.rentBurden > (MI_STATE_AVERAGES.rentBurden ?? 30) + 5 ? "high" : cd.rentBurden !== null && cd.rentBurden > (MI_STATE_AVERAGES.rentBurden ?? 30) ? "medium" : "low",
      detail: cd.rentBurden !== null ? `${cd.rentBurden}% rent-burdened` : "Data pending",
    },
    {
      icon: Heart,
      label: "Food Security",
      intensity: !isNaN(food) && food > 15 ? "high" : !isNaN(food) && food > 12 ? "medium" : "low",
      detail: !isNaN(food) ? `${food}% food insecure` : "Data pending",
    },
    {
      icon: Bus,
      label: "Transportation",
      intensity: cd.vehicleAccess !== null && cd.vehicleAccess < (MI_STATE_AVERAGES.vehicleAccess ?? 92) - 5 ? "high" : cd.vehicleAccess !== null && cd.vehicleAccess < (MI_STATE_AVERAGES.vehicleAccess ?? 92) ? "medium" : "low",
      detail: cd.vehicleAccess !== null ? `${cd.vehicleAccess}% vehicle access` : "Data pending",
    },
    {
      icon: Zap,
      label: "Utilities",
      intensity: cd.drinkingWaterCompliance !== null && cd.drinkingWaterCompliance < 85 ? "high" : cd.drinkingWaterCompliance !== null && cd.drinkingWaterCompliance < 95 ? "medium" : "low",
      detail: cd.drinkingWaterCompliance !== null ? `${cd.drinkingWaterCompliance}% water compliance` : "Data pending",
    },
    {
      icon: Brain,
      label: "Mental Health",
      intensity: !isNaN(uninsured) && uninsured > 8 ? "high" : !isNaN(uninsured) && uninsured > 5 ? "medium" : "low",
      detail: `Proxy: ${!isNaN(uninsured) ? uninsured + "% uninsured" : "data pending"}`,
    },
    {
      icon: Activity,
      label: "Chronic Disease",
      intensity: !isNaN(food) && food > 14 && cd.povertyRate !== null && cd.povertyRate > 15 ? "high" : cd.povertyRate !== null && cd.povertyRate > 12 ? "medium" : "low",
      detail: cd.povertyRate !== null ? `${cd.povertyRate}% poverty rate` : "Data pending",
    },
  ];

  return domains;
}

export default function SDOHPriorityHeat({ county }: { county: string }) {
  const domains = buildDomainHeat(county);
  if (domains.length === 0) return null;

  return (
    <Card>
      <CardContent className="py-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">SDOH Priority Heat</h3>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-michigan-forest" /> Low</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-michigan-gold" /> Medium</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-destructive" /> High</span>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground -mt-2">
          What this shows: Relative priority levels across social determinants of health, derived from existing county indicators vs. state averages.
        </p>
        <div className="space-y-2.5">
          {domains.map((d) => (
            <div key={d.label} className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 w-28 shrink-0">
                <d.icon className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">{d.label}</span>
              </div>
              <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${INTENSITY_COLORS[d.intensity]} ${INTENSITY_WIDTH[d.intensity]}`} />
              </div>
              <span className={`text-[10px] font-medium w-12 text-right ${d.intensity === "high" ? "text-destructive" : d.intensity === "medium" ? "text-michigan-gold" : "text-michigan-forest"}`}>
                {INTENSITY_LABELS[d.intensity]}
              </span>
            </div>
          ))}
        </div>
        <p className="text-[9px] text-muted-foreground/60 pt-1">
          Based on County Health Rankings, Census ACS, and USDA data relative to statewide averages. Not a clinical assessment.
        </p>
      </CardContent>
    </Card>
  );
}
