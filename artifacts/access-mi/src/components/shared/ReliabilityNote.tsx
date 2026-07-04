/**
 * Presentation helpers for the two non-badge reliability states from
 * src/lib/reliability.ts. The "flagged" tier is handled by MoEBadge
 * (renders alongside the value); these two components handle the tiers
 * where MoEBadge alone is not enough:
 *
 *   - SuppressedEstimate: the "suppressed" tier. The point value is not
 *     rendered at all - callers should skip their normal value markup and
 *     render this instead, per the FARS small-cell suppression precedent
 *     (src/data/county-traffic-fatalities.ts + snapshotMetrics.ts): show
 *     the caveat, keep the source attributed.
 *   - MoeUnavailableNote: the "unavailable" tier (MOE missing). The value
 *     still renders normally; this note goes alongside it so the figure
 *     is never silently presented as if its reliability were known.
 */
import { Info } from "lucide-react";

export function SuppressedEstimate({
  source,
  className = "",
}: {
  source?: string;
  className?: string;
}) {
  return (
    <div className={`text-xs text-muted-foreground italic ${className}`}>
      Estimate suppressed: unreliable at this geography.
      {source && <span className="not-italic"> Source: {source}.</span>}
    </div>
  );
}

export function MoeUnavailableNote({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[9px] text-muted-foreground/70 ${className}`}
    >
      <Info className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />
      MOE unavailable
    </span>
  );
}
