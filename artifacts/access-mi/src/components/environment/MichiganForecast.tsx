import { useState } from "react";
import { Cloud, Sun, CloudRain, Snowflake, CloudLightning, Wind, Loader2, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForecast, MI_CITIES, type ForecastPeriod } from "@/hooks/useForecast";

function weatherIcon(forecast: string, isDaytime: boolean) {
  const f = forecast.toLowerCase();
  if (f.includes("thunder") || f.includes("lightning")) return <CloudLightning className="h-6 w-6 text-michigan-gold" />;
  if (f.includes("snow") || f.includes("flurr") || f.includes("blizzard")) return <Snowflake className="h-6 w-6 text-michigan-sky" />;
  if (f.includes("rain") || f.includes("shower") || f.includes("drizzle")) return <CloudRain className="h-6 w-6 text-michigan-teal" />;
  if (f.includes("cloud") || f.includes("overcast") || f.includes("fog")) return <Cloud className="h-6 w-6 text-muted-foreground" />;
  if (f.includes("wind")) return <Wind className="h-6 w-6 text-muted-foreground" />;
  if (isDaytime) return <Sun className="h-6 w-6 text-michigan-gold" />;
  return <Cloud className="h-6 w-6 text-muted-foreground" />;
}

function PeriodCard({ period }: { period: ForecastPeriod }) {
  return (
    <div className={`rounded-lg border border-border p-3 text-center ${period.isDaytime ? "bg-background" : "bg-muted/30"}`}>
      <p className="text-[10px] font-semibold text-muted-foreground mb-1">{period.name}</p>
      <div className="flex justify-center mb-1">{weatherIcon(period.shortForecast, period.isDaytime)}</div>
      <p className="text-xl font-bold text-foreground">{period.temperature}°{period.temperatureUnit}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug line-clamp-2">{period.shortForecast}</p>
      <p className="text-[9px] text-muted-foreground mt-1">{period.windDirection} {period.windSpeed}</p>
    </div>
  );
}

export default function MichiganForecast() {
  const [cityIdx, setCityIdx] = useState(0);
  const city = MI_CITIES[cityIdx];
  const { data, isLoading } = useForecast(city.lat, city.lng);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sun className="h-5 w-5 text-michigan-gold" />
            Michigan Forecast
          </CardTitle>
          <a
            href="https://www.weather.gov/dtx/"
            target="_blank"
            rel="noopener"
            className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
          >
            NWS <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* City selector */}
        <div className="flex flex-wrap gap-1.5">
          {MI_CITIES.map((c, i) => (
            <button
              key={c.name}
              onClick={() => setCityIdx(i)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors ${
                i === cityIdx
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Loading forecast...</span>
          </div>
        )}

        {!isLoading && data && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {data.slice(0, 8).map((period, i) => (
              <PeriodCard key={`${period.name}-${i}`} period={period} />
            ))}
          </div>
        )}

        <p className="text-[10px] text-muted-foreground">
          Source: NWS - updated hourly
        </p>
      </CardContent>
    </Card>
  );
}
