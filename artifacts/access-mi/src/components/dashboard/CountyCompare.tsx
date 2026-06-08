import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeftRight, TrendingUp, TrendingDown, Minus, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { COUNTY_PROFILES, getCountyProfile } from "@/data/michigan-county-profiles";
import { countyToSlug } from "@/utils/countyUtils";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const counties = Object.keys(COUNTY_PROFILES).sort();

function parseRate(val: string): number {
  return parseFloat(val.replace(/[^0-9.]/g, "")) || 0;
}

function parseRatio(val: string): number {
  const m = val.match(/([\d,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ""), 10) : 0;
}

interface MetricRow {
  label: string;
  a: string;
  b: string;
  aNum: number;
  bNum: number;
  higherIsBetter: boolean;
}

function TrendIcon({ trend }: { trend?: "up" | "down" | "stable" }) {
  if (trend === "up") return <TrendingUp className="h-3.5 w-3.5 text-primary" />;
  if (trend === "down") return <TrendingDown className="h-3.5 w-3.5 text-destructive" />;
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
}

export default function CountyCompare() {
  const [countyA, setCountyA] = useState("Wayne");
  const [countyB, setCountyB] = useState("Oakland");

  const comparison = useMemo(() => {
    const a = getCountyProfile(countyA);
    const b = getCountyProfile(countyB);

    const metrics: MetricRow[] = [
      {
        label: "Population",
        a: a.population.toLocaleString(),
        b: b.population.toLocaleString(),
        aNum: a.population,
        bNum: b.population,
        higherIsBetter: true,
      },
      {
        label: "Uninsured Rate",
        a: a.healthHighlights[0]?.value || "-",
        b: b.healthHighlights[0]?.value || "-",
        aNum: parseRate(a.healthHighlights[0]?.value || "0"),
        bNum: parseRate(b.healthHighlights[0]?.value || "0"),
        higherIsBetter: false,
      },
      {
        label: "Primary Care Ratio",
        a: a.healthHighlights[1]?.value || "-",
        b: b.healthHighlights[1]?.value || "-",
        aNum: parseRatio(a.healthHighlights[1]?.value || "0"),
        bNum: parseRatio(b.healthHighlights[1]?.value || "0"),
        higherIsBetter: false,
      },
      {
        label: "Food Insecurity",
        a: a.healthHighlights[2]?.value || "-",
        b: b.healthHighlights[2]?.value || "-",
        aNum: parseRate(a.healthHighlights[2]?.value || "0"),
        bNum: parseRate(b.healthHighlights[2]?.value || "0"),
        higherIsBetter: false,
      },
    ];

    return { a, b, metrics };
  }, [countyA, countyB]);

  function cellClass(row: MetricRow, side: "a" | "b") {
    const val = side === "a" ? row.aNum : row.bNum;
    const other = side === "a" ? row.bNum : row.aNum;
    if (val === other || val === 0 || other === 0) return "";
    const isBetter = row.higherIsBetter ? val > other : val < other;
    return isBetter ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Card>
        <CardContent className="py-6 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <ArrowLeftRight className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">Compare Two Counties</h3>
          </div>

          {/* Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-end">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">County A</label>
              <Select value={countyA} onValueChange={setCountyA}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-60">
                  {counties.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="hidden sm:flex items-center justify-center">
              <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">County B</label>
              <Select value={countyB} onValueChange={setCountyB}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-60">
                  {counties.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Type badges */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">{comparison.a.countyType}</Badge>
              <span className="text-xs text-muted-foreground">{comparison.a.majorCities.slice(0, 2).join(", ")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">{comparison.b.countyType}</Badge>
              <span className="text-xs text-muted-foreground">{comparison.b.majorCities.slice(0, 2).join(", ")}</span>
            </div>
          </div>

          {/* Comparison table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-xs font-medium text-muted-foreground">Metric</th>
                  <th className="text-right py-2 text-xs font-medium text-primary">{countyA}</th>
                  <th className="text-right py-2 text-xs font-medium text-primary">{countyB}</th>
                </tr>
              </thead>
              <tbody>
                {comparison.metrics.map((row) => (
                  <tr key={row.label} className="border-b border-border/50">
                    <td className="py-2.5 text-foreground">{row.label}</td>
                    <td className={`py-2.5 text-right ${cellClass(row, "a")}`}>{row.a}</td>
                    <td className={`py-2.5 text-right ${cellClass(row, "b")}`}>{row.b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-[10px] text-muted-foreground">
            Green highlights indicate the better value. Source: County Health Rankings & Roadmaps, 2025 edition, Census ACS 2023.
          </p>

          {/* Links to place pages */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Link to={`/place/${countyToSlug(countyA)}-county`}>
              <Button size="sm" variant="outline" className="gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> {countyA} Profile
              </Button>
            </Link>
            <Link to={`/place/${countyToSlug(countyB)}-county`}>
              <Button size="sm" variant="outline" className="gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> {countyB} Profile
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
