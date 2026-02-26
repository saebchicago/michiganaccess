/**
 * Michigan Community Brief — Deterministic civic briefing engine.
 * Synthesizes existing Place indicators into a readable civic brief with
 * signal classification, resident takeaways, action priorities, and statewide context.
 */
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Compass, TrendingUp, TrendingDown, ShieldCheck, AlertTriangle,
  Lightbulb, Zap, ExternalLink, ChevronRight, ArrowUpRight,
  Users, Briefcase, Heart, Baby, Home as HomeIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Place, PlaceIndicator } from "@/models/Place";
import { buildFullIndicators, STATE_AVERAGES } from "@/models/Place";
import { DOMAIN_ACTIONS, DOMAIN_LABELS, type DomainId } from "@/data/domain-actions";

// ── Signal Classification ──

export type SignalCategory = "strength" | "pressure" | "emerging-risk" | "opportunity";

export interface ClassifiedSignal {
  indicator: PlaceIndicator;
  category: SignalCategory;
  deviationPct: number; // absolute % deviation
  direction: "better" | "worse" | "neutral";
}

function classifyIndicator(ind: PlaceIndicator): ClassifiedSignal {
  const diff = ind.numericValue - ind.stateAvg;
  const pct = ind.stateAvg !== 0 ? Math.abs(diff / ind.stateAvg) * 100 : 0;
  const isBetter = ind.direction === "lower-is-better" ? diff < 0 : diff > 0;
  const direction: "better" | "worse" | "neutral" = pct < 5 ? "neutral" : isBetter ? "better" : "worse";

  let category: SignalCategory;
  if (direction === "better" && pct >= 10) category = "strength";
  else if (direction === "worse" && pct >= 20) category = "pressure";
  else if (direction === "worse" && pct >= 10) category = "emerging-risk";
  else if (direction === "better") category = "opportunity";
  else if (direction === "worse") category = "emerging-risk";
  else category = "opportunity";

  return { indicator: ind, category, deviationPct: pct, direction };
}

function classifyAll(indicators: PlaceIndicator[]): ClassifiedSignal[] {
  return indicators
    .filter(ind => ind.numericValue !== 0 && ind.stateAvg !== 0)
    .map(classifyIndicator)
    .sort((a, b) => b.deviationPct - a.deviationPct);
}

// ── Narrative generators (deterministic, no AI) ──

const THEME_TEMPLATES: Record<string, (place: Place, signals: ClassifiedSignal[]) => string | null> = {
  housing: (place, signals) => {
    const rent = signals.find(s => s.indicator.id === "rent-burden");
    const poverty = signals.find(s => s.indicator.id === "poverty-rate");
    if (rent?.direction === "worse") return `Housing costs are a pressure point — rent burden is higher than the Michigan average.`;
    if (poverty?.direction === "worse") return `Economic strain is evident, with poverty rates above the state average.`;
    if (rent?.direction === "better") return `Housing affordability is relatively strong compared to Michigan overall.`;
    return null;
  },
  health: (place, signals) => {
    const uninsured = signals.find(s => s.indicator.id === "uninsured");
    const pc = signals.find(s => s.indicator.id === "pc-ratio");
    if (uninsured?.direction === "worse" && pc?.direction === "worse") return `Healthcare access faces dual challenges — higher uninsured rates and fewer primary care providers per resident.`;
    if (uninsured?.direction === "better") return `Health insurance coverage is stronger than most Michigan counties.`;
    if (pc?.direction === "worse") return `Primary care access is limited relative to population size.`;
    return null;
  },
  transportation: (place, signals) => {
    const vehicle = signals.find(s => s.indicator.id === "vehicle-access");
    if (vehicle?.direction === "worse") return `Transportation dependency shapes daily life, with lower vehicle access than the state average.`;
    return null;
  },
  workforce: (place, signals) => {
    const income = signals.find(s => s.indicator.id === "median-income");
    const unemp = signals.find(s => s.indicator.id === "unemployment");
    if (income?.direction === "worse" && unemp?.direction === "worse") return `The local economy shows strain — household incomes are lower and unemployment is higher than the state average.`;
    if (income?.direction === "better") return `Household incomes are above the Michigan median, suggesting relative economic stability.`;
    if (unemp?.direction === "worse") return `Unemployment is higher than the state average, which may affect household stability.`;
    return null;
  },
  energy: (place, signals) => {
    const burden = signals.find(s => s.indicator.id === "energy-burden");
    if (burden?.direction === "worse") return `Energy costs take a larger share of household income than the state average.`;
    return null;
  },
  food: (place, signals) => {
    const food = signals.find(s => s.indicator.id === "food-insecurity");
    if (food?.direction === "worse") return `Food insecurity is above the Michigan average, suggesting more residents may need nutrition assistance.`;
    return null;
  },
};

