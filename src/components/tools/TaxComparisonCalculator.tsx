import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { DollarSign, ArrowRight, Share2, Info, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { calculateTaxBurden, type TaxBreakdown } from "@/lib/tax-calculator";
import { CITIES } from "@/data/michigan-taxes";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import { toast } from "sonner";

function fmt(n: number) { return `$${n.toLocaleString()}`; }

function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function DiffCell({ a, b }: { a: number; b: number }) {
  const diff = b - a;
  if (Math.abs(diff) < 10) return <span className="text-muted-foreground">—</span>;
  return <span className={diff < 0 ? "text-michigan-forest font-semibold" : "text-michigan-coral"}>{diff < 0 ? "-" : "+"}${Math.abs(diff).toLocaleString()}</span>;
}

export default function TaxComparisonCalculator() {
  const [salaryInput, setSalaryInput] = useState(80000);
  const salary = useDebounced(salaryInput, 300);
  const [status, setStatus] = useState<"single" | "married">("single");
  const [deps, setDeps] = useState(0);
  const [cityA, setCityA] = useState("Detroit");
  const [cityB, setCityB] = useState("Troy");
  const [homeValueA, setHomeValueA] = useState<string>("");
  const [homeValueB, setHomeValueB] = useState<string>("");
  const [hoaA, setHoaA] = useState<string>("");
  const [hoaB, setHoaB] = useState<string>("");

  const taxA = useMemo(() => calculateTaxBurden({
    annualSalary: salary, filingStatus: status, dependents: deps, city: cityA, isResident: true,
    homeValue: homeValueA ? parseInt(homeValueA) : undefined,
  }), [salary, status, deps, cityA, homeValueA]);

  const taxB = useMemo(() => calculateTaxBurden({
    annualSalary: salary, filingStatus: status, dependents: deps, city: cityB, isResident: true,
    homeValue: homeValueB ? parseInt(homeValueB) : undefined,
  }), [salary, status, deps, cityB, homeValueB]);

  const hoaAnnualA = hoaA ? parseInt(hoaA) * 12 : 0;
  const hoaAnnualB = hoaB ? parseInt(hoaB) * 12 : 0;

  const chartData = [
    { name: cityA, Federal: taxA.federal, State: taxA.stateIncome, City: taxA.cityIncome, Property: taxA.propertyTax, FICA: taxA.fica, Sales: taxA.salesTax },
    { name: cityB, Federal: taxB.federal, State: taxB.stateIncome, City: taxB.cityIncome, Property: taxB.propertyTax, FICA: taxB.fica, Sales: taxB.salesTax },
  ];

  const totalDiff = taxA.totalTax - taxB.totalTax;
  const biggestFactor = taxA.cityIncome !== taxB.cityIncome ? "city income tax" : taxA.propertyTax > taxB.propertyTax ? "property tax" : "overall taxes";

  const handleShare = () => {
    const url = `${window.location.origin}/tax-comparison?salary=${salary}&cityA=${cityA}&cityB=${cityB}&status=${status}&deps=${deps}`;
    navigator.clipboard.writeText(url).then(() => toast.success("Link copied"));
  };

  const handleCSVDownload = useCallback(() => {
    const headers = ["Category", cityA, cityB, "Difference"];
    const dataRows = [
      ["Federal Income Tax", taxA.federal, taxB.federal, taxB.federal - taxA.federal],
      ["FICA (SS + Medicare)", taxA.fica, taxB.fica, taxB.fica - taxA.fica],
      ["Michigan State Tax", taxA.stateIncome, taxB.stateIncome, taxB.stateIncome - taxA.stateIncome],
      ["City Income Tax", taxA.cityIncome, taxB.cityIncome, taxB.cityIncome - taxA.cityIncome],
      ["Property Tax (est.)", taxA.propertyTax, taxB.propertyTax, taxB.propertyTax - taxA.propertyTax],
      ["Sales Tax (est.)", taxA.salesTax, taxB.salesTax, taxB.salesTax - taxA.salesTax],
      ...(hoaAnnualA || hoaAnnualB ? [["HOA Fees", hoaAnnualA, hoaAnnualB, hoaAnnualB - hoaAnnualA]] : []),
      ["Total Tax", taxA.totalTax, taxB.totalTax, taxB.totalTax - taxA.totalTax],
      ["Auto Insurance (est.)", taxA.autoInsurance, taxB.autoInsurance, taxB.autoInsurance - taxA.autoInsurance],
      ["Take-Home Pay", taxA.takeHomePay, taxB.takeHomePay, taxB.takeHomePay - taxA.takeHomePay],
      ["Effective Rate", `${taxA.effectiveRate}%`, `${taxB.effectiveRate}%`, ""],
    ];
    const csv = [headers, ...dataRows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tax-comparison-${cityA}-vs-${cityB}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded");
  }, [cityA, cityB, taxA, taxB, hoaAnnualA, hoaAnnualB]);

  const rows: { label: string; a: number; b: number }[] = [
    { label: "Federal Income Tax", a: taxA.federal, b: taxB.federal },
    { label: "FICA (SS + Medicare)", a: taxA.fica, b: taxB.fica },
    { label: "Michigan State Tax", a: taxA.stateIncome, b: taxB.stateIncome },
    { label: "City Income Tax", a: taxA.cityIncome, b: taxB.cityIncome },
    { label: "Property Tax (est.)", a: taxA.propertyTax, b: taxB.propertyTax },
    { label: "Sales Tax (est.)", a: taxA.salesTax, b: taxB.salesTax },
    ...(hoaAnnualA || hoaAnnualB ? [{ label: "HOA Fees", a: hoaAnnualA, b: hoaAnnualB }] : []),
  ];

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="h-5 w-5 text-michigan-gold" /> Michigan Tax Comparison
          </CardTitle>
          <CardDescription>Same salary, two locations — see how much you'd keep.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Annual Salary</label>
              <Input type="number" aria-label="Annual salary" value={salaryInput} onChange={(e) => setSalaryInput(parseInt(e.target.value) || 0)} className="font-mono" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Filing Status</label>
              <div className="flex gap-2">
                {(["single", "married"] as const).map((s) => (
                  <Button key={s} variant={status === s ? "default" : "outline"} size="sm" onClick={() => setStatus(s)} className="flex-1 text-xs capitalize">{s}</Button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Dependents</label>
              <Input type="number" aria-label="Number of dependents" min={0} max={10} value={deps} onChange={(e) => setDeps(parseInt(e.target.value) || 0)} />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Location A</label>
                <Select value={cityA} onValueChange={setCityA}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Home Value</label>
                  <Input type="number" placeholder="Median" value={homeValueA} onChange={(e) => setHomeValueA(e.target.value)} className="text-xs" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">HOA /mo</label>
                  <Input type="number" placeholder="0" value={hoaA} onChange={(e) => setHoaA(e.target.value)} className="text-xs" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Location B</label>
                <Select value={cityB} onValueChange={setCityB}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Home Value</label>
                  <Input type="number" placeholder="Median" value={homeValueB} onChange={(e) => setHomeValueB(e.target.value)} className="text-xs" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">HOA /mo</label>
                  <Input type="number" placeholder="0" value={hoaB} onChange={(e) => setHoaB(e.target.value)} className="text-xs" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardContent className="p-5">
            {/* Summary */}
            <div className="grid gap-4 sm:grid-cols-3 mb-6">
              <div className="rounded-lg border border-border p-3 text-center">
                <p className="text-xs text-muted-foreground">{cityA} Total Tax</p>
                <AnimatedCounter value={taxA.totalTax} prefix="$" className="text-xl font-bold text-foreground" />
              </div>
              <div className="rounded-lg border border-border p-3 text-center">
                <p className="text-xs text-muted-foreground">{cityB} Total Tax</p>
                <AnimatedCounter value={taxB.totalTax} prefix="$" className="text-xl font-bold text-foreground" />
              </div>
              <div className={`rounded-lg border p-3 text-center ${totalDiff > 0 ? "border-michigan-forest/30 bg-michigan-forest/5" : "border-michigan-coral/30 bg-michigan-coral/5"}`}>
                <p className="text-xs text-muted-foreground">Difference</p>
                <p className={`text-xl font-bold ${totalDiff > 0 ? "text-michigan-forest" : "text-michigan-coral"}`}>
                  {totalDiff > 0 ? "-" : "+"}${Math.abs(totalDiff).toLocaleString()}/yr
                </p>
                <p className="text-[10px] text-muted-foreground">{totalDiff > 0 ? `${cityB} saves you` : `${cityA} saves you`}</p>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border text-left">
                  <th className="pb-2 text-xs text-muted-foreground">Category</th>
                  <th className="pb-2 text-xs text-right">{cityA}</th>
                  <th className="pb-2 text-xs text-right">{cityB}</th>
                  <th className="pb-2 text-xs text-right">Diff</th>
                </tr></thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.label} className="border-b border-border/50">
                      <td className="py-2 text-xs text-foreground">{r.label}</td>
                      <td className="py-2 text-xs text-right tabular-nums">{fmt(r.a)}</td>
                      <td className="py-2 text-xs text-right tabular-nums">{fmt(r.b)}</td>
                      <td className="py-2 text-xs text-right"><DiffCell a={r.a} b={r.b} /></td>
                    </tr>
                  ))}
                  <tr className="font-semibold">
                    <td className="py-2 text-xs">TOTAL TAX</td>
                    <td className="py-2 text-xs text-right">{fmt(taxA.totalTax + hoaAnnualA)}</td>
                    <td className="py-2 text-xs text-right">{fmt(taxB.totalTax + hoaAnnualB)}</td>
                    <td className="py-2 text-xs text-right"><DiffCell a={taxA.totalTax + hoaAnnualA} b={taxB.totalTax + hoaAnnualB} /></td>
                  </tr>
                  <tr>
                    <td className="py-2 text-xs text-muted-foreground">Auto Insurance (est.)</td>
                    <td className="py-2 text-xs text-right text-muted-foreground">{fmt(taxA.autoInsurance)}</td>
                    <td className="py-2 text-xs text-right text-muted-foreground">{fmt(taxB.autoInsurance)}</td>
                    <td className="py-2 text-xs text-right"><DiffCell a={taxA.autoInsurance} b={taxB.autoInsurance} /></td>
                  </tr>
                  <tr className="font-bold text-primary">
                    <td className="py-2 text-xs">YOU KEEP</td>
                    <td className="py-2 text-xs text-right">{fmt(taxA.takeHomePay - hoaAnnualA)}</td>
                    <td className="py-2 text-xs text-right">{fmt(taxB.takeHomePay - hoaAnnualB)}</td>
                    <td className="py-2 text-xs text-right"><DiffCell a={-(taxA.takeHomePay - hoaAnnualA)} b={-(taxB.takeHomePay - hoaAnnualB)} /></td>
                  </tr>
                  <tr>
                    <td className="py-2 text-xs text-muted-foreground">Effective Rate</td>
                    <td className="py-2 text-xs text-right text-muted-foreground">{taxA.effectiveRate}%</td>
                    <td className="py-2 text-xs text-right text-muted-foreground">{taxB.effectiveRate}%</td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`]} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="Federal" stackId="a" fill="#0A4C95" />
                <Bar dataKey="State" stackId="a" fill="#00A3A1" />
                <Bar dataKey="City" stackId="a" fill="#F59E0B" />
                <Bar dataKey="Property" stackId="a" fill="#2D5F3F" />
                <Bar dataKey="FICA" stackId="a" fill="#6366f1" />
                <Bar dataKey="Sales" stackId="a" fill="#94a3b8" />
              </BarChart>
            </ResponsiveContainer>

            {/* Insight */}
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 mt-4">
              <p className="text-xs text-foreground">
                <strong>Key insight:</strong> Living in {totalDiff > 0 ? cityB : cityA} on a {fmt(salary)} salary saves ~{fmt(Math.abs(totalDiff))}/year in taxes. The biggest factor: {biggestFactor}.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-3">
              <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={handleShare}><Share2 className="h-3 w-3" /> Share</Button>
              <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={handleCSVDownload}><Download className="h-3 w-3" /> CSV</Button>
            </div>

            <div className="flex items-start gap-2 mt-3 text-[9px] text-muted-foreground">
              <Info className="h-3 w-3 shrink-0 mt-0.5" />
              <span>Estimated for educational purposes. Uses representative rates. Property tax based on median home value unless overridden. Auto insurance from 2025 rate filings. Consult a tax professional. Sources: MI Treasury, IRS, city ordinances, Quadrant Info Services.</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
