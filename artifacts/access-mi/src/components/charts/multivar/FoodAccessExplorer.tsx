import { useMemo, useState } from "react";
import {
  BarChart3,
  Layers,
  LineChart as LineChartIcon,
  Plus,
  Sigma,
  X,
} from "lucide-react";
import {
  SNAP_FAMILY,
  SNAP_FAMILY_METRICS,
  canShareAxis,
  getSnapMetric,
  type SnapMetricDef,
} from "@/data/snapGranularityRegistry";
import { summarizeFamilyCoverage } from "@/data/snapCoverageRegistry";
import { GeoResolutionBadge } from "@/components/shared/GeoResolutionBadge";
import { ProvenancePanel } from "@/components/shared/ProvenancePanel";
import {
  buildBenchmarks,
  type BenchmarkBundle,
} from "@/utils/foodAccess/buildBenchmarks";
import { resolveCompositeLabel } from "@/utils/provenance/resolveCompositeLabel";
import type { ProvenanceLabel } from "@/utils/provenance/resolveCompositeLabel";
import { SnapSortedBar } from "./SnapSortedBar";
import { SnapScatter } from "./SnapScatter";
import { SnapBubble } from "./SnapBubble";
import { SnapSmallMultiples } from "./SnapSmallMultiples";

type ChartMode = "bar" | "scatter" | "bubble" | "smallMultiples";

interface FoodAccessExplorerProps {
  /** Optional preselected metric. Defaults to the slice's primary
   * (retailerCount). */
  initialMetric?: string;
}

const PRIMARY_METRIC_ID = "retailerCount";

const COMPATIBLE_CHART_FOR_VAR_COUNT: Record<number, ChartMode> = {
  1: "bar",
  2: "scatter",
  3: "bubble",
  4: "smallMultiples",
};

