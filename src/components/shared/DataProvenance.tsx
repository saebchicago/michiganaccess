import { Database, Clock, FileText, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

interface DataProvenanceProps {
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

export default function DataProvenance({
  source,
  updated,
  methodologyHref = "/methodology",
  feedbackHref = "/contact",
  className = "",
}: DataProvenanceProps) {
  return (
    <div
      className={`flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-md border border-border/50 bg-muted/30 px-4 py-2.5 text-[11px] text-muted-foreground ${className}`}
      role="contentinfo"
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
