import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, ArrowLeft, Search, Loader2, ExternalLink, Info } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useNonprofitSearch } from "@/hooks/useNonprofitSearch";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }) };

const LEGISLATURE = {
  senate: { total: 38, democratic: 19, republican: 19, source: "Michigan Legislature 2025" },
  house: { total: 110, democratic: 55, republican: 55, source: "Michigan Legislature 2025" },
  salary: "$71,685/year",
  salarySource: "Michigan Legislature official records 2024",
};

const FEDERAL_AGENCIES = [
  { agency: "Dept of Veterans Affairs", employees: "3,500\u20134,500", counties: "Wayne, Washtenaw, Kent" },
  { agency: "Social Security Administration", employees: "2,000\u20132,500", counties: "29 offices statewide" },
  { agency: "Dept of Agriculture (USDA)", employees: "1,000\u20131,500", counties: "All 83 counties" },
  { agency: "Dept of Health & Human Services", employees: "400\u2013600", counties: "Wayne, Ingham" },
  { agency: "Dept of Labor", employees: "200\u2013350", counties: "Wayne, Kent, Ingham" },
  { agency: "Environmental Protection Agency", employees: "200\u2013400", counties: "Wayne, Ingham (Region 5)" },
  { agency: "Dept of Housing & Urban Dev", employees: "150\u2013250", counties: "Wayne, Ingham, Kent" },
];

