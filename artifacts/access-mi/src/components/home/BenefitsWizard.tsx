import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Users, CheckCircle2, ArrowRight, ArrowLeft, Sparkles, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

/*
 * Benefits eligibility checker.
 * Three questions (zip, household size, income) → filtered list of programs.
 * Data: LIHEAP, SNAP, Medicaid, MiHER, MEAP, childcare, WIC, MI Saves.
 */

interface Program {
  name: string;
  description: string;
  eligibility: string;
  link: string;
  category: "health" | "food" | "energy" | "housing" | "family";
}

const allPrograms: Program[] = [
  { name: "Healthy Michigan Plan (Medicaid)", description: "Free or low-cost health coverage for adults 19–64.", eligibility: "Income ≤ 138% FPL", link: "/find-care", category: "health" },
  { name: "MIChild", description: "Health coverage for uninsured children under 19.", eligibility: "Income ≤ 212% FPL", link: "/find-care", category: "health" },
  { name: "WIC", description: "Nutrition assistance for pregnant women, new mothers, and children under 5.", eligibility: "Income ≤ 185% FPL", link: "/financial-help", category: "food" },
  { name: "SNAP (Bridge Card)", description: "Monthly food assistance on a Bridge Card for groceries.", eligibility: "Income ≤ 130% FPL", link: "/financial-help", category: "food" },
  { name: "LIHEAP (Heating Assistance)", description: "$183M allocated (FY2025). 434K+ households served for heating, 129K+ for crisis. Benefits up to $2,205.", eligibility: "Income ≤ 150% FPL", link: "/financial-help", category: "energy" },
  { name: "MEAP (Michigan Energy Assistance)", description: "Up to $2,205 for heating bills. $54.5M budget (2025). Now serving 60% SMI (~$61,861/family of 4). Apply via MI Bridges.", eligibility: "Income ≤ 150% FPL", link: "/environment", category: "energy" },
  { name: "Consumers Energy — Helping Neighbors", description: "Free home energy upgrades for income-qualified customers. $600M plan (2024–2025).", eligibility: "Income ≤ 200% FPL", link: "/environment", category: "energy" },
  { name: "MiHER HOMES Rebate", description: "Up to $20,000 for whole-home energy efficiency improvements. 100% covered for 0–80% AMI. HOMES + HEAR = up to $34,000/household.", eligibility: "Income ≤ 150% FPL (max rebate)", link: "/environment", category: "energy" },
  { name: "MiHER HEAR Rebate", description: "Point-of-sale rebates up to $14,000 for heat pumps, stoves, dryers, panel upgrades, and insulation.", eligibility: "Income ≤ 150% FPL", link: "/environment", category: "energy" },
  { name: "Michigan Saves Green Loans", description: "Low-interest financing for solar, HVAC, and insulation. $96.6M financed in 2024. 50,000+ customers served.", eligibility: "All income levels", link: "/environment", category: "energy" },
  { name: "MSHDA Housing Assistance", description: "Rental assistance, homebuyer programs, and foreclosure prevention.", eligibility: "Income ≤ 200% FPL", link: "/resources", category: "housing" },
  { name: "GSRP (Great Start Readiness)", description: "Free preschool for 4-year-olds to prepare for kindergarten.", eligibility: "Income ≤ 250% FPL", link: "/resources", category: "family" },
  { name: "Insurance Appeal Support", description: "Free tools to fight health insurance denials.", eligibility: "All Michigan residents", link: "/health/insurance-appeals", category: "health" },
  { name: "MIHI Broadband Subsidy", description: "Affordable high-speed internet through federal ACP program.", eligibility: "Income ≤ 200% FPL", link: "/environment", category: "energy" },
];

// 2024 Federal Poverty Level guidelines (simplified)
const getFPLThreshold = (householdSize: number): number => {
  const base = 15060;
  const perPerson = 5380;
  return base + perPerson * (householdSize - 1);
};

