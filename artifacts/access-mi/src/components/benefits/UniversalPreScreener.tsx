/**
 * Universal Benefits Pre-Screener - 2026 Michigan FPL-based eligibility flow.
 * 4-step interactive screener with document checklists.
 * Uses 2026 MDHHS eligibility standards.
 */
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign,
  Users,
  Calendar,
  Accessibility,
  ChevronRight,
  CheckCircle2,
  FileText,
  ExternalLink,
  ArrowLeft,
  RotateCcw,
  ClipboardCheck,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { OfficialChannelNotice } from "@/components/shared/OfficialChannelNotice";

// 2026 Federal Poverty Guidelines
const FPL_2026: Record<number, number> = {
  1: 15960,
  2: 21640,
  3: 27320,
  4: 33000,
  5: 38680,
  6: 44360,
  7: 50040,
  8: 55720,
};
const FPL_ADDITIONAL = 5680;

function getFPL(householdSize: number): number {
  if (householdSize <= 8) return FPL_2026[householdSize] || FPL_2026[1];
  return FPL_2026[8] + (householdSize - 8) * FPL_ADDITIONAL;
}

interface Program {
  id: string;
  name: string;
  description: string;
  incomeLimit: number; // as multiplier of FPL
  ageRange?: [number, number];
  categoricalReq?: string[];
  requiredDocs: string[];
  applyUrl: string;
  applyLabel: string;
  category: "health" | "food" | "energy" | "family";
}

// Source: 2026 MDHHS eligibility standards (see file header)
const PROGRAMS: Program[] = [
  {
    id: "snap",
    name: "SNAP / Food Assistance (FAP)",
    description:
      "Monthly benefits for groceries through Michigan's Food Assistance Program. Most households with income under 200% FPL qualify.",
    incomeLimit: 2.0,
    requiredDocs: [
      "Valid photo ID",
      "Proof of Michigan residency",
      "Recent paystubs (last 30 days)",
      "Utility bills (most recent)",
    ],
    applyUrl: "https://newmibridges.michigan.gov/",
    applyLabel: "Apply on MI Bridges",
    category: "food",
  },
  {
    id: "hmp",
    name: "Healthy Michigan Plan (Medicaid)",
    description:
      "Free or low-cost health coverage for adults 19–64 with household income up to 133% FPL.",
    incomeLimit: 1.33,
    ageRange: [19, 64],
    requiredDocs: [
      "Social Security Number",
      "Tax filing status documentation",
      "Income verification (W-2, paystub, or tax return)",
    ],
    applyUrl: "https://newmibridges.michigan.gov/",
    applyLabel: "Apply on MI Bridges",
    category: "health",
  },
  {
    id: "liheap",
    name: "LIHEAP / Home Heating Credit",
    description:
      "Federal heating and cooling assistance for low-income households. Helps pay energy bills during winter months.",
    incomeLimit: 1.5,
    requiredDocs: [
      "Most recent heating/utility bill",
      "Proof of household assets (if over $15,000)",
      "Social Security numbers for all household members",
    ],
    applyUrl: "https://www.michigan.gov/mdhhs/assistance-programs/energy",
    applyLabel: "Apply for LIHEAP",
    category: "energy",
  },
  {
    id: "wic",
    name: "WIC Nutrition Program",
    description:
      "Free nutrition support for pregnant women, breastfeeding mothers, and children under 5 with income up to 185% FPL.",
    incomeLimit: 1.85,
    categoricalReq: ["Pregnant", "Breastfeeding", "Child under 5 in household"],
    requiredDocs: [
      "Proof of pregnancy or child's birth certificate",
      "WIC medical referral form",
      "Valid photo ID",
    ],
    applyUrl: "https://www.michigan.gov/mdhhs/assistance-programs/wic",
    applyLabel: "Find WIC Clinic",
    category: "family",
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  health:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  food: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  energy: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300",
  family: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
};

const stepAnim = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, x: -30, transition: { duration: 0.15 } },
};

