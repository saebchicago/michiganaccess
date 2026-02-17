import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useEffect, lazy, Suspense } from "react";
import {
  MapPin, Users, Heart, Building2, Phone, ExternalLink,
  ArrowLeft, TrendingUp, TrendingDown, Minus, Globe, Calendar
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { slugToCounty, getCountyLinks, countyToSlug } from "@/utils/countyUtils";
import { getCountyProfile } from "@/data/michigan-county-profiles";
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

// National benchmarks (Census ACS 2023, HRSA, USDA)
const BENCHMARKS: Record<string, { state: string; us: string }> = {
  "Uninsured rate":    { state: "6.5%", us: "8.0%" },
  "Food insecurity":   { state: "13.2%", us: "13.5%" },
  "Primary care ratio": { state: "1,280:1", us: "1,310:1" },
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
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.3 } }),
};

const TrendIcon = ({ trend }: { trend?: "up" | "down" | "stable" }) => {
  if (trend === "up") return <TrendingUp className="h-3 w-3 text-michigan-coral" />;
  if (trend === "down") return <TrendingDown className="h-3 w-3 text-michigan-forest" />;
  return <Minus className="h-3 w-3 text-muted-foreground" />;
};

export default function CountyPage() {
  const { slug } = useParams<{ slug: string }>();
  const county = slugToCounty(slug || "");
  const { setCounty } = useCounty();

  usePageMeta({
    title: county ? `${county} County` : "County Not Found",
    description: county ? `Health resources, facilities, and community programs in ${county} County, Michigan.` : "County not found.",
    path: `/county/${slug}`,
    jsonLd: county ? {
      "@type": "GovernmentService",
      "name": `${county} County Health & Community Resources`,
      "serviceArea": { "@type": "AdministrativeArea", "name": `${county} County, Michigan` },
      "provider": { "@type": "Organization", "name": "Michigan Access" },
      "url": `https://michiganaccess.lovable.app/county/${slug}`,
    } : undefined,
  });

  // Set global county context when visiting this page
  useEffect(() => {
    if (county) setCounty(county);
  }, [county, setCounty]);

  if (!county) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground">County Not Found</h1>
          <p className="mt-2 text-muted-foreground">The county "{slug}" was not recognized.</p>
          <Link to="/">
            <Button className="mt-4"><ArrowLeft className="mr-2 h-4 w-4" />Back to Home</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const profile = getCountyProfile(county);
  const region = getRegionForCounty(county);
  const links = getCountyLinks(county);
  const { data: facilities, isLoading: loadingFacilities } = useFacilities(undefined, county);
  const { data: resources, isLoading: loadingResources } = useCommunityResources(undefined, county);
  const { data: events, isLoading: loadingEvents } = useCommunityEvents(undefined, county);
  const safeF = facilities ?? [];
  const safeR = resources ?? [];
  const safeE = events ?? [];
  const isStatsLoading = loadingFacilities || loadingResources || loadingEvents;

  const facilityCounts = safeF.reduce((acc, f) => {
    acc[f.facility_type] = (acc[f.facility_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Layout>
      <Breadcrumbs items={[{ label: "Counties", href: "/health-map" }, { label: `${county} County` }]} />
      <div className="container mt-2">
        <RecentlyViewedBar currentCounty={county} currentSlug={slug || ""} />
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/8 via-primary/3 to-background py-12 md:py-16">
        <div className="container">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 flex items-center gap-2 flex-wrap">
                <MapPin className="h-5 w-5 text-primary" />
                <Badge variant="outline" className="text-xs">{profile.countyType}</Badge>
                {region && (
                  <Link to={`/region/${region.id}`}>
                    <Badge className="text-xs cursor-pointer hover:opacity-80 transition-opacity" style={{ background: region.color, color: "#fff" }}>
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
              <Link to="/find-care">
                <Button variant="outline" size="sm"><Building2 className="mr-1.5 h-4 w-4" />Find Care</Button>
              </Link>
              <Link to="/resources">
                <Button variant="outline" size="sm"><Heart className="mr-1.5 h-4 w-4" />Resources</Button>
              </Link>
              <Link to="/health-map">
                <Button variant="outline" size="sm"><MapPin className="mr-1.5 h-4 w-4" />Health Map</Button>
              </Link>
              <DownloadCountyGuide county={county} />
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container py-8 space-y-10">
        {/* Quick Stats */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {isStatsLoading ? (
            <>
              <StatSkeleton /><StatSkeleton /><StatSkeleton /><StatSkeleton />
            </>
          ) : (
            [
              { label: "Healthcare Facilities", value: safeF.length, icon: Building2, color: "text-primary" },
              { label: "Community Resources", value: safeR.length, icon: Heart, color: "text-michigan-teal" },
              { label: "Upcoming Events", value: safeE.length, icon: Calendar, color: "text-michigan-gold" },
              { label: "Population", value: profile.population.toLocaleString(), icon: Users, color: "text-michigan-forest" },
            ].map((stat, i) => (
              <motion.div key={stat.label} variants={fadeUp} custom={i}>
                <Card>
                  <CardContent className="flex items-center gap-3 py-4">
                    <stat.icon className={`h-8 w-8 ${stat.color} flex-shrink-0`} />
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Health Highlights */}
        <section>
          <h2 className="mb-4 text-xl font-bold text-foreground">Health Highlights</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {profile.healthHighlights.map((h) => {
              const bench = BENCHMARKS[h.label];
              const isRatio = h.label === "Primary care ratio";
              const numericVal = parseFloat(h.value.replace(/[^0-9.]/g, ""));

              // State comparison
              const stateVal = bench ? parseFloat(bench.state.replace(/[^0-9.]/g, "")) : undefined;
              const isBetterState = stateVal !== undefined ? numericVal < stateVal : undefined;

              // US comparison
              const usVal = bench ? parseFloat(bench.us.replace(/[^0-9.]/g, "")) : undefined;
              const isBetterUS = usVal !== undefined ? numericVal < usVal : undefined;

              const actionLink = h.label === "Uninsured rate"
                ? { href: "/financial-help", text: "Find coverage options →" }
                : h.label === "Primary care ratio"
                ? { href: "/find-care", text: "View community health centers →" }
                : { href: "/resources", text: "Find food assistance →" };

              // Severity for primary care ratio
              let ratioSeverity: "good" | "moderate" | "high" | undefined;
              if (isRatio) {
                const ratioNum = parseInt(h.value.split(":")[0].replace(/[^0-9]/g, ""));
                ratioSeverity = ratioNum > 3000 ? "high" : ratioNum > 1500 ? "moderate" : "good";
              }

              return (
                <Card key={h.label} className="hover-lift">
                  <CardContent className="py-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">{h.label}</p>
                      <TrendIcon trend={h.trend} />
                    </div>
                    <p className="text-xl font-bold text-foreground">{h.value}</p>

                    {/* State + US comparisons */}
                    {bench && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge
                            variant={isBetterState ? "secondary" : "destructive"}
                            className={`text-[10px] px-1.5 py-0 ${isBetterState ? "bg-michigan-forest/10 text-michigan-forest border-michigan-forest/20" : ""}`}
                          >
                            {isBetterState ? "Below" : "Above"} state avg
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">MI: {bench.state}</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge
                            variant={isBetterUS ? "secondary" : "destructive"}
                            className={`text-[10px] px-1.5 py-0 ${isBetterUS ? "bg-michigan-forest/10 text-michigan-forest border-michigan-forest/20" : ""}`}
                          >
                            {isBetterUS ? "Below" : "Above"} US avg
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">US: {bench.us}</span>
                        </div>
                      </div>
                    )}

                    {/* Ratio severity */}
                    {isRatio && ratioSeverity && (
                      <div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 ${
                            ratioSeverity === "high"
                              ? "border-destructive/30 text-destructive"
                              : ratioSeverity === "moderate"
                              ? "border-michigan-gold/30 text-michigan-gold"
                              : "border-michigan-forest/30 text-michigan-forest"
                          }`}
                        >
                          {ratioSeverity === "high" ? "Shortage area" : ratioSeverity === "moderate" ? "Below average" : "Adequate"}
                        </Badge>
                        {ratioSeverity !== "good" && (
                          <p className="text-[10px] text-muted-foreground mt-1">Wait times may be longer</p>
                        )}
                      </div>
                    )}

                    {/* Trend context */}
                    {h.trend && h.trend !== "stable" && (
                      <p className="text-[10px] text-muted-foreground">
                        {h.trend === "down" ? "📉 Improving over prior year" : "📈 Increased from prior year"}
                      </p>
                    )}

                    {/* Actionable link */}
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
            const uninsuredH = profile.healthHighlights.find(h => h.label === "Uninsured rate");
            return uninsuredH ? (
              <Card className="mt-4">
                <CardContent className="py-4">
                  <UninsuredSparkline currentRate={uninsuredH.value} county={county} />
                </CardContent>
              </Card>
            ) : null;
          })()}
        </section>

        {/* Map */}
        <section>
          <h2 className="mb-4 text-xl font-bold text-foreground">Facilities Map</h2>
          <Suspense fallback={<div className="h-[400px] rounded-lg bg-muted animate-pulse" />}>
            <EmbeddedMap facilities={safeF} county={county} height="400px" />
          </Suspense>
        </section>

        {/* Facility Breakdown */}
        {safeF.length > 0 && (
          <section>
            <h2 className="mb-4 text-xl font-bold text-foreground">Facility Types</h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(facilityCounts).map(([type, count]) => (
                <Badge key={type} variant="secondary" className="text-sm py-1 px-3">
                  {type.replace(/_/g, " ")} · {count}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {/* Top Facilities List */}
        {safeF.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Top Facilities</h2>
              <Link to="/find-care">
                <Button variant="ghost" size="sm">View all →</Button>
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {safeF.slice(0, 6).map((f, i) => (
                <motion.div key={f.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                  <Card className="h-full hover-lift">
                    <CardContent className="py-4 space-y-2">
                      <div className="flex items-start justify-between">
                       <h3 className="font-semibold text-sm text-foreground">{f.name}</h3>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {f.joint_commission && (
                            <Badge className="bg-michigan-forest/10 text-michigan-forest border-michigan-forest/20 text-[9px] px-1 py-0">✓ Verified</Badge>
                          )}
                          {f.quality_score && (
                            <Badge variant="outline" className="text-[10px]">
                              {f.quality_score}/100
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        <MapPin className="inline h-3 w-3 mr-1" />{f.address}, {f.city}
                      </p>
                      <Badge variant="secondary" className="text-[10px]">{f.facility_type.replace(/_/g, " ")}</Badge>
                      <div className="flex gap-2 pt-1">
                        {f.phone && (
                          <a href={`tel:${f.phone}`}>
                            <Button size="sm" variant="outline" className="h-6 text-[10px] px-2">
                              <Phone className="mr-1 h-3 w-3" />Call
                            </Button>
                          </a>
                        )}
                        {f.website && (
                          <a href={f.website} target="_blank" rel="noopener">
                            <Button size="sm" variant="outline" className="h-6 text-[10px] px-2">
                              <ExternalLink className="mr-1 h-3 w-3" />Website
                            </Button>
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Municipalities & Governance Toolkit */}
        <MunicipalToolkit county={county} />

        {/* Civic & Government */}
        <CountyCivicSection county={county} countyType={profile.countyType} />

        {/* Explore Resources (reuse SpotlightTabs) */}
        <SpotlightTabs />

        {/* External Links */}
        <section>
          <h2 className="mb-4 text-xl font-bold text-foreground">Official Resources</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Michigan.gov County Page", href: links.michiganGov, icon: Globe },
              { label: "County Health Rankings", href: links.healthRankings, icon: TrendingUp },
              { label: "Census Data", href: links.census, icon: Users },
              { label: "211 Resource Finder", href: links.unitedWay211, icon: Phone },
            ].map((link) => (
              <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer">
                <Card className="h-full hover-lift cursor-pointer">
                  <CardContent className="flex items-center gap-3 py-4">
                    <link.icon className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{link.label}</p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <ExternalLink className="h-2.5 w-2.5" /> Opens in new tab
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </section>

        {/* Last Updated + Privacy Notice */}
        <Card className="border-muted bg-muted/30">
          <CardContent className="py-3 text-center space-y-1">
            <p className="text-[10px] text-muted-foreground">
              Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })} · Data from CMS, HRSA, CDC, MDHHS
            </p>
            <p className="text-xs text-muted-foreground">
              🔒 Michigan Access does not collect personal data. All information shown is from public sources.
              No cookies or tracking. <Link to="/accessibility" className="text-primary underline">Learn more</Link>
            </p>
          </CardContent>
        </Card>
      </div>
      
    </Layout>
  );
}
