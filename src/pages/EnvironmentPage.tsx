import { useState, useEffect } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Leaf, Droplets, Wind, Recycle, Zap, Globe, Fish, AlertTriangle, TrendingUp, MapPin, ExternalLink, Shield, Loader2, Footprints, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend } from "recharts";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import TransportationCallout from "@/components/shared/TransportationCallout";
import HealthSafetyCallout from "@/components/shared/HealthSafetyCallout";
import CivicDataCallout from "@/components/shared/CivicDataCallout";
import { useCDCData, transformPlacesToAQI } from "@/hooks/useCDCData";
import EnergyAssistanceFinder from "@/components/energy/EnergyAssistanceFinder";
import AirQualityChecker from "@/components/environment/AirQualityChecker";
import EnergyPriceTracker from "@/components/environment/EnergyPriceTracker";
import WaterMonitorWidget from "@/components/environment/WaterMonitorWidget";
import EnergyHealthScatter from "@/components/environment/EnergyHealthScatter";
import WeatherAlerts from "@/components/environment/WeatherAlerts";
import MichiganForecast from "@/components/environment/MichiganForecast";
import AskCopilotButton from "@/components/shared/AskCopilotButton";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

// Fallback data used when CDC API is unavailable
const fallbackAQI = [
  { city: "Detroit", aqi: 62, status: "Moderate", color: "hsl(27, 87%, 67%)", measure: "Current asthma prevalence" },
  { city: "Grand Rapids", aqi: 38, status: "Good", color: "hsl(145, 32%, 30%)", measure: "Current asthma prevalence" },
  { city: "Lansing", aqi: 42, status: "Good", color: "hsl(145, 32%, 30%)", measure: "Current asthma prevalence" },
  { city: "Flint", aqi: 55, status: "Moderate", color: "hsl(27, 87%, 67%)", measure: "Current asthma prevalence" },
  { city: "Ann Arbor", aqi: 35, status: "Good", color: "hsl(145, 32%, 30%)", measure: "Current asthma prevalence" },
  { city: "Traverse City", aqi: 22, status: "Good", color: "hsl(145, 32%, 30%)", measure: "Current asthma prevalence" },
];

const waterQualityTrend = [
  { year: "2019", violations: 142, resolved: 98 },
  { year: "2020", violations: 128, resolved: 110 },
  { year: "2021", violations: 115, resolved: 105 },
  { year: "2022", violations: 98, resolved: 92 },
  { year: "2023", violations: 82, resolved: 78 },
  { year: "2024", violations: 71, resolved: 69 },
];

const renewableGrowth = [
  { year: "2018", solar: 2.1, wind: 5.8, hydro: 1.9 },
  { year: "2019", solar: 3.2, wind: 6.4, hydro: 1.9 },
  { year: "2020", solar: 4.8, wind: 7.1, hydro: 2.0 },
  { year: "2021", solar: 6.5, wind: 8.3, hydro: 2.0 },
  { year: "2022", solar: 8.9, wind: 9.7, hydro: 2.1 },
  { year: "2023", solar: 12.1, wind: 11.2, hydro: 2.1 },
  { year: "2024", solar: 15.8, wind: 12.9, hydro: 2.2 },
];

// EIA SEDS — Michigan vs National residential electricity price & consumption (1990–2023)
const eiaSEDS = [
  { year: "1990", miPrice: 7.4, natPrice: 7.8, miConsumption: 30.2, natConsumption: 29.5 },
  { year: "1995", miPrice: 8.1, natPrice: 8.4, miConsumption: 31.8, natConsumption: 31.1 },
  { year: "2000", miPrice: 8.6, natPrice: 8.2, miConsumption: 32.4, natConsumption: 33.7 },
  { year: "2005", miPrice: 9.5, natPrice: 9.4, miConsumption: 33.1, natConsumption: 35.6 },
  { year: "2010", miPrice: 12.1, natPrice: 11.5, miConsumption: 30.8, natConsumption: 34.7 },
  { year: "2015", miPrice: 14.9, natPrice: 12.6, miConsumption: 28.6, natConsumption: 33.5 },
  { year: "2018", miPrice: 16.1, natPrice: 12.9, miConsumption: 27.5, natConsumption: 33.0 },
  { year: "2020", miPrice: 17.4, natPrice: 13.2, miConsumption: 28.9, natConsumption: 34.2 },
  { year: "2022", miPrice: 19.8, natPrice: 15.1, miConsumption: 27.1, natConsumption: 32.8 },
  { year: "2023", miPrice: 20.3, natPrice: 16.0, miConsumption: 26.4, natConsumption: 32.1 },
];

const recyclingBreakdown = [
  { name: "Paper/Cardboard", value: 34, color: "hsl(27, 87%, 67%)" },
  { name: "Plastics", value: 18, color: "hsl(209, 86%, 31%)" },
  { name: "Glass", value: 12, color: "hsl(180, 100%, 32%)" },
  { name: "Metals", value: 15, color: "hsl(215, 19%, 35%)" },
  { name: "Organics", value: 14, color: "hsl(145, 32%, 30%)" },
  { name: "Other", value: 7, color: "hsl(0, 100%, 71%)" },
];

const greatLakesStats = [
  { lake: "Superior", waterTemp: "42°F", clarity: "Excellent", invasiveRisk: "Low" },
  { lake: "Michigan", waterTemp: "54°F", clarity: "Good", invasiveRisk: "Moderate" },
  { lake: "Huron", waterTemp: "51°F", clarity: "Good", invasiveRisk: "Moderate" },
  { lake: "Erie", waterTemp: "58°F", clarity: "Fair", invasiveRisk: "High" },
];

