import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Plus, X, Download, Share2, Users, Heart, Stethoscope, BarChart3 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { usePageMeta } from "@/hooks/usePageMeta";
import DataProvenance from "@/components/shared/DataProvenance";
import { ZIP_QUICKSTATS } from "@/data/zip-quickstats";
import { IRS_ZIP_DATA } from "@/data/irs-zip-income";
import { MICHIGAN_GEOCARE } from "@/data/geocare";
import { ZIP_TO_COUNTY } from "@/data/michiganZips";
import { toast } from "sonner";

// ── Helpers ─────────────────────────────────────────────────────────────────

/** All ZIPs belonging to a county. */
function zipsForCounty(county: string): string[] {
  return Object.entries(ZIP_TO_COUNTY)
    .filter(([, v]) => v.county.toLowerCase() === county.toLowerCase())
    .map(([z]) => z);
}

/** All known county names. */
const ALL_COUNTIES = Array.from(new Set(Object.values(ZIP_TO_COUNTY).map((v) => v.county))).sort();

/** All known ZIPs. */
const ALL_ZIPS = Object.keys(ZIP_TO_COUNTY).sort();

export default function ServiceAreaPage() {
  usePageMeta({
    title: "Service Area Builder",
    description: "Define a custom Michigan service area by selecting counties or ZIP codes. View aggregate statistics.",
    path: "/service-area",
  });

  const [searchParams, setSearchParams] = useSearchParams();

  // Hydrate selections from URL
  const [selectedZips, setSelectedZips] = useState<Set<string>>(() => {
    const z = searchParams.get("zips");
    return z ? new Set(z.split(",").filter(Boolean)) : new Set<string>();
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [searchMode, setSearchMode] = useState<"zip" | "county">("county");

  // Sync to URL
  useEffect(() => {
    const zips = Array.from(selectedZips).sort().join(",");
    if (zips) {
      setSearchParams({ zips }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [selectedZips, setSearchParams]);

  const addZip = useCallback((zip: string) => {
    setSelectedZips((prev) => new Set(prev).add(zip));
    setSearchTerm("");
  }, []);

  const addCounty = useCallback((county: string) => {
    const zips = zipsForCounty(county);
    setSelectedZips((prev) => {
      const next = new Set(prev);
      zips.forEach((z) => next.add(z));
      return next;
    });
    setSearchTerm("");
  }, []);

  const removeZip = useCallback((zip: string) => {
    setSelectedZips((prev) => {
      const next = new Set(prev);
      next.delete(zip);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => setSelectedZips(new Set()), []);

  // Search suggestions
  const suggestions = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return [];
    const term = searchTerm.toLowerCase();
    if (searchMode === "county") {
      return ALL_COUNTIES.filter((c) => c.toLowerCase().includes(term)).slice(0, 8);
    }
    return ALL_ZIPS.filter((z) => z.startsWith(term)).slice(0, 8);
  }, [searchTerm, searchMode]);

  // Aggregate stats
  const stats = useMemo(() => {
    const zips = Array.from(selectedZips);
    if (zips.length === 0) return null;

    let totalPop = 0;
    let totalPopCount = 0;
    let totalUninsuredWeighted = 0; // proxy: use EITC as poverty proxy
    let totalEitcWeighted = 0;
    let eitcCount = 0;
    let totalUnserved = 0;

    zips.forEach((z) => {
      const qs = ZIP_QUICKSTATS[z];
      if (qs) {
        totalPop += qs.population;
        totalPopCount++;
      }
      const irs = IRS_ZIP_DATA[z];
      if (irs) {
        totalEitcWeighted += irs.eitcPct;
        eitcCount++;
      }
      const gc = MICHIGAN_GEOCARE[z];
      if (gc && !gc.is_suppressed) {
        totalUnserved += gc.unserved_low_income;
        totalUninsuredWeighted += gc.hcp_penetration_rate * 100;
      }
    });

    const gcCount = zips.filter((z) => MICHIGAN_GEOCARE[z] && !MICHIGAN_GEOCARE[z].is_suppressed).length;
    const counties = new Set(zips.map((z) => ZIP_TO_COUNTY[z]?.county).filter(Boolean));

    return {
      zipCount: zips.length,
      countyCount: counties.size,
      counties: Array.from(counties).sort(),
      totalPopulation: totalPop,
      avgEitcRate: eitcCount > 0 ? totalEitcWeighted / eitcCount : 0,
      avgFqhcPenetration: gcCount > 0 ? totalUninsuredWeighted / gcCount : 0,
      totalUnservedLowIncome: totalUnserved,
    };
  }, [selectedZips]);

  const handleShare = useCallback(() => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => toast.success("Link copied to clipboard"));
  }, []);

  const handleDownloadCsv = useCallback(() => {
    const zips = Array.from(selectedZips).sort();
    const headers = ["ZIP", "City", "County", "Population", "Median Income", "EITC %", "FQHC Penetration %"];
    const rows = zips.map((z) => {
      const lookup = ZIP_TO_COUNTY[z];
      const qs = ZIP_QUICKSTATS[z];
      const irs = IRS_ZIP_DATA[z];
      const gc = MICHIGAN_GEOCARE[z];
      return [
        z,
        lookup?.city ?? "",
        lookup?.county ?? "",
        qs?.population ?? "",
        qs?.medianIncome ?? "",
        irs?.eitcPct ?? "",
        gc && !gc.is_suppressed ? Math.round(gc.hcp_penetration_rate * 100) : "",
      ].join(",");
    });
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `service-area-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [selectedZips]);

  return (
    <Layout>
      <Breadcrumbs items={[
        { label: "Data & Insights", href: "/data-and-insights" },
        { label: "Service Area Builder" },
      ]} />

      <section className="bg-gradient-to-br from-primary/8 via-background to-accent/5 py-10 md:py-14">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-5 w-5 text-primary" />
              <Badge variant="outline" className="text-xs">Interactive</Badge>
            </div>
            <h1 className="text-3xl font-bold text-foreground md:text-4xl mb-2">Service Area Builder</h1>
            <p className="text-muted-foreground">
              Build a custom service area by adding counties or ZIP codes. View aggregate population, economic, and health access statistics.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container py-8 space-y-6">
        {/* Search / Add */}
        <Card>
          <CardContent className="py-5 space-y-4">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" /> Add to Service Area
            </h2>
            <div className="flex flex-wrap gap-2 items-center">
              <select
                className="text-sm border rounded-md px-3 py-1.5 bg-background"
                value={searchMode}
                onChange={(e) => { setSearchMode(e.target.value as "zip" | "county"); setSearchTerm(""); }}
              >
                <option value="county">County</option>
                <option value="zip">ZIP Code</option>
              </select>
              <div className="relative flex-1 min-w-[200px]">
                <input
                  type="text"
                  className="text-sm border rounded-md px-3 py-1.5 w-full bg-background"
                  placeholder={searchMode === "county" ? "Type county name..." : "Type ZIP code..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {suggestions.length > 0 && (
                  <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-auto">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors"
                        onClick={() => searchMode === "county" ? addCounty(s) : addZip(s)}
                      >
                        {searchMode === "county" ? `${s} County` : s}
                        {searchMode === "county" && (
                          <span className="text-[10px] text-muted-foreground ml-2">
                            ({zipsForCounty(s).length} ZIPs)
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Selected ZIPs chips */}
            {selectedZips.size > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {Array.from(selectedZips).sort().map((z) => (
                  <Badge key={z} variant="secondary" className="text-xs gap-1 pr-1">
                    {z}
                    <button onClick={() => removeZip(z)} className="hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                <button onClick={clearAll} className="text-[10px] text-muted-foreground hover:text-destructive underline ml-2">
                  Clear all
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Aggregate Stats */}
        {stats && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-primary/20">
              <CardContent className="py-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-foreground">Service Area Summary</h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleShare} className="gap-1">
                      <Share2 className="h-3 w-3" /> Share
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownloadCsv} className="gap-1">
                      <Download className="h-3 w-3" /> Download CSV
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-bold">{stats.zipCount}</p>
                      <p className="text-[10px] text-muted-foreground">{stats.countyCount} {stats.countyCount === 1 ? "county" : "counties"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-michigan-navy/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-michigan-navy" />
                    </div>
                    <div>
                      <p className="text-lg font-bold">{stats.totalPopulation.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground">Total Population</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-michigan-gold/10 flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-michigan-gold-deep" />
                    </div>
                    <div>
                      <p className="text-lg font-bold">{stats.avgEitcRate.toFixed(1)}%</p>
                      <p className="text-[10px] text-muted-foreground">Avg EITC Rate</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-michigan-teal/10 flex items-center justify-center">
                      <Stethoscope className="h-5 w-5 text-michigan-teal-deep" />
                    </div>
                    <div>
                      <p className="text-lg font-bold">{stats.totalUnservedLowIncome.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground">FQHC Unserved Low-Income</p>
                    </div>
                  </div>
                </div>

                {stats.counties.length > 0 && (
                  <p className="text-[10px] text-muted-foreground mt-3">
                    Counties: {stats.counties.join(", ")}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ZIP detail table */}
        {selectedZips.size > 0 && (
          <Card>
            <CardContent className="py-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 px-2 text-left font-semibold text-xs">ZIP</th>
                      <th className="py-2 px-2 text-left font-semibold text-xs">City</th>
                      <th className="py-2 px-2 text-left font-semibold text-xs">County</th>
                      <th className="py-2 px-2 text-right font-semibold text-xs">Population</th>
                      <th className="py-2 px-2 text-right font-semibold text-xs">Med. Income</th>
                      <th className="py-2 px-2 text-right font-semibold text-xs">EITC %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from(selectedZips).sort().map((z) => {
                      const lookup = ZIP_TO_COUNTY[z];
                      const qs = ZIP_QUICKSTATS[z];
                      const irs = IRS_ZIP_DATA[z];
                      return (
                        <tr key={z} className="border-b border-border/30 hover:bg-muted/30">
                          <td className="py-1.5 px-2">
                            <Link to={`/zip/${z}`} className="text-primary hover:underline font-mono">{z}</Link>
                          </td>
                          <td className="py-1.5 px-2 text-xs">{lookup?.city ?? ""}</td>
                          <td className="py-1.5 px-2 text-xs">{lookup?.county ?? ""}</td>
                          <td className="py-1.5 px-2 text-right font-mono text-xs">{qs?.population?.toLocaleString() ?? "-"}</td>
                          <td className="py-1.5 px-2 text-right font-mono text-xs">{qs?.medianIncome ? `$${qs.medianIncome.toLocaleString()}` : "-"}</td>
                          <td className="py-1.5 px-2 text-right font-mono text-xs">{irs?.eitcPct ? `${irs.eitcPct}%` : "-"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        <Separator />

        <DataProvenance
          source="Census ACS 2022, IRS SOI 2021, HRSA GeoCare 2023"
          updated="2025"
          methodologyHref="/methodology"
        />
      </div>
    </Layout>
  );
}
