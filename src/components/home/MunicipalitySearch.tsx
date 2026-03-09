import { useState, useCallback, useEffect, useRef, forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Building2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { countyToSlug } from "@/utils/countyUtils";

interface MunicipalityResult {
  name: string;
  county: string;
  municipality_type: string;
  population: number | null;
}

const MunicipalitySearch = forwardRef<HTMLDivElement>(function MunicipalitySearch(_props, ref) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MunicipalityResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const { data } = await supabase
        .from("municipalities")
        .select("name, county, municipality_type, population")
        .ilike("name", `%${q}%`)
        .order("population", { ascending: false })
        .limit(8);
      setResults(data ?? []);
      setOpen(true);
    } catch {
      setResults([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 250);
    return () => clearTimeout(debounceRef.current);
  }, [query, search]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (r: MunicipalityResult) => {
    setOpen(false);
    setQuery("");
    navigate(`/county/${countyToSlug(r.county)}`);
  };

  return (
    <div ref={(node) => {
      (wrapperRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }} className="relative w-full max-w-md mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search any city, village, or township..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          className="pl-10 pr-10 h-11 bg-background/80 backdrop-blur-sm border-border/60"
        />
        {loading && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-64 overflow-y-auto rounded-lg border border-border bg-popover shadow-xl">
          {results.map((r, i) => (
            <button
              key={`${r.name}-${r.county}-${i}`}
              onClick={() => handleSelect(r)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted transition-colors border-b border-border/40 last:border-0"
            >
              <Building2 className="h-4 w-4 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{r.name}</p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{r.county} County</span>
                  <span className="text-border">·</span>
                  <span className="capitalize">{r.municipality_type}</span>
                  {r.population && (
                    <>
                      <span className="text-border">·</span>
                      <span>Pop. {r.population.toLocaleString()}</span>
                    </>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {open && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border border-border bg-popover shadow-xl p-4 text-center text-sm text-muted-foreground">
          No municipalities found for "{query}"
        </div>
      )}
    </div>
  );
});

export default MunicipalitySearch;
