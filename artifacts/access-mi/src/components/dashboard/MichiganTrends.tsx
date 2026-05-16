import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { MICHIGAN_TRENDS } from "@/data/michigan-trends";

export default function MichiganTrends() {
  const trendKeys = Object.keys(MICHIGAN_TRENDS) as (keyof typeof MICHIGAN_TRENDS)[];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="space-y-4"
    >
      <div className="text-center mb-2">
        <Badge variant="outline" className="mb-2 text-xs uppercase tracking-wider border-primary/30 text-primary">
          Temporal Depth
        </Badge>
        <h2 className="text-xl font-bold text-foreground">Michigan Over Time</h2>
        <p className="text-sm text-muted-foreground">8-year trends from published state and federal data</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {trendKeys.map((key) => {
          const trend = MICHIGAN_TRENDS[key];
          const latest = trend.data[trend.data.length - 1];
          const first = trend.data[0];
          const changed = trend.improving === "down"
            ? latest.value < first.value
            : latest.value > first.value;

          return (
            <Card key={key} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">{trend.label}</p>
                    <p className="text-2xl font-bold text-foreground">
                      {latest.value.toLocaleString()}{trend.unit}
                    </p>
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium ${changed ? "text-michigan-forest" : "text-michigan-coral"}`}>
                    {changed ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                    {changed ? "Improving" : "Worsening"}
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={100}>
                  <AreaChart data={trend.data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={trend.color} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={trend.color} stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="year" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis hide domain={["dataMin - 1", "dataMax + 1"]} />
                    <Tooltip
                      formatter={(v: number) => [`${v.toLocaleString()}${trend.unit}`, trend.label]}
                      contentStyle={{ borderRadius: 8, fontSize: 11, border: "1px solid hsl(214, 20%, 90%)" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={trend.color}
                      strokeWidth={2}
                      fill={`url(#grad-${key})`}
                    />
                  </AreaChart>
                </ResponsiveContainer>

                <p className="text-[10px] text-muted-foreground leading-relaxed mt-2">{trend.insight}</p>
                <p className="text-[9px] text-muted-foreground mt-1">Source: {trend.source}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </motion.div>
  );
}
