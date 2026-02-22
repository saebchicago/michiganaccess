import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Activity, TrendingUp, TrendingDown, Heart, Shield, Brain, ArrowRight, BarChart3 } from "lucide-react";
import { lazy, Suspense, useMemo } from "react";
import CountySelector from "@/components/shared/CountySelector";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from "recharts";
import { useCounty } from "@/contexts/CountyContext";
import { getCountyProfile } from "@/data/michigan-county-profiles";

// Heavy map components — lazy loaded
const CountyChoropleth = lazy(() => import("@/components/dashboard/CountyChoropleth"));
const EnergyBurdenMap = lazy(() => import("@/components/dashboard/EnergyBurdenMap"));
import DataActionBanners from "@/components/home/DataActionBanners";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.35 } }),
};

const chronicData = [
  { name: "Heart Disease", mi: 11.2, us: 10.6 },
  { name: "Diabetes", mi: 11.8, us: 10.5 },
  { name: "Obesity", mi: 36.2, us: 32.0 },
  { name: "Depression", mi: 22.3, us: 20.1 },
  { name: "Hypertension", mi: 34.5, us: 32.1 },
];

const accessTrends = [
  { yr: "'20", insured: 93.2, telehealth: 12 },
  { yr: "'21", insured: 93.8, telehealth: 38 },
  { yr: "'22", insured: 94.5, telehealth: 32 },
  { yr: "'23", insured: 95.1, telehealth: 35 },
  { yr: "'24", insured: 95.6, telehealth: 42 },
  { yr: "'25", insured: 96.0, telehealth: 48 },
];

// Michigan statewide averages for delta comparison
const MI_AVERAGES = {
  insuranceRate: 96.0,
  lifeExpectancy: 77.4,
  mentalHealthAccess: 48,
  erVisitRate: 410,
};

const CHART_COLORS = {
  mi: "hsl(190, 100%, 50%)",
  us: "hsl(220, 20%, 55%)",
  insured: "hsl(150, 100%, 50%)",
  telehealth: "hsl(190, 100%, 50%)",
};

// County-level KPI data derived from County Health Rankings dataset
const COUNTY_KPIS: Record<string, { insuranceRate: number; lifeExpectancy: number; mentalHealthAccess: number; erVisitRate: number }> = {
  Wayne: { insuranceRate: 92.8, lifeExpectancy: 74.8, mentalHealthAccess: 42, erVisitRate: 520 },
  Oakland: { insuranceRate: 95.2, lifeExpectancy: 79.6, mentalHealthAccess: 55, erVisitRate: 340 },
  Macomb: { insuranceRate: 94.4, lifeExpectancy: 77.2, mentalHealthAccess: 46, erVisitRate: 390 },
  Kent: { insuranceRate: 93.2, lifeExpectancy: 78.5, mentalHealthAccess: 51, erVisitRate: 370 },
  Genesee: { insuranceRate: 92.1, lifeExpectancy: 74.2, mentalHealthAccess: 39, erVisitRate: 540 },
  Washtenaw: { insuranceRate: 96.1, lifeExpectancy: 81.2, mentalHealthAccess: 62, erVisitRate: 290 },
  Ingham: { insuranceRate: 93.5, lifeExpectancy: 77.8, mentalHealthAccess: 53, erVisitRate: 380 },
  Kalamazoo: { insuranceRate: 93.9, lifeExpectancy: 78.1, mentalHealthAccess: 52, erVisitRate: 360 },
  Saginaw: { insuranceRate: 92.6, lifeExpectancy: 75.5, mentalHealthAccess: 40, erVisitRate: 490 },
  Ottawa: { insuranceRate: 94.9, lifeExpectancy: 80.3, mentalHealthAccess: 50, erVisitRate: 310 },
  "Grand Traverse": { insuranceRate: 91.8, lifeExpectancy: 79.1, mentalHealthAccess: 54, erVisitRate: 350 },
  Marquette: { insuranceRate: 93.6, lifeExpectancy: 78.9, mentalHealthAccess: 48, erVisitRate: 360 },
  Berrien: { insuranceRate: 92.7, lifeExpectancy: 76.0, mentalHealthAccess: 41, erVisitRate: 450 },
  Livingston: { insuranceRate: 95.8, lifeExpectancy: 80.1, mentalHealthAccess: 52, erVisitRate: 320 },
};

