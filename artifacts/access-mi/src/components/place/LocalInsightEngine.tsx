/**
 * Local Insight Engine - renders cross-domain indicators grouped by domain,
 * with "What stands out", "What you can do" actions, and full provenance.
 */
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Heart, Home, Zap, Droplets, Bus, Shield, GraduationCap, Apple,
  TrendingUp, TrendingDown, AlertTriangle, Info, ExternalLink, Minus,
  Briefcase, HelpCircle, ChevronDown, ChevronUp, ArrowUp, ArrowDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { Place, PlaceIndicator } from "@/models/Place";
import { buildFullIndicators, buildStandouts } from "@/models/Place";
import { DOMAIN_ACTIONS, DOMAIN_LABELS, type DomainId } from "@/data/domain-actions";
import SourcesTable from "@/components/shared/SourcesTable";

const DOMAIN_ICONS: Record<string, React.ElementType> = {
  health: Heart,
  housing: Home,
  energy: Zap,
  environment: Droplets,
  transportation: Bus,
  safety: Shield,
  education: GraduationCap,
  food: Apple,
  workforce: Briefcase,
  benefits: HelpCircle,
};

const DOMAIN_ORDER: string[] = [
  "health", "housing", "workforce", "food", "energy",
  "transportation", "education", "safety", "environment",
];

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.25 } }),
};

function DeltaChip({ value, stateAvg, direction }: { value: number; stateAvg: number; direction: string }) {
  const diff = value - stateAvg;
  if (Math.abs(diff) < 0.1 || stateAvg === 0) return <Minus className="h-3 w-3 text-muted-foreground" />;
  const higherIsBetter = direction !== "lower-is-better";
  const isBetter = higherIsBetter ? diff > 0 : diff < 0;
  const isNeutral = Math.abs(diff) < stateAvg * 0.02;

  const pillClasses = isNeutral
    ? "text-muted-foreground bg-muted"
    : isBetter
    ? "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30"
    : "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30";

  const Icon = isNeutral ? Minus : isBetter ? ArrowUp : ArrowDown;

  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium leading-tight px-2 py-0.5 rounded-full whitespace-normal ${pillClasses}`}>
      <Icon className="h-3 w-3 shrink-0" />
      <span className="tabular-nums">{diff > 0 ? "+" : ""}{diff.toFixed(1)}</span>
      <span className="opacity-75">vs state</span>
    </span>
  );
}

function DomainActionPanel({ domainId }: { domainId: DomainId }) {
  const [open, setOpen] = useState(false);
  const actions = DOMAIN_ACTIONS[domainId];
  if (!actions?.length) return null;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs gap-1 text-primary hover:text-primary/80 px-0 h-7">
          {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          What you can do ({actions.length})
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2">
        <div className="grid gap-2 sm:grid-cols-2">
          {actions.map((a) => (
            <a
              key={a.title}
              href={a.href}
              target={a.external ? "_blank" : undefined}
              rel={a.external ? "noopener noreferrer" : undefined}
              className="group flex items-start gap-2 rounded-lg border border-border bg-card px-3 py-2.5 hover:border-primary/30 hover:shadow-sm transition-all"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{a.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{a.description}</p>
              </div>
              {a.external && <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0 mt-1" />}
            </a>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function LocalInsightEngine({ place }: { place: Place }) {
  const indicators = useMemo(() => buildFullIndicators(place), [place]);
  const standouts = useMemo(() => buildStandouts(indicators), [indicators]);

  // Group indicators by domain
  const grouped = useMemo(() => {
    const map = new Map<string, PlaceIndicator[]>();
    for (const ind of indicators) {
      const arr = map.get(ind.domain) || [];
      arr.push(ind);
      map.set(ind.domain, arr);
    }
    return DOMAIN_ORDER
      .filter((d) => map.has(d))
      .map((d) => ({ domain: d, indicators: map.get(d)! }));
  }, [indicators]);

  return (
    <div className="space-y-8">
      {/* What Stands Out */}
      {standouts.length > 0 && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" /> What stands out here
          </p>
          <ul className="space-y-1.5">
            {standouts.map(s => (
              <li key={s.label} className="flex items-center gap-2 text-sm text-foreground">
                <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${s.direction === "worse" ? "bg-destructive" : s.direction === "better" ? "bg-michigan-forest" : "bg-muted-foreground"}`} />
                <span className="font-medium">{s.label}:</span>
                <span className="text-muted-foreground">{s.delta}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Fallback Notice */}
      {place.isFallback && (
        <div className="rounded-lg border border-michigan-gold/20 bg-michigan-gold/5 px-4 py-3">
          <p className="text-xs text-muted-foreground flex items-start gap-1.5">
            <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-michigan-gold" />
            <span>
              <strong>Data grain:</strong> {place.geoGrainLabel}.
              {place.fallbackLabel && <> Showing <strong>{place.fallbackLabel}</strong>.</>}
              {" "}True {place.placeType}-level data is limited in public datasets.{" "}
              <Link to="/data-validation" className="text-primary hover:underline">Why this fallback →</Link>
            </span>
          </p>
        </div>
      )}

      {/* Domain-Grouped Indicators */}
      <TooltipProvider delayDuration={200}>
        {grouped.map(({ domain, indicators: domainInds }, gi) => {
          const Icon = DOMAIN_ICONS[domain] || Heart;
          const label = DOMAIN_LABELS[domain as DomainId] || domain;
          return (
            <section key={domain} id={`domain-${domain}`} className="space-y-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Icon className="h-4.5 w-4.5 text-primary" /> {label}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {domainInds.map((ind, i) => (
                  <motion.div key={ind.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={gi * 3 + i}>
                    <Card className="h-full hover:shadow-md transition-shadow">
                      <CardContent className="py-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{ind.label}</p>
                          <DeltaChip value={ind.numericValue} stateAvg={ind.stateAvg} direction={ind.direction} />
                        </div>
                        <p className="text-2xl font-bold text-foreground">{ind.value}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{ind.implication}</p>
                        <div className="flex items-center justify-between pt-1 border-t border-border/50">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-[10px] text-muted-foreground cursor-help underline decoration-dotted">
                                {ind.source}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="max-w-xs">
                              <p className="text-xs"><strong>Source:</strong> {ind.source}</p>
                              <p className="text-xs"><strong>Updated:</strong> {ind.updated}</p>
                              <p className="text-xs"><strong>Grain:</strong> {ind.grain}</p>
                            </TooltipContent>
                          </Tooltip>
                          <Badge variant="outline" className="text-[9px] h-4 px-1.5">{ind.grain.split(" ")[0]}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
              <DomainActionPanel domainId={domain as DomainId} />
            </section>
          );
        })}
      </TooltipProvider>

      {/* Sources Table */}
      <SourcesTable indicators={indicators} />
    </div>
  );
}
