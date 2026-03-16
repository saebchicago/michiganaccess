import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area,
} from "recharts";
import { TrendingUp, DollarSign, Users, BarChart3, Info, ArrowRight, Building2, Briefcase, Target } from "lucide-react";
import { Link } from "react-router-dom";

// ── Animation variant ──────────────────────────────────────────────────────
const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

// ── Helpers ────────────────────────────────────────────────────────────────

function formatRevenueK(valueK: number): string {
  return valueK >= 1000 ? `$${(valueK / 1000).toFixed(1)}M` : `$${valueK}K`;
}

function formatCountK(value: number): string {
  return value >= 1000 ? `${(value / 1000).toFixed(1)}K` : String(value);
}

// ── Static data ────────────────────────────────────────────────────────────

const valueDrivers = [
  {
    icon: Users,
    title: "SDOH Navigation Yield",
    value: "$420",
    unit: "per connection",
    description: "Average IRS Schedule H community benefit value attributed per completed SDOH referral.",
    source: "IRS Schedule H benchmarks",
  },
  {
    icon: Building2,
    title: "ED Diversion Value",
    value: "$3,200",
    unit: "per visit avoided",
    description: "Average cost of an emergency department visit diverted to appropriate community care.",
    source: "AHRQ HCUP StatBrief #268",
  },
  {
    icon: DollarSign,
    title: "PCP Shortage Penalty",
    value: "$1.1B",
    unit: "Michigan annual burden",
    description: "Estimated annual cost impact of primary care shortage-driven preventable utilization across Michigan.",
    source: "HRSA HPSA analysis",
  },
  {
    icon: Target,
    title: "Addressable Market",
    value: "10M+",
    unit: "Michigan residents",
    description: "Total addressable population for health navigation services across all 83 Michigan counties.",
    source: "U.S. Census ACS",
  },
];

const tierData = [
  { tier: "Community", counties: 1, fee: 0, features: ["County dashboard", "Resource directory", "Basic analytics"] },
  { tier: "Regional", counties: 7, fee: 24000, features: ["Multi-county analytics", "SVI gap reports", "CHNA data export", "API access"] },
  { tier: "System", counties: 20, fee: 72000, features: ["Full 83-county coverage", "Custom dashboards", "SDOH referral tracking", "Quarterly reviews", "White-label embed"] },
  { tier: "Enterprise", counties: 83, fee: 180000, features: ["All System features", "Dedicated support", "Custom integrations", "Co-branding", "Strategic advisory"] },
];

const fiveYearProjection = [
  { year: "Y1", revenue: 120, partners: 3, sdohConnections: 4200, edDiversions: 840 },
  { year: "Y2", revenue: 380, partners: 9, sdohConnections: 13800, edDiversions: 2760 },
  { year: "Y3", revenue: 820, partners: 18, sdohConnections: 31200, edDiversions: 6240 },
  { year: "Y4", revenue: 1450, partners: 30, sdohConnections: 57600, edDiversions: 11520 },
  { year: "Y5", revenue: 2200, partners: 44, sdohConnections: 90000, edDiversions: 18000 },
];

const marketShareData = [
  { segment: "Health Systems", tam: 890, addressable: 320, target: 72 },
  { segment: "Health Plans", tam: 640, addressable: 210, target: 48 },
  { segment: "Payers/MCOs", tam: 420, addressable: 140, target: 28 },
  { segment: "Gov. Agencies", tam: 310, addressable: 90, target: 18 },
  { segment: "Nonprofits", tam: 180, addressable: 60, target: 24 },
];

const PARTNER_TYPES = ["Health System", "Health Plan", "MCO/Payer", "Government Agency", "Nonprofit / FQHC"] as const;

// ── ROI Calculator ─────────────────────────────────────────────────────────

