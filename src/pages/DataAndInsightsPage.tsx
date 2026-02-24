import { useState } from "react";
import { motion } from "framer-motion";
import { usePageMeta } from "@/hooks/usePageMeta";
import {
  Database, BarChart3, Heart, Users, AlertCircle, Download,
  ExternalLink, Code, Lock, MapPin
} from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EquityInsightCard } from "@/components/shared/EquityInsightCard";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.35 } }),
};

const datasets = [
  {
    id: "cms-facilities",
    name: "CMS Healthcare Facilities",
    description: "Hospitals, clinics, and health centers across Michigan from the Centers for Medicare & Medicaid Services.",
    records: "2,847 facilities",
    updated: "Monthly",
    formats: ["JSON", "CSV", "GeoJSON"],
    apiEndpoint: "/api/facilities",
    link: "https://data.cms.gov/",
  },
  {
    id: "hrsa-fqhc",
    name: "HRSA Federally Qualified Health Centers",
    description: "Community health centers and primary care providers eligible for federal funding programs.",
    records: "1,203 centers",
    updated: "Quarterly",
    formats: ["CSV", "JSON"],
    apiEndpoint: "/api/fqhc",
    link: "https://findahealthcenter.hrsa.gov/",
  },
  {
    id: "cdc-svi",
    name: "CDC Social Vulnerability Index",
    description: "Census tract-level vulnerability data including income, education, housing, and demographics.",
    records: "All Michigan tracts",
    updated: "Every 4 years",
    formats: ["GIS Shapefiles", "CSV"],
    apiEndpoint: "/api/svi",
    link: "https://www.atsdr.cdc.gov/placeandhealth/svi/",
  },
  {
    id: "hrsa-hpsa",
    name: "HRSA Health Professional Shortage Areas",
    description: "Designated areas with insufficient primary care, mental health, or dental providers.",
    records: "23 HPSA counties",
    updated: "Annually",
    formats: ["GeoJSON", "CSV"],
    apiEndpoint: "/api/hpsa",
    link: "https://data.hrsa.gov/",
  },
];

const equityInsights = [
  {
    icon: Heart,
    title: "Black Infant Mortality",
    stat: "2.4x higher",
    description: "Black infants in Michigan face 2.4 times higher mortality rates than white infants.",
    color: "coral" as const,
    trend: "up" as const,
  },
  {
    icon: Users,
    title: "Rural Uninsured Rate",
    stat: "14%",
    description: "Rural Michiganders are twice as likely to be uninsured as urban residents.",
    color: "gold" as const,
    trend: "stable" as const,
  },
  {
    icon: AlertCircle,
    title: "Primary Care Shortage",
    stat: "23 counties",
    description: "Nearly a third of Michigan counties lack adequate primary care providers.",
    color: "teal" as const,
    trend: "down" as const,
  },
];

