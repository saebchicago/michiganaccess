import { CheckCircle2, Calculator, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export type ProvenanceLabel = "VERIFIED" | "MODELED" | "PROJECTED";

interface ProvenanceTagProps {
  label: ProvenanceLabel;
  source?: string;
  className?: string;
}

const STYLES: Record<
  ProvenanceLabel,
  { classes: string; Icon: typeof CheckCircle2; description: string }
> = {
  VERIFIED: {
    classes:
      "border-michigan-forest/30 bg-michigan-forest/10 text-michigan-forest",
    Icon: CheckCircle2,
    description: "Confirmed from a primary federal source.",
  },
  MODELED: {
    classes: "border-michigan-teal/30 bg-michigan-teal/10 text-michigan-teal",
    Icon: Calculator,
    description: "Derived or calculated from verified inputs.",
  },
  PROJECTED: {
    classes: "border-michigan-gold/30 bg-michigan-gold/10 text-michigan-gold",
    Icon: TrendingUp,
    description: "Forward-looking estimate.",
  },
};

export function ProvenanceTag({
  label,
  source,
  className,
}: ProvenanceTagProps) {
  const { classes, Icon, description } = STYLES[label];
  const title = source ? `${description} Source: ${source}` : description;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        classes,
        className,
      )}
      title={title}
      aria-label={`Provenance: ${label}${source ? `. Source: ${source}` : ""}`}
    >
      <Icon className="h-2.5 w-2.5" aria-hidden="true" />
      {label}
    </span>
  );
}
