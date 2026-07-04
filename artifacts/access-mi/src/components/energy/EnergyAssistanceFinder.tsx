import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  Home,
  Flame,
  Phone,
  ExternalLink,
  MapPin,
  DollarSign,
  Snowflake,
  Shield,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useCounty } from "@/contexts/CountyContext";
import { MICHIGAN_COUNTIES } from "@/contexts/CountyContext";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Energy assistance programs available in Michigan
interface EnergyProgram {
  id: string;
  name: string;
  provider: string;
  description: string;
  maxFPL: number; // Max FPL% to qualify
  types: ("electric" | "gas" | "weatherization" | "crisis")[];
  phone?: string;
  url?: string;
  coverageArea: "statewide" | string[]; // county names or statewide
  benefit: string;
  icon: typeof Zap;
}

// Source: MDHHS, DTE Energy, Consumers Energy, THAW Fund, US DOE (see page footer)
const PROGRAMS: EnergyProgram[] = [
  {
    id: "liheap",
    name: "LIHEAP (Low Income Home Energy Assistance)",
    provider: "MDHHS",
    description:
      "Federal program helping low-income households pay heating and cooling costs. Provides direct vendor payments to utility companies.",
    maxFPL: 150,
    types: ["electric", "gas"],
    phone: "844-799-9876",
    url: "https://www.michigan.gov/mdhhs/assistance-programs/energy",
    coverageArea: "statewide",
    benefit: "Up to $1,600/year for heating assistance",
    icon: Flame,
  },
  {
    id: "shp",
    name: "State Emergency Relief (SER)",
    provider: "MDHHS",
    description:
      "Emergency assistance to prevent utility shutoff, restore service, or help with energy-related emergencies.",
    maxFPL: 150,
    types: ["electric", "gas", "crisis"],
    phone: "844-799-9876",
    url: "https://www.michigan.gov/mdhhs/assistance-programs/emergency-services",
    coverageArea: "statewide",
    benefit: "Up to $1,500 emergency payment to prevent shutoff",
    icon: Shield,
  },
  {
    id: "wap",
    name: "Weatherization Assistance Program (WAP)",
    provider: "Michigan Bureau of Community Action",
    description:
      "Free home energy audits and upgrades: insulation, air sealing, furnace repair/replacement, and energy-efficient windows.",
    maxFPL: 200,
    types: ["weatherization"],
    phone: "517-241-6897",
    url: "https://www.michigan.gov/leo/bureaus-agencies/community-action/weatherization",
    coverageArea: "statewide",
    benefit: "Up to $8,000 in free home upgrades",
    icon: Home,
  },
  {
    id: "dte-lsp",
    name: "DTE Low Income Self-Sufficiency Plan (LSP)",
    provider: "DTE Energy",
    description:
      "Discounted monthly bills based on income level. Includes arrears forgiveness and payment plans.",
    maxFPL: 150,
    types: ["electric", "gas"],
    phone: "800-477-4747",
    url: "https://newlook.dteenergy.com/wps/wcm/connect/dte-web/home/billing-and-payments/payment-assistance/low-income-self-sufficiency-plan",
    coverageArea: [
      "Wayne",
      "Oakland",
      "Macomb",
      "Monroe",
      "Washtenaw",
      "Livingston",
      "Lenawee",
      "St. Clair",
      "Lapeer",
    ],
    benefit: "25-70% bill discount + arrears forgiveness",
    icon: Zap,
  },
  {
    id: "ce-shut-off",
    name: "Consumers Energy Shut-Off Protection Plan",
    provider: "Consumers Energy",
    description:
      "Payment plans and protection from shutoff for income-qualifying households. Includes winter protection programs.",
    maxFPL: 150,
    types: ["electric", "gas", "crisis"],
    phone: "800-477-5050",
    url: "https://www.consumersenergy.com/residential/billing-and-payment/help-with-your-bill",
    coverageArea: [
      "Kent",
      "Ottawa",
      "Kalamazoo",
      "Jackson",
      "Calhoun",
      "Eaton",
      "Ingham",
      "Bay",
      "Saginaw",
      "Midland",
      "Genesee",
      "Isabella",
      "Allegan",
      "Berrien",
      "Muskegon",
    ],
    benefit: "Affordable payment plans + winter protection",
    icon: Snowflake,
  },
  {
    id: "mpsc-winter",
    name: "Michigan Winter Protection Plan",
    provider: "Michigan Public Service Commission",
    description:
      "State law prohibits utility shutoffs Nov 1 – Mar 31 for eligible households. Must enroll through your utility.",
    maxFPL: 150,
    types: ["electric", "gas", "crisis"],
    url: "https://www.michigan.gov/mpsc/consumer/winter-protection",
    coverageArea: "statewide",
    benefit: "Shutoff protection during winter months",
    icon: Snowflake,
  },
  {
    id: "dollar-energy",
    name: "Dollar Energy Fund / THAW",
    provider: "The Heat and Warmth Fund",
    description:
      "Nonprofit emergency energy assistance. Provides grants to prevent shutoff and restore service for Michigan families.",
    maxFPL: 200,
    types: ["electric", "gas", "crisis"],
    phone: "800-866-8429",
    url: "https://www.thawfund.org/",
    coverageArea: "statewide",
    benefit: "Emergency grants up to $1,000",
    icon: DollarSign,
  },
  {
    id: "ira-rebates",
    name: "IRA Home Energy Rebates",
    provider: "US Dept. of Energy / Michigan EGLE",
    description:
      "Federal Inflation Reduction Act rebates for heat pumps, insulation, electrical panels, and energy-efficient appliances.",
    maxFPL: 300,
    types: ["weatherization"],
    url: "https://www.michigan.gov/egle/about/featured/homes",
    coverageArea: "statewide",
    benefit: "Up to $14,000 in rebates for electrification",
    icon: Zap,
  },
];

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  electric: {
    label: "Electric",
    color: "bg-michigan-gold/15 text-michigan-gold-deep border-michigan-gold/25",
  },
  gas: {
    label: "Gas/Heating",
    color: "bg-michigan-coral/15 text-michigan-coral-deep border-michigan-coral/25",
  },
  weatherization: {
    label: "Weatherization",
    color: "bg-michigan-teal/15 text-michigan-teal-deep border-michigan-teal/25",
  },
  crisis: {
    label: "Crisis/Emergency",
    color: "bg-destructive/15 text-destructive border-destructive/25",
  },
};

