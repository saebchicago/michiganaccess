import type { IntegrityLabel } from "@/types/chna";
import { cn } from "@/lib/utils";

const CONFIG: Record<
  IntegrityLabel,
  { text: string; className: string; title: string }
> = {
  VERIFIED: {
    text: "VERIFIED",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
    title: "Measured directly from a primary federal or state source",
  },
  MODELED: {
    text: "MODELED",
    className: "bg-sky-100 text-sky-800 border-sky-200",
    title: "Derived or calculated from verified inputs",
  },
  PROJECTED: {
    text: "PROJECTED",
    className: "bg-amber-100 text-amber-800 border-amber-200",
    title: "Forward-looking estimate",
  },
};

interface IntegrityBadgeProps {
  label: IntegrityLabel;
  className?: string;
}

export function IntegrityBadge({ label, className }: IntegrityBadgeProps) {
  const { text, className: colorClass, title } = CONFIG[label];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold tracking-wider",
        colorClass,
        className,
      )}
      title={title}
      aria-label={`Data integrity: ${text}`}
    >
      {text}
    </span>
  );
}
