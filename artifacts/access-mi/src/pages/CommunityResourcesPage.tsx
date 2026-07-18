import { useState, useMemo, useEffect, lazy, Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Apple, Home, Bus, Brain, Phone, ExternalLink, MapPin, Clock,
  Globe, Heart, Shield, Users, Filter, Search, Map, List, ChevronDown, ChevronUp, Sparkles,
  Zap, IdCard, Route, AlertTriangle
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCommunityResources, type CommunityResource } from "@/hooks/useCommunityResources";
import { useCounty } from "@/contexts/CountyContext";
import NearbyServicesPrompt from "@/components/shared/NearbyServicesPrompt";
import NearbyResourceFinder from "@/components/home/NearbyResourceFinder";
import ReferralToolkit from "@/components/shared/ReferralToolkit";
import ResourceSubmissionForm from "@/components/shared/ResourceSubmissionForm";
import ShareMenu from "@/components/shared/ShareMenu";
import DataTimestamp from "@/components/shared/DataTimestamp";
import ContentSkeleton from "@/components/shared/ContentSkeleton";
import EmptyState from "@/components/shared/EmptyState";

const EmbeddedMap = lazy(() => import("@/components/map/EmbeddedMap"));

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.3 } }),
};

const categories = [
  { key: "food", aliases: ["food", "food_nutrition"], label: "Food & Nutrition", icon: Apple, color: "text-michigan-forest-deep" },
  { key: "housing", aliases: ["housing", "housing_shelter"], label: "Housing & Shelter", icon: Home, color: "text-primary" },
  { key: "transportation", aliases: ["transportation"], label: "Transportation", icon: Bus, color: "text-michigan-teal-deep" },
  { key: "mental_health", aliases: ["mental_health", "substance_abuse"], label: "Mental Health", icon: Brain, color: "text-michigan-coral-deep" },
  { key: "veterans_seniors", aliases: ["veterans_seniors"], label: "Veterans & Seniors", icon: Shield, color: "text-michigan-gold-deep" },
  { key: "education", aliases: ["education"], label: "Education & Training", icon: Globe, color: "text-michigan-sky" },
  { key: "disaster_prep", aliases: ["disaster_prep"], label: "Disaster Prep", icon: Heart, color: "text-destructive" },
  { key: "youth_family", aliases: ["youth_family", "domestic_violence"], label: "Youth & Family", icon: Users, color: "text-michigan-forest-deep" },
  { key: "info_referral", aliases: ["information_referral", "health_services", "health_insurance", "employment"], label: "Info & Referral", icon: Phone, color: "text-muted-foreground" },
  { key: "environment", aliases: ["environment"], label: "Environment", icon: Map, color: "text-michigan-teal-deep" },
];

// Counties list is now dynamically derived from loaded resources

