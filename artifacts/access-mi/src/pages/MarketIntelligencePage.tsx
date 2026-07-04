import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Info, Download } from "lucide-react";
import PrintButton from "@/components/shared/PrintButton";

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

interface Region {
  id: string;
  name: string;
  counties: string[];
  pop: number;
  facilities: number;
  fqhcs: number;
  avgSvi: number;
  pcpRatio: number;
  systems: string[];
}

// Source: CDC SVI 2022, County Health Rankings 2025, HRSA HPSA, Access Michigan facility database
const REGIONS: Region[] = [
  {
    id: "southeast",
    name: "Southeast Michigan",
    counties: [
      "Wayne",
      "Oakland",
      "Macomb",
      "Washtenaw",
      "Livingston",
      "Monroe",
      "Lenawee",
      "St. Clair",
    ],
    pop: 4857000,
    facilities: 892,
    fqhcs: 52,
    avgSvi: 0.54,
    pcpRatio: 96,
    systems: [
      "Henry Ford Health (28)",
      "Beaumont/Corewell (42)",
      "Trinity Health (18)",
      "Michigan Medicine (12)",
    ],
  },
  {
    id: "west",
    name: "West Michigan",
    counties: [
      "Kent",
      "Ottawa",
      "Muskegon",
      "Allegan",
      "Kalamazoo",
      "Calhoun",
      "Barry",
      "Ionia",
    ],
    pop: 1580000,
    facilities: 412,
    fqhcs: 22,
    avgSvi: 0.38,
    pcpRatio: 82,
    systems: [
      "Spectrum Health/Corewell (35)",
      "Bronson Health (12)",
      "Ascension Borgess (8)",
    ],
  },
  {
    id: "central",
    name: "Central Michigan",
    counties: [
      "Ingham",
      "Eaton",
      "Clinton",
      "Gratiot",
      "Isabella",
      "Midland",
      "Clare",
    ],
    pop: 620000,
    facilities: 178,
    fqhcs: 14,
    avgSvi: 0.45,
    pcpRatio: 74,
    systems: ["Sparrow Health (15)", "McLaren (10)", "MidMichigan Health (8)"],
  },
  {
    id: "north",
    name: "Northern Michigan",
    counties: [
      "Grand Traverse",
      "Emmet",
      "Charlevoix",
      "Antrim",
      "Leelanau",
      "Benzie",
      "Wexford",
      "Manistee",
    ],
    pop: 285000,
    facilities: 68,
    fqhcs: 8,
    avgSvi: 0.42,
    pcpRatio: 55,
    systems: ["Munson Healthcare (18)", "McLaren Northern (6)"],
  },
  {
    id: "upper",
    name: "Upper Peninsula",
    counties: [
      "Marquette",
      "Delta",
      "Dickinson",
      "Menominee",
      "Chippewa",
      "Houghton",
      "Iron",
      "Gogebic",
    ],
    pop: 295000,
    facilities: 52,
    fqhcs: 10,
    avgSvi: 0.58,
    pcpRatio: 48,
    systems: [
      "UP Health System (12)",
      "OSF HealthCare (6)",
      "War Memorial (4)",
    ],
  },
  {
    id: "thumb",
    name: "Thumb Region",
    counties: ["Huron", "Tuscola", "Sanilac", "Lapeer"],
    pop: 152000,
    facilities: 28,
    fqhcs: 4,
    avgSvi: 0.52,
    pcpRatio: 35,
    systems: ["McLaren Thumb (6)", "Hills & Dales (2)"],
  },
  {
    id: "flint",
    name: "Flint/Saginaw Valley",
    counties: ["Genesee", "Saginaw", "Bay", "Shiawassee", "Arenac"],
    pop: 680000,
    facilities: 185,
    fqhcs: 18,
    avgSvi: 0.72,
    pcpRatio: 72,
    systems: [
      "McLaren Flint (8)",
      "Ascension Genesys (6)",
      "Covenant Health (10)",
    ],
  },
];

function severity(svi: number) {
  if (svi >= 0.7)
    return {
      label: "Critical",
      className: "bg-destructive/10 text-destructive",
    };
  if (svi >= 0.5)
    return {
      label: "High",
      className:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    };
  return {
    label: "Moderate",
    className:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  };
}

