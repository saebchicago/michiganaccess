import { useState, useCallback } from "react";
import { MapPin, Navigation, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface NearbyServicesPromptProps {
  onLocationFound?: (lat: number, lng: number, radiusMiles: number) => void;
  className?: string;
  compact?: boolean;
}

export default function NearbyServicesPrompt({ onLocationFound, className = "", compact = false }: NearbyServicesPromptProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "granted" | "denied">("idle");
  const [radius, setRadius] = useState("10");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });
        setStatus("granted");
        toast.success("Location found! Showing nearby services.");
        onLocationFound?.(latitude, longitude, parseInt(radius));
      },
      (error) => {
        setStatus("denied");
        if (error.code === error.PERMISSION_DENIED) {
          toast.error("Location access denied. You can enable it in browser settings.");
        } else {
          toast.error("Unable to determine your location. Please try again.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, [radius, onLocationFound]);

  const handleRadiusChange = (value: string) => {
    setRadius(value);
    if (coords) {
      onLocationFound?.(coords.lat, coords.lng, parseInt(value));
    }
  };

  if (dismissed) return null;

  if (compact) {
    return (
      <Button
        size="sm"
        variant="outline"
        className={`gap-1.5 text-xs ${className}`}
        onClick={requestLocation}
        disabled={status === "loading"}
      >
        {status === "loading" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Navigation className="h-3.5 w-3.5" />
        )}
        Near me
      </Button>
    );
  }

  return (
    <Card className={`border-primary/20 bg-primary/5 ${className}`}>
      <CardContent className="py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Find Services Near You</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {status === "granted"
                    ? "Showing services near your location"
                    : "Allow location access to see what's available within your area"}
                </p>
              </div>
              <button onClick={() => setDismissed(true)} className="text-muted-foreground hover:text-foreground p-1" aria-label="Dismiss">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {status !== "granted" ? (
                <Button size="sm" onClick={requestLocation} disabled={status === "loading"} className="h-7 text-xs gap-1.5">
                  {status === "loading" ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Navigation className="h-3 w-3" />
                  )}
                  {status === "loading" ? "Locating..." : "Show me services nearby"}
                </Button>
              ) : (
                <span className="text-xs text-primary font-medium flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Location active
                </span>
              )}
              <Select value={radius} onValueChange={handleRadiusChange}>
                <SelectTrigger className="w-28 h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">Within 5 mi</SelectItem>
                  <SelectItem value="10">Within 10 mi</SelectItem>
                  <SelectItem value="25">Within 25 mi</SelectItem>
                  <SelectItem value="50">Within 50 mi</SelectItem>
                </SelectContent>
              </Select>
              {status === "denied" && (
                <span className="text-xs text-destructive">Location access denied</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