export default function DataAndInsightsPage() {
  usePageMeta({
    title: "Data & Insights — Health Equity Dashboards & Open Data",
    description:
      "Real-time health equity dashboards, facility data, and open APIs for researchers, health systems, and civic organizations.",
    path: "/data-and-insights",
    jsonLd: {
      "@type": "DataCatalog",
      "name": "Access Michigan Data & Insights",
      "description": "Health equity dashboards and open data for Michigan",
      "url": "https://accessmi.org/data-and-insights",
      "provider": { "@type": "Organization", "name": "Access Michigan" },
    },
  });

  const [activeTab, setActiveTab] = useState("dashboards");

  return (
    <Layout>
      <Breadcrumbs items={[{ label: "Data & Insights" }]} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-michigan-navy/10 via-primary/5 to-background py-16 md:py-24">
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <h1 className="text-4xl font-bold text-foreground md:text-5xl mb-4">
              Data & Insights
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Real-time dashboards, equity metrics, and open data APIs for health professionals, researchers, and civic organizations working to improve health access in Michigan.
            </p>
            <div className="flex flex-wrap gap-3">
              <Badge className="bg-michigan-navy text-white">Real-time Data</Badge>
              <Badge variant="outline">Free & Open</Badge>
              <Badge variant="outline">No API Key Required</Badge>
            </div>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-[0.03]" aria-hidden="true">
          <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-primary blur-3xl" />
        </div>
      </section>

      <div className="container py-12">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="dashboards" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboards</span>
            </TabsTrigger>
            <TabsTrigger value="equity" className="gap-2">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Equity</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-2">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Open Data</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Dashboards */}
          <TabsContent value="dashboards" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Health Data Dashboards</h2>
                <p className="text-muted-foreground mb-6">
                  Explore real-time metrics on facility capacity, provider availability, and community health outcomes by county and region.
                </p>
              </div>

              {/* Placeholder for HealthDataSnapshot */}
              <Card className="border-2 border-dashed border-muted">
                <CardContent className="py-12 text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">Health Data Dashboard</h3>
                  <p className="text-sm text-muted-foreground">
                    Interactive charts showing facility types, provider ratios, and health outcomes by Michigan county.
                  </p>
                </CardContent>
              </Card>

              {/* Placeholder for RegionalGateway */}
              <Card className="border-2 border-dashed border-muted">
                <CardContent className="py-12 text-center">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">Regional Overview</h3>
                  <p className="text-sm text-muted-foreground">
                    Compare health metrics across regions (SE Michigan, UP, etc.) and drill down to individual counties.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Tab 2: Equity Data */}
          <TabsContent value="equity" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Health Equity Metrics</h2>
                <p className="text-muted-foreground mb-6">
                  Michigan residents face different barriers to health based on geography, income, race, and other factors. These metrics highlight disparities that demand action.
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
                      icon={insight.icon}
                      title={insight.title}
                      stat={insight.stat}
                      description={insight.description}
                      color={insight.color}
                      trend={insight.trend}
                      ctaText={false as any}
                      ctaHref={undefined}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Methodology */}
              <Card className="border-michigan-navy/20 bg-michigan-navy/5">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Data Methodology
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    Equity metrics are calculated from publicly available sources including CDC Social Vulnerability Index (SVI), Census Bureau ACS, and HRSA data.
                  </p>
                  <p>
                    We weight results by social vulnerability to ensure insights reach the communities most affected by health disparities.
                  </p>
                  <Link to="/about" className="text-primary font-medium hover:underline inline-flex items-center gap-1">
                    Full methodology →
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Tab 3: Open Data */}
          <TabsContent value="data" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Open Datasets & APIs</h2>
                <p className="text-muted-foreground mb-6">
                  Download datasets or use our APIs to integrate real-time health data into your applications, research, or dashboards.
                </p>
              </div>

              {/* Datasets Grid */}
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
                    <Card className="h-full border-michigan-navy/10 hover:shadow-lg transition-all">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <CardTitle className="text-base">{dataset.name}</CardTitle>
                          <Badge variant="outline" className="text-xs">
                            {dataset.updated}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">{dataset.description}</p>

                        {/* Metadata */}
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{dataset.records}</span>
                            <span className="text-muted-foreground">records</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {dataset.formats.map((fmt) => (
                              <Badge key={fmt} variant="secondary" className="text-[10px]">
                                {fmt}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* API Endpoint */}
                        <div className="bg-muted/50 rounded-md p-3 font-mono text-xs text-foreground/70 break-all">
                          {dataset.apiEndpoint}
                        </div>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row gap-2 pt-2">
                          <a href={dataset.link} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" className="w-full sm:w-auto gap-1.5">
                              <Download className="h-3.5 w-3.5" />
                              Download
                            </Button>
                          </a>
                          <Link to="/technical">
                            <Button size="sm" variant="ghost" className="w-full sm:w-auto gap-1.5">
                              <Code className="h-3.5 w-3.5" />
                              API Docs
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* API Documentation CTA */}
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Developer Documentation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Full API documentation, authentication, rate limits, and code examples are available on our technical documentation site.
                  </p>
                  <Link to="/technical">
                    <Button className="gap-2">
                      <ExternalLink className="h-4 w-4" />
                      View API Documentation
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Privacy & Attribution */}
              <Card className="border-michigan-navy/20 bg-michigan-navy/5">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Privacy & Attribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    All data comes from publicly available sources. We do not collect personal data or track API usage.
                  </p>
                  <p>
                    When using our datasets, please attribute to the original source (CMS, HRSA, CDC) and to Access Michigan.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 rounded-xl bg-michigan-navy/5 border border-michigan-navy/20 p-8 text-center space-y-4"
        >
          <h2 className="text-2xl font-bold text-foreground">Have questions?</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Contact our team for API access, custom data requests, or partnership opportunities.
          </p>
          <Link to="/partnerships">
            <Button size="lg" className="bg-michigan-navy hover:bg-michigan-navy/90">
              Get in Touch
            </Button>
          </Link>
        </motion.div>
      </div>
    </Layout>
  );
}
