import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { lazy, Suspense } from "react";
import {
  DollarSign,
  Landmark,
  AlertTriangle,
  Building2,
  Info,
  BarChart3,
} from "lucide-react";

const MoneyFlowSankey = lazy(
  () => import("@/components/investment/MoneyFlowSankey"),
);
const FiscalCliffCalculator = lazy(
  () => import("@/components/investment/FiscalCliffCalculator"),
);
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Cell,
  ZAxis,
  Legend,
  ReferenceLine,
} from "recharts";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePageMeta } from "@/hooks/usePageMeta";
import {
  MICHIGAN_FEDERAL_SPENDING,
  getFederalDependencyScore,
} from "@/data/federalSpending";
import SuggestResource from "@/components/community/SuggestResource";
import HelpfulVote from "@/components/community/HelpfulVote";
import { MICHIGAN_BONDS } from "@/data/municipalBonds";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

const CATEGORY_COLORS: Record<string, string> = {
  medicaid: "hsl(209, 86%, 31%)",
  snap: "hsl(27, 87%, 67%)",
  housing: "hsl(180, 100%, 32%)",
  infrastructure: "hsl(145, 32%, 30%)",
  health_grants: "hsl(0, 100%, 71%)",
  education: "hsl(214, 74%, 59%)",
  energy: "hsl(45, 100%, 58%)",
};

const BOND_CATEGORY_STYLES: Record<string, string> = {
  healthcare: "bg-michigan-teal/10 text-michigan-teal-deep",
  infrastructure: "bg-primary/10 text-primary",
  education: "bg-michigan-gold/10 text-michigan-gold-deep",
  housing: "bg-michigan-coral/10 text-michigan-coral-deep",
  water: "bg-michigan-sky/10 text-michigan-sky",
  general: "bg-muted text-muted-foreground",
};

// Equity scores for the 10 seeded counties (illustrative composite, inverted: lower = more need)
const COUNTY_EQUITY_SCORES: Record<string, number> = {
  Wayne: 28,
  Genesee: 32,
  Saginaw: 30,
  Ingham: 52,
  Oakland: 74,
  Washtenaw: 70,
  Kent: 55,
  Kalamazoo: 48,
  Macomb: 58,
  Ottawa: 72,
};

function getQuadrantLabel(fedDep: number, equity: number): string {
  if (fedDep <= 35 && equity >= 50) return "Resilient";
  if (fedDep > 35 && equity >= 50) return "Watch";
  if (fedDep <= 35 && equity < 50) return "Vulnerable";
  return "Critical";
}

function getQuadrantColor(label: string): string {
  switch (label) {
    case "Resilient":
      return "hsl(145, 32%, 30%)";
    case "Watch":
      return "hsl(45, 100%, 45%)";
    case "Vulnerable":
      return "hsl(27, 87%, 55%)";
    case "Critical":
      return "hsl(0, 72%, 51%)";
    default:
      return "hsl(214, 20%, 60%)";
  }
}

/* ── Tab 1: Federal Funding ─────────────────────────────────────────── */

