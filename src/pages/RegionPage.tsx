import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { usePageMeta } from "@/hooks/usePageMeta";
import { lazy, Suspense, useMemo } from "react";
import {
  MapPin, Users, Heart, Building2, TrendingUp, TrendingDown,
  Minus, ArrowLeft, ExternalLink, BarChart3
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MICHIGAN_REGIONS, type MichiganRegion } from "@/data/michigan-regions";
import { getCountyProfile, COUNTY_PROFILES } from "@/data/michigan-county-profiles";
import { countyToSlug } from "@/utils/countyUtils";
import { useFacilities } from "@/hooks/useFacilities";
import { useCommunityResources } from "@/hooks/useCommunityResources";

const EmbeddedMap = lazy(() => import("@/components/map/EmbeddedMap"));

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.3 } }),
};

const BENCHMARKS: Record<string, { state: string; us: string }> = {
  "Uninsured rate":    { state: "6.5%", us: "8.0%" },
  "Food insecurity":   { state: "13.2%", us: "13.5%" },
  "Primary care ratio": { state: "1,280:1", us: "1,310:1" },
};

function aggregateRegionMetrics(region: MichiganRegion) {
  let totalPop = 0;
  const metricSums: Record<string, { sum: number; count: number }> = {};

  region.counties.forEach(c => {
    const p = getCountyProfile(c);
    totalPop += p.population;
    p.healthHighlights.forEach(h => {
      let num: number;
      if (h.label.includes("ratio")) {
        // Parse "1,320:1" → 1320
        num = parseInt(h.value.split(":")[0].replace(/,/g, ""), 10);
      } else {
        num = parseFloat(h.value.replace(/%/g, ""));
      }
      if (!isNaN(num)) {
        if (!metricSums[h.label]) metricSums[h.label] = { sum: 0, count: 0 };
        metricSums[h.label].sum += num;
        metricSums[h.label].count += 1;
      }
    });
  });

  const avgMetrics = Object.entries(metricSums).map(([label, { sum, count }]) => ({
    label,
    value: label.includes("ratio") ? `${Math.round(sum / count).toLocaleString()}:1` : `${(sum / count).toFixed(1)}%`,
    numericAvg: sum / count,
  }));

  return { totalPop, avgMetrics };
}

