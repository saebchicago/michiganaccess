import { useMemo } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin, Heart, AlertTriangle, Users, Stethoscope, Building2,
  Download, ExternalLink, Phone, TrendingUp, TrendingDown, Minus,
  Activity, Shield, ArrowRight, BarChart3, FileText
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { usePageMeta } from "@/hooks/usePageMeta";
import { getCountyProfile, COUNTY_PROFILES } from "@/data/michigan-county-profiles";
import { getRegionForCounty } from "@/data/michigan-regions";
import { countyToSlug } from "@/utils/countyUtils";
import DataProvenance from "@/components/shared/DataProvenance";

/* ── Helpers ── */
function slugToCountyName(slug: string): string | null {
  // Try exact match first
  for (const name of Object.keys(COUNTY_PROFILES)) {
    if (countyToSlug(name) === slug) return name;
  }
  // Try case-insensitive
  const lower = slug.replace(/-/g, " ").toLowerCase();
  for (const name of Object.keys(COUNTY_PROFILES)) {
    if (name.toLowerCase() === lower) return name;
  }
  return null;
}

const TrendIcon = ({ trend }: { trend?: "up" | "down" | "stable" }) => {
  if (trend === "up") return <TrendingUp className="h-3.5 w-3.5 text-destructive" />;
  if (trend === "down") return <TrendingDown className="h-3.5 w-3.5 text-michigan-forest" />;
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.35 } }),
};

/* ── Curated statewide programs relevant to any county ── */
const TOP_PROGRAMS = [
  { title: "Healthy Michigan Plan (Medicaid)", desc: "Free or low-cost health coverage for adults 19–64 with income up to 138% FPL.", href: "/financial-help", icon: Shield },
  { title: "SNAP Food Assistance", desc: "Monthly benefits for groceries. Apply through MDHHS.", href: "https://www.michigan.gov/mdhhs/assistance-programs/food", icon: Heart },
  { title: "LIHEAP Heating Assistance", desc: "Help paying heating bills for income-eligible households.", href: "/environment", icon: Activity },
  { title: "Michigan 2-1-1", desc: "Free, confidential referrals for housing, food, transportation, and more — 24/7.", href: "tel:211", icon: Phone },
  { title: "WIC Nutrition Program", desc: "Free nutrition support for pregnant women, new moms, and children under 5.", href: "https://www.michigan.gov/mdhhs/assistance-programs/wic", icon: Users },
  { title: "Find a Doctor or Clinic", desc: "Search providers by specialty, location, or NPI across Michigan.", href: "/find-care", icon: Stethoscope },
];

/* ── State Averages for benchmarking ── */
const STATE_AVG = { uninsured: 6.5, pcRatio: 1290, foodInsecurity: 13.0 };

function parseRate(val: string): number {
  const m = val.match(/([\d.]+)/);
  return m ? parseFloat(m[1]) : 0;
}

function parseRatio(val: string): number {
  const m = val.match(/([\d,]+)/);
  return m ? parseFloat(m[1].replace(",", "")) : 0;
}

