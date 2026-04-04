import { useMemo, useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin, Heart, Stethoscope, Building2, Phone,
  Activity, Shield, Code, Copy, BarChart3,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { usePageMeta } from "@/hooks/usePageMeta";
import { countyToSlug } from "@/utils/countyUtils";
import DataProvenance from "@/components/shared/DataProvenance";
import DeltaChip from "@/components/shared/DeltaChip";
import MoEBadge from "@/components/shared/MoEBadge";
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
import CivicIntelligenceSection from "@/components/pillars/CivicIntelligenceSection";
import ZipBriefTour from "@/components/shared/ZipBriefTour";
import { useCounty } from "@/contexts/CountyContext";
import { useCensusACS, getCensusValue, getCensusMOE, formatDollars, formatPercent } from "@/hooks/useCensusACS";
import { MI_COUNTY_FIPS } from "@/data/census-geographies";
import { ZipDataGrainBanner } from "@/components/shared/ZipDataGrainBanner";

/** State-level ACS benchmarks (2022 estimates) */
const MI_STATE_BENCHMARKS = {
  medianIncome: 63202,
  povertyRate: 13.0,
  uninsuredRate: 6.3,
  bachelorRate: 29.6,
};

/* DeltaChip is now imported from @/components/shared/DeltaChip */

/** Mirror card: shows a metric with county and state baselines */
function MirrorMetricCard({ label, zipValue, countyValue, stateValue, format, higherIsBetter, soWhat, estimate, moe }: {
  label: string;
  zipValue: number | null;
  countyValue: number | null;
  stateValue: number;
  format: (v: number | null) => string;
  higherIsBetter: boolean;
  soWhat: string;
  estimate?: number | null;
  moe?: number | null;
}) {
  const noData = zipValue === null && countyValue === null;

  if (noData) {
    return (
      <Card className="h-full border-2 border-dashed border-muted-foreground/30 bg-muted/20">
        <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
          <span className="text-2xl" role="img" aria-hidden>📊</span>
          <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</h3>
          <p className="text-sm font-semibold text-foreground">Data Pending</p>
          <p className="text-[11px] text-muted-foreground/70 italic max-w-xs mx-auto leading-relaxed">
            Census ZCTA-level data for this metric is not yet published. County and state averages may still be available on the county profile page.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardContent className="py-4 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider truncate max-w-[200px]">{label}</p>
          <MoEBadge estimate={estimate ?? zipValue} moe={moe ?? null} />
        </div>
        <p className="text-2xl font-bold text-foreground tabular-nums">{format(zipValue)}</p>
        <div className="flex flex-col sm:flex-row flex-wrap gap-2">
          {countyValue !== null && (
            <DeltaChip value={zipValue} benchmark={countyValue} higherIsBetter={higherIsBetter} label="County" />
          )}
          <DeltaChip value={zipValue} benchmark={stateValue} higherIsBetter={higherIsBetter} label="MI Avg" />
        </div>
        <div className="flex flex-col gap-4 pt-2 border-t border-border/40">
          <div className="text-[11px] text-muted-foreground space-y-1">
            <p className="break-words">County Avg: <span className="font-mono font-medium text-foreground tabular-nums">{format(countyValue)}</span></p>
            <p className="break-words">MI State: <span className="font-mono font-medium text-foreground tabular-nums">{format(stateValue)}</span></p>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground italic break-words">{soWhat}</p>
      </CardContent>
    </Card>
  );
}

export default function ZipPlacePage() {
  const { zipcode } = useParams<{ zipcode: string }>();
  const { setZip } = useCounty();

  const place = useMemo(() => zipcode ? resolvePlace({ type: "zip", zipcode }) : null, [zipcode]);

  // Auto-populate granular context when visiting a ZIP page
  useEffect(() => {
    if (zipcode) setZip(zipcode);
  }, [zipcode, setZip]);

  // Fetch county-level Census data for the "Mirror" overlay
  const countyFips = place?.parentCounty ? MI_COUNTY_FIPS[place.parentCounty] || "" : "";
  const { data: countyACS } = useCensusACS({
    tables: ["B19013", "B17001", "B15003"],
    geoType: "county",
    geoFips: countyFips,
    enabled: !!countyFips,
  });

  // Fetch ZCTA-level Census data for ZIP
  const { data: zipACS } = useCensusACS({
    tables: ["B19013", "B17001", "B15003"],
    geoType: "zcta",
    geoFips: zipcode || "",
    enabled: !!zipcode,
  });

  // Extract values
  const zipIncome = getCensusValue(zipACS, "B19013", "B19013_001E");
  const countyIncome = getCensusValue(countyACS, "B19013", "B19013_001E");

  const zipPovNum = getCensusValue(zipACS, "B17001", "B17001_002E");
  const zipPovDen = getCensusValue(zipACS, "B17001", "B17001_001E");
  const zipPovRate = zipPovNum && zipPovDen && zipPovDen > 0 ? +((zipPovNum / zipPovDen) * 100).toFixed(1) : null;

  const countyPovNum = getCensusValue(countyACS, "B17001", "B17001_002E");
  const countyPovDen = getCensusValue(countyACS, "B17001", "B17001_001E");
  const countyPovRate = countyPovNum && countyPovDen && countyPovDen > 0 ? +((countyPovNum / countyPovDen) * 100).toFixed(1) : null;

  const zipBachNum = getCensusValue(zipACS, "B15003", "B15003_022E");
  const zipBachDen = getCensusValue(zipACS, "B15003", "B15003_001E");
  const zipBachRate = zipBachNum && zipBachDen && zipBachDen > 0 ? +((zipBachNum / zipBachDen) * 100).toFixed(1) : null;

  const countyBachNum = getCensusValue(countyACS, "B15003", "B15003_022E");
  const countyBachDen = getCensusValue(countyACS, "B15003", "B15003_001E");
  const countyBachRate = countyBachNum && countyBachDen && countyBachDen > 0 ? +((countyBachNum / countyBachDen) * 100).toFixed(1) : null;

  // MoE values for quality badges
  const zipIncomeMoE = getCensusMOE(zipACS, "B19013", "B19013_001E");
  const zipPovMoE = getCensusMOE(zipACS, "B17001", "B17001_002E");
  const zipBachMoE = getCensusMOE(zipACS, "B15003", "B15003_022E");

  usePageMeta({
    title: place ? `ZIP ${place.slug} Community Brief — Access Michigan` : "ZIP Code Not Found",
    description: place
      ? buildBriefMetaDescription(place)
      : "ZIP code not found",
    path: `/place/zip/${zipcode || ""}`,
  });

  if (!place) return <Navigate to="/404" replace />;

  const embedCode = `<iframe src="${window.location.origin}/embed?county=${encodeURIComponent(place.parentCounty || "")}" width="100%" height="400" frameborder="0" title="ZIP ${place.slug} Health Profile"></iframe>`;

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    toast({ title: "Embed code copied", description: "Paste this into any webpage." });
  };

  return (
    <Layout>
      <ZipBriefTour />
      <Breadcrumbs items={buildPlaceBreadcrumbs(place)} />
      <DomainJumpNav />

      {/* Data grain disclosure banner */}
      <div className="container pt-4">
        <ZipDataGrainBanner
          zipCode={place.slug}
          countyName={place.parentCounty || ""}
          hasZipLevelHealth={true}
        />
      </div>

      <section className="bg-gradient-to-br from-primary/8 via-background to-accent/5 py-12 md:py-16">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-5 w-5 text-primary" />
              <Badge variant="outline" className="text-xs">{place.parentCounty} County</Badge>
              {place.city && <Badge variant="secondary" className="text-xs">{place.city}</Badge>}
              <Badge variant="outline" className="text-xs bg-michigan-gold/10 text-michigan-gold border-michigan-gold/30">
                County Avg Comparison
              </Badge>
            </div>
            <h1 className="text-3xl font-bold text-foreground md:text-4xl lg:text-5xl mb-3">
              ZIP Code {place.slug}
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              {place.city ? `${place.city}, ` : ""}{place.parentCounty} County, Michigan
            </p>

            <div className="flex flex-wrap gap-3">
              <Link to={`/find-care?county=${place.parentCounty}&scope=facilities`}>
                <Button className="gap-2"><Stethoscope className="h-4 w-4" /> Find Care Nearby</Button>
              </Link>
              <Link to={`/place/${countyToSlug(place.parentCounty!)}-county`}>
                <Button variant="outline" className="gap-2"><Building2 className="h-4 w-4" /> County Profile</Button>
              </Link>
              <Link to={`/compare?selections=zip:${zipcode},county:${place.parentCounty}`}>
                <Button variant="outline" className="gap-2"><BarChart3 className="h-4 w-4" /> Compare vs County</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container py-6 sm:py-10 section-spacing">
        {/* ── ZIP vs County "Mirror" Overlay ── */}
        <section id="zip-overlay">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary shrink-0" />
              <h2 className="text-lg sm:text-xl font-bold text-foreground truncate max-w-[280px] sm:max-w-none">ZIP {zipcode} vs {place.parentCounty} County</h2>
            </div>
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider w-fit shrink-0">Contextual Peers</Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Every metric is shown alongside <strong>{place.parentCounty} County</strong> and <strong>Michigan state</strong> averages so you can see how your ZIP compares.
          </p>
          <div className="grid gap-responsive grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <MirrorMetricCard
              label="Median Household Income"
              zipValue={zipIncome}
              countyValue={countyIncome}
              stateValue={MI_STATE_BENCHMARKS.medianIncome}
              format={(v) => v !== null ? `$${v.toLocaleString()}` : "—"}
              higherIsBetter={true}
              soWhat="Higher income generally means more local spending power and tax base."
              estimate={zipIncome}
              moe={zipIncomeMoE}
            />
            <MirrorMetricCard
              label="Poverty Rate"
              zipValue={zipPovRate}
              countyValue={countyPovRate}
              stateValue={MI_STATE_BENCHMARKS.povertyRate}
              format={(v) => v !== null ? `${v}%` : "—"}
              higherIsBetter={false}
              soWhat="Lower poverty rates indicate broader economic stability in this area."
              estimate={zipPovNum}
              moe={zipPovMoE}
            />
            <MirrorMetricCard
              label="Bachelor's Degree or Higher"
              zipValue={zipBachRate}
              countyValue={countyBachRate}
              stateValue={MI_STATE_BENCHMARKS.bachelorRate}
              format={(v) => v !== null ? `${v}%` : "—"}
              higherIsBetter={true}
              soWhat="Education attainment correlates with health outcomes and earning potential."
              estimate={zipBachNum}
              moe={zipBachMoE}
            />
          </div>
        </section>

        <Separator />

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

        {/* Resources */}
        <section id="programs">
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Heart className="h-5 w-5 text-michigan-coral" /> Resources for ZIP {place.slug}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Find a Doctor or Clinic", desc: `Search providers in ${place.parentCounty} County`, href: `/find-care?county=${place.parentCounty}&scope=facilities`, icon: Stethoscope },
              { title: "Community Resources", desc: "Food, housing, transport & more", href: `/resources?county=${place.parentCounty}`, icon: Heart },
              { title: "Financial Help", desc: "Medicaid, SNAP, LIHEAP & more", href: "/financial-help", icon: Activity },
            ].map((prog) => (
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

        {/* Civic Intelligence — 4 pillar cards + detail */}
        {place.parentCounty && <CivicIntelligenceSection countyName={place.parentCounty} />}

        <Separator />

        {/* Environmental Intelligence */}
        <LiveEnvironmentalCard zipCode={place.zip} city={place.city} county={place.parentCounty} />

        {/* Benefits Pre-Screener */}
        <UniversalPreScreener />

        {/* One-Click Advocacy */}
        <ContactRepresentative place={place} />

        {/* Download Insights */}
        <DownloadLocalInsights place={place} />

        <Separator />

        {/* Trust & Transparency */}
        <DataLimitationsNote place={place} />

        {/* Embed */}
        <section id="analysts" className="rounded-xl border border-border bg-muted/30 p-6 md:p-8">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" /> Embed This Profile
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Embed ZIP {place.slug}'s health snapshot on any website.
          </p>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleCopyEmbed}>
            <Copy className="h-3.5 w-3.5" /> Copy Embed Code
          </Button>
        </section>

        <ReportIssue variant="inline" />

        <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
          <p className="text-xs text-muted-foreground text-center">
            <Shield className="inline h-3 w-3 mr-1" />
            Access Michigan is an <strong>independent civic project</strong>. We are not affiliated with Michigan 2-1-1, MDHHS, or any health system.
          </p>
        </div>

        <DataProvenance
          source="U.S. Census Bureau ACS 5-Year (ZCTA + County), County Health Rankings, MDHHS, DOE LEAD, FCC"
          updated="2025"
          methodologyHref="/data-validation"
        />
      </div>
    </Layout>
  );
}
