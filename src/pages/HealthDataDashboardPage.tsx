import { useState, useMemo, lazy, Suspense } from "react";
import DataProvenance from "@/components/shared/DataProvenance";
import { motion } from "framer-motion";
import {
  BarChart3, TrendingUp, TrendingDown, Activity, Heart, Brain, Users,
  MapPin, Shield, Baby, Stethoscope, Download, Zap, Pill
} from "lucide-react";

// Lazy-load heavy dashboard sub-components
const ExternalEmbeds = lazy(() => import("@/components/dashboard/ExternalEmbeds"));
const DisparityGapChart = lazy(() => import("@/components/dashboard/DisparityGapChart"));
const CSVExportPanel = lazy(() => import("@/components/dashboard/CSVExportPanel"));
const CountyChoropleth = lazy(() => import("@/components/dashboard/CountyChoropleth"));
const EnergyBurdenMap = lazy(() => import("@/components/dashboard/EnergyBurdenMap"));
const DrugPriceLookup = lazy(() => import("@/components/learn/DrugPriceLookup"));
import TractHealthExplorer from "@/components/health/TractHealthExplorer";
import DrugRecallAlerts from "@/components/health/DrugRecallAlerts";
import FoodAccessMap from "@/components/health/FoodAccessMap";
import ChildcareEducationHub from "@/components/family/ChildcareEducationHub";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from "recharts";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

const COLORS = [
  "hsl(209, 86%, 31%)", "hsl(180, 100%, 32%)", "hsl(145, 32%, 30%)",
  "hsl(27, 87%, 67%)", "hsl(0, 100%, 71%)", "hsl(214, 74%, 59%)",
];

// Chronic disease prevalence
const chronicData = [
  { condition: "Heart Disease", michigan: 11.2, national: 10.6, trend: "stable" },
  { condition: "Diabetes", michigan: 11.8, national: 10.5, trend: "rising" },
  { condition: "Obesity", michigan: 36.2, national: 32.0, trend: "rising" },
  { condition: "Asthma", michigan: 10.1, national: 8.4, trend: "stable" },
  { condition: "Depression", michigan: 22.3, national: 20.1, trend: "rising" },
  { condition: "Hypertension", michigan: 34.5, national: 32.1, trend: "stable" },
];

// Healthcare access trends
const accessTrends = [
  { year: "2020", insured: 93.2, pcpRatio: 78, erVisits: 460, telehealth: 12 },
  { year: "2021", insured: 93.8, pcpRatio: 79, erVisits: 425, telehealth: 38 },
  { year: "2022", insured: 94.5, pcpRatio: 80, erVisits: 445, telehealth: 32 },
  { year: "2023", insured: 95.1, pcpRatio: 81, erVisits: 438, telehealth: 35 },
  { year: "2024", insured: 95.6, pcpRatio: 82, erVisits: 420, telehealth: 42 },
  { year: "2025", insured: 96.0, pcpRatio: 83, erVisits: 410, telehealth: 48 },
];

// Health equity indicators
const equityData = [
  { metric: "Life Expectancy", white: 78.1, black: 73.4, hispanic: 80.2, asian: 83.5 },
  { metric: "Infant Mortality (per 1k)", white: 4.8, black: 12.6, hispanic: 5.1, asian: 3.2 },
  { metric: "Uninsured Rate (%)", white: 4.2, black: 7.8, hispanic: 12.5, asian: 5.1 },
  { metric: "Diabetes Prevalence (%)", white: 10.1, black: 15.8, hispanic: 13.2, asian: 9.8 },
];

// County comparison data
const counties = [
  { name: "Washtenaw", lifeExpectancy: 81.2, insuredRate: 97.1, pcpPer100k: 128, obesityRate: 26.1, healthRank: 1 },
  { name: "Ottawa", lifeExpectancy: 80.8, insuredRate: 95.8, pcpPer100k: 68, obesityRate: 28.5, healthRank: 2 },
  { name: "Kent", lifeExpectancy: 79.5, insuredRate: 94.2, pcpPer100k: 95, obesityRate: 31.2, healthRank: 8 },
  { name: "Wayne", lifeExpectancy: 75.1, insuredRate: 92.8, pcpPer100k: 112, obesityRate: 38.5, healthRank: 72 },
  { name: "Genesee", lifeExpectancy: 74.8, insuredRate: 93.1, pcpPer100k: 85, obesityRate: 37.8, healthRank: 75 },
  { name: "Mackinac", lifeExpectancy: 76.2, insuredRate: 91.5, pcpPer100k: 42, obesityRate: 34.1, healthRank: 55 },
  { name: "Lake", lifeExpectancy: 73.5, insuredRate: 89.8, pcpPer100k: 18, obesityRate: 40.2, healthRank: 82 },
];

