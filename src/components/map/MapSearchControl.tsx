import { useState, useCallback } from "react";
import { Search, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

interface MapSearchControlProps {
  onLocationSelect: (lat: number, lon: number, name: string) => void;
}

export default function MapSearchControl({ onLocationSelect }: MapSearchControlProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      // Nominatim — free, privacy-respecting geocoder (OSM)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ", Michigan")}&format=json&limit=5&countrycodes=us&viewbox=-90.5,41.6,-82.1,48.3&bounded=1`,
        { headers: { "User-Agent": "MichiganAccess/1.0" } }
      );
      const data = await response.json();
      setResults(data);
    } catch {
      setResults([]);
    }
    setLoading(false);
  }, [query]);

  const handleSelect = (r: SearchResult) => {
    onLocationSelect(parseFloat(r.lat), parseFloat(r.lon), r.display_name);
    setResults([]);
    setQuery("");
  };

  return (
    <div className="relative">
      <div className="flex gap-1">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search address..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="h-8 pl-8 text-xs"
          />
          {query && (
            <button onClick={() => { setQuery(""); setResults([]); }} className="absolute right-2 top-1/2 -translate-y-1/2">
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          )}
        </div>
        <Button size="sm" variant="secondary" onClick={handleSearch} disabled={loading} className="h-8 px-2">
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
        </Button>
      </div>
      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-48 overflow-y-auto rounded-md border border-border bg-popover shadow-lg">
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => handleSelect(r)}
              className="w-full px-3 py-2 text-left text-xs text-foreground hover:bg-muted transition-colors border-b border-border/50 last:border-0"
            >
              {r.display_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
