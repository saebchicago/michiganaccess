/**
 * Standard / CHNA-VBC view toggle - reusable across Brief, Compare pages.
 */
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <div
        role="radiogroup"
        aria-label="View mode"
        className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5"
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
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="What is CHNA / VBC view?">
              <Info className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-[260px] text-xs">
            Re-groups data to match community health assessment and value-based care planning frameworks for hospitals, health plans, and public health.
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
