import { MapPin, Clock, HelpCircle, ArrowRight } from "lucide-react";
import { useCounty } from "@/contexts/CountyContext";
import { Link } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function ContextBar() {
  const { filterLabel, county, setCounty, region, setRegion } = useCounty();
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("facilities")
        .select("updated_at")
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();
      const row = data as { updated_at?: string } | null;
      if (row?.updated_at) {
        setLastUpdated(
          new Date(row.updated_at).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })
        );
      }
    })();
  }, []);

  const handleClear = () => {
    setCounty(null);
    setRegion(null);
  };

  return (
    <div className="border-b border-border/50 bg-muted/30">
      <div className="container flex items-center gap-3 h-8 text-[11px] text-muted-foreground overflow-x-auto">
        {/* Location */}
        <div className="flex items-center gap-1 shrink-0">
          <MapPin className="h-3 w-3" aria-hidden="true" />
          <span className="font-medium text-foreground">{filterLabel}</span>
          {(county || region) && (
            <button
              onClick={handleClear}
              className="text-primary hover:underline ml-1 inline-flex items-center gap-0.5"
            >
              Change <ArrowRight className="h-2.5 w-2.5" />
            </button>
          )}
          {!county && !region && (
            <Link
              to="/#"
              onClick={(e) => {
                e.preventDefault();
                // Scroll to county selector or open it
                document.querySelector<HTMLButtonElement>('[aria-label="Select county"]')?.click();
              }}
              className="text-primary hover:underline ml-1 inline-flex items-center gap-0.5"
            >
              Set location <ArrowRight className="h-2.5 w-2.5" />
            </Link>
          )}
        </div>

        <span className="text-border">·</span>

        {/* Data freshness */}
        {lastUpdated && (
          <div className="flex items-center gap-1 shrink-0">
            <Clock className="h-2.5 w-2.5" aria-hidden="true" />
            <span>Updated {lastUpdated}</span>
          </div>
        )}

        <span className="text-border">·</span>

        {/* What's this */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="flex items-center gap-0.5 hover:text-foreground transition-colors shrink-0">
              <HelpCircle className="h-2.5 w-2.5" />
              What's this?
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs text-xs">
            This bar shows your current location filter and when data was last refreshed.
            All data is sourced from public agencies (CMS, HRSA, CDC, EPA).{" "}
            <Link to="/data-validation" className="text-primary underline">
              Learn more
            </Link>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
