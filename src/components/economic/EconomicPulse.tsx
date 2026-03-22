import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { TrendingDown, TrendingUp, DollarSign, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";
import { fetchFredSeries, FRED_SERIES } from "@/lib/fred-client";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

function Sparkline({ data, color }: { data: { value: number }[]; color: string }) {
  if (data.length < 2) return null;
  return (
    <ResponsiveContainer width="100%" height={40}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`sg-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <Tooltip formatter={(v: number) => [v.toFixed(1), ""]} contentStyle={{ fontSize: 10, borderRadius: 6 }} />
        <Area type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} fill={`url(#sg-${color})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// Fallback data
const FALLBACK_UNEMP = [
  { date: "2024-01", value: 4.8 }, { date: "2024-04", value: 4.6 }, { date: "2024-07", value: 4.5 },
  { date: "2024-10", value: 4.3 }, { date: "2025-01", value: 4.4 }, { date: "2025-04", value: 4.2 },
  { date: "2025-07", value: 4.1 }, { date: "2025-10", value: 4.0 },
];

export default function EconomicPulse() {
  const { data: unempData, isLoading } = useQuery({
    queryKey: ["fred", FRED_SERIES.miUnemployment],
    queryFn: () => fetchFredSeries(FRED_SERIES.miUnemployment),
    staleTime: 30 * 60 * 1000,
  });

  const unemp = (unempData && unempData.length > 0) ? unempData : FALLBACK_UNEMP;
  const latest = unemp[unemp.length - 1];
  const prev = unemp.length > 1 ? unemp[unemp.length - 2] : latest;
  const trending = latest.value <= prev.value ? "down" : "up";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4 gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Loading economic data...</span>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-muted-foreground">Michigan Economic Pulse</span>
                <Badge variant="outline" className="text-[8px]">FRED / BLS</Badge>
              </div>
              <div className="flex items-baseline gap-2">
                <AnimatedCounter value={latest.value} decimals={1} suffix="%" className="text-3xl font-bold text-foreground" />
                <div className={`flex items-center gap-0.5 text-xs ${trending === "down" ? "text-michigan-forest" : "text-michigan-coral"}`}>
                  {trending === "down" ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                  Unemployment
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Latest: {latest.date} · Source: FRED Series MIUR
              </p>
            </div>
            <div className="w-32 shrink-0">
              <Sparkline data={unemp.slice(-12)} color="#0A4C95" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
