import { useParams, Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useEffect, lazy, Suspense } from "react";
import {
  MapPin,
  Users,
  Heart,
  Building2,
  Phone,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Minus,
  Globe,
  Calendar,
  FileQuestion,
  Mail,
  ShieldCheck,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import NotFound from "./NotFound";
import { TruncatedResourceList } from "@/components/shared/TruncatedResourceList";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  slugToCounty,
  getCountyLinks,
  countyToSlug,
} from "@/utils/countyUtils";
import {
  getCountyProfile,
  COUNTY_UNINSURED_SOURCE,
  COUNTY_PCP_SOURCE,
  COUNTY_FOOD_INSECURITY_SOURCE,
} from "@/data/michigan-county-profiles";
import { getRegionForCounty } from "@/data/michigan-regions";
import { useCounty, type MichiganCounty } from "@/contexts/CountyContext";
import { useFacilities } from "@/hooks/useFacilities";
import { useCommunityResources } from "@/hooks/useCommunityResources";
import { useCommunityEvents } from "@/hooks/useCommunityEvents";
import SpotlightTabs from "@/components/shared/SpotlightTabs";
import CountyCivicSection from "@/components/county/CountyCivicSection";
import DownloadCountyGuide from "@/components/county/DownloadCountyGuide";
import MunicipalToolkit from "@/components/county/MunicipalToolkit";
import RecentlyViewedBar from "@/components/county/RecentlyViewedBar";
import UninsuredSparkline from "@/components/county/UninsuredSparkline";
import PopulationSparkline from "@/components/county/PopulationSparkline";
import SnapshotCard from "@/components/shared/SnapshotCard";
import DataConfidenceCard, {
  buildDataConfidence,
} from "@/components/shared/DataConfidenceCard";
import ResultHeader from "@/components/shared/ResultHeader";
import JusticeSection from "@/components/county/JusticeSection";
import { buildCountySnapshotMetrics } from "@/utils/snapshotMetrics";
import CivicIntelligenceSection from "@/components/pillars/CivicIntelligenceSection";
import MichiganEnvBurdenMap from "@/components/MichiganEnvBurdenMap";
import { FIPS_TO_COUNTY } from "@/data/michigan-topojson";
import { getTRIByCounty } from "@/data/epa-tri";
import { useECHOFacilities } from "@/hooks/useEPAEcho";
import { MEDICAID_COVERAGE_AT_RISK_FALLBACK } from "@/data/medicaidCoverageAtRiskFallback";
import { SNAP_COVERAGE_AT_RISK_FALLBACK } from "@/data/snapCoverageAtRiskFallback";
import { DUAL_ELIGIBLE_EXPOSURE_FALLBACK } from "@/data/dualEligibleExposureFallback";

// State benchmarks: County Health Rankings & Roadmaps 2025 edition
// https://www.countyhealthrankings.org/health-data/michigan
const BENCHMARKS: Record<string, { state: string; us: string }> = {
  "Uninsured rate": { state: "5%", us: "8.0%" },
  "Food insecurity": { state: "13.3%", us: "13.5%" },
  "Primary care ratio": { state: "1,240:1", us: "1,310:1" },
};

const StatSkeleton = () => (
  <Card>
    <CardContent className="flex items-center gap-3 py-4">
      <Skeleton className="h-8 w-8 rounded" />
      <div className="space-y-1.5 flex-1">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-3 w-24" />
      </div>
    </CardContent>
  </Card>
);

const HealthSkeleton = () => (
  <Card>
    <CardContent className="py-4 space-y-2">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-6 w-16" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-3 w-28" />
    </CardContent>
  </Card>
);

const EmbeddedMap = lazy(() => import("@/components/map/EmbeddedMap"));

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.3 },
  }),
};

const TrendIcon = ({ trend }: { trend?: "up" | "down" | "stable" }) => {
  if (trend === "up")
    return <TrendingUp className="h-3 w-3 text-michigan-coral-deep" />;
  if (trend === "down")
    return <TrendingDown className="h-3 w-3 text-michigan-forest-deep" />;
  return <Minus className="h-3 w-3 text-muted-foreground" />;
};

