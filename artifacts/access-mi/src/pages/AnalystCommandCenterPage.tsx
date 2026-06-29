import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Info,
  ArrowRight,
  TrendingDown,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IntegrityBadge } from "@/components/chna/IntegrityBadge";
import DataProvenance from "@/components/shared/DataProvenance";
import AnalystToolGrid from "@/components/analyst/AnalystToolGrid";
import {
  ANALYST_DASHBOARD_GROUPS,
  dashboardsByGroup,
} from "@/data/analystDashboardRegistry";
import { rankCountyInvestmentGaps } from "@/utils/investmentGapModel";
import { countyToSlug } from "@/utils/countyUtils";

const GAP_COLORS = ["#ef4444", "#f59e0b", "#64748b"];

export default function AnalystCommandCenterPage() {
  usePageMeta({
    title: "Analyst Command Center",
    description:
      "Unified hub for cohort builder, climate scenarios, SDOH risk, investment attribution, and service area dashboards.",
    path: "/analyst",
  });

  const investmentGaps = useMemo(() => rankCountyInvestmentGaps(), []);
  const gapChart = useMemo(
    () =>
      investmentGaps.slice(0, 8).map((g) => ({
        county: g.county,
        gap: g.gapScore,
        tier: g.tier,
      })),
    [investmentGaps],
  );

  return (
    <Layout>
      <Breadcrumbs
        items={[
          { label: "Data & Insights", href: "/data-and-insights" },
          { label: "Analyst Command Center" },
        ]}
      />

      <section className="bg-gradient-to-br from-indigo-950/90 via-slate-900 to-slate-950 py-12 md:py-16 text-white">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-3">
              <LayoutDashboard className="h-5 w-5 text-indigo-300" />
              <Badge className="bg-indigo-500/20 text-indigo-100 border-indigo-500/30">
                UC8 Command Center
              </Badge>
            </div>
            <h1 className="text-3xl font-bold md:text-4xl mb-3">Analyst Command Center</h1>
            <p className="text-slate-300 max-w-2xl leading-relaxed">
              One launchpad for cohort filtering, climate and scenario planning, SDOH risk
              stratification, investment attribution, and service area intelligence. Every
              surface shows integrity labels and named sources.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" asChild className="text-xs">
                <Link to="/cohort-builder">Start with Cohort Builder</Link>
              </Button>
              <Button size="sm" variant="outline" asChild className="text-xs border-white/30 text-white hover:bg-white/10">
                <Link to="/data-and-insights">Data & Insights hub</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container py-8 space-y-10">
        <Card className="border-amber-200/60 bg-amber-50/40 dark:bg-amber-950/20">
          <CardContent className="py-4 flex gap-3">
            <Info className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ask AccessMI supports natural-language cohort queries with deep links to the
              Cohort Builder. Cloud cohort workspaces require Supabase migrations deployed
              to production.
            </p>
          </CardContent>
        </Card>

        {ANALYST_DASHBOARD_GROUPS.map((group) => (
          <section key={group.id} className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">{group.label}</h2>
              <p className="text-sm text-muted-foreground">{group.description}</p>
            </div>
            <AnalystToolGrid tools={dashboardsByGroup(group.id)} />
          </section>
        ))}

        <Card className="border-primary/20">
          <CardContent className="py-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-primary" />
                Investment gap spotlight (tracked counties)
              </h2>
              <Button variant="outline" size="sm" asChild className="text-xs">
                <Link to="/investment-impact">
                  Full attribution timeline <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              MODELED gap score compares poverty-based need against per-capita federal
              investment proxies (SBA + FEMA). Not causal attribution.
            </p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gapChart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                  <XAxis dataKey="county" tick={{ fontSize: 9 }} interval={0} angle={-30} textAnchor="end" height={48} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="gap" name="Gap score" radius={[2, 2, 0, 0]}>
                    {gapChart.map((row, i) => (
                      <Cell
                        key={row.county}
                        fill={
                          row.tier === "High gap"
                            ? GAP_COLORS[0]
                            : row.tier === "Moderate gap"
                              ? GAP_COLORS[1]
                              : GAP_COLORS[2]
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-2 text-left">County</th>
                    <th className="py-2 px-2 text-right">Poverty %</th>
                    <th className="py-2 px-2 text-right">Fed $/cap</th>
                    <th className="py-2 px-2 text-right">Gap</th>
                    <th className="py-2 px-2 text-center">Tier</th>
                  </tr>
                </thead>
                <tbody>
                  {investmentGaps.slice(0, 6).map((g) => (
                    <tr key={g.county} className="border-b border-border/30">
                      <td className="py-2 px-2">
                        <Link
                          to={`/county/${countyToSlug(g.county)}`}
                          className="text-primary hover:underline"
                        >
                          {g.county}
                        </Link>
                      </td>
                      <td className="py-2 px-2 text-right font-mono">{g.povertyRate}%</td>
                      <td className="py-2 px-2 text-right font-mono">${g.perCapitaFederal}</td>
                      <td className="py-2 px-2 text-right font-mono">{g.gapScore}</td>
                      <td className="py-2 px-2 text-center">{g.tier}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <IntegrityBadge label="MODELED" source="Federal investment + ACS poverty" vintage="2024" />
          </CardContent>
        </Card>

        <DataProvenance
          source="Platform dashboard registry, SBA FOIA, OpenFEMA, ACS, EPA EJScreen"
          updated="2026"
          methodologyHref="/data-validation"
        />
      </div>
    </Layout>
  );
}