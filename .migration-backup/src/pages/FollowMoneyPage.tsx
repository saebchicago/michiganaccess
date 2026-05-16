import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { DollarSign, ArrowLeft, ArrowRight, ExternalLink, Info } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePageMeta } from "@/hooks/usePageMeta";
import { MICHIGAN_LOBBYING_BY_INDUSTRY, MICHIGAN_LOBBYING_STATS } from "@/data/lobbyingData";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }) };

const lobbyChartData = MICHIGAN_LOBBYING_BY_INDUSTRY
  .sort((a, b) => b.totalExpenditures - a.totalExpenditures)
  .map(l => ({ industry: l.industry.replace(" & ", " &\n"), expenditures: l.totalExpenditures / 1e6 }));

export default function FollowMoneyPage() {
  usePageMeta({ title: "Follow the Money — Access Michigan", description: "Michigan lobbying expenditures, campaign finance resources, and political contribution data. All parties, all public record.", path: "/transparency/money" });

  return (
    <Layout>
      <Breadcrumbs items={[{ label: "Transparency", href: "/transparency" }, { label: "Follow the Money" }]} />

      <section className="relative overflow-hidden bg-slate-900 py-12 md:py-16">
        <div className="container">
          <motion.div initial="hidden" animate="visible" className="mx-auto max-w-3xl text-center">
            <motion.div variants={fadeUp} custom={0} className="mb-4 inline-flex items-center gap-2 rounded-full bg-teal-500/10 px-4 py-1.5">
              <DollarSign className="h-4 w-4 text-teal-400" />
              <span className="text-sm font-medium text-teal-400">Follow the Money</span>
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1} className="mb-4 text-3xl font-bold text-white md:text-4xl">Follow the Money — Michigan</motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-base text-slate-300">Lobbying. Campaign contributions. PACs. All public record. All searchable. All parties treated equally.</motion.p>
          </motion.div>
        </div>
      </section>

      <div className="container py-10">
        <Tabs defaultValue="lobbying" className="w-full">
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex w-max min-w-full sm:w-auto sm:min-w-0 gap-1">
              <TabsTrigger value="lobbying" className="text-xs sm:text-sm whitespace-nowrap">Lobbying</TabsTrigger>
              <TabsTrigger value="campaign" className="text-xs sm:text-sm whitespace-nowrap">Campaign Finance</TabsTrigger>
              <TabsTrigger value="federal" className="text-xs sm:text-sm whitespace-nowrap">Federal Spending</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="lobbying" className="mt-6 space-y-6">
            <Card className="border-teal-200/50 dark:border-teal-900/30 bg-teal-50/30 dark:bg-teal-950/10">
              <CardContent className="py-5">
                <h3 className="text-sm font-bold text-foreground mb-2">Michigan Lobby Act</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Michigan requires lobbyists to register with the Secretary of State within 15 days of becoming a lobbyist and file bi-annual expense reports. ~2,000+ registered lobbyists in Michigan.
                </p>
                <p className="text-[9px] text-muted-foreground/60 mt-2">Source: Michigan Lobby Act, Act 472 of 1978 · Michigan MiTN</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Lobbying Expenditures by Industry</CardTitle>
                <p className="text-xs text-muted-foreground">Source: Michigan MiTN 2024 — Illustrative aggregate. Full data at mitn.michigan.gov</p>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={lobbyChartData} layout="vertical" margin={{ left: 180 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `$${v}M`} />
                      <YAxis dataKey="industry" type="category" tick={{ fontSize: 10 }} width={170} />
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v: number) => `$${v.toFixed(1)}M`} />
                      <Bar dataKey="expenditures" fill="#00A3A1" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top clients per industry */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {MICHIGAN_LOBBYING_BY_INDUSTRY.slice(0, 6).map(l => (
                <Card key={l.industry} className="h-full">
                  <CardContent className="py-4">
                    <h4 className="text-sm font-bold text-foreground mb-1">{l.industry}</h4>
                    <p className="text-xs text-amber-600 font-semibold tabular-nums mb-2">${(l.totalExpenditures / 1e6).toFixed(1)}M · {l.totalRegisteredLobbyists} lobbyists</p>
                    <div className="space-y-1">
                      {l.topClients.map(c => <p key={c} className="text-[10px] text-muted-foreground">• {c}</p>)}
                    </div>
                    <p className="text-[9px] text-muted-foreground/60 mt-2">{l.source}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex gap-3">
              <a href="https://mitn.michigan.gov" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1" aria-label="Michigan MiTN, opens in new window">Search Michigan Lobbying <ExternalLink className="h-3 w-3" aria-hidden="true" /></a>
              <a href="https://www.opensecrets.org" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1" aria-label="OpenSecrets, opens in new window">Federal Lobbying <ExternalLink className="h-3 w-3" aria-hidden="true" /></a>
            </div>
          </TabsContent>

          <TabsContent value="campaign" className="mt-6 space-y-6">
            <Card className="border-primary/20 bg-primary/[0.03]">
              <CardContent className="py-5">
                <h3 className="text-sm font-bold text-foreground mb-2">Michigan Campaign Finance — MiTN</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Michigan campaign finance records are public and searchable via MiTN (Michigan Transparency Network), launched 2024 to replace the legacy MERTS system. Anyone can search without creating an account. MiTN combines campaign finance reporting, lobby expense reporting, personal financial disclosures, and legal defense fund disclosures into one centralized system.
                </p>
                <p className="text-[9px] text-muted-foreground/60 mt-2">Source: Michigan SOS — mitn.michigan.gov</p>
                <a href="https://mitn.michigan.gov" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mt-3 inline-flex items-center gap-1" aria-label="Search MiTN, opens in new window">Search Michigan Campaign Finance <ExternalLink className="h-3 w-3" aria-hidden="true" /></a>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-5">
                <h3 className="text-sm font-bold text-foreground mb-2">Contribution Limits</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-2">Michigan sets contribution limits for candidates, PACs, and party committees. Corporations cannot contribute directly to candidates but may form PACs.</p>
                <p className="text-[9px] text-muted-foreground/60">Source: MCL 169.246 — Michigan Campaign Finance Act</p>
              </CardContent>
            </Card>

            <div className="flex gap-3 flex-wrap">
              <a href="https://mitn.michigan.gov" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1" aria-label="MiTN, opens in new window">MiTN Campaign Finance <ExternalLink className="h-3 w-3" aria-hidden="true" /></a>
              <a href="https://www.fec.gov" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1" aria-label="FEC, opens in new window">Federal: FEC.gov <ExternalLink className="h-3 w-3" aria-hidden="true" /></a>
              <a href="https://www.opensecrets.org/states/MI" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1" aria-label="OpenSecrets Michigan, opens in new window">OpenSecrets Michigan <ExternalLink className="h-3 w-3" aria-hidden="true" /></a>
            </div>
          </TabsContent>

          <TabsContent value="federal" className="mt-6 space-y-6">
            <Card className="bg-primary/[0.03] border-primary/20">
              <CardContent className="py-6 text-center">
                <p className="text-sm text-muted-foreground mb-3">See the full federal investment picture — $14.2B in FY2024</p>
                <Button asChild><Link to="/public-investment">Public Investment Dashboard <ArrowRight className="ml-1.5 h-4 w-4" /></Link></Button>
              </CardContent>
            </Card>
            <Card className="bg-primary/[0.03] border-primary/20">
              <CardContent className="py-6 text-center">
                <p className="text-sm text-muted-foreground mb-3">Search federal contractors by county</p>
                <Button asChild variant="outline"><Link to="/transparency/contractors">Federal Contractors <ArrowRight className="ml-1.5 h-4 w-4" /></Link></Button>
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
