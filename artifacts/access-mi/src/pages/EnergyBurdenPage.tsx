import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Info, Zap, AlertTriangle, TrendingUp } from "lucide-react";
import PrintButton from "@/components/shared/PrintButton";

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

interface CountyEnergy {
  county: string;
  burden: number;
  severity: string;
  medianCost: number;
}

const DATA: CountyEnergy[] = [
  { county: "Wayne", burden: 8.2, severity: "High", medianCost: 2450 },
  { county: "Genesee", burden: 9.1, severity: "High", medianCost: 2280 },
  { county: "Saginaw", burden: 8.7, severity: "High", medianCost: 2150 },
  { county: "Lake", burden: 11.3, severity: "Severe", medianCost: 2680 },
  { county: "Kent", burden: 5.8, severity: "Moderate", medianCost: 1950 },
  { county: "Washtenaw", burden: 4.2, severity: "Low", medianCost: 1780 },
  { county: "Oakland", burden: 4.8, severity: "Low", medianCost: 2100 },
  { county: "Mackinac", burden: 10.8, severity: "Severe", medianCost: 2890 },
];

function sevStyle(severity: string) {
  switch (severity) {
    case "Severe":
      return "bg-destructive/10 text-destructive";
    case "High":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "Moderate":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    default:
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
  }
}

export default function EnergyBurdenPage() {
  usePageMeta({
    title: "Energy Burden Dashboard - Access Michigan",
    description:
      "County-level energy affordability data across Michigan, showing energy burden percentages and DOE threshold analysis.",
    path: "/energy-burden",
  });

  const sorted = [...DATA].sort((a, b) => b.burden - a.burden);
  const severe = DATA.filter((d) => d.severity === "Severe").length;
  const high = DATA.filter((d) => d.severity === "High").length;
  const avgBurden = (
    DATA.reduce((s, d) => s + d.burden, 0) / DATA.length
  ).toFixed(1);

  return (
    <Layout>
      <Breadcrumbs
        items={[
          { label: "Data & Insights", href: "/data-and-insights" },
          { label: "Energy Burden" },
        ]}
      />

      <section className="bg-gradient-to-b from-primary/5 to-background py-12">
        <div className="container max-w-5xl">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fade}
            custom={0}
          >
            <Badge
              variant="outline"
              className="mb-3 uppercase tracking-wider text-xs"
            >
              Environmental Justice
            </Badge>
            <h1 className="text-3xl font-extrabold text-foreground mb-2">
              Who can't afford to keep the lights on.
            </h1>
            <p className="text-muted-foreground">
              County-level energy affordability. For EJ analysis and utility
              partnerships.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container max-w-5xl py-8 space-y-8">
        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              icon: AlertTriangle,
              label: "Severe Burden",
              value: String(severe),
              sub: "Counties ≥10%",
              className: "text-destructive",
            },
            {
              icon: TrendingUp,
              label: "High Burden",
              value: String(high),
              sub: "Counties 6–10%",
              className: "text-yellow-600 dark:text-yellow-400",
            },
            {
              icon: Zap,
              label: "Avg Burden",
              value: `${avgBurden}%`,
              sub: "Across tracked counties",
              className: "text-primary",
            },
            {
              icon: Info,
              label: "DOE Threshold",
              value: "6%",
              sub: "High burden definition",
              className: "text-muted-foreground",
            },
          ].map((card) => (
            <Card key={card.label}>
              <CardContent className="pt-4 pb-3 text-center">
                <card.icon
                  className={`h-5 w-5 mx-auto mb-1 ${card.className}`}
                />
                <p className={`text-2xl font-bold ${card.className}`}>
                  {card.value}
                </p>
                <p className="text-xs font-semibold text-foreground">
                  {card.label}
                </p>
                <p className="text-[10px] text-muted-foreground">{card.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              County Energy Burden Analysis
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              DOE defines energy burden ≥6% as high; ≥10% as severe. Red line at
              6%.
            </p>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>County</TableHead>
                  <TableHead className="text-center">Energy Burden %</TableHead>
                  <TableHead>Burden Indicator</TableHead>
                  <TableHead className="text-center">Severity</TableHead>
                  <TableHead className="text-right">
                    Median Annual Energy Cost
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((d) => (
                  <TableRow key={d.county}>
                    <TableCell className="font-medium">{d.county}</TableCell>
                    <TableCell className="text-center font-bold">
                      {d.burden}%
                    </TableCell>
                    <TableCell>
                      <div className="relative h-4 w-full max-w-[200px] bg-muted rounded-full overflow-hidden">
                        <div
                          className="absolute h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.min((d.burden / 12) * 100, 100)}%`,
                            background:
                              d.severity === "Severe"
                                ? "linear-gradient(90deg, #FF6B6B, #DC2626)"
                                : d.severity === "High"
                                  ? "linear-gradient(90deg, #F4A460, #EA580C)"
                                  : d.severity === "Moderate"
                                    ? "linear-gradient(90deg, #4A90E2, #0A4C95)"
                                    : "linear-gradient(90deg, #00A3A1, #2D5F3F)",
                          }}
                        />
                        {/* 6% threshold line */}
                        <div
                          className="absolute h-full w-0.5 bg-destructive z-10"
                          style={{ left: `${(6 / 12) * 100}%` }}
                          title="DOE 6% threshold"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={sevStyle(d.severity)}>
                        {d.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      ${d.medianCost.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Source */}
        <div className="rounded-lg border border-border bg-muted/50 p-4 flex items-start gap-2">
          <Info className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            <strong>Sources:</strong> ACEEE LEAD Tool, U.S. Department of
            Energy, EIA RECS. Energy burden = % of household income spent on
            energy costs. DOE defines ≥6% as high burden, ≥10% as severe. See{" "}
            <a href="/methodology" className="text-primary hover:underline">
              Methodology
            </a>
            .
          </p>
        </div>
      </div>
      <PrintButton />
    </Layout>
  );
}
