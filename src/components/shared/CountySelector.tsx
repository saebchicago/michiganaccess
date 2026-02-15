import { useState, useMemo } from "react";
import { MapPin, X, Check, ChevronsUpDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useCounty, MICHIGAN_COUNTIES, type MichiganCounty } from "@/contexts/CountyContext";
import { cn } from "@/lib/utils";

interface CountySelectorProps {
  variant?: "header" | "compact";
}

const CountySelector = ({ variant = "header" }: CountySelectorProps) => {
  const { t } = useTranslation();
  const { county, setCounty } = useCounty();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return MICHIGAN_COUNTIES;
    const q = search.toLowerCase();
    return MICHIGAN_COUNTIES.filter((c) => c.toLowerCase().includes(q));
  }, [search]);

  const handleSelect = (c: MichiganCounty | null) => {
    setCounty(c);
    setOpen(false);
    setSearch("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size={variant === "compact" ? "sm" : "default"}
          className={cn(
            "gap-1.5 font-medium",
            variant === "header" && "h-9 text-xs",
            county && "border-primary/30 bg-primary/5 text-primary"
          )}
          aria-label={t("county.selectCounty")}
        >
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate max-w-[120px]">
            {county ? `${county}` : t("county.allMichigan")}
          </span>
          <ChevronsUpDown className="h-3 w-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-64 p-0 z-[60] bg-popover border border-border shadow-lg"
        align="end"
      >
        <div className="p-2 border-b border-border">
          <Input
            placeholder={t("county.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-sm"
            autoFocus
          />
        </div>

        <div className="max-h-[280px] overflow-y-auto p-1">
          {/* All Michigan option */}
          <button
            onClick={() => handleSelect(null)}
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted",
              !county && "bg-primary/10 text-primary font-medium"
            )}
          >
            <Check className={cn("h-3.5 w-3.5", county && "opacity-0")} />
            {t("county.allMichigan")}
          </button>

          <div className="my-1 border-t border-border" />

          {filtered.map((c) => (
            <button
              key={c}
              onClick={() => handleSelect(c)}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted",
                county === c && "bg-primary/10 text-primary font-medium"
              )}
            >
              <Check className={cn("h-3.5 w-3.5", county !== c && "opacity-0")} />
              {c}
            </button>
          ))}

          {filtered.length === 0 && (
            <p className="px-2 py-4 text-center text-xs text-muted-foreground">
              {t("county.noResults")}
            </p>
          )}
        </div>

        {county && (
          <div className="border-t border-border p-1">
            <button
              onClick={() => handleSelect(null)}
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
