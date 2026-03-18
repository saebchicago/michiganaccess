import { usePageMeta } from "@/hooks/usePageMeta";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Server, Zap, Building2, MapPin, AlertTriangle, ExternalLink, Landmark, Droplets, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

/* ── Data ────────────────────────────────────────────────────────────── */

const pipelineProjects = [
  { project: "Stargate", location: "Saline Twp (Washtenaw)", developer: "Oracle/OpenAI/Related Digital", capacity: "1.4 GW", investment: "$7B", status: "MPSC approved" },
  { project: "Project Flex", location: "Lyon Twp (Oakland)", developer: "Verrus/Sidewalk Infra/Alphabet", capacity: "1.8M sq ft", investment: "TBD", status: "Conditional approval" },
  { project: "Project Cannoli", location: "Van Buren Twp (Wayne)", developer: "Panattoni", capacity: "1 GW", investment: "TBD", status: "Preliminary approved" },
  { project: "Metrobloks", location: "Southfield (Oakland)", developer: "Metrobloks LLC", capacity: "100 MW", investment: "$1.5B", status: "Approved" },
  { project: "Switch Pyramid", location: "Gaines Twp (Kent)", developer: "Switch", capacity: "237 MW", investment: "Part of $5B", status: "Phase 3" },
  { project: "Microsoft", location: "Kent/Allegan", developer: "Microsoft", capacity: "TBD", investment: "TBD", status: "Rezoning" },
  { project: "UofM/Los Alamos", location: "Ypsilanti Twp", developer: "UM + LANL", capacity: "TBD", investment: "$1.25B", status: "Planning" },
  { project: "DAMAC Properties", location: "TBD", developer: "DAMAC", capacity: "TBD", investment: "$500M", status: "Construction Q1 2026" },
];

const capacityChart = [
  { name: "Stargate", gw: 1.4, fill: "hsl(209, 86%, 31%)" },
  { name: "Cannoli", gw: 1.0, fill: "hsl(180, 100%, 32%)" },
  { name: "Switch", gw: 0.237, fill: "hsl(27, 87%, 67%)" },
  { name: "Metrobloks", gw: 0.1, fill: "hsl(145, 32%, 30%)" },
];

const energyDemandSplit = [
  { name: "Current Residential/Commercial", value: 55, color: "hsl(209, 86%, 31%)" },
  { name: "Current Industrial", value: 30, color: "hsl(215, 19%, 55%)" },
  { name: "Projected Data Center (by 2035)", value: 15, color: "hsl(0, 100%, 71%)" },
];

const statusColors: Record<string, string> = {
  "MPSC approved": "bg-michigan-forest/10 text-michigan-forest",
  "Conditional approval": "bg-michigan-gold/10 text-michigan-gold",
  "Preliminary approved": "bg-michigan-teal/10 text-michigan-teal",
  "Approved": "bg-michigan-forest/10 text-michigan-forest",
  "Phase 3": "bg-primary/10 text-primary",
  "Rezoning": "bg-michigan-gold/10 text-michigan-gold",
  "Planning": "bg-muted text-muted-foreground",
  "Construction Q1 2026": "bg-michigan-coral/10 text-michigan-coral",
};

/* ── Component ───────────────────────────────────────────────────────── */

