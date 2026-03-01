/**
 * ComparisonPanel – side-by-side pillar insight cards for 2-4 geographies
 * (counties or ZIP codes).
 *
 * Renders the appropriate pillar card component for each selected geography.
 * ZIP selections resolve to their parent county for pillar cards, with a note
 * that data is shown at county level when ZIP-specific data isn't available.
 */

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { X, Plus, Search, GitCompareArrows, MapPin, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
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
import { getCountyProfile } from "@/data/michigan-county-profiles";
import { useFacilities } from "@/hooks/useFacilities";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

interface RowData {
  sel: GeoSelection;
  population: number;
  uninsured: string;
  healthCount: number | null;
  sudCount: number | null;
  foodInsec: string;
}

function useRowData(sel: GeoSelection): RowData {
  const profile = getCountyProfile(sel.countyName);
  const { data: facilities } = useFacilities(undefined, sel.countyName);
  const healthCount = facilities?.filter((f) =>
    ["hospital", "clinic", "fqhc", "urgent_care"].includes(f.facility_type)
  ).length ?? null;
  const sudCount = facilities?.filter((f) =>
    f.facility_type === "sud" || f.facility_type === "behavioral_health" ||
    (f.specialties ?? []).some((s: string) => /substance|addiction|behavioral/i.test(s))
  ).length ?? null;
  const uninsured = profile.healthHighlights.find((h) => h.label === "Uninsured rate")?.value ?? "—";
  const foodInsec = profile.healthHighlights.find((h) => h.label === "Food insecurity")?.value ?? "—";
  return { sel, population: profile.population, uninsured, healthCount, sudCount, foodInsec };
}

function RowDataCollector({ sel, onData }: { sel: GeoSelection; onData: (d: RowData) => void }) {
  const data = useRowData(sel);
  React.useEffect(() => { onData(data); }, [data.population, data.healthCount, data.sudCount, data.uninsured, data.foodInsec]);
  return null;
}

type SortKey = "label" | "population" | "uninsured" | "healthCount" | "sudCount" | "foodInsec";
type SortDir = "asc" | "desc";

function parseNumeric(v: string | number | null): number | null {
  if (v === null || v === "—") return null;
  if (typeof v === "number") return v;
  const n = parseFloat(v.replace(/[^0-9.]/g, ""));
  return isNaN(n) ? null : n;
}

function SortableHead({ label, sortKey, current, dir, onSort }: { label: string; sortKey: SortKey; current: SortKey; dir: SortDir; onSort: (k: SortKey) => void }) {
  const active = current === sortKey;
  return (
    <TableHead className="text-xs cursor-pointer select-none hover:bg-muted/40 transition-colors" onClick={() => onSort(sortKey)}>
      <span className="inline-flex items-center gap-1">
        {label}
        {active ? (dir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-30" />}
      </span>
    </TableHead>
  );
}

/** Whether lower is better for a metric (burden metrics) */
const LOWER_IS_BETTER: Record<string, boolean> = {
  uninsured: true,
  foodInsec: true,
};

function getHighlightClass(
  value: number | null,
  allValues: (number | null)[],
  key: string
): string {
  if (value === null) return "";
  const valid = allValues.filter((v) => v !== null) as number[];
  if (valid.length < 2) return "";
  const min = Math.min(...valid);
  const max = Math.max(...valid);
  if (min === max) return "";
  const lowerBetter = LOWER_IS_BETTER[key] ?? false;
  if (value === (lowerBetter ? min : max))
    return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold";
  if (value === (lowerBetter ? max : min))
    return "bg-rose-500/10 text-rose-700 dark:text-rose-400";
  return "";
}

function ComparisonSummaryTable({ selections }: { selections: GeoSelection[] }) {
  const [rowMap, setRowMap] = React.useState<Record<string, RowData>>({});
  const [sortKey, setSortKey] = React.useState<SortKey>("label");
  const [sortDir, setSortDir] = React.useState<SortDir>("asc");

  const handleData = React.useCallback((d: RowData) => {
    setRowMap((prev) => ({ ...prev, [d.sel.id]: d }));
  }, []);

  const handleSort = React.useCallback((key: SortKey) => {
    setSortDir((prev) => (sortKey === key ? (prev === "asc" ? "desc" : "asc") : "asc"));
    setSortKey(key);
  }, [sortKey]);

  const rows = selections.length >= 2
    ? (selections.map((s) => rowMap[s.id]).filter(Boolean) as RowData[])
    : [];

  // Pre-compute column values for highlighting
  const colValues = React.useMemo(() => {
    if (rows.length < 2) return {} as Record<string, (number | null)[]>;
    return {
      population: rows.map((r) => (r.population > 0 ? r.population : null)),
      uninsured: rows.map((r) => parseNumeric(r.uninsured)),
      healthCount: rows.map((r) => r.healthCount),
      sudCount: rows.map((r) => (r.sudCount !== null && r.sudCount > 0 ? r.sudCount : null)),
      foodInsec: rows.map((r) => parseNumeric(r.foodInsec)),
    };
  }, [rows.length, ...rows.map(r => `${r.population}|${r.uninsured}|${r.healthCount}|${r.sudCount}|${r.foodInsec}`)]);

  const hl = (rowIdx: number, key: string) =>
    getHighlightClass(colValues[key]?.[rowIdx] ?? null, colValues[key] ?? [], key);

  if (selections.length < 2) return null;

  const sorted = [...rows].sort((a, b) => {
    const mul = sortDir === "asc" ? 1 : -1;
    if (sortKey === "label") return mul * a.sel.label.localeCompare(b.sel.label);
    const aVal = parseNumeric(sortKey === "population" ? a.population : sortKey === "healthCount" ? a.healthCount : sortKey === "sudCount" ? a.sudCount : a[sortKey]);
    const bVal = parseNumeric(sortKey === "population" ? b.population : sortKey === "healthCount" ? b.healthCount : sortKey === "sudCount" ? b.sudCount : b[sortKey]);
    if (aVal === null && bVal === null) return 0;
    if (aVal === null) return 1;
    if (bVal === null) return -1;
    return mul * (aVal - bVal);
  });

  // Map sorted rows back to their original index in `rows` for highlight lookup
  const sortedWithIdx = sorted.map((r) => ({
    ...r,
    _origIdx: rows.indexOf(r),
  }));

  return (
    <>
      {selections.map((s) => <RowDataCollector key={s.id} sel={s} onData={handleData} />)}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHead label="Geography" sortKey="label" current={sortKey} dir={sortDir} onSort={handleSort} />
                <SortableHead label="Population" sortKey="population" current={sortKey} dir={sortDir} onSort={handleSort} />
                <SortableHead label="Uninsured" sortKey="uninsured" current={sortKey} dir={sortDir} onSort={handleSort} />
                <SortableHead label="Health Facilities" sortKey="healthCount" current={sortKey} dir={sortDir} onSort={handleSort} />
                <SortableHead label="SUD/BH" sortKey="sudCount" current={sortKey} dir={sortDir} onSort={handleSort} />
                <SortableHead label="Food Insecurity" sortKey="foodInsec" current={sortKey} dir={sortDir} onSort={handleSort} />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedWithIdx.map((r) => (
                <TableRow key={r.sel.id}>
                  <TableCell className="font-medium text-xs whitespace-nowrap">
                    {r.sel.type === "zip" && <MapPin className="h-3 w-3 inline mr-1" />}
                    {r.sel.label}
                  </TableCell>
                  <TableCell className={`text-xs ${hl(r._origIdx, "population")}`}>{r.population > 0 ? r.population.toLocaleString() : "—"}</TableCell>
                  <TableCell className={`text-xs ${hl(r._origIdx, "uninsured")}`}>{r.uninsured}</TableCell>
                  <TableCell className={`text-xs ${hl(r._origIdx, "healthCount")}`}>{r.healthCount !== null ? r.healthCount : "—"}</TableCell>
                  <TableCell className={`text-xs ${hl(r._origIdx, "sudCount")}`}>{r.sudCount !== null && r.sudCount > 0 ? r.sudCount : "—"}</TableCell>
                  <TableCell className={`text-xs ${hl(r._origIdx, "foodInsec")}`}>{r.foodInsec}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
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

      {/* Summary table */}
      <ComparisonSummaryTable selections={selections} />

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