export default function UniversalPreScreener() {
  const [step, setStep] = useState(1);
  const [income, setIncome] = useState("");
  const [incomeUnit, setIncomeUnit] = useState<"annual" | "monthly" | "hourly">(
    "annual",
  );
  const [householdSize, setHouseholdSize] = useState(1);
  const [age, setAge] = useState("");
  const [hasDisability, setHasDisability] = useState(false);
  const [categoricals, setCategoricals] = useState<string[]>([]);

  const annualIncome = useMemo(() => {
    const val = parseFloat(income) || 0;
    if (incomeUnit === "monthly") return val * 12;
    if (incomeUnit === "hourly") return val * 2080;
    return val;
  }, [income, incomeUnit]);

  const fpl = useMemo(() => getFPL(householdSize), [householdSize]);
  const fplPct = useMemo(
    () => (fpl > 0 ? (annualIncome / fpl) * 100 : 0),
    [annualIncome, fpl],
  );
  const ageNum = parseInt(age) || 0;

  const results = useMemo(() => {
    return PROGRAMS.filter((p) => {
      // Income check
      if (annualIncome > fpl * p.incomeLimit) return false;
      // Age check
      if (p.ageRange && (ageNum < p.ageRange[0] || ageNum > p.ageRange[1]))
        return false;
      // Categorical check (WIC)
      if (p.categoricalReq && categoricals.length === 0) return false;
      return true;
    });
  }, [annualIncome, fpl, ageNum, categoricals]);

  const reset = () => {
    setStep(1);
    setIncome("");
    setIncomeUnit("annual");
    setHouseholdSize(1);
    setAge("");
    setHasDisability(false);
    setCategoricals([]);
  };

  const goNext = () => setStep((s) => Math.min(s + 1, 4));
  const goBack = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ClipboardCheck className="h-4 w-4 text-primary" />
          Benefits eligibility explainer
          <Badge variant="outline" className="text-[10px] ml-auto">
            2026 Standards
          </Badge>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          See which Michigan assistance programs match these rules. No data is
          stored - 100% private.
        </p>
        <OfficialChannelNotice variant="compact" />
      </CardHeader>

      <div className="px-6 pb-2">
        <Progress value={(step / 4) * 100} className="h-1.5" />
        <div className="flex justify-between mt-1">
          {["Income", "Household", "Age & Status", "Results"].map(
            (label, i) => (
              <span
                key={label}
                className={`text-[10px] ${step > i ? "text-primary font-medium" : "text-muted-foreground"}`}
              >
                {label}
              </span>
            ),
          )}
        </div>
      </div>

      <CardContent className="pt-4 min-h-[280px]">
        <AnimatePresence mode="wait">
          {/* Step 1: Income */}
          {step === 1 && (
            <motion.div key="s1" {...stepAnim} className="space-y-4">
              <div>
                <Label className="text-sm font-medium">
                  Annual Household Income
                </Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Enter your total household income before taxes.
                </p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="0"
                      value={income}
                      onChange={(e) => setIncome(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select
                    value={incomeUnit}
                    onValueChange={(v) => setIncomeUnit(v as typeof incomeUnit)}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="annual">Annual</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {annualIncome > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    ≈ ${annualIncome.toLocaleString()}/year ·{" "}
                    {fplPct.toFixed(0)}% of Federal Poverty Level
                  </p>
                )}
              </div>
              <Button onClick={goNext} className="w-full gap-2">
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {/* Step 2: Household Size */}
          {step === 2 && (
            <motion.div key="s2" {...stepAnim} className="space-y-4">
              <div>
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <Users className="h-4 w-4" /> Household Size
                </Label>
                <p className="text-xs text-muted-foreground mb-3">
                  Include everyone living in your home (adults and children).
                </p>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setHouseholdSize(Math.max(1, householdSize - 1))
                    }
                  >
                    −
                  </Button>
                  <span className="text-2xl font-bold text-foreground w-12 text-center">
                    {householdSize}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setHouseholdSize(Math.min(12, householdSize + 1))
                    }
                  >
                    +
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  2026 FPL for {householdSize} person
                  {householdSize > 1 ? "s" : ""}: $
                  {getFPL(householdSize).toLocaleString()}/year
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={goBack} className="gap-1">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
                </Button>
                <Button onClick={goNext} className="flex-1 gap-2">
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Age & Status */}
          {step === 3 && (
            <motion.div key="s3" {...stepAnim} className="space-y-4">
              <div>
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" /> Your Age
                </Label>
                <Input
                  type="number"
                  placeholder="e.g., 35"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="mt-1 w-32"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={hasDisability}
                    onCheckedChange={(c) => setHasDisability(!!c)}
                  />
                  <span className="text-sm flex items-center gap-1.5">
                    <Accessibility className="h-3.5 w-3.5" /> I or a household
                    member has a disability
                  </span>
                </label>
              </div>
              <Separator />
              <div>
                <p className="text-xs font-medium text-foreground mb-2">
                  Household includes (check all that apply):
                </p>
                {[
                  "Pregnant person",
                  "Breastfeeding mother",
                  "Child under 5 in household",
                ].map((cat) => (
                  <label
                    key={cat}
                    className="flex items-center gap-2 py-1 cursor-pointer"
                  >
                    <Checkbox
                      checked={categoricals.includes(cat)}
                      onCheckedChange={(c) => {
                        setCategoricals((prev) =>
                          c ? [...prev, cat] : prev.filter((x) => x !== cat),
                        );
                      }}
                    />
                    <span className="text-sm">{cat}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={goBack} className="gap-1">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
                </Button>
                <Button onClick={() => setStep(4)} className="flex-1 gap-2">
                  See My Results <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Results */}
          {step === 4 && (
            <motion.div key="s4" {...stepAnim} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">
                  {results.length > 0
                    ? `You may qualify for ${results.length} program${results.length > 1 ? "s" : ""}`
                    : "No programs matched your criteria"}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={reset}
                  className="text-xs gap-1"
                >
                  <RotateCcw className="h-3 w-3" /> Start Over
                </Button>
              </div>

              <div className="bg-muted/50 rounded-md px-3 py-2 text-[11px] text-muted-foreground">
                Household: {householdSize} · Income: $
                {annualIncome.toLocaleString()}/yr · {fplPct.toFixed(0)}% FPL
                {ageNum > 0 && ` · Age: ${ageNum}`}
              </div>

              {results.length === 0 && (
                <div className="text-center py-6 space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Based on your inputs, no programs matched. Try adjusting
                    your income or household size, or call{" "}
                    <a
                      href="tel:211"
                      className="text-primary font-semibold hover:underline"
                    >
                      2-1-1
                    </a>{" "}
                    for personalized help.
                  </p>
                </div>
              )}

              {results.map((prog) => (
                <Card key={prog.id} className="border-primary/10">
                  <CardContent className="py-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            className={`text-[10px] ${CATEGORY_COLORS[prog.category]}`}
                          >
                            {prog.category}
                          </Badge>
                          <h4 className="text-sm font-bold text-foreground">
                            {prog.name}
                          </h4>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {prog.description}
                        </p>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                    </div>

                    {/* Document Checklist */}
                    <div className="bg-muted/30 rounded-md p-3 space-y-1.5">
                      <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-primary" />
                        Documents to gather before applying:
                      </p>
                      {prog.requiredDocs.map((doc, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-xs text-muted-foreground"
                        >
                          <div className="h-4 w-4 rounded border border-border flex items-center justify-center shrink-0">
                            <span className="text-[9px]">{i + 1}</span>
                          </div>
                          {doc}
                        </div>
                      ))}
                    </div>

                    <Button size="sm" asChild className="w-full gap-1.5">
                      <a
                        href={prog.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {prog.applyLabel} <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}

              <div className="rounded-md border border-border bg-muted/30 px-3 py-2">
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  This screener is for informational purposes only. Final
                  eligibility is determined by MDHHS. No data is stored.
                </p>
              </div>

              <Button
                variant="outline"
                onClick={goBack}
                className="gap-1 text-xs"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Step 3
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