const DataCenterPage = () => {
  usePageMeta({
    title: "Data Center Insights — Access Michigan",
    description: "Michigan's $11.3B+ data center pipeline: Stargate, energy demand, community impact, environmental concerns, and regulatory updates.",
    path: "/data-centers",
  });

  return (
    <Layout>
      <Breadcrumbs items={[{ label: "Data Centers" }]} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-michigan-teal/5 to-background py-16 md:py-20">
        <div className="container">
          <motion.div initial="hidden" animate="visible" className="mx-auto max-w-3xl text-center">
            <motion.div variants={fadeUp} custom={0} className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5">
              <Server className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Data Center Landscape</span>
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1} className="mb-4 text-4xl font-bold text-foreground md:text-5xl">
              Michigan's Data Center Landscape
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-lg text-muted-foreground">
              Over <strong>$11.3 billion</strong> in announced projects. Tracking investment, energy demand, community impact, and environmental concerns across the state.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <div className="container max-w-6xl py-10 space-y-12">
        {/* Stargate Overview */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Building2 className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle>Stargate Project — $7 Billion</CardTitle>
                  <CardDescription>Oracle / OpenAI / Related Digital · Saline Township, Washtenaw County</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-4">
                {[
                  { label: "Investment", value: "$7B" },
                  { label: "Demand", value: "1.4 GW" },
                  { label: "Construction Jobs", value: "2,500 union" },
                  { label: "Permanent Jobs", value: "~450 + 1,500 county-wide" },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg bg-background border border-border p-3 text-center">
                    <p className="text-xl font-bold text-primary">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li>• 19-year DTE contract, approved Dec 18, 2025 (MPSC Case U-21990)</li>
                <li>• 1,383 MW battery storage funded by Oracle</li>
                <li>• $8M+/year for area schools</li>
                <li>• Projected $300M/year net ratepayer benefit</li>
                <li>• Closed-loop cooling (low water use)</li>
                <li>• Curtailed before other customers in emergencies</li>
              </ul>
            </CardContent>
          </Card>
        </motion.section>

        {/* Pipeline Table */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" /> Project Pipeline
          </h2>
          <Card>
            <CardContent className="py-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-3 text-left text-xs font-medium text-muted-foreground">Project</th>
                      <th className="pb-3 text-left text-xs font-medium text-muted-foreground">Location</th>
                      <th className="pb-3 text-left text-xs font-medium text-muted-foreground">Developer</th>
                      <th className="pb-3 text-left text-xs font-medium text-muted-foreground">Capacity</th>
                      <th className="pb-3 text-left text-xs font-medium text-muted-foreground">Investment</th>
                      <th className="pb-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pipelineProjects.map((p) => (
                      <tr key={p.project} className="border-b border-border/50">
                        <td className="py-3 font-medium text-foreground">{p.project}</td>
                        <td className="py-3 text-muted-foreground">{p.location}</td>
                        <td className="py-3 text-muted-foreground text-xs">{p.developer}</td>
                        <td className="py-3 text-muted-foreground">{p.capacity}</td>
                        <td className="py-3 font-medium text-foreground">{p.investment}</td>
                        <td className="py-3">
                          <Badge className={`text-[10px] ${statusColors[p.status] || "bg-muted text-muted-foreground"}`}>
                            {p.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Charts */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Capacity Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Zap className="h-5 w-5 text-michigan-gold" /> Capacity by Project (GW)
                </CardTitle>
                <CardDescription>Known capacity figures for major projects</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={capacityChart} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                    <XAxis type="number" unit=" GW" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v: number) => [`${v} GW`]} />
                    <Bar dataKey="gw" radius={[0, 4, 4, 0]}>
                      {capacityChart.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Energy Demand Pie */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-5 w-5 text-michigan-coral" /> Projected Energy Demand Split
                </CardTitle>
                <CardDescription>Current vs. projected data center share by 2035</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={energyDemandSplit} cx="50%" cy="50%" outerRadius={100} innerRadius={50} paddingAngle={3} dataKey="value" label={({ name, value }) => `${value}%`}>
                      {energyDemandSplit.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        {/* Energy Demand */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-michigan-gold" /> Energy Demand
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "DTE Pipeline", value: "8.4 GW", detail: "1.4 GW executed, 3+ GW advanced talks, 4+ GW additional" },
              { label: "Consumers Pipeline", value: "~15 GW", detail: "Economic development pipeline; ~3 GW probable by 2035" },
              { label: "Combined Demand", value: "~16 GW", detail: "Would nearly double combined utility demand" },
              { label: "UCS Projection", value: "2× by 2050", detail: "57% of demand growth by 2030 from data centers" },
            ].map((item) => (
              <Card key={item.label}>
                <CardContent className="p-5 text-center">
                  <p className="text-2xl font-bold text-primary">{item.value}</p>
                  <p className="text-sm font-medium text-foreground mt-1">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.section>

        {/* Community Impact */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Landmark className="h-5 w-5 text-primary" /> Community & Fiscal Impact
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-2">Tax Incentives (PA 207-208 of 2024)</h3>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li>• HB 4906/SB 237: 6% sales tax exemption on equipment through 2050</li>
                  <li>• Requirements: $250M min investment, 30 jobs at 150% median wage, green building cert, 90% clean energy</li>
                  <li>• Estimated fiscal impact: $52.5M–$90M+ revenue reduction</li>
                  <li>• Bipartisan repeal bill introduced December 2025</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-2">Local Response</h3>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li>• <strong>19+ townships/cities</strong> passed data center moratoriums</li>
                  <li>• Stargate: $8M+/year for area schools</li>
                  <li>• Projected $300M/year net ratepayer benefit (DTE estimate)</li>
                  <li>• 2,500 union construction jobs + ~450 permanent (Stargate alone)</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        {/* Environmental Concerns */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
          <Card className="border-michigan-coral/20 bg-michigan-coral/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="h-6 w-6 shrink-0 text-michigan-coral mt-0.5" />
                <div>
                  <h2 className="text-lg font-bold text-foreground">Environmental Concerns</h2>
                  <p className="text-sm text-muted-foreground mt-1">Key environmental considerations for Michigan's data center expansion.</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-background border border-border p-4">
                  <Droplets className="h-5 w-5 text-michigan-teal mb-2" />
                  <h3 className="font-semibold text-sm text-foreground mb-1">Water Usage</h3>
                  <p className="text-xs text-muted-foreground">Stargate: closed-loop cooling (low water use). Project Cannoli: evaporative cooling — estimated 3.6M gallons/day from GLWA.</p>
                </div>
                <div className="rounded-lg bg-background border border-border p-4">
                  <Zap className="h-5 w-5 text-michigan-gold mb-2" />
                  <h3 className="font-semibold text-sm text-foreground mb-1">Grid Impact</h3>
                  <p className="text-xs text-muted-foreground">Michigan electricity demand could nearly double by 2050 (UCS). 57% of growth by 2030 from data centers alone.</p>
                </div>
                <div className="rounded-lg bg-background border border-border p-4">
                  <MapPin className="h-5 w-5 text-michigan-forest mb-2" />
                  <h3 className="font-semibold text-sm text-foreground mb-1">Land Use</h3>
                  <p className="text-xs text-muted-foreground">19+ moratoriums reflect local concerns about land use, noise, and infrastructure strain. Rezoning battles ongoing in multiple counties.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Related Links */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button variant="outline" asChild>
              <Link to="/environment">Environment & Energy <ExternalLink className="ml-2 h-3 w-3" /></Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/energy-burden">Energy Burden <ExternalLink className="ml-2 h-3 w-3" /></Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/civic-data">Civic Data Hub <ExternalLink className="ml-2 h-3 w-3" /></Link>
            </Button>
          </div>
        </motion.section>

        {/* Data Sources */}
        <section className="text-center">
          <p className="text-xs text-muted-foreground">
            Sources: MPSC Case U-21990, DTE IRP filings, Union of Concerned Scientists (UCS), Michigan Legislature (PA 207-208 of 2024), local township meeting minutes, published project announcements.
          </p>
        </section>
      </div>
    </Layout>
  );
};

export default DataCenterPage;