function ROICalculator() {
  const [partnerType, setPartnerType] = useState<string>("Health System");
  const [coveredLives, setCoveredLives] = useState([150000]);
  const [sdohRate, setSdohRate] = useState([12]);
  const [edRate, setEdRate] = useState([18]);

  const results = useMemo(() => {
    const lives = coveredLives[0];
    const sdohPct = sdohRate[0] / 100;
    const edPct = edRate[0] / 100;

    const sdohConnections = Math.round(lives * sdohPct * 0.42);
    const communityBenefitValue = sdohConnections * 420;
    const edDiversions = Math.round(lives * edPct * 0.35 * 0.08);
    const edSavings = edDiversions * 3200;
    const totalValue = communityBenefitValue + edSavings;
    const estimatedFee = lives < 50000 ? 0 : lives < 250000 ? 24000 : lives < 600000 ? 72000 : 180000;
    const roi = estimatedFee > 0 ? ((totalValue - estimatedFee) / estimatedFee) * 100 : 0;

    return { sdohConnections, communityBenefitValue, edDiversions, edSavings, totalValue, estimatedFee, roi };
  }, [coveredLives, sdohRate, edRate]);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border-2 border-michigan-gold/30 bg-michigan-gold/5 p-4 flex items-start gap-3">
        <Info className="h-4 w-4 mt-0.5 shrink-0 text-michigan-gold" />
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Exploratory Model:</strong> All outputs are modeled projections based on published benchmarks. Actual results depend on implementation, local conditions, and system-specific factors. Not a guarantee of outcomes.
        </p>
      </div>

      <Card>
        <CardContent className="py-6 space-y-6">
          <div className="grid sm:grid-cols-3 gap-6">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                Partner Type
              </label>
              <Select value={partnerType} onValueChange={setPartnerType}>
                <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PARTNER_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                Covered Lives / Patients: {coveredLives[0].toLocaleString()}
              </label>
              <Slider
                value={coveredLives}
                onValueChange={setCoveredLives}
                min={10000}
                max={1000000}
                step={10000}
                className="mt-3"
              />
              <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                <span>10K</span><span>1M</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                SDOH-Positive Rate: {sdohRate[0]}%
              </label>
              <Slider
                value={sdohRate}
                onValueChange={setSdohRate}
                min={5}
                max={40}
                step={1}
                className="mt-3"
              />
              <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                <span>5%</span><span>40%</span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
              Low-Acuity ED Visit Rate: {edRate[0]}%
            </label>
            <Slider
              value={edRate}
              onValueChange={setEdRate}
              min={5}
              max={35}
              step={1}
              className="mt-3 max-w-sm"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-border">
            {[
              { label: "SDOH Connections", value: results.sdohConnections.toLocaleString(), sub: "/year (modeled)", highlight: false },
              { label: "Community Benefit Value", value: `$${(results.communityBenefitValue / 1000).toFixed(0)}K`, sub: "Schedule H eligible", highlight: false },
              { label: "ED Diversions", value: results.edDiversions.toLocaleString(), sub: "/year (modeled)", highlight: false },
              { label: "Total Modeled Value", value: `$${(results.totalValue / 1000).toFixed(0)}K`, sub: "/year", highlight: true },
            ].map((r) => (
              <div key={r.label} className={`rounded-lg p-3 text-center ${r.highlight ? "bg-primary/10" : "bg-muted/40"}`}>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{r.label}</p>
                <p className={`text-xl font-bold mt-1 ${r.highlight ? "text-primary" : "text-foreground"}`}>{r.value}</p>
                <p className="text-[10px] text-muted-foreground">{r.sub}</p>
              </div>
            ))}
          </div>

          {results.estimatedFee > 0 && (
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-4 flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-400">Estimated Platform Fee</p>
                <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">${results.estimatedFee.toLocaleString()}<span className="text-xs font-normal ml-1">/year</span></p>
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-400">Projected ROI</p>
                <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{results.roi.toFixed(0)}%</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-400">Net Modeled Value</p>
                <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">${((results.totalValue - results.estimatedFee) / 1000).toFixed(0)}K<span className="text-xs font-normal ml-1">/year</span></p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="rounded-md bg-muted/30 p-3">
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          <strong>Assumptions:</strong> 42% SDOH referral completion rate; $420 avg. community benefit value per connection (IRS Schedule H); 35% diversion rate for low-acuity ED visits (Weinick et al., Health Affairs); 8% of low-acuity visits attributable to navigation gap; $3,200 avg. ED visit cost (AHRQ HCUP #268). All figures are illustrative projections.
        </p>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function BDFinancialModelPage() {
  usePageMeta({
    title: "BD Financial Model — Access Michigan",
    description: "Business development financial model for Access Michigan: value drivers, ROI calculator, and 5-year growth projections for health system and health plan partners.",
    path: "/bd-financial-model",
  });

  return (
    <Layout>
      <Breadcrumbs items={[{ label: "Partners", href: "/partners" }, { label: "BD Financial Model" }]} />

      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-12">
        <div className="container max-w-5xl">
          <motion.div initial="hidden" animate="visible" variants={fade} custom={0}>
            <Badge variant="outline" className="mb-3 uppercase tracking-wider text-xs border-primary/30 text-primary">
              Internal · Business Development
            </Badge>
            <h1 className="text-3xl font-extrabold text-foreground lg:text-4xl mb-2">
              BD Financial Model
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Value framework, ROI calculator, and 5-year revenue projections for Access Michigan partner and licensing discussions.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container max-w-5xl py-8">
        <Tabs defaultValue="value-model" className="space-y-6">
          <TabsList className="inline-flex w-max min-w-full sm:w-auto sm:min-w-0 gap-1">
            <TabsTrigger value="value-model" className="gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" /> Value Model
            </TabsTrigger>
            <TabsTrigger value="roi-calculator" className="gap-1.5">
              <DollarSign className="h-3.5 w-3.5" /> ROI Calculator
            </TabsTrigger>
            <TabsTrigger value="projections" className="gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" /> 5-Year Projections
            </TabsTrigger>
          </TabsList>

          {/* ── Tab 1: Value Model ───────────────────────────────────────── */}
          <TabsContent value="value-model" className="mt-6 space-y-8">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={0}>
              <h2 className="text-xl font-bold text-foreground mb-4">Core Value Drivers</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {valueDrivers.map((d, i) => (
                  <motion.div key={d.title} variants={fade} custom={i}>
                    <Card className="h-full">
                      <CardContent className="pt-5 space-y-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                          <d.icon className="h-4 w-4 text-primary" />
                        </div>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{d.title}</p>
                        <div>
                          <span className="text-2xl font-black text-primary">{d.value}</span>
                          <span className="text-xs text-muted-foreground ml-1">{d.unit}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{d.description}</p>
                        <p className="text-[9px] italic text-muted-foreground/70">Source: {d.source}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={0}>
              <h2 className="text-xl font-bold text-foreground mb-4">Pricing Tiers</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {tierData.map((tier, i) => (
                  <motion.div key={tier.tier} variants={fade} custom={i}>
                    <Card className={`h-full ${tier.tier === "System" ? "border-primary/40 ring-1 ring-primary/20" : ""}`}>
                      <CardContent className="pt-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant={tier.tier === "System" ? "default" : "outline"} className="text-xs">
                            {tier.tier}
                          </Badge>
                          {tier.tier === "System" && (
                            <Badge className="text-[9px] bg-michigan-gold/20 text-michigan-gold border-0">Popular</Badge>
                          )}
                        </div>
                        <div>
                          {tier.fee === 0
                            ? <p className="text-2xl font-black text-primary">Free</p>
                            : <><span className="text-2xl font-black text-primary">${(tier.fee / 1000).toFixed(0)}K</span><span className="text-xs text-muted-foreground ml-1">/year</span></>
                          }
                          <p className="text-[10px] text-muted-foreground mt-0.5">Up to {tier.counties === 83 ? "all 83" : tier.counties} {tier.counties === 1 ? "county" : "counties"}</p>
                        </div>
                        <ul className="space-y-1.5">
                          {tier.features.map((f) => (
                            <li key={f} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                              <ArrowRight className="h-3 w-3 mt-0.5 shrink-0 text-primary" />{f}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={0}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-primary" />
                    Total Addressable Market by Segment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={marketShareData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="segment" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}K`} />
                      <Tooltip formatter={(v: number) => `$${v}K`} />
                      <Legend />
                      <Bar dataKey="tam" name="TAM ($K)" fill="hsl(209, 86%, 31%)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="addressable" name="Addressable ($K)" fill="hsl(180, 100%, 32%)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="target" name="Y3 Target ($K)" fill="hsl(45, 93%, 47%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/for-health-systems" className="gap-2">
                  For Health Systems <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/market-intelligence" className="gap-2">
                  Market Intelligence <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </TabsContent>

          {/* ── Tab 2: ROI Calculator ────────────────────────────────────── */}
          <TabsContent value="roi-calculator" className="mt-6">
            <ROICalculator />
          </TabsContent>

          {/* ── Tab 3: 5-Year Projections ────────────────────────────────── */}
          <TabsContent value="projections" className="mt-6 space-y-6">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={0}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    5-Year Revenue Projection ($K)
                    <Badge variant="outline" className="text-[9px] uppercase tracking-wider ml-1">Modeled</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={fiveYearProjection} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}K`} />
                      <Tooltip formatter={(v: number) => `$${v}K`} />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        name="Annual Revenue ($K)"
                        stroke="hsl(209, 86%, 31%)"
                        fill="hsl(209, 86%, 31%)"
                        fillOpacity={0.15}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={1}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-4 w-4 text-michigan-teal" />
                    Platform Impact Growth
                    <Badge variant="outline" className="text-[9px] uppercase tracking-wider ml-1">Modeled</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={fiveYearProjection} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="sdohConnections"
                        name="SDOH Connections"
                        stroke="hsl(180, 100%, 32%)"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="edDiversions"
                        name="ED Diversions"
                        stroke="hsl(45, 93%, 47%)"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="partners"
                        name="Partner Orgs"
                        stroke="hsl(209, 86%, 31%)"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={2}>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {fiveYearProjection.map((y) => (
                  <Card key={y.year}>
                    <CardContent className="py-4 text-center">
                      <Badge variant="outline" className="mb-2 text-xs">{y.year}</Badge>
                      <p className="text-xl font-black text-primary">{formatRevenueK(y.revenue)}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{y.partners} partners</p>
                      <p className="text-[10px] text-muted-foreground">{formatCountK(y.sdohConnections)} SDOH</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>

            <div className="rounded-lg border border-border bg-muted/50 p-4 flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                <strong>Model assumptions:</strong> Revenue projections assume progressive partner tier adoption. Impact metrics scale with partner coverage and 42% SDOH referral completion rate. All projections are illustrative and subject to market conditions, adoption rates, and platform development milestones. See <Link to="/methodology" className="text-primary hover:underline">Methodology</Link> for data sources.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
