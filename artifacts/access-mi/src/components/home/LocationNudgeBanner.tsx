import { useState } from "react";
import { MapPin } from "lucide-react";
import { useCounty } from "@/contexts/CountyContext";
import { Button } from "@/components/ui/button";

const DISMISS_KEY = "accessmi-location-nudge-dismissed";

export default function LocationNudgeBanner() {
  const { county, granularLocation } = useCounty();
  const hasLocation = !!(county || granularLocation?.zip);
  const [dismissed, setDismissed] = useState(
    () => typeof window !== "undefined" && localStorage.getItem(DISMISS_KEY) === "1"
  );

  if (hasLocation || dismissed) return null;

  const handleSetLocation = () => {
    document.querySelector<HTMLButtonElement>('[aria-label="Select county"]')?.click();
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(DISMISS_KEY, "1");
  };

  return (
    <div className="border-b border-amber-200 dark:border-amber-800/40 bg-amber-50/80 dark:bg-amber-950/20">
      <div className="container flex items-center justify-between gap-3 py-2 text-xs">
        <p className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>You're viewing statewide data. Set your ZIP for local resources.</span>
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            className="h-6 text-[10px] px-2 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30"
            onClick={handleSetLocation}
          >
            Set Location
          </Button>
          <button
            onClick={handleDismiss}
            className="text-amber-600/60 hover:text-amber-800 dark:text-amber-500/50 dark:hover:text-amber-300 transition-colors"
            aria-label="Dismiss location prompt"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
