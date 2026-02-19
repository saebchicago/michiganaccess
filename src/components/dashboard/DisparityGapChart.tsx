import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

const DISPARITY_DATA = [
  { metric: "Life Expectancy (yrs)", white: 78.1, black: 73.4, hispanic: 80.2, asian: 83.5 },
  { metric: "Infant Mortality (/1k)", white: 4.8, black: 12.6, hispanic: 5.1, asian: 3.2 },
  { metric: "Uninsured Rate (%)", white: 4.2, black: 7.8, hispanic: 12.5, asian: 5.1 },
  { metric: "Diabetes (%)", white: 10.1, black: 15.8, hispanic: 13.2, asian: 9.8 },
  { metric: "Obesity (%)", white: 32.1, black: 41.2, hispanic: 35.8, asian: 12.7 },
  { metric: "Heart Disease (%)", white: 10.5, black: 13.8, hispanic: 9.2, asian: 7.1 },
];

const COLORS: Record<string, string> = {
  white: "hsl(209, 86%, 31%)",
  black: "hsl(0, 100%, 55%)",
  hispanic: "hsl(27, 87%, 55%)",
  asian: "hsl(180, 100%, 32%)",
};

export default function DisparityGapChart() {
  const gapData = useMemo(() =>
    DISPARITY_DATA.map((d) => {
      const vals = [d.white, d.black, d.hispanic, d.asian];
      const max = Math.max(...vals);
      const min = Math.min(...vals);
      const isHighBad = !d.metric.includes("Life");
      const gap = isHighBad ? (max / min) : (max - min);
      const label = isHighBad ? `${gap.toFixed(1)}×` : `${gap.toFixed(1)} yr`;
      return { metric: d.metric, gap, label, isHighBad };
    }).sort((a, b) => b.gap - a.gap),
    []
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Racial/Ethnic Disparity Gap Index — Michigan
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Gap magnitude between highest and lowest racial/ethnic group for each health indicator.
            Higher values indicate greater inequity requiring targeted intervention.
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            <strong>How to read:</strong> For rate-based metrics, the gap is shown as a ratio (e.g., 2.6× means the highest group's rate is 2.6 times the lowest).
            For life expectancy, the gap is shown in years. Data sourced from MDHHS Health Equity reports, CDC WONDER, and County Health Rankings 2024.
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={gapData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="metric" type="category" tick={{ fontSize: 11 }} width={140} />
              <Tooltip formatter={(v: number, _n: string, props: any) => props.payload.label} />
              <Bar dataKey="gap" radius={[0, 4, 4, 0]} name="Disparity Gap">
                {gapData.map((entry, i) => (
                  <Cell key={i} fill={entry.gap > 2.5 ? "hsl(0, 100%, 55%)" : entry.gap > 1.5 ? "hsl(27, 87%, 55%)" : "hsl(209, 86%, 31%)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-3 mt-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm" style={{ background: "hsl(0,100%,55%)" }} /> High (&gt;2.5×)</span>
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm" style={{ background: "hsl(27,87%,55%)" }} /> Moderate</span>
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm" style={{ background: "hsl(209,86%,31%)" }} /> Lower</span>
          </div>
        </CardContent>
      </Card>

      {/* Grouped bar: side-by-side racial breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Health Indicators by Race/Ethnicity</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={DISPARITY_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="metric" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="white" name="White" fill={COLORS.white} radius={[3, 3, 0, 0]} />
              <Bar dataKey="black" name="Black" fill={COLORS.black} radius={[3, 3, 0, 0]} />
              <Bar dataKey="hispanic" name="Hispanic" fill={COLORS.hispanic} radius={[3, 3, 0, 0]} />
              <Bar dataKey="asian" name="Asian" fill={COLORS.asian} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
