/**
 * Generic DatasetExplorer Component
 *
 * Lists datasets by pillar and geography level.
 * For a selected dataset, queries real data and shows table + basic stats.
 * Shows "not yet loaded" for pending datasets — never fake rows.
 */

import { useState, useMemo } from "react";
import { Heart, Leaf, Bus, DollarSign, Database, AlertCircle, ExternalLink, Clock, GitCompareArrows, Table2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { usePillarData } from "@/hooks/usePillarData";
import {
  ALL_PILLAR_DATASETS,
  PILLAR_META,
  type Pillar,
  type PillarDataset,
} from "@/data/pillarRegistry";
import type { GeographyLevel } from "@/models/GeoDimension";
import ComparisonPanel from "./ComparisonPanel";

const PILLAR_ICONS: Record<Pillar, typeof Heart> = {
  health: Heart,
  environment: Leaf,
  mobility: Bus,
  economic: DollarSign,
};

function DatasetListItem({
  ds,
  selected,
  onSelect,
}: {
  ds: PillarDataset;
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = PILLAR_ICONS[ds.pillar];
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-3 rounded-lg border transition-colors ${
        selected
          ? "border-primary bg-primary/5"
          : "border-border hover:bg-muted/50"
      }`}
    >
      <div className="flex items-start gap-2">
        <Icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" aria-hidden="true" />
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-medium text-foreground leading-tight">{ds.name}</h3>
            <Badge
              variant={ds.status === "live" ? "default" : "secondary"}
              className="text-[10px]"
            >
              {ds.status === "live" ? "Live Data" : "Pending"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{ds.description}</p>
          <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
            <span className="capitalize">{ds.geographyLevel}</span>
            <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{ds.refreshCadence}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

function DatasetDetail({ datasetId, countyFilter }: { datasetId: string; countyFilter?: string }) {
  const { data, loading, error, status, dataset, lastUpdated } = usePillarData(
    datasetId,
    countyFilter ? { county: countyFilter } : undefined
  );

  if (!dataset) return null;

  if (status === "pending") {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-semibold text-foreground mb-1">Data Not Yet Available</h3>
          <p className="text-sm text-muted-foreground mb-3">
            This dataset is registered but has not yet been ingested. No data to display.
          </p>
          <a
            href={dataset.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            View original source <ExternalLink className="h-3 w-3" />
          </a>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="py-8 flex justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-destructive">Error loading data: {error}</p>
          <a href={dataset.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mt-2 inline-flex items-center gap-1">
            View original source <ExternalLink className="h-3 w-3" />
          </a>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Database className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-semibold text-foreground mb-1">No Records Found</h3>
          <p className="text-sm text-muted-foreground">
            {countyFilter
              ? `No records found for ${countyFilter} County. Try removing the county filter.`
              : "This dataset returned no records."}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Basic stats
  const columns = Object.keys(data[0]);
  const numericCols = columns.filter((col) =>
    data.slice(0, 20).some((row) => typeof row[col] === "number" || (!isNaN(Number(row[col])) && row[col] !== null && row[col] !== ""))
  );

  const stats = numericCols.slice(0, 4).map((col) => {
    const values = data.map((r) => Number(r[col])).filter((v) => !isNaN(v));
    if (values.length === 0) return null;
    return {
      col,
      min: Math.min(...values),
      max: Math.max(...values),
      avg: Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100,
      count: values.length,
    };
  }).filter(Boolean);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-bold text-foreground">{dataset.name}</h3>
          <p className="text-xs text-muted-foreground">{data.length} records • {dataset.refreshCadence}</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={dataset.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline inline-flex items-center gap-1"
          >
            Source <ExternalLink className="h-3 w-3" />
          </a>
          {lastUpdated && (
            <Badge variant="outline" className="text-[10px]">
              Fetched {lastUpdated.toLocaleTimeString()}
            </Badge>
          )}
        </div>
      </div>

      {/* Basic stats */}
      {stats.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => s && (
            <Card key={s.col}>
              <CardContent className="p-3">
                <p className="text-[10px] text-muted-foreground truncate">{s.col}</p>
                <p className="text-lg font-bold text-foreground">{s.avg.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">
                  Range: {s.min.toLocaleString()} – {s.max.toLocaleString()} ({s.count} values)
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Data table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-xs min-w-[500px]">
          <thead className="bg-muted/50">
            <tr>
              {columns.slice(0, 8).map((key) => (
                <th key={key} className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 25).map((row, i) => (
              <tr key={i} className="border-t border-border/50 hover:bg-muted/30">
                {columns.slice(0, 8).map((key) => (
                  <td key={key} className="px-3 py-2 text-foreground whitespace-nowrap max-w-[200px] truncate">
                    {String(row[key] ?? "—").slice(0, 100)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length > 25 && (
        <p className="text-xs text-muted-foreground text-center">Showing 25 of {data.length} records</p>
      )}
    </div>
  );
}

interface DatasetExplorerProps {
  /** Pre-filter to a specific pillar */
  defaultPillar?: Pillar;
  /** Pre-filter to a specific geography level */
  geographyFilter?: GeographyLevel;
  /** County filter for data queries */
  countyFilter?: string;
}

export default function DatasetExplorer({ defaultPillar, geographyFilter, countyFilter }: DatasetExplorerProps) {
  const [activePillar, setActivePillar] = useState<Pillar>(defaultPillar ?? "health");
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(null);
  const [mode, setMode] = useState<"explore" | "compare">("explore");

  const filteredDatasets = useMemo(() => {
    let ds = ALL_PILLAR_DATASETS.filter((d) => d.pillar === activePillar);
    if (geographyFilter) {
      ds = ds.filter((d) => d.geographyLevel === geographyFilter);
    }
    return ds;
  }, [activePillar, geographyFilter]);

  return (
    <div className="space-y-6">
      {/* Pillar tabs */}
      <Tabs value={activePillar} onValueChange={(v) => { setActivePillar(v as Pillar); setSelectedDatasetId(null); }}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <TabsList className="grid w-full max-w-lg grid-cols-4">
            {(["health", "environment", "mobility", "economic"] as Pillar[]).map((p) => {
              const Icon = PILLAR_ICONS[p];
              return (
                <TabsTrigger key={p} value={p} className="gap-1.5 text-xs">
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="hidden sm:inline">{PILLAR_META[p].label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Mode toggle */}
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setMode("explore")}
              className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-colors ${
                mode === "explore"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <Table2 className="h-3.5 w-3.5" /> Explore
            </button>
            <button
              onClick={() => setMode("compare")}
              className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-colors ${
                mode === "compare"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <GitCompareArrows className="h-3.5 w-3.5" /> Compare
            </button>
          </div>
        </div>

        {(["health", "environment", "mobility", "economic"] as Pillar[]).map((p) => (
          <TabsContent key={p} value={p} className="mt-4">
            <p className="text-sm text-muted-foreground mb-4">{PILLAR_META[p].description}</p>
          </TabsContent>
        ))}
      </Tabs>

      {mode === "compare" ? (
        <ComparisonPanel pillar={activePillar} initialCounty={countyFilter} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* Dataset list */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredDatasets.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No datasets registered for this combination.
              </p>
            )}
            {filteredDatasets.map((ds) => (
              <DatasetListItem
                key={ds.id}
                ds={ds}
                selected={selectedDatasetId === ds.id}
                onSelect={() => setSelectedDatasetId(ds.id)}
              />
            ))}
          </div>

          {/* Detail panel */}
          <div>
            {selectedDatasetId ? (
              <DatasetDetail datasetId={selectedDatasetId} countyFilter={countyFilter} />
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Database className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <h3 className="font-semibold text-foreground mb-1">Select a Dataset</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose a dataset from the list to view real data, statistics, and source attribution.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