export function FoodAccessExplorer({
  initialMetric = PRIMARY_METRIC_ID,
}: FoodAccessExplorerProps) {
  const [selectedMetricIds, setSelectedMetricIds] = useState<string[]>([
    initialMetric,
  ]);
  const [chartMode, setChartMode] = useState<ChartMode>(
    COMPATIBLE_CHART_FOR_VAR_COUNT[1],
  );
  const [showBenchmarks, setShowBenchmarks] = useState(false);
  const [showGapOverlay, setShowGapOverlay] = useState(false);
  const [colorByRegion, setColorByRegion] = useState(false);

  const selectedMetrics: SnapMetricDef[] = useMemo(
    () =>
      selectedMetricIds
        .map((id) => getSnapMetric(id))
        .filter((m): m is SnapMetricDef => m !== null),
    [selectedMetricIds],
  );

  const allBenchmarks = useMemo(() => {
    const map: Record<string, BenchmarkBundle | null> = {};
    for (const m of selectedMetrics) {
      map[m.id] = buildBenchmarks(m.id);
    }
    return map;
  }, [selectedMetrics]);

  const coverageSummaries = useMemo(
    () =>
      summarizeFamilyCoverage().filter((c) =>
        selectedMetricIds.includes(c.metricId),
      ),
    [selectedMetricIds],
  );

  const compositeLabel: ProvenanceLabel = useMemo(() => {
    if (selectedMetrics.length === 0) return "MODELED";
    return resolveCompositeLabel(
      selectedMetrics.map((m) => m.primaryLabel),
      { isFitted: false, isAggregated: false },
    );
  }, [selectedMetrics]);

  const availableToAdd: SnapMetricDef[] = useMemo(() => {
    if (selectedMetrics.length === 0) return SNAP_FAMILY_METRICS;
    const first = selectedMetrics[0];
    return SNAP_FAMILY_METRICS.filter(
      (m) => !selectedMetricIds.includes(m.id) && canShareAxis(first, m),
    );
  }, [selectedMetrics, selectedMetricIds]);

  const supportedChartModes = useMemo<ChartMode[]>(() => {
    switch (selectedMetrics.length) {
      case 1:
        return ["bar"];
      case 2:
        return ["scatter", "bar"];
      case 3:
        return ["bubble", "smallMultiples"];
      default:
        return ["smallMultiples"];
    }
  }, [selectedMetrics.length]);

  function addMetric(id: string): void {
    setSelectedMetricIds((prev) => {
      const next = [...prev, id];
      const auto = COMPATIBLE_CHART_FOR_VAR_COUNT[next.length];
      if (auto) setChartMode(auto);
      return next;
    });
  }

  function removeMetric(id: string): void {
    setSelectedMetricIds((prev) => {
      const next = prev.filter((x) => x !== id);
      if (next.length === 0) return [PRIMARY_METRIC_ID];
      const auto = COMPATIBLE_CHART_FOR_VAR_COUNT[next.length];
      if (auto) setChartMode(auto);
      return next;
    });
  }

  return (
    <section
      className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden"
      aria-label="Food Access Explorer"
    >
      <header className="border-b border-border bg-gradient-to-b from-card to-muted/20 px-5 sm:px-7 py-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {SNAP_FAMILY.label}
            </p>
            <h2 className="font-display text-2xl sm:text-3xl tracking-tight text-foreground mt-1">
              Food access across Michigan
            </h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              {SNAP_FAMILY.description}
            </p>
          </div>
          <GeoResolutionBadge resolution={SNAP_FAMILY.nativeResolution} />
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-4">
          {selectedMetrics.map((m) => (
            <span
              key={m.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background pl-2.5 pr-1 py-0.5 text-xs font-medium text-foreground"
            >
              {m.shortLabel}
              {selectedMetrics.length > 1 ? (
                <button
                  type="button"
                  aria-label={`Remove ${m.shortLabel}`}
                  onClick={() => removeMetric(m.id)}
                  className="inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X className="h-3 w-3" aria-hidden="true" />
                </button>
              ) : null}
            </span>
          ))}
          {availableToAdd.length > 0 ? (
            <details className="inline-block">
              <summary className="inline-flex cursor-pointer list-none items-center gap-1 rounded-full border border-dashed border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-foreground/40">
                <Plus className="h-3 w-3" aria-hidden="true" /> Add variable
              </summary>
              <ul className="absolute z-20 mt-2 max-w-xs rounded-md border border-border bg-popover shadow-lg p-1">
                {availableToAdd.map((m) => (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => addMetric(m.id)}
                      className="block w-full rounded-sm px-3 py-1.5 text-left text-xs text-popover-foreground hover:bg-muted"
                    >
                      <div className="font-medium">{m.label}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {m.unit}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
        </div>
      </header>

      <div className="px-5 sm:px-7 py-5 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ChartModeSwitcher
            supported={supportedChartModes}
            current={chartMode}
            onChange={setChartMode}
          />
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <ToggleSwitch
              id="bench"
              label="Benchmarks"
              checked={showBenchmarks}
              onChange={setShowBenchmarks}
            />
            <ToggleSwitch
              id="gaps"
              label="Coverage gaps"
              checked={showGapOverlay}
              onChange={setShowGapOverlay}
            />
            {selectedMetrics.length >= 2 ? (
              <ToggleSwitch
                id="region"
                label="Color by region"
                checked={colorByRegion}
                onChange={setColorByRegion}
              />
            ) : null}
          </div>
        </div>

        <div>
          {chartMode === "bar" && selectedMetrics[0] ? (
            <SnapSortedBar
              metric={selectedMetrics[0]}
              colorByRegion={colorByRegion}
              showBenchmarks={showBenchmarks}
              showGapOverlay={showGapOverlay}
              benchmarks={allBenchmarks[selectedMetrics[0].id]}
            />
          ) : null}
          {chartMode === "scatter" &&
          selectedMetrics[0] &&
          selectedMetrics[1] ? (
            <SnapScatter
              xMetric={selectedMetrics[0]}
              yMetric={selectedMetrics[1]}
              colorByRegion={colorByRegion}
              showBenchmarks={showBenchmarks}
              xBenchmarks={allBenchmarks[selectedMetrics[0].id]}
              yBenchmarks={allBenchmarks[selectedMetrics[1].id]}
            />
          ) : null}
          {chartMode === "bubble" &&
          selectedMetrics[0] &&
          selectedMetrics[1] &&
          selectedMetrics[2] ? (
            <SnapBubble
              xMetric={selectedMetrics[0]}
              yMetric={selectedMetrics[1]}
              sizeMetric={selectedMetrics[2]}
              colorByRegion={colorByRegion}
            />
          ) : null}
          {chartMode === "smallMultiples" && selectedMetrics[0] ? (
            <SnapSmallMultiples
              xMetric={selectedMetrics[0]}
              yMetrics={selectedMetrics.slice(1)}
              showBenchmarks={showBenchmarks}
              benchmarks={allBenchmarks}
            />
          ) : null}
        </div>

        <ProvenancePanel
          chartTitle={`Food access - ${chartMode}`}
          compositeLabel={
            showBenchmarks
              ? resolveCompositeLabel(
                  selectedMetrics.map((m) => m.primaryLabel),
                  { isAggregated: true },
                )
              : compositeLabel
          }
          metrics={selectedMetrics.map((m) => ({
            id: m.id,
            label: m.label,
            nativeResolution: m.nativeResolution,
            primaryLabel: m.primaryLabel,
            vintage: m.vintage,
            denominator: m.denominator,
            computation: m.computation,
            source: m.source,
          }))}
          coverage={coverageSummaries}
          benchmarks={
            showBenchmarks
              ? selectedMetrics
                  .map((m) => allBenchmarks[m.id])
                  .filter((b): b is BenchmarkBundle => b !== null)
              : undefined
          }
        />
      </div>
    </section>
  );
}

interface ChartModeSwitcherProps {
  supported: ChartMode[];
  current: ChartMode;
  onChange: (m: ChartMode) => void;
}

function ChartModeSwitcher({
  supported,
  current,
  onChange,
}: ChartModeSwitcherProps) {
  if (supported.length <= 1) return null;
  const ICONS: Record<ChartMode, typeof BarChart3> = {
    bar: BarChart3,
    scatter: LineChartIcon,
    bubble: Sigma,
    smallMultiples: Layers,
  };
  const LABELS: Record<ChartMode, string> = {
    bar: "Sorted bar",
    scatter: "Scatter",
    bubble: "Bubble",
    smallMultiples: "Small multiples",
  };
  return (
    <div
      role="tablist"
      aria-label="Chart type"
      className="inline-flex rounded-md border border-border bg-background p-0.5"
    >
      {supported.map((mode) => {
        const Icon = ICONS[mode];
        const active = mode === current;
        return (
          <button
            key={mode}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(mode)}
            className={
              "inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors " +
              (active
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground")
            }
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {LABELS[mode]}
          </button>
        );
      })}
    </div>
  );
}

interface ToggleSwitchProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

function ToggleSwitch({ id, label, checked, onChange }: ToggleSwitchProps) {
  return (
    <label
      htmlFor={id}
      className="inline-flex cursor-pointer items-center gap-2 select-none"
    >
      <span className="relative inline-flex h-[18px] w-8 items-center">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
        <span
          aria-hidden="true"
          className={
            "absolute inset-0 rounded-full transition-colors " +
            (checked ? "bg-foreground" : "bg-muted")
          }
        />
        <span
          aria-hidden="true"
          className={
            "absolute top-0.5 h-3.5 w-3.5 rounded-full bg-background transition-transform " +
            (checked ? "translate-x-[14px]" : "translate-x-0.5")
          }
        />
      </span>
      <span className="text-foreground">{label}</span>
    </label>
  );
}
