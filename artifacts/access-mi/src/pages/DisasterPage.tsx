import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle, ArrowLeft, Cloud, Droplets, Wind, Zap, Info,
  Loader2,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ScatterChart, Scatter,
  ZAxis, ReferenceLine, PieChart, Pie, Legend,
} from "recharts";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useFEMADeclarations } from "@/hooks/useFEMAData";
import { MICHIGAN_FEMA_NRI, MICHIGAN_DISASTER_HISTORY } from "@/data/environmentalData";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

const RISK_COLORS: Record<string, string> = {
  "Very Low": "#22c55e",
  "Relatively Low": "#84cc16",
  "Relatively Moderate": "#f59e0b",
  "Relatively High": "#ef4444",
  "Very High": "#dc2626",
};

const DISASTER_COLORS: Record<string, string> = {
  "Severe Storm": "#f59e0b",
  "Flooding": "#3b82f6",
  "Tornado": "#ef4444",
  "Ice Storm / Winter Storm": "#93c5fd",
  "Hurricane / Tropical Storm": "#7c3aed",
  "Snow": "#bfdbfe",
  "Other": "#6b7280",
};

export default function DisasterPage() {
  usePageMeta({
    title: "Disaster Intelligence - Access Michigan",
    description: "Michigan disaster risk analysis: FEMA NRI county scores, 104 presidential disaster declarations, flood risk, and community resilience data.",
    path: "/environment/disaster",
  });

  const [selectedCounty, setSelectedCounty] = useState<string | null>(null);
  const { data: declarations, isLoading } = useFEMADeclarations(selectedCounty);

  const nriScatter = useMemo(() =>
    MICHIGAN_FEMA_NRI.map(n => ({
      county: n.county,
      resilience: n.communityResilience,
      risk: n.compositeRisk,
      annualLoss: n.expectedAnnualLoss / 1e6,
      vulnerability: n.socialVulnerability,
      category: n.riskCategory,
    })),
  []);

  const riskBars = useMemo(() =>
    [...MICHIGAN_FEMA_NRI]
      .sort((a, b) => b.compositeRisk - a.compositeRisk)
      .map(n => ({ county: n.county, risk: n.compositeRisk, fill: RISK_COLORS[n.riskCategory] ?? "#6b7280" })),
  []);

  const disasterPie = useMemo(() =>
    Object.entries(MICHIGAN_DISASTER_HISTORY.byType).map(([type, count]) => ({
      name: type, value: count, fill: DISASTER_COLORS[type] ?? "#6b7280",
    })),
  []);

  return (
    <Layout>
      <Breadcrumbs items={[{ label: "Environment", href: "/environment" }, { label: "Disaster Risk" }]} />

      <section className="relative overflow-hidden bg-gradient-to-br from-red-500/10 via-amber-500/5 to-background py-16 md:py-20">
        <div className="container">
          <motion.div initial="hidden" animate="visible" className="mx-auto max-w-3xl text-center">
            <motion.div variants={fadeUp} custom={0} className="mb-4 inline-flex items-center gap-2 rounded-full bg-red-500/10 px-4 py-1.5">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-600">Disaster Intelligence</span>
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1} className="mb-4 text-4xl font-bold text-foreground md:text-5xl">
              Michigan Disaster Risk
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-lg text-muted-foreground">
              104 presidential disaster declarations since 1953. Severe storms, flooding, tornadoes, ice. Every county has a story.
            </motion.p>
            <motion.p variants={fadeUp} custom={3} className="text-xs text-muted-foreground/70 mt-2">FEMA OpenFEMA API · FEMA National Risk Index 2023</motion.p>
          </motion.div>
        </div>
      </section>

      <div className="container py-10 space-y-10">
        {/* NRI Scatter */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Community Resilience vs. Disaster Risk</CardTitle>
            <p className="text-xs text-muted-foreground">Dot size = expected annual loss. Color = risk category. Source: FEMA NRI 2023</p>
          </CardHeader>
          <CardContent>
            <div className="h-[380px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" dataKey="resilience" domain={[0, 100]} name="Resilience" tick={{ fontSize: 11 }}
                    label={{ value: "Community Resilience Score", position: "bottom", offset: 20, style: { fontSize: 11 } }} />
                  <YAxis type="number" dataKey="risk" domain={[0, 50]} name="Composite Risk" tick={{ fontSize: 11 }}
                    label={{ value: "Composite Risk Score", angle: -90, position: "insideLeft", offset: -5, style: { fontSize: 11 } }} />
                  <ZAxis type="number" dataKey="annualLoss" range={[60, 300]} name="Annual Loss ($M)" />
                  <ReferenceLine x={50} stroke="hsl(var(--muted-foreground))" strokeDasharray="6 4" />
                  <ReferenceLine y={25} stroke="hsl(var(--muted-foreground))" strokeDasharray="6 4" />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }}
                    formatter={(val: number, name: string) => name === "Annual Loss ($M)" ? `$${val.toFixed(0)}M` : val.toFixed(1)}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.county ? `${payload[0].payload.county} County` : ""} />
                  <Scatter data={nriScatter}>
                    {nriScatter.map(e => <Cell key={e.county} fill={RISK_COLORS[e.category] ?? "#6b7280"} />)}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex flex-wrap gap-3">
              {Object.entries(RISK_COLORS).map(([label, color]) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-[10px] text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Disaster Type Donut + Risk Bars side by side */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Disaster Declarations by Type</CardTitle>
              <p className="text-xs text-muted-foreground">104 total declarations, 1953–2024. Source: FEMA OpenFEMA API</p>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={disasterPie} cx="50%" cy="50%" innerRadius={50} outerRadius={100} paddingAngle={2} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {disasterPie.map(e => <Cell key={e.name} fill={e.fill} />)}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">County Risk Ranking</CardTitle>
              <p className="text-xs text-muted-foreground">FEMA NRI Composite Risk Score. Source: FEMA NRI 2023</p>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={riskBars} layout="vertical" margin={{ left: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" domain={[0, 50]} tick={{ fontSize: 11 }} />
                    <YAxis dataKey="county" type="category" tick={{ fontSize: 11 }} width={70} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v: number) => v.toFixed(1)} />
                    <Bar dataKey="risk" radius={[0, 4, 4, 0]}>
                      {riskBars.map(e => <Cell key={e.county} fill={e.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live FEMA County Lookup */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">County Disaster History (Live)</CardTitle>
            <p className="text-xs text-muted-foreground">Real-time FEMA API - select a county to see declarations. Source: FEMA OpenFEMA API</p>
          </CardHeader>
          <CardContent>
            <Select value={selectedCounty ?? ""} onValueChange={v => setSelectedCounty(v || null)}>
              <SelectTrigger className="w-52 mb-4"><SelectValue placeholder="Select county" /></SelectTrigger>
              <SelectContent>
                {MICHIGAN_FEMA_NRI.map(n => <SelectItem key={n.county} value={n.county}>{n.county}</SelectItem>)}
              </SelectContent>
            </Select>

            {isLoading && <div className="flex items-center gap-2 text-sm text-muted-foreground py-4"><Loader2 className="h-4 w-4 animate-spin" /> Fetching from FEMA API...</div>}

            {declarations && declarations.length > 0 && (
              <div className="overflow-x-auto">
                <p className="text-xs font-semibold text-foreground mb-2">{declarations.length} declaration(s) for {selectedCounty} County</p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="py-2 pr-4 text-xs font-semibold text-muted-foreground">Year</th>
                      <th className="py-2 pr-4 text-xs font-semibold text-muted-foreground">Type</th>
                      <th className="py-2 pr-4 text-xs font-semibold text-muted-foreground">Title</th>
                      <th className="py-2 text-xs font-semibold text-muted-foreground">Programs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {declarations.slice(0, 15).map(d => (
                      <tr key={`${d.disasterNumber}-${d.county}`} className="border-b border-border/40">
                        <td className="py-2 pr-4 tabular-nums">{d.declarationDate?.slice(0, 4)}</td>
                        <td className="py-2 pr-4"><Badge variant="outline" className="text-[10px]">{d.incidentType}</Badge></td>
                        <td className="py-2 pr-4 text-muted-foreground max-w-[200px] truncate">{d.title}</td>
                        <td className="py-2 text-[10px] text-muted-foreground">{d.programsActivated.join(", ") || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {declarations && declarations.length === 0 && selectedCounty && (
              <p className="text-sm text-muted-foreground py-4">No disaster declarations found for {selectedCounty} County in the FEMA API.</p>
            )}
          </CardContent>
        </Card>

        {/* Methodology */}
        <Card className="bg-muted/30">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                Risk scores from FEMA National Risk Index 2023. Disaster declarations from FEMA OpenFEMA API (live). Expected Annual Loss is a modeled estimate. Social Vulnerability from CDC SVI 2022. Community Resilience from FEMA NRI methodology.
              </p>
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
