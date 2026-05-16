/**
 * Trust & Transparency — "Why some local data shows county averages"
 */
import { useState } from "react";
import { Info, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { Place } from "@/models/Place";

export default function DataLimitationsNote({ place }: { place: Place }) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button
          className="flex w-full items-center gap-2 rounded-lg border border-border bg-muted/30 px-4 py-3 text-left text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
          aria-expanded={open}
        >
          <Info className="h-4 w-4 text-primary shrink-0" />
          <span className="flex-1 font-medium">Why some local data shows county averages</span>
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2">
        <div className="rounded-lg border border-border bg-card px-4 py-4 space-y-3 text-xs text-muted-foreground leading-relaxed">
          <p>
            <strong className="text-foreground">Public data has geographic limits.</strong> Most federal datasets
            (Census ACS, CDC PLACES, BLS, USDA) report at the county level. City- and ZIP-level data is often
            unavailable or statistically unreliable for smaller populations.
          </p>
          <p>
            When local data isn't available, we show the county average and clearly label it with a
            <span className="inline-flex items-center mx-1 px-1.5 py-0.5 rounded bg-michigan-gold/10 text-michigan-gold text-[10px] font-semibold border border-michigan-gold/20">County Avg</span>
            badge. This ensures you always see relevant context rather than nothing.
          </p>
          <p>
            <strong className="text-foreground">Our fallback chain:</strong> ZIP (ZCTA) → City → County → Region → State.
            We always use the most local data available and tell you exactly what geography it represents.
          </p>
          <p>
            <strong className="text-foreground">Estimated indicators</strong> (like energy burden) use proxy calculations
            from federal models (e.g., DOE LEAD Tool) based on county type and demographics. These are labeled "Estimated"
            with methodology notes.
          </p>
          {place.isFallback && (
            <p className="text-foreground font-medium">
              This {place.placeType} page is currently showing {place.fallbackLabel || "county-level"} data
              because {place.placeType}-level data is not available in public datasets.
            </p>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
