import { CheckCircle2, FlaskConical, Lightbulb, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const CONFIG = {
  verified: {
    label: "Verified public data",
    icon: CheckCircle2,
    className: "text-michigan-forest bg-michigan-forest/8 border-michigan-forest/20",
  },
  modeled: {
    label: "Model estimate derived from public datasets",
    icon: FlaskConical,
    className: "text-michigan-teal bg-michigan-teal/8 border-michigan-teal/20",
  },
  illustrative: {
    label: "Illustrative example — demonstrates platform capability",
    icon: Lightbulb,
    className: "text-michigan-gold bg-michigan-gold/8 border-michigan-gold/20",
  },
  pending: {
    label: "Data not yet available for this county",
    icon: Clock,
    className: "text-muted-foreground bg-muted/50 border-border",
  },
} as const;

export type DataClassificationType = keyof typeof CONFIG;

export function DataClassification({
  type,
  className = "",
}: {
  type: DataClassificationType;
  className?: string;
}) {
  const c = CONFIG[type];
  const Icon = c.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] leading-tight font-medium ${c.className} ${className}`}
    >
      <Icon className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />
      {c.label}
    </span>
  );
}

/** Plain-language explainer for methodology page */
export function DataClassificationLegend() {
  return (
    <div className="space-y-3">
      {(Object.keys(CONFIG) as DataClassificationType[]).map((type) => {
        const c = CONFIG[type];
        const Icon = c.icon;
        return (
          <div key={type} className="flex items-start gap-3">
            <span
              className={`mt-0.5 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] leading-tight font-medium shrink-0 ${c.className}`}
            >
              <Icon className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />
              {c.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
