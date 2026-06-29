import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  TrendingUp,
  DollarSign,
  Info,
  ArrowRight,
  Calendar,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IntegrityBadge } from "@/components/chna/IntegrityBadge";
import DataProvenance from "@/components/shared/DataProvenance";
import {
  buildCountyAttributionTimeline,
  listAttributionCounties,
  TOTAL_TRACKED_INVESTMENT,
} from "@/utils/investmentAttribution";
import { countyToSlug } from "@/utils/countyUtils";

const CATEGORY_COLORS: Record<string, string> = {
  sba_business: "#3b82f6",
  sba_disaster: "#f59e0b",
  fema: "#ef4444",
  community_benefit: "#10b981",
};

export default function InvestmentImpactPage() {
  usePageMeta({
    title: "Investment and Impact Tracking",
    description:
      "Timeline views linking federal investment flows to SDOH outcome proxies with traceable methodology and integrity labels.",
    path: "/investment-impact",
  });

  const counties = listAttributionCounties();
  const [selectedCounty, setSelectedCounty] = useState(counties[0] ?? "Wayne");

  const timeline = useMemo(
    () => buildCountyAttributionTimeline(selectedCounty),
    [selectedCounty],
  );

  const milestoneChart = useMemo(() => {
    if (!timeline) return [];
    return timeline.milestones.map((m) => ({
      label: m.label.split("(")[0].trim(),
      amount: Math.round(m.amountUsd / 1_000_000),
      fill: CATEGORY_COLORS[m.category] ?? "#64748b",
    }));
  }, [timeline]);

  return (
    <Layout>
      <Breadcrumbs
        items={[
          { label: "Transparency", href: "/transparency" },
          { label: "Investment Impact" },
        ]}
      />

      <section className="bg-gradient-to-br from-teal-900/90 via-slate-900 to-slate-950 py-12 md:py-16 text-white">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-5 w-5 text-teal-300" />
              <Badge className="bg-teal-500/20 text-teal-100 border-teal-500/30">
                UC7 + UC10 Phase 1
              </Badge>
            </div>
            <h1 className="text-3xl font-bold md:text-4xl mb-3">
              Investment and Impact Tracking
            </h1>
            <p className="text-slate-300 max-w-2xl leading-relaxed">
              Trace federal investment milestones alongside SDOH outcome proxies.
              Attribution is associative unless linked to primary program evaluations.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container py-8 space-y-6">
        <Card className="border-amber-200/60 bg-amber-50/40 dark:bg-amber-950/20">
          <CardContent className="py-4 flex gap-3">
            <Info className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tracking {counties.length} counties with federal investment data (
              ${Math.round(TOTAL_TRACKED_INVESTMENT / 1_000_000_000)}B cumulative, MODELED).
              Community benefit portfolio ingestion expands in Phase 2.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-5 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-sm font-bold">Select county</label>
              <Select value={selectedCounty} onValueChange={setSelectedCounty}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {counties.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" asChild className="text-xs">
                <Link to={`/county/${countyToSlug(selectedCounty)}`}>
                  County profile <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>

            {timeline && (
              <div className="grid gap-3 sm:grid-cols-4">
                <div className="rounded-lg border p-3 text-center">
                  <DollarSign className="h-4 w-4 mx-auto text-primary mb-1" />
                  <p className="text-[10px] text-muted-foreground">Total federal</p>
                  <p className="text-lg font-bold font-mono">
                    ${Math.round(timeline.totalFederalUsd / 1_000_000)}M
                  </p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-[10px] text-muted-foreground">Per capita</p>
                  <p className="text-lg font-bold font-mono">${timeline.perCapitaFederal}</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-[10px] text-muted-foreground">Population</p>
                  <p className="text-lg font-bold font-mono">
                    {timeline.population.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-[10px] text-muted-foreground">Impact score</p>
                  <p className="text-lg font-bold font-mono">{timeline.modeledImpactScore}</p>
                  <IntegrityBadge
                    label={timeline.integrityLabel}
                    source="Attribution model"
                    vintage="2026"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {timeline && (
          <>
            <Card>
              <CardContent className="py-5">
                <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Investment milestones
                </h2>
                <div className="h-48 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={milestoneChart} layout="vertical" margin={{ left: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                      <XAxis type="number" tick={{ fontSize: 10 }} unit="M" />
                      <YAxis type="category" dataKey="label" tick={{ fontSize: 9 }} width={78} />
                      <Tooltip formatter={(v: number) => [`$${v}M`, "Amount"]} />
                      <Bar dataKey="amount" radius={[0, 2, 2, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <ul className="space-y-2">
                  {timeline.milestones.map((m) => (
                    <li key={m.year + m.label} className="flex flex-wrap items-center gap-2 text-xs border-b pb-2">
                      <span className="font-mono font-semibold">{m.year}</span>
                      <span>{m.label}</span>
                      <span className="font-mono">${Math.round(m.amountUsd / 1_000_000)}M</span>
                      <IntegrityBadge label={m.integrityLabel} source={m.source} vintage="2024" />
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-5">
                <h2 className="text-sm font-bold mb-4">Outcome proxies over time</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-xs">
                        <th className="py-2 px-2 text-left">Year</th>
                        <th className="py-2 px-2 text-left">Metric</th>
                        <th className="py-2 px-2 text-right">Value</th>
                        <th className="py-2 px-2 text-center">Label</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timeline.outcomes.map((o, i) => (
                        <tr key={i} className="border-b border-border/30">
                          <td className="py-2 px-2 font-mono text-xs">{o.year}</td>
                          <td className="py-2 px-2 text-xs">{o.metric}</td>
                          <td className="py-2 px-2 text-right font-mono text-xs">
                            {o.value}
                            {o.unit === "%" ? "%" : ""}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <IntegrityBadge label={o.integrityLabel} source={o.source} vintage="2024" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-[11px] text-muted-foreground mt-4 leading-relaxed">
                  {timeline.attributionNote}
                </p>
              </CardContent>
            </Card>
          </>
        )}

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/public-investment">
              Public Investment <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/impact">Platform Impact</Link>
          </Button>
        </div>

        <DataProvenance
          source="SBA FOIA, OpenFEMA, ACS, County Health Rankings"
          updated="2024-2026"
          methodologyHref="/transparency/money"
        />
      </div>
    </Layout>
  );
}