import { useState, type ReactElement } from "react";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { ProvenanceTag } from "@/components/shared/ProvenanceTag";
import { CoverageStateBadge } from "@/components/shared/CoverageStateBadge";
import { GeoResolutionBadge } from "@/components/shared/GeoResolutionBadge";
import type { GeoResolution } from "@/types/data-layers";
import type { ProvenanceLabel } from "@/utils/provenance/resolveCompositeLabel";
import type { BenchmarkBundle } from "@/utils/foodAccess/buildBenchmarks";
import type { CoverageSummary } from "@/data/snapCoverageRegistry";

export interface ProvenancePanelMetric {
  id: string;
  label: string;
  nativeResolution: GeoResolution;
  primaryLabel: ProvenanceLabel;
  vintage: string;
  denominator: string;
  computation: string;
  source: { name: string; url: string };
}

interface ProvenancePanelProps {
  /** Title shown in the panel header chip row. */
  chartTitle: string;
  /** One or more metrics displayed in this chart. The composite label
   * for the chart is computed from these. */
  metrics: ProvenancePanelMetric[];
  /** Coverage summary per metric (counts of present / suppressed / etc). */
  coverage?: CoverageSummary[];
  /** Optional benchmark bundles included on the chart. Each tier's
   * label and formula gets its own row. */
  benchmarks?: BenchmarkBundle[];
  /** Composite chart-level label, computed by the caller via
   * resolveCompositeLabel. The panel renders it as the headline chip. */
  compositeLabel: ProvenanceLabel;
  /** Open by default? Per progressive-disclosure rule this is FALSE on
   * page load. */
  defaultOpen?: boolean;
}

/**
 * Per-chart collapsible methodology card. Shows:
 *   - composite chart label (weakest-link propagation from inputs)
 *   - per-metric: native resolution, primary label, vintage, denominator,
 *     transformation, source link
 *   - per-metric: coverage state tallies (present / suppressed / not-ingested
 *     / modeled-estimate)
 *   - per-benchmark tier: label, formula, source links, value
 *
 * Collapsed by default to honor progressive disclosure. The header chip
 * row stays visible when collapsed so users can see the composite label
 * + coverage state at a glance.
 */
export function ProvenancePanel({
  chartTitle,
  metrics,
  coverage,
  benchmarks,
  compositeLabel,
  defaultOpen = false,
}: ProvenancePanelProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = `provenance-${chartTitle.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <section
      className="rounded-lg border border-border bg-card text-card-foreground"
      aria-labelledby={`${panelId}-trigger`}
    >
      <button
        id={`${panelId}-trigger`}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={`${panelId}-content`}
        className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            How this is computed
          </span>
          <ProvenanceTag
            label={compositeLabel}
            source={metrics.map((m) => m.source.name).join(" + ")}
            vintage={metrics.map((m) => m.vintage).join(" / ")}
          />
        </div>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          {open ? "Hide" : "Show"}
          {open ? (
            <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
          )}
        </span>
      </button>

      {open ? (
        <div
          id={`${panelId}-content`}
          className="border-t border-border px-4 py-4 space-y-5 text-sm"
        >
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Inputs
            </h4>
            <ul className="space-y-3">
              {metrics.map((m) => {
                const cov = coverage?.find((c) => c.metricId === m.id);
                return (
                  <li
                    key={m.id}
                    className="rounded-md border border-border/60 bg-muted/30 p-3 space-y-1.5"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-foreground">
                        {m.label}
                      </span>
                      <ProvenanceTag
                        label={m.primaryLabel}
                        source={m.source.name}
                        vintage={m.vintage}
                      />
                      <GeoResolutionBadge resolution={m.nativeResolution} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold">Denominator:</span>{" "}
                      {m.denominator}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold">Computation:</span>{" "}
                      {m.computation}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold">Vintage:</span>{" "}
                      {m.vintage}
                    </p>
                    {cov ? (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-xs text-muted-foreground">
                          Coverage across {cov.totalCounties} counties:
                        </span>
                        {cov.present > 0 ? (
                          <span className="text-xs">
                            <CoverageStateBadge state="present" />{" "}
                            <span className="tabular-nums">{cov.present}</span>
                          </span>
                        ) : null}
                        {cov.suppressed > 0 ? (
                          <span className="text-xs">
                            <CoverageStateBadge state="suppressed" />{" "}
                            <span className="tabular-nums">
                              {cov.suppressed}
                            </span>
                          </span>
                        ) : null}
                        {cov.notIngested > 0 ? (
                          <span className="text-xs">
                            <CoverageStateBadge state="not-ingested" />{" "}
                            <span className="tabular-nums">
                              {cov.notIngested}
                            </span>
                          </span>
                        ) : null}
                        {cov.modeledEstimate > 0 ? (
                          <span className="text-xs">
                            <CoverageStateBadge state="modeled-estimate" />{" "}
                            <span className="tabular-nums">
                              {cov.modeledEstimate}
                            </span>
                          </span>
                        ) : null}
                      </div>
                    ) : null}
                    <a
                      href={m.source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      Source: {m.source.name}
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {benchmarks && benchmarks.length > 0 ? (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Benchmarks
              </h4>
              <ul className="space-y-3">
                {benchmarks.flatMap((b) => [
                  renderBenchmarkRow(`${b.metricId}-state`, b.state),
                  renderBenchmarkRow(`${b.metricId}-national`, b.national),
                  ...b.regional.map((r) =>
                    renderBenchmarkRow(`${b.metricId}-region-${r.scope}`, r),
                  ),
                ])}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function renderBenchmarkRow(
  key: string,
  record: BenchmarkBundle["state"],
): ReactElement {
  return (
    <li
      key={key}
      className="rounded-md border border-border/60 bg-muted/30 p-3 space-y-1.5"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium text-foreground">{record.scopeLabel}</span>
        {record.label ? (
          <ProvenanceTag
            label={record.label}
            source={record.sources.map((s) => s.name).join(" + ")}
            vintage={record.sources.map((s) => s.vintage).join(" / ")}
          />
        ) : null}
        <CoverageStateBadge state={record.state} reason={record.reason} />
      </div>
      {record.value !== null ? (
        <p className="text-xs text-muted-foreground tabular-nums">
          <span className="font-semibold">Value:</span>{" "}
          {record.value.toLocaleString(undefined, {
            maximumFractionDigits: 2,
          })}
        </p>
      ) : null}
      <p className="text-xs text-muted-foreground">
        <span className="font-semibold">Formula:</span> {record.formula}
      </p>
      {record.sources.map((s) => (
        <a
          key={s.url}
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline mr-3"
        >
          {s.name} ({s.vintage})
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>
      ))}
    </li>
  );
}
