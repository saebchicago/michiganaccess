/**
 * Standard / CHNA-VBC view toggle — reusable across Brief, Compare pages.
 */
import { cn } from "@/lib/utils";

export type ViewMode = "standard" | "chna";

interface ViewModeToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
  className?: string;
}

const modes: { value: ViewMode; label: string }[] = [
  { value: "standard", label: "Standard View" },
  { value: "chna", label: "CHNA / VBC View" },
];

export default function ViewModeToggle({ value, onChange, className }: ViewModeToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="View mode"
      className={cn("inline-flex rounded-lg border border-border bg-muted/40 p-0.5", className)}
    >
      {modes.map((mode) => {
        const isActive = value === mode.value;
        return (
          <button
            key={mode.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(mode.value)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
              isActive
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}
