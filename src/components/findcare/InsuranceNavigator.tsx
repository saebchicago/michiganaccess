/**
 * InsuranceNavigator — 3-step wizard to help users identify their likely
 * insurance pathway: Medicare, Medicaid, FQHC sliding-fee, or Private/BCBS.
 * Now includes ZIP-aware area hints on the results step.
 */
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight, ArrowLeft, RotateCcw, ShieldCheck, ExternalLink,
  CalendarCheck, Calculator, FileUp, BookOpen, HelpCircle, Users,
  DollarSign, Briefcase, Heart, Building2, MapPin, Info,
} from "lucide-react";
import { useCounty } from "@/contexts/CountyContext";
import { getCountyProfile } from "@/data/michigan-county-profiles";
import { getCountyCrossDomain } from "@/data/cross-domain-indicators";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight, ArrowLeft, RotateCcw, ShieldCheck, ExternalLink,
  CalendarCheck, Calculator, FileUp, BookOpen, HelpCircle, Users,
  DollarSign, Briefcase, Heart, Building2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/* ── Helpers ───────────────────────────────────── */

const FPL_2026: Record<number, number> = {
  1: 15960, 2: 21640, 3: 27320, 4: 33000,
  5: 38680, 6: 44360, 7: 50040, 8: 55720,
};
const FPL_EXTRA = 5680;
function getFPL(size: number) {
  if (size <= 8) return FPL_2026[size] ?? FPL_2026[1];
  return FPL_2026[8] + (size - 8) * FPL_EXTRA;
}

function JargonTip({ term, definition }: { term: string; definition: string }) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="underline decoration-dotted decoration-muted-foreground/50 cursor-help">{term}</span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-xs leading-relaxed">
          {definition}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

const stepAnim = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, x: -24, transition: { duration: 0.12 } },
};

type Pathway = "medicare" | "medicaid" | "fqhc" | "private";

/* ── Sliding-fee calculator sub-component ──────── */
function SlidingFeeCalc() {
  const [hhSize, setHhSize] = useState(1);
  const [income, setIncome] = useState("");

  const fpl = getFPL(hhSize);
  const annual = parseFloat(income) || 0;
  const pct = fpl > 0 ? (annual / fpl) * 100 : 0;

  let category = "—";
  let desc = "Enter your income above.";
  if (annual > 0) {
    if (pct <= 100) { category = "A"; desc = "Nominal fee — you pay very little for most services."; }
    else if (pct <= 150) { category = "B"; desc = "Reduced fee — a moderate discount off the full price."; }
    else if (pct <= 200) { category = "C"; desc = "Partial discount — you still pay less than full price."; }
    else { category = "Full"; desc = "Income above 200% FPL — full price, but payment plans may be available."; }
  }

  return (
    <div className="space-y-3 mt-2">
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <Label className="text-xs">Household size</Label>
          <Select value={String(hhSize)} onValueChange={v => setHhSize(Number(v))}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[1,2,3,4,5,6,7,8].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Label className="text-xs">Annual income ($)</Label>
          <Input type="number" placeholder="0" value={income} onChange={e => setIncome(e.target.value)} className="h-8 text-xs" />
        </div>
      </div>
      <div className="rounded-lg border-2 border-dashed border-border bg-muted/30 p-3 text-center space-y-1">
        <p className="text-lg font-bold text-foreground tabular-nums">Category {category}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
        {annual > 0 && <p className="text-[10px] text-muted-foreground">{pct.toFixed(0)}% of FPL (${fpl.toLocaleString()}/yr for {hhSize})</p>}
      </div>
    </div>
  );
}