function downloadCSV(regions: Region[]) {
  const headers = [
    "Region",
    "Counties",
    "Population",
    "Facilities",
    "FQHCs",
    "Avg SVI",
    "PCP per 100K",
    "Systems",
  ];
  const rows = regions.map((r) =>
    [
      r.name,
      r.counties.length,
      r.pop,
      r.facilities,
      r.fqhcs,
      r.avgSvi,
      r.pcpRatio,
      `"${r.systems.join("; ")}"`,
    ].join(","),
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "michigan-regional-market-intelligence.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function MarketIntelligencePage() {
  const [selectedRegions, setSelectedRegions] = useState([
    "southeast",
    "flint",
  ]);
  const [sortMetric, setSortMetric] = useState("avgSvi");

  usePageMeta({
    title: "Regional Market Intelligence - Access Michigan",
    description:
      "Ambulatory gap analysis and health system presence across Michigan's 7 major regions.",
    path: "/market-intelligence",
  });

  const toggle = (id: string) => {
    setSelectedRegions((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < 4
          ? [...prev, id]
          : prev,
    );
  };

  const sorted = useMemo(
    () =>
      [...REGIONS].sort((a, b) => {
        if (sortMetric === "avgSvi") return b.avgSvi - a.avgSvi;
        if (sortMetric === "pop") return b.pop - a.pop;
        return a.pcpRatio - b.pcpRatio;
      }),
    [sortMetric],
  );

  const selected = REGIONS.filter((r) => selectedRegions.includes(r.id));

  return (
    <Layout>
      <Breadcrumbs
        items={[
          { label: "Partners", href: "/partners" },
          { label: "Market Intelligence" },
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
              New
            </Badge>
            <h1 className="text-3xl font-extrabold text-foreground mb-2">
              Regional ambulatory gaps.
            </h1>
            <p className="text-muted-foreground">
              Where systems compete. Where access breaks.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container max-w-5xl py-8 space-y-8">
        {/* Region selector */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Select regions to compare (max 4)
          </p>
          <div className="flex flex-wrap gap-2">
            {REGIONS.map((r) => {
              const sev = severity(r.avgSvi);
              const isSelected = selectedRegions.includes(r.id);
              return (
                <Button
                  key={r.id}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggle(r.id)}
                  className={!isSelected ? sev.className : ""}
                >
                  {r.name}{" "}
                  <span className="ml-1.5 text-xs opacity-70">
                    SVI {r.avgSvi}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Comparison table */}
        <Card>
          <CardContent className="p-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h2 className="text-base font-bold text-foreground">
                Regional Comparison
              </h2>
              <div className="flex gap-2">
                <Select value={sortMetric} onValueChange={setSortMetric}>
                  <SelectTrigger className="w-[180px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="avgSvi">
                      Sort by vulnerability
                    </SelectItem>
                    <SelectItem value="pop">Sort by population</SelectItem>
                    <SelectItem value="pcpRatio">
                      Sort by PCP shortage
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadCSV(sorted)}
                >
                  <Download className="h-3 w-3 mr-1.5" />
                  CSV
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Region</TableHead>
                    <TableHead className="text-center">Population</TableHead>
                    <TableHead className="text-center">Facilities</TableHead>
                    <TableHead className="text-center">FQHCs</TableHead>
                    <TableHead className="text-center">Avg SVI</TableHead>
                    <TableHead className="text-center">PCP/100K</TableHead>
                    <TableHead className="text-center">Vulnerability</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.map((r) => {
                    const sev = severity(r.avgSvi);
                    const isSelected = selectedRegions.includes(r.id);
                    return (
                      <TableRow
                        key={r.id}
                        className={`cursor-pointer ${isSelected ? "bg-primary/5" : "hover:bg-muted/50"}`}
                        onClick={() => toggle(r.id)}
                      >
                        <TableCell>
                          <p className="text-sm font-semibold text-foreground">
                            {r.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {r.counties.length} counties
                          </p>
                        </TableCell>
                        <TableCell className="text-center">
                          {(r.pop / 1000).toFixed(0)}K
                        </TableCell>
                        <TableCell className="text-center">
                          {r.facilities}
                        </TableCell>
                        <TableCell className="text-center">{r.fqhcs}</TableCell>
                        <TableCell className="text-center">
                          {r.avgSvi}
                        </TableCell>
                        <TableCell className="text-center">
                          {r.pcpRatio}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={sev.className}>{sev.label}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Detail cards */}
        {selected.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6">
            {selected.map((r) => {
              const sev = severity(r.avgSvi);
              return (
                <motion.div
                  key={r.id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fade}
                  custom={0}
                >
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-foreground">
                          {r.name}
                        </h3>
                        <Badge className={sev.className}>{sev.label}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {r.counties.join(", ")}
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          {
                            label: "Population",
                            val: (r.pop / 1000000).toFixed(1) + "M",
                          },
                          { label: "Facilities", val: String(r.facilities) },
                          { label: "PCP/100K", val: String(r.pcpRatio) },
                        ].map((s) => (
                          <div
                            key={s.label}
                            className="text-center bg-muted rounded-xl p-3"
                          >
                            <p className="text-lg font-bold text-primary">
                              {s.val}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-medium">
                              {s.label}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          Health System Presence
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {r.systems.map((s) => (
                            <Badge
                              key={s}
                              variant="secondary"
                              className="text-xs"
                            >
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="bg-muted rounded-xl p-4">
                        <p className="text-xs font-semibold text-muted-foreground mb-2">
                          Access Gap Indicator
                        </p>
                        <div className="h-3 bg-background rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${Math.min(r.avgSvi * 100, 100)}%`,
                              background:
                                r.avgSvi >= 0.7
                                  ? "linear-gradient(90deg, hsl(var(--destructive)), hsl(0 72% 51%))"
                                  : r.avgSvi >= 0.5
                                    ? "linear-gradient(90deg, hsl(var(--michigan-gold)), hsl(25 95% 53%))"
                                    : "linear-gradient(90deg, hsl(var(--michigan-teal)), hsl(var(--michigan-forest)))",
                            }}
                          />
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-[10px] text-muted-foreground">
                            Low need
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            Critical need
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Source */}
        <div className="rounded-lg border border-border bg-muted/50 p-4 flex items-start gap-2">
          <Info className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            <strong>Sources:</strong> CDC SVI 2022, County Health Rankings 2025,
            HRSA HPSA, Access Michigan facility database. Population estimates
            from U.S. Census Bureau ACS. SVI scores averaged across counties in
            each region. See{" "}
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
