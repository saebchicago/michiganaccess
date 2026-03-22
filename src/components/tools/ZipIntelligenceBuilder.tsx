import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, BarChart3, Radar as RadarIcon, Table, Download, Share2, Plus, X, Sparkles, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { fetchZCTAData, MI_STATE_AVERAGES, US_AVERAGES, MEASURE_GROUPS, POPULAR_MEASURES, type PlacesMeasure } from "@/lib/places-client";
import NeighborhoodHealthScore from "@/components/tools/NeighborhoodHealthScore";
import CommunityReportCard from "@/components/tools/CommunityReportCard";
import NearMeFinder from "@/components/tools/NearMeFinder";
import { toast } from "sonner";

import { TrendingUp as TrendIcon } from "lucide-react";
import { useQuery as useReactQuery } from "@tanstack/react-query";
import { fetchZCTAHistorical } from "@/lib/places-historical";

type ViewMode = "bar" | "radar" | "table" | "trend";

function generateInsights(data: PlacesMeasure[], zip: string): { text: string; type: "warning" | "good" | "info" }[] {
  const insights: { text: string; type: "warning" | "good" | "info" }[] = [];
  let worstGap = { measure: "", gap: 0, value: 0 };
  let bestGap = { measure: "", gap: 0, value: 0, stateAvg: 0 };

  for (const d of data) {
    const stateAvg = MI_STATE_AVERAGES[d.short_question_text];
    if (!stateAvg) continue;
    const gap = d.data_value - stateAvg;
    if (gap > worstGap.gap) worstGap = { measure: d.short_question_text, gap, value: d.data_value };
    if (gap < bestGap.gap) bestGap = { measure: d.short_question_text, gap, value: d.data_value, stateAvg };
  }

  if (worstGap.gap > 2) insights.push({ text: `${zip} has ${worstGap.measure} at ${worstGap.value.toFixed(1)}% — ${worstGap.gap.toFixed(1)} points above the Michigan average.`, type: "warning" });
  if (bestGap.gap < -2) insights.push({ text: `${zip} performs better than Michigan on ${bestGap.measure} (${bestGap.value.toFixed(1)}% vs ${bestGap.stateAvg.toFixed(1)}%).`, type: "good" });

  const uninsured = data.find((d) => d.short_question_text === "Lack of Health Insurance");
  if (uninsured && uninsured.data_value > 10) insights.push({ text: `${uninsured.data_value.toFixed(1)}% lack health insurance in ${zip}. See what you may qualify for.`, type: "info" });

  return insights;
}

