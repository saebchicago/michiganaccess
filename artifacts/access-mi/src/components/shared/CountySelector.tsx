import { useState, useMemo } from "react";
import { MapPin, X, Check, ChevronsUpDown, Map } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import {
  useCounty,
  MICHIGAN_COUNTIES,
  type MichiganCounty,
} from "@/contexts/CountyContext";
import { MICHIGAN_REGIONS, type MichiganRegion } from "@/data/michigan-regions";
import { cn } from "@/lib/utils";

interface CountySelectorProps {
  variant?: "header" | "compact";
}

const CountySelector = ({ variant = "header" }: CountySelectorProps) => {
  const { t } = useTranslation();
  const { county, setCounty, region, setRegion, filterLabel } = useCounty();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return MICHIGAN_COUNTIES;
    const q = search.toLowerCase();
    return MICHIGAN_COUNTIES.filter((c) => c.toLowerCase().includes(q));
  }, [search]);

  const filteredRegions = useMemo(() => {
    if (!search) return MICHIGAN_REGIONS;
    const q = search.toLowerCase();
    return MICHIGAN_REGIONS.filter((r) => r.name.toLowerCase().includes(q));
  }, [search]);

  const handleSelectCounty = (c: MichiganCounty | null) => {
    setCounty(c);
    setOpen(false);
    setSearch("");
  };

  const handleSelectRegion = (r: MichiganRegion) => {
    setRegion(r);
    setOpen(false);
    setSearch("");
  };

  const handleClear = () => {
    setCounty(null);
    setOpen(false);
    setSearch("");
  };

  const hasSelection = county || region;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size={variant === "compact" ? "sm" : "default"}
          className={cn(
            "gap-1.5 font-medium",
            variant === "header" && "h-9 text-xs",
            hasSelection && "border-primary/30 bg-primary/5 text-primary",
          )}
          aria-label={`${filterLabel} - ${t("county.selectCounty")}`}
          data-county-selector=""
        >
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate max-w-[140px]">{filterLabel}</span>
          <ChevronsUpDown className="h-3 w-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-72 p-0 z-[60] bg-popover border border-border shadow-lg"
        align="end"
      >
        <div className="p-2 border-b border-border">
          <Input
            placeholder="Search regions or counties…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-sm"
            autoFocus
          />
        </div>

        <div className="max-h-[340px] overflow-y-auto p-1">
          {/* All Michigan option */}
          <button
            onClick={handleClear}
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted",
              !hasSelection && "bg-primary/10 text-primary font-medium",
            )}
          >
            <Check className={cn("h-3.5 w-3.5", hasSelection && "opacity-0")} />
            {t("county.allMichigan")}
          </button>

          {/* Regions */}
          {filteredRegions.length > 0 && (
            <>
              <div className="my-1 border-t border-border" />
              <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Map className="h-3 w-3" /> Regions
              </p>
              {filteredRegions.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleSelectRegion(r)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted",
                    region?.id === r.id &&
                      "bg-primary/10 text-primary font-medium",
                  )}
                >
                  <Check
                    className={cn(
                      "h-3.5 w-3.5",
                      region?.id !== r.id && "opacity-0",
                    )}
                  />
                  <span className="truncate">{r.name}</span>
                  <span className="ml-auto text-[10px] text-muted-foreground">
                    {r.counties.length} counties
                  </span>
                </button>
              ))}
            </>
          )}

          {/* Counties */}
          {filtered.length > 0 && (
            <>
              <div className="my-1 border-t border-border" />
              <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Counties
              </p>
              {filtered.map((c) => (
                <button
                  key={c}
                  onClick={() => handleSelectCounty(c)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted",
                    county === c && "bg-primary/10 text-primary font-medium",
                  )}
                >
                  <Check
                    className={cn("h-3.5 w-3.5", county !== c && "opacity-0")}
                  />
                  {c}
                </button>
              ))}
            </>
          )}

          {filtered.length === 0 && filteredRegions.length === 0 && (
            <p className="px-2 py-4 text-center text-xs text-muted-foreground">
              {t("county.noResults")}
            </p>
          )}
        </div>

        {hasSelection && (
          <div className="border-t border-border p-1">
            <button
              onClick={handleClear}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted transition-colors"
            >
              <X className="h-3 w-3" />
              {t("county.clearSelection")}
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default CountySelector;
