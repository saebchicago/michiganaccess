import { Database, Clock, FileText, MessageSquare, ExternalLink, Info } from "lucide-react";
import { Link } from "react-router-dom";

// ---------------------------------------------------------------------------
// Legacy DataProvenance - default export, used by existing pages
// ---------------------------------------------------------------------------

interface DataProvenanceLegacyProps {
  /** Primary data source label, e.g. "CMS Hospital Compare, MDHHS" */
  source: string;
  /** Human-readable last-updated string, e.g. "Jan 2025" or "Real-time" */
  updated?: string;
  /** Path for methodology link (default: /methodology) */
  methodologyHref?: string;
  /** Path for feedback link (default: /contact) */
  feedbackHref?: string;
  /** Optional extra className */
  className?: string;
}

function DataProvenanceLegacy({
  source,
  updated,
  methodologyHref = "/methodology",
  feedbackHref = "/contact",
  className = "",
}: DataProvenanceLegacyProps) {
  return (
    <div
      className={`flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-md border border-border/50 bg-muted/30 px-4 py-2.5 text-[11px] text-muted-foreground ${className}`}
      role="note"
      aria-label="Data provenance"
    >
      <span className="inline-flex items-center gap-1">
        <Database className="h-3 w-3 shrink-0" aria-hidden="true" />
        <span className="font-medium text-foreground">Source:</span> {source}
      </span>

      {updated && (
        <>
          <span className="hidden sm:inline text-border" aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
            Updated {updated}
          </span>
        </>
      )}

      <span className="hidden sm:inline text-border" aria-hidden="true">·</span>

      <Link
        to={methodologyHref}
        className="inline-flex items-center gap-1 text-primary hover:underline"
      >
        <FileText className="h-3 w-3 shrink-0" aria-hidden="true" />
        Methodology
      </Link>

      <span className="hidden sm:inline text-border" aria-hidden="true">·</span>

      <Link
        to={feedbackHref}
        className="inline-flex items-center gap-1 text-primary hover:underline"
      >
        <MessageSquare className="h-3 w-3 shrink-0" aria-hidden="true" />
        Report an issue
      </Link>
    </div>
  );
}

export default DataProvenanceLegacy;

// ---------------------------------------------------------------------------
// DataProvenance - named export, V2/V3 civic intelligence primitive
// ---------------------------------------------------------------------------

export type DataKind = "measured" | "projected" | "modeled";

export interface DataProvenanceProps {
  sourceName: string;
  sourceUrl: string;
  asOfDate: string;
  cadence: string;
  dataKind: DataKind;
  methodologyUrl?: string;
  compact?: boolean;
}

export function DataProvenance({
  sourceName,
  sourceUrl,
  asOfDate,
  cadence,
  dataKind,
  methodologyUrl,
  compact = false,
}: DataProvenanceProps) {
  if (dataKind !== "measured" && !methodologyUrl) {
    console.error(
      `DataProvenance: methodologyUrl required for ${dataKind} data (${sourceName})`
    );
    return null;
  }

  const kindLabel: Record<DataKind, string | null> = {
    measured: null,
    projected: "(Projected)",
    modeled: "(Modeled estimate)",
  };

  const kindClass: Record<DataKind, string> = {
    measured: "text-muted-foreground",
    projected: "text-amber-700 dark:text-amber-400 font-medium",
    modeled: "text-amber-700 dark:text-amber-400 font-medium",
  };

  const label = kindLabel[dataKind];
  const cls = kindClass[dataKind];

  if (compact) {
    return (
      <p className={`text-[10px] ${cls}`}>
        {label && <span className="mr-1">{label}</span>}
        Most current public data:{" "}
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-primary"
        >
          {sourceName}
        </a>
        , {asOfDate}.
      </p>
    );
  }

  return (
    <div className={`text-[11px] ${cls} mt-1.5 flex flex-wrap items-center gap-1`}>
      {label && <span>{label}</span>}
      <span className="text-muted-foreground">Most current public data:</span>
      <a
        href={sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-0.5 underline hover:text-primary"
      >
        {sourceName} <ExternalLink className="h-2.5 w-2.5" />
      </a>
      <span className="text-muted-foreground">
        · As of {asOfDate} · {cadence}
      </span>
      {methodologyUrl && (
        <a
          href={methodologyUrl}
          className="inline-flex items-center gap-0.5 underline hover:text-primary"
        >
          <Info className="h-2.5 w-2.5" /> Methodology
        </a>
      )}
    </div>
  );
}
