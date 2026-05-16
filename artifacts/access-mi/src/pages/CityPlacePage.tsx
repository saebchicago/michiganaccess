import { useMemo } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin, Heart, Stethoscope, Building2, Phone,
  Activity, Shield, Code, Copy, BarChart3,
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
import LocalInsightEngine from "@/components/place/LocalInsightEngine";
import DomainJumpNav from "@/components/place/DomainJumpNav";
import ReportIssue from "@/components/shared/ReportIssue";
import CommunitySummary from "@/components/place/CommunitySummary";
import LifeSituationNav from "@/components/place/LifeSituationNav";
import DataLimitationsNote from "@/components/place/DataLimitationsNote";
import { resolvePlace, buildPlaceBreadcrumbs } from "@/models/Place";
import MichiganCommunityBrief, { buildBriefMetaDescription } from "@/components/place/MichiganCommunityBrief";
import { toast } from "@/hooks/use-toast";
import LiveEnvironmentalCard from "@/components/environment/LiveEnvironmentalCard";
import UniversalPreScreener from "@/components/benefits/UniversalPreScreener";
import ContactRepresentative from "@/components/advocacy/ContactRepresentative";
import DownloadLocalInsights from "@/components/place/DownloadLocalInsights";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.35 } }),
};

export default function CityPlacePage() {
  const { cityName } = useParams<{ cityName: string }>();

  const place = useMemo(() => cityName ? resolvePlace({ type: "city", cityName }) : null, [cityName]);

  usePageMeta({
    title: place ? `${place.name} Community Brief — Access Michigan` : "City Not Found",
    description: place
      ? buildBriefMetaDescription(place)
      : "City not found",
    path: `/place/city/${cityName || ""}`,
  });

  if (!place) return <Navigate to="/404" replace />;

  const embedCode = `<iframe src="${window.location.origin}/embed?county=${encodeURIComponent(place.parentCounty || "")}" width="100%" height="400" frameborder="0" title="${place.name} Health Profile"></iframe>`;

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    toast({ title: "Embed code copied", description: "Paste this into any webpage to embed this local profile." });
  };

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
              <Badge variant="outline" className="text-xs">{place.parentCounty} County</Badge>
              <Badge variant="secondary" className="text-xs capitalize">{place.countyProfile.countyType}</Badge>
              <Badge variant="outline" className="text-xs bg-michigan-gold/10 text-michigan-gold border-michigan-gold/30">
                {place.confidence === "moderate" ? "County Avg" : "Estimated"}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold text-foreground md:text-4xl lg:text-5xl mb-3">
              {place.name}, Michigan
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Part of {place.parentCounty} County · Population {place.countyProfile.population.toLocaleString()} (county)
            </p>

            <div className="flex flex-wrap gap-3">
              <Link to={`/find-care?county=${place.parentCounty}&scope=facilities`}>
                <Button className="gap-2"><Stethoscope className="h-4 w-4" /> Find Care Here</Button>
              </Link>
              <Link to={`/place/${countyToSlug(place.parentCounty!)}-county`}>
                <Button variant="outline" className="gap-2"><Building2 className="h-4 w-4" /> County Profile</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container py-10 space-y-10">
        {/* Michigan Community Brief */}
        <MichiganCommunityBrief place={place} />

        <Separator />

        {/* Community Summary */}
        <CommunitySummary place={place} />

        {/* Life Situations */}
        <LifeSituationNav place={place} />

        <Separator />

        {/* Domain Indicators */}
        <div id="indicators">
          <LocalInsightEngine place={place} />
        </div>

        <Separator />

        {/* Quick Links */}
        <section id="programs">
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Heart className="h-5 w-5 text-michigan-coral" /> Help Available Near {place.name}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Find a Doctor or Clinic", desc: `Search providers near ${place.name}`, href: `/find-care?county=${place.parentCounty}&scope=facilities`, icon: Stethoscope },
              { title: "Community Resources", desc: `Food, housing, transport & more in ${place.parentCounty} County`, href: `/resources?county=${place.parentCounty}`, icon: Heart },
              { title: "Financial Help", desc: "Medicaid, SNAP, LIHEAP & more", href: "/financial-help", icon: Activity },
            ].map((prog, i) => (
              <motion.div key={prog.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
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
              </motion.div>
            ))}
          </div>
        </section>

        <Separator />

        {/* Environmental Intelligence */}
        <LiveEnvironmentalCard city={place.city} county={place.parentCounty} />

        {/* Benefits Pre-Screener */}
        <UniversalPreScreener />

        {/* One-Click Advocacy */}
        <ContactRepresentative place={place} />

        {/* Download Insights */}
        <DownloadLocalInsights place={place} />

        <Separator />

        {/* Trust & Transparency */}
        <DataLimitationsNote place={place} />

        {/* Embed + Analysts */}
        <section id="analysts" className="rounded-xl border border-border bg-muted/30 p-6 md:p-8">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" /> Embed This Local Profile
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Journalists, nonprofits, and government agencies can embed {place.name}'s health snapshot on any website.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" className="gap-2" onClick={handleCopyEmbed}>
              <Copy className="h-3.5 w-3.5" /> Copy Embed Code
            </Button>
            <Link to={`/county/${countyToSlug(place.parentCounty!)}`}>
              <Button variant="outline" size="sm" className="gap-2">
                <BarChart3 className="h-3.5 w-3.5" /> Full County Data
              </Button>
            </Link>
          </div>
        </section>

        <ReportIssue variant="inline" />

        {/* Independence */}
        <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
          <p className="text-xs text-muted-foreground text-center">
            <Shield className="inline h-3 w-3 mr-1" />
            Access Michigan is an <strong>independent civic project</strong>. We are not affiliated with Michigan 2-1-1, MDHHS, or any health system.
            For live help, call <a href="tel:211" className="font-semibold text-primary hover:underline">2-1-1</a>.
          </p>
        </div>

        <DataProvenance
          source="County Health Rankings, Census ACS, MDHHS, DOE LEAD, FCC — county-level averages for city context"
          updated="2025"
          methodologyHref="/data-validation"
        />
      </div>
    </Layout>
  );
}
