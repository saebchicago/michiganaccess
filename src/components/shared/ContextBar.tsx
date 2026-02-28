import { useState, useEffect, useMemo } from "react";
import { MapPin, Clock, HelpCircle, ArrowRight, ChevronDown, User, DollarSign, X, Users } from "lucide-react";
import { useCounty } from "@/contexts/CountyContext";
import { Link } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

const AUDIENCE_LABELS: Record<string, string> = {
  resident: "Resident",
  provider: "Provider",
  "health-system": "Health System",
  policymaker: "Policymaker",
};

const SUB_PERSONA_LABELS: Record<string, string> = {
  caregiver: "Caregiver",
  immigrant: "Immigrant",
  disabled: "Disability",
};

// 2025 Federal Poverty Guidelines (contiguous US)
const FPL_BASE = 15650;
const FPL_PER_PERSON = 5380;
function computeFPL(householdSize: number, annualIncome: number): number {
  const threshold = FPL_BASE + FPL_PER_PERSON * Math.max(0, householdSize - 1);
  return Math.round((annualIncome / threshold) * 100);
}

function EligibilityPopover() {
  const { eligibility, setEligibility, clearEligibility } = useCounty();
  const [open, setOpen] = useState(false);
  const [hhSize, setHhSize] = useState(eligibility.householdSize?.toString() ?? "1");
  const [income, setIncome] = useState(eligibility.annualIncome ?? 30000);

  const hhNum = Math.max(1, parseInt(hhSize) || 1);
  const fplPreview = useMemo(() => computeFPL(hhNum, income), [hhNum, income]);

  const handleSave = () => {
    if (hhNum > 0 && income >= 0) {
      setEligibility({ householdSize: hhNum, annualIncome: income });
      setOpen(false);
    }
  };

  const handleClear = () => {
    clearEligibility();
    setHhSize("1");
    setIncome(30000);
    setOpen(false);
  };

  // Sync from global state when popover opens
  useEffect(() => {
    if (open) {
      setHhSize(eligibility.householdSize?.toString() ?? "1");
      setIncome(eligibility.annualIncome ?? 30000);
    }
  }, [open, eligibility.householdSize, eligibility.annualIncome]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline">
          <Users className="h-2.5 w-2.5" />
          {eligibility.fplPercent ? `${eligibility.fplPercent}% FPL` : "Set income"}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4 space-y-4" side="bottom" align="start">
        <p className="text-xs font-semibold text-foreground">Eligibility Quick-Set</p>

        {/* Household size */}
        <div className="space-y-1">
          <Label htmlFor="hh-size" className="text-[10px]">Household size</Label>
          <Input
            id="hh-size"
            type="number"
            min={1}
            max={20}
            placeholder="e.g. 3"
            value={hhSize}
            onChange={(e) => setHhSize(e.target.value)}
            className="h-7 text-xs"
          />
        </div>

        {/* Income slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="income-slider" className="text-[10px]">Annual income</Label>
            <span className="text-xs font-semibold text-foreground">${income.toLocaleString()}</span>
          </div>
          <Slider
            id="income-slider"
            min={0}
            max={150000}
            step={1000}
            value={[income]}
            onValueChange={([v]) => setIncome(v)}
            className="w-full"
            aria-label="Annual household income"
          />
          <div className="flex justify-between text-[9px] text-muted-foreground">
            <span>$0</span>
            <span>$75k</span>
            <span>$150k</span>
          </div>
        </div>

        {/* FPL preview */}
        <div className="rounded-md bg-muted/50 border border-border p-2 text-center">
          <p className="text-[10px] text-muted-foreground">Estimated FPL</p>
          <p className={`text-lg font-bold ${fplPreview <= 138 ? "text-michigan-forest" : fplPreview <= 250 ? "text-michigan-gold" : "text-foreground"}`}>
            {fplPreview}%
          </p>
          <p className="text-[9px] text-muted-foreground mt-0.5">
            {fplPreview <= 138 ? "Likely Medicaid eligible" : fplPreview <= 250 ? "May qualify for subsidies" : "Above subsidy threshold"}
          </p>
        </div>

        <div className="flex gap-2">
          <Button size="sm" className="flex-1 h-7 text-[10px]" onClick={handleSave}>
            Apply
          </Button>
          {eligibility.fplPercent && (
            <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={handleClear}>
              Clear
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
export default function ContextBar() {
  const { filterLabel, county, setCounty, region, setRegion, audience, setAudience, subPersonas, toggleSubPersona, eligibility, clearEligibility } = useCounty();
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

  const subPersonaChips = subPersonas.length > 0 ? subPersonas.map((sp) => (
    <Badge key={sp} variant="secondary" className="text-[10px] gap-1 py-0 h-5 font-normal">
      {SUB_PERSONA_LABELS[sp]}
      <button onClick={() => toggleSubPersona(sp)} aria-label={`Remove ${SUB_PERSONA_LABELS[sp]} filter`} className="ml-0.5 hover:text-destructive">
        <X className="h-2 w-2" />
      </button>
    </Badge>
  )) : null;

  // Aria-live announcement
  const announcement = [
    county ? `${county} County` : region ? `${region.name} region` : "All Michigan",
    audience ? `for ${AUDIENCE_LABELS[audience]}s` : "",
    subPersonas.length > 0 ? `as ${subPersonas.map(sp => SUB_PERSONA_LABELS[sp]).join(", ")}` : "",
    eligibility.fplPercent ? `at ${eligibility.fplPercent}% FPL` : "",
  ].filter(Boolean).join(" ");

  // Mobile: collapsed pill
  if (isMobile) {
    return (
      <div className="sticky top-16 z-40 border-b border-border/50 bg-background/95 backdrop-blur-md">
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
            {subPersonaChips}
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
            {subPersonaChips}
            {eligibilityChip}
            {!eligibility.fplPercent && <EligibilityPopover />}
            {lastUpdated && (
              <>
                <span className="text-muted-foreground/40">·</span>
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
    <div className="sticky top-16 z-40 border-b border-border/50 bg-background/95 backdrop-blur-md">
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

        {/* Persona, Sub-persona & Eligibility chips */}
        {audienceChip}
        {subPersonaChips}
        {eligibilityChip}
        {!eligibility.fplPercent && <EligibilityPopover />}

        <span className="text-muted-foreground/40">·</span>

        {/* Data freshness */}
        {lastUpdated && (
          <div className="flex items-center gap-1 shrink-0">
            <Clock className="h-2.5 w-2.5" aria-hidden="true" />
            <span>Updated {lastUpdated}</span>
          </div>
        )}

        <span className="text-muted-foreground/40">·</span>

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