function getDelta(countyVal: number, stateVal: number, higherIsBetter: boolean) {
  const diff = countyVal - stateVal;
  const formatted = diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1);
  const isBetter = higherIsBetter ? diff >= 0 : diff <= 0;
  return { formatted, isBetter };
}

export default function HealthDataSnapshot() {
  const { county } = useCounty();

  const kpis = useMemo(() => {
    const countyData = county ? COUNTY_KPIS[county] : null;

    return [
      {
        icon: Shield,
        label: "Insurance Rate",
        value: countyData ? `${countyData.insuranceRate}%` : "96.0%",
        delta: countyData ? getDelta(countyData.insuranceRate, MI_AVERAGES.insuranceRate, true) : null,
        stateDelta: "+2.8%",
        up: true,
        hasData: !county || !!countyData,
      },
      {
        icon: Heart,
        label: "Life Expectancy",
        value: countyData ? `${countyData.lifeExpectancy} yrs` : "77.4 yrs",
        delta: countyData ? getDelta(countyData.lifeExpectancy, MI_AVERAGES.lifeExpectancy, true) : null,
        stateDelta: "−0.3",
        up: false,
        hasData: !county || !!countyData,
      },
      {
        icon: Brain,
        label: "Mental Health Access",
        value: countyData ? `${countyData.mentalHealthAccess}%` : "48%",
        delta: countyData ? getDelta(countyData.mentalHealthAccess, MI_AVERAGES.mentalHealthAccess, true) : null,
        stateDelta: "+36% telehealth",
        up: true,
        hasData: !county || !!countyData,
      },
      {
        icon: Activity,
        label: "ER Visit Rate",
        value: countyData ? `${countyData.erVisitRate}/100k` : "410/100k",
        delta: countyData ? getDelta(countyData.erVisitRate, MI_AVERAGES.erVisitRate, false) : null,
        stateDelta: "−11% since 2020",
        up: true,
        hasData: !county || !!countyData,
      },
    ];
  }, [county]);

  const sectionTitle = county ? `${county} County Health at a Glance` : "Michigan Health at a Glance";

  return (
    <section id="data-snapshot" className="py-14 bg-slate-900 text-white" aria-labelledby="health-data-title">
      <div className="container max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <Badge variant="outline" className="mb-3 text-xs uppercase tracking-wider border-cyan-400/40 text-cyan-300">
            <BarChart3 className="mr-1.5 h-3 w-3" />
            Health Data Snapshot
          </Badge>
          <h2 id="health-data-title" className="text-2xl font-bold text-white lg:text-3xl mb-2">
            {sectionTitle}
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            Key health indicators powered by CDC, CMS, and County Health Rankings data.
          </p>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 mb-8">
          {kpis.map((kpi, i) => (
            <motion.div key={kpi.label} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
              <Card className="h-full bg-slate-800/60 border-slate-700/50">
                <CardContent className="py-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <kpi.icon className="h-4 w-4 text-cyan-400" />
                    <span className="text-[11px] text-slate-400 font-medium">{kpi.label}</span>
                  </div>
                  {kpi.hasData ? (
                    <>
                      <p className="text-xl font-bold text-white">{kpi.value}</p>
                      {county && kpi.delta ? (
                        <div className="flex items-center gap-1.5 mt-1">
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-1.5 py-0 border ${
                              kpi.delta.isBetter
                                ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                                : "border-rose-500/40 text-rose-400 bg-rose-500/10"
                            }`}
                          >
                            {kpi.delta.isBetter ? <TrendingUp className="h-2.5 w-2.5 mr-0.5" /> : <TrendingDown className="h-2.5 w-2.5 mr-0.5" />}
                            {kpi.delta.formatted} vs. MI avg
                          </Badge>
                        </div>
                      ) : (
                        <p className={`text-[11px] mt-0.5 flex items-center gap-1 ${kpi.up ? "text-emerald-400" : "text-rose-400"}`}>
                          {kpi.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {kpi.stateDelta}
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-xl font-bold text-slate-500">—</p>
                      <Badge variant="outline" className="text-[10px] border-slate-600 text-slate-500 mt-1">
                        Data pending
                      </Badge>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Data-to-Action Banners */}
        <DataActionBanners />

        {/* Charts — hidden on mobile */}
        <div className="hidden md:grid gap-6 lg:grid-cols-2 mb-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <Card className="bg-slate-800/60 border-slate-700/50">
              <CardContent className="pt-5 pb-3">
                <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-rose-400" />
                  Chronic Disease: Michigan vs. National
                </h3>
                <p className="text-[11px] text-slate-400 mb-3">Prevalence rates (%) — Source: CDC BRFSS</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chronicData} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={45} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} />
                    <Tooltip
                      formatter={(v: number, name: string) => [`${v}%`, name === "mi" ? "Michigan" : "National"]}
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))" }}
                    />
                    <Bar dataKey="mi" name="Michigan" fill={CHART_COLORS.mi} radius={[3, 3, 0, 0]} />
                    <Bar dataKey="us" name="National" fill={CHART_COLORS.us} radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex gap-4 mt-2 justify-center">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full" style={{ background: CHART_COLORS.mi }} /> Michigan
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full" style={{ background: CHART_COLORS.us }} /> National
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}>
            <Card className="bg-slate-800/60 border-slate-700/50">
              <CardContent className="pt-5 pb-3">
                <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  Healthcare Access Trends (2020–2025)
                </h3>
                <p className="text-[11px] text-slate-400 mb-3">Insurance coverage & telehealth adoption — Source: CMS, MDHHS</p>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={accessTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="yr" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      formatter={(v: number, name: string) => [`${v}%`, name === "insured" ? "Insured" : "Telehealth"]}
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))" }}
                    />
                    <Area type="monotone" dataKey="insured" name="Insured Rate (%)" stroke={CHART_COLORS.insured} fill={CHART_COLORS.insured} fillOpacity={0.15} strokeWidth={2} />
                    <Area type="monotone" dataKey="telehealth" name="Telehealth (%)" stroke={CHART_COLORS.telehealth} fill={CHART_COLORS.telehealth} fillOpacity={0.1} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="flex gap-4 mt-2 justify-center">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full" style={{ background: CHART_COLORS.insured }} /> Insured Rate
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full" style={{ background: CHART_COLORS.telehealth }} /> Telehealth
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Mobile: county dropdown instead of charts */}
        <div className="md:hidden mb-8">
          <Card className="bg-slate-800/60 border-slate-700/50">
            <CardContent className="py-5">
              <h3 className="text-sm font-semibold text-white mb-3">Locate Resources by County</h3>
              <CountySelector variant="compact" />
            </CardContent>
          </Card>
        </div>

        {/* County Choropleth Heatmap — hidden on mobile */}
        <div className="hidden md:block">
          <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}>
              <CountyChoropleth compact />
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2.5}>
              <EnergyBurdenMap compact />
            </motion.div>
          </Suspense>
        </div>

        {/* Disparity Spotlight + CTA */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={3}>
          <Card className="border-rose-500/20 bg-rose-950/30 mt-6">
            <CardContent className="py-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white mb-1">
                    Key Disparity: Infant Mortality
                  </p>
                  <p className="text-xs text-slate-300">
                    Black infants in Michigan face 2.6× the mortality rate of white infants — among the widest gaps nationally.
                    Michigan's Maternal Health Equity Initiative allocates $120M toward doula coverage and extended postpartum Medicaid.
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">Source: CDC WONDER, Michigan DHHS Vital Records, 2024</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button asChild size="sm" variant="default" className="gap-1.5">
                    <Link to="/data">
                      Full Dashboard <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="gap-1.5">
                    <Link to="/equity">
                      Equity Framework
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