const getMatchedPrograms = (income: number, householdSize: number): Program[] => {
  const fpl = getFPLThreshold(householdSize);
  const fplPercent = (income / fpl) * 100;

  return allPrograms.filter((p) => {
    if (p.eligibility === "All Michigan residents" || p.eligibility === "All income levels") return true;
    const match = p.eligibility.match(/(\d+)%/);
    if (!match) return true;
    return fplPercent <= parseInt(match[1]);
  });
};

const categoryColors: Record<string, string> = {
  health: "bg-michigan-forest/10 text-michigan-forest",
  food: "bg-accent/10 text-accent",
  energy: "bg-michigan-gold/10 text-michigan-gold",
  housing: "bg-primary/10 text-primary",
  family: "bg-michigan-coral/10 text-michigan-coral",
};

interface BenefitsWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BenefitsWizard = ({ open, onOpenChange }: BenefitsWizardProps) => {
  const [step, setStep] = useState(1);
  const [zip, setZip] = useState("");
  const [householdSize, setHouseholdSize] = useState("");
  const [income, setIncome] = useState("");
  const [results, setResults] = useState<Program[]>([]);

  const reset = () => {
    setStep(1);
    setZip("");
    setHouseholdSize("");
    setIncome("");
    setResults([]);
  };

  const handleNext = () => {
    if (step === 1 && zip.length === 5) setStep(2);
    if (step === 2 && householdSize && income) {
      const matched = getMatchedPrograms(Number(income), Number(householdSize));
      setResults(matched);
      setStep(3);
    }
  };

  const stepLabels = ["Zip Code", "Household Info", "Your Benefits"];

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-primary" />
            Check My Benefits
          </DialogTitle>
          <DialogDescription>
            Answer 2 quick questions. We never store your information.
          </DialogDescription>
        </DialogHeader>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            {stepLabels.map((label, i) => (
              <span key={label} className={step > i ? "text-primary font-medium" : ""}>{label}</span>
            ))}
          </div>
          <Progress value={(step / 3) * 100} className="h-1.5" />
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="zip">Michigan Zip Code</Label>
                <Input
                  id="zip"
                  placeholder="e.g. 48201"
                  value={zip}
                  onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
                  maxLength={5}
                  inputMode="numeric"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">Used only to show local programs. Not saved.</p>
              </div>
              <Button onClick={handleNext} disabled={zip.length !== 5} className="w-full">
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="household">Household Size</Label>
                <Input
                  id="household"
                  placeholder="e.g. 3"
                  value={householdSize}
                  onChange={(e) => setHouseholdSize(e.target.value.replace(/\D/g, "").slice(0, 2))}
                  inputMode="numeric"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="income">Approximate Annual Household Income ($)</Label>
                <Input
                  id="income"
                  placeholder="e.g. 35000"
                  value={income}
                  onChange={(e) => setIncome(e.target.value.replace(/\D/g, ""))}
                  inputMode="numeric"
                />
                <p className="text-xs text-muted-foreground">A rough estimate is fine. This is never stored or shared.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={handleNext} disabled={!householdSize || !income} className="flex-1">
                  See My Benefits <CheckCircle2 className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">
                Based on your info, you may qualify for <strong className="text-foreground">{results.length} programs</strong>:
              </p>
              <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
                {results.map((p) => (
                  <Card key={p.name} className="border-border/60">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-foreground">{p.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{p.description}</p>
                        </div>
                        <Badge className={`shrink-0 text-[10px] ${categoryColors[p.category]}`}>{p.category}</Badge>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-[11px] text-muted-foreground">{p.eligibility}</span>
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-primary" asChild>
                          <a href={p.link}>Details <ArrowRight className="ml-1 h-3 w-3" /></a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground text-center">
                These are estimates only. Final eligibility is determined by each program. No data was stored.
              </p>
              <Button variant="outline" onClick={reset} className="w-full">
                Start Over
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default BenefitsWizard;
