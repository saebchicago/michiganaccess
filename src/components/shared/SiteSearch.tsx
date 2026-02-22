import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Building2, Heart, FileText, Loader2, Clock, TrendingUp, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { supabase } from "@/integrations/supabase/client";
import { countyToSlug } from "@/utils/countyUtils";
import { getSearchSuggestions, getPopularSuggestions, getMisspellingCorrection, parseComboQuery, type SearchSuggestion } from "@/utils/searchUtils";

const STATIC_PAGES = [
  { label: "Find Care", href: "/find-care", category: "page" },
  { label: "Health Map", href: "/health-map", category: "page" },
  { label: "Financial Help", href: "/financial-help", category: "page" },
  { label: "Community Resources", href: "/resources", category: "page" },
  { label: "Transportation", href: "/transportation", category: "page" },
  { label: "Insurance Appeals", href: "/health/insurance-appeals", category: "page" },
  { label: "Health Conditions", href: "/conditions", category: "page" },
  { label: "Environment & Air Quality", href: "/environment", category: "page" },
  { label: "Civic Data", href: "/civic-data", category: "page" },
  { label: "Quality Ratings", href: "/quality", category: "page" },
  { label: "Cost Transparency", href: "/costs", category: "page" },
  { label: "Prevention & Wellness", href: "/wellness", category: "page" },
  { label: "Health Data Dashboard", href: "/data", category: "page" },
  { label: "Executive Summary", href: "/executive-summary", category: "page" },
  { label: "Health Equity", href: "/equity", category: "page" },
  { label: "Lean Healthcare", href: "/lean-healthcare", category: "page" },
  { label: "For Health Systems", href: "/for-health-systems", category: "page" },
  { label: "Case Studies", href: "/case-studies", category: "page" },
  { label: "Impact Dashboard", href: "/impact", category: "page" },
  { label: "Life Navigator", href: "/life-navigator", category: "page" },
  { label: "Regions", href: "/regions", category: "page" },
  { label: "Utility Outages", href: "/outages", category: "page" },
  { label: "About", href: "/about", category: "page" },
  { label: "Contact", href: "/contact", category: "page" },
];

interface SearchResult {
  label: string;
  sublabel?: string;
  href: string;
  category: "county" | "facility" | "resource" | "page" | "suggestion";
}

const RECENT_KEY = "mi-access-recent-searches";
const MAX_RECENT = 5;

function getRecentSearches(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch { return []; }
}
function saveRecentSearch(term: string) {
  const recent = getRecentSearches().filter((t) => t !== term);
  recent.unshift(term);
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT))); } catch {}
}

