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
import { COUNTY_PROFILES } from "@/data/michigan-county-profiles";
import { zipToCounty, MICHIGAN_CITIES } from "@/data/michigan-county-seats";
import { getRegionForCounty } from "@/data/michigan-regions";
import { countyToSlug } from "@/utils/countyUtils";
import DataProvenance from "@/components/shared/DataProvenance";
import SnapshotCard, { type SnapshotMetric } from "@/components/shared/SnapshotCard";
import { toast } from "@/hooks/use-toast";

function parseRate(val: string): number {
  const m = val.match(/([\d.]+)/);
  return m ? parseFloat(m[1]) : 0;
}

function resolveZip(zip: string): { zip: string; county: string; city?: string } | null {
  // Check MICHIGAN_CITIES for exact ZIP
  const cityMatch = MICHIGAN_CITIES.find((c) => c.zip === zip);
  if (cityMatch) return { zip, county: cityMatch.county, city: cityMatch.city };
  // Fallback to prefix map
  const county = zipToCounty(zip);
  if (county) return { zip, county };
  return null;
}

export default function ZipPlacePage() {
  const { zipcode } = useParams<{ zipcode: string }>();
  const resolved = zipcode ? resolveZip(zipcode) : null;
  const profile = resolved ? COUNTY_PROFILES[resolved.county] : null;
  const region = resolved ? getRegionForCounty(resolved.county) : null;

  usePageMeta({
    title: resolved ? `ZIP ${resolved.zip}, Michigan — Health & Services` : "ZIP Code Not Found",
    description: resolved && profile
      ? `Health data and services for ZIP code ${resolved.zip} in ${resolved.county} County, Michigan.`
      : "ZIP code not found",
    path: `/place/zip/${zipcode || ""}`,
  });

  const snapshotMetrics: SnapshotMetric[] = useMemo(() => {
    if (!profile) return [];
    const hh = profile.healthHighlights;
    return [
      { id: "uninsured", label: "Uninsured Rate (County Avg)", value: hh[0]?.value || "N/A", percentile: Math.round((1 - parseRate(hh[0]?.value || "6.5%") / 15) * 100) },
      { id: "pcratio", label: "Primary Care Ratio (County Avg)", value: hh[1]?.value || "N/A" },
      { id: "food", label: "Food Insecurity (County Avg)", value: hh[2]?.value || "N/A", percentile: Math.round((1 - parseRate(hh[2]?.value || "13%") / 25) * 100) },
    ];
  }, [profile]);

  if (!resolved || !profile) {
    return <Navigate to="/404" replace />;
  }

  const embedCode = `<iframe src="${window.location.origin}/embed?county=${encodeURIComponent(resolved.county)}" width="100%" height="400" frameborder="0" title="ZIP ${resolved.zip} Health Profile"></iframe>`;

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    toast({ title: "Embed code copied", description: "Paste this into any webpage." });
  };

  return (
    <Layout>
      <Breadcrumbs items={[
        { label: "Regions", href: "/regions" },
        ...(region ? [{ label: region.name, href: `/region/${region.id}` }] : []),
        { label: `${resolved.county} County`, href: `/place/${countyToSlug(resolved.county)}-county` },
        { label: `ZIP ${resolved.zip}` },
      ]} />

      <section className="bg-gradient-to-br from-primary/8 via-background to-accent/5 py-12 md:py-16">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-5 w-5 text-primary" />
              <Badge variant="outline" className="text-xs">{resolved.county} County</Badge>
              {resolved.city && <Badge variant="secondary" className="text-xs">{resolved.city}</Badge>}
            </div>
            <h1 className="text-3xl font-bold text-foreground md:text-4xl lg:text-5xl mb-3">
              ZIP Code {resolved.zip}
            </h1>
            <p className="text-lg text-muted-foreground mb-4">
              {resolved.city ? `${resolved.city}, ` : ""}{resolved.county} County, Michigan
            </p>

            <div className="rounded-lg border border-michigan-gold/20 bg-michigan-gold/5 px-4 py-3 mb-6">
              <p className="text-xs text-muted-foreground">
                <strong>Note:</strong> ZIP-level health data is limited. Metrics shown reflect the <strong>{resolved.county} County average</strong>.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to={`/find-care?county=${resolved.county}&scope=facilities`}>
                <Button className="gap-2"><Stethoscope className="h-4 w-4" /> Find Care Nearby</Button>
              </Link>
              <Link to={`/place/${countyToSlug(resolved.county)}-county`}>
                <Button variant="outline" className="gap-2"><Building2 className="h-4 w-4" /> County Profile</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container py-10 space-y-12">
        <SnapshotCard title={`ZIP ${resolved.zip} Health Snapshot`} geographyType="county" metrics={snapshotMetrics} />

        <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
          <p className="text-xs text-muted-foreground text-center">
            <Shield className="inline h-3 w-3 mr-1" />
            Access Michigan is an <strong>independent civic project</strong>. We are not affiliated with Michigan 2-1-1, MDHHS, or any health system.
          </p>
        </div>

        <Separator />

        <section>
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Heart className="h-5 w-5 text-michigan-coral" /> Resources for ZIP {resolved.zip}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Find a Doctor or Clinic", desc: `Search providers in ${resolved.county} County`, href: `/find-care?county=${resolved.county}&scope=facilities`, icon: Stethoscope },
              { title: "Community Resources", desc: `Food, housing, transport & more`, href: `/resources?county=${resolved.county}`, icon: Heart },
              { title: "Financial Help", desc: "Medicaid, SNAP, LIHEAP & more", href: "/financial-help", icon: Activity },
            ].map((prog, i) => (
              <Link key={prog.title} to={prog.href}>
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
            ))}
          </div>
        </section>

        <Separator />

        <section className="rounded-xl border border-border bg-muted/30 p-6 md:p-8">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" /> Embed This Profile
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Embed ZIP {resolved.zip}'s health snapshot on any website.
          </p>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleCopyEmbed}>
            <Copy className="h-3.5 w-3.5" /> Copy Embed Code
          </Button>
        </section>

        <DataProvenance
          source="County Health Rankings, Census ACS, MDHHS — county-level averages shown for ZIP context"
          updated="2026-02-26"
          methodologyHref="/data-validation"
        />
      </div>
    </Layout>
  );
}
