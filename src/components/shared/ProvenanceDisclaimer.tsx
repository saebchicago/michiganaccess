import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export function ProvenanceDisclaimer() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-border/50 bg-muted/30 px-4 py-3 text-[11px] text-muted-foreground">
      <p>
        This page combines measured public data with projections from named sources. All
        projected values are labeled and dated. accessmi.org does not produce original
        forecasts; we surface the most current publicly available data from CBO, GAO,
        MDHHS, MLPP, CBPP, USDA, and other named sources.{" "}
        {!expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="inline-flex items-center gap-0.5 text-primary hover:underline"
            aria-expanded={false}
          >
            Learn more <ChevronDown className="h-3 w-3" />
          </button>
        )}
      </p>
      {expanded && (
        <p className="mt-2">
          Projections involve uncertainty. Each metric links to its methodology. Where a
          projection or modeled estimate is shown, an uncertainty range is included wherever
          the source provides one. Measured data reflects the most recent publicly available
          release from the named agency; refresh cadence is noted on each metric.{" "}
          <button
            onClick={() => setExpanded(false)}
            className="inline-flex items-center gap-0.5 text-primary hover:underline"
            aria-expanded={true}
          >
            Show less <ChevronUp className="h-3 w-3" />
          </button>
        </p>
      )}
    </div>
  );
}