function buildOverview(place: Place, classified: ClassifiedSignal[]): string {
  const strengths = classified.filter(s => s.category === "strength").length;
  const pressures = classified.filter(s => s.category === "pressure" || s.category === "emerging-risk").length;
  const total = classified.length;

  let tone: string;
  if (pressures === 0 && strengths > 0) tone = `${place.name} shows several strengths relative to Michigan overall.`;
  else if (pressures > strengths) tone = `${place.name} faces notable challenges in key areas compared to Michigan overall.`;
  else if (strengths > pressures) tone = `${place.name} has important strengths, though some areas warrant attention.`;
  else tone = `${place.name} shows a mixed profile relative to Michigan averages.`;

  const topInsight = classified[0];
  let detail = "";
  if (topInsight) {
    const label = topInsight.indicator.label.toLowerCase();
    detail = topInsight.direction === "worse"
      ? ` The most notable indicator is ${label}, which is ${topInsight.deviationPct.toFixed(0)}% ${topInsight.indicator.direction === "lower-is-better" ? "above" : "below"} the state average.`
      : ` A standout strength is ${label}, performing ${topInsight.deviationPct.toFixed(0)}% ${topInsight.indicator.direction === "lower-is-better" ? "below" : "above"} the state average.`;
  }

  return `${tone}${detail} This brief covers ${total} indicators across health, housing, workforce, and community domains.`;
}

function buildNarrativeInsights(place: Place, classified: ClassifiedSignal[]): string[] {
  const insights: string[] = [];
  const domainGroups = new Map<string, ClassifiedSignal[]>();
  for (const s of classified) {
    const arr = domainGroups.get(s.indicator.domain) || [];
    arr.push(s);
    domainGroups.set(s.indicator.domain, arr);
  }

  for (const [domain, sigs] of domainGroups) {
    const gen = THEME_TEMPLATES[domain];
    if (gen) {
      const insight = gen(place, sigs);
      if (insight) insights.push(insight);
    }
  }

  if (insights.length < 3) {
    // Fill with top deviations
    for (const s of classified) {
      if (insights.length >= 5) break;
      const existing = insights.some(i => i.includes(s.indicator.label.toLowerCase()));
      if (existing) continue;
      const label = s.indicator.label;
      const phr = s.direction === "worse"
        ? `${label} is ${s.deviationPct.toFixed(0)}% ${s.indicator.direction === "lower-is-better" ? "above" : "below"} the state average.`
        : `${label} is ${s.deviationPct.toFixed(0)}% ${s.indicator.direction === "lower-is-better" ? "below" : "above"} the state average — a relative strength.`;
      insights.push(phr);
    }
  }

  return insights.slice(0, 5);
}

// ── Resident Takeaways (mapped to Life Situations) ──

interface ResidentTakeaway {
  audience: string;
  icon: React.ElementType;
  insight: string;
}

const AUDIENCE_MAP: { id: string; label: string; icon: React.ElementType; domains: string[] }[] = [
  { id: "family", label: "Families", icon: Baby, domains: ["health", "education", "food"] },
  { id: "worker", label: "Workers", icon: Briefcase, domains: ["workforce", "transportation"] },
  { id: "aging", label: "Older adults", icon: Users, domains: ["health", "transportation", "housing"] },
  { id: "lowincome", label: "Low-income households", icon: Heart, domains: ["energy", "food", "housing", "benefits"] },
  { id: "newcomer", label: "New residents", icon: HomeIcon, domains: ["housing", "transportation", "education"] },
];

