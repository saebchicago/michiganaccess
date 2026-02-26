import { useState, useCallback, useMemo, useEffect } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, MapPin, X, Phone, Stethoscope, Heart, Brain, DollarSign,
  Filter, ChevronDown, ChevronUp, Accessibility, User, Hash, Info,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { TruncatedResourceList } from "@/components/shared/TruncatedResourceList";
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
import { useNPISearch, type NPISearchMode } from "@/hooks/useNPISearch";
import { findCategory, type HelpCategory } from "@/data/findhelp-categories";
import { STATIC_RESOURCES } from "@/data/findhelp-resources";
import { Link, useSearchParams } from "react-router-dom";
import ResultHeader from "@/components/shared/ResultHeader";

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
  { label: "Primary Care", value: "doctor", icon: Stethoscope, color: "bg-primary/10 text-primary" },
  { label: "Mental Health", value: "mental-health", icon: Brain, color: "bg-michigan-teal/10 text-michigan-teal" },
  { label: "Food Assistance", value: "food", icon: Heart, color: "bg-michigan-coral/10 text-michigan-coral" },
  { label: "Help Paying Bills", value: "financial", icon: DollarSign, color: "bg-michigan-gold/10 text-michigan-gold" },
];

/* ── Care type pills for service-line filtering ── */
const CARE_TYPES: { id: string; label: string; match: string[] }[] = [
  { id: "primary-care", label: "Primary Care", match: ["family medicine", "internal medicine", "general practice"] },
  { id: "pediatrics", label: "Pediatrics", match: ["pediatric"] },
  { id: "ob-gyn", label: "OB-GYN", match: ["obstetrics", "gynecol"] },
  { id: "behavioral-health", label: "Behavioral Health", match: ["psychi", "psychol", "social worker", "counselor", "therapist"] },
  { id: "dental", label: "Dental", match: ["dentist", "dental", "orthodont"] },
  { id: "dermatology", label: "Dermatology", match: ["dermatol"] },
  { id: "cardiology", label: "Cardiology", match: ["cardiol"] },
  { id: "orthopedics", label: "Orthopedics", match: ["orthop"] },
];

/* ── Search mode tabs ────────────────────────── */
const MODE_TABS: { mode: NPISearchMode; label: string; icon: typeof Stethoscope }[] = [
  { mode: "specialty", label: "By Service", icon: Stethoscope },
  { mode: "name", label: "By Provider Name", icon: User },
  { mode: "npi", label: "By NPI Number", icon: Hash },
];

