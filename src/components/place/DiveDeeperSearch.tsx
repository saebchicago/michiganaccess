import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Hash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { COUNTY_PROFILES } from "@/data/michigan-county-profiles";
import { MICHIGAN_CITIES, type MichiganCity } from "@/data/michigan-county-seats";

interface DiveDeeperSearchProps {
  countyName: string;
}

export default function DiveDeeperSearch({ countyName }: DiveDeeperSearchProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const profile = COUNTY_PROFILES[countyName];

  const suggestions = useMemo(() => {
    if (query.length < 2) return [];
    const lower = query.toLowerCase();
    const results: { label: string; type: "city" | "zip"; href: string }[] = [];

    // Cities from county profile
    if (profile) {
      for (const city of profile.majorCities) {
        if (city.toLowerCase().includes(lower)) {
          results.push({
            label: city,
            type: "city",
            href: `/place/city/${city.toLowerCase().replace(/\s+/g, "-")}`,
          });
        }
      }
    }

    // Cities from MICHIGAN_CITIES in this county
    for (const c of MICHIGAN_CITIES) {
      if (c.county === countyName && c.city.toLowerCase().includes(lower) && !results.some((r) => r.label === c.city)) {
        results.push({
          label: c.city,
          type: "city",
          href: `/place/city/${c.city.toLowerCase().replace(/\s+/g, "-")}`,
        });
      }
    }

    // ZIP codes
    if (/^\d{3,5}$/.test(query)) {
      const zips = MICHIGAN_CITIES.filter((c) => c.county === countyName && c.zip.startsWith(query));
      for (const z of zips) {
        results.push({
          label: `${z.zip} (${z.city})`,
          type: "zip",
          href: `/place/zip/${z.zip}`,
        });
      }
    }

    return results.slice(0, 6);
  }, [query, countyName, profile]);

  const handleSelect = (href: string) => {
    setQuery("");
    navigate(href);
  };

  return (
    <section className="rounded-xl border border-border bg-muted/20 p-5">
      <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
        <Search className="h-4 w-4 text-primary" />
        Dive Deeper: Local Insights
      </h3>
      <p className="text-xs text-muted-foreground mb-3">
        Search for a city or ZIP within {countyName} County to view hyper-local data.
      </p>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search cities or ZIPs in ${countyName} County…`}
          className="pl-9"
        />
        {suggestions.length > 0 && (
          <div className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg">
            {suggestions.map((s) => (
              <button
                key={s.href}
                onClick={() => handleSelect(s.href)}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg"
              >
                {s.type === "city" ? <MapPin className="h-3.5 w-3.5 text-primary" /> : <Hash className="h-3.5 w-3.5 text-muted-foreground" />}
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
