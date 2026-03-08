/**
 * CHNA / VBC view overlay for Brief page.
 * Re-organizes existing indicators into CHNA framework sections.
 */
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Home, Zap, Bus, Users, Activity, ExternalLink } from "lucide-react";
import { COUNTY_PROFILES } from "@/data/michigan-county-profiles";
import { getCountyCrossDomain, MI_STATE_AVERAGES } from "@/data/cross-domain-indicators";
import { Link } from "react-router-dom";

function getVal(hh: { label: string; value: string }[] | undefined, search: string): string {
  if (!hh) return "—";
  return hh.find((h) => h.label.toLowerCase().includes(search.toLowerCase()))?.value || "—";
}

interface CHNASection {
  icon: typeof Heart;
  title: string;
  bullets: string[];
}

function buildCHNASections(county: string): CHNASection[] {
  const profile = COUNTY_PROFILES[county];
  if (!profile) return [];
  const cd = getCountyCrossDomain(county);
  const hh = profile.healthHighlights;

  const uninsured = getVal(hh, "uninsured");
  const food = getVal(hh, "food");
  const primaryCare = getVal(hh, "primary care");

  const sections: CHNASection[] = [
    {
      icon: Heart,
      title: "Care, Coverage, & Quality",
      bullets: [
        `Uninsured rate: ${uninsured}%${parseFloat(uninsured) > 6.2 ? " (above MI average of 6.2%)" : parseFloat(uninsured) <= 6.2 ? " (at or below MI average)" : ""}`,
        primaryCare !== "—" ? `Primary care access ratio: ${primaryCare}` : "Primary care access ratio: data pending",
        `Medicaid coverage is ${parseFloat(uninsured) > 8 ? "a critical gap area" : "relatively accessible"} in this county.`,
      ],
    },
    {
      icon: Home,
      title: "Housing & Economic Stability",
      bullets: [
        cd.rentBurden !== null ? `Rent-burdened households: ${cd.rentBurden}%${cd.rentBurden > (MI_STATE_AVERAGES.rentBurden ?? 30) ? " (above state average)" : ""}` : "Rent burden data: pending",
        cd.povertyRate !== null ? `Poverty rate: ${cd.povertyRate}%${cd.povertyRate > 13.8 ? " (above MI average of 13.8%)" : ""}` : "Poverty rate: pending",
        `Food insecurity: ${food}%${parseFloat(food) > 13.5 ? " — above the state average, compounding health challenges" : ""}`,
      ],
    },
    {
      icon: Zap,
      title: "Utilities, Environment, & Infrastructure",
      bullets: [
        "Energy burden and outage reliability data available on the county Value & Performance section.",
        cd.drinkingWaterCompliance !== null ? `Drinking water compliance: ${cd.drinkingWaterCompliance}%` : "Drinking water compliance: data pending",
        "Environmental justice indicators (AQI, PFAS sites) available on the Environment page.",
      ],
    },
    {
      icon: Bus,
      title: "Transportation & Safety",
      bullets: [
        cd.vehicleAccess !== null ? `Households with vehicle access: ${cd.vehicleAccess}%` : "Vehicle access: data pending",
        cd.commuteTime !== null ? `Average commute: ${cd.commuteTime} minutes${cd.commuteTime > (MI_STATE_AVERAGES.commuteTime ?? 25) ? " (above state average)" : ""}` : "Commute data: pending",
        "Crash data and transit coverage available on the Transportation page.",
      ],
    },
  ];

  return sections;
}

export default function CHNAViewSection({ county }: { county: string }) {
  const sections = buildCHNASections(county);

  return (
    <div className="space-y-4">
      {/* VBC Bridge Box */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="py-4 space-y-2">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Activity className="h-4 w-4 text-primary" />
            Bridge to Value-Based Care
          </h3>
          <ul className="text-xs text-muted-foreground space-y-1.5">
            <li>• CHNA findings on housing stability and utility reliability can inform VBC strategies to reduce avoidable ED use and support HCBS.</li>
            <li>• Medicaid/VBP programs should consider local food insecurity and transportation gaps when designing care management interventions.</li>
            <li>• Pair quantitative indicators with community engagement and lived experience for a complete CHNA picture.</li>
          </ul>
          <p className="text-[9px] text-muted-foreground/60 mt-1">
            Contextual guidance — not program-specific advice. See{" "}
            <Link to="/methodology" className="text-primary hover:underline">methodology</Link> for details.
          </p>
        </CardContent>
      </Card>

      {/* CHNA framework sections */}
      {sections.map((s) => (
        <Card key={s.title} className="border-border/60">
          <CardContent className="py-4 space-y-2">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <s.icon className="h-4 w-4 text-primary" />
              {s.title}
            </h4>
            <ul className="space-y-1">
              {s.bullets.map((b, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <span className="mt-1.5 h-1 w-1 rounded-full bg-primary/40 shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
