import { useState, useCallback, useMemo } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, MapPin, X, Phone, Stethoscope, Heart, Brain, DollarSign,
  Filter, ChevronDown, ChevronUp, Accessibility,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import HelpCategoryCombobox from "@/components/findcare/HelpCategoryCombobox";
import SpecialtyPicker from "@/components/findcare/SpecialtyPicker";
import NPIResultCard from "@/components/findcare/NPIResultCard";
import StaticResourceCard from "@/components/findcare/StaticResourceCard";
import DVSafetyInterstitial from "@/components/findcare/DVSafetyInterstitial";
import { useNPISearch } from "@/hooks/useNPISearch";
import { findCategory, type HelpCategory } from "@/data/findhelp-categories";
import { STATIC_RESOURCES } from "@/data/findhelp-resources";
import { Link } from "react-router-dom";

/* ── Crisis banner ────────────────────────────── */
function CrisisBanner() {
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem("crisis-banner-dismissed") === "1");
  if (dismissed) return null;
  return (
    <div className="bg-muted border-b border-border px-4 py-2.5">
      <div className="container flex items-center justify-between gap-3 text-sm">
        <p className="text-foreground">
          <strong>Need immediate help?</strong>{" "}
          <a href="tel:988" className="underline font-semibold">988</a> (crisis) ·{" "}
          <a href="tel:211" className="underline font-semibold">2-1-1</a> (any need) ·{" "}
          <a href="tel:911" className="underline font-semibold">911</a> (emergency)
        </p>
        <button
          onClick={() => { setDismissed(true); sessionStorage.setItem("crisis-banner-dismissed", "1"); }}
          className="shrink-0 rounded-md p-1 hover:bg-muted-foreground/10 transition-colors"
          aria-label="Dismiss crisis banner"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}

/* ── Quick-link cards for initial state ────────── */
const QUICK_LINKS: { label: string; value: string; icon: typeof Heart; color: string }[] = [
  { label: "Find a Doctor", value: "doctor", icon: Stethoscope, color: "bg-primary/10 text-primary" },
  { label: "Mental Health Support", value: "mental-health", icon: Brain, color: "bg-michigan-teal/10 text-michigan-teal" },
  { label: "Food Assistance", value: "food", icon: Heart, color: "bg-michigan-coral/10 text-michigan-coral" },
  { label: "Help Paying Bills", value: "financial", icon: DollarSign, color: "bg-michigan-gold/10 text-michigan-gold" },
];