/* ── Main component ────────────────────────────── */
export default function InsuranceNavigator() {
  const [step, setStep] = useState(1);

  // Step 1
  const [age65Plus, setAge65Plus] = useState(false);
  const [hasDisability, setHasDisability] = useState(false);

  // Step 2
  const [householdSize, setHouseholdSize] = useState(1);
  const [annualIncome, setAnnualIncome] = useState("");

  // Step 3
  const [hasEmployerCoverage, setHasEmployerCoverage] = useState(false);

  const incomeNum = parseFloat(annualIncome) || 0;
  const fpl = getFPL(householdSize);
  const fplPct = fpl > 0 ? (incomeNum / fpl) * 100 : 0;

  const pathways = useMemo<Pathway[]>(() => {
    const out: Pathway[] = [];
    if (age65Plus || hasDisability) out.push("medicare");
    if (incomeNum > 0 && fplPct <= 133) out.push("medicaid");
    if (incomeNum > 0 && fplPct <= 200 && !out.includes("medicaid")) out.push("fqhc");
    if (incomeNum === 0 && !age65Plus && !hasDisability) out.push("fqhc"); // default safety net
    if (hasEmployerCoverage) out.push("private");
    if (out.length === 0) out.push("private"); // fallback
    return out;
  }, [age65Plus, hasDisability, incomeNum, fplPct, hasEmployerCoverage]);

  const reset = () => { setStep(1); setAge65Plus(false); setHasDisability(false); setHouseholdSize(1); setAnnualIncome(""); setHasEmployerCoverage(false); };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Insurance Navigator
          <Badge variant="outline" className="text-[10px] ml-auto">3-Step Guide</Badge>
        </CardTitle>
        <p className="text-xs text-muted-foreground">Answer a few questions to see which coverage options may fit you. No data is stored.</p>
      </CardHeader>

      <div className="px-6 pb-2">
        <Progress value={(step / 4) * 100} className="h-1.5" />
        <div className="flex justify-between mt-1">
          {["Age & Status", "Income", "Employment", "Your Options"].map((l, i) => (
            <span key={l} className={`text-[10px] ${step > i ? "text-primary font-medium" : "text-muted-foreground"}`}>{l}</span>
          ))}
        </div>
      </div>

      <CardContent className="pt-4 min-h-[280px]">
        <AnimatePresence mode="wait">
          {/* ── Step 1: Age / Disability ── */}
          {step === 1 && (
            <motion.div key="s1" {...stepAnim} className="space-y-4">
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-1.5"><Heart className="h-4 w-4" /> Medicare eligibility check</Label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={age65Plus} onCheckedChange={c => setAge65Plus(!!c)} />
                  <span className="text-sm">I am 65 or older</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={hasDisability} onCheckedChange={c => setHasDisability(!!c)} />
                  <span className="text-sm">I or a household member has a qualifying disability</span>
                </label>
              </div>
              <Button onClick={() => setStep(2)} className="w-full gap-2">Next <ChevronRight className="h-4 w-4" /></Button>
            </motion.div>
          )}

          {/* ── Step 2: Income ── */}
          {step === 2 && (
            <motion.div key="s2" {...stepAnim} className="space-y-4">
              <div>
                <Label className="text-sm font-medium flex items-center gap-1.5"><DollarSign className="h-4 w-4" /> Household income</Label>
                <p className="text-xs text-muted-foreground mb-2">Used to check Medicaid and FQHC sliding-fee eligibility.</p>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label className="text-xs">Household size</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => setHouseholdSize(Math.max(1, householdSize - 1))}>−</Button>
                      <span className="text-lg font-bold w-8 text-center tabular-nums">{householdSize}</span>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => setHouseholdSize(Math.min(12, householdSize + 1))}>+</Button>
                    </div>
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs">Annual income ($)</Label>
                    <div className="relative mt-1">
                      <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input type="number" placeholder="0" value={annualIncome} onChange={e => setAnnualIncome(e.target.value)} className="pl-8 h-8" />
                    </div>
                  </div>
                </div>
                {incomeNum > 0 && (
                  <p className="text-xs text-muted-foreground mt-2 tabular-nums">
                    ≈ {fplPct.toFixed(0)}% of Federal Poverty Level · FPL for {householdSize}: ${fpl.toLocaleString()}/yr
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="gap-1"><ArrowLeft className="h-3.5 w-3.5" /> Back</Button>
                <Button onClick={() => setStep(3)} className="flex-1 gap-2">Next <ChevronRight className="h-4 w-4" /></Button>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Employment ── */}
          {step === 3 && (
            <motion.div key="s3" {...stepAnim} className="space-y-4">
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-1.5"><Briefcase className="h-4 w-4" /> Employer coverage</Label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={hasEmployerCoverage} onCheckedChange={c => setHasEmployerCoverage(!!c)} />
                  <span className="text-sm">I have (or am offered) employer-sponsored insurance</span>
                </label>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)} className="gap-1"><ArrowLeft className="h-3.5 w-3.5" /> Back</Button>
                <Button onClick={() => setStep(4)} className="flex-1 gap-2">See My Options <ChevronRight className="h-4 w-4" /></Button>
              </div>
            </motion.div>
          )}

          {/* ── Step 4: Results ── */}
          {step === 4 && (
            <motion.div key="s4" {...stepAnim} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold">Your likely coverage options</h3>
                <Button variant="ghost" size="sm" onClick={reset} className="text-xs gap-1"><RotateCcw className="h-3 w-3" /> Start Over</Button>
              </div>

              <div className="rounded-md bg-muted/50 px-3 py-2 text-[11px] text-muted-foreground tabular-nums">
                Household: {householdSize} · Income: ${incomeNum.toLocaleString()}/yr · {fplPct.toFixed(0)}% FPL
                {age65Plus && " · 65+"}{hasDisability && " · Disability"}{hasEmployerCoverage && " · Employer coverage"}
              </div>

              {/* ── Medicare ── */}
              {pathways.includes("medicare") && (
                <ResultCard
                  icon={Heart} title="Medicare" color="bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300"
                  body={<>
                    <p className="text-xs text-muted-foreground">Federal health insurance for people 65+ or with qualifying disabilities. Covers hospital stays, doctor visits, and prescriptions.</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Button size="sm" asChild className="gap-1.5">
                        <a href="https://www.medicare.gov/plan-compare" target="_blank" rel="noopener noreferrer">
                          <CalendarCheck className="h-3 w-3" /> Check Enrollment Dates <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                      <Button size="sm" variant="outline" asChild className="gap-1.5">
                        <a href="https://www.medicare.gov/plan-compare/#/?lang=en&year=2026" target="_blank" rel="noopener noreferrer">
                          Medicare Plan Finder <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                    <JargonRow />
                  </>}
                />
              )}

              {/* ── Medicaid ── */}
              {pathways.includes("medicaid") && (
                <ResultCard
                  icon={ShieldCheck} title="Medicaid (Healthy Michigan Plan)" color="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                  body={<>
                    <p className="text-xs text-muted-foreground">Free or low-cost coverage for adults 19–64 with income up to 133% FPL. Covers doctor visits, prescriptions, mental health, and more.</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Button size="sm" asChild className="gap-1.5">
                        <a href="https://newmibridges.michigan.gov/" target="_blank" rel="noopener noreferrer">
                          Start MI Bridges Application <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="sm" variant="outline" className="gap-1.5"><HelpCircle className="h-3 w-3" /> Check Income Limits</Button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs text-xs space-y-1">
                            <p className="font-semibold">2026 Medicaid income limits (133% FPL):</p>
                            <p>1 person: $21,227 · 2: $28,781 · 3: $36,336 · 4: $43,890</p>
                            <p className="text-muted-foreground">These are approximate. Final eligibility is determined by MDHHS.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <JargonRow />
                  </>}
                />
              )}

              {/* ── FQHC ── */}
              {pathways.includes("fqhc") && (
                <ResultCard
                  icon={Building2} title="Community Health Center (FQHC)" color="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                  body={<>
                    <p className="text-xs text-muted-foreground">Federally Qualified Health Centers serve everyone, regardless of insurance. Fees are based on a sliding scale tied to your income.</p>
                    <Separator className="my-2" />
                    <p className="text-xs font-semibold flex items-center gap-1"><Calculator className="h-3 w-3 text-primary" /> Calculate My Discount</p>
                    <SlidingFeeCalc />
                  </>}
                />
              )}

              {/* ── Private / BCBS ── */}
              {pathways.includes("private") && (
                <ResultCard
                  icon={Briefcase} title="Private / Employer Insurance" color="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
                  body={<>
                    <p className="text-xs text-muted-foreground">Employer-sponsored or marketplace plans (e.g., BCBS of Michigan). Coverage details vary by plan.</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <div className="flex-1 min-w-[180px] rounded-lg border-2 border-dashed border-border bg-muted/30 p-4 text-center space-y-1">
                        <FileUp className="h-5 w-5 mx-auto text-muted-foreground/50" />
                        <p className="text-xs font-medium text-muted-foreground">Upload EOB for Review</p>
                        <p className="text-[10px] text-muted-foreground/60">📊 Coming soon</p>
                      </div>
                      <Button size="sm" variant="outline" asChild className="gap-1.5 self-start">
                        <a href="/health/insurance-appeals">
                          <BookOpen className="h-3 w-3" /> Simple Guide to Appeals
                        </a>
                      </Button>
                    </div>
                    <JargonRow />
                  </>}
                />
              )}

              {/* ── ZIP-Aware Area Hints ── */}
              <AreaHints />

              <div className="rounded-md border border-border bg-muted/30 px-3 py-2">
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  For guidance only. Final eligibility is determined by the insurer or MDHHS. No data is stored.
                </p>
              </div>

              <Button variant="outline" onClick={() => setStep(3)} className="gap-1 text-xs">
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

/* ── Small presentational helpers ──────────────── */
function ResultCard({ icon: Icon, title, color, body }: { icon: React.ElementType; title: string; color: string; body: React.ReactNode }) {
  return (
    <Card className="border-primary/10">
      <CardContent className="py-4 space-y-2">
        <div className="flex items-center gap-2">
          <Badge className={`text-[10px] ${color}`}>{title}</Badge>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        {body}
      </CardContent>
    </Card>
  );
}

function JargonRow() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-[11px] text-muted-foreground">
      <JargonTip term="Deductible" definition="The amount you pay out of pocket each year before your insurance starts to help pay. Think of it like a 'threshold' you cross first." />
      <JargonTip term="Co-pay" definition="A fixed amount (like $20) you pay each time you visit the doctor. The insurance pays the rest." />
      <JargonTip term="Premium" definition="The monthly bill you pay just to have the insurance — even if you don't use it that month." />
      <JargonTip term="EOB" definition="Explanation of Benefits — a paper your insurance sends after a visit that shows what they paid and what you owe." />
    </div>
  );
}
