import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Heart, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/**
 * Embeddable widget for county spin-offs.
 * Counties can iframe this page: <iframe src="https://accessmi.org/embed" />
 * Lightweight, self-contained quick-search widget.
 */
export default function EmbedWidget() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (query.trim()) {
      // Open find-care in new tab when embedded, navigate when standalone
      const isIframe = window.self !== window.top;
      const url = `/find-care?q=${encodeURIComponent(query)}`;
      if (isIframe) {
        window.open(`https://accessmi.org${url}`, "_blank");
      } else {
        navigate(url);
      }
    }
  };

  return (
    <div className="min-h-[360px] bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <h1 className="sr-only">Access Michigan - Quick Search Widget</h1>
        {/* Branding */}
        <div className="flex items-center justify-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-michigan">
            <Heart className="h-4 w-4 text-primary-foreground" fill="currentColor" />
          </div>
          <span className="text-sm font-bold text-foreground">Access Michigan</span>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Find healthcare, community resources, and support across Michigan
        </p>

        {/* Search */}
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-2 shadow-michigan">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search by city, condition, or service…"
              className="border-0 bg-transparent pl-10 focus-visible:ring-0"
              aria-label="Search Access Michigan"
            />
          </div>
          <Button onClick={handleSearch} size="sm" className="bg-gradient-michigan">
            Search
          </Button>
        </div>

        {/* Quick links */}
        <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
          <a
            href="https://accessmi.org/find-care"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-primary"
          >
            <MapPin className="h-3 w-3" /> Find Care
          </a>
          <a href="tel:988" className="flex items-center gap-1 hover:text-primary">
            <Phone className="h-3 w-3" /> Crisis: 988
          </a>
          <a href="tel:211" className="hover:text-primary">2-1-1</a>
        </div>

        <p className="text-center text-[9px] text-muted-foreground">
          Powered by <a href="https://accessmi.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Access Michigan</a> · Non-commercial civic resource
        </p>
      </div>
    </div>
  );
}
