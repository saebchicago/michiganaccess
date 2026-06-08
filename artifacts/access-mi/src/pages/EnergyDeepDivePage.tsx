import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Zap, ArrowLeft, ExternalLink, Sun, Info, DollarSign,
} from "lucide-react";
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, ReferenceLine,
  BarChart, Bar, Legend,
} from "recharts";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePageMeta } from "@/hooks/usePageMeta";
import { MICHIGAN_ENERGY_BURDEN } from "@/data/environmentalData";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

// Approximate median incomes for scatter
const COUNTY_INCOMES: Record<string, number> = {
  Wayne: 34000, Genesee: 38000, Saginaw: 36000, Oakland: 78000,
  Kent: 58000, Washtenaw: 68000, Ingham: 48000,
};

const PROGRAMS = [
  { name: "LIHEAP Michigan", amount: "$183.3M", desc: "Federal Low-Income Home Energy Assistance", eligibility: "Up to 150% FPL", url: "https://www.michigan.gov/mdhhs/assistance-programs/energy", source: "Verified anchor" },
  { name: "MiHER", amount: "$211M", desc: "Michigan Healthy Environment & Resilience - up to $34K/household", eligibility: "Income-eligible households", url: "https://www.michigan.gov/egle/about/featured/miher", source: "Verified anchor" },
  { name: "Michigan Saves", amount: "$96.6M financed", desc: "Green lending for energy efficiency upgrades", eligibility: "All Michigan residents", url: "https://michigansaves.org", source: "Verified anchor" },
  { name: "Weatherization (WAP)", amount: "Varies", desc: "Free home weatherization for low-income households", eligibility: "Up to 200% FPL", url: "https://www.michigan.gov/mdhhs/assistance-programs/weatherization", source: "DOE WAP" },
];

export default function EnergyDeepDivePage() {
  usePageMeta({
    title: "Energy Burden Intelligence - Access Michigan",
    description: "Michigan county energy burden analysis. Low-income households spend up to 12% of income on energy. LIHEAP, MiHER, solar potential data.",
    path: "/environment/energy",
  });

  const scatterData = useMemo(() =>
    MICHIGAN_ENERGY_BURDEN.map(e => ({
      county: e.county,
      income: COUNTY_INCOMES[e.county] ?? 50000,
      burden: e.lowIncomeBurdenPct,
      liheap: e.liheapEligibleHouseholds,
      avg: e.avgBurdenPct,
    })),
  []);

  const barData = useMemo(() =>
    [...MICHIGAN_ENERGY_BURDEN]
      .sort((a, b) => b.lowIncomeBurdenPct - a.lowIncomeBurdenPct)
      .map(e => ({
        county: e.county,
        "All Households": e.avgBurdenPct,
        "Low-Income": e.lowIncomeBurdenPct,
      })),
  []);

  return (
    <Layout>
      <Breadcrumbs items={[{ label: "Environment", href: "/environment" }, { label: "Energy Burden" }]} />

      <section className="relative overflow-hidden bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-background py-16 md:py-20">
        <div className="container">
          <motion.div initial="hidden" animate="visible" className="mx-auto max-w-3xl text-center">
            <motion.div variants={fadeUp} custom={0} className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-1.5">
              <Zap className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-600">Energy Burden Intelligence</span>
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1} className="mb-4 text-4xl font-bold text-foreground md:text-5xl">
              Michigan Energy Burden
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-lg text-muted-foreground">
              Low-income Michigan households spend up to 12% of their income on energy - 3x the national affordability target. Over 250,000 households are eligible for assistance.
            </motion.p>
            <motion.p variants={fadeUp} custom={3} className="text-xs text-muted-foreground/70 mt-2">ACEEE LEAD Tool 2023 · DOE · LIHEAP</motion.p>
          </motion.div>
        </div>
      </section>

      <div className="container py-10 space-y-10">
        {/* Burden Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Energy Burden: All Households vs. Low-Income</CardTitle>
            <p className="text-xs text-muted-foreground">DOE target: energy costs below 6% of income. Source: ACEEE LEAD Tool 2023 / DOE</p>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="county" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} unit="%" domain={[0, 15]} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v: number) => `${v}%`} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <ReferenceLine y={6} stroke="#ef4444" strokeDasharray="6 4" label={{ value: "DOE 6% target", position: "right", style: { fontSize: 10, fill: "#ef4444" } }} />
                  <Bar dataKey="All Households" fill="#0A4C95" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Low-Income" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[9px] text-muted-foreground/60 mt-2">Illustrative - based on ACEEE LEAD Tool county-level estimates</p>
          </CardContent>
        </Card>

        {/* Scatter: Income vs Burden */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Income vs. Energy Burden</CardTitle>
            <p className="text-xs text-muted-foreground">Dot size = LIHEAP eligible households. Source: ACEEE LEAD Tool 2023 / Census ACS</p>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" dataKey="income" name="Median Income" tick={{ fontSize: 11 }}
                    tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
                    label={{ value: "Median Household Income", position: "bottom", offset: 20, style: { fontSize: 11 } }} />
                  <YAxis type="number" dataKey="burden" name="Low-Income Burden" tick={{ fontSize: 11 }} unit="%"
                    label={{ value: "Low-Income Energy Burden %", angle: -90, position: "insideLeft", offset: -5, style: { fontSize: 11 } }} />
                  <ZAxis type="number" dataKey="liheap" range={[60, 300]} name="LIHEAP Eligible" />
                  <ReferenceLine y={6} stroke="#ef4444" strokeDasharray="6 4" />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }}
                    formatter={(val: number, name: string) => name === "LIHEAP Eligible" ? val.toLocaleString() : name === "Median Income" ? `$${val.toLocaleString()}` : `${val}%`}
                    labelFormatter={(_, p) => p?.[0]?.payload?.county ? `${p[0].payload.county} County` : ""} />
                  <Scatter data={scatterData}>
                    {scatterData.map(e => <Cell key={e.county} fill={e.burden > 10 ? "#ef4444" : e.burden > 7 ? "#f59e0b" : "#22c55e"} />)}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Programs */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-4">Energy Assistance Programs</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {PROGRAMS.map(p => (
              <Card key={p.name} className="h-full">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-bold text-foreground">{p.name}</h3>
                    <Badge variant="outline" className="text-[10px] font-bold tabular-nums">{p.amount}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{p.desc}</p>
                  <p className="text-[10px] text-muted-foreground">Eligibility: {p.eligibility}</p>
                  <a href={p.url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline mt-2 inline-flex items-center gap-1"
                    aria-label={`${p.name}, opens in new window`}>
                    Learn more <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                  <p className="text-[9px] text-muted-foreground/60 mt-1">{p.source}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Solar Potential */}
        <Card className="bg-gradient-to-r from-amber-500/5 to-background border-amber-200/50 dark:border-amber-900/30">
          <CardContent className="py-6">
            <div className="flex items-start gap-3">
              <Sun className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-foreground mb-1">Solar Potential</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Despite its northern latitude, Michigan has significant solar potential - especially in southern counties.
                  Counties like Oakland and Washtenaw score 7/10 on NREL's solar resource scale. The MiHER program ($211M)
                  and Michigan Saves ($96.6M financed in 2024) make solar more accessible than ever.
                </p>
                <p className="text-[9px] text-muted-foreground/60 mt-1">Source: NREL National Solar Radiation Database · Verified anchors</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button asChild variant="outline">
          <Link to="/environment"><ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Environment</Link>
        </Button>
      </div>
    </Layout>
  );
}
