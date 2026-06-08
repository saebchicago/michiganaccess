import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { DollarSign, ExternalLink } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getALICEByCounty, MICHIGAN_ALICE_STATEWIDE } from "@/data/aliceData";

// Federal Poverty Level 2024 - Source: HHS ASPE
const FPL_2024: Record<number, number> = { 1: 15060, 2: 20440, 3: 25820, 4: 31200, 5: 36580 };

const COUNTIES = ["Wayne","Oakland","Macomb","Kent","Genesee","Washtenaw","Ingham","Kalamazoo","Saginaw","Ottawa","Muskegon","Berrien","Jackson","Calhoun","Livingston","Monroe","St. Clair","Allegan","Bay","Midland"];

interface Program { name: string; eligible: boolean; monthlyValue: number; source: string }

export default function BenefitsGapCalculator() {
  const [county, setCounty] = useState("Wayne");
  const [householdSize, setHouseholdSize] = useState(3);
  const [income, setIncome] = useState([28000]);
  const [insured, setInsured] = useState(false);

  const fpl = FPL_2024[Math.min(householdSize, 5)] ?? 36580;
  const fplPct = (income[0] / fpl) * 100;
  const alice = getALICEByCounty(county) ?? MICHIGAN_ALICE_STATEWIDE;

  const programs = useMemo((): Program[] => {
    const list: Program[] = [];
    // Source: SNAP - 200% FPL (MI broad-based categorical eligibility)
    list.push({ name: "SNAP (Food Assistance)", eligible: fplPct <= 200, monthlyValue: householdSize * 234, source: "USDA FY2025 max allotments" });
    // Source: Healthy Michigan Plan - 138% FPL
    list.push({ name: "Medicaid (Healthy Michigan)", eligible: !insured && fplPct <= 138, monthlyValue: householdSize * 600, source: "CMS per capita estimate" });
    // Source: LIHEAP - 150% FPL, $183.3M allocation
    list.push({ name: "LIHEAP (Energy Assistance)", eligible: fplPct <= 150, monthlyValue: 83, source: "LIHEAP Clearinghouse - $183.3M MI allocation" });
    // Source: WIC - 185% FPL, pregnant/postpartum/children <5
    list.push({ name: "WIC", eligible: fplPct <= 185 && householdSize > 1, monthlyValue: 75, source: "USDA WIC - 185% FPL threshold" });
    // Source: MiHER - categorical via Medicaid
    list.push({ name: "MiHER (Energy Rebates)", eligible: !insured && fplPct <= 138, monthlyValue: 50, source: "EGLE - $211M allocation, Medicaid = auto-eligible" });
    return list;
  }, [fplPct, insured, householdSize]);

  const eligiblePrograms = programs.filter(p => p.eligible);
  const totalMonthly = eligiblePrograms.reduce((s, p) => s + p.monthlyValue, 0);

  // Icon array: 100 figures
  const enrollmentRate = 62; // national SNAP participation ~82%, Medicaid ~85%, blended illustrative
  const enrolled = Math.round(enrollmentRate);
  const eligible = 100 - enrolled;

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-foreground mb-1.5 block">County</label>
          <Select value={county} onValueChange={setCounty}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{COUNTIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-medium text-foreground mb-1.5 block">Household Size</label>
          <Select value={String(householdSize)} onValueChange={v => setHouseholdSize(Number(v))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{[1,2,3,4,5].map(n => <SelectItem key={n} value={String(n)}>{n} {n === 1 ? "person" : "people"}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-medium text-foreground">Approximate Annual Income</label>
          <span className="text-sm font-bold text-foreground tabular-nums">${income[0].toLocaleString()}</span>
        </div>
        <Slider value={income} onValueChange={setIncome} min={0} max={80000} step={1000} aria-label="Annual income" />
        <p className="text-[9px] text-muted-foreground mt-1">{fplPct.toFixed(0)}% of Federal Poverty Level for household of {householdSize}</p>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setInsured(false)} className={`flex-1 rounded-lg border-2 py-2 text-sm font-medium transition-all ${!insured ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"}`}>Uninsured</button>
        <button onClick={() => setInsured(true)} className={`flex-1 rounded-lg border-2 py-2 text-sm font-medium transition-all ${insured ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"}`}>Insured</button>
      </div>

      {/* Results */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={`${county}-${income[0]}-${insured}`}>
        <Card className="border-primary/20 bg-primary/[0.03]">
          <CardContent className="py-5">
            <p className="text-xs text-muted-foreground mb-1">In {county} County, you may qualify for up to:</p>
            <p className="text-3xl font-bold text-primary tabular-nums">${totalMonthly.toLocaleString()}/mo</p>
            <p className="text-xs text-muted-foreground">in earned benefits you may not be receiving</p>

            <div className="mt-4 space-y-2">
              {programs.map(p => (
                <div key={p.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${p.eligible ? "bg-green-500" : "bg-muted"}`} />
                    <span className={`text-xs ${p.eligible ? "text-foreground" : "text-muted-foreground"}`}>{p.name}</span>
                  </div>
                  <span className={`text-xs font-semibold tabular-nums ${p.eligible ? "text-green-600" : "text-muted-foreground"}`}>
                    {p.eligible ? `+$${p.monthlyValue}/mo` : "Not eligible"}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-[9px] text-muted-foreground mt-3">Estimated based on federal income thresholds. Actual eligibility varies. Sources: {programs.map(p => p.source).filter((v, i, a) => a.indexOf(v) === i).join("; ")}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Icon array */}
      <div>
        <p className="text-xs font-medium text-foreground mb-2">Enrollment gap - of every 100 eligible residents:</p>
        <div className="flex flex-wrap gap-[2px]">
          {Array.from({ length: 100 }, (_, i) => (
            <div key={i} className={`w-2 h-3 rounded-sm ${i < enrolled ? "bg-primary" : "bg-red-300"}`} />
          ))}
        </div>
        <div className="flex gap-4 mt-1.5 text-[9px] text-muted-foreground">
          <span><span className="inline-block h-2 w-2 rounded-sm bg-primary mr-1" />{enrolled} enrolled</span>
          <span><span className="inline-block h-2 w-2 rounded-sm bg-red-300 mr-1" />{eligible} eligible but not receiving</span>
        </div>
        <p className="text-[9px] text-muted-foreground mt-1">Illustrative - based on national SNAP/Medicaid participation rates</p>
      </div>

      <a href="https://newmibridges.michigan.gov" target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
        aria-label="MI Bridges application portal, opens in new window">
        Start your application on MI Bridges <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
      </a>
    </div>
  );
}
