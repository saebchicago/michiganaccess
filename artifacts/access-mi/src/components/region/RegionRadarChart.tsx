import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent } from "@/components/ui/card";

interface RegionMetric {
  regionName: string;
  color: string;
  uninsuredRate: number;
  foodInsecurity: number;
  primaryCareRatio: number;
  facilitiesPer100k: number;
  resourcesPer100k: number;
}

interface Props {
  regions: RegionMetric[];
}

/**
 * Normalize metrics to 0-100 scale for radar comparison.
 * Lower is better for rates/ratios, so we invert them.
 */
function normalize(value: number, min: number, max: number, invert = false) {
  const norm = ((value - min) / (max - min)) * 100;
  return invert ? 100 - Math.min(100, Math.max(0, norm)) : Math.min(100, Math.max(0, norm));
}

export default function RegionRadarChart({ regions }: Props) {
  if (regions.length < 2) return null;

  // Compute ranges
  const allUR = regions.map(r => r.uninsuredRate);
  const allFI = regions.map(r => r.foodInsecurity);
  const allPCR = regions.map(r => r.primaryCareRatio);
  const allFac = regions.map(r => r.facilitiesPer100k);
  const allRes = regions.map(r => r.resourcesPer100k);

  const axes = [
    { key: "coverage", label: "Coverage", tooltip: "Lower uninsured = better" },
    { key: "foodSecurity", label: "Food Security", tooltip: "Lower insecurity = better" },
    { key: "primaryCare", label: "Primary Care", tooltip: "Lower ratio = better" },
    { key: "facilities", label: "Facilities", tooltip: "Higher per 100K = better" },
    { key: "resources", label: "Resources", tooltip: "Higher per 100K = better" },
  ];

  const data = axes.map(axis => {
    const point: Record<string, string | number> = { metric: axis.label };
    regions.forEach(r => {
      let score: number;
      switch (axis.key) {
        case "coverage": score = normalize(r.uninsuredRate, Math.min(...allUR) - 1, Math.max(...allUR) + 1, true); break;
        case "foodSecurity": score = normalize(r.foodInsecurity, Math.min(...allFI) - 1, Math.max(...allFI) + 1, true); break;
        case "primaryCare": score = normalize(r.primaryCareRatio, Math.min(...allPCR) - 100, Math.max(...allPCR) + 100, true); break;
        case "facilities": score = normalize(r.facilitiesPer100k, Math.min(...allFac) - 1, Math.max(...allFac) + 1); break;
        case "resources": score = normalize(r.resourcesPer100k, Math.min(...allRes) - 1, Math.max(...allRes) + 1); break;
        default: score = 50;
      }
      point[r.regionName] = Math.round(score);
    });
    return point;
  });

  return (
    <Card>
      <CardContent className="py-4">
        <h3 className="text-sm font-bold text-foreground mb-3">Regional Health Profile Radar</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
              {regions.map(r => (
                <Radar
                  key={r.regionName}
                  name={r.regionName}
                  dataKey={r.regionName}
                  stroke={r.color}
                  fill={r.color}
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              ))}
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          Higher scores indicate better performance. Metrics normalized to 0–100 scale.
        </p>
      </CardContent>
    </Card>
  );
}
