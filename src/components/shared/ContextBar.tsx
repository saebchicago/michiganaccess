import { useState } from "react";
import { MapPin, Clock, HelpCircle, ArrowRight, ChevronDown, User, DollarSign, X } from "lucide-react";
import { useCounty } from "@/contexts/CountyContext";
import { Link } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";

const AUDIENCE_LABELS: Record<string, string> = {
  resident: "Resident",
  provider: "Provider",
  "health-system": "Health System",
  policymaker: "Policymaker",
};

export default function ContextBar() {
  const { filterLabel, county, setCounty, region, setRegion, audience, setAudience, eligibility, clearEligibility } = useCounty();
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const isMobile = useIsMobile();

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

  const hasFilters = !!(county || region || audience || eligibility.fplPercent);

  const audienceChip = audience ? (
    <Badge variant="secondary" className="text-[10px] gap-1 py-0 h-5 font-normal">
      <User className="h-2.5 w-2.5" aria-hidden="true" />
      {AUDIENCE_LABELS[audience]}
      <button onClick={() => setAudience(null)} aria-label="Clear persona filter" className="ml-0.5 hover:text-destructive">
        <X className="h-2 w-2" />
      </button>
    </Badge>
  ) : null;

  const eligibilityChip = eligibility.fplPercent ? (
    <Badge variant="secondary" className="text-[10px] gap-1 py-0 h-5 font-normal">
      <DollarSign className="h-2.5 w-2.5" aria-hidden="true" />
      {eligibility.fplPercent}% FPL
      <button onClick={clearEligibility} aria-label="Clear eligibility filter" className="ml-0.5 hover:text-destructive">
        <X className="h-2 w-2" />
      </button>
    </Badge>
  ) : null;

  // Aria-live announcement
  const announcement = [
    county ? `${county} County` : region ? `${region.name} region` : "All Michigan",
    audience ? `for ${AUDIENCE_LABELS[audience]}s` : "",
    eligibility.fplPercent ? `at ${eligibility.fplPercent}% FPL` : "",
  ].filter(Boolean).join(" ");

  // Mobile: collapsed pill
  if (isMobile) {
    return (
      <div className="border-b border-border/50 bg-muted/30">
        <div aria-live="polite" className="sr-only">
          Now showing {announcement} data and services.
        </div>

        {!mobileExpanded ? (
          <button
            onClick={() => setMobileExpanded(true)}
            className="container flex items-center gap-2 h-8 text-[11px] text-muted-foreground w-full"
            aria-expanded={false}
            aria-label="Expand location bar"
          >
            <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
            <span className="font-medium text-foreground truncate">{filterLabel}</span>
            {audienceChip}
            {eligibilityChip}
            <span className="text-primary text-[10px]">Change</span>
            <ChevronDown className="h-2.5 w-2.5 ml-auto" />
          </button>
        ) : (
          <div className="container flex flex-wrap items-center gap-2 py-2 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1 shrink-0">
              <MapPin className="h-3 w-3" aria-hidden="true" />
              <span className="font-medium text-foreground">{filterLabel}</span>
              {(county || region) && (
                <button onClick={handleClear} className="text-primary hover:underline ml-1 inline-flex items-center gap-0.5">
                  Change <ArrowRight className="h-2.5 w-2.5" />
                </button>
              )}
              {!county && !region && (
                <Link
                  to="/#"
                  onClick={(e) => {
                    e.preventDefault();
                    document.querySelector<HTMLButtonElement>('[aria-label="Select county"]')?.click();
                  }}
                  className="text-primary hover:underline ml-1 inline-flex items-center gap-0.5"
                >
                  Set location <ArrowRight className="h-2.5 w-2.5" />
                </Link>
              )}
            </div>
            {audienceChip}
            {eligibilityChip}
            {lastUpdated && (
              <>
                <span className="text-border">·</span>
                <div className="flex items-center gap-1 shrink-0">
                  <Clock className="h-2.5 w-2.5" aria-hidden="true" />
                  <span>Updated {lastUpdated}</span>
                </div>
              </>
            )}
            <button
              onClick={() => setMobileExpanded(false)}
              className="ml-auto text-primary text-[10px]"
            >
              Collapse
            </button>
          </div>
        )}
      </div>
    );
  }

  // Desktop: full bar
  return (
    <div className="border-b border-border/50 bg-muted/30">
      <div aria-live="polite" className="sr-only">
        Now showing {announcement} data and services.
      </div>

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
                document.querySelector<HTMLButtonElement>('[aria-label="Select county"]')?.click();
              }}
              className="text-primary hover:underline ml-1 inline-flex items-center gap-0.5"
            >
              Set location <ArrowRight className="h-2.5 w-2.5" />
            </Link>
          )}
        </div>

        {/* Persona & Eligibility chips */}
        {audienceChip}
        {eligibilityChip}

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
            This bar shows your active filters — location, persona, and eligibility — which
            control all data and recommendations across the site.{" "}
            <Link to="/data-validation" className="text-primary underline">
              Learn more
            </Link>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