export default function CountyPage() {
  const { slug } = useParams<{ slug: string }>();
  const county = slugToCounty(slug || "");
  const { setCounty } = useCounty();

  usePageMeta({
    title: county
      ? `${county}, MI | Access Michigan - Civic Intelligence`
      : "County Not Found",
    description: county
      ? `County-level health, environmental, and social data for ${county}. Source: CDC PLACES, EPA EJScreen, County Health Rankings.`
      : "County not found.",
    path: `/county/${slug}`,
    jsonLd: county
      ? {
          "@type": "GovernmentService",
          name: `${county} County Health & Community Resources`,
          serviceArea: {
            "@type": "AdministrativeArea",
            name: `${county} County, Michigan`,
          },
          provider: { "@type": "Organization", name: "Access Michigan" },
          url: `https://accessmi.org/county/${slug}`,
        }
      : undefined,
  });

  useEffect(() => {
    if (county) setCounty(county);
  }, [county, setCounty]);

  // Unrecognized slug is a genuine 404. Render the shared NotFound page
  // (its own minimal chrome + recovery UI) rather than an in-shell
  // "County Not Found" message buried below the full layout.
  if (!county) {
    return <NotFound />;
  }

  const profile = getCountyProfile(county);
  const region = getRegionForCounty(county);
  const links = getCountyLinks(county);
  const { data: facilities, isLoading: loadingFacilities } = useFacilities(
    undefined,
    county,
  );
  const { data: resources, isLoading: loadingResources } =
    useCommunityResources(undefined, county);
  const { data: events, isLoading: loadingEvents } = useCommunityEvents(
    undefined,
    county,
  );
  const safeF = facilities ?? [];
  const safeR = resources ?? [];
  const safeE = events ?? [];
  const isStatsLoading = loadingFacilities || loadingResources || loadingEvents;

  // Neutral sort: by geographic proximity to the county centroid, where the
  // centroid is the mean of the facilities' own lat/lon. Replaces a prior
  // hand-curated "major systems first" allowlist that lifted certain large
  // health systems (including the maintainer's employer) above smaller
  // independent clinics, FQHCs, and rural hospitals regardless of objective
  // quality - a credibility risk on a neutrality-claiming civic platform.
  const facilityCentroid = (() => {
    if (safeF.length === 0) return null;
    let sumLat = 0;
    let sumLon = 0;
    for (const f of safeF) {
      sumLat += f.latitude;
      sumLon += f.longitude;
    }
    return { lat: sumLat / safeF.length, lon: sumLon / safeF.length };
  })();

  // Squared great-circle proxy (Haversine without the sqrt or trig calls -
  // sufficient for ordering, since the ordering is preserved under monotone
  // transforms of distance). Latitude and longitude treated as a flat 2D
  // grid is fine inside a single state's bounding box.
  const distSq = (lat: number, lon: number) => {
    if (!facilityCentroid) return 0;
    const dLat = lat - facilityCentroid.lat;
    const dLon = lon - facilityCentroid.lon;
    return dLat * dLat + dLon * dLon;
  };

  const sortedFacilities = [...safeF].sort(
    (a, b) => distSq(a.latitude, a.longitude) - distSq(b.latitude, b.longitude),
  );

  const facilityCounts = safeF.reduce(
    (acc, f) => {
      acc[f.facility_type] = (acc[f.facility_type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const hasDataGaps = profile.healthHighlights.length < 3 || safeF.length < 3;

  const dataConfidence = buildDataConfidence({
    facilityCount: safeF.length,
    resourceCount: safeR.length,
    highlightCount: profile.healthHighlights.length,
    eventCount: safeE.length,
    // Data confidence intentionally no longer rewards counties for hosting a
    // pre-named "major" health system. That signal was hand-curated and lifted
    // the maintainer's employer; on a neutrality-claiming platform it does
    // not earn a confidence credit.
    hasMajorSystem: false,
    hasPopulation: profile.population > 0,
  });

  const snapshotMetrics = buildCountySnapshotMetrics(county);
  const countyFips = Object.entries(FIPS_TO_COUNTY).find(
    ([, name]) => name === county,
  )?.[0];
  const triFacilities = getTRIByCounty(county);
  const { data: echoFacilities, isLoading: echoLoading } =
    useECHOFacilities(county);
  const echoTotal = echoFacilities?.length ?? 0;
  const echoRCRA =
    echoFacilities?.filter((f) => f.programs.includes("RCRA")).length ?? 0;
  const echoCWA =
    echoFacilities?.filter((f) => f.programs.includes("CWA")).length ?? 0;
  const echoCAA =
    echoFacilities?.filter((f) => f.programs.includes("CAA")).length ?? 0;
  const echoSDWA =
    echoFacilities?.filter((f) => f.programs.includes("SDWA")).length ?? 0;
  const echoViolations =
    echoFacilities?.filter((f) => f.violations12mo > 0).length ?? 0;

  return (
    <Layout>
      <Breadcrumbs
        items={[
          { label: "Counties", href: "/health-map" },
          { label: `${county} County` },
        ]}
      />
      <div className="container mt-2">
        <RecentlyViewedBar currentCounty={county} currentSlug={slug || ""} />
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/8 via-primary/3 to-background py-12 md:py-16">
        <div className="container">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
            className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between"
          >
            <div className="max-w-2xl">
              <div className="mb-3 flex items-center gap-2 flex-wrap">
                <MapPin className="h-5 w-5 text-primary" />
                <Badge variant="outline" className="text-xs">
                  {profile.countyType}
                </Badge>
                {region && (
                  <Link to={`/region/${region.id}`}>
                    <Badge
                      className="text-xs cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ background: region.color, color: "#fff" }}
                    >
                      {region.name} →
                    </Badge>
                  </Link>
                )}
              </div>
              <h1 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">
                {county} County
              </h1>
              <p className="text-lg text-muted-foreground">
                {profile.majorCities.length > 0
                  ? `Home to ${profile.majorCities.join(", ")} · Population ${profile.population.toLocaleString()}`
                  : `Population ${profile.population.toLocaleString()}`}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to={`/find-care?county=${encodeURIComponent(county)}&scope=facilities`}
              >
                <Button variant="outline" size="sm">
                  <Building2 className="mr-1.5 h-4 w-4" />
                  Find Care
                </Button>
              </Link>
              <Link to="/resources">
                <Button variant="outline" size="sm">
                  <Heart className="mr-1.5 h-4 w-4" />
                  Resources
                </Button>
              </Link>
              <Link to="/health-map">
                <Button variant="outline" size="sm">
                  <MapPin className="mr-1.5 h-4 w-4" />
                  Health Map
                </Button>
              </Link>
              <DownloadCountyGuide county={county} />
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container py-8 space-y-10">
        {/* Snapshot Card */}
        <SnapshotCard
          title={`${county} County at a Glance`}
          geographyType="county"
          metrics={snapshotMetrics}
        />

        {/* Quick Stats */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-4 grid-cols-2 md:grid-cols-4"
        >
          {isStatsLoading ? (
            <>
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
            </>
          ) : (
            [
              {
                label: "Healthcare Facilities",
                value: safeF.length,
                icon: Building2,
                color: "text-primary",
              },
              {
                label: "Community Resources",
                value: safeR.length,
                icon: Heart,
                color: "text-michigan-teal-deep",
              },
              {
                label: "Upcoming Events",
                value: safeE.length,
                icon: Calendar,
                color: "text-michigan-gold-deep",
              },
              {
                label: "Population",
                value: profile.population.toLocaleString(),
                icon: Users,
                color: "text-michigan-forest-deep",
              },
            ].map((stat, i) => (
              <motion.div key={stat.label} variants={fadeUp} custom={i}>
                <Card>
                  <CardContent className="flex items-center gap-3 py-4">
                    <stat.icon
                      className={`h-8 w-8 ${stat.color} flex-shrink-0`}
                    />
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {stat.value}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {stat.label}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Population trend sparkline */}
        <Card>
          <CardContent className="py-4">
            <PopulationSparkline county={county} />
          </CardContent>
        </Card>

        {/* Health Highlights */}
        <section>
          <h2 className="mb-4 text-xl font-bold text-foreground">
            Health Highlights
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {profile.healthHighlights.map((h) => {
              const bench = BENCHMARKS[h.label];
              const isRatio = h.label === "Primary care ratio";
              const numericVal = parseFloat(h.value.replace(/[^0-9.]/g, ""));
              const hasNumericVal = Number.isFinite(numericVal);
              const stateVal = bench
                ? parseFloat(bench.state.replace(/[^0-9.]/g, ""))
                : undefined;
              const isBetterState =
                stateVal !== undefined ? numericVal < stateVal : undefined;
              const usVal = bench
                ? parseFloat(bench.us.replace(/[^0-9.]/g, ""))
                : undefined;
              const isBetterUS =
                usVal !== undefined ? numericVal < usVal : undefined;

              const sourceLabel =
                h.label === "Uninsured rate"
                  ? COUNTY_UNINSURED_SOURCE
                  : h.label === "Primary care ratio"
                    ? COUNTY_PCP_SOURCE
                    : h.label === "Food insecurity"
                      ? COUNTY_FOOD_INSECURITY_SOURCE
                      : null;

              const actionLink =
                h.label === "Uninsured rate"
                  ? { href: "/financial-help", text: "Find coverage options →" }
                  : h.label === "Primary care ratio"
                    ? {
                        href: `/find-care?county=${encodeURIComponent(county)}&scope=facilities`,
                        text: "View community health centers →",
                      }
                    : { href: "/resources", text: "Find food assistance →" };

              let ratioSeverity: "good" | "moderate" | "high" | undefined;
              if (isRatio) {
                const ratioNum = parseInt(
                  h.value.split(":")[0].replace(/[^0-9]/g, ""),
                  10,
                );
                if (Number.isFinite(ratioNum) && ratioNum > 0) {
                  ratioSeverity =
                    ratioNum > 3000
                      ? "high"
                      : ratioNum > 1500
                        ? "moderate"
                        : "good";
                }
              }

              return (
                <Card key={h.label} className="hover-lift">
                  <CardContent className="py-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">{h.label}</p>
                      <TrendIcon trend={h.trend} />
                    </div>
                    {hasNumericVal ? (
                      <p className="text-xl font-bold text-foreground">
                        {h.value}
                      </p>
                    ) : (
                      <p className="text-sm italic text-muted-foreground">
                        Data unavailable
                      </p>
                    )}
                    {bench && hasNumericVal && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge
                            variant={
                              isBetterState ? "secondary" : "destructive"
                            }
                            className={`text-[10px] px-1.5 py-0 ${isBetterState ? "bg-michigan-forest/10 text-michigan-forest-deep border-michigan-forest/20" : ""}`}
                          >
                            {isBetterState ? "Below" : "Above"} state avg
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            MI: {bench.state}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge
                            variant={isBetterUS ? "secondary" : "destructive"}
                            className={`text-[10px] px-1.5 py-0 ${isBetterUS ? "bg-michigan-forest/10 text-michigan-forest-deep border-michigan-forest/20" : ""}`}
                          >
                            {isBetterUS ? "Below" : "Above"} US avg
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            US: {bench.us}
                          </span>
                        </div>
                      </div>
                    )}
                    {bench && !hasNumericVal && (
                      <p className="text-[10px] text-muted-foreground">
                        Comparison unavailable - no data reported.
                      </p>
                    )}
                    {isRatio && ratioSeverity && (
                      <div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 ${ratioSeverity === "high" ? "border-destructive/30 text-destructive" : ratioSeverity === "moderate" ? "border-michigan-gold/30 text-michigan-gold-deep" : "border-michigan-forest/30 text-michigan-forest-deep"}`}
                        >
                          {ratioSeverity === "high"
                            ? "Shortage area"
                            : ratioSeverity === "moderate"
                              ? "Below average"
                              : "Adequate"}
                        </Badge>
                        {ratioSeverity !== "good" && (
                          <p className="text-[10px] text-muted-foreground mt-1">
                            Wait times may be longer
                          </p>
                        )}
                      </div>
                    )}
                    {h.trend && h.trend !== "stable" && (
                      <p className="text-[10px] text-muted-foreground">
                        {h.trend === "down"
                          ? "📉 Improving over prior year"
                          : "📈 Increased from prior year"}
                      </p>
                    )}
                    {sourceLabel && (
                      <p className="text-[10px] text-muted-foreground/70 pt-1">
                        Source: {sourceLabel}
                      </p>
                    )}
                    <Link
                      to={actionLink.href}
                      className="block text-xs font-medium text-primary hover:underline pt-1"
                    >
                      {actionLink.text}
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Sparkline for uninsured rate trend */}
          {(() => {
            const uninsuredH = profile.healthHighlights.find(
              (h) => h.label === "Uninsured rate",
            );
            return uninsuredH ? (
              <Card className="mt-4">
                <CardContent className="py-4">
                  <UninsuredSparkline
                    currentRate={uninsuredH.value}
                    county={county}
                  />
                </CardContent>
              </Card>
            ) : null;
          })()}
        </section>

        {/* Data Confidence */}
        <DataConfidenceCard data={dataConfidence} />

        {/* Map */}
        <section>
          <h2 className="mb-4 text-xl font-bold text-foreground">
            Facilities Map
          </h2>
          <Suspense
            fallback={
              <div className="h-[400px] rounded-lg bg-muted animate-pulse" />
            }
          >
            <EmbeddedMap facilities={safeF} county={county} height="400px" />
          </Suspense>
        </section>

        {/* Facility Breakdown */}
        {safeF.length > 0 && (
          <section>
            <h2 className="mb-4 text-xl font-bold text-foreground">
              Facility Types
            </h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(facilityCounts).map(([type, count]) => (
                <Badge
                  key={type}
                  variant="secondary"
                  className="text-sm py-1 px-3"
                >
                  {type.replace(/_/g, " ")} · {count}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {/* Facilities (sorted by proximity to county center) */}
        {sortedFacilities.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-2">
              <ResultHeader
                label={`Facilities in ${county} County`}
                count={safeF.length}
              />
              <Link
                to={`/find-care?county=${encodeURIComponent(county)}&scope=facilities`}
              >
                <Button variant="ghost" size="sm">
                  View all →
                </Button>
              </Link>
            </div>
            <p className="text-[11px] text-muted-foreground mb-4">
              Sorted by distance from the average facility location in {county}{" "}
              County. No quality or system ranking is applied.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {sortedFacilities.slice(0, 6).map((f, i) => {
                return (
                  <motion.div
                    key={f.id}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    custom={i}
                  >
                    <Card className="h-full hover-lift">
                      <CardContent className="py-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-sm text-foreground">
                            {f.name}
                          </h3>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {f.joint_commission && (
                              <Badge className="bg-michigan-forest/10 text-michigan-forest-deep border-michigan-forest/20 text-[9px] px-1 py-0">
                                ✓ Verified
                              </Badge>
                            )}
                            {f.quality_score && (
                              <Badge variant="outline" className="text-[10px]">
                                {f.quality_score}/100
                              </Badge>
                            )}
                          </div>
                        </div>
                        {f.system_affiliation && (
                          <p className="text-[10px] text-primary font-medium">
                            {f.system_affiliation}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          <MapPin className="inline h-3 w-3 mr-1" />
                          {f.address}, {f.city}
                        </p>
                        <Badge variant="secondary" className="text-[10px]">
                          {f.facility_type.replace(/_/g, " ")}
                        </Badge>
                        <div className="flex flex-wrap gap-2 pt-1">
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${f.address}, ${f.city}, ${f.state} ${f.zip}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button
                              size="sm"
                              variant="default"
                              className="h-6 text-[10px] px-2"
                            >
                              <MapPin className="mr-1 h-3 w-3" />
                              Get Directions
                            </Button>
                          </a>
                          {f.phone && (
                            <a href={`tel:${f.phone}`}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 text-[10px] px-2"
                              >
                                <Phone className="mr-1 h-3 w-3" />
                                Call
                              </Button>
                            </a>
                          )}
                          {f.website && (
                            <a
                              href={f.website}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 text-[10px] px-2"
                              >
                                <ExternalLink className="mr-1 h-3 w-3" />
                                Website
                              </Button>
                            </a>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* Civic Intelligence - 4 pillar cards + detail */}
        <CivicIntelligenceSection countyName={county} />

        {/* Environmental Burden Map */}
        {countyFips && (
          <section className="py-10 border-t border-border">
            <div className="container">
              <h2 className="text-xl font-bold text-foreground mb-4">
                Environmental Burden
              </h2>
              <MichiganEnvBurdenMap initialCounty={countyFips} />
            </div>
          </section>
        )}

        {/* EPA TRI Facilities */}
        {triFacilities.length > 0 && (
          <section>
            <h2 className="mb-4 text-xl font-bold text-foreground">
              Toxic Release Inventory
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {triFacilities.slice(0, 5).map((f) => (
                <Card key={f.name} className="hover-lift">
                  <CardContent className="py-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-sm text-foreground">
                        {f.name}
                      </h3>
                      {f.carcinogensReleased && (
                        <Badge
                          variant="destructive"
                          className="text-[10px] shrink-0"
                        >
                          Carcinogen
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {f.city} · {f.industry}
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      {f.totalPoundsReleased.toLocaleString()}{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        lbs (2022)
                      </span>
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Top chemical: {f.topChemical}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="mt-3 text-[10px] text-muted-foreground">
              Source:{" "}
              <a
                href="https://www.epa.gov/toxics-release-inventory-tri-program"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                EPA Toxics Release Inventory, 2022 reporting year
              </a>
            </p>
          </section>
        )}

        {/* EPA ECHO Compliance */}
        <section>
          <h2 className="mb-4 text-xl font-bold text-foreground">
            EPA Compliance Overview
          </h2>
          {echoLoading ? (
            <Card>
              <CardContent className="py-4">
                <p className="text-sm text-muted-foreground">
                  Loading EPA ECHO data...
                </p>
              </CardContent>
            </Card>
          ) : echoFacilities && echoFacilities.length > 0 ? (
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
              {[
                { label: "Regulated Facilities", value: echoTotal },
                { label: "Hazardous Waste (RCRA)", value: echoRCRA },
                { label: "Water Discharge (CWA)", value: echoCWA },
                { label: "Air Emissions (CAA)", value: echoCAA },
                { label: "Drinking Water (SDWA)", value: echoSDWA },
                { label: "Violations (12mo)", value: echoViolations },
              ].map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="py-4 text-center">
                    <p className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {stat.label}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-4">
                <p className="text-sm text-muted-foreground">
                  EPA ECHO live data temporarily unavailable. View enforcement
                  data directly at{" "}
                  <a
                    href="https://echo.epa.gov/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    echo.epa.gov
                  </a>
                  .
                </p>
              </CardContent>
            </Card>
          )}
          <p className="mt-3 text-[10px] text-muted-foreground">
            Source:{" "}
            <a
              href="https://echo.epa.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              EPA Enforcement and Compliance History Online (ECHO), live query
            </a>
          </p>
        </section>

        {/* Policy Impact Projections */}
        {(() => {
          const medicaidEntry = MEDICAID_COVERAGE_AT_RISK_FALLBACK.find(
            (e) => e.county === county,
          );
          const snapEntry = SNAP_COVERAGE_AT_RISK_FALLBACK.find(
            (e) => e.county === county,
          );
          const dualEntry = DUAL_ELIGIBLE_EXPOSURE_FALLBACK.find(
            (e) => e.county === county,
          );
          return (
            <section>
              <h2 className="mb-4 text-xl font-bold text-foreground">
                Policy Impact Projections
              </h2>
              <div className="grid gap-3 sm:grid-cols-3">
                <Card className="hover-lift">
                  <CardContent className="py-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-foreground">
                        Medicaid Coverage at Risk
                      </p>
                      <Badge variant="outline" className="text-[10px]">
                        V2
                      </Badge>
                    </div>
                    {medicaidEntry ? (
                      <p className="text-sm font-bold text-foreground">
                        {medicaidEntry.projectedLossLow.toLocaleString()} to{" "}
                        {medicaidEntry.projectedLossHigh.toLocaleString()}{" "}
                        adults
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        County-level projections available
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground">
                      P.L. 119-21 work requirement exposure
                    </p>
                    <Link
                      to="/data/medicaid-coverage-at-risk"
                      className="text-xs font-medium text-primary hover:underline block"
                    >
                      View county-level projections →
                    </Link>
                  </CardContent>
                </Card>

                <Card className="hover-lift">
                  <CardContent className="py-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-foreground">
                        SNAP Coverage at Risk
                      </p>
                      <Badge variant="outline" className="text-[10px]">
                        V2
                      </Badge>
                    </div>
                    {snapEntry && snapEntry.projectedAffectedHigh > 0 ? (
                      <p className="text-sm font-bold text-foreground">
                        {snapEntry.projectedAffectedLow.toLocaleString()} to{" "}
                        {snapEntry.projectedAffectedHigh.toLocaleString()}{" "}
                        adults
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        County-level projections available
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground">
                      P.L. 119-21 ABAWD time-limit exposure
                    </p>
                    <Link
                      to="/data/snap-coverage-at-risk"
                      className="text-xs font-medium text-primary hover:underline block"
                    >
                      View county-level projections →
                    </Link>
                  </CardContent>
                </Card>

                <Card className="hover-lift">
                  <CardContent className="py-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-foreground">
                        Dual-Eligible Exposure
                      </p>
                      <Badge variant="outline" className="text-[10px]">
                        V3
                      </Badge>
                    </div>
                    {dualEntry ? (
                      <p className="text-sm font-bold text-foreground">
                        {dualEntry.allocatedLow.toLocaleString()} to{" "}
                        {dualEntry.allocatedHigh.toLocaleString()} residents
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        County-level estimates available
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground">
                      Medicare + Medicaid enrollment (exempt from work
                      requirements)
                    </p>
                    <Link
                      to="/data/dual-eligible-exposure"
                      className="text-xs font-medium text-primary hover:underline block"
                    >
                      View county distribution →
                    </Link>
                  </CardContent>
                </Card>
              </div>
              <p className="mt-3 text-[10px] text-muted-foreground">
                Policy impact projections based on federal data. See individual
                pages for full methodology.
              </p>
            </section>
          );
        })()}

        {/* Municipalities & Governance */}
        <MunicipalToolkit county={county} />
        <CountyCivicSection county={county} countyType={profile.countyType} />

        {/* Justice & Courts */}
        <JusticeSection county={county} />

        {/* Explore Resources */}
        <SpotlightTabs />

        {/* Official Resources */}
        <section>
          <h2 className="mb-4 text-xl font-bold text-foreground">
            Official Resources
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: "Michigan.gov County Page",
                href: links.michiganGov,
                icon: Globe,
              },
              {
                label: "County Health Rankings",
                href: links.healthRankings,
                icon: TrendingUp,
              },
              { label: "Census Data", href: links.census, icon: Users },
              {
                label: "211 Resource Finder",
                href: links.unitedWay211,
                icon: Phone,
              },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Card className="h-full hover-lift cursor-pointer">
                  <CardContent className="flex items-center gap-3 py-4">
                    <link.icon className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {link.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <ExternalLink className="h-2.5 w-2.5" /> Opens in new
                        tab
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </section>

        {/* Data Gap Callout */}
        {hasDataGaps && (
          <Card className="border-michigan-gold/30 bg-michigan-gold/5">
            <CardContent className="py-4 space-y-2">
              <div className="flex items-start gap-3">
                <FileQuestion className="h-5 w-5 text-michigan-gold-deep flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm text-foreground">
                    Missing local data?
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Some data for {county} County may be limited. You can
                    request public records through Michigan's Freedom of
                    Information Act (FOIA) or contact county officials for the
                    latest information.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                    >
                      <Link to="/civic-data">
                        <FileQuestion className="mr-1 h-3 w-3" />
                        FOIA Request Builder
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                    >
                      <a
                        href={`mailto:?subject=Data Request for ${county} County&body=I am writing to request public health and services data for ${county} County, Michigan.`}
                      >
                        <Mail className="mr-1 h-3 w-3" />
                        Contact Officials
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Last Updated */}
        <Card className="border-muted bg-muted/30">
          <CardContent className="py-3 text-center space-y-1">
            <p className="text-[10px] text-muted-foreground">
              Last updated:{" "}
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}{" "}
              · Data from CMS, HRSA, CDC, MDHHS
            </p>
            <p className="text-xs text-muted-foreground">
              🔒 All information shown is from public sources. Site uses Google
              Analytics 4 for aggregate usage measurement; see{" "}
              <Link to="/privacy" className="text-primary underline">
                Privacy Policy
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