export default function RegionPage() {
  const { regionId } = useParams<{ regionId: string }>();
  const region = MICHIGAN_REGIONS.find(r => r.id === regionId);

  usePageMeta({
    title: region ? `${region.name} — Regional Overview` : "Region Not Found",
    description: region ? region.description : "Region not found.",
    path: `/region/${regionId}`,
  });

  const { totalPop, avgMetrics } = useMemo(() => region ? aggregateRegionMetrics(region) : { totalPop: 0, avgMetrics: [] }, [region]);
  const { data: facilities = [] } = useFacilities(undefined, undefined);
  const { data: resources = [] } = useCommunityResources(undefined, undefined);

  if (!region) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground">Region Not Found</h1>
          <p className="mt-2 text-muted-foreground">The region "{regionId}" was not recognized.</p>
          <Link to="/regions"><Button className="mt-4"><ArrowLeft className="mr-2 h-4 w-4" />All Regions</Button></Link>
        </div>
      </Layout>
    );
  }

  const regionFacilities = facilities.filter(f => region.counties.includes(f.county as any));
  const regionResources = resources.filter(r => region.counties.includes(r.county as any));

  const countyBreakdown = region.counties
    .map(c => ({ county: c, profile: getCountyProfile(c) }))
    .sort((a, b) => b.profile.population - a.profile.population);

  const accessGaps = avgMetrics.map(m => {
    const bench = BENCHMARKS[m.label];
    if (!bench) return null;
    const benchVal = parseFloat(bench.state.replace(/[^0-9.]/g, ""));
    const diff = m.numericAvg - benchVal;
    return { label: m.label, regionAvg: m.value, stateAvg: bench.state, usAvg: bench.us, diff, worse: diff > 0 };
  }).filter(Boolean);

  return (
    <Layout>
      <Breadcrumbs items={[{ label: "Regions", href: "/regions" }, { label: region.name }]} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/8 via-primary/3 to-background py-12 md:py-16">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-3 w-3 rounded-full" style={{ background: region.color }} />
              <Badge variant="outline" className="text-xs">{region.counties.length} Counties</Badge>
            </div>
            <h1 className="text-3xl font-bold text-foreground md:text-4xl mb-2">{region.name}</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">{region.description}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Combined population: <strong className="text-foreground">{totalPop.toLocaleString()}</strong> · {regionFacilities.length} facilities · {regionResources.length} community resources
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container py-8 space-y-10">
        {/* Regional Health Benchmarks */}
        <section>
          <h2 className="mb-4 text-xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Regional Health Benchmarks
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {accessGaps.map((gap, i) => gap && (
              <motion.div key={gap.label} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <Card className="hover-lift">
                  <CardContent className="py-4 space-y-2">
                    <p className="text-xs text-muted-foreground">{gap.label}</p>
                    <p className="text-xl font-bold text-foreground">{gap.regionAvg}</p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant={gap.worse ? "destructive" : "secondary"}
                          className={`text-[10px] px-1.5 py-0 ${!gap.worse ? "bg-michigan-forest/10 text-michigan-forest border-michigan-forest/20" : ""}`}
                        >
                          {gap.worse ? "Above" : "Below"} state avg
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">MI: {gap.stateAvg}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-muted-foreground">US: {gap.usAvg}</span>
                      </div>
                    </div>
                    {gap.worse && (
                      <p className="text-[10px] text-michigan-coral font-medium">
                        ⚠ Access gap: {Math.abs(gap.diff).toFixed(1)} pts above state average
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Map */}
        <section>
          <h2 className="mb-4 text-xl font-bold text-foreground">Regional Facilities Map</h2>
          <Suspense fallback={<div className="h-[400px] rounded-lg bg-muted animate-pulse" />}>
            <EmbeddedMap facilities={regionFacilities} resources={regionResources.filter(r => r.latitude && r.longitude).map(r => ({
              latitude: r.latitude, longitude: r.longitude, resource_name: r.resource_name,
              resource_type: r.resource_type, address: r.address, city: r.city,
            }))} height="400px" />
          </Suspense>
        </section>

        {/* County Breakdown */}
        <section>
          <h2 className="mb-4 text-xl font-bold text-foreground">Counties in This Region</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {countyBreakdown.map((item, i) => (
              <motion.div key={item.county} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <Link to={`/county/${countyToSlug(item.county)}`}>
                  <Card className="h-full hover-lift cursor-pointer">
                    <CardContent className="py-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-sm text-foreground">{item.county} County</h3>
                        <Badge variant="outline" className="text-[10px]">{item.profile.countyType}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        <Users className="inline h-3 w-3 mr-1" />Pop. {item.profile.population.toLocaleString()}
                        {item.profile.majorCities.length > 0 && ` · ${item.profile.majorCities.slice(0, 2).join(", ")}`}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {item.profile.healthHighlights.slice(0, 2).map(h => (
                          <Badge key={h.label} variant="secondary" className="text-[10px]">
                            {h.label}: {h.value}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-[10px] text-primary font-medium flex items-center gap-1">
                        View county details <ExternalLink className="h-2.5 w-2.5" />
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Resource types breakdown */}
        {regionResources.length > 0 && (
          <section>
            <h2 className="mb-4 text-xl font-bold text-foreground">Community Resources by Type</h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(
                regionResources.reduce((acc, r) => {
                  acc[r.resource_type] = (acc[r.resource_type] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
                <Badge key={type} variant="secondary" className="text-sm py-1 px-3">
                  {type.replace(/_/g, " ")} · {count}
                </Badge>
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
