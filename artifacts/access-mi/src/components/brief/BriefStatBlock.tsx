import { IntegrityBadge } from "@/components/chna/IntegrityBadge";
import type { IntegrityLabel } from "@/types/chna";

interface BriefStatBlockProps {
  label: string;
  value: string | number | null;
  badge: IntegrityLabel;
  source: string;
  vintage: string;
  nullNote?: string;
  className?: string;
}

export function BriefStatBlock({
  label,
  value,
  badge,
  source,
  vintage,
  nullNote,
  className = "",
}: BriefStatBlockProps) {
  const isNull =
    value === null || value === "-" || value === "" || value === undefined;

  return (
    <div
      className={`rounded-lg border border-border bg-card p-4 ${className}`}
      data-brief-stat
    >
      <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1.5">
        {label}
      </p>
      {isNull ? (
        <p className="text-sm text-muted-foreground italic">
          {nullNote ?? "No data available"}
        </p>
      ) : (
        <p className="text-2xl font-bold text-foreground leading-none">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-1.5 mt-2">
        <IntegrityBadge label={badge} source={source} vintage={vintage} />
        <span className="text-[10px] text-muted-foreground">
          {source} · {vintage}
        </span>
      </div>
    </div>
  );
}
