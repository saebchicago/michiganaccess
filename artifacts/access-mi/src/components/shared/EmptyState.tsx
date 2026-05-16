import { SearchX, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  subtitle?: string;
  onReset?: () => void;
  resetLabel?: string;
}

export default function EmptyState({
  icon: Icon = SearchX,
  title = "No results found",
  subtitle = "Try broadening your search or adjusting filters",
  onReset,
  resetLabel = "Clear all filters",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 px-6 text-center rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/20">
      <Icon className="h-10 w-10 text-muted-foreground/40" />
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm">{subtitle}</p>
      {onReset && (
        <Button variant="outline" size="sm" onClick={onReset} className="mt-2">
          {resetLabel}
        </Button>
      )}
    </div>
  );
}

/**
 * Compact inline "data unavailable" block for metric cards, table cells, etc.
 * Uses the same dashed-border treatment for visual consistency.
 */
export function DataUnavailable({
  label = "Data Unavailable",
  detail,
  className = "",
  variant = "default",
}: {
  label?: string;
  detail?: string;
  className?: string;
  variant?: "default" | "pending" | "error" | "loading";
}) {
  const emoji = variant === "pending" ? "📊" : variant === "error" ? "⚠️" : variant === "loading" ? "🔄" : "📊";
  return (
    <div className={`flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/20 px-4 py-8 text-center ${className}`}>
      <span className="text-2xl" role="img" aria-hidden>{emoji}</span>
      <h3 className="text-sm font-semibold text-foreground">{label}</h3>
      {detail && (
        <p className="text-[11px] text-muted-foreground/70 mt-0.5 max-w-xs mx-auto leading-relaxed">{detail}</p>
      )}
    </div>
  );
}