export default function ZipIntelligenceBuilder({ initialZip, initialMeasures }: { initialZip?: string; initialMeasures?: string[] }) {
  const [zipInput, setZipInput] = useState(initialZip || "");
  const [activeZip, setActiveZip] = useState(initialZip || "");
  const [zip2Input, setZip2Input] = useState("");
  const [activeZip2, setActiveZip2] = useState("");
  const [showZip2, setShowZip2] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set(initialMeasures || POPULAR_MEASURES));
  const [view, setView] = useState<ViewMode>("bar");

  const { data: zipData, isLoading, isFetched } = useQuery({
    queryKey: ["places-zcta", activeZip],
    queryFn: () => fetchZCTAData(activeZip),
    staleTime: 30 * 60 * 1000,
    enabled: activeZip.length === 5,
  });

  const { data: zip2Data } = useQuery({
    queryKey: ["places-zcta", activeZip2],
    queryFn: () => fetchZCTAData(activeZip2),
    staleTime: 30 * 60 * 1000,
    enabled: activeZip2.length === 5,
  });

  // Trend data (2023 vs 2024)
  const { data: trendData } = useReactQuery({
    queryKey: ["places-trend", activeZip],
    queryFn: () => fetchZCTAHistorical(activeZip),
    staleTime: 60 * 60 * 1000,
    enabled: activeZip.length === 5 && view === "trend",
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (zipInput.length === 5) setActiveZip(zipInput);
  };

  const handleSearch2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (zip2Input.length === 5) setActiveZip2(zip2Input);
  };

  const toggle = (m: string) => {
    const next = new Set(selected);
    if (next.has(m)) next.delete(m);
    else if (next.size < 12) next.add(m);
    setSelected(next);
  };

  const filteredData = useMemo(() => {
    if (!zipData) return [];
    return zipData.filter((d) => selected.has(d.short_question_text));
  }, [zipData, selected]);

  const chartData = useMemo(() => {
    return filteredData.map((d) => {
      const entry: Record<string, string | number> = {
        name: d.short_question_text.length > 20 ? d.short_question_text.substring(0, 18) + "…" : d.short_question_text,
        fullName: d.short_question_text,
        [activeZip]: d.data_value,
        Michigan: MI_STATE_AVERAGES[d.short_question_text] || 0,
        National: US_AVERAGES[d.short_question_text] || 0,
      };
      if (activeZip2 && zip2Data) {
        const z2 = zip2Data.find((z) => z.short_question_text === d.short_question_text);
        entry[activeZip2] = z2?.data_value || 0;
      }
      return entry;
    });
  }, [filteredData, activeZip, activeZip2, zip2Data]);

  const insights = useMemo(() => {
    if (!zipData || !activeZip) return [];
    return generateInsights(zipData, activeZip);
  }, [zipData, activeZip]);

  const handleShare = () => {
    const measures = Array.from(selected).join(",");
    const url = `${window.location.origin}/zip-intelligence?zip=${activeZip}${activeZip2 ? `&zip2=${activeZip2}` : ""}&measures=${measures}`;
    navigator.clipboard.writeText(url).then(() => toast.success("Link copied"));
  };

  const handleCSV = () => {
    if (!filteredData.length) return;
    const headers = `Measure,${activeZip},Michigan,National${activeZip2 ? `,${activeZip2}` : ""}\n`;
    const rows = filteredData.map((d) => {
      const z2 = zip2Data?.find((z) => z.short_question_text === d.short_question_text);
      return `"${d.short_question_text}",${d.data_value},${MI_STATE_AVERAGES[d.short_question_text] || ""},${US_AVERAGES[d.short_question_text] || ""}${activeZip2 ? `,${z2?.data_value || ""}` : ""}`;
    }).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `zip-${activeZip}-health-data.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const pop = zipData?.[0]?.totalpopulation;

  return (
    <div className="space-y-6">
      {/* ZIP Input */}
      <Card>
        <CardContent className="p-5">
          <form onSubmit={handleSearch} className="flex gap-2 items-center">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input
              type="text" inputMode="numeric" maxLength={5}
              value={zipInput} onChange={(e) => setZipInput(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter Michigan ZIP code" className="max-w-[180px] font-mono text-center"
            />
            <Button type="submit" disabled={zipInput.length !== 5 || isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Explore"}
            </Button>
          </form>
          {isFetched && zipData && zipData.length === 0 && activeZip && (
            <p className="text-sm text-michigan-coral mt-2">No data found for ZIP {activeZip}. Try a different Michigan ZIP code.</p>
          )}
        </CardContent>
      </Card>

      {/* Data loaded */}
      <AnimatePresence>
        {zipData && zipData.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Health Score */}
            <NeighborhoodHealthScore zipCode={activeZip} data={zipData} />

            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-lg font-bold text-foreground">ZIP {activeZip}</h3>
                <p className="text-xs text-muted-foreground">{pop ? `Population: ~${pop.toLocaleString()}` : ""} · {zipData.length} measures available</p>
              </div>
              {!showZip2 && (
                <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => setShowZip2(true)}>
                  <Plus className="h-3 w-3" /> Compare ZIP
                </Button>
              )}
            </div>

            {/* Second ZIP */}
            {showZip2 && (
              <Card className="border-michigan-teal/20">
                <CardContent className="p-3 flex gap-2 items-center">
                  <form onSubmit={handleSearch2} className="flex gap-2 items-center flex-1">
                    <Input type="text" inputMode="numeric" maxLength={5} value={zip2Input} onChange={(e) => setZip2Input(e.target.value.replace(/\D/g, ""))} placeholder="Compare ZIP" className="max-w-[140px] font-mono text-center text-xs" />
                    <Button type="submit" size="sm" variant="outline" disabled={zip2Input.length !== 5}>Go</Button>
                  </form>
                  <button onClick={() => { setShowZip2(false); setActiveZip2(""); setZip2Input(""); }} className="text-muted-foreground hover:text-foreground p-1"><X className="h-3.5 w-3.5" /></button>
                </CardContent>
              </Card>
            )}

            {/* Measure selection */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Select measures to chart ({selected.size}/12)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  <Button variant="outline" size="sm" className="text-[10px] h-6 gap-1" onClick={() => setSelected(new Set(POPULAR_MEASURES))}>
                    <Sparkles className="h-2.5 w-2.5" /> Popular picks
                  </Button>
                  <Button variant="ghost" size="sm" className="text-[10px] h-6" onClick={() => setSelected(new Set())}>Clear</Button>
                </div>
                {Object.entries(MEASURE_GROUPS).map(([category, measures]) => (
                  <details key={category} className="group">
                    <summary className="text-xs font-medium text-foreground cursor-pointer hover:text-primary list-none flex items-center gap-1">
                      <svg className="h-3 w-3 text-muted-foreground transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      {category}
                    </summary>
                    <div className="flex flex-wrap gap-1 mt-1 ml-4">
                      {measures.map((m) => {
                        const hasData = zipData.some((d) => d.short_question_text === m);
                        return (
                          <button key={m} disabled={!hasData} onClick={() => toggle(m)}
                            className={`px-2 py-0.5 rounded-full text-[10px] transition-colors ${
                              selected.has(m) ? "bg-primary text-primary-foreground" : hasData ? "bg-muted text-muted-foreground hover:bg-muted/80" : "bg-muted/30 text-muted-foreground/40 cursor-not-allowed"
                            }`}>
                            {m}
                          </button>
                        );
                      })}
                    </div>
                  </details>
                ))}
              </CardContent>
            </Card>

            {/* Chart */}
            {filteredData.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {([["bar", BarChart3], ["radar", RadarIcon], ["table", Table], ["trend", TrendIcon]] as [ViewMode, typeof BarChart3][]).map(([v, Icon]) => (
                        <Button key={v} variant={view === v ? "default" : "ghost"} size="sm" className="h-7 text-xs gap-1" onClick={() => setView(v)}>
                          <Icon className="h-3 w-3" /> {v.charAt(0).toUpperCase() + v.slice(1)}
                        </Button>
                      ))}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={handleCSV}><Download className="h-3 w-3" /> CSV</Button>
                      <CommunityReportCard zipCode={activeZip} data={zipData!} />
                      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={handleShare}><Share2 className="h-3 w-3" /> Share</Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {view === "bar" && (
                    <ResponsiveContainer width="100%" height={Math.max(filteredData.length * 60, 300)}>
                      <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                        <XAxis type="number" unit="%" tick={{ fontSize: 10 }} />
                        <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 9 }} />
                        <Tooltip formatter={(v: number, name: string) => [`${v.toFixed(1)}%`, name]} contentStyle={{ borderRadius: 8, fontSize: 11 }} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Bar dataKey={activeZip} fill="#0A4C95" radius={[0, 3, 3, 0]} />
                        {activeZip2 && zip2Data && <Bar dataKey={activeZip2} fill="#FF6B6B" radius={[0, 3, 3, 0]} />}
                        <Bar dataKey="Michigan" fill="#00A3A1" radius={[0, 3, 3, 0]} />
                        <Bar dataKey="National" fill="#94a3b8" radius={[0, 3, 3, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                  {view === "radar" && (
                    <>
                      {filteredData.length > 8 && <p className="text-[10px] text-michigan-gold mb-2">Radar works best with 5-8 measures. Consider switching to bar chart.</p>}
                      <ResponsiveContainer width="100%" height={350}>
                        <RadarChart data={chartData}>
                          <PolarGrid stroke="hsl(214, 20%, 85%)" />
                          <PolarAngleAxis dataKey="name" tick={{ fontSize: 8 }} />
                          <PolarRadiusAxis tick={{ fontSize: 8 }} />
                          <Tooltip formatter={(v: number) => [`${v.toFixed(1)}%`]} />
                          <Radar name={activeZip} dataKey={activeZip} stroke="#0A4C95" fill="#0A4C95" fillOpacity={0.25} />
                          {activeZip2 && zip2Data && <Radar name={activeZip2} dataKey={activeZip2} stroke="#FF6B6B" fill="#FF6B6B" fillOpacity={0.2} />}
                          <Radar name="Michigan" dataKey="Michigan" stroke="#00A3A1" fill="#00A3A1" fillOpacity={0.15} />
                          <Legend wrapperStyle={{ fontSize: 10 }} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </>
                  )}
                  {view === "table" && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm min-w-[400px]">
                        <thead>
                          <tr className="border-b border-border text-left">
                            <th className="pb-2 text-xs font-medium text-muted-foreground">Measure</th>
                            <th className="pb-2 text-xs font-medium text-right">{activeZip}</th>
                            {activeZip2 && <th className="pb-2 text-xs font-medium text-right">{activeZip2}</th>}
                            <th className="pb-2 text-xs font-medium text-right">MI Avg</th>
                            <th className="pb-2 text-xs font-medium text-right">US Avg</th>
                            <th className="pb-2 text-xs font-medium text-right">vs MI</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredData.map((d) => {
                            const stateAvg = MI_STATE_AVERAGES[d.short_question_text] || 0;
                            const diff = d.data_value - stateAvg;
                            const z2 = zip2Data?.find((z) => z.short_question_text === d.short_question_text);
                            return (
                              <tr key={d.short_question_text} className="border-b border-border/50">
                                <td className="py-2 text-xs text-foreground">{d.short_question_text}</td>
                                <td className="py-2 text-xs text-right font-semibold">{d.data_value.toFixed(1)}%</td>
                                {activeZip2 && <td className="py-2 text-xs text-right">{z2 ? `${z2.data_value.toFixed(1)}%` : "—"}</td>}
                                <td className="py-2 text-xs text-right text-muted-foreground">{stateAvg.toFixed(1)}%</td>
                                <td className="py-2 text-xs text-right text-muted-foreground">{(US_AVERAGES[d.short_question_text] || 0).toFixed(1)}%</td>
                                <td className={`py-2 text-xs text-right font-semibold ${diff > 2 ? "text-michigan-coral" : diff < -2 ? "text-michigan-forest" : "text-muted-foreground"}`}>
                                  {diff > 0 ? "+" : ""}{diff.toFixed(1)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {view === "trend" && (
                    <div className="space-y-2">
                      {!trendData || Object.keys(trendData.year2023).length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">Loading trend data or no historical data available for this ZIP.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm min-w-[400px]">
                            <thead><tr className="border-b border-border text-left">
                              <th className="pb-2 text-xs font-medium text-muted-foreground">Measure</th>
                              <th className="pb-2 text-xs font-medium text-right">2023</th>
                              <th className="pb-2 text-xs font-medium text-right">2024</th>
                              <th className="pb-2 text-xs font-medium text-right">Change</th>
                            </tr></thead>
                            <tbody>
                              {filteredData.map((d) => {
                                const prev = trendData.year2023[d.short_question_text];
                                const curr = d.data_value;
                                const change = prev != null ? curr - prev : null;
                                return (
                                  <tr key={d.short_question_text} className="border-b border-border/50">
                                    <td className="py-2 text-xs text-foreground">{d.short_question_text}</td>
                                    <td className="py-2 text-xs text-right text-muted-foreground">{prev != null ? `${prev.toFixed(1)}%` : "—"}</td>
                                    <td className="py-2 text-xs text-right font-semibold">{curr.toFixed(1)}%</td>
                                    <td className={`py-2 text-xs text-right font-semibold ${change != null && change > 0.5 ? "text-michigan-coral" : change != null && change < -0.5 ? "text-michigan-forest" : "text-muted-foreground"}`}>
                                      {change != null ? `${change > 0 ? "+" : ""}${change.toFixed(1)}` : "—"}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                          <p className="text-[9px] text-muted-foreground mt-2">Comparing CDC PLACES 2024 vs 2023 releases. Source: CDC, RWJF, CDC Foundation.</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Insights */}
            {insights.length > 0 && (
              <div className="space-y-2">
                {insights.map((insight, i) => (
                  <div key={i} className={`rounded-lg border p-3 flex items-start gap-2 ${
                    insight.type === "warning" ? "border-michigan-coral/20 bg-michigan-coral/5" :
                    insight.type === "good" ? "border-michigan-forest/20 bg-michigan-forest/5" :
                    "border-primary/20 bg-primary/5"
                  }`}>
                    {insight.type === "warning" ? <AlertTriangle className="h-4 w-4 text-michigan-coral shrink-0 mt-0.5" /> :
                     insight.type === "good" ? <CheckCircle2 className="h-4 w-4 text-michigan-forest shrink-0 mt-0.5" /> :
                     <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />}
                    <p className="text-xs text-foreground">{insight.text}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Near Me */}
            <NearMeFinder zipCode={activeZip} zipData={(() => { const m: Record<string, number> = {}; zipData!.forEach((d) => { m[d.short_question_text] = d.data_value; }); return m; })()} />

            {/* Source */}
            <p className="text-[9px] text-muted-foreground text-center">
              Source: CDC PLACES 2024 · Robert Wood Johnson Foundation · CDC Foundation · Small area estimates from BRFSS 2022
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
