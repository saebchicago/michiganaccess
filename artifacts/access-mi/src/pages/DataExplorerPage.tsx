/**
 * DataExplorerPage — PolicyMap-style interactive Census data explorer.
 * Browse ACS tables by topic, select geography, visualize + compare.
 */
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search, BarChart3, Download, Users, DollarSign, Home,
  GraduationCap, Heart, Car, Globe, ChevronRight, MapPin, FileText,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { usePageMeta } from "@/hooks/usePageMeta";
import { CENSUS_TABLES, CENSUS_DOMAINS, type CensusDomain, type CensusTableDef } from "@/data/census-tables";
import { MI_COUNTY_FIPS, getCountyFromFips } from "@/data/census-geographies";
import { useCensusACS, getCensusValue, formatDollars, formatCount } from "@/hooks/useCensusACS";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const DOMAIN_ICONS: Record<CensusDomain, typeof Users> = {
  demographics: Users,
  economics: DollarSign,
  housing: Home,
  education: GraduationCap,
  health: Heart,
  transportation: Car,
  language: Globe,
};

export default function DataExplorerPage() {
  usePageMeta({
    title: "Data Explorer — Census & Community Indicators | Access Michigan",
    description: "Explore 50+ Census ACS tables for any Michigan county. Compare demographics, economics, housing, and education data.",
    path: "/data-explorer",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<CensusDomain | "all">("all");
  const [selectedTable, setSelectedTable] = useState<CensusTableDef | null>(null);
  const [selectedCounty, setSelectedCounty] = useState("Wayne");

  const filteredTables = useMemo(() => {
    let tables = CENSUS_TABLES;
    if (selectedDomain !== "all") {
      tables = tables.filter((t) => t.domain === selectedDomain);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      tables = tables.filter(
        (t) => t.label.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.id.toLowerCase().includes(q)
      );
    }
    return tables;
  }, [selectedDomain, searchQuery]);

  const countyFips = MI_COUNTY_FIPS[selectedCounty] || "163";

  const { data, isLoading } = useCensusACS({
    tables: selectedTable ? [selectedTable.id] : [],
    geoType: "county",
    geoFips: countyFips,
    enabled: !!selectedTable,
  });

  const chartData = useMemo(() => {
    if (!selectedTable || !data) return [];
    return selectedTable.keyVariables
      .map((v) => {
        const val = getCensusValue(data, selectedTable.id, v.code);
        return { name: v.label, value: val || 0, code: v.code };
      })
      .filter((d) => d.value > 0);
  }, [data, selectedTable]);

  const countyNames = Object.keys(MI_COUNTY_FIPS).sort();

  return (
    <Layout>
      <Breadcrumbs items={[{ label: "Data & Insights", href: "/data-and-insights" }, { label: "Data Explorer" }]} />

      <section className="bg-gradient-to-br from-primary/8 via-background to-accent/5 py-10 md:py-14">
        <div className="container max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="h-6 w-6 text-primary" />
              <Badge variant="outline" className="text-xs">Live Census API</Badge>
            </div>
            <h1 className="text-3xl font-bold text-foreground md:text-4xl mb-3">Data Explorer</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Browse 50+ American Community Survey tables for any Michigan county. Select a topic and geography to explore live Census Bureau data.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container max-w-5xl py-8 space-y-8">
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tables (e.g., income, race, rent)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedCounty} onValueChange={setSelectedCounty}>
            <SelectTrigger className="w-full md:w-56">
              <MapPin className="h-4 w-4 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {countyNames.map((c) => (
                <SelectItem key={c} value={c}>{c} County</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Domain Filter */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedDomain === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedDomain("all")}
          >
            All Topics
          </Button>
          {CENSUS_DOMAINS.map((d) => {
            const Icon = DOMAIN_ICONS[d.id];
            return (
              <Button
                key={d.id}
                variant={selectedDomain === d.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDomain(d.id)}
                className="gap-1.5"
              >
                <Icon className="h-3.5 w-3.5" /> {d.label}
              </Button>
            );
          })}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Table Browser */}
          <div className="md:col-span-1 space-y-2 max-h-[60vh] overflow-y-auto pr-2">
            <h2 className="text-sm font-bold text-foreground mb-3">{filteredTables.length} Tables Available</h2>
            {filteredTables.map((table) => {
              const Icon = DOMAIN_ICONS[table.domain];
              const isActive = selectedTable?.id === table.id;
              return (
                <button
                  key={table.id}
                  onClick={() => setSelectedTable(table)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    isActive
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/30 hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="text-sm font-semibold text-foreground">{table.label}</span>
                    <ChevronRight className={`h-3.5 w-3.5 ml-auto text-muted-foreground transition-transform ${isActive ? "rotate-90" : ""}`} />
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{table.description}</p>
                  <div className="flex gap-1.5 mt-1.5">
                    <Badge variant="secondary" className="text-[9px] h-4">{table.id}</Badge>
                    <Badge variant="outline" className="text-[9px] h-4 capitalize">{table.domain}</Badge>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Visualization Panel */}
          <div className="md:col-span-2">
            {!selectedTable ? (
              <Card className="h-full flex items-center justify-center min-h-[300px]">
                <CardContent className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Select a Table</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Choose a Census table from the left panel to visualize data for {selectedCounty} County.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-base">{selectedTable.label}: {selectedCounty} County</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-[10px]">{selectedTable.id}</Badge>
                      <Badge variant="secondary" className="text-[10px]">ACS 5-Year 2023</Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{selectedTable.description}</p>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-64 w-full" />
                  ) : chartData.length > 0 ? (
                    <div className="space-y-4">
                      <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 40)}>
                        <BarChart data={chartData} layout="vertical" margin={{ left: 120, right: 20 }}>
                          <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => v.toLocaleString()} />
                          <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} />
                          <Tooltip formatter={(v: number) => [v.toLocaleString(), "Value"]} />
                          <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>

                      {/* Data Table */}
                      <Separator />
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[500px]">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 text-xs font-semibold text-muted-foreground">Variable</th>
                              <th className="text-right py-2 text-xs font-semibold text-muted-foreground">Value</th>
                              <th className="text-right py-2 text-xs font-semibold text-muted-foreground">Code</th>
                            </tr>
                          </thead>
                          <tbody>
                            {chartData.map((row) => (
                              <tr key={row.code} className="border-b border-border/50">
                                <td className="py-2 text-foreground">{row.name}</td>
                                <td className="py-2 text-right font-mono text-foreground">{row.value.toLocaleString()}</td>
                                <td className="py-2 text-right text-[10px] text-muted-foreground font-mono">{row.code}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>No data available for this table and geography.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground text-center">
          Data from the U.S. Census Bureau American Community Survey via the Census Bureau API. All data is public domain.
        </p>
      </div>
    </Layout>
  );
}
