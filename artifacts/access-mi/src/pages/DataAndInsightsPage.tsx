import { useState, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { usePageMeta } from "@/hooks/usePageMeta";
import {
  Database,
  BarChart3,
  Heart,
  Users,
  AlertCircle,
  Download,
  ExternalLink,
  Code,
  Lock,
  MapPin,
  Copy,
  FileText,
  ArrowRight,
  Newspaper,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { EquityInsightCard } from "@/components/shared/EquityInsightCard";
import DataProvenance from "@/components/shared/DataProvenance";
import { toast } from "sonner";
import { RESOURCE_COUNT_DISPLAY } from "@/config/platformConstants";

const CountyChoropleth = lazy(
  () => import("@/components/dashboard/CountyChoropleth"),
);
const CSVExportPanel = lazy(
  () => import("@/components/dashboard/CSVExportPanel"),
);
const CountyCompare = lazy(
  () => import("@/components/dashboard/CountyCompare"),
);
const ImpactStories = lazy(() => import("@/components/data/ImpactStories"));

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.35 },
  }),
};

const SectionFallback = () => (
  <div className="py-8 flex justify-center">
    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

const datasets = [
  {
    id: "cms-facilities",
    name: "CMS Healthcare Facilities",
    description:
      "Hospitals, clinics, and health centers across Michigan from the Centers for Medicare & Medicaid Services.",
    records: "2,847 facilities",
    updated: "Monthly",
    formats: ["JSON", "CSV", "GeoJSON"],
    link: "https://data.cms.gov/",
  },
  {
    id: "hrsa-fqhc",
    name: "HRSA Federally Qualified Health Centers",
    description:
      "Community health centers and primary care providers eligible for federal funding programs.",
    records: "1,203 centers",
    updated: "Quarterly",
    formats: ["CSV", "JSON"],
    link: "https://findahealthcenter.hrsa.gov/",
  },
  {
    id: "cdc-svi",
    name: "CDC Social Vulnerability Index",
    description:
      "Census tract-level vulnerability data including income, education, housing, and demographics.",
    records: "All Michigan tracts",
    updated: "Every 4 years",
    formats: ["GIS Shapefiles", "CSV"],
    link: "https://www.atsdr.cdc.gov/placeandhealth/svi/",
  },
  {
    id: "hrsa-hpsa",
    name: "HRSA Health Professional Shortage Areas",
    description:
      "Designated areas with insufficient primary care, mental health, or dental providers.",
    records: "23 HPSA counties",
    updated: "Annually",
    formats: ["GeoJSON", "CSV"],
    link: "https://data.hrsa.gov/",
  },
];

const equityInsights = [
  {
    icon: Heart,
    title: "Black Infant Mortality",
    stat: "2.4x higher",
    description:
      "Black infants in Michigan face 2.4 times higher mortality rates than white infants.",
    source: "MDHHS / CDC WONDER, 2022",
    color: "coral" as const,
    trend: "up" as const,
  },
  {
    icon: Users,
    title: "Rural Uninsured Rate",
    stat: "14%",
    description:
      "Rural Michiganders are twice as likely to be uninsured as urban residents.",
    source: "Census ACS 2023",
    color: "gold" as const,
    trend: "stable" as const,
  },
  {
    icon: AlertCircle,
    title: "Primary Care Shortage",
    stat: "23 counties",
    description:
      "Nearly a third of Michigan counties lack adequate primary care providers.",
    source: "HRSA HPSA, 2024",
    color: "teal" as const,
    trend: "down" as const,
  },
];

const powerUserActions = [
  {
    icon: Download,
    label: "Download county profile as PDF",
    description: "Get a print-ready summary for any county",
    href: "/county/wayne",
  },
  {
    icon: FileText,
    label: "Export statewide CSV",
    description: "All 83 counties, key health metrics",
    action: "csv",
  },
  {
    icon: BarChart3,
    label: "Compare two counties",
    description: "Side-by-side metrics for any two counties",
    action: "compare",
  },
  {
    icon: Copy,
    label: "Embed the uninsured map",
    description: "Copy an iframe embed code for your site",
    action: "embed",
  },
];

export default function DataAndInsightsPage() {
  usePageMeta({
    title: "Data & Insights - Dashboards, Equity & Open Data",
    description:
      "Real-time health equity dashboards, facility data, and open datasets for researchers, health systems, and civic organizations.",
    path: "/data-and-insights",
    jsonLd: {
      "@type": "DataCatalog",
      name: "Access Michigan Data & Insights",
      description: "Health equity dashboards and open data for Michigan",
      url: "https://accessmi.org/data-and-insights",
      provider: { "@type": "Organization", name: "Access Michigan" },
    },
  });

  const [activeTab, setActiveTab] = useState("dashboards");

  const handleAction = (action: string) => {
    if (action === "csv") {
      toast.info("CSV export is available in the Dashboards tab below.");
      setActiveTab("dashboards");
    } else if (action === "compare") {
      setActiveTab("dashboards");
      setTimeout(() => {
        document
          .getElementById("county-compare")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } else if (action === "embed") {
      const code = `<iframe src="https://accessmi.org/embed" width="100%" height="200" style="border:none;border-radius:12px;" title="Access Michigan"></iframe>`;
      navigator.clipboard
        .writeText(code)
        .then(() => toast.success("Embed code copied to clipboard"));
    }
  };

  return (
    <Layout>
      <Breadcrumbs items={[{ label: "Data & Insights" }]} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-michigan-navy/10 via-primary/5 to-background py-14 md:py-20">
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <h1 className="text-3xl font-bold text-foreground md:text-4xl lg:text-5xl mb-4">
              Data & Insights
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Real-time dashboards, equity metrics, and open data for health
              professionals, researchers, journalists, planners, and civic
              organizations.
            </p>
            <div className="flex flex-wrap gap-3">
              <Badge className="bg-michigan-navy text-white">
                Real-time Data
              </Badge>
              <Badge variant="outline">Free & Open</Badge>
              <Badge variant="outline">83 Counties</Badge>
            </div>
          </motion.div>
        </div>
        <div className="absolute inset-0 opacity-[0.03]" aria-hidden="true">
          <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-primary blur-3xl" />
        </div>
      </section>

      <div className="container py-10">
        {/* ── Impact Stories ── */}
        <section className="mb-10">
          <Suspense fallback={<SectionFallback />}>
            <ImpactStories />
          </Suspense>
        </section>

        <Separator className="mb-10" />

        {/* ── Power-User Quick Actions ── */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-foreground mb-4">
            Quick Actions
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {powerUserActions.map((a, i) => (
              <motion.div
                key={a.label}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={i}
              >
                {a.href ? (
                  <Link to={a.href}>
                    <Card className="h-full hover:shadow-md hover:border-primary/20 transition-all cursor-pointer group">
                      <CardContent className="py-5 space-y-2">
                        <a.icon className="h-5 w-5 text-primary" />
                        <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                          {a.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {a.description}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ) : (
                  <Card
                    className="h-full hover:shadow-md hover:border-primary/20 transition-all cursor-pointer group"
                    onClick={() => a.action && handleAction(a.action)}
                  >
                    <CardContent className="py-5 space-y-2">
                      <a.icon className="h-5 w-5 text-primary" />
                      <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                        {a.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {a.description}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        <Separator className="mb-10" />

        {/* ── Tabs ── */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-8"
        >
          <TabsList className="grid w-full max-w-lg grid-cols-4">
            <TabsTrigger value="dashboards" className="gap-1.5">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboards</span>
            </TabsTrigger>
            <TabsTrigger value="equity" className="gap-1.5">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Equity</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-1.5">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Open Data</span>
            </TabsTrigger>
            <TabsTrigger value="analysts" className="gap-1.5">
              <Newspaper className="h-4 w-4" />
              <span className="hidden sm:inline">For Analysts</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Dashboards */}
          <TabsContent value="dashboards" className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Health Data Dashboards
              </h2>
              <p className="text-muted-foreground mb-6">
                Explore real-time metrics on facility capacity, provider
                availability, and community health outcomes.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Link to="/data">
                <Card className="hover:shadow-md hover:border-primary/20 transition-all cursor-pointer group h-full">
                  <CardContent className="py-6 space-y-3">
                    <BarChart3 className="h-8 w-8 text-primary" />
                    <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                      Full Health Dashboard
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Chronic disease, access trends, equity, mortality, and
                      county comparisons.
                    </p>
                    <span className="text-xs text-primary font-medium flex items-center gap-1">
                      Open dashboard <ChevronRight className="h-3 w-3" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/health-map">
                <Card className="hover:shadow-md hover:border-primary/20 transition-all cursor-pointer group h-full">
                  <CardContent className="py-6 space-y-3">
                    <MapPin className="h-8 w-8 text-primary" />
                    <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                      Interactive Health Map
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      County heatmap with provider locations, shortage areas,
                      and air quality.
                    </p>
                    <span className="text-xs text-primary font-medium flex items-center gap-1">
                      Open map <ChevronRight className="h-3 w-3" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* ── Policy Impact Projections ── */}
            <div>
              <h3 className="text-base font-semibold text-foreground mb-3">
                Policy Impact Projections
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Link to="/data/medicaid-coverage-at-risk">
                  <Card className="hover:shadow-md hover:border-primary/20 transition-all cursor-pointer group h-full">
                    <CardContent className="py-5 space-y-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-amber-600" />
                        <Badge variant="outline" className="text-[10px]">
                          V2
                        </Badge>
                      </div>
                      <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                        Medicaid Coverage at Risk
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        County-level exposure estimates for Michigan adults
                        under P.L. 119-21 work requirement provisions. Urban
                        Institute March 2026.
                      </p>
                      <span className="text-xs text-primary font-medium flex items-center gap-1">
                        View projections <ChevronRight className="h-3 w-3" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
                <Link to="/data/snap-coverage-at-risk">
                  <Card className="hover:shadow-md hover:border-primary/20 transition-all cursor-pointer group h-full">
                    <CardContent className="py-5 space-y-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-amber-600" />
                        <Badge variant="outline" className="text-[10px]">
                          V3
                        </Badge>
                      </div>
                      <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                        SNAP Coverage at Risk
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        County-level exposure estimates for Michigan SNAP
                        participants under P.L. 119-21 ABAWD provisions.
                        MLPP/CBO April 2026.
                      </p>
                      <span className="text-xs text-primary font-medium flex items-center gap-1">
                        View projections <ChevronRight className="h-3 w-3" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 mt-4">
                <Link to="/data/dual-eligible-exposure">
                  <Card className="hover:shadow-md hover:border-primary/20 transition-all cursor-pointer group h-full">
                    <CardContent className="py-5 space-y-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-amber-600" />
                        <Badge variant="outline" className="text-[10px]">
                          V3
                        </Badge>
                      </div>
                      <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                        Dual-Eligible Exposure
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        County-level view of Michiganders enrolled in both
                        Medicare and Medicaid. Dual-eligibles are exempt from
                        P.L. 119-21 work requirements.
                      </p>
                      <span className="text-xs text-primary font-medium flex items-center gap-1">
                        View map <ChevronRight className="h-3 w-3" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>

            {/* County Choropleth */}
            <Suspense fallback={<SectionFallback />}>
              <div className="max-w-4xl mx-auto">
                <CountyChoropleth highlightCounty="Wayne" />
              </div>
            </Suspense>

            {/* County Comparison */}
            <div id="county-compare">
              <Suspense fallback={<SectionFallback />}>
                <CountyCompare />
              </Suspense>
            </div>

            {/* CTA: Full Compare Tool */}
            <div className="rounded-xl border border-primary/20 bg-primary/[0.04] p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1 space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  Want the full comparison experience?
                </p>
                <p className="text-xs text-muted-foreground">
                  The Compare Counties tool adds Civic Insight scores, equity
                  lens, community voice ratings, insurance breakdown, and PDF
                  export - for up to 4 counties at once.
                </p>
              </div>
              <Link
                to="/compare"
                className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Open Compare Tool
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>

            {/* CSV Export */}
            <Suspense fallback={<SectionFallback />}>
              <CSVExportPanel />
            </Suspense>
          </TabsContent>

          {/* Tab 2: Equity */}
          <TabsContent value="equity" className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Health Equity Metrics
              </h2>
              <p className="text-muted-foreground mb-6">
                Michigan residents face different barriers to health based on
                geography, income, race, and other factors.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {equityInsights.map((insight, i) => (
                <motion.div
                  key={insight.title}
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  custom={i}
                >
                  <EquityInsightCard
                    {...insight}
                    ctaText={false as any}
                    ctaHref={undefined}
                  />
                </motion.div>
              ))}
            </div>
            <Card className="border-michigan-navy/20 bg-michigan-navy/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lock className="h-5 w-5" /> Data Methodology
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Equity metrics are calculated from publicly available sources
                  including CDC Social Vulnerability Index (SVI), Census Bureau
                  ACS, and HRSA data.
                </p>
                <Link
                  to="/data-validation"
                  className="text-primary font-medium hover:underline inline-flex items-center gap-1"
                >
                  Full methodology →
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Open Data */}
          <TabsContent value="data" className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Open Datasets
              </h2>
              <p className="text-muted-foreground mb-6">
                Download datasets or access APIs to integrate Michigan health
                data into your work.
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              {datasets.map((dataset, i) => (
                <motion.div
                  key={dataset.id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  custom={i}
                >
                  <Card className="h-full hover:shadow-lg transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="text-base">
                          {dataset.name}
                        </CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {dataset.updated}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        {dataset.description}
                      </p>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">
                            {dataset.records}
                          </span>
                          <span className="text-muted-foreground">records</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {dataset.formats.map((fmt) => (
                            <Badge
                              key={fmt}
                              variant="secondary"
                              className="text-[10px]"
                            >
                              {fmt}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <a
                          href={dataset.link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5"
                          >
                            <Download className="h-3.5 w-3.5" /> Download
                          </Button>
                        </a>
                        <Link to="/technical">
                          <Button size="sm" variant="ghost" className="gap-1.5">
                            <Code className="h-3.5 w-3.5" /> Docs
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Tab 4: For Analysts & Journalists */}
          <TabsContent value="analysts" className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                For Analysts & Journalists
              </h2>
              <p className="text-muted-foreground mb-6">
                Use Access Michigan data in your reporting, research, or policy
                work.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    What Data Is Available
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Database className="h-4 w-4 text-primary shrink-0 mt-0.5" />{" "}
                      <span>
                        <strong>Health indicators</strong> - uninsured rate,
                        life expectancy, ER visits, primary care ratios for all
                        83 counties
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="h-4 w-4 text-michigan-coral shrink-0 mt-0.5" />{" "}
                      <span>
                        <strong>Equity metrics</strong> - infant mortality
                        disparities, rural vs. urban gaps, shortage area
                        designations
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-michigan-teal shrink-0 mt-0.5" />{" "}
                      <span>
                        <strong>Facility data</strong> - hospitals, clinics,
                        FQHCs, provider counts by county and specialty
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-michigan-gold shrink-0 mt-0.5" />{" "}
                      <span>
                        <strong>Community programs</strong>:{" "}
                        {RESOURCE_COUNT_DISPLAY} verified resources across 10+
                        categories
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Data Freshness & Updates
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <ul className="space-y-2">
                    <li>
                      <strong>Provider data (NPPES):</strong> Updated monthly
                      from CMS
                    </li>
                    <li>
                      <strong>County health indicators:</strong> Annual (County
                      Health Rankings)
                    </li>
                    <li>
                      <strong>Social vulnerability:</strong> Every 4 years (CDC
                      SVI)
                    </li>
                    <li>
                      <strong>Air quality:</strong> Real-time (EPA AirNow)
                    </li>
                    <li>
                      <strong>Community programs:</strong> Verified quarterly by
                      Access Michigan
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">How to Cite</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    When using data from Access Michigan, please cite both the
                    original source and Access Michigan:
                  </p>
                  <div className="bg-muted rounded-md p-3 font-mono text-xs">
                    "Access Michigan (2026). [Dataset Name]. Data originally
                    sourced from [CMS/HRSA/CDC/MDHHS]. Retrieved from
                    https://accessmi.org/data-and-insights"
                  </div>
                  <p>
                    Access Michigan is an independent civic project. We are not
                    affiliated with MDHHS, Michigan 2-1-1, or any government
                    agency. We organize and present publicly available data to
                    help residents and professionals.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to="/data-validation">
                <Button variant="outline" className="gap-2">
                  <FileText className="h-4 w-4" /> Methodology & Sources
                </Button>
              </Link>
              <Link to="/technical">
                <Button variant="outline" className="gap-2">
                  <Code className="h-4 w-4" /> Technical Documentation
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="ghost" className="gap-2">
                  <ExternalLink className="h-4 w-4" /> Contact for Custom
                  Requests
                </Button>
              </Link>
            </div>
          </TabsContent>
        </Tabs>

        <Separator className="my-10" />

        {/* ── Export Downloads ── */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">
            Export & Download
          </h2>
          <p className="text-sm text-muted-foreground">
            Direct links to official CSV and data downloads from authoritative
            sources. Files open in a new tab - no processing by Access Michigan.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "SVI 2022 - County & Tract Scores",
                desc: "CDC/ATSDR Social Vulnerability Index for Michigan, all census tracts and counties.",
                url: "https://www.atsdr.cdc.gov/placeandhealth/svi/data_documentation_download.html",
              },
              {
                name: "United For ALICE - Michigan County Table",
                desc: "ALICE threshold data, household survival budget, and county-level reports.",
                url: "https://www.unitedforalice.org/county-reports/Michigan",
              },
              {
                name: "County Health Rankings - Michigan",
                desc: "Health outcomes, behaviors, clinical care, and social factors for all 83 counties.",
                url: "https://www.countyhealthrankings.org/explore-health-rankings/michigan/data-and-resources",
              },
              {
                name: "MDHHS Open Data Portal",
                desc: "Michigan Department of Health and Human Services datasets and reports.",
                url: "https://www.michigan.gov/mdhhs/keep-mi-healthy/data-and-reports",
              },
              {
                name: "CMS Provider Data Downloads",
                desc: "Hospital compare, physician compare, and Medicare utilization data.",
                url: "https://data.cms.gov/provider-data/",
              },
              {
                name: "Census ACS Data",
                desc: "American Community Survey 5-year estimates - demographics, housing, economic data.",
                url: "https://data.census.gov/",
              },
            ].map((item) => (
              <a
                key={item.name}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg border border-border p-4 hover:bg-muted/50 hover:border-primary/20 transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                    {item.name}
                  </h3>
                  <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0 mt-0.5" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {item.desc}
                </p>
              </a>
            ))}
          </div>
        </section>

        <Separator className="my-10" />

        {/* ── Civic Data Hub CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-xl border border-primary/20 bg-primary/5 p-8 text-center space-y-4"
        >
          <Database className="h-8 w-8 text-primary mx-auto" />
          <h2 className="text-xl font-bold text-foreground">
            Explore Michigan's Open Civic Data
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm">
            Browse verified datasets from ArcGIS, Socrata, and state agencies -
            covering transportation, environment, housing, health, and public
            safety.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/civic-data-hub">
              <Button className="gap-1.5">
                <Database className="h-4 w-4" /> Civic Data Hub
              </Button>
            </Link>
            <Link to="/civic-data">
              <Button variant="outline" className="gap-1.5">
                Open Government Hub
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* ── Bottom CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-xl bg-michigan-navy/5 border border-michigan-navy/20 p-8 text-center space-y-4"
        >
          <h2 className="text-2xl font-bold text-foreground">
            Questions about the data?
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Contact us for custom data requests, methodology questions, or to
            report an issue.
          </p>
          <Link to="/contact">
            <Button
              size="lg"
              className="bg-michigan-navy hover:bg-michigan-navy/90"
            >
              Get in Touch
            </Button>
          </Link>
        </motion.div>

        <DataProvenance
          source="CMS, HRSA, CDC, MDHHS, Census ACS"
          updated="2026-02-23"
          methodologyHref="/data-validation"
          className="mt-8"
        />
      </div>
    </Layout>
  );
}
