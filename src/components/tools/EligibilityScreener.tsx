import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { CheckCircle2, ArrowRight, Info, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const FPL_2024: Record<number, number> = { 1: 15060, 2: 20440, 3: 25820, 4: 31200, 5: 36580 };
function fpl(size: number): number { return FPL_2024[Math.min(size, 5)] || 31200; }

interface Program { name: string; maxIncomePct: number; conditions?: string[]; href: string; desc: string; }

const PROGRAMS: Program[] = [
  { name: "Healthy Michigan Plan (Medicaid)", maxIncomePct: 138, conditions: [], href: "/find-care", desc: "Free or low-cost health coverage" },
  { name: "SNAP (Food Assistance)", maxIncomePct: 200, conditions: [], href: "/resources", desc: "Monthly food benefits via MI Bridges" },
  { name: "WIC", maxIncomePct: 185, conditions: ["children", "pregnant"], href: "/financial-help", desc: "Nutrition for pregnant/postpartum + children under 5" },
  { name: "LIHEAP (Heating Assistance)", maxIncomePct: 150, conditions: [], href: "/environment#programs", desc: "Up to $2,205 for heating bills" },
  { name: "MiHER Energy Rebates", maxIncomePct: 150, conditions: [], href: "/environment#programs", desc: "Up to $34K/household for energy upgrades" },
  { name: "Head Start", maxIncomePct: 100, conditions: ["children"], href: "/resources", desc: "Free preschool for income-eligible families" },
  { name: "MIChild (CHIP)", maxIncomePct: 212, conditions: ["children"], href: "/find-care", desc: "Health coverage for uninsured children" },
  { name: "Free/Reduced School Lunch", maxIncomePct: 185, conditions: ["children"], href: "/resources", desc: "Free or reduced meals at school" },
  { name: "Medicare Savings (QMB)", maxIncomePct: 135, conditions: ["senior"], href: "/find-care", desc: "Help with Medicare premiums and copays" },
  { name: "Property Tax Credit", maxIncomePct: 420, conditions: [], href: "/financial-help", desc: "Homeowners with income under $63,000" },
];

type Step = "size" | "income" | "conditions" | "results";

export default function EligibilityScreener() {
  const [step, setStep] = useState<Step>("size");
  const [householdSize, setHouseholdSize] = useState(0);
  const [incomeBracket, setIncomeBracket] = useState("");
  const [conditions, setConditions] = useState<string[]>([]);

  const incomeEstimate = useMemo(() => {
    const map: Record<string, number> = {
      "under-15k": 12000, "15-25k": 20000, "25-40k": 32000,
      "40-60k": 50000, "60-80k": 70000, "80k+": 90000,
    };
    return map[incomeBracket] || 0;
  }, [incomeBracket]);

  const qualifying = useMemo(() => {
    if (!householdSize || !incomeBracket) return [];
    const threshold = fpl(householdSize);
    const incomePctFPL = (incomeEstimate / threshold) * 100;
    return PROGRAMS.filter((p) => {
      if (incomePctFPL > p.maxIncomePct) return false;
      if (p.conditions?.length) {
        return p.conditions.some((c) => conditions.includes(c));
      }
      return true;
    });
  }, [householdSize, incomeBracket, conditions, incomeEstimate]);

  const reset = () => { setStep("size"); setHouseholdSize(0); setIncomeBracket(""); setConditions([]); };

  return (
    <Card id="screener" className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-5 w-5 text-primary" /> Quick Eligibility Check
        </CardTitle>
        <CardDescription>See what programs you might qualify for. No data stored.</CardDescription>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {step === "size" && (
            <motion.div key="size" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="text-sm font-medium text-foreground mb-3">How many people in your household?</p>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Button key={n} variant={householdSize === n ? "default" : "outline"} size="sm"
                    onClick={() => { setHouseholdSize(n); setStep("income"); }}>
                    {n}{n === 5 ? "+" : ""}
                  </Button>
                ))}
              </div>
            </motion.div>
          )}

          {step === "income" && (
            <motion.div key="income" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="text-sm font-medium text-foreground mb-3">Approximate annual household income?</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Under $15K", value: "under-15k" },
                  { label: "$15-25K", value: "15-25k" },
                  { label: "$25-40K", value: "25-40k" },
                  { label: "$40-60K", value: "40-60k" },
                  { label: "$60-80K", value: "60-80k" },
                  { label: "$80K+", value: "80k+" },
                ].map((b) => (
                  <Button key={b.value} variant={incomeBracket === b.value ? "default" : "outline"} size="sm"
                    onClick={() => { setIncomeBracket(b.value); setStep("conditions"); }}>
                    {b.label}
                  </Button>
                ))}
              </div>
            </motion.div>
          )}

          {step === "conditions" && (
            <motion.div key="conditions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="text-sm font-medium text-foreground mb-3">Any of these apply? (optional)</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  { label: "Children under 18", value: "children" },
                  { label: "Pregnant", value: "pregnant" },
                  { label: "Age 65+", value: "senior" },
                  { label: "Disability", value: "disability" },
                  { label: "Veteran", value: "veteran" },
                  { label: "Recently lost job", value: "job_loss" },
                  { label: "Returning from incarceration", value: "reentry" },
                ].map((c) => (
                  <Button key={c.value} size="sm"
                    variant={conditions.includes(c.value) ? "default" : "outline"}
                    onClick={() => setConditions((prev) =>
                      prev.includes(c.value) ? prev.filter((x) => x !== c.value) : [...prev, c.value]
                    )}>
                    {c.label}
                  </Button>
                ))}
              </div>
              <Button onClick={() => setStep("results")}>See Results</Button>
            </motion.div>
          )}

          {step === "results" && (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">
                  {qualifying.length} program{qualifying.length !== 1 ? "s" : ""} you may qualify for
                </p>
                <Button variant="ghost" size="sm" onClick={reset} className="text-xs">Start Over</Button>
              </div>
              {qualifying.map((p) => (
                <Link key={p.name} to={p.href} className="block rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-michigan-forest shrink-0" />
                    <span className="text-sm font-medium text-foreground">{p.name}</span>
                    <Badge variant="outline" className="text-[8px] ml-auto shrink-0">May qualify</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 ml-6">{p.desc}</p>
                </Link>
              ))}
              {qualifying.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Based on these inputs, no standard programs matched. Call 211 — they may know about local programs.
                </p>
              )}
              <div className="rounded-lg border border-border bg-muted/30 p-3 flex items-start gap-2">
                <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-[10px] text-muted-foreground">
                  This is a pre-screening tool only. It does not determine actual eligibility. Contact each program or call 211 to confirm.
                  Zero personal data is stored — all calculation happens in your browser.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
