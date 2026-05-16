import { useState } from "react";
import { MapPin, X, ArrowRight, Navigation } from "lucide-react";
import { useCounty } from "@/contexts/CountyContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CountyContextBannerProps {
  onClear?: () => void;
}

export default function CountyContextBanner({ onClear }: CountyContextBannerProps) {
  const { county, setCounty, granularLocation, locationLabel, granularity, clearGranularLocation } = useCounty();
  const [dismissed, setDismissed] = useState(false);

  if ((!county && !granularLocation.zip && !granularLocation.censusTract) || dismissed) return null;

  const handleClear = () => {
    setCounty(null);
    clearGranularLocation();
    onClear?.();
  };

  const granularityLabels: Record<string, string> = {
    tract: "Census Tract",
    zip: "ZIP Code",
    county: "County",
    region: "Region",
    state: "Statewide",
  };

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-2.5 flex items-center justify-between gap-3 mb-4">
      <div className="flex items-center gap-2 text-sm flex-wrap">
        <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
        <span className="text-foreground">
          Showing results for <strong>{locationLabel}</strong>
        </span>
        {granularity !== "state" && (
          <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
            <Navigation className="h-2.5 w-2.5 mr-0.5" />
            {granularityLabels[granularity]}
          </Badge>
        )}
        {granularLocation.zip && granularLocation.resolvedCounty && (
          <span className="text-muted-foreground text-xs">
            vs {granularLocation.resolvedCounty} County avg
          </span>
        )}
        <button onClick={handleClear} className="text-primary hover:underline text-sm font-medium inline-flex items-center gap-0.5">
          Change location <ArrowRight className="h-3 w-3" />
        </button>
      </div>
      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setDismissed(true)} aria-label="Dismiss banner">
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
