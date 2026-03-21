import { useState } from "react";
import { Wind, Search, Loader2, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useAirQualityByZip,
  AQI_CATEGORY_COLORS,
  AQI_CATEGORY_TEXT_COLORS,
  AQI_CATEGORY_BG,
  type AirQualityObservation,
} from "@/hooks/useAirQualityByZip";

function AQIDisplay({ obs }: { obs: AirQualityObservation }) {
  const catNum = obs.Category.Number;
  const bgClass = AQI_CATEGORY_BG[catNum] || "bg-muted";
  const textClass = AQI_CATEGORY_TEXT_COLORS[catNum] || "text-foreground";
  const dotColor = AQI_CATEGORY_COLORS[catNum] || "#999";

  return (
    <div className={`rounded-xl p-5 ${bgClass} transition-colors`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">
            {obs.ReportingArea}, {obs.StateCode}
          </p>
          <p className={`text-5xl font-bold tracking-tight ${textClass}`}>
            {obs.AQI}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: dotColor }}
            />
            <span className={`text-sm font-semibold ${textClass}`}>
              {obs.Category.Name}
            </span>
          </div>
        </div>
        <div className="text-right space-y-1">
          <Badge variant="secondary" className="text-[10px]">
            {obs.ParameterName}
          </Badge>
          <p className="text-[10px] text-muted-foreground">
            {obs.DateObserved} · {obs.HourObserved}:00 {obs.LocalTimeZone}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AirQualityChecker() {
  const [zip, setZip] = useState("48201");
  const [activeZip, setActiveZip] = useState("48201");
  const { data, isLoading, isFetching } = useAirQualityByZip(activeZip);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (zip.length === 5) setActiveZip(zip);
  };

  const primary = data?.find((d) => d.ParameterName === "PM2.5") || data?.[0];
  const others = data?.filter((d) => d !== primary) || [];

  return (
    <Card className="border-michigan-sky/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Wind className="h-5 w-5 text-michigan-sky" />
          Live Air Quality — Check Your ZIP
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]{5}"
            maxLength={5}
            value={zip}
            onChange={(e) => setZip(e.target.value.replace(/\D/g, ""))}
            placeholder="Enter MI ZIP code"
            className="max-w-[160px]"
            aria-label="ZIP code for air quality"
          />
          <Button
            type="submit"
            size="sm"
            disabled={zip.length !== 5 || isFetching}
          >
            {isFetching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </form>

        <div aria-live="polite" aria-atomic="true">
        {isLoading && (
          <div className="flex items-center gap-2 py-6 justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Fetching air quality data...
            </span>
          </div>
        )}

        {!isLoading && primary && <AQIDisplay obs={primary} />}

        {!isLoading && others.length > 0 && (
          <div className="grid gap-2 sm:grid-cols-2">
            {others.map((obs) => (
              <div
                key={obs.ParameterName}
                className="rounded-lg border border-border p-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs text-muted-foreground">
                    {obs.ParameterName}
                  </p>
                  <p className="text-lg font-bold text-foreground">
                    {obs.AQI}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="text-[10px]"
                  style={{
                    borderColor:
                      AQI_CATEGORY_COLORS[obs.Category.Number] || "#ccc",
                  }}
                >
                  {obs.Category.Name}
                </Badge>
              </div>
            ))}
          </div>
        )}

        </div>
        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
          Data from{" "}
          <a
            href="https://www.airnow.gov/"
            target="_blank"
            rel="noopener"
            className="text-primary hover:underline inline-flex items-center gap-0.5"
          >
            AirNow.gov <ExternalLink className="h-2.5 w-2.5" />
          </a>{" "}
          — updated hourly
        </p>
      </CardContent>
    </Card>
  );
}
