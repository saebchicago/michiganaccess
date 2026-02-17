import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Shield, Award, BarChart3, Star, Building2, ChevronDown, Info, ExternalLink,
  TrendingUp, Heart, Activity, Users
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFacilities, type Facility } from "@/hooks/useFacilities";
import { useQualityMetrics, type QualityMetric } from "@/hooks/useQualityMetrics";
import { Link } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  Cell
} from "recharts";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

const CHART_COLORS = [
  "hsl(209, 86%, 31%)",
  "hsl(180, 100%, 32%)",
  "hsl(145, 32%, 30%)",
  "hsl(27, 87%, 67%)",
  "hsl(0, 100%, 71%)",
];

const gradeColors: Record<string, string> = {
  A: "bg-michigan-forest/10 text-michigan-forest border-michigan-forest/20",
  B: "bg-michigan-teal/10 text-michigan-teal border-michigan-teal/20",
  C: "bg-michigan-gold/10 text-michigan-gold border-michigan-gold/20",
  D: "bg-michigan-coral/10 text-michigan-coral border-michigan-coral/20",
  F: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function QualityRatingsPage() {
  usePageMeta({
    title: "Quality Ratings",
    description: "Compare hospital quality scores, patient safety grades, and accreditation status across Michigan healthcare facilities.",
    path: "/quality",
    jsonLd: {
      "@type": "WebPage",
      "name": "Quality Ratings — Michigan Access",
      "description": "Hospital quality scores, Leapfrog grades, and accreditation for Michigan facilities.",
      "url": "https://michiganaccess.lovable.app/quality",
    },
  });
  const { data: facilities = [], isLoading: facLoading } = useFacilities(["hospital"]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { data: metrics = [], isLoading: metLoading } = useQualityMetrics(
    selectedIds.length > 0 ? selectedIds : undefined
  );

  const hospitals = useMemo(() =>
    [...facilities].sort((a, b) => (b.quality_score || 0) - (a.quality_score || 0)),
    [facilities]
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const selectedFacilities = useMemo(() =>
    hospitals.filter((h) => selectedIds.includes(h.id)),
    [hospitals, selectedIds]
  );

  // Group metrics by type for charts
  const metricsByType = useMemo(() => {
    const groups: Record<string, QualityMetric[]> = {};
    metrics.forEach((m) => {
      if (!groups[m.metric_type]) groups[m.metric_type] = [];
      groups[m.metric_type].push(m);
    });
    return groups;
  }, [metrics]);

  // Bar chart data per metric name (comparing selected hospitals)
  const comparisonChartData = useMemo(() => {
    if (selectedIds.length === 0) return [];
    const metricNames = [...new Set(metrics.map((m) => m.metric_name))];
    return metricNames.map((name) => {
      const row: Record<string, string | number | null> = { metric: name };
      selectedFacilities.forEach((f, idx) => {
        const m = metrics.find((met) => met.metric_name === name && met.facility_id === f.id);
        row[f.name] = m?.value ?? null;
      });
      const first = metrics.find((m) => m.metric_name === name);
      if (first) {
        row["National Avg"] = first.national_average;
        row["State Avg"] = first.state_average;
      }
      return row;
    });
  }, [metrics, selectedIds, selectedFacilities]);

  // Radar data for selected hospitals
  const radarData = useMemo(() => {
    if (selectedFacilities.length === 0) return [];
    const dims = [
      { key: "quality_score", label: "Quality Score" },
      { key: "services", label: "Services" },
      { key: "digital", label: "Digital Access" },
    ];
    return dims.map((d) => {
      const row: Record<string, string | number> = { dimension: d.label };
      selectedFacilities.forEach((f) => {
        let val = 0;
        if (d.key === "quality_score") val = f.quality_score || 0;
        else if (d.key === "services") val = Math.min((f.services?.length || 0) / 8, 1) * 100;
        else {
          const dc = f.digital_capabilities as Record<string, boolean> | null;
          val = dc ? (Object.values(dc).filter(Boolean).length / 3) * 100 : 0;
        }
        row[f.name] = Math.round(val);
      });
      return row;
    });
  }, [selectedFacilities]);

  // Grade distribution
  const gradeDistribution = useMemo(() => {
    const counts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, "N/A": 0 };
    hospitals.forEach((h) => {
      const g = h.leapfrog_grade || "N/A";
      counts[g] = (counts[g] || 0) + 1;
    });
    return Object.entries(counts).map(([grade, count]) => ({ grade, count }));
  }, [hospitals]);

  const isLoading = facLoading || metLoading;

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-b from-michigan-forest/5 to-background py-12 lg:py-20">
        <div className="container max-w-4xl text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <span className="mb-4 inline-block rounded-full bg-michigan-forest/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-michigan-forest">
              Quality & Safety
            </span>
          </motion.div>
          <motion.h1 variants={fadeUp} custom={1} initial="hidden" animate="visible" className="mb-3 text-3xl font-bold text-foreground lg:text-5xl">
            Hospital Quality & Safety Ratings
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} initial="hidden" animate="visible" className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Compare Michigan hospitals using independent safety grades, clinical quality metrics, and patient experience scores from CMS, Leapfrog, and HCAHPS.
          </motion.p>
        </div>
      </section>

      <div className="container max-w-6xl py-10 space-y-10">
        {/* Overview Cards */}
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            { label: "Hospitals Rated", value: hospitals.length, icon: Building2, color: "text-primary" },
            { label: "Leapfrog A Grades", value: hospitals.filter((h) => h.leapfrog_grade === "A").length, icon: Shield, color: "text-michigan-forest" },
            { label: "Magnet Recognized", value: hospitals.filter((h) => h.is_magnet).length, icon: Award, color: "text-michigan-gold" },
            { label: "Blue Distinction", value: hospitals.filter((h) => h.is_blue_distinction).length, icon: Heart, color: "text-michigan-sky" },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
              <Card>
                <CardContent className="flex items-center gap-3 py-4">
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Leapfrog Grade Distribution */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-michigan-forest" />
                Leapfrog Safety Grade Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={gradeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="grade" tick={{ fontSize: 14 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" name="Hospitals" radius={[6, 6, 0, 0]}>
                    {gradeDistribution.map((entry, i) => (
                      <Cell key={entry.grade} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.section>

        <Separator />

        {/* Comparison Tool */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Compare Hospitals (Up to 3)</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Select hospitals below to compare quality metrics side-by-side.</p>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <>
              {/* Hospital list */}
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                {hospitals.map((h) => {
                  const isSelected = selectedIds.includes(h.id);
                  return (
                    <Card
                      key={h.id}
                      className={`cursor-pointer transition-all ${isSelected ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/50"}`}
                      onClick={() => toggleSelect(h.id)}
                    >
                      <CardContent className="py-3 flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{h.name}</p>
                          <p className="text-xs text-muted-foreground">{h.city}, {h.county} Co.</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {h.leapfrog_grade && (
                            <Badge className={`${gradeColors[h.leapfrog_grade] || ""} text-xs`}>{h.leapfrog_grade}</Badge>
                          )}
                          <span className="text-sm font-bold text-foreground">{h.quality_score || "—"}</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Comparison Charts */}
              {selectedIds.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  <Tabs defaultValue="bar">
                    <TabsList>
                      <TabsTrigger value="bar">Bar Comparison</TabsTrigger>
                      <TabsTrigger value="radar">Radar Overview</TabsTrigger>
                      <TabsTrigger value="table">Data Table</TabsTrigger>
                    </TabsList>

                    <TabsContent value="bar" className="mt-4">
                      {comparisonChartData.length > 0 ? (
                        <Card>
                          <CardContent className="py-4">
                            <ResponsiveContainer width="100%" height={400}>
                              <BarChart data={comparisonChartData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis type="number" tick={{ fontSize: 11 }} />
                                <YAxis dataKey="metric" type="category" width={160} tick={{ fontSize: 11 }} />
                                <Tooltip />
                                <Legend />
                                {selectedFacilities.map((f, i) => (
                                  <Bar key={f.id} dataKey={f.name} fill={CHART_COLORS[i]} radius={[0, 4, 4, 0]} />
                                ))}
                                <Bar dataKey="National Avg" fill="hsl(var(--muted-foreground))" radius={[0, 4, 4, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>
                      ) : (
                        <Card>
                          <CardContent className="py-8 text-center text-muted-foreground">
                            No detailed metrics available for selected hospitals yet. Quality scores and accreditations are shown in the table view.
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>

                    <TabsContent value="radar" className="mt-4">
                      <Card>
                        <CardContent className="py-4">
                          <ResponsiveContainer width="100%" height={350}>
                            <RadarChart data={radarData}>
                              <PolarGrid stroke="hsl(var(--border))" />
                              <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12 }} />
                              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                              {selectedFacilities.map((f, i) => (
                                <Radar key={f.id} name={f.name} dataKey={f.name} stroke={CHART_COLORS[i]} fill={CHART_COLORS[i]} fillOpacity={0.15} />
                              ))}
                              <Legend />
                              <Tooltip />
                            </RadarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="table" className="mt-4">
                      <Card>
                        <CardContent className="py-4 overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="py-2 text-left text-xs text-muted-foreground">Metric</th>
                                {selectedFacilities.map((f) => (
                                  <th key={f.id} className="py-2 text-left text-xs font-semibold text-foreground">{f.name}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {[
                                { label: "Quality Score", fn: (f: Facility) => `${f.quality_score || "N/A"}/100` },
                                { label: "Leapfrog Grade", fn: (f: Facility) => f.leapfrog_grade || "N/A" },
                                { label: "Magnet Recognition", fn: (f: Facility) => f.is_magnet ? "Yes ✓" : "No" },
                                { label: "Blue Distinction", fn: (f: Facility) => f.is_blue_distinction ? "Yes ✓" : "No" },
                                { label: "Joint Commission", fn: (f: Facility) => f.joint_commission ? "Yes ✓" : "No" },
                                { label: "Telehealth", fn: (f: Facility) => f.telehealth_available ? "Yes ✓" : "No" },
                                { label: "Services Count", fn: (f: Facility) => String(f.services?.length || 0) },
                                { label: "System", fn: (f: Facility) => f.system_affiliation || "Independent" },
                              ].map((row) => (
                                <tr key={row.label} className="border-b border-border/50">
                                  <td className="py-2 text-xs text-muted-foreground">{row.label}</td>
                                  {selectedFacilities.map((f) => (
                                    <td key={f.id} className="py-2 text-xs text-foreground">{row.fn(f)}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </motion.div>
              )}
            </>
          )}
        </section>

        <Separator />

        {/* Methodology */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Info className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-bold text-foreground">Methodology & Data Sources</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { title: "CMS Hospital Compare", desc: "Clinical quality indicators, readmission rates, mortality data, patient safety indicators.", url: "https://data.cms.gov/provider-data/", icon: Activity },
              { title: "Leapfrog Hospital Safety Grade", desc: "Independent A–F safety grades based on errors, injuries, accidents, and infections.", url: "https://www.hospitalsafetygrade.org/", icon: Shield },
              { title: "HCAHPS Patient Experience", desc: "Standardized patient experience survey — overall rating, recommendation %, communication scores.", url: "https://hcahpsonline.org/", icon: Users },
              { title: "ANCC Magnet Recognition", desc: "Gold standard for nursing excellence — superior nursing processes and patient outcomes.", url: "https://www.nursingworld.org/organizational-programs/magnet/", icon: Award },
            ].map((src, i) => (
              <motion.div key={src.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <Card className="h-full hover-lift">
                  <CardContent className="py-4">
                    <div className="flex items-start gap-3">
                      <src.icon className="mt-0.5 h-5 w-5 text-primary flex-shrink-0" />
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">{src.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{src.desc}</p>
                        <a href={src.url} target="_blank" rel="noopener" className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline">
                          <ExternalLink className="h-3 w-3" /> View source
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link to="/about#methodology" className="text-sm text-primary hover:underline">
              View full ranking methodology →
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
}