function buildResidentTakeaways(place: Place, classified: ClassifiedSignal[]): ResidentTakeaway[] {
  const takeaways: ResidentTakeaway[] = [];

  for (const aud of AUDIENCE_MAP) {
    const relevant = classified.filter(s => aud.domains.includes(s.indicator.domain));
    const top = relevant.slice(0, 2);
    if (top.length === 0) continue;

    const parts = top.map(s => {
      const label = s.indicator.label.toLowerCase();
      if (s.direction === "worse") return `${label} is higher than state average`;
      if (s.direction === "better") return `${label} is a local strength`;
      return `${label} is near the state average`;
    });

    takeaways.push({
      audience: aud.label,
      icon: aud.icon,
      insight: `For ${aud.label.toLowerCase()}: ${parts.join(", and ")}.`,
    });
  }

  return takeaways.slice(0, 4);
}

// ── Action Priorities ──

function buildActionPriorities(classified: ClassifiedSignal[]): { domain: DomainId; label: string; actions: typeof DOMAIN_ACTIONS[DomainId] }[] {
  const pressures = classified.filter(s => s.category === "pressure" || s.category === "emerging-risk");
  const seenDomains = new Set<string>();
  const result: { domain: DomainId; label: string; actions: typeof DOMAIN_ACTIONS[DomainId] }[] = [];

  for (const s of pressures) {
    const d = s.indicator.domain as DomainId;
    if (seenDomains.has(d)) continue;
    const actions = DOMAIN_ACTIONS[d];
    if (!actions?.length) continue;
    seenDomains.add(d);
    result.push({ domain: d, label: DOMAIN_LABELS[d] || d, actions: actions.slice(0, 2) });
    if (result.length >= 3) break;
  }

  // Fill if fewer than 3
  if (result.length < 3) {
    for (const d of ["health", "benefits", "food"] as DomainId[]) {
      if (seenDomains.has(d)) continue;
      const actions = DOMAIN_ACTIONS[d];
      if (!actions?.length) continue;
      seenDomains.add(d);
      result.push({ domain: d, label: DOMAIN_LABELS[d] || d, actions: actions.slice(0, 2) });
      if (result.length >= 3) break;
    }
  }

  return result;
}

// ── Statewide Context ──

function buildStateContext(classified: ClassifiedSignal[]): { strengths: string[]; challenges: string[] } {
  const strengths = classified
    .filter(s => s.direction === "better" && s.deviationPct >= 8)
    .slice(0, 2)
    .map(s => s.indicator.label);

  const challenges = classified
    .filter(s => s.direction === "worse" && s.deviationPct >= 8)
    .slice(0, 2)
    .map(s => s.indicator.label);

  return { strengths, challenges };
}

// ── Signal category styles ──

