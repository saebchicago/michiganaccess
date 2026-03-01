/**
 * ComparisonPanel – side-by-side pillar insight cards for 2-4 counties.
 *
 * Renders the appropriate pillar card component (HealthAccessCards, etc.)
 * for each selected county in a responsive grid.
 */

import { useState, useMemo } from "react";
import { X, Plus, Search, GitCompareArrows } from "lucide-react";
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
import type { Pillar } from "@/data/pillarRegistry";
import SectionErrorBoundary from "@/components/shared/SectionErrorBoundary";

// Lazy-style inline imports to avoid circular deps; these are already bundled
import HealthAccessCards from "./HealthAccessCards";
import EnvironmentRiskCards from "./EnvironmentRiskCards";
import MobilityAccessCards from "./MobilityAccessCards";
import EconomicStressCards from "./EconomicStressCards";

const MAX_COUNTIES = 4;

function CountyPicker({
  selected,
  onAdd,
}: {
  selected: string[];
  onAdd: (county: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const available = useMemo(() => {
    const sel = new Set(selected.map((s) => s.toLowerCase()));
    let list = MICHIGAN_COUNTIES.filter((c) => !sel.has(c.toLowerCase()));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((c) => c.toLowerCase().includes(q));
    }
    return list;
  }, [selected, search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-dashed"
          disabled={selected.length >= MAX_COUNTIES}
        >
          <Plus className="h-3.5 w-3.5" />
          Add County
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <div className="relative mb-2">
          <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search counties…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-7 text-xs"
          />
        </div>
        <div className="max-h-48 overflow-y-auto space-y-0.5">
          {available.length === 0 && (
            <p className="text-xs text-muted-foreground py-2 text-center">
              No matching counties
            </p>
          )}
          {available.slice(0, 30).map((c) => (
            <button
              key={c}
              onClick={() => {
                onAdd(c);
                setOpen(false);
                setSearch("");
              }}
              className="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-muted/60 transition-colors"
            >
              {c} County
            </button>
          ))}
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
  const [counties, setCounties] = useState<string[]>(
    initialCounty ? [initialCounty] : []
  );

  const addCounty = (c: string) => {
    if (counties.length < MAX_COUNTIES && !counties.includes(c)) {
      setCounties((prev) => [...prev, c]);
    }
  };

  const removeCounty = (c: string) => {
    setCounties((prev) => prev.filter((x) => x !== c));
  };

  if (counties.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center space-y-3">
          <GitCompareArrows className="h-8 w-8 mx-auto text-muted-foreground" />
          <h3 className="font-semibold text-foreground">
            Compare Counties Side-by-Side
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Select up to {MAX_COUNTIES} Michigan counties to compare pillar
            insights using real public data.
          </p>
          <CountyPicker selected={counties} onAdd={addCounty} />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selection bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {counties.map((c) => (
          <Badge
            key={c}
            variant="secondary"
            className="gap-1 pl-2.5 pr-1 py-1 text-xs"
          >
            {c} County
            <button
              onClick={() => removeCounty(c)}
              className="ml-0.5 rounded-full hover:bg-muted p-0.5"
              aria-label={`Remove ${c}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        {counties.length < MAX_COUNTIES && (
          <CountyPicker selected={counties} onAdd={addCounty} />
        )}
      </div>

      {/* Side-by-side grid */}
      <div
        className="grid gap-6"
        style={{
          gridTemplateColumns: `repeat(${Math.min(counties.length, 2)}, minmax(0, 1fr))`,
        }}
      >
        {counties.map((c) => (
          <div key={c} className="space-y-2">
            <h3 className="text-sm font-bold text-foreground border-b border-border pb-1">
              {c} County
            </h3>
            <SectionErrorBoundary title={`${c} ${pillar}`}>
              <PillarCardsForCounty countyName={c} pillar={pillar} />
            </SectionErrorBoundary>
          </div>
        ))}
      </div>
    </div>
  );
}