interface Props {
  compact?: boolean;
}

export default function EnergyAssistanceFinder({ compact = false }: Props) {
  const { county: globalCounty, eligibility } = useCounty();
  const [county, setCounty] = useState(globalCounty || "");
  const [fplSlider, setFplSlider] = useState(eligibility.fplPercent ?? 150);
  const [typeFilter, setTypeFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  // Use global FPL if available
  const effectiveFPL = eligibility.fplPercent ?? fplSlider;

  const matchedPrograms = useMemo(() => {
    return PROGRAMS.filter((p) => {
      // FPL check
      if (effectiveFPL > p.maxFPL) return false;
      // County check
      if (county && p.coverageArea !== "statewide") {
        if (Array.isArray(p.coverageArea) && !p.coverageArea.includes(county))
          return false;
      }
      // Type check
      if (typeFilter !== "all" && !p.types.includes(typeFilter as any))
        return false;
      return true;
    });
  }, [county, effectiveFPL, typeFilter]);

  return (
    <Card>
      <CardHeader className={compact ? "pb-2" : ""}>
        <CardTitle className="text-base flex items-center gap-2">
          <Zap className="h-4 w-4 text-michigan-gold-deep" />
          Energy Assistance Program Finder
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          How LIHEAP, weatherization, and utility-discount program rules work in
          Michigan.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">
              County
            </label>
            <Select value={county} onValueChange={setCounty}>
              <SelectTrigger className="h-9 text-xs">
                <MapPin className="mr-1 h-3 w-3" />
                <SelectValue placeholder="All Counties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_counties">All Counties</SelectItem>
                {MICHIGAN_COUNTIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">
              Income Level: {effectiveFPL}% FPL
              {eligibility.fplPercent && (
                <span className="text-michigan-teal-deep ml-1">(from profile)</span>
              )}
            </label>
            {!eligibility.fplPercent && (
              <Slider
                value={[fplSlider]}
                onValueChange={([v]) => setFplSlider(v)}
                min={0}
                max={400}
                step={10}
                className="mt-2"
              />
            )}
            {eligibility.fplPercent && (
              <p className="text-[10px] text-muted-foreground">
                Using income from your eligibility profile
              </p>
            )}
          </div>
          <div>
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">
              Type
            </label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="electric">Electric</SelectItem>
                <SelectItem value="gas">Gas/Heating</SelectItem>
                <SelectItem value="weatherization">Weatherization</SelectItem>
                <SelectItem value="crisis">Crisis/Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">
              {matchedPrograms.length}
            </strong>{" "}
            programs whose rules match this profile
          </p>
          {effectiveFPL <= 150 && (
            <Badge className="bg-michigan-teal/15 text-michigan-teal-deep border-michigan-teal/25 text-[10px]">
              Likely eligible for most programs
            </Badge>
          )}
        </div>

        {/* Program cards */}
        <div className="space-y-2">
          {matchedPrograms.map((p) => (
            <Collapsible
              key={p.id}
              open={expanded === p.id}
              onOpenChange={(open) => setExpanded(open ? p.id : null)}
            >
              <div className="rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors">
                <CollapsibleTrigger className="w-full p-3 flex items-start gap-3 text-left">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-michigan-gold/10 text-michigan-gold-deep flex-shrink-0 mt-0.5">
                    <p.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-foreground leading-tight">
                      {p.name}
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {p.provider} · Up to {p.maxFPL}% FPL
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {p.types.map((t) => (
                        <Badge
                          key={t}
                          variant="outline"
                          className={`text-[9px] ${TYPE_LABELS[t].color}`}
                        >
                          {TYPE_LABELS[t].label}
                        </Badge>
                      ))}
                      {p.coverageArea === "statewide" ? (
                        <Badge variant="secondary" className="text-[9px]">
                          Statewide
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[9px]">
                          {(p.coverageArea as string[]).length} counties
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0 mt-1">
                    {expanded === p.id ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="px-3 pb-3 pt-0 space-y-2 border-t border-border/50">
                    <p className="text-xs text-muted-foreground mt-2">
                      {p.description}
                    </p>
                    <div className="rounded-md bg-michigan-gold/5 p-2">
                      <p className="text-xs font-medium text-foreground flex items-center gap-1.5">
                        <DollarSign className="h-3 w-3 text-michigan-gold-deep" />
                        {p.benefit}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {p.url && (
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button size="sm" className="h-7 text-xs gap-1">
                            <ExternalLink className="h-3 w-3" /> Apply Now
                          </Button>
                        </a>
                      )}
                      {p.phone && (
                        <a href={`tel:${p.phone}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1"
                          >
                            <Phone className="h-3 w-3" /> {p.phone}
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}

          {matchedPrograms.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No matching programs found</p>
              <p className="text-xs mt-1">
                Try adjusting your income level or county filter.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-[10px] text-muted-foreground text-center">
          Data: MDHHS, DTE Energy, Consumers Energy, THAW Fund, US DOE ·
          Eligibility is estimated - contact the program to confirm.
        </p>
      </CardContent>
    </Card>
  );
}