export default function SiteSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [correction, setCorrection] = useState<string | null>(null);
  const [smartSuggestions, setSmartSuggestions] = useState<SearchSuggestion[]>([]);
  const navigate = useNavigate();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => { if (open) setRecentSearches(getRecentSearches()); }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setSmartSuggestions(getPopularSuggestions());
      setCorrection(null);
      return;
    }
    setLoading(true);

    // Smart suggestions (instant, no DB)
    const suggestions = getSearchSuggestions(q);
    setSmartSuggestions(suggestions);
    setCorrection(getMisspellingCorrection(q));

    const term = q.toLowerCase();

    // Static pages filter
    const pageResults: SearchResult[] = STATIC_PAGES
      .filter((p) => p.label.toLowerCase().includes(term))
      .slice(0, 4)
      .map((p) => ({ ...p, category: "page" as const }));

    // Parse combo query for county-scoped DB search
    const { term: searchTerm, county: comboCounty } = parseComboQuery(q);

    // DB queries in parallel
    const countyFilter = comboCounty ? `county.eq.${comboCounty}` : "";
    const [counties, facilities, resources] = await Promise.all([
      supabase
        .from("municipalities")
        .select("name, county, municipality_type, population")
        .or(`name.ilike.%${searchTerm}%,county.ilike.%${searchTerm}%`)
        .order("population", { ascending: false })
        .limit(6),
      supabase
        .from("facilities")
        .select("name, city, county, facility_type")
        .or(`name.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,county.ilike.%${searchTerm}%${comboCounty ? `,county.eq.${comboCounty}` : ""}`)
        .limit(5),
      supabase
        .from("community_resources")
        .select("resource_name, city, county, resource_type")
        .or(`resource_name.ilike.%${searchTerm}%,county.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%${comboCounty ? `,county.eq.${comboCounty}` : ""}`)
        .limit(5),
    ]);

    const countyResults: SearchResult[] = (counties.data ?? []).map((m) => ({
      label: m.name,
      sublabel: `${m.county} County · ${m.municipality_type}`,
      href: `/county/${countyToSlug(m.county)}`,
      category: "county",
    }));

    const facilityResults: SearchResult[] = (facilities.data ?? []).map((f) => ({
      label: f.name,
      sublabel: `${f.city}, ${f.county} County · ${f.facility_type}`,
      href: "/find-care",
      category: "facility",
    }));

    const resourceResults: SearchResult[] = (resources.data ?? []).map((r) => ({
      label: r.resource_name,
      sublabel: `${r.city}, ${r.county} County · ${r.resource_type}`,
      href: "/resources",
      category: "resource",
    }));

    setResults([...pageResults, ...countyResults, ...facilityResults, ...resourceResults]);
    setLoading(false);
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 200);
    return () => clearTimeout(debounceRef.current);
  }, [query, search]);

  const handleSelect = (href: string) => {
    if (query.length >= 2) saveRecentSearch(query);
    setOpen(false);
    setQuery("");
    setResults([]);
    navigate(href);
  };

  const handleRecentClick = (term: string) => setQuery(term);

  const handleApplyCorrection = () => {
    if (correction) {
      setQuery(correction);
      setCorrection(null);
    }
  };

  const iconFor = (cat: string) => {
    switch (cat) {
      case "county": return <MapPin className="h-4 w-4 text-primary" />;
      case "facility": return <Building2 className="h-4 w-4 text-primary" />;
      case "resource": return <Heart className="h-4 w-4 text-destructive" />;
      case "suggestion": return <Sparkles className="h-4 w-4 text-accent" />;
      default: return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const groupLabel = (cat: string) => {
    switch (cat) {
      case "page": return "Pages";
      case "county": return "Counties & Cities";
      case "facility": return "Facilities";
      case "resource": return "Resources";
      case "suggestion": return "Suggestions";
      default: return cat;
    }
  };

  // Group results by category
  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    (acc[r.category] ??= []).push(r);
    return acc;
  }, {});

  // Has any results at all
  const hasResults = results.length > 0 || smartSuggestions.length > 0;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="relative"
        aria-label="Search site"
      >
        <Search className="h-4.5 w-4.5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 gap-0 max-w-lg overflow-hidden">
          <Command shouldFilter={false} className="rounded-lg">
            <div className="relative">
              <CommandInput
                placeholder="Search counties, services, programs, resources…"
                value={query}
                onValueChange={setQuery}
              />
              {loading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
            <CommandList>
              {/* Misspelling correction */}
              {correction && query.length >= 2 && (
                <div className="px-3 py-2 border-b border-border">
                  <button
                    onClick={handleApplyCorrection}
                    className="w-full text-sm text-left flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted transition-colors"
                  >
                    <AlertCircle className="h-3.5 w-3.5 text-warm-gold flex-shrink-0" />
                    <span className="text-muted-foreground">Did you mean</span>
                    <span className="font-semibold text-foreground">{correction}</span>
                    <span className="text-muted-foreground">?</span>
                  </button>
                </div>
              )}

              {/* Smart suggestions (keyword/county matches) */}
              {query.length >= 2 && smartSuggestions.length > 0 && smartSuggestions[0].category !== "popular" && (
                <CommandGroup heading="Quick Matches">
                  {smartSuggestions.slice(0, 4).map((s, i) => (
                    <CommandItem
                      key={`smart-${i}`}
                      value={`smart-${s.label}`}
                      onSelect={() => handleSelect(s.href)}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      {s.category === "county" ? <MapPin className="h-4 w-4 text-primary" /> :
                       s.category === "correction" ? <Sparkles className="h-4 w-4 text-warm-gold" /> :
                       <Search className="h-4 w-4 text-accent" />}
                      <span className="text-sm">{s.label}</span>
                      {s.category === "correction" && s.matchedTerm && (
                        <span className="text-xs text-muted-foreground ml-auto italic">corrected</span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Recent searches */}
              {query.length < 2 && recentSearches.length > 0 && (
                <CommandGroup heading="Recent Searches">
                  {recentSearches.map((term) => (
                    <CommandItem
                      key={term}
                      value={term}
                      onSelect={() => handleRecentClick(term)}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{term}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Popular suggestions fallback */}
              {query.length < 2 && recentSearches.length === 0 && (
                <CommandGroup heading="Popular Searches">
                  {getPopularSuggestions().map((s, i) => (
                    <CommandItem
                      key={`pop-${i}`}
                      value={`popular-${s.label}`}
                      onSelect={() => handleSelect(s.href)}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{s.label}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* No DB results + no smart suggestions = empty fallback */}
              {query.length >= 2 && !loading && results.length === 0 && smartSuggestions[0]?.category === "popular" && (
                <CommandGroup heading="No matches found — try these">
                  {smartSuggestions.map((s, i) => (
                    <CommandItem
                      key={`fallback-${i}`}
                      value={`fallback-${s.label}`}
                      onSelect={() => handleSelect(s.href)}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{s.label}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* DB results */}
              {Object.entries(grouped).map(([cat, items]) => (
                <CommandGroup key={cat} heading={groupLabel(cat)}>
                  {items.map((item, i) => (
                    <CommandItem
                      key={`${cat}-${i}`}
                      value={`${item.label}-${item.sublabel}`}
                      onSelect={() => handleSelect(item.href)}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      {iconFor(cat)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.label}</p>
                        {item.sublabel && (
                          <p className="text-xs text-muted-foreground truncate">{item.sublabel}</p>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
            <div className="border-t border-border px-3 py-2 text-xs text-muted-foreground flex items-center gap-2">
              <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
              to toggle search · type a county name for local results
            </div>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
