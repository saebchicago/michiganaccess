import { cn } from "@/lib/utils";

export type ViewMode = "resident" | "policy" | "nerd";

export interface ModeToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
  className?: string;
}

const modes: { value: ViewMode; label: string }[] = [
  { value: "resident", label: "Resident" },
  { value: "policy", label: "Policy & Planning" },
  { value: "nerd", label: "Data Nerd" },
];

export default function ModeToggle({ value, onChange, className }: ModeToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Display mode"
      className={cn(
        "inline-flex rounded-lg border border-border bg-muted/40 p-0.5",
        className,
      )}
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
