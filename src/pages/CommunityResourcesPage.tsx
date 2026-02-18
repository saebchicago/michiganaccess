import { useState, useMemo, lazy, Suspense } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Apple, Home, Bus, Brain, Phone, ExternalLink, MapPin, Clock,
  Globe, Heart, Shield, Users, Filter, Search, Map, List
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCommunityResources, type CommunityResource } from "@/hooks/useCommunityResources";
import { useCounty } from "@/contexts/CountyContext";
import NearbyServicesPrompt from "@/components/shared/NearbyServicesPrompt";
import ReferralToolkit from "@/components/shared/ReferralToolkit";
import ShareMenu from "@/components/shared/ShareMenu";

const EmbeddedMap = lazy(() => import("@/components/map/EmbeddedMap"));

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.3 } }),
};

const categories = [
  { key: "food", aliases: ["food", "food_nutrition"], label: "Food & Nutrition", icon: Apple, color: "text-michigan-forest" },
  { key: "housing", aliases: ["housing", "housing_shelter"], label: "Housing & Shelter", icon: Home, color: "text-primary" },
  { key: "transportation", aliases: ["transportation"], label: "Transportation", icon: Bus, color: "text-michigan-teal" },
  { key: "mental_health", aliases: ["mental_health", "substance_abuse"], label: "Mental Health", icon: Brain, color: "text-michigan-coral" },
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
            <div className="flex gap-1.5 flex-shrink-0">
              {r.is_free && <Badge className="bg-michigan-forest/10 text-michigan-forest border-michigan-forest/20 text-[10px]">Free</Badge>}
              {r.walk_in_available && <Badge className="bg-michigan-teal/10 text-michigan-teal border-michigan-teal/20 text-[10px]">Walk-in</Badge>}
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
            <ShareMenu title={r.resource_name} url={`https://michiganaccess.lovable.app/resources`} />
            {r.phone && (
              <a href={`tel:${r.phone}`}>
                <Button size="sm" variant="outline" className="h-7 text-xs"><Phone className="mr-1 h-3 w-3" />{r.phone}</Button>
              </a>
            )}
            {r.website && (
              <a href={r.website} target="_blank" rel="noopener">
                <Button size="sm" variant="outline" className="h-7 text-xs"><ExternalLink className="mr-1 h-3 w-3" />Website</Button>
              </a>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function CommunityResourcesPage() {
  const { t } = useTranslation();
  const { county: globalCounty } = useCounty();
  usePageMeta({
    title: "Community Resources",
    description: "Food, housing, transportation, and support services available to Michigan residents.",
    path: "/resources",
    jsonLd: {
      "@type": "WebPage",
      "name": "Community Resources — Michigan Access",
      "description": "Food, housing, transportation, and mental health support services across all 83 Michigan counties.",
      "url": "https://michiganaccess.lovable.app/resources",
      "provider": { "@type": "Organization", "name": "Michigan Access" },
    },
  });
  // Load ALL resources — local dropdown and tabs handle filtering
  const { data: resources = [], isLoading } = useCommunityResources();
  const [activeTab, setActiveTab] = useState("all");
  const [county, setCounty] = useState("All Counties");
  const [search, setSearch] = useState("");

  const availableCounties = useMemo(() => {
    const set = new Set(resources.map(r => r.county));
    return ["All Counties", ...Array.from(set).sort()];
  }, [resources]);

  const filtered = useMemo(() => {
    let result = [...resources];
    if (activeTab !== "all") {
      const activeCat = categories.find(c => c.key === activeTab);
      if (activeCat) result = result.filter((r) => activeCat.aliases.includes(r.resource_type));
    }
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
    return result;
  }, [resources, activeTab, county, search]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: resources.length };
    categories.forEach((cat) => { c[cat.key] = resources.filter((r) => cat.aliases.includes(r.resource_type)).length; });
    return c;
  }, [resources]);

  return (
    <Layout>
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
        {/* Category stats */}
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
          {categories.map((cat, i) => (
            <motion.div key={cat.key} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
              <Card className={`cursor-pointer transition-all ${activeTab === cat.key ? "ring-2 ring-primary" : "hover:bg-muted/50"}`} onClick={() => setActiveTab(activeTab === cat.key ? "all" : cat.key)}>
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

        {/* Filters */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">{filtered.length}</strong> resources
            {activeTab !== "all" && ` in ${categories.find((c) => c.key === activeTab)?.label}`}
          </p>
          <Select value={county} onValueChange={setCounty}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              {availableCounties.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-lg font-medium text-foreground">No resources found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your filters or search</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((r, i) => <ResourceCard key={r.id} r={r} i={i} />)}
          </div>
        )}

        <NearbyServicesPrompt className="mt-4" />

        {/* Crisis banner */}
        <Card className="border-michigan-coral/20 bg-michigan-coral/5">
          <CardContent className="py-4 text-center">
            <p className="text-sm font-semibold text-foreground">In a crisis? Call or text <strong>988</strong> for the Suicide & Crisis Lifeline</p>
            <p className="text-xs text-muted-foreground mt-1">Michigan Crisis Line: <a href="tel:8885526642" className="text-primary underline">888-552-6642</a> · United Way 211: Dial <strong>211</strong></p>
          </CardContent>
        </Card>

        <ReferralToolkit pageTitle="Community Resources" />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
