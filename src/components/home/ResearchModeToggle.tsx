import { FlaskConical, Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface ResearchModeToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export default function ResearchModeToggle({ checked, onCheckedChange }: ResearchModeToggleProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/80 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">Research Mode</p>
        <p className="text-sm text-muted-foreground">
          Switch between a guided civic summary and a methodology-rich research view.
        </p>
      </div>
      <div className="flex items-center gap-3 rounded-full border border-border/60 bg-background px-3 py-2">
        <div className={`flex items-center gap-1.5 text-xs font-medium ${checked ? "text-muted-foreground" : "text-foreground"}`}>
          <Sparkles className="h-3.5 w-3.5" />
          Simple View
        </div>
        <Switch
          checked={checked}
          onCheckedChange={onCheckedChange}
          aria-label="Toggle research mode"
        />
        <div className={`flex items-center gap-1.5 text-xs font-medium ${checked ? "text-foreground" : "text-muted-foreground"}`}>
          <FlaskConical className="h-3.5 w-3.5" />
          Research View
        </div>
      </div>
    </div>
  );
}
