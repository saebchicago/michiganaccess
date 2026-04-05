import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, TrendingUp } from "lucide-react";
import type { FEMADisaster } from "@/lib/fema-client";

interface Props {
  disasters: FEMADisaster[];
}

const KEY_EVENTS: { year: number; label: string }[] = [
  { year: 1986, label: "1986 Grand Rapids Flood" },
  { year: 2014, label: "2014 SE Michigan Flooding" },
  { year: 2020, label: "2020 Midland Dam Failure" },
  { year: 2021, label: "2021 Metro Detroit Flooding" },
];

export default function DisasterAccelerationChart({ disasters }: Props) {
  // Count unique declarations per year
  const yearCounts = useMemo(() => {
    const seen = new Set<number>();
    const counts: Record<number, number> = {};
    for (const d of disasters) {
      const year = new Date(d.declarationDate).getFullYear();
      const key = d.disasterNumber;
      if (seen.has(key)) continue;
      seen.add(key);
      counts[year] = (counts[year] || 0) + 1;
    }
    return counts;
  }, [disasters]);

  // Cumulative line chart data
  const cumulativeData = useMemo(() => {
    const minYear = 1953;
    const maxYear = new Date().getFullYear();
    const data: { year: number; cumulative: number }[] = [];
    let cumulative = 0;
    for (let y = minYear; y <= maxYear; y++) {
      cumulative += yearCounts[y] || 0;
      data.push({ year: y, cumulative });
    }
    return data;
  }, [yearCounts]);

  // Decade comparison: 1970s vs 2020s (unique declarations)
  const decadeCounts = useMemo(() => {
    const seen = new Set<number>();
    const decades: Record<string, number> = {};
    for (const d of disasters) {
      if (seen.has(d.disasterNumber)) continue;
      seen.add(d.disasterNumber);
      const year = new Date(d.declarationDate).getFullYear();
      const decade = `${Math.floor(year / 10) * 10}s`;
      decades[decade] = (decades[decade] || 0) + 1;
    }
    return decades;
  }, [disasters]);

  const count1970s = decadeCounts["1970s"] || 0;
  const count2020s = decadeCounts["2020s"] || 0;
  const max70vs20 = Math.max(count1970s, count2020s, 1);

  // Average per decade: 1970s-1990s vs 2010s-2020s
  const { avgEarly, avgRecent, pctIncrease } = useMemo(() => {
    const early = ["1970s", "1980s", "1990s"];
    const recent = ["2010s", "2020s"];
    const sumEarly = early.reduce((s, d) => s + (decadeCounts[d] || 0), 0);
    const sumRecent = recent.reduce((s, d) => s + (decadeCounts[d] || 0), 0);
    const aE = Math.round(sumEarly / early.length);
    const aR = Math.round(sumRecent / recent.length);
    const pct = aE > 0 ? Math.round(((aR - aE) / aE) * 100) : 0;
    return { avgEarly: aE, avgRecent: aR, pctIncrease: pct };
  }, [decadeCounts]);

  // Find cumulative value at key event years for ReferenceDots
  const eventDots = useMemo(() => {
    return KEY_EVENTS.map((evt) => {
      const point = cumulativeData.find((p) => p.year === evt.year);
      return { ...evt, cumulative: point?.cumulative || 0 };
    });
  }, [cumulativeData]);

  return (
    <div className="space-y-6">
      {/* Side-by-side decade comparison */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-red-500" />
            <CardTitle className="text-base">Disaster Acceleration: 1970s vs 2020s</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            Unique federal disaster declarations per decade. The 2020s count runs through 2025 — the decade is incomplete.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            {/* 1970s */}
            <div className="text-center space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">1970s</p>
              <p className="text-4xl font-bold text-foreground">{count1970s}</p>
              <p className="text-[10px] text-muted-foreground">disaster declarations</p>
              <div className="mx-auto h-3 rounded-full bg-muted overflow-hidden max-w-48">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-700"
                  style={{ width: `${(count1970s / max70vs20) * 100}%` }}
                />
              </div>
            </div>
            {/* 2020s */}
            <div className="text-center space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">2020s (through 2025)</p>
              <p className="text-4xl font-bold text-red-600 dark:text-red-400">{count2020s}</p>
              <p className="text-[10px] text-muted-foreground">disaster declarations · decade incomplete</p>
              <div className="mx-auto h-3 rounded-full bg-muted overflow-hidden max-w-48">
                <div
                  className="h-full rounded-full bg-red-500 transition-all duration-700"
                  style={{ width: `${(count2020s / max70vs20) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cumulative line chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Cumulative Disaster Declarations Over Time</CardTitle>
          <p className="text-xs text-muted-foreground">
            Total unique declarations from 1953 to present. Note the steepening slope in recent decades.
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cumulativeData} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => (v % 10 === 0 ? String(v) : "")}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  labelFormatter={(v) => `Year: ${v}`}
                  formatter={(v: number) => [v, "Cumulative Declarations"]}
                />
                <Line
                  type="monotone"
                  dataKey="cumulative"
                  stroke="#EF4444"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                {eventDots.map((evt) => (
                  <ReferenceDot
                    key={evt.year}
                    x={evt.year}
                    y={evt.cumulative}
                    r={5}
                    fill="#EF4444"
                    stroke="#fff"
                    strokeWidth={2}
                    label={{
                      value: evt.label,
                      position: evt.year < 2000 ? "right" : "left",
                      fontSize: 9,
                      fill: "#6B7280",
                    }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Key stat */}
      <Card className="border-red-400/30 bg-red-50/30 dark:bg-red-950/10">
        <CardContent className="pt-5 pb-4 text-center space-y-2">
          <p className="text-sm text-foreground font-medium">
            Michigan averaged <span className="font-bold text-primary">{avgEarly}</span> declarations/decade in the 1970s-90s.
            Since 2010: <span className="font-bold text-red-600 dark:text-red-400">{avgRecent}</span>/decade
            {pctIncrease > 0 && (
              <> — a <span className="font-bold text-red-600 dark:text-red-400">{pctIncrease}%</span> increase</>
            )}.
          </p>
        </CardContent>
      </Card>

      {/* Source */}
      <div className="rounded-lg border border-border bg-muted/50 p-3 flex items-start gap-2">
        <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
        <p className="text-[10px] text-muted-foreground">
          Source: FEMA OpenFEMA API. Computations by accessmi.org.
        </p>
      </div>
    </div>
  );
}