/* ── Main page ────────────────────────────────── */
export default function FindCarePage() {
  usePageMeta({
    title: "Find Help — Access Michigan",
    description: "Find doctors, health centers, food assistance, housing help, and more — all across Michigan. Free. Private. No account needed.",
    path: "/find-care",
    jsonLd: {
      "@type": "MedicalWebPage",
      "name": "Find Help — Access Michigan",
      "about": { "@type": "MedicalCondition", "name": "Healthcare Access" },
      "audience": { "@type": "PeopleAudience", "geographicArea": { "@type": "State", "name": "Michigan" } },
    },
  });

  const [categoryValue, setCategoryValue] = useState("");
  const [category, setCategory] = useState<HelpCategory | null>(null);
  const [specialty, setSpecialty] = useState("");
  const [location, setLocation] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // NPI search
  const npi = useNPISearch();

  // Filters for NPI results
  const [filterType, setFilterType] = useState<"all" | "individual" | "org">("all");
  const [filterGender, setFilterGender] = useState<"all" | "F" | "M">("all");
  const [filterADA, setFilterADA] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeFilterCount = useMemo(() => {
    let c = 0;
    if (filterType !== "all") c++;
    if (filterGender !== "all") c++;
    if (filterADA) c++;
    return c;
  }, [filterType, filterGender, filterADA]);

  const filteredNPI = useMemo(() => {
    let r = npi.results;
    if (filterType === "individual") r = r.filter((p) => !p.isOrganization);
    if (filterType === "org") r = r.filter((p) => p.isOrganization);
    if (filterGender !== "all") r = r.filter((p) => p.gender === filterGender);
    return r;
  }, [npi.results, filterType, filterGender]);

  const handleCategoryChange = useCallback((val: string, cat: HelpCategory) => {
    setCategoryValue(val);
    setCategory(cat);
    setSpecialty("");
    setHasSearched(false);
    npi.reset();
  }, [npi]);

  const handleQuickLink = useCallback((val: string) => {
    const cat = findCategory(val);
    if (cat) {
      setCategoryValue(val);
      setCategory(cat);
      setSpecialty("");
      setHasSearched(false);
      npi.reset();
      // For static categories, show immediately
      if (cat.mode === "static") {
        setHasSearched(true);
      }
    }
  }, [npi]);

  const handleSearch = useCallback(() => {
    if (!category) return;
    setHasSearched(true);

    if (category.mode === "npi") {
      const taxonomies = category.showSpecialtyPicker && specialty
        ? [specialty]
        : category.taxonomies || [];
      npi.search(taxonomies, category.enumerationType || "NPI-1", location);
    }
    // Static mode just sets hasSearched=true, cards render instantly
  }, [category, specialty, location, npi]);

  const clearFilters = useCallback(() => {
    setFilterType("all");
    setFilterGender("all");
    setFilterADA(false);
  }, []);

  const isInitial = !hasSearched;
  const isNPIMode = category?.mode === "npi";
  const isStaticMode = category?.mode === "static";
  const isDV = categoryValue === "dv";
  const staticResources = isStaticMode ? STATIC_RESOURCES[categoryValue] || [] : [];

  /* ── Filter sidebar content ── */
  const FiltersContent = () => (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Provider Type</p>
        <label className="flex items-center gap-2 py-1.5 cursor-pointer">
          <Checkbox checked={filterType === "individual"} onCheckedChange={(c) => setFilterType(c ? "individual" : "all")} />
          <span className="text-sm">Individual providers (doctors, therapists)</span>
        </label>
        <label className="flex items-center gap-2 py-1.5 cursor-pointer">
          <Checkbox checked={filterType === "org"} onCheckedChange={(c) => setFilterType(c ? "org" : "all")} />
          <span className="text-sm">Organizations (clinics, hospitals, health centers)</span>
        </label>
      </div>
      <Separator />
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gender</p>
        <label className="flex items-center gap-2 py-1.5 cursor-pointer">
          <Checkbox checked={filterGender === "F"} onCheckedChange={(c) => setFilterGender(c ? "F" : "all")} />
          <span className="text-sm">Female</span>
        </label>
        <label className="flex items-center gap-2 py-1.5 cursor-pointer">
          <Checkbox checked={filterGender === "M"} onCheckedChange={(c) => setFilterGender(c ? "M" : "all")} />
          <span className="text-sm">Male</span>
        </label>
      </div>
      <Separator />
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
          <Accessibility className="h-3 w-3" /> Accessibility
        </p>
        <label className="flex items-center gap-2 py-1.5 cursor-pointer">
          <Checkbox checked={filterADA} onCheckedChange={(c) => setFilterADA(!!c)} />
          <span className="text-sm">ADA / Wheelchair Accessible</span>
        </label>
      </div>
      {activeFilterCount > 0 && (
        <>
          <Separator />
          <button onClick={clearFilters} className="text-sm text-primary hover:underline">Clear filters</button>
        </>
      )}
    </div>
  );

  return (
    <Layout>
      <CrisisBanner />

      <div className="container pt-4">
        <Breadcrumbs items={[{ label: "Find Help" }]} />
      </div>

      {/* ── Hero Search ── */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-8 lg:py-12">
        <div className="container max-w-3xl">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-2 text-3xl font-bold text-foreground lg:text-4xl text-center"
          >
            Find Help
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mx-auto max-w-xl text-center text-muted-foreground mb-6"
          >
            Find doctors, health centers, food assistance, housing help, and more — all across Michigan. Free. Private. No account needed.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-3"
          >
            {/* Category combobox */}
            <HelpCategoryCombobox value={categoryValue} onChange={handleCategoryChange} />

            {/* Specialty picker — only for doctor category */}
            <AnimatePresence>
              {category?.showSpecialtyPicker && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <SpecialtyPicker value={specialty} onChange={setSpecialty} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Location input + search button */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="City, ZIP code, or county"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-12 pl-10 text-base"
                  aria-label="Where in Michigan?"
                  onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={!category}
                className="h-12 px-8 text-base font-semibold sm:w-auto w-full"
                size="lg"
              >
                <Search className="mr-2 h-4 w-4" />
                Find Help
              </Button>
            </div>
          </motion.div>

          {/* 211 callout */}
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Or call{" "}
            <a href="tel:211" className="font-bold text-primary underline">2-1-1</a>{" "}
            — free, confidential help 24/7
          </p>
        </div>
      </section>

      {/* ── Results area ── */}
      <div className="container py-8">
        {/* Initial state — quick link cards */}
        {isInitial && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="max-w-3xl mx-auto"
          >
            <p className="text-sm font-medium text-muted-foreground mb-4 text-center">Common needs:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {QUICK_LINKS.map((ql) => (
                <button
                  key={ql.value}
                  onClick={() => handleQuickLink(ql.value)}
                  className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center transition-all hover:border-primary/30 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${ql.color} transition-transform group-hover:scale-110`}>
                    <ql.icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{ql.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* NPI loading state */}
        {isNPIMode && npi.isLoading && (
          <div className="max-w-3xl mx-auto" aria-live="polite">
            <p className="text-sm text-muted-foreground mb-4">Searching providers across Michigan…</p>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          </div>
        )}

        {/* NPI error */}
        {isNPIMode && npi.error && (
          <div className="max-w-3xl mx-auto text-center py-12" role="alert">
            <p className="text-muted-foreground mb-4">{npi.error}</p>
            <Button variant="outline" onClick={handleSearch}>Try Again</Button>
          </div>
        )}

        {/* NPI results */}
        {isNPIMode && npi.searched && !npi.isLoading && !npi.error && (
          <div className="flex gap-8">
            {/* Desktop filter sidebar */}
            <aside className="hidden lg:block w-56 shrink-0">
              <div className="sticky top-20 space-y-4">
                <h3 className="text-sm font-bold text-foreground">Narrow Your Results</h3>
                <FiltersContent />
              </div>
            </aside>

            <div className="flex-1 min-w-0">
              {/* Results header */}
              <div className="mb-4 flex items-center justify-between flex-wrap gap-3" aria-live="polite">
                <p className="text-sm text-muted-foreground">
                  Showing <strong className="text-foreground">{filteredNPI.length}</strong> providers
                  {location && <> near <strong className="text-foreground">{location}</strong></>}
                </p>
                {/* Mobile filter trigger */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button size="sm" variant="outline" className="lg:hidden">
                      <Filter className="mr-1.5 h-4 w-4" />
                      Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="rounded-t-2xl">
                    <SheetTitle>Narrow Your Results</SheetTitle>
                    <div className="mt-4 pb-6">
                      <FiltersContent />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {filteredNPI.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <p className="text-muted-foreground">
                    No results found{specialty && <> for <strong>{specialty}</strong></>}{location && <> near <strong>{location}</strong></>}.
                  </p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>• Try a nearby city or ZIP code</p>
                    <p>• Try a broader specialty (e.g., "Internal Medicine" instead of "Endocrinology")</p>
                    <p>• Call <a href="tel:211" className="text-primary underline font-semibold">2-1-1</a> — a real person can help you find care, free and confidential</p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {filteredNPI.map((p, i) => (
                    <NPIResultCard key={p.npi} provider={p} index={i} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Static resource cards */}
        {isStaticMode && hasSearched && (
          <div className="max-w-3xl mx-auto space-y-4">
            {/* DV safety interstitial */}
            {isDV && <DVSafetyInterstitial />}

            <div className="grid gap-3 md:grid-cols-2">
              {staticResources.map((r, i) => (
                <StaticResourceCard key={r.name} resource={r} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Disclaimer ── */}
      {hasSearched && (
        <div className="container pb-10">
          <Separator className="mb-6" />
          <p className="text-xs text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Provider data from the CMS National Provider Registry (NPPES), updated monthly. Listings may not reflect current availability or insurance acceptance. Always call to verify. Community resource links are maintained by their respective organizations. This site does not collect or store your search information.
          </p>
        </div>
      )}
    </Layout>
  );
}
