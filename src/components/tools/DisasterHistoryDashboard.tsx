import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, AlertTriangle, CloudRain, Flame, Snowflake, Wind, Loader2 } from "lucide-react";
import {
  fetchMichiganDisasters,
  getCountyDisasterCount,
  getDisastersByDecade,
  getUniqueDisasters,
  type FEMADisaster,
} from "@/lib/fema-client";
import { SBA_DISASTER_LOAN_DATA, MIDLAND_DAM_STATS } from "@/data/sba-disaster-loans";

const INCIDENT_COLORS: Record<string, string> = {
  Flood: "#3B82F6",
  "Severe Storm(s)": "#F59E0B",
  Snow: "#94A3B8",
  Fire: "#EF4444",
  Tornado: "#8B5CF6",
  Hurricane: "#06B6D4",
  "Severe Ice Storm": "#64748B",
  Drought: "#D97706",
  Other: "#6B7280",
};

function getColor(type: string) {
  return INCIDENT_COLORS[type] || INCIDENT_COLORS.Other;
}

function IncidentIcon({ type }: { type: string }) {
  if (type.toLowerCase().includes("flood")) return <CloudRain className="h-4 w-4 text-blue-500" />;
  if (type.toLowerCase().includes("fire")) return <Flame className="h-4 w-4 text-red-500" />;
  if (type.toLowerCase().includes("snow") || type.toLowerCase().includes("ice")) return <Snowflake className="h-4 w-4 text-slate-400" />;
  if (type.toLowerCase().includes("tornado") || type.toLowerCase().includes("storm")) return <Wind className="h-4 w-4 text-amber-500" />;
  return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
}

