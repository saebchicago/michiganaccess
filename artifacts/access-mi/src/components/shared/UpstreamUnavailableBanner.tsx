/**
 * Owner Decision 3 (source archival manifest): when a source's latest
 * ingest attempt failed, the figures it backs still render using the
 * last valid snapshot - this banner is the only thing that changes.
 * Provenance label is unchanged; the figure is still the labeled data,
 * just stale. Renders nothing when the source is healthy or has no
 * recorded ingest attempt (e.g. a script not yet wired into the
 * manifest), so adding this component to a page is always safe.
 */
import { AlertTriangle } from "lucide-react";
import { getSourceHealth } from "@/data/sourceHealth";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function UpstreamUnavailableBanner({
  sourceId,
  compact = false,
  className = "",
}: {
  sourceId: string | undefined;
  /** Compact inline rendering for tight spaces (e.g. a SnapshotCard
   * tile), matching the sizing of ReliabilityNote's MoeUnavailableNote
   * rather than the full bordered banner. */
  compact?: boolean;
  className?: string;
}) {
  const health = sourceId ? getSourceHealth(sourceId) : null;
  if (!health || health.latest_valid) return null;

  const unavailableAsOf = formatDate(health.latest_retrieved_at);
  const snapshotNote = health.last_valid_retrieved_at
    ? `Displaying last verified snapshot from ${formatDate(health.last_valid_retrieved_at)}.`
    : "No previously verified snapshot is available for this source.";
  const message = `Upstream source unavailable as of ${unavailableAsOf}. ${snapshotNote}`;

  if (compact) {
    return (
      <p
        role="status"
        className={`pt-1 flex items-start gap-1 text-[9px] leading-snug text-amber-700 dark:text-amber-400 ${className}`}
      >
        <AlertTriangle
          className="mt-0.5 h-2.5 w-2.5 shrink-0"
          aria-hidden="true"
        />
        <span>{message}</span>
      </p>
    );
  }

  return (
    <div
      role="status"
      className={`rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950/30 ${className}`}
    >
      <div className="flex items-start gap-2">
        <AlertTriangle
          className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400"
          aria-hidden="true"
        />
        <p className="text-xs text-amber-800 dark:text-amber-200">
          {message}
        </p>
      </div>
    </div>
  );
}