export default function PlacePage() {
  const { slug } = useParams<{ slug: string }>();
  const countyName = slug ? slugToCountyName(slug) : null;
  const profile = countyName ? getCountyProfile(countyName) : null;
  const region = countyName ? getRegionForCounty(countyName) : null;

  usePageMeta({
    title: countyName ? `${countyName} County, Michigan — Health & Services` : "Place Not Found",
    description: countyName && profile
      ? `Health indicators, community programs, and local services for ${countyName} County, Michigan. Population: ${profile.population.toLocaleString()}.`
      : "Place not found",
    path: `/place/${slug || ""}`,
  });

  // If not a valid county, redirect to 404
  if (!countyName || !profile) {
    return <Navigate to="/404" replace />;
  }

  // Parse metrics for comparison
  const metrics = useMemo(() => {
    const hh = profile.healthHighlights;
    const uninsured = parseRate(hh[0]?.value || "6.5%");
    const pcRatio = parseRatio(hh[1]?.value || "1,290:1");
    const foodInsecurity = parseRate(hh[2]?.value || "13%");
    return { uninsured, pcRatio, foodInsecurity };
  }, [profile]);

  // Generate "What stands out" insight
  const standoutInsight = useMemo(() => {
    const insights: string[] = [];
    if (metrics.uninsured > STATE_AVG.uninsured + 2) insights.push(`Higher uninsured rate (${metrics.uninsured}%) than state average (${STATE_AVG.uninsured}%)`);
    else if (metrics.uninsured < STATE_AVG.uninsured - 1) insights.push(`Lower uninsured rate (${metrics.uninsured}%) than state average (${STATE_AVG.uninsured}%)`);
    if (metrics.pcRatio > 3000) insights.push("Primary care provider shortage area");
    if (metrics.foodInsecurity > 15) insights.push(`Higher food insecurity (${metrics.foodInsecurity}%) than state average`);
    if (insights.length === 0) insights.push("Health indicators are near or better than state average");
    return insights;
  }, [metrics]);

  return (
    <Layout>
      <Breadcrumbs items={[
        { label: "Regions", href: "/regions" },
        ...(region ? [{ label: region.name, href: `/region/${region.id}` }] : []),
        { label: `${countyName} County` },
      ]} />

      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-primary/8 via-background to-accent/5 py-12 md:py-16">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-5 w-5 text-primary" />
              {region && <Badge variant="outline" className="text-xs">{region.name}</Badge>}
              <Badge variant="secondary" className="text-xs capitalize">{profile.countyType}</Badge>
            </div>
            <h1 className="text-3xl font-bold text-foreground md:text-4xl lg:text-5xl mb-3">
              {countyName} County
            </h1>
            <p className="text-lg text-muted-foreground mb-4">
              Population {profile.population.toLocaleString()} · {profile.majorCities.slice(0, 4).join(", ")}
            </p>

            {/* Standout insight */}
            <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 mb-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1.5 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" /> What stands out here
              </p>
              <ul className="space-y-1">
                {standoutInsight.map((s) => (
                  <li key={s} className="text-sm text-foreground">{s}</li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to={`/find-care?county=${countyName}&scope=facilities`}>
                <Button className="gap-2"><Stethoscope className="h-4 w-4" /> Find Care Here</Button>
              </Link>
              <Link to={`/county/${countyToSlug(countyName)}`}>
                <Button variant="outline" className="gap-2"><Building2 className="h-4 w-4" /> Full County Profile</Button>
              </Link>
              <Link to="/data-and-insights">
                <Button variant="outline" className="gap-2"><BarChart3 className="h-4 w-4" /> Data Hub</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container py-10 space-y-12">
        {/* ── Key Indicators ── */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" /> Key Health Indicators
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profile.healthHighlights.map((h, i) => {
              let comparison = "";
              if (h.label.toLowerCase().includes("uninsured")) {
                const val = parseRate(h.value);
                const diff = val - STATE_AVG.uninsured;
                comparison = diff > 0 ? `+${diff.toFixed(1)}pp vs state avg` : `${diff.toFixed(1)}pp vs state avg`;
              }
              return (
                <motion.div key={h.label} initial="hidden" animate="visible" variants={fadeUp} custom={i}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="py-5">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h.label}</p>
                        <TrendIcon trend={h.trend} />
                      </div>
                      <p className="text-2xl font-bold text-foreground">{h.value}</p>
                      {comparison && (
                        <p className="text-xs text-muted-foreground mt-1">{comparison}</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </section>

        <Separator />

        {/* ── Top Programs ── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Heart className="h-5 w-5 text-michigan-coral" /> Top Programs for Residents
            </h2>
            <Link to="/resources" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
              Browse all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {TOP_PROGRAMS.map((prog, i) => (
              <motion.div key={prog.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                {prog.href.startsWith("http") || prog.href.startsWith("tel:") ? (
                  <a href={prog.href} target={prog.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
                    <Card className="h-full hover:shadow-md hover:border-primary/20 transition-all cursor-pointer group">
                      <CardContent className="py-5 space-y-2">
                        <div className="flex items-center gap-2">
                          <prog.icon className="h-4 w-4 text-primary shrink-0" />
                          <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{prog.title}</h3>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{prog.desc}</p>
                      </CardContent>
                    </Card>
                  </a>
                ) : (
                  <Link to={prog.href}>
                    <Card className="h-full hover:shadow-md hover:border-primary/20 transition-all cursor-pointer group">
                      <CardContent className="py-5 space-y-2">
                        <div className="flex items-center gap-2">
                          <prog.icon className="h-4 w-4 text-primary shrink-0" />
                          <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{prog.title}</h3>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{prog.desc}</p>
                      </CardContent>
                    </Card>
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        <Separator />

        {/* ── Local Logistics ── */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-michigan-navy" /> Local Resources & Contacts
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardContent className="py-5 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Region</p>
                <p className="text-sm font-medium text-foreground">{region?.name || "Michigan"}</p>
                {region && (
                  <Link to={`/region/${region.id}`} className="text-xs text-primary hover:underline flex items-center gap-1">
                    View region details <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-5 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">For Live Help</p>
                <p className="text-sm text-foreground">
                  Call <a href="tel:211" className="font-bold text-primary hover:underline">2-1-1</a> — free, confidential referrals 24/7
                </p>
                <p className="text-xs text-muted-foreground">Michigan 2-1-1 is a public resource, not affiliated with Access Michigan.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-5 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">MDHHS Office</p>
                <a
                  href={`https://www.michigan.gov/mdhhs/doing-business/providers/county-contacts`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  Find your local MDHHS office <ExternalLink className="h-3 w-3" />
                </a>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* ── For Professionals ── */}
        <section className="rounded-xl border border-border bg-muted/30 p-6 md:p-8">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-michigan-navy" /> For Analysts & Professionals
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Download data, compare counties, or embed visualizations for grant applications and reports.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to={`/county/${countyToSlug(countyName)}`}>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-3.5 w-3.5" /> Full County Profile
              </Button>
            </Link>
            <Link to="/data-and-insights">
              <Button variant="outline" size="sm" className="gap-2">
                <BarChart3 className="h-3.5 w-3.5" /> Dashboards & Data
              </Button>
            </Link>
            <Link to="/data-validation">
              <Button variant="ghost" size="sm" className="gap-2">
                <ExternalLink className="h-3.5 w-3.5" /> Methodology
              </Button>
            </Link>
          </div>
        </section>

        {/* ── Future Panels (scaffolded) ── */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" /> Coming Soon
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="border-dashed">
              <CardContent className="py-6 text-center text-muted-foreground">
                <p className="text-sm font-medium">Trends Over Time</p>
                <p className="text-xs mt-1">Historical health indicator trends for {countyName} County</p>
              </CardContent>
            </Card>
            <Card className="border-dashed">
              <CardContent className="py-6 text-center text-muted-foreground">
                <p className="text-sm font-medium">Provider Capacity</p>
                <p className="text-xs mt-1">Real-time provider availability and wait times</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <DataProvenance
          source="County Health Rankings, Census ACS, MDHHS, HRSA"
          updated="2026-02-23"
          methodologyHref="/data-validation"
        />
      </div>
    </Layout>
  );
}
