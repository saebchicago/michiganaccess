import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Droplets,
  AlertTriangle,
  Shield,
  ArrowLeft,
  Info,
  MapPin,
  ExternalLink,
  Search,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useDrinkingWaterViolations } from "@/hooks/useWaterQuality";
import {
  MICHIGAN_PFAS_BY_COUNTY,
  MICHIGAN_KEY_PFAS_SITES,
  PFAS_STANDARDS,
  GREAT_LAKES_STATS,
} from "@/data/environmentalData";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

const PFAS_COUNTIES = Object.entries(MICHIGAN_PFAS_BY_COUNTY)
  .sort((a, b) => b[1] - a[1])
  .map(([county, count]) => ({
    county,
    count,
    fill: count >= 10 ? "#0A4C95" : count >= 5 ? "#00A3A1" : "#2D5F3F",
  }));

const STATUS_STYLES: Record<string, string> = {
  "Active Investigation":
    "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400",
  "Cleanup Ongoing":
    "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
  Monitoring:
    "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
  Closed:
    "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400",
};

function WaterChecker() {
  const [county, setCounty] = useState<string>("");
  const [searchCounty, setSearchCounty] = useState<string | null>(null);
  const { data: violations, isLoading } =
    useDrinkingWaterViolations(searchCounty);
  const pfasCount = searchCounty
    ? (MICHIGAN_PFAS_BY_COUNTY[searchCounty] ?? 0)
    : 0;
  const healthBased = violations?.filter((v) => v.isHealthBased) ?? [];

  const status = !searchCounty
    ? "idle"
    : isLoading
      ? "loading"
      : healthBased.length > 0
        ? "red"
        : (violations?.length ?? 0) > 0 || pfasCount > 0
          ? "amber"
          : "green";

  return (
    <Card className="border-primary/20">
      <CardContent className="py-6">
        <h3 className="text-sm font-bold text-foreground mb-1 flex items-center gap-2">
          <Search className="h-4 w-4 text-primary" /> Is My Water Safe?
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          Select your county to check EPA drinking water violations and nearby
          PFAS contamination sites.
        </p>
        <div className="flex gap-2">
          <Select value={county} onValueChange={setCounty}>
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Select county" />
            </SelectTrigger>
            <SelectContent>
              {[
                "Wayne",
                "Oakland",
                "Macomb",
                "Kent",
                "Genesee",
                "Washtenaw",
                "Ingham",
                "Kalamazoo",
                "Saginaw",
                "Ottawa",
              ].map((c) => (
                <SelectItem key={c} value={c}>
                  {c} County
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setSearchCounty(county)} disabled={!county}>
            Check
          </Button>
        </div>

        {status === "loading" && (
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Checking EPA records...
          </div>
        )}

        {status === "green" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900/40 p-4"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-green-700 dark:text-green-400">
                  {searchCounty} County - No Active Issues Found
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  No active EPA drinking water violations. No PFAS sites in this
                  county's dataset.
                </p>
                <p className="text-[9px] text-green-500/70 mt-1">
                  Source: EPA SDWIS + EGLE MPART. This is not a guarantee -
                  check with your local water utility.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {status === "amber" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900/40 p-4"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-700 dark:text-amber-400">
                  {searchCounty} County - Awareness Items
                </p>
                {pfasCount > 0 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    {pfasCount} PFAS investigation site(s) in county (EGLE
                    MPART)
                  </p>
                )}
                {(violations?.length ?? 0) > 0 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    {violations?.length} drinking water system(s) with violation
                    history
                  </p>
                )}
                <p className="text-[9px] text-amber-500/70 mt-1">
                  Source: EPA SDWIS + EGLE MPART. Contact your water utility for
                  current status.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {status === "red" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/40 p-4"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-700 dark:text-red-400">
                  {searchCounty} County - Health-Based Violations Found
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {healthBased.length} health-based drinking water violation(s)
                  on record
                </p>
                <p className="text-[9px] text-red-500/70 mt-1">
                  Source: EPA SDWIS. Contact your water utility immediately for
                  current status and safe water guidance.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

export default function WaterSafetyPage() {
  usePageMeta({
    title: "Water Safety & PFAS Intelligence - Access Michigan",
    description:
      "Michigan PFAS contamination map, EPA drinking water violations, USGS stream data, and Great Lakes freshwater intelligence.",
    path: "/environment/water",
  });

  const [selectedCounty, setSelectedCounty] = useState<string>("all");

  const filteredSites = useMemo(() => {
    if (selectedCounty === "all") return MICHIGAN_KEY_PFAS_SITES;
    return MICHIGAN_KEY_PFAS_SITES.filter((s) => s.county === selectedCounty);
  }, [selectedCounty]);

  return (
    <Layout>
      <Breadcrumbs
        items={[
          { label: "Environment", href: "/environment" },
          { label: "Water Safety & PFAS" },
        ]}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0A4C95]/15 via-[#00A3A1]/10 to-background py-16 md:py-20">
        <div className="container">
          <motion.div
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-3xl text-center"
          >
            <motion.div
              variants={fadeUp}
              custom={0}
              className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#0A4C95]/10 px-4 py-1.5"
            >
              <Droplets className="h-4 w-4 text-[#0A4C95]" />
              <span className="text-sm font-medium text-[#0A4C95]">
                Water Safety Intelligence
              </span>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="mb-4 text-4xl font-bold text-foreground md:text-5xl"
            >
              Know your water.
            </motion.h1>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-lg text-muted-foreground"
            >
              PFAS sites. Groundwater standards. Advisories. Your water,
              tracked.
            </motion.p>
            <motion.p
              variants={fadeUp}
              custom={3}
              className="text-xs text-muted-foreground/70 mt-2"
            >
              EGLE MPART 2026 · EPA SDWIS · USGS · Michigan DNR
            </motion.p>
          </motion.div>
        </div>
      </section>

      <div className="container py-10 space-y-10">
        {/* Water Checker */}
        <WaterChecker />

        {/* PFAS County Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              PFAS Contamination Sites by County
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Source: EGLE MPART 2026. Michigan has 200+ confirmed PFAS sites
              statewide.
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={PFAS_COUNTIES}
                  layout="vertical"
                  margin={{ left: 90 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis
                    dataKey="county"
                    type="category"
                    tick={{ fontSize: 11 }}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{ fontSize: 11, borderRadius: 8 }}
                    formatter={(v: number) => `${v} sites`}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {PFAS_COUNTIES.map((e) => (
                      <Cell key={e.county} fill={e.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Key PFAS Sites */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">
              Key PFAS Investigation Sites
            </h2>
            <Select value={selectedCounty} onValueChange={setSelectedCounty}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Counties</SelectItem>
                {[...new Set(MICHIGAN_KEY_PFAS_SITES.map((s) => s.county))].map(
                  (c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredSites.map((site) => (
              <Card key={site.siteName} className="h-full">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-bold text-foreground">
                      {site.siteName}
                    </h3>
                    <Badge
                      className={`text-[10px] ${STATUS_STYLES[site.status] ?? ""}`}
                    >
                      {site.status}
                    </Badge>
                  </div>
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <p>
                      <MapPin className="h-3 w-3 inline mr-1" />
                      {site.county} County · {site.siteType}
                    </p>
                    <p>Contaminants: {site.contaminants.join(", ")}</p>
                    {site.maxConcentrationPpt && (
                      <p className="font-semibold text-amber-600">
                        Max detected:{" "}
                        {site.maxConcentrationPpt.toLocaleString()} ppt
                      </p>
                    )}
                    <div className="flex gap-3">
                      {site.affectsPublicWater && (
                        <Badge
                          variant="outline"
                          className="text-[9px] border-red-300 text-red-600"
                        >
                          Affects Public Water
                        </Badge>
                      )}
                      {site.affectsPrivateWells && (
                        <Badge
                          variant="outline"
                          className="text-[9px] border-amber-300 text-amber-600"
                        >
                          Affects Private Wells
                        </Badge>
                      )}
                    </div>
                    <p className="text-[9px] text-muted-foreground/60">
                      {site.source}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* PFAS Standards Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-michigan-forest-deep" />
              Michigan PFAS Standards vs. Federal
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Michigan set the nation's most protective PFAS groundwater
              standards on Aug 3, 2020. Federal MCLs established April 2024.
            </p>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-2 pr-4 text-xs font-semibold text-muted-foreground">
                    Contaminant
                  </th>
                  <th className="py-2 pr-4 text-xs font-semibold text-muted-foreground">
                    Michigan Standard
                  </th>
                  <th className="py-2 pr-4 text-xs font-semibold text-muted-foreground">
                    Federal (EPA)
                  </th>
                  <th className="py-2 text-xs font-semibold text-muted-foreground">
                    Source
                  </th>
                </tr>
              </thead>
              <tbody>
                {PFAS_STANDARDS.map((s) => (
                  <tr key={s.contaminant} className="border-b border-border/40">
                    <td className="py-2 pr-4 font-medium">{s.contaminant}</td>
                    <td className="py-2 pr-4 tabular-nums font-semibold text-michigan-forest-deep">
                      {s.michigan}
                    </td>
                    <td className="py-2 pr-4 tabular-nums">{s.federal}</td>
                    <td className="py-2 text-[10px] text-muted-foreground">
                      {s.source}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Great Lakes Panel */}
        <Card className="bg-gradient-to-r from-[#0A4C95]/5 to-[#00A3A1]/5 border-[#0A4C95]/20">
          <CardContent className="py-6">
            <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
              <Droplets className="h-5 w-5 text-[#0A4C95]" />
              Michigan's Freshwater Superlatives
            </h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#0A4C95] tabular-nums">
                  {GREAT_LAKES_STATS.michiganGreatLakesCoastlineMiles.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  miles of Great Lakes coastline
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#0A4C95] tabular-nums">
                  {GREAT_LAKES_STATS.inlandLakes.toLocaleString()}+
                </p>
                <p className="text-xs text-muted-foreground">inland lakes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#0A4C95] tabular-nums">
                  {GREAT_LAKES_STATS.percentOfWorldFreshwater}%
                </p>
                <p className="text-xs text-muted-foreground">
                  of world's surface fresh water
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#0A4C95] tabular-nums">
                  {GREAT_LAKES_STATS.rivers.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  miles of rivers & streams
                </p>
              </div>
            </div>
            <p className="text-[9px] text-muted-foreground/60 text-center mt-3">
              {GREAT_LAKES_STATS.source}
            </p>
            <div className="text-center mt-3">
              <Link
                to="/civic-power/boards"
                className="text-xs text-primary hover:underline"
              >
                See the boards that govern Michigan's water →
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link to="/environment">
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Environment
            </Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
}
