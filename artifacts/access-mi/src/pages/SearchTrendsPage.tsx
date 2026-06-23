import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Search, TrendingUp, AlertCircle, BarChart3, PieChart as PieChartIcon, Download } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";


interface AnalyticsData {
  totalSearches: number;
  totalCorrections: number;
  totalZeroResults: number;
  correctionRate: number;
  zeroResultRate: number;
  topTerms: { term: string; count: number; zeroResults: number }[];
  dailyVolume: { date: string; count: number }[];
  sourceBreakdown: { source: string; count: number }[];
  period: string;
}

const CHART_COLORS = ["hsl(var(--primary))", "hsl(var(--michigan-teal))", "hsl(var(--michigan-gold))", "hsl(var(--michigan-sky))", "hsl(var(--accent))"];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.3 } }),
};

export default function SearchTrendsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState("30");
  const [sourceFilter, setSourceFilter] = useState("all");

  usePageMeta({
    title: "Search Trends",
    description: "Anonymized search analytics to understand what Michigan residents are looking for most.",
    path: "/admin/search-trends",
  });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const url = `${import.meta.env.VITE_SUPABASE_URL ?? "https://znahhtdbcgepezrxwnah.supabase.co"}/functions/v1/search-analytics?days=${days}&source=${sourceFilter}`;
        const res = await fetch(url, {
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        });
        if (res.ok) {
          setData(await res.json());
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [days, sourceFilter]);

  const downloadCSV = () => {
    if (!data) return;
    const rows = [
      ["Search Term", "Count", "Zero Results"],
      ...data.topTerms.map((t) => [t.term, t.count.toString(), t.zeroResults.toString()]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `search-trends-${days}d.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <Breadcrumbs items={[{ label: "Data", href: "/data" }, { label: "Search Trends" }]} />

      <section className="relative overflow-hidden bg-gradient-to-br from-primary/8 via-primary/3 to-background py-10 md:py-14">
        <div className="container">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <div className="flex items-center gap-2 mb-3">
              <Search className="h-5 w-5 text-primary" />
              <Badge variant="outline" className="text-xs">Analytics</Badge>
            </div>
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">Search Trends</h1>
            <p className="mt-2 text-muted-foreground max-w-xl">
              What Michigan residents are searching for, aggregated and anonymized. Helps us decide what to build next. No personal information is collected.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container py-8 space-y-8">
        {/* Controls */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <Select value={days} onValueChange={setDays}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="hero">Hero Search Only</SelectItem>
                <SelectItem value="command-palette">Command Palette Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="sm" onClick={downloadCSV} disabled={!data}>
            <Download className="mr-1.5 h-4 w-4" />Export CSV
          </Button>
        </div>

        {/* KPI Cards */}
        {loading ? (
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}><CardContent className="py-4"><Skeleton className="h-10 w-20" /><Skeleton className="h-3 w-24 mt-2" /></CardContent></Card>
            ))}
          </div>
        ) : data ? (
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid gap-4 grid-cols-2 md:grid-cols-4">
            {[
              { label: "Total Searches", value: data.totalSearches, icon: Search, color: "text-primary" },
              { label: "Correction Rate", value: `${data.correctionRate}%`, icon: AlertCircle, color: "text-michigan-gold-deep" },
              { label: "Zero-Result Rate", value: `${data.zeroResultRate}%`, icon: TrendingUp, color: "text-destructive" },
              { label: "Unique Terms", value: data.topTerms.length, icon: BarChart3, color: "text-michigan-teal-deep" },
            ].map((stat, i) => (
              <motion.div key={stat.label} variants={fadeUp} custom={i}>
                <Card>
                  <CardContent className="flex items-center gap-3 py-4">
                    <stat.icon className={`h-8 w-8 ${stat.color} flex-shrink-0`} />
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <Card><CardContent className="py-8 text-center text-muted-foreground">No search data available yet. Searches will appear here as residents use the site.</CardContent></Card>
        )}

        {data && data.totalSearches > 0 && (
          <Tabs defaultValue="top-terms">
            <TabsList>
              <TabsTrigger value="top-terms"><BarChart3 className="h-4 w-4 mr-1.5" />Top Terms</TabsTrigger>
              <TabsTrigger value="volume"><TrendingUp className="h-4 w-4 mr-1.5" />Volume</TabsTrigger>
              <TabsTrigger value="sources"><PieChartIcon className="h-4 w-4 mr-1.5" />Sources</TabsTrigger>
              <TabsTrigger value="gaps"><AlertCircle className="h-4 w-4 mr-1.5" />Content Gaps</TabsTrigger>
            </TabsList>

            <TabsContent value="top-terms" className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-lg">Most Searched Terms</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.topTerms.slice(0, 15)} layout="vertical" margin={{ left: 100 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis type="number" className="text-xs fill-muted-foreground" />
                        <YAxis type="category" dataKey="term" className="text-xs fill-muted-foreground" width={90} />
                        <Tooltip
                          contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                          labelStyle={{ color: "hsl(var(--foreground))" }}
                        />
                        <Bar dataKey="count" name="Searches" radius={[0, 4, 4, 0]}>
                          {data.topTerms.slice(0, 15).map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Table */}
              <Card>
                <CardContent className="py-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[500px]">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 font-medium text-muted-foreground">#</th>
                          <th className="text-left py-2 font-medium text-muted-foreground">Search Term</th>
                          <th className="text-right py-2 font-medium text-muted-foreground">Count</th>
                          <th className="text-right py-2 font-medium text-muted-foreground">Zero Results</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.topTerms.map((t, i) => (
                          <tr key={t.term} className="border-b border-border/50 hover:bg-muted/50">
                            <td className="py-2 text-muted-foreground">{i + 1}</td>
                            <td className="py-2 font-medium text-foreground">{t.term}</td>
                            <td className="py-2 text-right text-foreground">{t.count}</td>
                            <td className="py-2 text-right">
                              {t.zeroResults > 0 ? (
                                <Badge variant="destructive" className="text-[10px]">{t.zeroResults}</Badge>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="volume">
              <Card>
                <CardHeader><CardTitle className="text-lg">Daily Search Volume</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.dailyVolume}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="date" className="text-xs fill-muted-foreground" tickFormatter={(d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })} />
                        <YAxis className="text-xs fill-muted-foreground" />
                        <Tooltip
                          contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                          labelFormatter={(d) => new Date(d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                        />
                        <Line type="monotone" dataKey="count" name="Searches" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sources">
              <Card>
                <CardHeader><CardTitle className="text-lg">Search Source Breakdown</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Where searches originate - hero search bar vs. command palette (⌘K).
                  </p>
                  {data.sourceBreakdown && data.sourceBreakdown.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 items-center">
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={data.sourceBreakdown.map((s) => ({
                                name: s.source === "hero" ? "Hero Search" : s.source === "command" ? "Command Palette" : s.source,
                                value: s.count,
                              }))}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={90}
                              paddingAngle={4}
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {data.sourceBreakdown.map((_, i) => (
                                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-3">
                        {data.sourceBreakdown.map((s, i) => (
                          <div key={s.source} className="flex items-center gap-3">
                            <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                            <span className="text-sm font-medium text-foreground capitalize">
                              {s.source === "hero" ? "Hero Search Bar" : s.source === "command" ? "Command Palette (⌘K)" : s.source}
                            </span>
                            <span className="text-sm text-muted-foreground ml-auto">{s.count} searches</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No source data available yet.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="gaps">
              <Card>
                <CardHeader><CardTitle className="text-lg">Content Gaps - Searches with Zero Results</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    These terms returned no results, indicating potential content or resource gaps to address.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {data.topTerms.filter((t) => t.zeroResults > 0).length > 0 ? (
                      data.topTerms
                        .filter((t) => t.zeroResults > 0)
                        .sort((a, b) => b.zeroResults - a.zeroResults)
                        .map((t) => (
                          <Badge key={t.term} variant="outline" className="text-sm py-1 px-3 border-destructive/30">
                            {t.term} <span className="ml-1 text-destructive">({t.zeroResults})</span>
                          </Badge>
                        ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No zero-result searches found in this period. 🎉</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Privacy notice */}
        <Card className="border-muted bg-muted/30">
          <CardContent className="py-3 text-center">
            <p className="text-xs text-muted-foreground">
              🔒 All search data is anonymized. Email addresses, phone numbers, and SSNs are automatically redacted before storage. 
              No personal information is collected or stored. <a href="/accessibility" className="text-primary underline">Learn more</a>
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
