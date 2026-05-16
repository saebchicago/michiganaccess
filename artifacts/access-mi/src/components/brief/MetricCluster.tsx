/**
 * MetricCluster — groups 3 key metric cards with mini-bar indicators.
 * Pure CSS, no chart lib dependency.
 */
import { Card, CardContent } from "@/components/ui/card";
import MiniBar from "@/components/shared/MiniBar";
import { Heart, Home, Zap } from "lucide-react";
import { COUNTY_PROFILES } from "@/data/michigan-county-profiles";
import { getCountyCrossDomain } from "@/data/cross-domain-indicators";

function getVal(hh: { label: string; value: string }[] | undefined, search: string): number {
  if (!hh) return NaN;
  const v = hh.find((h) => h.label.toLowerCase().includes(search.toLowerCase()))?.value;
  return v ? parseFloat(v) : NaN;
}

interface MetricClusterProps {
  county: string;
}

export default function MetricCluster({ county }: MetricClusterProps) {
  const profile = COUNTY_PROFILES[county];
  if (!profile) return null;

  const cd = getCountyCrossDomain(county);
  const uninsured = getVal(profile.healthHighlights, "uninsured");
  const food = getVal(profile.healthHighlights, "food");

  const metrics = [
    {
      icon: Heart,
      title: "Health",
      items: [
        { label: "Uninsured", value: !isNaN(uninsured) ? `${uninsured}%` : "—", fill: !isNaN(uninsured) ? (uninsured / 15) * 100 : 0, color: "bg-primary" },
        { label: "Food Insecurity", value: !isNaN(food) ? `${food}%` : "—", fill: !isNaN(food) ? (food / 25) * 100 : 0, color: "bg-michigan-coral" },
      ],
    },
    {
      icon: Home,
      title: "Housing",
      items: [
        { label: "Rent Burdened", value: cd.rentBurden !== null ? `${cd.rentBurden}%` : "—", fill: cd.rentBurden !== null ? (cd.rentBurden / 50) * 100 : 0, color: "bg-michigan-gold" },
        { label: "Poverty Rate", value: cd.povertyRate !== null ? `${cd.povertyRate}%` : "—", fill: cd.povertyRate !== null ? (cd.povertyRate / 30) * 100 : 0, color: "bg-michigan-gold" },
      ],
    },
    {
      icon: Zap,
      title: "Utilities",
      items: [
        { label: "Water Compliance", value: cd.drinkingWaterCompliance !== null ? `${cd.drinkingWaterCompliance}%` : "—", fill: cd.drinkingWaterCompliance !== null ? cd.drinkingWaterCompliance : 0, color: "bg-michigan-teal" },
        { label: "Vehicle Access", value: cd.vehicleAccess !== null ? `${cd.vehicleAccess}%` : "—", fill: cd.vehicleAccess !== null ? cd.vehicleAccess : 0, color: "bg-michigan-forest" },
      ],
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">Key Indicators at a Glance</h3>
        <p className="text-[10px] text-muted-foreground">Bar width = relative to benchmark</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {metrics.map((group) => (
          <Card key={group.title}>
            <CardContent className="py-4 space-y-3">
              <div className="flex items-center gap-1.5">
                <group.icon className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-foreground">{group.title}</span>
              </div>
              {group.items.map((item) => (
                <MiniBar
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  fill={item.fill}
                  colorClass={item.color}
                />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
