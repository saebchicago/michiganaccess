/**
 * ComparisonPanel – side-by-side pillar insight cards for 2-4 geographies
 * (counties or ZIP codes).
 *
 * Renders the appropriate pillar card component for each selected geography.
 * ZIP selections resolve to their parent county for pillar cards, with a note
 * that data is shown at county level when ZIP-specific data isn't available.
 */

import { useState, useMemo } from "react";
import { X, Plus, Search, GitCompareArrows, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MICHIGAN_COUNTIES } from "@/contexts/CountyContext";
import { zipToCounty } from "@/data/michigan-county-seats";
import type { Pillar } from "@/data/pillarRegistry";
import SectionErrorBoundary from "@/components/shared/SectionErrorBoundary";

import HealthAccessCards from "./HealthAccessCards";
import EnvironmentRiskCards from "./EnvironmentRiskCards";
import MobilityAccessCards from "./MobilityAccessCards";
import EconomicStressCards from "./EconomicStressCards";

const MAX_SELECTIONS = 4;

/** A selected geography — either a county name or a ZIP code */
interface GeoSelection {
  id: string; // display key: county name or ZIP
  type: "county" | "zip";
  countyName: string; // resolved county for data queries
  label: string; // display label
}

function resolveSelection(input: string): GeoSelection | null {
  // ZIP code
  if (/^\d{5}$/.test(input)) {
    const county = zipToCounty(input);
    if (!county) return null;
    return { id: input, type: "zip", countyName: county, label: `ZIP ${input} (${county} Co.)` };
  }
  // County
  const match = (MICHIGAN_COUNTIES as readonly string[]).find(
    (c) => c.toLowerCase() === input.toLowerCase()
  );
  if (match) {
    return { id: match, type: "county", countyName: match, label: `${match} County` };
  }
  return null;
}

function GeoPicker({
  selected,
  onAdd,
}: {
  selected: GeoSelection[];
  onAdd: (sel: GeoSelection) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const isZipSearch = /^\d{3,5}$/.test(search.trim());

  const availableCounties = useMemo(() => {
    const ids = new Set(selected.map((s) => s.id.toLowerCase()));
    let list = MICHIGAN_COUNTIES.filter((c) => !ids.has(c.toLowerCase()));
    if (search && !isZipSearch) {
      const q = search.toLowerCase();
      list = list.filter((c) => c.toLowerCase().includes(q));
    }
    return list;
  }, [selected, search, isZipSearch]);

  const zipResult = useMemo(() => {
    if (!isZipSearch || search.trim().length < 5) return null;
    const sel = resolveSelection(search.trim());
    if (!sel) return null;
    if (selected.some((s) => s.id === sel.id)) return null;
    return sel;
  }, [search, isZipSearch, selected]);

  const handleSelect = (sel: GeoSelection) => {
    onAdd(sel);
    setOpen(false);
    setSearch("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-dashed"
          disabled={selected.length >= MAX_SELECTIONS}
        >
          <Plus className="h-3.5 w-3.5" />
          Add Geography
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2" align="start">
        <div className="relative mb-2">
          <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search county or enter ZIP…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-7 text-xs"
          />
        </div>
        <div className="max-h-52 overflow-y-auto space-y-0.5">
          {/* ZIP match */}
          {zipResult && (
            <button
              onClick={() => handleSelect(zipResult)}
              className="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-muted/60 transition-colors flex items-center gap-1.5"
            >
              <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
              {zipResult.label}
            </button>
          )}

          {/* County list */}
          {!isZipSearch && availableCounties.length === 0 && !zipResult && (
            <p className="text-xs text-muted-foreground py-2 text-center">
              No matching geographies
            </p>
          )}
          {!isZipSearch &&
            availableCounties.slice(0, 30).map((c) => (
              <button
                key={c}
                onClick={() =>
                  handleSelect({ id: c, type: "county", countyName: c, label: `${c} County` })
                }
                className="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-muted/60 transition-colors"
              >
                {c} County
              </button>
            ))}

          {isZipSearch && !zipResult && search.trim().length === 5 && (
            <p className="text-xs text-muted-foreground py-2 text-center">
              ZIP not recognized as a Michigan code
            </p>
          )}
          {isZipSearch && search.trim().length < 5 && (
            <p className="text-xs text-muted-foreground py-2 text-center">
              Enter a full 5-digit Michigan ZIP
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function PillarCardsForCounty({
  countyName,
  pillar,
}: {
  countyName: string;
  pillar: Pillar;
}) {
  switch (pillar) {
    case "health":
      return <HealthAccessCards countyName={countyName} />;
    case "environment":
      return <EnvironmentRiskCards countyName={countyName} />;
    case "mobility":
      return <MobilityAccessCards countyName={countyName} />;
    case "economic":
      return <EconomicStressCards countyName={countyName} />;
    default:
      return null;
  }
}

interface ComparisonPanelProps {
  pillar: Pillar;
  initialCounty?: string;
}

export default function ComparisonPanel({
  pillar,
  initialCounty,
}: ComparisonPanelProps) {
  const [selections, setSelections] = useState<GeoSelection[]>(() => {
    if (!initialCounty) return [];
    const sel = resolveSelection(initialCounty);
    return sel ? [sel] : [];
  });

  const addSelection = (sel: GeoSelection) => {
    if (selections.length < MAX_SELECTIONS && !selections.some((s) => s.id === sel.id)) {
      setSelections((prev) => [...prev, sel]);
    }
  };

  const removeSelection = (id: string) => {
    setSelections((prev) => prev.filter((s) => s.id !== id));
  };

  if (selections.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center space-y-3">
          <GitCompareArrows className="h-8 w-8 mx-auto text-muted-foreground" />
          <h3 className="font-semibold text-foreground">
            Compare Geographies Side-by-Side
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Select up to {MAX_SELECTIONS} Michigan counties or ZIP codes to compare
            pillar insights using real public data.
          </p>
          <GeoPicker selected={selections} onAdd={addSelection} />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selection bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {selections.map((s) => (
          <Badge
            key={s.id}
            variant="secondary"
            className="gap-1 pl-2.5 pr-1 py-1 text-xs"
          >
            {s.type === "zip" && <MapPin className="h-2.5 w-2.5" />}
            {s.label}
            <button
              onClick={() => removeSelection(s.id)}
              className="ml-0.5 rounded-full hover:bg-muted p-0.5"
              aria-label={`Remove ${s.label}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        {selections.length < MAX_SELECTIONS && (
          <GeoPicker selected={selections} onAdd={addSelection} />
        )}
      </div>

      {/* Side-by-side grid */}
      <div
        className="grid gap-6"
        style={{
          gridTemplateColumns: `repeat(${Math.min(selections.length, 2)}, minmax(0, 1fr))`,
        }}
      >
        {selections.map((s) => (
          <div key={s.id} className="space-y-2">
            <h3 className="text-sm font-bold text-foreground border-b border-border pb-1">
              {s.label}
            </h3>
            {s.type === "zip" && (
              <p className="text-[10px] text-muted-foreground">
                Showing county-level data for {s.countyName} County. ZIP-specific metrics will appear as datasets support them.
              </p>
            )}
            <SectionErrorBoundary title={`${s.label} ${pillar}`}>
              <PillarCardsForCounty countyName={s.countyName} pillar={pillar} />
            </SectionErrorBoundary>
          </div>
        ))}
      </div>
    </div>
  );
}
