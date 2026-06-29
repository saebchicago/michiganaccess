import { AlertTriangle, ExternalLink } from "lucide-react";
import type { ExclusionRecord } from "@/lib/exclusions";

interface Props {
  record: ExclusionRecord;
  generatedAt: string;
}

export default function ExclusionBadge({ record, generatedAt }: Props) {
  const dateLabel = generatedAt
    ? new Date(generatedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "unknown date";

  return (
    <div className="inline-flex flex-col gap-1 rounded border border-red-500/40 bg-red-50 dark:bg-red-950/30 px-2.5 py-1.5 text-xs">
      <span className="inline-flex items-center gap-1.5 font-semibold text-red-700 dark:text-red-400">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        Excluded from federal contracting
      </span>
      {(record.exclusionType || record.activationDate) && (
        <span className="text-red-600/80 dark:text-red-400/80">
          {record.exclusionType}
          {record.exclusionType && record.activationDate ? " - " : ""}
          {record.activationDate ? `Active since ${record.activationDate}` : ""}
        </span>
      )}
      <span className="text-[10px] text-red-500/70 dark:text-red-400/60">
        Verified - SAM.gov active exclusions, {dateLabel}
      </span>
      <a
        href={record.samUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-[10px] text-red-600 dark:text-red-400 underline underline-offset-2 hover:text-red-800 dark:hover:text-red-300"
        aria-label="View exclusion record on SAM.gov, opens in new window"
      >
        View on SAM.gov{" "}
        <ExternalLink className="h-2.5 w-2.5" aria-hidden="true" />
      </a>
    </div>
  );
}