const CATEGORY_STYLES: Record<SignalCategory, { label: string; color: string; icon: React.ElementType }> = {
  strength: { label: "Strength", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", icon: ShieldCheck },
  pressure: { label: "Pressure", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800", icon: AlertTriangle },
  "emerging-risk": { label: "Emerging Risk", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800", icon: Zap },
  opportunity: { label: "Opportunity", color: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300 border-sky-200 dark:border-sky-800", icon: Lightbulb },
};

// ── Exported helpers for SEO ──

export function buildBriefMetaDescription(place: Place): string {
  const indicators = buildFullIndicators(place);
  const classified = classifyAll(indicators);
  const top = classified.slice(0, 2);
  if (top.length === 0) return `Community brief for ${place.name}, Michigan — explore local health data and civic resources.`;
  const phrases = top.map(s => {
    const l = s.indicator.label.toLowerCase();
    return s.direction === "worse" ? `${l} above state avg` : `${l} is a strength`;
  });
  return `${place.name} Community Brief: ${phrases.join("; ")}. Explore local data and resources on Access Michigan.`;
}

// ── Component ──

export default function MichiganCommunityBrief({ place }: { place: Place }) {
  const indicators = useMemo(() => buildFullIndicators(place), [place]);
  const classified = useMemo(() => classifyAll(indicators), [indicators]);
  const overview = useMemo(() => buildOverview(place, classified), [place, classified]);
  const insights = useMemo(() => buildNarrativeInsights(place, classified), [place, classified]);
  const takeaways = useMemo(() => buildResidentTakeaways(place, classified), [place, classified]);
  const actionPriorities = useMemo(() => buildActionPriorities(classified), [classified]);
  const context = useMemo(() => buildStateContext(classified), [classified]);

  // Signal legend
  const categoryCounts = useMemo(() => {
    const counts: Record<SignalCategory, number> = { strength: 0, pressure: 0, "emerging-risk": 0, opportunity: 0 };
    for (const s of classified) counts[s.category]++;
    return counts;
  }, [classified]);

  return (
    <section id="community-brief" className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="flex items-center gap-2 mb-2">
          <Compass className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Michigan Community Brief</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          A data-driven civic snapshot — every insight below is derived from public indicators shown on this page.
        </p>
      </motion.div>

      {/* Overview */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-5 space-y-4">
          <p className="text-sm text-foreground leading-relaxed">{overview}</p>

          {/* Signal Legend */}
          <div className="flex flex-wrap gap-2">
            {(Object.keys(CATEGORY_STYLES) as SignalCategory[]).map(cat => {
              const s = CATEGORY_STYLES[cat];
              const count = categoryCounts[cat];
              if (count === 0) return null;
              return (
                <Badge key={cat} variant="outline" className={`text-[10px] gap-1 border ${s.color}`}>
                  <s.icon className="h-3 w-3" />
                  {s.label} ({count})
                </Badge>
              );
            })}
          </div>

          {/* Key Insights */}
          {insights.length > 0 && (
            <ul className="space-y-2 pt-2 border-t border-border/50">
              {insights.map((ins, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-2" />
                  <span>{ins}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Statewide Context Strip */}
      {(context.strengths.length > 0 || context.challenges.length > 0) && (
        <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
          <p className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Compared to Michigan overall…</p>
          <div className="flex flex-wrap gap-2">
            {context.strengths.map(s => (
              <Badge key={s} variant="outline" className="text-[10px] gap-1 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300">
                <TrendingUp className="h-3 w-3" /> {s}
              </Badge>
            ))}
            {context.challenges.map(c => (
              <Badge key={c} variant="outline" className="text-[10px] gap-1 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300">
                <TrendingDown className="h-3 w-3" /> {c}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* What This Means for Residents */}
      {takeaways.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Users className="h-4 w-4 text-primary" />
            What this means for daily life in {place.name}
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {takeaways.map((t, i) => (
              <motion.div
                key={t.audience}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.2 }}
                className="flex items-start gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5"
              >
                <t.icon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-foreground leading-relaxed">{t.insight}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Action Priorities */}
      {actionPriorities.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <ArrowUpRight className="h-4 w-4 text-primary" />
            Top Actions Residents Can Take
          </h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {actionPriorities.map(ap => (
              <Card key={ap.domain} className="hover:shadow-sm transition-shadow">
                <CardContent className="py-4 space-y-2">
                  <Badge variant="secondary" className="text-[10px]">{ap.label}</Badge>
                  {ap.actions.map(a => (
                    <a
                      key={a.title}
                      href={a.href}
                      target={a.external ? "_blank" : undefined}
                      rel={a.external ? "noopener noreferrer" : undefined}
                      className="flex items-center gap-1.5 text-xs text-primary hover:underline group"
                    >
                      <ChevronRight className="h-3 w-3 shrink-0" />
                      <span>{a.title}</span>
                      {a.external && <ExternalLink className="h-2.5 w-2.5 opacity-50" />}
                    </a>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