/* ── Main page ────────────────────────────────── */
export default function FindCarePage() {
  usePageMeta({
    title: "Find Help — Access Michigan",
    description: "Find care, health centers, food assistance, housing help, and more — all across Michigan. Free. Private. No account needed.",
    path: "/find-care",
    jsonLd: {
      "@type": "MedicalWebPage",
      "name": "Find Help — Access Michigan",
      "about": { "@type": "MedicalCondition", "name": "Healthcare Access" },
      "audience": { "@type": "PeopleAudience", "geographicArea": { "@type": "State", "name": "Michigan" } },
    },
  });

  const [searchParams] = useSearchParams();

  const [categoryValue, setCategoryValue] = useState("");
  const [category, setCategory] = useState<HelpCategory | null>(null);
  const [specialty, setSpecialty] = useState("");
  const [location, setLocation] = useState(() => searchParams.get("county") || "");
  const [hasSearched, setHasSearched] = useState(false);

  // Search mode
  const [searchMode, setSearchMode] = useState<NPISearchMode>(() => {
    const modeParam = searchParams.get("mode");
    if (modeParam === "name" || modeParam === "npi") return modeParam;
    if (searchParams.get("npi")) return "npi";
    return "specialty";
  });

  // Name search fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // NPI search field
  const [npiNumber, setNpiNumber] = useState(() => searchParams.get("npi") || "");

  // NPI search
  const npi = useNPISearch();

  // Filters for NPI results
  const [filterType, setFilterType] = useState<"all" | "individual" | "org">("all");
  const [filterGender, setFilterGender] = useState<"all" | "F" | "M">("all");
  const [filterADA, setFilterADA] = useState(false);
  const [activeCareType, setActiveCareType] = useState<string | null>(null);

  const activeFilterCount = useMemo(() => {
    let c = 0;
    if (filterType !== "all") c++;
    if (filterGender !== "all") c++;
    if (filterADA) c++;
    if (activeCareType) c++;
    return c;
  }, [filterType, filterGender, filterADA, activeCareType]);

  const filteredNPI = useMemo(() => {
    let r = npi.results;
    if (filterType === "individual") r = r.filter((p) => !p.isOrganization);
    if (filterType === "org") r = r.filter((p) => p.isOrganization);
    if (filterGender !== "all") r = r.filter((p) => p.gender === filterGender);
    if (activeCareType) {
      const ct = CARE_TYPES.find((t) => t.id === activeCareType);
      if (ct) {
        r = r.filter((p) => {
          const spec = p.specialty.toLowerCase();
          return ct.match.some((m) => spec.includes(m));
        });
      }
    }
    return r;
  }, [npi.results, filterType, filterGender, activeCareType]);

  // Auto-search if ?npi= param is present
  useEffect(() => {
    const npiParam = searchParams.get("npi");
    if (npiParam && /^\d{10}$/.test(npiParam)) {
      setNpiNumber(npiParam);
      setSearchMode("npi");
      setHasSearched(true);
      npi.search([], "", "", "npi", undefined, npiParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-search when county + scope params are present (e.g. from county page deep link)
  useEffect(() => {
    const countyParam = searchParams.get("county");
    const scopeParam = searchParams.get("scope");
    if (countyParam && scopeParam && !hasSearched && searchMode === "specialty") {
      // Auto-select "doctor" category and trigger search
      const cat = findCategory("doctor");
      if (cat) {
        setCategoryValue("doctor");
        setCategory(cat);
        setLocation(countyParam);
        setHasSearched(true);
        const taxonomies = cat.taxonomies || [];
        npi.search(taxonomies, cat.enumerationType || "NPI-1", countyParam, "specialty");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      if (cat.mode === "static") {
        setHasSearched(true);
      }
    }
  }, [npi]);

  const handleSearch = useCallback(() => {
    setHasSearched(true);

    if (searchMode === "name") {
      if (!lastName.trim()) return;
      npi.search([], "", location, "name", { firstName: firstName.trim(), lastName: lastName.trim() });
      return;
    }

    if (searchMode === "npi") {
      if (!npiNumber.trim() || !/^\d{10}$/.test(npiNumber.trim())) return;
      npi.search([], "", "", "npi", undefined, npiNumber.trim());
      return;
    }

    // Specialty mode (existing)
    if (!category) return;
    if (category.mode === "npi") {
      const taxonomies = category.showSpecialtyPicker && specialty
        ? [specialty]
        : category.taxonomies || [];
      npi.search(taxonomies, category.enumerationType || "NPI-1", location, "specialty");
    }
  }, [category, specialty, location, npi, searchMode, firstName, lastName, npiNumber]);

  const clearFilters = useCallback(() => {
    setFilterType("all");
    setFilterGender("all");
    setFilterADA(false);
    setActiveCareType(null);
  }, []);

  const isInitial = !hasSearched && searchMode === "specialty";
  const isNPIMode = searchMode === "name" || searchMode === "npi" || category?.mode === "npi";
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
            Find care, health centers, food assistance, housing help, and more — all across Michigan. Free. Private. No account needed.
          </motion.p>

          {/* ── Mode Selector Tabs ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="flex rounded-lg border border-border bg-muted/50 p-1 mb-6 max-w-lg mx-auto"
            role="tablist"
            aria-label="Search mode"
          >
            {MODE_TABS.map((tab) => (
              <button
                key={tab.mode}
                role="tab"
                aria-selected={searchMode === tab.mode}
                onClick={() => { setSearchMode(tab.mode); setHasSearched(false); npi.reset(); }}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                  searchMode === tab.mode
                    ? "bg-background text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.replace("By ", "")}</span>
              </button>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-3"
          >
            {/* ── Specialty Mode ── */}
            {searchMode === "specialty" && (
              <>
                <HelpCategoryCombobox value={categoryValue} onChange={handleCategoryChange} />
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
              </>
            )}

            {/* ── Name Mode ── */}
            {searchMode === "name" && (
              <>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    placeholder="First name (optional)"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="h-12 text-base flex-1"
                    aria-label="Provider first name"
                    onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                  />
                  <Input
                    placeholder="Last name (required)"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="h-12 text-base flex-1"
                    aria-label="Provider last name"
                    onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="City, ZIP code, or county (optional)"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="h-12 pl-10 text-base"
                      aria-label="Location filter"
                      onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                    />
                  </div>
                  <Button
                    onClick={handleSearch}
                    disabled={!lastName.trim()}
                    className="h-12 px-8 text-base font-semibold sm:w-auto w-full"
                    size="lg"
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Search by Name
                  </Button>
                </div>
                <div className="flex items-start gap-2 rounded-lg bg-muted/60 border border-border px-3 py-2.5">
                  <Info className="h-4 w-4 text-michigan-blue shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    Search the national NPI registry — includes all licensed Michigan providers. If a provider enrolled recently, they may appear here even if not in insurance directories.
                  </p>
                </div>
              </>
            )}

            {/* ── NPI Mode ── */}
            {searchMode === "npi" && (
              <>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Hash className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Enter 10-digit NPI number"
                      value={npiNumber}
                      onChange={(e) => setNpiNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      className="h-12 pl-10 text-base font-mono"
                      aria-label="NPI number"
                      onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                      maxLength={10}
                    />
                  </div>
                  <Button
                    onClick={handleSearch}
                    disabled={!/^\d{10}$/.test(npiNumber.trim())}
                    className="h-12 px-8 text-base font-semibold sm:w-auto w-full"
                    size="lg"
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Look Up Provider
                  </Button>
                </div>
                <div className="flex items-start gap-2 rounded-lg bg-muted/60 border border-border px-3 py-2.5">
                  <Info className="h-4 w-4 text-michigan-blue shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    Every licensed provider has a unique NPI. You can find a provider's NPI on their business card, clinic website, or by asking their office.
                  </p>
                </div>
              </>
            )}
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

        {/* NPI error / contextual empty state */}
        {isNPIMode && npi.searched && !npi.isLoading && npi.results.length === 0 && (
          <div className="max-w-3xl mx-auto" role="alert">
            <Card className="border-muted">
              <CardContent className="py-8 text-center space-y-3">
                <Search className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                {searchMode === "name" && (
                  <>
                    <p className="text-foreground font-medium">
                      No results found for "{firstName} {lastName}"{location && ` near ${location}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Provider may be listed under a different name or enrolled after the last NPPES update. Try searching by NPI number directly, check alternate name spellings, or call{" "}
                      <a href="tel:211" className="text-primary underline font-semibold">2-1-1</a> for local provider assistance.
                    </p>
                  </>
                )}
                {searchMode === "npi" && (
                  <>
                    <p className="text-foreground font-medium">NPI {npiNumber} not found</p>
                    <p className="text-sm text-muted-foreground">
                      Verify the 10-digit number is correct. Call the provider's office to confirm their NPI, or try searching by name instead.
                    </p>
                  </>
                )}
                {searchMode === "specialty" && (
                  <>
                    <p className="text-foreground font-medium">
                      No providers found{specialty && ` for ${specialty}`}{location && ` near ${location}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Try expanding your location, use a broader specialty, or call{" "}
                      <a href="tel:211" className="text-primary underline font-semibold">2-1-1</a> to locate nearby clinics.
                    </p>
                  </>
                )}
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  {searchMode !== "name" && (
                    <Button variant="outline" size="sm" onClick={() => setSearchMode("name")}>
                      <User className="mr-1.5 h-3.5 w-3.5" /> Try Name Search
                    </Button>
                  )}
                  {searchMode !== "npi" && (
                    <Button variant="outline" size="sm" onClick={() => setSearchMode("npi")}>
                      <Hash className="mr-1.5 h-3.5 w-3.5" /> Try NPI Lookup
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={handleSearch}>
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* NPI results */}
        {isNPIMode && npi.searched && !npi.isLoading && npi.results.length > 0 && (
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
              <div className="mb-3 flex items-center justify-between flex-wrap gap-3" aria-live="polite">
                <ResultHeader label={`Providers${location ? ` near ${location}` : ""}`} count={filteredNPI.length} />
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

              {/* ── Care-type pill filter bar ── */}
              <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filter by care type">
                {CARE_TYPES.map((ct) => {
                  const isActive = activeCareType === ct.id;
                  return (
                    <button
                      key={ct.id}
                      onClick={() => setActiveCareType(isActive ? null : ct.id)}
                      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                        isActive
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      }`}
                      aria-pressed={isActive}
                    >
                      {ct.label}
                    </button>
                  );
                })}
                {activeCareType && (
                  <button
                    onClick={() => setActiveCareType(null)}
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-3 w-3" /> Clear
                  </button>
                )}
              </div>

              {filteredNPI.length === 0 ? (
                <div className="py-12 text-center space-y-3" role="status">
                  <Search className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                  <p className="text-foreground font-medium">
                    No results for "{CARE_TYPES.find(ct => ct.id === activeCareType)?.label || 'this care type'}"
                  </p>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    None of the {npi.results.length} providers matched this specialty. Try a different care type above, or clear the filter to see all results.
                  </p>
                  <div className="flex justify-center gap-2 pt-1">
                    <Button variant="outline" size="sm" onClick={() => setActiveCareType(null)}>
                      Show all {npi.results.length} providers
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      Clear all filters
                    </Button>
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
