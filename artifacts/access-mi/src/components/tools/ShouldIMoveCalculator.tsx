import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Home,
  DollarSign,
  Heart,
  Droplets,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { calculateTaxBurden } from "@/lib/tax-calculator";
import { CITIES, PROPERTY_TAX_RATES } from "@/data/michigan-taxes";
import { COUNTY_PROFILES } from "@/data/michigan-county-profiles";
import { computeCompoundDeficit } from "@/utils/compoundDeficit";

function getCountyScore(county: string): {
  uninsured: number;
  food: number;
  score: number;
} {
  const p = COUNTY_PROFILES[county];
  if (!p) return { uninsured: 0, food: 0, score: 50 };
  const u = parseFloat(p.healthHighlights[0]?.value || "6");
  const f = parseFloat(p.healthHighlights[2]?.value || "12");
  // Health Score is the inverse of the shared CADI so move-decision
  // numbers agree with what users see on the Health Equity Atlas.
  const compound = computeCompoundDeficit(p).compound;
  const score = Math.max(0, Math.min(100, Math.round(100 - compound)));
  return { uninsured: u, food: f, score };
}

function Metric({
  icon: Icon,
  label,
  a,
  b,
  unit,
  lowerBetter,
}: {
  icon: typeof DollarSign;
  label: string;
  a: string | number;
  b: string | number;
  unit?: string;
  lowerBetter?: boolean;
}) {
  const numA = typeof a === "number" ? a : parseFloat(a) || 0;
  const numB = typeof b === "number" ? b : parseFloat(b) || 0;
  const winner = lowerBetter
    ? numA < numB
      ? "A"
      : numA > numB
        ? "B"
        : "tie"
    : numA > numB
      ? "A"
      : numA < numB
        ? "B"
        : "tie";
  return (
    <div className="rounded-lg border border-border p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-semibold text-foreground">{label}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-center">
        <div
          className={winner === "A" ? "text-michigan-forest-deep font-semibold" : ""}
        >
          <p className="text-sm">
            {typeof a === "number" ? a.toLocaleString() : a}
            {unit || ""}
          </p>
          {winner === "A" && (
            <CheckCircle2 className="h-3 w-3 text-michigan-forest-deep mx-auto" />
          )}
        </div>
        <div
          className={winner === "B" ? "text-michigan-forest-deep font-semibold" : ""}
        >
          <p className="text-sm">
            {typeof b === "number" ? b.toLocaleString() : b}
            {unit || ""}
          </p>
          {winner === "B" && (
            <CheckCircle2 className="h-3 w-3 text-michigan-forest-deep mx-auto" />
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShouldIMoveCalculator() {
  const [cityA, setCityA] = useState("Detroit");
  const [cityB, setCityB] = useState("Grand Rapids");

  const propA = PROPERTY_TAX_RATES[cityA];
  const propB = PROPERTY_TAX_RATES[cityB];
  const taxA = useMemo(
    () =>
      calculateTaxBurden({
        annualSalary: 60000,
        filingStatus: "single",
        dependents: 0,
        city: cityA,
        isResident: true,
      }),
    [cityA],
  );
  const taxB = useMemo(
    () =>
      calculateTaxBurden({
        annualSalary: 60000,
        filingStatus: "single",
        dependents: 0,
        city: cityB,
        isResident: true,
      }),
    [cityB],
  );
  const healthA = getCountyScore(propA?.county || "");
  const healthB = getCountyScore(propB?.county || "");

  const wins = { A: 0, B: 0 };
  if (taxA.effectiveRate < taxB.effectiveRate) wins.A++;
  else if (taxB.effectiveRate < taxA.effectiveRate) wins.B++;
  if (healthA.score > healthB.score) wins.A++;
  else if (healthB.score > healthA.score) wins.B++;
  if ((propA?.medianHomeValue || 0) < (propB?.medianHomeValue || 0)) wins.A++;
  else wins.B++;
  if (taxA.autoInsurance < taxB.autoInsurance) wins.A++;
  else if (taxB.autoInsurance < taxA.autoInsurance) wins.B++;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Home className="h-5 w-5 text-primary" /> Should I Move?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Select value={cityA} onValueChange={setCityA}>
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CITIES.map((c) => (
                  <SelectItem key={c} value={c} className="text-xs">
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={cityB} onValueChange={setCityB}>
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CITIES.map((c) => (
                  <SelectItem key={c} value={c} className="text-xs">
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Metric
              icon={DollarSign}
              label="Tax Rate (on $60K)"
              a={`${taxA.effectiveRate}%`}
              b={`${taxB.effectiveRate}%`}
              lowerBetter
            />
            <Metric
              icon={Heart}
              label="Health Score"
              a={healthA.score}
              b={healthB.score}
              unit="/100"
            />
            <Metric
              icon={Home}
              label="Median Home Value"
              a={`$${((propA?.medianHomeValue || 0) / 1000).toFixed(0)}K`}
              b={`$${((propB?.medianHomeValue || 0) / 1000).toFixed(0)}K`}
              lowerBetter
            />
            <Metric
              icon={DollarSign}
              label="Auto Insurance (annual)"
              a={`$${taxA.autoInsurance.toLocaleString()}`}
              b={`$${taxB.autoInsurance.toLocaleString()}`}
              lowerBetter
            />
          </div>

          <div
            className={`rounded-lg p-3 text-center ${wins.B > wins.A ? "bg-michigan-forest/5 border border-michigan-forest/20" : wins.A > wins.B ? "bg-primary/5 border border-primary/20" : "bg-muted/50 border border-border"}`}
          >
            <p className="text-sm font-semibold text-foreground">
              {wins.A > wins.B
                ? `${cityA} wins on ${wins.A} of 4 dimensions`
                : wins.B > wins.A
                  ? `${cityB} wins on ${wins.B} of 4 dimensions`
                  : "It's a tie - consider your priorities"}
            </p>
          </div>

          <p className="text-[9px] text-muted-foreground text-center">
            Not financial advice. Based on representative data. Sources: MI
            Treasury, Census ACS, CDC PLACES, Quadrant Info Services.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