const leadingCauses = [
  { cause: "Heart Disease", deaths: 25800, pct: 24.1 },
  { cause: "Cancer", deaths: 21200, pct: 19.8 },
  { cause: "Accidents", deaths: 7100, pct: 6.6 },
  { cause: "Chronic Lower Respiratory", deaths: 5400, pct: 5.0 },
  { cause: "Stroke", deaths: 5200, pct: 4.9 },
  { cause: "Alzheimer's", deaths: 4100, pct: 3.8 },
  { cause: "Drug Overdose", deaths: 3100, pct: 2.9 },
];

export default function HealthDataDashboardPage() {
  const [countyA, setCountyA] = useState("Washtenaw");
  const [countyB, setCountyB] = useState("Wayne");

  const comparedCounties = useMemo(() =>
    counties.filter(c => c.name === countyA || c.name === countyB),
    [countyA, countyB]
  );

  return (
    <Layout>
      <section className="bg-gradient-to-b from-primary/5 to-background py-12 lg:py-20">
        <div className="container max-w-4xl text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              Health Data Dashboard
            </span>
          </motion.div>
          <motion.h1 variants={fadeUp} custom={1} initial="hidden" animate="visible" className="mb-3 text-3xl font-bold text-foreground lg:text-5xl">
            Michigan Health at a Glance
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} initial="hidden" animate="visible" className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Interactive dashboards showing health trends, access indicators, equity metrics, and county comparisons — powered by data from CDC, CMS, MDHHS, and County Health Rankings.
          </motion.p>
        </div>
      </section>

      <div className="container max-w-6xl py-10 space-y-10">
        {/* Key indicators */}
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            { label: "Insurance Rate", value: "96.0%", change: "+2.8% since 2020", icon: Shield, color: "text-michigan-forest", up: true },
            { label: "Life Expectancy", value: "77.4 yrs", change: "-0.3 from 2019", icon: Heart, color: "text-michigan-coral", up: false },
            { label: "PCP per 100k", value: "83", change: "+5 since 2020", icon: Stethoscope, color: "text-primary", up: true },
            { label: "Obesity Rate", value: "36.2%", change: "+2.1% since 2020", icon: Activity, color: "text-michigan-gold", up: false },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center gap-2 mb-2">
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className={`text-xs mt-1 flex items-center gap-1 ${stat.up ? "text-michigan-forest" : "text-michigan-coral"}`}>
                    {stat.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {stat.change}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="chronic">
          <div className="overflow-x-auto -mx-4 px-4 pb-1">
            <TabsList className="inline-flex w-max min-w-full sm:w-auto sm:min-w-0 gap-1">
              <TabsTrigger value="chronic" className="text-xs sm:text-sm whitespace-nowrap">Chronic Disease</TabsTrigger>
              <TabsTrigger value="access" className="text-xs sm:text-sm whitespace-nowrap">Healthcare Access</TabsTrigger>
              <TabsTrigger value="equity" className="text-xs sm:text-sm whitespace-nowrap">Health Equity</TabsTrigger>
              <TabsTrigger value="mortality" className="text-xs sm:text-sm whitespace-nowrap">Leading Causes</TabsTrigger>
              <TabsTrigger value="counties" className="text-xs sm:text-sm whitespace-nowrap">County Compare</TabsTrigger>
              <TabsTrigger value="heatmap" className="text-xs sm:text-sm whitespace-nowrap">County Heatmap</TabsTrigger>
              <TabsTrigger value="energy" className="text-xs sm:text-sm whitespace-nowrap">Energy Burden</TabsTrigger>
              <TabsTrigger value="disparities" className="text-xs sm:text-sm whitespace-nowrap">Disparity Gaps</TabsTrigger>
              <TabsTrigger value="research" className="text-xs sm:text-sm whitespace-nowrap">Research Tools</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="chronic" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4 text-michigan-coral" />
                  Chronic Disease Prevalence: Michigan vs. National Average
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={chronicData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="condition" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                    <Tooltip formatter={(v: number) => `${v}%`} />
                    <Legend />
                    <Bar dataKey="michigan" name="Michigan" fill="hsl(209, 86%, 31%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="national" name="National" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <div className="grid gap-3 sm:grid-cols-3">
              {chronicData.slice(0, 3).map((d, i) => (
                <Card key={d.condition}>
                  <CardContent className="py-3">
                    <p className="text-sm font-semibold text-foreground">{d.condition}</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-xl font-bold text-foreground">{d.michigan}%</span>
                      <span className="text-xs text-muted-foreground">MI</span>
                      <span className="text-xs text-muted-foreground">vs {d.national}% national</span>
                    </div>
                    <Badge variant="outline" className={`mt-1 text-[10px] ${d.trend === "rising" ? "text-michigan-coral" : "text-michigan-forest"}`}>
                      {d.trend === "rising" ? "↑ Rising" : "→ Stable"}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="access" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-michigan-forest" />
                  Healthcare Access Trends (2020–2025)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={accessTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="insured" name="Insured Rate (%)" stroke="hsl(209, 86%, 31%)" fill="hsl(209, 86%, 31%)" fillOpacity={0.1} />
                    <Area type="monotone" dataKey="telehealth" name="Telehealth Adoption (%)" stroke="hsl(180, 100%, 32%)" fill="hsl(180, 100%, 32%)" fillOpacity={0.1} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">ER Visit Rate & PCP Access Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={accessTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="erVisits" name="ER Visits per 100k" stroke="hsl(0, 100%, 71%)" strokeWidth={2} />
                    <Line type="monotone" dataKey="pcpRatio" name="PCP per 100k" stroke="hsl(145, 32%, 30%)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="equity" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-michigan-teal" />
                  Health Equity Indicators by Race/Ethnicity
                </CardTitle>
                <p className="text-xs text-muted-foreground">Disparities in health outcomes highlight systemic inequities requiring targeted intervention</p>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-sm min-w-[500px]">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left text-xs text-muted-foreground">Metric</th>
                      <th className="py-2 text-right text-xs text-muted-foreground">White</th>
                      <th className="py-2 text-right text-xs text-muted-foreground">Black</th>
                      <th className="py-2 text-right text-xs text-muted-foreground">Hispanic</th>
                      <th className="py-2 text-right text-xs text-muted-foreground">Asian</th>
                      <th className="py-2 text-right text-xs text-muted-foreground">Disparity Gap</th>
                    </tr>
                  </thead>
                  <tbody>
                    {equityData.map(row => {
                      const values = [row.white, row.black, row.hispanic, row.asian];
                      const max = Math.max(...values);
                      const min = Math.min(...values);
                      const isHighBad = row.metric.includes("Mortality") || row.metric.includes("Uninsured") || row.metric.includes("Diabetes");
                      return (
                        <tr key={row.metric} className="border-b border-border/50">
                          <td className="py-2 text-sm font-medium text-foreground">{row.metric}</td>
                          <td className="py-2 text-right text-sm text-foreground">{row.white}</td>
                          <td className={`py-2 text-right text-sm font-semibold ${isHighBad && row.black === max ? "text-michigan-coral" : "text-foreground"}`}>{row.black}</td>
                          <td className="py-2 text-right text-sm text-foreground">{row.hispanic}</td>
                          <td className="py-2 text-right text-sm text-foreground">{row.asian}</td>
                          <td className="py-2 text-right">
                            <Badge className="bg-michigan-coral/10 text-michigan-coral border-michigan-coral/20 text-[10px]">
                              {isHighBad ? `${(max / min).toFixed(1)}x` : `${(max - min).toFixed(1)} gap`}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
            <Card className="border-michigan-coral/20 bg-michigan-coral/5">
              <CardContent className="py-4">
                <p className="text-sm text-foreground font-medium mb-1">Key Finding: Infant Mortality Disparity</p>
                <p className="text-sm text-muted-foreground">
                  Black infants in Michigan die at 2.6x the rate of white infants — among the widest gaps nationally. 
                  Michigan's Maternal Health Equity Initiative allocates $120M toward doula coverage, extended postpartum Medicaid, and 25 new birthing centers.
                </p>
                <p className="text-xs text-muted-foreground mt-2">Source: CDC WONDER, Michigan DHHS Vital Records, 2024</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mortality" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Leading Causes of Death in Michigan (2024)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie data={leadingCauses} dataKey="pct" nameKey="cause" cx="50%" cy="50%" outerRadius={110} label={({ cause, pct }) => `${pct}%`}>
                          {leadingCauses.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(v: number) => `${v}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1">
                    <table className="w-full text-sm min-w-[320px]">
                      <thead>
                        <tr className="border-b">
                          <th className="py-1.5 text-left text-xs text-muted-foreground">Cause</th>
                          <th className="py-1.5 text-right text-xs text-muted-foreground">Deaths</th>
                          <th className="py-1.5 text-right text-xs text-muted-foreground">% of Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leadingCauses.map((c, i) => (
                          <tr key={c.cause} className="border-b border-border/50">
                            <td className="py-1.5 flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                              <span className="text-sm text-foreground">{c.cause}</span>
                            </td>
                            <td className="py-1.5 text-right text-sm text-foreground">{c.deaths.toLocaleString()}</td>
                            <td className="py-1.5 text-right text-sm font-semibold text-foreground">{c.pct}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="counties" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  County Health Comparison Tool
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end mb-6">
                  <div className="flex-1">
                    <label className="mb-1.5 block text-sm font-medium text-foreground">County A</label>
                    <Select value={countyA} onValueChange={setCountyA}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {counties.map(c => <SelectItem key={c.name} value={c.name}>{c.name} County</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <label className="mb-1.5 block text-sm font-medium text-foreground">County B</label>
                    <Select value={countyB} onValueChange={setCountyB}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {counties.map(c => <SelectItem key={c.name} value={c.name}>{c.name} County</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[500px]">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 text-left text-xs text-muted-foreground">Indicator</th>
                        {comparedCounties.map(c => (
                          <th key={c.name} className="py-2 text-right text-xs font-semibold text-foreground">{c.name} Co.</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { label: "Health Ranking (of 83)", fn: (c: typeof counties[0]) => `#${c.healthRank}` },
                        { label: "Life Expectancy", fn: (c: typeof counties[0]) => `${c.lifeExpectancy} yrs` },
                        { label: "Insured Rate", fn: (c: typeof counties[0]) => `${c.insuredRate}%` },
                        { label: "PCP per 100k", fn: (c: typeof counties[0]) => String(c.pcpPer100k) },
                        { label: "Adult Obesity Rate", fn: (c: typeof counties[0]) => `${c.obesityRate}%` },
                      ].map(row => (
                        <tr key={row.label} className="border-b border-border/50">
                          <td className="py-2 text-sm text-muted-foreground">{row.label}</td>
                          {comparedCounties.map(c => (
                            <td key={c.name} className="py-2 text-right text-sm font-medium text-foreground">{row.fn(c)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-4">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={[
                    { metric: "Life Exp.", ...Object.fromEntries(comparedCounties.map(c => [c.name, c.lifeExpectancy])) },
                    { metric: "Insured %", ...Object.fromEntries(comparedCounties.map(c => [c.name, c.insuredRate])) },
                    { metric: "PCP/100k", ...Object.fromEntries(comparedCounties.map(c => [c.name, c.pcpPer100k])) },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="metric" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    {comparedCounties.map((c, i) => (
                      <Bar key={c.name} dataKey={c.name} fill={COLORS[i]} radius={[4, 4, 0, 0]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="heatmap" className="mt-6 space-y-6">
            <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}>
              <CountyChoropleth />
            </Suspense>
          </TabsContent>

          <TabsContent value="energy" className="mt-6 space-y-6">
            <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}>
              <EnergyBurdenMap />
            </Suspense>
            {/* EIA SEDS Time-Series */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="h-4 w-4 text-michigan-gold" />
                  Michigan Residential Electricity Price vs. U.S. Average
                </CardTitle>
                <p className="text-xs text-muted-foreground">Cents per kWh, 1990–2023. As of 2023, Source: EIA State Energy Data System (SEDS), last updated Oct 2024.</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={[
                    { year: "1990", michigan: 7.5, us: 7.8 },
                    { year: "1995", michigan: 8.1, us: 8.4 },
                    { year: "2000", michigan: 8.4, us: 8.2 },
                    { year: "2005", michigan: 9.3, us: 9.5 },
                    { year: "2010", michigan: 12.4, us: 11.5 },
                    { year: "2015", michigan: 14.8, us: 12.7 },
                    { year: "2018", michigan: 16.1, us: 12.9 },
                    { year: "2020", michigan: 16.8, us: 13.0 },
                    { year: "2022", michigan: 18.3, us: 15.1 },
                    { year: "2023", michigan: 19.1, us: 15.8 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v}¢`} />
                    <Tooltip formatter={(v: number) => `${v}¢/kWh`} />
                    <Legend />
                    <Line type="monotone" dataKey="michigan" name="Michigan" stroke="hsl(209, 86%, 31%)" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="us" name="U.S. Average" stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Per-Capita Residential Energy Consumption</CardTitle>
                <p className="text-xs text-muted-foreground">Million BTU per person, 2000–2023. Source: EIA SEDS, last updated Oct 2024.</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={[
                    { year: "2000", michigan: 72, us: 68 },
                    { year: "2005", michigan: 70, us: 66 },
                    { year: "2010", michigan: 67, us: 63 },
                    { year: "2015", michigan: 64, us: 60 },
                    { year: "2018", michigan: 62, us: 58 },
                    { year: "2020", michigan: 63, us: 59 },
                    { year: "2022", michigan: 61, us: 57 },
                    { year: "2023", michigan: 60, us: 56 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => `${v} MMBTU/person`} />
                    <Legend />
                    <Area type="monotone" dataKey="michigan" name="Michigan" stroke="hsl(180, 100%, 32%)" fill="hsl(180, 100%, 32%)" fillOpacity={0.15} />
                    <Area type="monotone" dataKey="us" name="U.S. Average" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted-foreground))" fillOpacity={0.08} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="disparities" className="mt-6 space-y-6">
            <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}>
              <DisparityGapChart />
              <EnergyBurdenMap />
              <CSVExportPanel />
            </Suspense>
          </TabsContent>

          <TabsContent value="research" className="mt-6 space-y-6">
            <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}>
              <DrugPriceLookup />
              <ExternalEmbeds />
              <CSVExportPanel />
            </Suspense>
          </TabsContent>
        </Tabs>

        {/* Neighborhood-Level Health Data */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="mt-8">
          <TractHealthExplorer />
        </motion.section>

        {/* Food Access */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="mt-8">
          <FoodAccessMap />
        </motion.section>

        {/* Childcare & Education */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="mt-8">
          <ChildcareEducationHub />
        </motion.section>

        {/* Drug Safety Alerts */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="mt-8">
          <DrugRecallAlerts />
        </motion.section>

        {/* Opioid & Substance Use Data */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Pill className="h-5 w-5 text-michigan-coral" />
                Opioid & Substance Use Surveillance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Michigan tracks fatal and non-fatal overdoses, ED visits, and treatment admissions through multiple surveillance systems.
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                <Card className="border-michigan-coral/20">
                  <CardContent className="p-4 text-center">
                    <h4 className="font-semibold text-sm text-foreground mb-1">MODA Dashboard</h4>
                    <p className="text-xs text-muted-foreground mb-3">Fatal/non-fatal overdoses by county and ZIP code</p>
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <a href="https://www.michigan.gov/opioids/category-data" target="_blank" rel="noopener noreferrer">
                        View Dashboard <Activity className="ml-1 h-3 w-3" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
                <Card className="border-michigan-coral/20">
                  <CardContent className="p-4 text-center">
                    <h4 className="font-semibold text-sm text-foreground mb-1">MI-SUDDR</h4>
                    <p className="text-xs text-muted-foreground mb-3">ED visits, hospitalizations, and treatment admissions by county</p>
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <a href="https://mi-suddr.com/data/" target="_blank" rel="noopener noreferrer">
                        Explore Data <Activity className="ml-1 h-3 w-3" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
                <Card className="border-michigan-coral/20">
                  <CardContent className="p-4 text-center">
                    <h4 className="font-semibold text-sm text-foreground mb-1">Wastewater Surveillance</h4>
                    <p className="text-xs text-muted-foreground mb-3">Community-level substance and pathogen detection</p>
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <a href="https://www.michigan.gov/coronavirus/stats/wastewater-surveillance/dashboard" target="_blank" rel="noopener noreferrer">
                        View Dashboard <Activity className="ml-1 h-3 w-3" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        <DataProvenance
          source="CDC WONDER, BRFSS, CMS Hospital Compare, MDHHS, HRSA, EIA SEDS, DTE, MODA, MI-SUDDR"
          updated="2023–2025 reporting periods"
        />
      </div>
    </Layout>
  );
}