export default function DisasterHistoryDashboard() {
  const [filterType, setFilterType] = useState<string>("all");
  const [filterCounty, setFilterCounty] = useState<string>("all");

  const { data: disasters = [], isLoading, isError } = useQuery({
    queryKey: ["fema-michigan-disasters"],
    queryFn: fetchMichiganDisasters,
    staleTime: 30 * 60 * 1000,
  });

  const filtered = useMemo(() => {
    let list = disasters;
    if (filterType !== "all") list = list.filter(d => d.incidentType === filterType);
    if (filterCounty !== "all") list = list.filter(d => d.designatedArea?.replace(/ \(County\)/i, "").trim() === filterCounty);
    return list;
  }, [disasters, filterType, filterCounty]);

  const incidentTypes = useMemo(() => [...new Set(disasters.map(d => d.incidentType))].sort(), [disasters]);
  const countyNames = useMemo(() => {
    const names = [...new Set(disasters.map(d => d.designatedArea?.replace(/ \(County\)/i, "").trim()).filter(Boolean))].sort();
    return names;
  }, [disasters]);

  const countyCounts = useMemo(() => getCountyDisasterCount(filtered), [filtered]);
  const decadeCounts = useMemo(() => getDisastersByDecade(filtered), [filtered]);
  const uniqueDisasters = useMemo(() => getUniqueDisasters(filtered), [filtered]);

  // Decade chart data with incident type breakdown
  const decadeChartData = useMemo(() => {
    const decades: Record<string, Record<string, number>> = {};
    for (const d of filtered) {
      const year = new Date(d.declarationDate).getFullYear();
      const decade = `${Math.floor(year / 10) * 10}s`;
      if (!decades[decade]) decades[decade] = {};
      const type = d.incidentType || "Other";
      decades[decade][type] = (decades[decade][type] || 0) + 1;
    }
    return Object.entries(decades)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([decade, types]) => ({ decade, ...types, total: Object.values(types).reduce((s, v) => s + v, 0) }));
  }, [filtered]);

  // Top incident types for stacked bars
  const topTypes = useMemo(() => {
    const typeCounts: Record<string, number> = {};
    for (const d of filtered) {
      const t = d.incidentType || "Other";
      typeCounts[t] = (typeCounts[t] || 0) + 1;
    }
    return Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).map(([t]) => t);
  }, [filtered]);

  // Most common type & most affected county
  const mostCommonType = topTypes[0] || "N/A";
  const topCounties = useMemo(
    () => Object.entries(countyCounts).sort((a, b) => b[1] - a[1]),
    [countyCounts],
  );
  const mostAffectedCounty = topCounties[0]?.[0] || "N/A";
  const maxCountyCount = topCounties[0]?.[1] || 1;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading FEMA disaster data for Michigan...</p>
      </div>
    );
  }

  if (isError || disasters.length === 0) {
    return (
      <div className="text-center py-16">
        <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
        <h2 className="text-lg font-semibold mb-1">Unable to load FEMA data</h2>
        <p className="text-sm text-muted-foreground">
          The FEMA OpenFEMA API may be temporarily unavailable. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm"
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
        >
          <option value="all">All Incident Types</option>
          {incidentTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm"
          value={filterCounty}
          onChange={e => setFilterCounty(e.target.value)}
        >
          <option value="all">All Counties</option>
          {countyNames.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label: "Total Declarations", value: filtered.length.toLocaleString(), sub: "Individual county declarations" },
          { label: "Most Common Type", value: mostCommonType, sub: `${topTypes.length} incident types` },
          { label: "Most Affected County", value: mostAffectedCounty, sub: `${topCounties[0]?.[1] || 0} declarations` },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="pt-4 pb-3 text-center">
              <p className="text-2xl font-bold text-primary">{stat.value}</p>
              <p className="text-xs font-semibold text-foreground">{stat.label}</p>
              <p className="text-[10px] text-muted-foreground">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Decade bar chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Declarations by Decade</CardTitle>
          <p className="text-xs text-muted-foreground">Stacked by incident type. FEMA data from 1953 to present.</p>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={decadeChartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="decade" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                {topTypes.slice(0, 6).map(type => (
                  <Bar key={type} dataKey={type} stackId="stack" fill={getColor(type)} name={type} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top 20 counties */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Top 20 Counties by Declaration Count</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {topCounties.slice(0, 20).map(([county, count]) => (
            <div key={county} className="flex items-center gap-2">
              <span className="w-28 text-xs font-medium truncate text-right">{county}</span>
              <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary/80 rounded-full transition-all duration-500"
                  style={{ width: `${(count / maxCountyCount) * 100}%` }}
                />
              </div>
              <span className="w-8 text-xs font-bold text-right">{count}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent disasters */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Recent Disaster Declarations</CardTitle>
          <p className="text-xs text-muted-foreground">Last 10 unique disasters affecting Michigan.</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {uniqueDisasters.slice(0, 10).map(d => (
              <div key={d.disasterNumber} className="rounded-lg border border-border p-3 space-y-1">
                <div className="flex items-center gap-2">
                  <IncidentIcon type={d.incidentType} />
                  <span className="text-sm font-semibold">{d.declarationTitle}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(d.declarationDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  {" · "}
                  <Badge variant="outline" className="text-[10px] ml-1">{d.incidentType}</Badge>
                </p>
                <p className="text-xs text-muted-foreground">{d.designatedArea}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SBA Disaster Relief Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Where Disaster Relief $ Actually Went</CardTitle>
          <p className="text-xs text-muted-foreground">
            SBA disaster loan approvals vs. verified loss by county. The gap represents unmet need.
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={SBA_DISASTER_LOAN_DATA.map(d => ({
                  county: d.county,
                  approved: d.totalApprovedAmount / 1e6,
                  verifiedLoss: d.totalVerifiedLoss / 1e6,
                }))}
                layout="vertical"
                margin={{ left: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `$${v}M`} />
                <YAxis type="category" dataKey="county" tick={{ fontSize: 11 }} width={75} />
                <Tooltip formatter={(v: number) => [`$${v.toFixed(0)}M`]} />
                <Bar dataKey="verifiedLoss" fill="#94A3B8" name="Verified Loss" radius={[0, 4, 4, 0]} />
                <Bar dataKey="approved" fill="#3B82F6" name="Approved Amount" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-slate-400" /> Verified Loss</span>
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-blue-500" /> Approved Amount</span>
            <span className="flex items-center gap-1">Gap = Unmet Need</span>
          </div>
        </CardContent>
      </Card>

      {/* Midland Dam Failure highlight */}
      <Card className="border-amber-400/50 bg-amber-50/30 dark:bg-amber-950/10">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-base">Spotlight: {MIDLAND_DAM_STATS.event}</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">{MIDLAND_DAM_STATS.date} &middot; FEMA {MIDLAND_DAM_STATS.femaDeclaration}</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Evacuees</p>
              <p className="font-bold">{MIDLAND_DAM_STATS.evacuees.toLocaleString()}+</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Verified Loss</p>
              <p className="font-bold">${(MIDLAND_DAM_STATS.totalVerifiedLoss / 1e6).toFixed(0)}M</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Total Approved</p>
              <p className="font-bold">${(MIDLAND_DAM_STATS.totalApproved / 1e6).toFixed(0)}M</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Unmet Need</p>
              <p className="font-bold text-amber-600 dark:text-amber-400">${(MIDLAND_DAM_STATS.unmetNeed / 1e6).toFixed(0)}M</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Source */}
      <div className="rounded-lg border border-border bg-muted/50 p-4 flex items-start gap-2">
        <Info className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">
          <strong>Source:</strong> FEMA OpenFEMA API &middot; Disaster Declarations Summaries v2 &middot; Data from 1953-present.
          Free public API, no key required. Data updates daily.
          SBA disaster loan data modeled from SBA FOIA reports (data.sba.gov). Illustrative estimates.
        </p>
      </div>
    </div>
  );
}
