import { useState } from "react";
import { MapPin, X, ArrowRight } from "lucide-react";
import { useCounty } from "@/contexts/CountyContext";
import { Button } from "@/components/ui/button";

interface CountyContextBannerProps {
  onClear?: () => void;
}

export default function CountyContextBanner({ onClear }: CountyContextBannerProps) {
  const { county, setCounty } = useCounty();
  const [dismissed, setDismissed] = useState(false);

  if (!county || dismissed) return null;

  const handleClear = () => {
    setCounty(null);
    onClear?.();
  };

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-2.5 flex items-center justify-between gap-3 mb-4">
      <div className="flex items-center gap-2 text-sm">
        <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
        <span className="text-foreground">
          Showing results for <strong>{county} County</strong>.
        </span>
        <button onClick={handleClear} className="text-primary hover:underline text-sm font-medium inline-flex items-center gap-0.5">
          Change county <ArrowRight className="h-3 w-3" />
        </button>
      </div>
      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setDismissed(true)} aria-label="Dismiss banner">
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
