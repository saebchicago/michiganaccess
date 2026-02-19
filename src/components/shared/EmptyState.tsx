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
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <Icon className="h-12 w-12 text-muted-foreground/50" />
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm">{subtitle}</p>
      {onReset && (
        <Button variant="outline" size="sm" onClick={onReset} className="mt-2">
          {resetLabel}
        </Button>
      )}
    </div>
  );
}
