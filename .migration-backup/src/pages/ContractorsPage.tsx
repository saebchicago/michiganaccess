import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, ArrowLeft, Loader2, Search, Info, ExternalLink } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useMichiganContractors } from "@/hooks/useFederalContractors";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }) };
const COUNTIES = ["Wayne", "Oakland", "Macomb", "Kent", "Genesee", "Washtenaw", "Ingham", "Kalamazoo", "Saginaw"];

export default function ContractorsPage() {
  usePageMeta({ title: "Federal Contractors — Access Michigan", description: "Every federal contract awarded in Michigan — searchable by county. Live USASpending.gov data.", path: "/transparency/contractors" });

  const [county, setCounty] = useState<string | undefined>(undefined);
  const { data: contractors, isLoading } = useMichiganContractors(county);

  const totalAwarded = contractors?.reduce((s, c) => s + c.totalAwardsFY2024, 0) ?? 0;

  return (
    <Layout>
      <Breadcrumbs items={[{ label: "Transparency", href: "/transparency" }, { label: "Federal Contractors" }]} />

      <section className="relative overflow-hidden bg-slate-900 py-12 md:py-16">
        <div className="container">
          <motion.div initial="hidden" animate="visible" className="mx-auto max-w-3xl text-center">
            <motion.div variants={fadeUp} custom={0} className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-1.5">
              <Building2 className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-medium text-amber-400">Federal Contractors</span>
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1} className="mb-4 text-3xl font-bold text-white md:text-4xl">Federal Contracts in Michigan</motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-base text-slate-300">Every federal contract, every award, every recipient — reported by law under the DATA Act. $14.2B flowed to Michigan in FY2024.</motion.p>
            <motion.p variants={fadeUp} custom={3} className="text-xs text-slate-500 mt-2">Source: USASpending.gov FY2024</motion.p>
          </motion.div>
        </div>
      </section>

      <div className="container py-10 space-y-8">
        {/* County selector */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Search className="h-4 w-4 text-primary" /> Search by County</CardTitle>
            <p className="text-xs text-muted-foreground">Select a county to see top federal contract recipients. Live data from USASpending.gov.</p>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Select value={county ?? "all"} onValueChange={v => setCounty(v === "all" ? undefined : v)}>
                <SelectTrigger className="w-52"><SelectValue placeholder="All Michigan" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Michigan</SelectItem>
                  {COUNTIES.map(c => <SelectItem key={c} value={c}>{c} County</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {isLoading && <div className="flex items-center gap-2 text-sm text-muted-foreground py-6"><Loader2 className="h-4 w-4 animate-spin" /> Querying USASpending.gov API...</div>}

            {contractors && contractors.length > 0 && (
              <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 mb-4">
                  <div className="rounded-lg border border-border p-3 text-center">
                    <p className="text-xl font-bold text-amber-600 tabular-nums">${(totalAwarded / 1e6).toFixed(1)}M</p>
                    <p className="text-[10px] text-muted-foreground">Total Awarded (top results)</p>
                  </div>
                  <div className="rounded-lg border border-border p-3 text-center">
                    <p className="text-xl font-bold text-foreground tabular-nums">{contractors.length}</p>
                    <p className="text-[10px] text-muted-foreground">Contracts Returned</p>
                  </div>
                  <div className="rounded-lg border border-border p-3 text-center">
                    <p className="text-xl font-bold text-foreground tabular-nums">{county ?? "All MI"}</p>
                    <p className="text-[10px] text-muted-foreground">County Filter</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left">
                        <th className="py-2 pr-4 text-xs font-semibold text-muted-foreground">#</th>
                        <th className="py-2 pr-4 text-xs font-semibold text-muted-foreground">Recipient</th>
                        <th className="py-2 pr-4 text-xs font-semibold text-muted-foreground">City</th>
                        <th className="py-2 pr-4 text-xs font-semibold text-muted-foreground">Award ($)</th>
                        <th className="py-2 pr-4 text-xs font-semibold text-muted-foreground">Agency</th>
                        <th className="py-2 text-xs font-semibold text-muted-foreground">Industry</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contractors.map((c, i) => (
                        <tr key={`${c.uei}-${i}`} className="border-b border-border/40">
                          <td className="py-2 pr-4 tabular-nums text-muted-foreground">{i + 1}</td>
                          <td className="py-2 pr-4 font-medium max-w-[200px] truncate">{c.name}</td>
                          <td className="py-2 pr-4 text-muted-foreground">{c.city}</td>
                          <td className="py-2 pr-4 tabular-nums font-semibold text-amber-600">${(c.totalAwardsFY2024 / 1e6).toFixed(2)}M</td>
                          <td className="py-2 pr-4 text-muted-foreground max-w-[150px] truncate">{c.topAgency}</td>
                          <td className="py-2 text-[10px] text-muted-foreground max-w-[150px] truncate">{c.naicsDescription || c.naicsCode}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-[9px] text-muted-foreground/60 mt-2">Source: USASpending.gov FY2024. Live API data — results may vary. All contracts $10,000+ reported under FFATA.</p>
              </>
            )}
            {contractors && contractors.length === 0 && !isLoading && (
              <p className="text-sm text-muted-foreground py-6">No contract results found. Try a different county or check USASpending.gov directly.</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-muted/30">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>All federal contracts $10,000+ must be reported under the Federal Funding Accountability and Transparency Act (FFATA). These records are public.</p>
                <div className="flex gap-3 mt-2">
                  <a href="https://www.usaspending.gov/search" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1" aria-label="USASpending.gov, opens in new window">USASpending.gov <ExternalLink className="h-3 w-3" aria-hidden="true" /></a>
                  <a href="https://sam.gov" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1" aria-label="SAM.gov, opens in new window">SAM.gov <ExternalLink className="h-3 w-3" aria-hidden="true" /></a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button asChild variant="outline"><Link to="/transparency"><ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Transparency</Link></Button>
      </div>
    </Layout>
  );
}