function NonprofitSearchPanel() {
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: results, isLoading } = useNonprofitSearch(searchQuery);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search Michigan nonprofits..." className="max-w-sm" onKeyDown={e => e.key === "Enter" && setSearchQuery(query)} />
        <Button onClick={() => setSearchQuery(query)} disabled={query.length < 3}>Search</Button>
      </div>
      {isLoading && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Searching ProPublica...</div>}
      {results && results.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-2 pr-4 text-xs font-semibold text-muted-foreground">Name</th>
                <th className="py-2 pr-4 text-xs font-semibold text-muted-foreground">City</th>
                <th className="py-2 pr-4 text-xs font-semibold text-muted-foreground">EIN</th>
                <th className="py-2 pr-4 text-xs font-semibold text-muted-foreground">Revenue</th>
                <th className="py-2 text-xs font-semibold text-muted-foreground">Assets</th>
              </tr>
            </thead>
            <tbody>
              {results.map(r => (
                <tr key={r.ein} className="border-b border-border/40">
                  <td className="py-2 pr-4 font-medium max-w-[200px] truncate">{r.name}</td>
                  <td className="py-2 pr-4 text-muted-foreground">{r.city}</td>
                  <td className="py-2 pr-4 tabular-nums text-muted-foreground">{r.ein}</td>
                  <td className="py-2 pr-4 tabular-nums">{r.revenue ? `$${(r.revenue / 1e6).toFixed(1)}M` : "—"}</td>
                  <td className="py-2 tabular-nums">{r.assets ? `$${(r.assets / 1e6).toFixed(1)}M` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[9px] text-muted-foreground/60 mt-2">Source: ProPublica Nonprofit Explorer / IRS Form 990</p>
        </div>
      )}
      {results && results.length === 0 && searchQuery.length >= 3 && !isLoading && (
        <p className="text-sm text-muted-foreground">No results found. Try a different search term.</p>
      )}
    </div>
  );
}

export default function PublicOfficialsPage() {
  usePageMeta({ title: "Public Officials & Workforce — Access Michigan", description: "Michigan Legislature, federal workforce data, state salary ranges, and nonprofit grant recipients.", path: "/transparency/officials" });

  return (
    <Layout>
      <Breadcrumbs items={[{ label: "Transparency", href: "/transparency" }, { label: "Public Officials" }]} />

      <section className="relative overflow-hidden bg-slate-900 py-12 md:py-16">
        <div className="container">
          <motion.div initial="hidden" animate="visible" className="mx-auto max-w-3xl text-center">
            <motion.div variants={fadeUp} custom={0} className="mb-4 inline-flex items-center gap-2 rounded-full bg-michigan-forest/20 px-4 py-1.5">
              <Users className="h-4 w-4 text-green-400" />
              <span className="text-sm font-medium text-green-400">Public Officials & Workforce</span>
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1} className="mb-4 text-3xl font-bold text-white md:text-4xl">Michigan Public Officials & Workforce</motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-base text-slate-300">~45,000 state employees, ~100,000+ federal workers, 148 state legislators. Public service, public record.</motion.p>
          </motion.div>
        </div>
      </section>

      <div className="container py-10">
        <Tabs defaultValue="legislature" className="w-full">
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex w-max min-w-full sm:w-auto sm:min-w-0 gap-1">
              <TabsTrigger value="legislature" className="text-xs sm:text-sm whitespace-nowrap">Legislature</TabsTrigger>
              <TabsTrigger value="federal" className="text-xs sm:text-sm whitespace-nowrap">Federal Workforce</TabsTrigger>
              <TabsTrigger value="salaries" className="text-xs sm:text-sm whitespace-nowrap">State Salaries</TabsTrigger>
              <TabsTrigger value="nonprofits" className="text-xs sm:text-sm whitespace-nowrap">Nonprofits</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="legislature" className="mt-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardContent className="py-5">
                  <h3 className="text-sm font-bold text-foreground mb-3">Michigan Senate</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-4 rounded-full overflow-hidden flex">
                      <div className="bg-[#1a4f9b] h-full" style={{ width: `${(LEGISLATURE.senate.democratic / LEGISLATURE.senate.total) * 100}%` }} />
                      <div className="bg-[#c41e3a] h-full" style={{ width: `${(LEGISLATURE.senate.republican / LEGISLATURE.senate.total) * 100}%` }} />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{LEGISLATURE.senate.democratic}D</span>
                    <span>{LEGISLATURE.senate.total} total seats</span>
                    <span>{LEGISLATURE.senate.republican}R</span>
                  </div>
                  <p className="text-[9px] text-muted-foreground/60 mt-2">{LEGISLATURE.senate.source}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-5">
                  <h3 className="text-sm font-bold text-foreground mb-3">Michigan House</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-4 rounded-full overflow-hidden flex">
                      <div className="bg-[#1a4f9b] h-full" style={{ width: `${(LEGISLATURE.house.democratic / LEGISLATURE.house.total) * 100}%` }} />
                      <div className="bg-[#c41e3a] h-full" style={{ width: `${(LEGISLATURE.house.republican / LEGISLATURE.house.total) * 100}%` }} />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{LEGISLATURE.house.democratic}D</span>
                    <span>{LEGISLATURE.house.total} total seats</span>
                    <span>{LEGISLATURE.house.republican}R</span>
                  </div>
                  <p className="text-[9px] text-muted-foreground/60 mt-2">{LEGISLATURE.house.source}</p>
                </CardContent>
              </Card>
            </div>
            <div className="flex gap-3 flex-wrap">
              <a href="https://www.legislature.mi.gov" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1" aria-label="Michigan Legislature, opens in new window">Michigan Legislature <ExternalLink className="h-3 w-3" aria-hidden="true" /></a>
              <a href="https://openstates.org/mi/" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1" aria-label="Open States Michigan, opens in new window">Open States (Voting Records) <ExternalLink className="h-3 w-3" aria-hidden="true" /></a>
            </div>
          </TabsContent>

          <TabsContent value="federal" className="mt-6 space-y-6">
            <p className="text-xs text-muted-foreground">Aggregate data from OPM FedScope Employment Cube (public). No individual names — agency/county level only.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {FEDERAL_AGENCIES.map(a => (
                <Card key={a.agency}>
                  <CardContent className="py-3">
                    <h4 className="text-sm font-bold text-foreground">{a.agency}</h4>
                    <p className="text-xs text-muted-foreground">{a.employees} Michigan employees</p>
                    <p className="text-[10px] text-muted-foreground/70">{a.counties}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-[9px] text-muted-foreground/60">Source: OPM FedScope Employment Cube (public download)</p>
            <Button asChild variant="outline" size="sm"><Link to="/civic-power/federal">Full Federal Presence Page <ExternalLink className="ml-1 h-3 w-3" /></Link></Button>
          </TabsContent>

          <TabsContent value="salaries" className="mt-6 space-y-6">
            <Card>
              <CardContent className="py-5">
                <h3 className="text-sm font-bold text-foreground mb-2">Michigan Legislator Salary</h3>
                <p className="text-2xl font-bold text-foreground tabular-nums">{LEGISLATURE.salary}</p>
                <p className="text-xs text-muted-foreground mt-1">Base salary for all 148 state legislators (Senate and House). Leadership premiums apply for Speaker, Majority/Minority leaders.</p>
                <p className="text-[9px] text-muted-foreground/60 mt-2">{LEGISLATURE.salarySource}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-5">
                <h3 className="text-sm font-bold text-foreground mb-2">State Employee Pay Ranges</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">Michigan Civil Service publishes pay ranges by job classification (P-level professional, E-level executive, M-level management, A-level administrative). Individual salaries are not searchable online, but classification bands are public.</p>
                <a href="https://www.michigan.gov/mdcs" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mt-2 inline-flex items-center gap-1" aria-label="Michigan Civil Service, opens in new window">Michigan Civil Service Pay Plans <ExternalLink className="h-3 w-3" aria-hidden="true" /></a>
                <p className="text-[9px] text-muted-foreground/60 mt-2">Source: Michigan Civil Service Commission</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nonprofits" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Search className="h-4 w-4 text-primary" /> Michigan Nonprofit Search</CardTitle>
                <p className="text-xs text-muted-foreground">Search Michigan nonprofits by name. Revenue and assets from IRS Form 990. Source: ProPublica Nonprofit Explorer</p>
              </CardHeader>
              <CardContent>
                <NonprofitSearchPanel />
              </CardContent>
            </Card>
            <Card className="bg-muted/30">
              <CardContent className="py-4">
                <p className="text-xs text-muted-foreground">Michigan has 45,000+ registered nonprofits. Many receive public funding via grants. Form 990s are public record filed with the IRS.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8">
          <Button asChild variant="outline"><Link to="/transparency"><ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Transparency</Link></Button>
        </div>
      </div>
    </Layout>
  );
}
