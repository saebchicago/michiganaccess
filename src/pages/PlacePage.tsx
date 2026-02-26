import { useMemo } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin, Heart, Stethoscope, Building2,
  Download, ExternalLink, Phone, Activity, Shield, ArrowRight, BarChart3, FileText,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { usePageMeta } from "@/hooks/usePageMeta";
import { countyToSlug } from "@/utils/countyUtils";
import DataProvenance from "@/components/shared/DataProvenance";
import DiveDeeperSearch from "@/components/place/DiveDeeperSearch";
import LocalInsightEngine from "@/components/place/LocalInsightEngine";
import DomainJumpNav from "@/components/place/DomainJumpNav";
import ReportIssue from "@/components/shared/ReportIssue";
import CommunitySummary from "@/components/place/CommunitySummary";
import LifeSituationNav from "@/components/place/LifeSituationNav";
import DataLimitationsNote from "@/components/place/DataLimitationsNote";
import { resolvePlace, buildPlaceBreadcrumbs } from "@/models/Place";

/* ── Curated statewide programs ── */
const TOP_PROGRAMS = [
  { title: "Healthy Michigan Plan (Medicaid)", desc: "Free or low-cost health coverage for adults 19–64 with income up to 138% FPL.", href: "/financial-help", icon: Shield },
  { title: "SNAP Food Assistance", desc: "Monthly benefits for groceries. Apply through MDHHS.", href: "https://www.michigan.gov/mdhhs/assistance-programs/food", icon: Heart },
  { title: "LIHEAP Heating Assistance", desc: "Help paying heating bills for income-eligible households.", href: "/environment", icon: Activity },
  { title: "Michigan 2-1-1", desc: "Free, confidential referrals for housing, food, transportation, and more — 24/7.", href: "tel:211", icon: Phone },
  { title: "WIC Nutrition Program", desc: "Free nutrition support for pregnant women, new moms, and children under 5.", href: "https://www.michigan.gov/mdhhs/assistance-programs/wic", icon: Heart },
  { title: "Find a Doctor or Clinic", desc: "Search providers by specialty, location, or NPI across Michigan.", href: "/find-care", icon: Stethoscope },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.35 } }),
};

export default function PlacePage() {
  const { slug } = useParams<{ slug: string }>();

  const place = useMemo(() => slug ? resolvePlace({ type: "county", slug }) : null, [slug]);

  usePageMeta({
    title: place ? `${place.name}, Michigan — Health & Services` : "Place Not Found",
    description: place
      ? `Health indicators, community programs, and local services for ${place.name}, Michigan. Population: ${place.countyProfile.population.toLocaleString()}.`
      : "Place not found",
    path: `/place/${slug || ""}`,
  });

  if (!place) return <Navigate to="/404" replace />;

  const countyName = place.parentCounty!;
  const profile = place.countyProfile;

  return (
    <Layout>
      <Breadcrumbs items={buildPlaceBreadcrumbs(place)} />
      <DomainJumpNav />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/8 via-background to-accent/5 py-12 md:py-16">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-5 w-5 text-primary" />
              {place.region && <Badge variant="outline" className="text-xs">{place.region.name}</Badge>}
              <Badge variant="secondary" className="text-xs capitalize">{profile.countyType}</Badge>
              <Badge variant="outline" className="text-xs bg-primary/5 text-primary">{place.geoGrainLabel}</Badge>
            </div>
            <h1 className="text-3xl font-bold text-foreground md:text-4xl lg:text-5xl mb-3">
              {place.name}
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Population {profile.population.toLocaleString()} · {profile.majorCities.slice(0, 4).join(", ")}
            </p>

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

      <div className="container py-10 space-y-10">
        {/* 1. Community Summary — "3 Things to Know" */}
        <CommunitySummary place={place} />

        {/* 2. Life Situations */}
        <LifeSituationNav place={place} />

        <Separator />

        {/* 3. Domain Indicators + What Stands Out + Actions */}
        <div id="indicators">
          <LocalInsightEngine place={place} />
        </div>

        <Separator />

        {/* 4. Top Programs */}
        <section id="programs">
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

        {/* 5. Local Resources */}
        <section id="resources">
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-michigan-navy" /> Local Resources & Contacts
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardContent className="py-5 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Region</p>
                <p className="text-sm font-medium text-foreground">{place.region?.name || "Michigan"}</p>
                {place.region && (
                  <Link to={`/region/${place.region.id}`} className="text-xs text-primary hover:underline flex items-center gap-1">
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
                  href="https://www.michigan.gov/mdhhs/doing-business/providers/county-contacts"
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

        {/* 6. Trust & Transparency */}
        <DataLimitationsNote place={place} />

        {/* 7. For Professionals */}
        <section id="analysts" className="rounded-xl border border-border bg-muted/30 p-6 md:p-8">
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

        {/* 8. Dive Deeper */}
        <DiveDeeperSearch countyName={countyName} />

        {/* 9. Report Issue */}
        <ReportIssue variant="inline" />

        {/* Independence Disclaimer */}
        <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
          <p className="text-xs text-muted-foreground text-center">
            <Shield className="inline h-3 w-3 mr-1" />
            Access Michigan is an <strong>independent civic project</strong>. We are not affiliated with Michigan 2-1-1, MDHHS, or any health system.
            For live help, call <a href="tel:211" className="font-semibold text-primary hover:underline">2-1-1</a>.
          </p>
        </div>

        <DataProvenance
          source="County Health Rankings, Census ACS, MDHHS, HRSA, DOE LEAD, FCC"
          updated="2025"
          methodologyHref="/data-validation"
        />
      </div>
    </Layout>
  );
}
