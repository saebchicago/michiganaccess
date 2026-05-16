import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ArrowRight, type LucideIcon } from "lucide-react";

export type SectorType = "health" | "housing" | "utilities" | "water" | "transportation" | "environment" | "value";

export interface SectionCardProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  href?: string;
  onClick?: () => void;
  variant?: SectorType;
  className?: string;
}

const variantColors: Record<SectorType, { bg: string; text: string }> = {
  health: { bg: "bg-primary/10", text: "text-primary" },
  housing: { bg: "bg-accent/10", text: "text-accent" },
  utilities: { bg: "bg-secondary/20", text: "text-secondary-foreground" },
  water: { bg: "bg-info/10", text: "text-info" },
  transportation: { bg: "bg-muted", text: "text-foreground" },
  environment: { bg: "bg-accent/10", text: "text-accent" },
  value: { bg: "bg-primary/10", text: "text-primary" },
};

export default function SectionCard({
  title,
  description,
  icon: Icon,
  href,
  onClick,
  variant = "health",
  className,
}: SectionCardProps) {
  const colors = variantColors[variant];

  const content = (
    <>
      {Icon && (
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", colors.bg)}>
          <Icon className={cn("h-5 w-5", colors.text)} aria-hidden="true" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
    </>
  );

  const sharedClass = cn(
    "group flex items-center gap-3 rounded-lg border border-border bg-card p-4",
    "transition-all duration-200 hover:shadow-md hover:border-border/80",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    className,
  );

  if (href) {
    return (
      <Link to={href} className={sharedClass}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={cn(sharedClass, "text-left w-full")}>
      {content}
    </button>
  );
}