const envJusticeAreas = [
  { area: "Southwest Detroit", issue: "Industrial emissions, legacy contamination", pop: "65,000", priority: "Critical" },
  { area: "Flint", issue: "Water infrastructure, lead remediation", pop: "95,000", priority: "Critical" },
  { area: "Benton Harbor", issue: "Lead service lines, water quality", pop: "9,700", priority: "High" },
  { area: "Muskegon Heights", issue: "Brownfield sites, air quality", pop: "10,500", priority: "High" },
  { area: "Saginaw", issue: "Industrial legacy, flood vulnerability", pop: "44,000", priority: "Moderate" },
];

const getQuickStats = (t: (key: string) => string) => [
  { icon: Wind, label: t('environment.airMonitoring'), value: "94", color: "text-michigan-sky" },
  { icon: Droplets, label: t('environment.waterSystems'), value: "1,400+", color: "text-michigan-teal" },
  { icon: Recycle, label: t('environment.recyclingRate'), value: "19%", color: "text-michigan-forest" },
  { icon: Zap, label: t('environment.renewableShare'), value: "13.2%", color: "text-michigan-gold" },
];

const EnvironmentPage = () => {
  const { t } = useTranslation();
  usePageMeta({ title: "Environment & Sustainability", description: "Air quality, water safety, clean energy, recycling, and environmental justice data for Michigan.", path: "/environment" });
  const [activeTab, setActiveTab] = useState("air-water");
  const location = useLocation();

  // Sync tab from URL hash (e.g., /environment#energy, /environment#water)
  useEffect(() => {
    const hash = location.hash.replace("#", "");
    const tabMap: Record<string, string> = {
      utilities: "energy", energy: "energy", outages: "energy",
      water: "water-safety", "drinking-water": "water-safety", lead: "water-safety", pfas: "water-safety", "water-safety": "water-safety",
      air: "air-water",
      recycling: "recycling",
      lakes: "great-lakes", "great-lakes": "great-lakes",
      justice: "justice", ej: "justice",
      programs: "programs",
    };
    if (hash && tabMap[hash]) {
      setActiveTab(tabMap[hash]);
    }
  }, [location.hash]);

  // Fetch live CDC PLACES data for Michigan counties (no measure filter — get diverse health metrics)
  const { data: cdcData, isLoading: cdcLoading, isError: cdcError } = useCDCData(
    "places-county",
    "",
    50
  );

  // Use live CDC data when available, fallback otherwise
  const aqiData = cdcData?.results && cdcData.results.length > 0
    ? transformPlacesToAQI(cdcData.results)
    : fallbackAQI;

  const isLiveData = cdcData?.results && cdcData.results.length > 0 && !cdcError;

  return (
    <Layout>
      <Breadcrumbs items={[{ label: t('environment.badge') }]} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-michigan-forest/10 via-michigan-teal/5 to-background py-16 md:py-20">
        <div className="container">
          <motion.div initial="hidden" animate="show" variants={stagger} className="mx-auto max-w-3xl text-center">
            <motion.div variants={fadeUp} className="mb-4 inline-flex items-center gap-2 rounded-full bg-michigan-forest/10 px-4 py-1.5">
              <Leaf className="h-4 w-4 text-michigan-forest" />
              <span className="text-sm font-medium text-michigan-forest">{t('environment.badge')}</span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="mb-4 text-4xl font-bold text-foreground md:text-5xl">
              {t('environment.title')}
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-muted-foreground">
              {t('environment.subtitle')}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="border-b border-border bg-card py-6">
        <div className="container">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {getQuickStats(t).map((stat) => (
              <motion.div key={stat.label} variants={fadeUp} className="flex items-center gap-3 rounded-lg bg-background p-4">
                <stat.icon className={`h-8 w-8 ${stat.color} shrink-0`} />
                <div>
                  <p className="text-xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Weather Alerts */}
      <section className="py-4">
        <div className="container">
          <WeatherAlerts />
        </div>
      </section>

      {/* Main Tabbed Content */}
      <section className="py-12 md:py-16">
        <div className="container">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
             <TabsList className="mb-8 grid w-full grid-cols-4 md:grid-cols-7 gap-1">
              <TabsTrigger value="air-water" className="text-xs sm:text-sm">{t('environment.airWater')}</TabsTrigger>
              <TabsTrigger value="water-safety" className="text-xs sm:text-sm">Water Safety</TabsTrigger>
              <TabsTrigger value="energy" className="text-xs sm:text-sm">{t('environment.cleanEnergy')}</TabsTrigger>
              <TabsTrigger value="programs" className="text-xs sm:text-sm">Programs & Rebates</TabsTrigger>
              <TabsTrigger value="recycling" className="text-xs sm:text-sm">{t('environment.recycling')}</TabsTrigger>
              <TabsTrigger value="great-lakes" className="text-xs sm:text-sm">{t('environment.greatLakes')}</TabsTrigger>
              <TabsTrigger value="justice" className="text-xs sm:text-sm">{t('environment.envJustice')}</TabsTrigger>
            </TabsList>

            {/* Air & Water Quality */}
            <TabsContent value="air-water">
              <motion.div initial="hidden" animate="show" variants={fadeUp} className="mb-8 grid gap-6 lg:grid-cols-2">
                <AirQualityChecker />
                <MichiganForecast />
              </motion.div>
              <motion.div initial="hidden" animate="show" variants={stagger} className="grid gap-8 lg:grid-cols-2">
                {/* AQI Chart — CDC PLACES live data */}
                <motion.div variants={fadeUp}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Wind className="h-5 w-5 text-michigan-sky" />
                        {isLiveData ? t('environment.asthmaPrevalence') : t('environment.aqiByCity')}
                        {cdcLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin text-muted-foreground" />}
                      </CardTitle>
                      <CardDescription>
                        {isLiveData
                          ? `${t('environment.liveData')} — ${cdcData?.source || "CDC Open Data"}`
                          : t('environment.fallbackData')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={aqiData} layout="vertical" margin={{ left: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                          <XAxis type="number" domain={[0, isLiveData ? "auto" : 100]} />
                          <YAxis dataKey="city" type="category" width={100} tick={{ fontSize: 12 }} />
                          <Tooltip formatter={(value: number) => [
                            isLiveData ? `${value}%` : `AQI: ${value}`,
                            isLiveData ? "Prevalence" : "Air Quality Index"
                          ]} />
                          <Bar dataKey="aqi" radius={[0, 4, 4, 0]}>
                            {aqiData.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
                        {isLiveData ? (
                          <Badge variant="outline" className="border-michigan-forest/30 text-michigan-forest">
                            ✓ Live data from CDC PLACES · Updated {cdcData?.cached_at ? new Date(cdcData.cached_at).toLocaleDateString() : "recently"}
                          </Badge>
                        ) : (
                          <>
                            <Badge variant="outline" className="border-michigan-forest/30 text-michigan-forest">0-50: Good</Badge>
                            <Badge variant="outline" className="border-michigan-gold/30 text-michigan-gold">51-100: Moderate</Badge>
                            <Badge variant="outline" className="border-michigan-coral/30 text-michigan-coral">101+: Unhealthy</Badge>
                            {cdcError && (
                              <Badge variant="outline" className="border-michigan-coral/30 text-michigan-coral">
                                ⚠ Data loading… using cached values
                              </Badge>
                            )}
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Water Quality Trend */}
                <motion.div variants={fadeUp}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Droplets className="h-5 w-5 text-michigan-teal" />
                        {t('environment.waterViolations')}
                      </CardTitle>
                      <CardDescription>{t('environment.waterViolationsDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={waterQualityTrend}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                          <XAxis dataKey="year" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="violations" stroke="hsl(0, 100%, 71%)" strokeWidth={2} name="Violations" dot={{ r: 4 }} />
                          <Line type="monotone" dataKey="resolved" stroke="hsl(145, 32%, 30%)" strokeWidth={2} name="Resolved" dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                      <p className="mt-4 text-sm text-muted-foreground">
                        <strong>{t('environment.improvingTrend')}</strong> {t('environment.improvingTrendDesc')}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>

              {/* Water Safety Advisories */}
              <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mt-8">
                <Card className="border-michigan-gold/30 bg-michigan-gold/5">
                  <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center">
                    <AlertTriangle className="h-10 w-10 shrink-0 text-michigan-gold" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{t('environment.activeAdvisories')}</h3>
                      <p className="text-sm text-muted-foreground">{t('environment.advisoriesDesc')}</p>
                    </div>
                    <Button variant="outline" className="shrink-0" asChild>
                      <a href="https://www.michigan.gov/egle/about/organization/drinking-water-and-environmental-health" target="_blank" rel="noopener">
                        {t('environment.checkAdvisories')} <ExternalLink className="ml-2 h-3 w-3" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Real-Time Monitoring Resources */}
              <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mt-8 grid gap-6 md:grid-cols-2">
                <Card className="hover:border-michigan-sky/30 transition-colors">
                  <CardContent className="p-6">
                    <Wind className="mb-3 h-8 w-8 text-michigan-sky" />
                    <h3 className="mb-2 font-semibold text-foreground">Check Your Local Air Quality</h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                      Michigan has 40+ air monitoring stations. Check real-time AQI by ZIP code through MiAir or AirNow.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href="https://www.michigan.gov/MiAir" target="_blank" rel="noopener">
                          MiAir <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href="https://www.airnowapi.org/aq/observation/zipCode/current/" target="_blank" rel="noopener">
                          AirNow API <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                <Card className="hover:border-michigan-teal/30 transition-colors">
                  <CardContent className="p-6">
                    <Droplets className="mb-3 h-8 w-8 text-michigan-teal" />
                    <h3 className="mb-2 font-semibold text-foreground">Great Lakes & Water Monitoring</h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                      Real-time buoy data, stream flow, and water quality from GLOS/Seagull, USGS, and EGLE monitoring networks.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href="https://seagull.glos.org/" target="_blank" rel="noopener">
                          GLOS Seagull <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href="https://waterdata.usgs.gov/state/michigan/" target="_blank" rel="noopener">
                          USGS Water <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href="https://www.michigan.gov/egle/public/learn/water-quality" target="_blank" rel="noopener">
                          EGLE Water <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Water Safety & Contamination */}
            <TabsContent value="water-safety">
              <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-8">
                <motion.div variants={fadeUp} className="rounded-xl border border-michigan-teal/20 bg-michigan-teal/5 p-6">
                  <div className="flex items-start gap-4">
                    <Droplets className="h-8 w-8 shrink-0 text-michigan-teal" />
                    <div>
                      <h2 className="text-xl font-bold text-foreground">Water Safety & Contamination</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Michigan's water safety journey — from Flint to PFAS to lead line replacement — makes water quality data more essential here than almost anywhere in America.
                      </p>
                    </div>
                  </div>
                </motion.div>

                <div className="grid gap-6 md:grid-cols-3">
                  {/* PFAS */}
                  <motion.div variants={fadeUp}>
                    <Card className="h-full">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <AlertTriangle className="h-4 w-4 text-michigan-coral" /> PFAS Contamination
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">Michigan has identified <strong>200+</strong> PFAS sites — more than any other state. MPART (established 2017) coordinates response.</p>
                        <ul className="space-y-2 text-xs text-muted-foreground">
                          <li>• Drinking water standard: 8 parts per trillion (strictest in US)</li>
                          <li>• "Forever chemicals" from firefighting foam & industrial waste</li>
                          <li>• Well testing available for private well owners</li>
                        </ul>
                        <div className="flex flex-col gap-2 pt-2">
                          <a href="https://www.michigan.gov/egle/maps-data/mpart-pfas-gis" target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                            <MapPin className="h-3 w-3" /> MPART PFAS Interactive Map
                          </a>
                          <a href="https://gis-egle.hub.arcgis.com/datasets/egle::michigan-pfas-sites-and-areas-of-interest/about" target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                            <ExternalLink className="h-3 w-3" /> ArcGIS PFAS Data Layer
                          </a>
                          <a href="https://www.michigan.gov/pfasresponse" target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                            <ExternalLink className="h-3 w-3" /> Test Your Well
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Lead */}
                  <motion.div variants={fadeUp}>
                    <Card className="h-full">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Shield className="h-4 w-4 text-michigan-gold" /> Lead Service Lines
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground"><strong>Flint:</strong> 98% of lead lines replaced, ~500 remaining. Spring 2026 work scheduled to complete the project.</p>
                        <ul className="space-y-2 text-xs text-muted-foreground">
                          <li>• Federal Lead & Copper Rule Revisions (LCRR) effective Oct 2024</li>
                          <li>• All Michigan water systems must inventory lead lines</li>
                          <li>• MiLeadSafe tracks replacement progress statewide</li>
                        </ul>
                        <div className="flex flex-col gap-2 pt-2">
                          <a href="https://www.michigan.gov/egle/about/featured/mi-lead-safe" target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                            <ExternalLink className="h-3 w-3" /> MiLeadSafe Dashboard
                          </a>
                          <a href="https://www.safewaterengineering.com/hottopics/milslrtracker" target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                            <ExternalLink className="h-3 w-3" /> Planet Detroit LSLR Tracker
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Drinking Water */}
                  <motion.div variants={fadeUp}>
                    <Card className="h-full">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Droplets className="h-4 w-4 text-michigan-sky" /> Drinking Water
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">EGLE oversees Michigan's public water systems and provides well water resources for the 1.1M+ households on private wells.</p>
                        <ul className="space-y-2 text-xs text-muted-foreground">
                          <li>• 1,400+ public water systems monitored</li>
                          <li>• Violations decreased 50% since 2019</li>
                          <li>• Water Well Viewer: look up well logs by address</li>
                        </ul>
                        <div className="flex flex-col gap-2 pt-2">
                          <a href="https://www.michigan.gov/egle/about/organization/drinking-water-and-environmental-health" target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                            <ExternalLink className="h-3 w-3" /> EGLE Drinking Water Division
                          </a>
                          <a href="https://www.michigan.gov/egle/maps-data/water-well-viewer" target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                            <MapPin className="h-3 w-3" /> Water Well Viewer
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                <motion.div variants={fadeUp}>
                  <WaterMonitorWidget />
                </motion.div>
              </motion.div>
            </TabsContent>

            <TabsContent value="energy">
              <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-8">
                <motion.div variants={fadeUp}>
                  <EnergyPriceTracker />
                </motion.div>
                <motion.div variants={fadeUp}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-michigan-gold" />
                        {t('environment.renewableGrowth')}
                      </CardTitle>
                      <CardDescription>{t('environment.renewableGrowthDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={350}>
                        <AreaChart data={renewableGrowth}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                          <XAxis dataKey="year" />
                          <YAxis unit="%" />
                          <Tooltip formatter={(v: number) => `${v}%`} />
                          <Area type="monotone" dataKey="solar" stackId="1" stroke="hsl(27, 87%, 67%)" fill="hsl(27, 87%, 67%)" fillOpacity={0.6} name="Solar" />
                          <Area type="monotone" dataKey="wind" stackId="1" stroke="hsl(209, 86%, 31%)" fill="hsl(209, 86%, 31%)" fillOpacity={0.6} name="Wind" />
                          <Area type="monotone" dataKey="hydro" stackId="1" stroke="hsl(180, 100%, 32%)" fill="hsl(180, 100%, 32%)" fillOpacity={0.6} name="Hydroelectric" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* EIA SEDS — Electricity Price Comparison */}
                <motion.div variants={fadeUp}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-michigan-coral" />
                        Residential Electricity Prices: Michigan vs. National
                      </CardTitle>
                      <CardDescription>Cents per kWh · Source: U.S. Energy Information Administration (EIA SEDS) · 1990–2023</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={eiaSEDS}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                          <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                          <YAxis unit="¢" tick={{ fontSize: 11 }} />
                          <Tooltip formatter={(v: number) => [`${v}¢/kWh`]} />
                          <Legend />
                          <Line type="monotone" dataKey="miPrice" stroke="hsl(209, 86%, 31%)" strokeWidth={2.5} name="Michigan" dot={{ r: 3 }} />
                          <Line type="monotone" dataKey="natPrice" stroke="hsl(215, 19%, 55%)" strokeWidth={2} strokeDasharray="5 5" name="National Avg" dot={{ r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                      <p className="text-xs text-muted-foreground mt-3">
                        <strong>Insight:</strong> Michigan residential electricity prices have risen 174% since 1990, outpacing the national average by 27%. This gap widened after 2010 due to coal-plant retirements and transmission investments.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* EIA SEDS — Per-Capita Consumption */}
                <motion.div variants={fadeUp}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-michigan-teal" />
                        Per-Capita Energy Consumption: Michigan vs. National
                      </CardTitle>
                      <CardDescription>Million BTU per person · Source: EIA SEDS · 1990–2023</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={eiaSEDS}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                          <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                          <YAxis unit="M" tick={{ fontSize: 11 }} />
                          <Tooltip formatter={(v: number) => [`${v} MBTU/person`]} />
                          <Legend />
                          <Area type="monotone" dataKey="miConsumption" stroke="hsl(209, 86%, 31%)" fill="hsl(209, 86%, 31%)" fillOpacity={0.15} strokeWidth={2} name="Michigan" />
                          <Area type="monotone" dataKey="natConsumption" stroke="hsl(215, 19%, 55%)" fill="hsl(215, 19%, 55%)" fillOpacity={0.1} strokeWidth={2} strokeDasharray="5 5" name="National Avg" />
                        </AreaChart>
                      </ResponsiveContainer>
                      <p className="text-xs text-muted-foreground mt-3">
                        <strong>Insight:</strong> Michigan's per-capita energy consumption has declined 13% since 2005, driven by efficiency programs and deindustrialization — now 18% below the national average.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={fadeUp} className="grid gap-6 md:grid-cols-3">
                  {[
                    { title: "MI Healthy Climate Plan", desc: "100% carbon neutrality by 2050. 52% GHG reduction from 2005 levels by 2030. 100% clean energy standard by 2040. Currently ~15% below 2005 baseline. $27.8 billion in IRA-funded investment, 26,000+ jobs.", link: "https://www.michigan.gov/egle/about/organization/climate-and-energy/mi-healthy-climate-plan" },
                    { title: "25D Clean Energy Tax Credit", desc: "30% federal tax credit through 2032 for solar, wind, geothermal, and battery storage. Stackable with MiHER rebates and utility incentives. (Note: 25C credit expired Dec 31, 2025.)", link: "https://www.michigan.gov/egle" },
                    { title: "Community Solar Programs", desc: "Subscribe to shared solar farms without installing panels on your roof. Multiple programs available across Michigan utilities.", link: "https://www.michigan.gov/mpsc" },
                  ].map((item) => (
                    <Card key={item.title} className="group hover:border-michigan-gold/30 transition-colors">
                      <CardContent className="p-6">
                        <Zap className="mb-3 h-8 w-8 text-michigan-gold" />
                        <h3 className="mb-2 font-semibold text-foreground">{item.title}</h3>
                        <p className="mb-4 text-sm text-muted-foreground">{item.desc}</p>
                        <a href={item.link} target="_blank" rel="noopener" className="text-sm font-medium text-primary hover:underline">
                          {t('environment.learnMore')} <ExternalLink className="ml-1 inline h-3 w-3" />
                        </a>
                      </CardContent>
                    </Card>
                  ))}
                </motion.div>

                {/* Energy Assistance Program Finder */}
                <motion.div variants={fadeUp}>
                  <EnergyAssistanceFinder />
                </motion.div>

                <motion.div variants={fadeUp}>
                  <EnergyHealthScatter />
                </motion.div>
              </motion.div>
            </TabsContent>

            {/* Programs & Rebates — Sustainability & Energy */}
            <TabsContent value="programs">
              <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-8">
                {/* LIHEAP */}
                <motion.div variants={fadeUp}>
                  <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-michigan-coral" /> Energy Bill Assistance
                  </h2>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <Card className="hover:border-michigan-coral/30 transition-colors">
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-foreground mb-2">LIHEAP (Heating Assistance)</h3>
                        <p className="text-sm text-muted-foreground mb-3">FY2025 federal allocation: <strong>$183,334,313</strong> (including $5.85M IIJA). In FY2024, served <strong>434,124</strong> households (heating) and <strong>129,420</strong> (crisis). Benefits range $1–$2,205 (heating); up to $800 (crisis).</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge variant="outline" className="text-xs">110% FPG (heating)</Badge>
                          <Badge variant="outline" className="text-xs">150% FPG (crisis)</Badge>
                        </div>
                        <Button variant="outline" size="sm" className="w-full" asChild>
                          <a href="https://newmibridges.michigan.gov" target="_blank" rel="noopener">
                            Apply via MI Bridges <ExternalLink className="ml-2 h-3 w-3" />
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                    <Card className="hover:border-michigan-coral/30 transition-colors">
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-foreground mb-2">MEAP (Michigan Energy Assistance)</h3>
                        <p className="text-sm text-muted-foreground mb-3">2025 budget: ~<strong>$54.5 million</strong>. Served <strong>56,018</strong> households before October expansion. PA 168–170 of 2024 removes cap and raises factor to $1.25/meter (increasing to $2.00 max). Projected to reach <strong>$100 million by 2028</strong>.</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge variant="outline" className="text-xs">New: 60% SMI (~$61,861/family of 4)</Badge>
                          <Badge variant="outline" className="text-xs">Oct 2025 expansion</Badge>
                        </div>
                        <Button variant="outline" size="sm" className="w-full" asChild>
                          <a href="https://www.michigan.gov/mpsc/consumer/energy-assistance" target="_blank" rel="noopener">
                            Learn More <ExternalLink className="ml-2 h-3 w-3" />
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>

                {/* Residential Rebates */}
                <motion.div variants={fadeUp}>
                  <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-michigan-gold" /> Residential Rebates — MiHER ($211M from IRA)
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">Michigan Home Energy Rebate program launched statewide April 23, 2025. Total funding: <strong>$211 million</strong> (HOMES: $105.7M, HEAR: $105.3M). Target: up to <strong>15,000 households</strong>. HOMES + HEAR combined max: up to <strong>$34,000/household</strong>. Call center: 855-510-7080.</p>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <Card className="hover:border-michigan-gold/30 transition-colors">
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-foreground mb-2">HOMES Rebate (MiHER)</h3>
                        <p className="text-sm text-muted-foreground mb-3">Up to <strong>$20,000/household</strong> for whole-home energy efficiency upgrades including insulation, air sealing, and HVAC improvements. 100% covered for households at 0–80% AMI.</p>
                        <Badge variant="outline" className="mr-2 text-xs">Income-based</Badge>
                        <Badge variant="outline" className="text-xs">Federal IRA</Badge>
                        <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
                          <a href="https://www.michigan.gov/egle/about/organization/materials-management/energy/rfps-loans/home-energy-rebate-programs/get-rebate" target="_blank" rel="noopener">
                            Apply Now <ExternalLink className="ml-2 h-3 w-3" />
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                    <Card className="hover:border-michigan-gold/30 transition-colors">
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-foreground mb-2">HEAR Rebate (MiHER)</h3>
                        <p className="text-sm text-muted-foreground mb-3">Point-of-sale rebates: heat pump HVAC up to <strong>$8,000</strong>; water heater $1,750; electric stove $840; dryer $840; panel upgrade $4,000; insulation $1,600. Combined up to <strong>$14,000+</strong>.</p>
                        <Badge variant="outline" className="mr-2 text-xs">Low/Moderate Income</Badge>
                        <Badge variant="outline" className="text-xs">Electrification</Badge>
                        <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
                          <a href="https://www.michigan.gov/egle/about/organization/materials-management/energy/rfps-loans/home-energy-rebate-programs/get-rebate" target="_blank" rel="noopener">
                            Learn More <ExternalLink className="ml-2 h-3 w-3" />
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>

                {/* IRA Tax Credits */}
                <motion.div variants={fadeUp}>
                  <Card className="border-michigan-coral/30 bg-michigan-coral/5">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-6 w-6 shrink-0 text-michigan-coral mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-foreground mb-2">IRA Tax Credit Update</h3>
                          <p className="text-sm text-muted-foreground"><strong>25C (Energy Efficient Home Improvement Credit): EXPIRED</strong> — Terminated December 31, 2025 by the "One Big Beautiful Bill" (signed July 4, 2025).</p>
                          <p className="text-sm text-muted-foreground mt-2"><strong>25D (Residential Clean Energy Credit): STILL ACTIVE</strong> — 30% through 2032 for solar, wind, geothermal, and battery storage. MiHER rebates are stackable with 25D and utility rebates.</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Clean Financing */}
                <motion.div variants={fadeUp}>
                  <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-michigan-teal" /> Clean Financing
                  </h2>
                  <Card className="hover:border-michigan-teal/30 transition-colors">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-foreground mb-2">Michigan Saves — Low-Interest Green Loans</h3>
                      <p className="text-sm text-muted-foreground mb-3">In 2024: <strong>7,304 residential projects</strong> and <strong>$96.6 million</strong> financed ($108.1M total investment). Average savings: <strong>$347/year</strong>. Cumulative: 50,000+ customers, <strong>$500+ million</strong> financed, 207 GWh saved. Plus a $97M grant from EPA Greenhouse Gas Reduction Fund. Loan terms: $1,000–$75,000, from 6.49% APR, up to 15 years.</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="outline" className="text-xs">Solar</Badge>
                        <Badge variant="outline" className="text-xs">HVAC</Badge>
                        <Badge variant="outline" className="text-xs">Insulation</Badge>
                        <Badge variant="outline" className="text-xs">EV Chargers</Badge>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href="https://michigansaves.org/home-energy-improvements/" target="_blank" rel="noopener">
                          Explore Loans <ExternalLink className="ml-2 h-3 w-3" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Utility Programs */}
                <motion.div variants={fadeUp}>
                  <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-michigan-forest" /> Utility Programs
                  </h2>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <Card className="hover:border-michigan-forest/30 transition-colors">
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-foreground mb-2">DTE Energy Efficiency</h3>
                        <p className="text-sm text-muted-foreground mb-3">Low-income funding: <strong>$63M</strong> (2024), <strong>$73M</strong> (2025). EV Charging Forward: $12.5M (2024), $5.1M (2025). All MI utilities combined: <strong>$551+ million</strong> on energy waste reduction (2023). Every $1 returns ~$2.40–$3.18.</p>
                        <Button variant="outline" size="sm" asChild>
                          <a href="https://www.dteenergy.com/us/en/residential/save-money-energy.html" target="_blank" rel="noopener">
                            DTE Programs <ExternalLink className="ml-2 h-3 w-3" />
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                    <Card className="hover:border-michigan-forest/30 transition-colors">
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-foreground mb-2">Consumers Energy Efficiency</h3>
                        <p className="text-sm text-muted-foreground mb-3">2024–2025 plan: nearly <strong>$600 million</strong> (MPSC-approved Feb 2024). Income-qualified electric: <strong>$85.3M</strong> (29% increase). Income-qualified gas: <strong>$113.1M</strong> (56% increase). Cumulative savings since 2009: over <strong>$5.5 billion</strong>. Nearly 200,000 low-income customers served.</p>
                        <Button variant="outline" size="sm" asChild>
                          <a href="https://www.consumersenergy.com/residential/save-money-and-energy" target="_blank" rel="noopener">
                            Consumers Programs <ExternalLink className="ml-2 h-3 w-3" />
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>

                {/* Workforce & Training */}
                <motion.div variants={fadeUp}>
                  <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" /> Workforce & Training
                  </h2>
                  <Card className="hover:border-primary/30 transition-colors">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-foreground mb-2">Going PRO Talent Fund</h3>
                      <p className="text-sm text-muted-foreground mb-3">State-funded training grants for employers to train new and current workers in high-demand industries including clean energy, advanced manufacturing, and skilled trades.</p>
                      <Button variant="outline" size="sm" asChild>
                        <a href="https://www.michigan.gov/leo/bureaus-agencies/wd/programs/going-pro" target="_blank" rel="noopener">
                          Learn More <ExternalLink className="ml-2 h-3 w-3" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Connectivity */}
                <motion.div variants={fadeUp}>
                  <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-michigan-sky" /> Connectivity & Broadband
                  </h2>
                  <Card className="hover:border-michigan-sky/30 transition-colors">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-foreground mb-2">Michigan High-Speed Internet Office (MIHI)</h3>
                      <p className="text-sm text-muted-foreground mb-3">$5.3 billion in federal investment to connect every Michigan home and business with affordable high-speed internet. Check eligibility for the Affordable Connectivity Program (ACP) and local broadband grants.</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="outline" className="text-xs">BEAD Program</Badge>
                        <Badge variant="outline" className="text-xs">ACP Subsidy</Badge>
                        <Badge variant="outline" className="text-xs">Rural Priority</Badge>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href="https://www.michigan.gov/leo/bureaus-agencies/mihi" target="_blank" rel="noopener">
                          Check Availability <ExternalLink className="ml-2 h-3 w-3" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </TabsContent>

            {/* Recycling */}
            <TabsContent value="recycling">
              <motion.div initial="hidden" animate="show" variants={stagger} className="grid gap-8 lg:grid-cols-2">
                <motion.div variants={fadeUp}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Recycle className="h-5 w-5 text-michigan-forest" />
                        Michigan Recycling Composition
                      </CardTitle>
                      <CardDescription>Breakdown of materials recovered through curbside and drop-off programs · Source: Michigan EGLE</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center">
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie data={recyclingBreakdown} cx="50%" cy="50%" outerRadius={110} innerRadius={60} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}%`}>
                            {recyclingBreakdown.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={fadeUp}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Michigan's 10¢ Bottle Deposit</CardTitle>
                      <CardDescription>The nation's most successful deposit-return program</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="rounded-lg bg-michigan-forest/10 p-4">
                          <p className="text-3xl font-bold text-michigan-forest">89%</p>
                          <p className="text-sm text-muted-foreground">Container return rate — highest in the nation</p>
                        </div>
                        <div className="rounded-lg bg-michigan-teal/10 p-4">
                          <p className="text-3xl font-bold text-michigan-teal">$1.2B+</p>
                          <p className="text-sm text-muted-foreground">In deposits returned to Michigan consumers since inception</p>
                        </div>
                      </div>
                      <Accordion type="single" collapsible className="mt-6">
                        <AccordionItem value="how">
                          <AccordionTrigger className="text-sm">How does the deposit program work?</AccordionTrigger>
                          <AccordionContent className="text-sm text-muted-foreground">
                            Michigan's Bottle Deposit Law requires a 10-cent deposit on carbonated beverage containers. When you return containers to a retailer or reverse vending machine, you receive your 10¢ back per container. Unclaimed deposits fund environmental programs.
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="where">
                          <AccordionTrigger className="text-sm">Where can I recycle beyond bottles?</AccordionTrigger>
                          <AccordionContent className="text-sm text-muted-foreground">
                            Michigan has 600+ drop-off recycling sites and growing curbside programs. Visit <a href="https://www.recyclemichiganresources.com/" target="_blank" rel="noopener" className="text-primary underline">RecycleMichiganResources.com</a> for locations and accepted materials near you.
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </TabsContent>

            {/* Great Lakes */}
            <TabsContent value="great-lakes">
              <motion.div initial="hidden" animate="show" variants={stagger}>
                <motion.div variants={fadeUp} className="mb-8 rounded-xl border border-michigan-teal/20 bg-gradient-to-br from-michigan-teal/5 to-michigan-sky/5 p-8">
                  <div className="flex items-start gap-4">
                    <Fish className="h-10 w-10 shrink-0 text-michigan-teal" />
                    <div>
                      <h2 className="mb-2 text-2xl font-bold text-foreground">Great Lakes Conservation</h2>
                      <p className="text-muted-foreground">Michigan borders four of the five Great Lakes, containing 20% of the world's surface freshwater. Protecting these ecosystems is critical to our economy, health, and quality of life.</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {greatLakesStats.map((lake) => (
                    <Card key={lake.lake} className="group hover:border-michigan-teal/30 transition-colors">
                      <CardContent className="p-6">
                        <h3 className="mb-3 text-lg font-bold text-foreground">Lake {lake.lake}</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between"><span className="text-muted-foreground">Water Temp</span><span className="font-medium">{lake.waterTemp}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Clarity</span><span className="font-medium">{lake.clarity}</span></div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Invasive Risk</span>
                            <Badge variant={lake.invasiveRisk === "Low" ? "outline" : lake.invasiveRisk === "Moderate" ? "secondary" : "destructive"} className="text-xs">
                              {lake.invasiveRisk}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </motion.div>

                <motion.div variants={fadeUp} className="mt-8">
                  <Accordion type="single" collapsible>
                    <AccordionItem value="invasive">
                      <AccordionTrigger>Invasive Species Threats</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        Zebra and quagga mussels, sea lamprey, and Asian carp remain the top invasive threats. Michigan invests $20M+ annually in prevention barriers, monitoring, and rapid-response programs. Report sightings at Michigan DNR's <a href="https://www.michigan.gov/invasives" target="_blank" rel="noopener" className="text-primary underline">invasive species portal</a>.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="algal">
                      <AccordionTrigger>Harmful Algal Blooms (HABs)</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        Nutrient runoff from agriculture and stormwater fuels harmful algal blooms, particularly in Lake Erie and inland lakes. These blooms produce toxins dangerous to humans and pets. Michigan tracks active blooms and issues public health advisories through EGLE.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="pfas">
                      <AccordionTrigger>PFAS Contamination</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        Michigan has identified 200+ PFAS contamination sites — more than any other state. "Forever chemicals" from firefighting foam and industrial waste have contaminated groundwater and surface water. The state has adopted some of the nation's strictest PFAS standards at 8 parts per trillion for drinking water.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </motion.div>
              </motion.div>
            </TabsContent>

            {/* Environmental Justice */}
            <TabsContent value="justice">
              <motion.div initial="hidden" animate="show" variants={stagger}>
                <motion.div variants={fadeUp} className="mb-8 rounded-xl border border-michigan-coral/20 bg-michigan-coral/5 p-6">
                  <div className="flex items-start gap-4">
                    <Shield className="h-8 w-8 shrink-0 text-michigan-coral" />
                    <div>
                      <h2 className="text-xl font-bold text-foreground">Environmental Justice in Michigan</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Low-income communities and communities of color disproportionately bear environmental burdens — from air pollution to contaminated water. Michigan's Office of the Environmental Justice Public Advocate works to address these disparities.
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={fadeUp}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Priority Environmental Justice Communities</CardTitle>
                      <CardDescription>Areas identified for enhanced monitoring, remediation, and investment</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[500px]">
                          <thead>
                            <tr className="border-b border-border text-left">
                              <th className="pb-3 font-medium text-muted-foreground">Community</th>
                              <th className="pb-3 font-medium text-muted-foreground">Key Issue</th>
                              <th className="pb-3 font-medium text-muted-foreground">Population</th>
                              <th className="pb-3 font-medium text-muted-foreground">Priority</th>
                            </tr>
                          </thead>
                          <tbody>
                            {envJusticeAreas.map((area) => (
                              <tr key={area.area} className="border-b border-border/50">
                                <td className="py-3 font-medium text-foreground">{area.area}</td>
                                <td className="py-3 text-muted-foreground">{area.issue}</td>
                                <td className="py-3 text-muted-foreground">{area.pop}</td>
                                <td className="py-3">
                                  <Badge variant={area.priority === "Critical" ? "destructive" : area.priority === "High" ? "secondary" : "outline"}>
                                    {area.priority}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={fadeUp} className="mt-8 grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardContent className="p-6">
                      <Globe className="mb-3 h-8 w-8 text-michigan-teal" />
                      <h3 className="mb-2 font-semibold">Michigan EJ Screen Tool</h3>
                      <p className="mb-4 text-sm text-muted-foreground">Use the EPA's EJScreen tool to explore environmental justice indicators for any Michigan community — pollution burden, health vulnerabilities, and demographic factors.</p>
                      <Button variant="outline" asChild>
                        <a href="https://ejscreen.epa.gov/mapper/" target="_blank" rel="noopener">
                          Open EJScreen <ExternalLink className="ml-2 h-3 w-3" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <MapPin className="mb-3 h-8 w-8 text-michigan-forest" />
                      <h3 className="mb-2 font-semibold">Report an Environmental Concern</h3>
                      <p className="mb-4 text-sm text-muted-foreground">Witnessed illegal dumping, unusual odors, or water discoloration? Report concerns to Michigan EGLE's 24-hour Pollution Emergency Alerting System (PEAS).</p>
                      <Button variant="outline" asChild>
                        <a href="https://www.michigan.gov/egle/about/contact/pollution-emergency-alerting-system" target="_blank" rel="noopener">
                          Report Concern <ExternalLink className="ml-2 h-3 w-3" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Cross-references */}
      <section className="py-8">
        <div className="container space-y-4">
          <HealthSafetyCallout />
          <CivicDataCallout />
          <TransportationCallout />
          <Card className="border-michigan-forest/20 bg-michigan-forest/5">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-michigan-forest/10 flex-shrink-0">
                  <Footprints className="h-5 w-5 text-michigan-forest" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-foreground">Walkable Infrastructure Reduces Emissions</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Walkable infrastructure reduces car trips and carbon emissions. See Michigan's pedestrian, bike, and accessibility infrastructure data powered by the federal GATIS standard.
                  </p>
                  <Link to="/transportation">
                    <Button size="sm" variant="outline" className="mt-2 h-7 text-xs">
                      <ArrowRight className="mr-1 h-3 w-3" />Active Transportation Data
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-foreground">Data Centers & Michigan's Energy Future</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    $11.3B+ in data center projects could nearly double Michigan's electricity demand. Track the Stargate project, energy pipeline, and community impact.
                  </p>
                  <Link to="/data-centers">
                    <Button size="sm" variant="outline" className="mt-2 h-7 text-xs">
                      <ArrowRight className="mr-1 h-3 w-3" />Data Center Insights
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Data Sources */}
      <section className="border-t border-border bg-muted/30 py-8">
        <div className="container text-center">
          <p className="text-xs text-muted-foreground">
            Data Sources:{" "}
            <a href="https://data.cdc.gov/" target="_blank" rel="noopener" className="underline hover:text-primary">CDC PLACES</a>,{" "}
            <a href="https://www.epa.gov/outdoor-air-quality-data" target="_blank" rel="noopener" className="underline hover:text-primary">EPA AirNow</a>,{" "}
            <a href="https://www.michigan.gov/egle" target="_blank" rel="noopener" className="underline hover:text-primary">Michigan EGLE</a>,{" "}
            <a href="https://www.eia.gov/state/?sid=MI" target="_blank" rel="noopener" className="underline hover:text-primary">U.S. EIA</a>,{" "}
            <a href="https://www.glerl.noaa.gov/" target="_blank" rel="noopener" className="underline hover:text-primary">NOAA GLERL</a>,{" "}
            <a href="https://ejscreen.epa.gov/" target="_blank" rel="noopener" className="underline hover:text-primary">EPA EJScreen</a>
          </p>
          {!isLiveData && (
            <p className="mt-2 text-xs text-muted-foreground">
              ⚠ Some charts display cached reference values while live data sources load.
            </p>
          )}
        </div>

        {/* Copilot */}
        <div className="flex justify-center mt-8">
          <AskCopilotButton
            context="Context: environment. This is the Michigan Environment & Sustainability page covering air quality, water safety, energy, recycling, Great Lakes, and environmental justice. Instructions: Identify 3 key environmental/water issues for the user's area, 2 actions for residents, and 2 ideas for planners."
            label="Ask Access Michigan about environment data"
          />
        </div>
      </section>
    </Layout>
  );
};

export default EnvironmentPage;
