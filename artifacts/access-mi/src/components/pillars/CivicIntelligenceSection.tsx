/**
 * Civic Intelligence Section
 *
 * Renders one clickable summary card per pillar (Health, Environment, Mobility, Economic)
 * that deep-links into /datasets pre-filtered by pillar and geography.
 * Below the summary cards, renders the full pillar detail cards.
 */

import { Link } from "react-router-dom";
import { Heart, Leaf, Bus, DollarSign, ArrowRight, BarChart3, GitCompareArrows } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import SectionErrorBoundary from "@/components/shared/SectionErrorBoundary";
import HealthAccessCards from "./HealthAccessCards";
import EnvironmentRiskCards from "./EnvironmentRiskCards";
import MobilityAccessCards from "./MobilityAccessCards";
import EconomicStressCards from "./EconomicStressCards";

interface CivicIntelligenceSectionProps {
  countyName: string;
}

const PILLARS = [
  {
    id: "health",
    label: "Health Access",
    icon: Heart,
    color: "text-primary",
    bgColor: "bg-primary/5 border-primary/15 hover:border-primary/30",
    desc: "Facility density, uninsured rate, primary care ratio",
  },
  {
    id: "environment",
    label: "Environmental Risk",
    icon: Leaf,
    color: "text-michigan-forest-deep",
    bgColor: "bg-michigan-forest/5 border-michigan-forest/15 hover:border-michigan-forest/30",
    desc: "PFAS sites, air quality, environmental justice",
  },
  {
    id: "mobility",
    label: "Mobility & Transit",
    icon: Bus,
    color: "text-michigan-teal-deep",
    bgColor: "bg-michigan-teal/5 border-michigan-teal/15 hover:border-michigan-teal/30",
    desc: "Work zones, EV infrastructure, transit routes",
  },
  {
    id: "economic",
    label: "Economic Stress",
    icon: DollarSign,
    color: "text-michigan-gold-deep",
    bgColor: "bg-michigan-gold/5 border-michigan-gold/15 hover:border-michigan-gold/30",
    desc: "Food insecurity, housing stress, financial programs",
  },
] as const;

export default function CivicIntelligenceSection({ countyName }: CivicIntelligenceSectionProps) {
  return (
    <section id="civic-intelligence" className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" /> Civic Intelligence
        </h2>
        <div className="flex items-center gap-3">
          <Link
            to={`/datasets?mode=compare&county=${encodeURIComponent(countyName)}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            <GitCompareArrows className="h-3.5 w-3.5" /> Compare with other counties
          </Link>
          <Link to="/datasets" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
            All datasets <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Summary cards - one per pillar, clickable */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {PILLARS.map((p) => (
          <Link
            key={p.id}
            to={`/datasets?pillar=${p.id}&county=${encodeURIComponent(countyName)}`}
          >
            <Card className={`h-full transition-all cursor-pointer group border ${p.bgColor}`}>
              <CardContent className="py-5 space-y-2">
                <div className="flex items-center gap-2">
                  <p.icon className={`h-4 w-4 ${p.color} shrink-0`} />
                  <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                    {p.label}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
                <Badge variant="outline" className="text-[10px]">
                  Explore →
                </Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Separator />

      {/* Health Pillar Detail */}
      <SectionErrorBoundary title="Health data couldn't load.">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Heart className="h-4 w-4 text-primary" /> Health Access
          </h3>
          <HealthAccessCards countyName={countyName} />
        </div>
      </SectionErrorBoundary>

      {/* Environment Pillar Detail */}
      <SectionErrorBoundary title="Environment data couldn't load.">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Leaf className="h-4 w-4 text-michigan-forest-deep" /> Environmental Risk
          </h3>
          <EnvironmentRiskCards countyName={countyName} />
        </div>
      </SectionErrorBoundary>

      {/* Mobility Pillar Detail */}
      <SectionErrorBoundary title="Mobility data couldn't load.">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Bus className="h-4 w-4 text-michigan-teal-deep" /> Mobility & Transit
          </h3>
          <MobilityAccessCards countyName={countyName} />
        </div>
      </SectionErrorBoundary>

      {/* Economic Pillar Detail */}
      <SectionErrorBoundary title="Economic data couldn't load.">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-michigan-gold-deep" /> Economic Stress
          </h3>
          <EconomicStressCards countyName={countyName} />
        </div>
      </SectionErrorBoundary>
    </section>
  );
}
