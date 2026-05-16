import { Switch } from "@/components/ui/switch";
import { useNerdMode } from "@/contexts/NerdModeContext";
import { BarChart3 } from "lucide-react";

export default function NerdModeToggle() {
  const { nerdMode, toggleNerdMode } = useNerdMode();

  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-border bg-muted/30 px-3 py-2">
      <BarChart3 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      <label
        htmlFor="nerd-mode"
        className="text-xs font-medium text-muted-foreground cursor-pointer select-none"
      >
        Data &amp; Nerd Mode
      </label>
      <Switch
        id="nerd-mode"
        checked={nerdMode}
        onCheckedChange={toggleNerdMode}
        aria-label="Toggle Data & Nerd Mode to show charts, CSV links, and methodology"
      />
      {nerdMode && (
        <span className="text-[10px] font-semibold text-primary">ON</span>
      )}
    </div>
  );
}
