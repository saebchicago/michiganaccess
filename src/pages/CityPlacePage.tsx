import { useMemo } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin, Heart, Stethoscope, Building2, ExternalLink, Phone,
  Activity, Shield, ArrowRight, BarChart3, FileText, Code, Copy, Share2,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { usePageMeta } from "@/hooks/usePageMeta";
import { COUNTY_PROFILES, type CountyProfile } from "@/data/michigan-county-profiles";
import { MICHIGAN_CITIES } from "@/data/michigan-county-seats";
import { getRegionForCounty } from "@/data/michigan-regions";
import { countyToSlug } from "@/utils/countyUtils";
import DataProvenance from "@/components/shared/DataProvenance";
import SnapshotCard, { type SnapshotMetric } from "@/components/shared/SnapshotCard";
import { toast } from "@/hooks/use-toast";

function resolveCityToCounty(cityName: string): { city: string; county: string; zip?: string } | null {
  const lower = cityName.toLowerCase().replace(/-/g, " ");
  // Match from MICHIGAN_CITIES
  const match = MICHIGAN_CITIES.find((c) => c.city.toLowerCase() === lower);
  if (match) return { city: match.city, county: match.county, zip: match.zip };
  // Fallback: search county majorCities
  for (const [county, profile] of Object.entries(COUNTY_PROFILES)) {
    if (profile.majorCities.some((c) => c.toLowerCase() === lower)) {
      return { city: cityName.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()), county };
    }
  }
  return null;
}

function parseRate(val: string): number {
  const m = val.match(/([\d.]+)/);
  return m ? parseFloat(m[1]) : 0;
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.35 } }),
};

const STATE_AVG = { uninsured: 6.5, pcRatio: 1290, foodInsecurity: 13.0 };

export default function CityPlacePage() {
  const { cityName } = useParams<{ cityName: string }>();
  const resolved = cityName ? resolveCityToCounty(cityName) : null;
  const profile = resolved ? COUNTY_PROFILES[resolved.county] : null;
  const region = resolved ? getRegionForCounty(resolved.county) : null;

  usePageMeta({
    title: resolved ? `${resolved.city}, Michigan — Local Health & Services` : "City Not Found",
    description: resolved && profile
      ? `Health data, services, and resources for ${resolved.city}, ${resolved.county} County, Michigan. Population: ${profile.population.toLocaleString()} (county).`
      : "City not found",
    path: `/place/city/${cityName || ""}`,
  });

  const snapshotMetrics: SnapshotMetric[] = useMemo(() => {
    if (!profile) return [];
    const hh = profile.healthHighlights;
    return [
      { id: "uninsured", label: "Uninsured Rate (County Avg)", value: hh[0]?.value || "N/A", unit: "", percentile: Math.round((1 - parseRate(hh[0]?.value || "6.5%") / 15) * 100) },
      { id: "pcratio", label: "Primary Care Ratio (County Avg)", value: hh[1]?.value || "N/A" },
      { id: "food", label: "Food Insecurity (County Avg)", value: hh[2]?.value || "N/A", percentile: Math.round((1 - parseRate(hh[2]?.value || "13%") / 25) * 100) },
    ];
  }, [profile]);

  if (!resolved || !profile) {
    return <Navigate to="/404" replace />;
  }

  const embedCode = `<iframe src="${window.location.origin}/embed?county=${encodeURIComponent(resolved.county)}" width="100%" height="400" frameborder="0" title="${resolved.city} Health Profile"></iframe>`;

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    toast({ title: "Embed code copied", description: "Paste this into any webpage to embed this local profile." });
  };

  return (
    <Layout>
      <Breadcrumbs items={[
        { label: "Regions", href: "/regions" },
        ...(region ? [{ label: region.name, href: `/region/${region.id}` }] : []),
        { label: `${resolved.county} County`, href: `/place/${countyToSlug(resolved.county)}-county` },
        { label: resolved.city },
      ]} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/8 via-background to-accent/5 py-12 md:py-16">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-5 w-5 text-primary" />
              <Badge variant="outline" className="text-xs">{resolved.county} County</Badge>
              <Badge variant="secondary" className="text-xs capitalize">{profile.countyType}</Badge>
            </div>
            <h1 className="text-3xl font-bold text-foreground md:text-4xl lg:text-5xl mb-3">
              {resolved.city}, Michigan
            </h1>
            <p className="text-lg text-muted-foreground mb-4">
              Part of {resolved.county} County · Population {profile.population.toLocaleString()} (county)
            </p>

            <div className="rounded-lg border border-michigan-gold/20 bg-michigan-gold/5 px-4 py-3 mb-6">
              <p className="text-xs text-muted-foreground">
                <strong>Note:</strong> Municipality-level health data is limited. Metrics shown below reflect the <strong>{resolved.county} County average</strong> and are labeled accordingly.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to={`/find-care?county=${resolved.county}&scope=facilities`}>
                <Button className="gap-2"><Stethoscope className="h-4 w-4" /> Find Care Here</Button>
              </Link>
              <Link to={`/place/${countyToSlug(resolved.county)}-county`}>
                <Button variant="outline" className="gap-2"><Building2 className="h-4 w-4" /> County Profile</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container py-10 space-y-12">
        {/* Snapshot */}
        <SnapshotCard
          title={`${resolved.city} Area Health Snapshot`}
          geographyType="county"
          metrics={snapshotMetrics}
        />

        <Separator />

        {/* Independence disclaimer */}
        <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
          <p className="text-xs text-muted-foreground text-center">
            <Shield className="inline h-3 w-3 mr-1" />
            Access Michigan is an <strong>independent civic project</strong>. We are not affiliated with Michigan 2-1-1, MDHHS, or any health system.
            For live help, call <a href="tel:211" className="font-semibold text-primary hover:underline">2-1-1</a>.
          </p>
        </div>

        <Separator />

        {/* Quick links */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Heart className="h-5 w-5 text-michigan-coral" /> Help Available Near {resolved.city}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Find a Doctor or Clinic", desc: `Search providers near ${resolved.city}`, href: `/find-care?county=${resolved.county}&scope=facilities`, icon: Stethoscope },
              { title: "Community Resources", desc: `Food, housing, transport & more in ${resolved.county} County`, href: `/resources?county=${resolved.county}`, icon: Heart },
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

        {/* Embed quick action */}
        <section className="rounded-xl border border-border bg-muted/30 p-6 md:p-8">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" /> Embed This Local Profile
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Journalists, nonprofits, and government agencies can embed {resolved.city}'s health snapshot on any website.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" className="gap-2" onClick={handleCopyEmbed}>
              <Copy className="h-3.5 w-3.5" /> Copy Embed Code
            </Button>
            <Link to={`/county/${countyToSlug(resolved.county)}`}>
              <Button variant="outline" size="sm" className="gap-2">
                <BarChart3 className="h-3.5 w-3.5" /> Full County Data
              </Button>
            </Link>
          </div>
        </section>

        <DataProvenance
          source="County Health Rankings, Census ACS, MDHHS — county-level averages shown for municipality context"
          updated="2026-02-26"
          methodologyHref="/data-validation"
        />
      </div>
    </Layout>
  );
}