function FederalFundingTab() {
  const [selectedCounty, setSelectedCounty] = useState<string>("all");
  const counties = MICHIGAN_FEDERAL_SPENDING.map((r) => r.county);

  const filtered = useMemo(() => {
    if (selectedCounty === "all") return MICHIGAN_FEDERAL_SPENDING;
    return MICHIGAN_FEDERAL_SPENDING.filter((r) => r.county === selectedCounty);
  }, [selectedCounty]);

  const chartData = useMemo(
    () =>
      filtered.map((r) => ({
        county: r.county,
        Medicaid: r.medicaid_millions,
        SNAP: r.snap_millions,
        Housing: r.housing_millions,
        Infrastructure: r.infrastructure_millions,
        "Health Grants": r.health_grants_millions,
        Education: r.education_millions,
        Energy: r.energy_millions,
      })),
    [filtered],
  );

  const totalAwards = filtered.reduce((s, r) => s + r.total_awards_millions, 0);

  // Derive the largest category from the same filtered rows so the headline
  // can't disagree with the stacked bar below it (e.g., filtering to a
  // single county where Infrastructure outweighs Medicaid).
  const largestCategory = useMemo(() => {
    const sums: Record<string, number> = {
      Medicaid: 0,
      SNAP: 0,
      Housing: 0,
      Infrastructure: 0,
      "Health Grants": 0,
      Education: 0,
      Energy: 0,
    };
    for (const r of filtered) {
      sums.Medicaid += r.medicaid_millions;
      sums.SNAP += r.snap_millions;
      sums.Housing += r.housing_millions;
      sums.Infrastructure += r.infrastructure_millions;
      sums["Health Grants"] += r.health_grants_millions;
      sums.Education += r.education_millions;
      sums.Energy += r.energy_millions;
    }
    const entries = Object.entries(sums);
    if (entries.every(([, v]) => v === 0)) return "-";
    return entries.reduce((a, b) => (b[1] > a[1] ? b : a))[0];
  }, [filtered]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <Select value={selectedCounty} onValueChange={setSelectedCounty}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Select county" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">View all counties</SelectItem>
            {counties.map((c) => (
              <SelectItem key={c} value={c}>
                {c} County
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="py-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Total Federal Awards
            </p>
            <p className="text-2xl font-bold text-foreground tabular-nums">
              ${totalAwards.toLocaleString()}M
            </p>
            <p className="text-[9px] text-muted-foreground">
              Source: USASpending.gov FY2024
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Largest Category
            </p>
            <p className="text-2xl font-bold text-foreground">
              {largestCategory}
            </p>
            <p className="text-[9px] text-muted-foreground">
              Across {filtered.length} counties
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Counties in Dataset
            </p>
            <p className="text-2xl font-bold text-foreground tabular-nums">
              {filtered.length}
            </p>
            <p className="text-[9px] text-muted-foreground">
              Top Michigan counties by population
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stacked bar chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            Federal Spending by Category
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Source: USASpending.gov FY2024 - values in $M
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ left: 80 }}
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
                  width={70}
                />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 8 }}
                  formatter={(val: number) => `$${val}M`}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar
                  dataKey="Medicaid"
                  stackId="a"
                  fill={CATEGORY_COLORS.medicaid}
                />
                <Bar dataKey="SNAP" stackId="a" fill={CATEGORY_COLORS.snap} />
                <Bar
                  dataKey="Housing"
                  stackId="a"
                  fill={CATEGORY_COLORS.housing}
                />
                <Bar
                  dataKey="Infrastructure"
                  stackId="a"
                  fill={CATEGORY_COLORS.infrastructure}
                />
                <Bar
                  dataKey="Health Grants"
                  stackId="a"
                  fill={CATEGORY_COLORS.health_grants}
                />
                <Bar
                  dataKey="Education"
                  stackId="a"
                  fill={CATEGORY_COLORS.education}
                />
                <Bar
                  dataKey="Energy"
                  stackId="a"
                  fill={CATEGORY_COLORS.energy}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Tab 2: Municipal Bonds ─────────────────────────────────────────── */

function MunicipalBondsTab() {
  const [catFilter, setCatFilter] = useState<string>("all");
  const [countyFilter, setCountyFilter] = useState<string>("all");
  const [sortCol, setSortCol] = useState<"amount" | "year">("amount");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const bondCounties = [...new Set(MICHIGAN_BONDS.map((b) => b.county))].sort();
  const bondCategories = [
    ...new Set(MICHIGAN_BONDS.map((b) => b.category)),
  ].sort();

  const filtered = useMemo(() => {
    let bonds = [...MICHIGAN_BONDS];
    if (catFilter !== "all")
      bonds = bonds.filter((b) => b.category === catFilter);
    if (countyFilter !== "all")
      bonds = bonds.filter((b) => b.county === countyFilter);
    bonds.sort((a, b) => {
      const v =
        sortCol === "amount"
          ? a.amount_millions - b.amount_millions
          : a.issued_year - b.issued_year;
      return sortDir === "desc" ? -v : v;
    });
    return bonds;
  }, [catFilter, countyFilter, sortCol, sortDir]);

  const totalFiltered = filtered.reduce((s, b) => s + b.amount_millions, 0);

  const toggleSort = (col: "amount" | "year") => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortCol(col);
      setSortDir("desc");
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {bondCategories.map((c) => (
              <SelectItem key={c} value={c} className="capitalize">
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={countyFilter} onValueChange={setCountyFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="County" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Counties</SelectItem>
            {bondCounties.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="py-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-3 pr-4 text-xs font-semibold text-muted-foreground">
                  Issuer
                </th>
                <th className="py-3 pr-4 text-xs font-semibold text-muted-foreground">
                  County
                </th>
                <th className="py-3 pr-4 text-xs font-semibold text-muted-foreground">
                  Purpose
                </th>
                <th className="py-3 pr-4 text-xs font-semibold text-muted-foreground">
                  Category
                </th>
                <th
                  className="py-3 pr-4 text-xs font-semibold text-muted-foreground cursor-pointer hover:text-foreground"
                  onClick={() => toggleSort("amount")}
                >
                  Amount ($M){" "}
                  {sortCol === "amount" ? (sortDir === "desc" ? "↓" : "↑") : ""}
                </th>
                <th
                  className="py-3 pr-4 text-xs font-semibold text-muted-foreground cursor-pointer hover:text-foreground"
                  onClick={() => toggleSort("year")}
                >
                  Year{" "}
                  {sortCol === "year" ? (sortDir === "desc" ? "↓" : "↑") : ""}
                </th>
                <th className="py-3 text-xs font-semibold text-muted-foreground">
                  Maturity
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b, i) => (
                <tr
                  key={`${b.issuer}-${b.issued_year}-${i}`}
                  className="border-b border-border/40"
                >
                  <td className="py-2.5 pr-4 font-medium">{b.issuer}</td>
                  <td className="py-2.5 pr-4 text-muted-foreground">
                    {b.county}
                  </td>
                  <td className="py-2.5 pr-4 text-muted-foreground max-w-[200px] truncate">
                    {b.purpose}
                  </td>
                  <td className="py-2.5 pr-4">
                    <Badge
                      variant="outline"
                      className={`text-[10px] capitalize ${BOND_CATEGORY_STYLES[b.category] ?? ""}`}
                    >
                      {b.category}
                    </Badge>
                  </td>
                  <td className="py-2.5 pr-4 tabular-nums font-semibold">
                    ${b.amount_millions}
                  </td>
                  <td className="py-2.5 pr-4 tabular-nums">{b.issued_year}</td>
                  <td className="py-2.5 tabular-nums text-muted-foreground">
                    {b.maturity_year}
                  </td>
                </tr>
              ))}
              <tr className="bg-muted/30 font-semibold">
                <td className="py-2.5 pr-4" colSpan={4}>
                  Total ({filtered.length} issuances)
                </td>
                <td className="py-2.5 pr-4 tabular-nums">
                  ${totalFiltered.toLocaleString()}
                </td>
                <td colSpan={2}></td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="space-y-1">
        <p className="text-[10px] text-muted-foreground">
          Source: MSRB EMMA - public municipal securities record
        </p>
        <p className="text-[10px] text-muted-foreground italic">
          Illustrative - not exhaustive. Visit emma.msrb.org for complete
          records.
        </p>
      </div>
    </div>
  );
}

/* ── Tab 3: Fiscal Vulnerability Index ──────────────────────────────── */

function FiscalVulnerabilityTab() {
  const scatterData = useMemo(
    () =>
      MICHIGAN_FEDERAL_SPENDING.map((r) => {
        const fedDep = getFederalDependencyScore(r.county) ?? 0;
        const equity = COUNTY_EQUITY_SCORES[r.county] ?? 50;
        const quadrant = getQuadrantLabel(fedDep, equity);
        return {
          county: r.county,
          federalDependency: fedDep,
          equityScore: equity,
          totalAwards: r.total_awards_millions,
          quadrant,
        };
      }),
    [],
  );

  const criticalCounties = scatterData.filter((d) => d.quadrant === "Critical");

  const topProgramForCounty = (county: string): string => {
    const r = MICHIGAN_FEDERAL_SPENDING.find((d) => d.county === county);
    if (!r) return "N/A";
    const cats: [string, number][] = [
      ["Medicaid", r.medicaid_millions],
      ["SNAP", r.snap_millions],
      ["Housing (HUD)", r.housing_millions],
      ["Health Grants", r.health_grants_millions],
      ["Education", r.education_millions],
    ];
    cats.sort((a, b) => b[1] - a[1]);
    return cats[0][0];
  };

  return (
    <div className="space-y-6">
      {/* Callout card */}
      <Card className="border-michigan-coral/30 bg-michigan-coral/5">
        <CardContent className="py-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-michigan-coral-deep shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-foreground mb-1">
                Understanding Fiscal Vulnerability
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Counties with the greatest health equity gaps that rely most
                heavily on federal funding face compounding risk as federal
                programs are restructured. This index identifies where
                investment continuity matters most.
              </p>
              <p className="text-xs text-muted-foreground mt-2 italic">
                Illustrative composite - see methodology
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scatter plot */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            Federal Dependency vs. Equity Score
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Each dot = one county. Quadrants at X=35%, Y=50 score. Illustrative
            composite.
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{ top: 20, right: 30, bottom: 40, left: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  type="number"
                  dataKey="federalDependency"
                  domain={[0, 60]}
                  name="Federal Dependency"
                  unit="%"
                  tick={{ fontSize: 11 }}
                  label={{
                    value: "Federal Dependency Score (%)",
                    position: "bottom",
                    offset: 20,
                    style: { fontSize: 11 },
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="equityScore"
                  domain={[0, 100]}
                  name="Equity Score"
                  tick={{ fontSize: 11 }}
                  label={{
                    value: "Composite Equity Score",
                    angle: -90,
                    position: "insideLeft",
                    offset: -5,
                    style: { fontSize: 11 },
                  }}
                />
                <ZAxis
                  type="number"
                  dataKey="totalAwards"
                  range={[80, 400]}
                  name="Total Awards ($M)"
                />
                <ReferenceLine
                  x={35}
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="6 4"
                />
                <ReferenceLine
                  y={50}
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="6 4"
                />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 8 }}
                  formatter={(val: number, name: string) =>
                    name === "Federal Dependency"
                      ? `${val}%`
                      : name === "Equity Score"
                        ? `${val}/100`
                        : `$${val.toLocaleString()}M`
                  }
                  labelFormatter={(_, payload) => {
                    const p = payload?.[0]?.payload;
                    return p ? `${p.county} County - ${p.quadrant}` : "";
                  }}
                />
                <Scatter data={scatterData} shape="circle">
                  {scatterData.map((entry, i) => (
                    <Cell
                      key={entry.county}
                      fill={getQuadrantColor(entry.quadrant)}
                      stroke={
                        entry.quadrant === "Critical"
                          ? "hsl(0, 72%, 40%)"
                          : "none"
                      }
                      strokeWidth={entry.quadrant === "Critical" ? 2 : 0}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          {/* Quadrant legend */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(["Resilient", "Watch", "Vulnerable", "Critical"] as const).map(
              (q) => (
                <div key={q} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: getQuadrantColor(q) }}
                  />
                  <span className="text-xs text-muted-foreground">{q}</span>
                </div>
              ),
            )}
          </div>
          {/* County labels overlay */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {scatterData.map((d) => (
              <Badge
                key={d.county}
                variant="outline"
                className="text-[10px]"
                style={{
                  borderColor: getQuadrantColor(d.quadrant),
                  color: getQuadrantColor(d.quadrant),
                }}
              >
                {d.county}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Critical counties table */}
      {criticalCounties.length > 0 && (
        <Card className="border-red-200 dark:border-red-900/40">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Critical Fiscal Vulnerability Counties
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              High equity need + high federal dependency - most exposed to
              federal funding changes. Illustrative composite.
            </p>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-2 pr-4 text-xs font-semibold text-muted-foreground">
                    County
                  </th>
                  <th className="py-2 pr-4 text-xs font-semibold text-muted-foreground">
                    Equity Score
                  </th>
                  <th className="py-2 pr-4 text-xs font-semibold text-muted-foreground">
                    Federal Dependency
                  </th>
                  <th className="py-2 text-xs font-semibold text-muted-foreground">
                    Top Federal Program
                  </th>
                </tr>
              </thead>
              <tbody>
                {criticalCounties.map((c) => (
                  <tr key={c.county} className="border-b border-border/40">
                    <td className="py-2.5 pr-4 font-medium">{c.county}</td>
                    <td className="py-2.5 pr-4 tabular-nums">
                      <span className="text-red-500 font-semibold">
                        {c.equityScore}/100
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 tabular-nums">
                      <span className="text-red-500 font-semibold">
                        {c.federalDependency}%
                      </span>
                    </td>
                    <td className="py-2.5 text-muted-foreground">
                      {topProgramForCounty(c.county)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ── Main Page ──────────────────────────────────────────────────────── */

const PublicInvestmentPage = () => {
  usePageMeta({
    title: "Public Investment Intelligence - Access Michigan",
    description:
      "Where the money actually lands in Michigan. Federal funding, municipal bonds, and fiscal vulnerability analysis. Statewide.",
    path: "/public-investment",
  });

  return (
    <Layout>
      <Breadcrumbs items={[{ label: "Public Investment" }]} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-michigan-teal/5 to-background py-16 md:py-20">
        <div className="container">
          <motion.div
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-3xl text-center"
          >
            <motion.div
              variants={fadeUp}
              custom={0}
              className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5"
            >
              <Landmark className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Public Investment Intelligence
              </span>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="mb-4 text-4xl font-bold text-foreground md:text-5xl"
            >
              Where the money actually lands.
            </motion.h1>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-lg text-muted-foreground"
            >
              Federal awards. Municipal bonds. Fiscal exposure. Statewide.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Dashboard */}
      <section className="container py-10">
        <Tabs defaultValue="federal" className="w-full">
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex w-max min-w-full sm:w-auto sm:min-w-0 gap-1">
              <TabsTrigger
                value="federal"
                className="text-xs sm:text-sm whitespace-nowrap gap-1.5"
              >
                <DollarSign className="h-3.5 w-3.5" />
                Federal Funding
              </TabsTrigger>
              <TabsTrigger
                value="bonds"
                className="text-xs sm:text-sm whitespace-nowrap gap-1.5"
              >
                <Building2 className="h-3.5 w-3.5" />
                Municipal Bonds
              </TabsTrigger>
              <TabsTrigger
                value="fiscal-cliff"
                className="text-xs sm:text-sm whitespace-nowrap gap-1.5"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                Fiscal Cliff
              </TabsTrigger>
              <TabsTrigger
                value="vulnerability"
                className="text-xs sm:text-sm whitespace-nowrap gap-1.5"
              >
                <BarChart3 className="h-3.5 w-3.5" />
                Vulnerability
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="federal" className="mt-6">
            <div className="space-y-8">
              {/* Sankey diagram */}
              <Card>
                <CardContent className="pt-6">
                  <Suspense
                    fallback={
                      <div className="h-[480px] flex items-center justify-center">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      </div>
                    }
                  >
                    <MoneyFlowSankey />
                  </Suspense>
                </CardContent>
              </Card>

              {/* Summary bar charts */}
              <FederalFundingTab />
            </div>
          </TabsContent>

          <TabsContent value="bonds" className="mt-6">
            <MunicipalBondsTab />
          </TabsContent>

          <TabsContent value="fiscal-cliff" className="mt-6">
            <Suspense
              fallback={
                <div className="h-64 flex items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              }
            >
              <FiscalCliffCalculator />
            </Suspense>
          </TabsContent>

          <TabsContent value="vulnerability" className="mt-6">
            <FiscalVulnerabilityTab />
          </TabsContent>
        </Tabs>
      </section>

      {/* Methodology note */}
      <section className="container pb-12">
        <Card className="bg-muted/30">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  <strong>Data Sources:</strong> Federal spending from
                  USASpending.gov FY2024 (public record). Municipal bonds from
                  MSRB EMMA (public municipal securities record). Federal
                  dependency and equity scores are modeled composites - not
                  official government metrics.
                </p>
                <p className="text-xs text-muted-foreground">
                  <Link
                    to="/methodology"
                    className="text-primary hover:underline"
                  >
                    View full methodology →
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <SuggestResource pageUrl="/public-investment" />
          <HelpfulVote pagePath="/public-investment" />
        </div>
      </section>
    </Layout>
  );
};

export default PublicInvestmentPage;