function ResourceCard({ r, i }: { r: CommunityResource; i: number }) {
  const cat = categories.find((c) => c.aliases.includes(r.resource_type));
  const Icon = cat?.icon || Heart;
  return (
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i % 10}>
      <Card className="hover-lift h-full">
        <CardContent className="py-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-muted ${cat?.color || "text-primary"}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-sm">{r.resource_name}</h3>
              {r.organization && <p className="text-xs text-muted-foreground">{r.organization}</p>}
            </div>
            <div className="flex gap-1.5 flex-shrink-0 flex-wrap justify-end">
              {r.is_free && <Badge className="bg-michigan-forest/10 text-michigan-forest-deep border-michigan-forest/20 text-[10px]">Free</Badge>}
              {r.walk_in_available && <Badge className="bg-michigan-teal/10 text-michigan-teal-deep border-michigan-teal/20 text-[10px]">Walk-ins Welcome</Badge>}
              {r.languages && r.languages.length > 1 && <Badge className="bg-michigan-sky/10 text-michigan-sky border-michigan-sky/20 text-[10px]">Bilingual Staff</Badge>}
              {r.accepts_insurance && <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">Takes Insurance</Badge>}
            </div>
          </div>

          {r.description && <p className="text-xs text-muted-foreground leading-relaxed">{r.description}</p>}

          {r.address && (
            <p className="text-xs text-muted-foreground">
              <MapPin className="mr-1 inline h-3 w-3" />{r.address}, {r.city}, {r.state} {r.zip} · {r.county} County
            </p>
          )}

          {r.hours && (
            <p className="text-xs text-muted-foreground">
              <Clock className="mr-1 inline h-3 w-3" />{r.hours}
            </p>
          )}

          {r.eligibility_notes && (
            <div className="rounded-md bg-muted/50 p-2">
              <p className="text-[11px] text-muted-foreground"><Shield className="mr-1 inline h-3 w-3" /><strong>Eligibility:</strong> {r.eligibility_notes}</p>
            </div>
          )}

          {r.services_offered && r.services_offered.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {r.services_offered.slice(0, 4).map((s) => (
                <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
              ))}
              {r.services_offered.length > 4 && <Badge variant="secondary" className="text-[10px]">+{r.services_offered.length - 4}</Badge>}
            </div>
          )}

          {r.languages && r.languages.length > 1 && (
            <p className="text-[11px] text-muted-foreground"><Globe className="mr-1 inline h-3 w-3" />{r.languages.join(", ")}</p>
          )}

          <div className="flex flex-wrap gap-2 pt-1 items-center">
            <ShareMenu title={r.resource_name} url={`https://accessmi.org/resources`} />
            {r.address && (
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${r.address}, ${r.city}, ${r.state} ${r.zip || ""}`)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="sm" variant="default" className="h-7 text-xs"><MapPin className="mr-1 h-3 w-3" />Get Directions</Button>
              </a>
            )}
            {r.phone && (
              <a href={`tel:${r.phone}`}>
                <Button size="sm" variant="outline" className="h-7 text-xs"><Phone className="mr-1 h-3 w-3" />{r.phone}</Button>
              </a>
            )}
            {r.website && (
              <a href={r.website} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="outline" className="h-7 text-xs"><ExternalLink className="mr-1 h-3 w-3" />Website</Button>
              </a>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ── Persona → category priority mapping ── */
const PERSONA_PRIORITY: Record<string, string[]> = {
  resident: ["food", "housing", "mental_health", "transportation", "info_referral"],
  "health-system": ["mental_health", "info_referral", "veterans_seniors", "education"],
};

const INITIAL_VISIBLE = 5;

interface SegmentFilter {
  key: string;
  label: string;
  icon: React.ElementType;
  match: (r: CommunityResource) => boolean;
}

const SEGMENT_FILTERS: SegmentFilter[] = [
  { key: "open_now", label: "Open Now", icon: Clock, match: (r) => r.is_open_now === true },
  { key: "24_7", label: "24/7 Available", icon: Zap, match: (r) => r.is_24_7 === true },
  { key: "bus_line", label: "On Bus Line", icon: Route, match: (r) => r.on_bus_line === true },
  { key: "no_id", label: "No ID Required", icon: IdCard, match: (r) => r.no_id_required === true },
];

export default function CommunityResourcesPage() {
  const { t } = useTranslation();
  const { county: globalCounty, audience } = useCounty();
  const [searchParams] = useSearchParams();
  const urlCounty = searchParams.get("county");
  const urlCategory = searchParams.get("category");

  const dynamicTitle = useMemo(() => {
    const cat = urlCategory ? categories.find(c => c.key === urlCategory || c.aliases.includes(urlCategory)) : null;
    const catLabel = cat?.label ?? null;
    if (catLabel && urlCounty) return `${catLabel} in ${urlCounty} County`;
    if (catLabel) return `${catLabel} Resources`;
    if (urlCounty) return `Resources in ${urlCounty} County`;
    return "Community Resources";
  }, [urlCategory, urlCounty]);

  usePageMeta({
    title: dynamicTitle,
    description: "Food, housing, transportation, and support services available to Michigan residents.",
    path: "/resources",
    jsonLd: {
      "@type": "WebPage",
      "name": `${dynamicTitle} - Access Michigan`,
      "description": "Food, housing, transportation, and mental health support services across all 83 Michigan counties.",
      "url": "https://accessmi.org/resources",
      "provider": { "@type": "Organization", "name": "Access Michigan" },
    },
  });
  // Load ALL resources - local dropdown and tabs handle filtering
  const { data: resources = [], isLoading } = useCommunityResources();

  // Resolve initial category from URL param
  const initialTab = useMemo(() => {
    if (!urlCategory) return "all";
    const match = categories.find(c => c.key === urlCategory || c.aliases.includes(urlCategory));
    return match ? match.key : "all";
  }, [urlCategory]);

  const [activeTab, setActiveTab] = useState(initialTab);
  const [county, setCounty] = useState(urlCounty || globalCounty || "All Counties");
  const [search, setSearch] = useState("");
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [activeSegments, setActiveSegments] = useState<Set<string>>(new Set());

  const toggleSegment = (key: string) => {
    setActiveSegments(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
    setShowAll(false);
  };

  // Sync local county filter with global context (only if no URL override)
  useEffect(() => {
    if (!urlCounty && globalCounty) setCounty(globalCounty);
  }, [globalCounty, urlCounty]);

  const availableCounties = useMemo(() => {
    const set = new Set(resources.map(r => r.county));
    return ["All Counties", ...Array.from(set).sort()];
  }, [resources]);

  // Resources scoped by county, search, and segment filters - but NOT by the
  // active category tab. Category counts and the results header both derive
  // from this same scope so the numbers stay consistent (e.g. a Wayne header
  // count matches the sum of the Wayne category cards on the same screen).
  const scopedResources = useMemo(() => {
    let result = [...resources];
    if (county !== "All Counties") result = result.filter((r) => r.county === county);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((r) =>
        r.resource_name.toLowerCase().includes(q) ||
        r.organization?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.services_offered?.some((s) => s.toLowerCase().includes(q))
      );
    }
    if (activeSegments.size > 0) {
      result = result.filter(r =>
        Array.from(activeSegments).every(key => {
          const seg = SEGMENT_FILTERS.find(s => s.key === key);
          return seg ? seg.match(r) : true;
        })
      );
    }
    return result;
  }, [resources, county, search, activeSegments]);

  const filtered = useMemo(() => {
    if (activeTab === "all") return scopedResources;
    const activeCat = categories.find(c => c.key === activeTab);
    if (!activeCat) return scopedResources;
    return scopedResources.filter((r) => activeCat.aliases.includes(r.resource_type));
  }, [scopedResources, activeTab]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: scopedResources.length };
    categories.forEach((cat) => { c[cat.key] = scopedResources.filter((r) => cat.aliases.includes(r.resource_type)).length; });
    return c;
  }, [scopedResources]);

  // Persona-driven category ordering
  const sortedCategories = useMemo(() => {
    const priority = PERSONA_PRIORITY[audience || "resident"] || PERSONA_PRIORITY.resident;
    return [...categories].sort((a, b) => {
      const ai = priority.indexOf(a.key);
      const bi = priority.indexOf(b.key);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return 0;
    });
  }, [audience]);

  // Top recommended categories (first 3 from persona priority with resources)
  const topCategories = useMemo(() =>
    sortedCategories.filter(c => (counts[c.key] || 0) > 0).slice(0, 3),
    [sortedCategories, counts]
  );

  // Visible results: show INITIAL_VISIBLE unless showAll
  const visibleResults = useMemo(() =>
    showAll ? filtered : filtered.slice(0, INITIAL_VISIBLE),
    [filtered, showAll]
  );

  return (
    <Layout>
      {/* County context banner - above hero for immediate visibility */}
      {globalCounty && (
        <div className="bg-primary/10 border-b border-primary/20 px-4 py-2.5">
          <div className="container flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-foreground">
                Showing resources for <strong>{globalCounty} County</strong>.
              </span>
            </div>
          </div>
        </div>
      )}
      <section className="bg-gradient-to-b from-accent/5 to-background py-10 lg:py-16">
        <div className="container max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="mb-4 inline-block rounded-full bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent">
              {t('resources.badge')}
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-3 text-3xl font-bold text-foreground lg:text-5xl">
            {t('resources.title')}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mx-auto max-w-2xl text-lg text-muted-foreground">
            {t('resources.subtitle')}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mx-auto mt-6 max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder={t('resources.searchPlaceholder')} value={search} onChange={(e) => setSearch(e.target.value)} className="h-12 pl-12 text-base shadow-michigan" />
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container max-w-6xl py-8 space-y-6">
        {/* View toggle: List / Map */}
        <Tabs defaultValue="list">
          <TabsList>
            <TabsTrigger value="list"><List className="mr-1.5 h-4 w-4" />List View</TabsTrigger>
            <TabsTrigger value="map"><Map className="mr-1.5 h-4 w-4" />Map View</TabsTrigger>
          </TabsList>
          <TabsContent value="map" className="mt-4 space-y-3">
            {/* Map Legend with real-time counts */}
            <div className="flex flex-wrap gap-3 items-center">
              {categories.map((cat) => {
                const geoCount = resources.filter(r => r.resource_type === cat.key && r.latitude && r.longitude).length;
                return (
                  <div key={cat.key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className={`h-2.5 w-2.5 rounded-full`} style={{ background: cat.key === "food" ? "#2D5F3F" : cat.key === "housing" ? "#003B5C" : cat.key === "transportation" ? "#00A3A1" : "#E85D4A" }} />
                    <span>{cat.label}</span>
                    <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">{geoCount}</Badge>
                  </div>
                );
              })}
              <span className="text-[10px] text-muted-foreground ml-auto">
                {resources.filter(r => r.latitude && r.longitude).length} of {resources.length} mapped
              </span>
            </div>
            <Suspense fallback={<div className="h-[500px] rounded-lg bg-muted animate-pulse" />}>
              <EmbeddedMap
                resources={resources.filter(r => r.latitude && r.longitude).map(r => ({
                  latitude: r.latitude ?? null,
                  longitude: r.longitude ?? null,
                  resource_name: r.resource_name,
                  resource_type: r.resource_type,
                  address: r.address,
                  city: r.city,
                }))}
                county={globalCounty}
                height="500px"
              />
            </Suspense>
            <p className="text-[10px] text-muted-foreground text-center">
              Showing {resources.filter(r => r.latitude && r.longitude).length} resources with verified locations
            </p>
          </TabsContent>
          <TabsContent value="list" className="mt-4 space-y-6">
        {/* Smart Filter - recommended categories */}
        {!search && activeTab === "all" && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">
                Recommended for {audience === "health-system" ? "Health Systems" : "You"}
              </p>
            </div>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
              {topCategories.map((cat, i) => (
                <motion.div key={cat.key} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                  <Card
                    className={`cursor-pointer transition-all ${activeTab === cat.key ? "ring-2 ring-primary" : "hover:bg-muted/50 hover:shadow-md"}`}
                    onClick={() => { setActiveTab(cat.key); setShowAll(false); }}
                  >
                    <CardContent className="flex items-center gap-3 py-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-muted ${cat.color}`}>
                        <cat.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{cat.label}</p>
                        <p className="text-xs text-muted-foreground">{counts[cat.key] || 0} resources</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Collapsible full category grid */}
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFiltersExpanded(!filtersExpanded)}
            className="text-muted-foreground hover:text-foreground gap-1.5"
            aria-expanded={filtersExpanded}
          >
            <Filter className="h-4 w-4" />
            {filtersExpanded ? "Hide all categories" : `Browse all ${categories.length} categories`}
            {filtersExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </Button>
          <AnimatePresence>
            {filtersExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 mt-3">
                  {sortedCategories.map((cat, i) => (
                    <motion.div key={cat.key} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                      <Card
                        className={`cursor-pointer transition-all ${activeTab === cat.key ? "ring-2 ring-primary" : "hover:bg-muted/50"}`}
                        onClick={() => { setActiveTab(activeTab === cat.key ? "all" : cat.key); setShowAll(false); }}
                      >
                        <CardContent className="flex items-center gap-3 py-3">
                          <cat.icon className={`h-6 w-6 ${cat.color}`} />
                          <div>
                            <p className="text-lg font-bold text-foreground">{counts[cat.key] || 0}</p>
                            <p className="text-[11px] text-muted-foreground">{cat.label}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Active filter chip */}
        {activeTab !== "all" && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1.5 py-1">
              {categories.find(c => c.key === activeTab)?.label}
              <button onClick={() => { setActiveTab("all"); setShowAll(false); }} className="ml-1 hover:text-destructive" aria-label="Clear filter">×</button>
            </Badge>
          </div>
        )}

        {/* Segment filter pills */}
        <div className="flex flex-wrap gap-2">
          {SEGMENT_FILTERS.map(sf => {
            const active = activeSegments.has(sf.key);
            return (
              <button
                key={sf.key}
                onClick={() => toggleSegment(sf.key)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-all",
                  active
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                )}
                aria-pressed={active}
              >
                <sf.icon className="h-3.5 w-3.5" />
                {sf.label}
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">{filtered.length}</strong> resources
              {activeTab !== "all" && ` in ${categories.find((c) => c.key === activeTab)?.label}`}
            </p>
            <DataTimestamp table="community_resources" />
          </div>
          <Select value={county} onValueChange={setCounty}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              {availableCounties.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Results - progressive disclosure */}
        {isLoading ? (
          <ContentSkeleton variant="cards" count={6} />
        ) : filtered.length === 0 ? (
          <div className="space-y-4">
            <Card className="border-destructive/30 bg-destructive/5">
              <CardContent className="py-6 text-center space-y-3">
                <AlertTriangle className="h-10 w-10 text-destructive mx-auto" />
                <h3 className="text-lg font-semibold text-foreground">We couldn't find resources matching all these exact filters.</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Try removing a filter, or call{" "}
                  <a href="tel:211" className="font-bold text-primary underline hover:text-primary/80">2-1-1</a>{" "}
                  right now to speak with a human who can help.
                </p>
                <Button variant="outline" size="sm" onClick={() => { setSearch(""); setActiveTab("all"); setCounty("All Counties"); setActiveSegments(new Set()); setShowAll(false); }}>
                  Clear all filters
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {visibleResults.map((r, i) => <ResourceCard key={r.id} r={r} i={i} />)}
            </div>
            {filtered.length > INITIAL_VISIBLE && (
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={() => setShowAll(!showAll)}
                  className="gap-1.5"
                >
                  {showAll ? (
                    <><ChevronUp className="h-4 w-4" />Show fewer results</>
                  ) : (
                    <><ChevronDown className="h-4 w-4" />Show all {filtered.length} results</>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        <NearbyResourceFinder />
        <NearbyServicesPrompt className="mt-4" />

        {/* Crisis banner */}
        <Card className="border-michigan-coral/20 bg-michigan-coral/5">
          <CardContent className="py-4 text-center">
            <p className="text-sm font-semibold text-foreground">In a crisis? Call or text <strong>988</strong> for the Suicide & Crisis Lifeline</p>
            <p className="text-xs text-muted-foreground mt-1">Michigan Crisis Line: <a href="tel:8885526642" className="text-primary underline">888-552-6642</a> · United Way 211: Dial <strong>211</strong></p>
          </CardContent>
        </Card>

        <ResourceSubmissionForm />
        <ReferralToolkit pageTitle="Community Resources" />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
