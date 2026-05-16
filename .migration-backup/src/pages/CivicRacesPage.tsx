import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Vote, ArrowLeft, ExternalLink, ChevronDown, ChevronUp,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell,
} from "recharts";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePageMeta } from "@/hooks/usePageMeta";
import { MICHIGAN_RACE_DATA, STATE_UNCONTESTED_COMPARISON } from "@/data/uncontestedRaces";

const OFFICE_TYPE_DATA = [
  { office: "Constable", pct: 97, fill: "#dc2626" },
  { office: "Judge (local)", pct: 89, fill: "#dc2626" },
  { office: "Township Trustee", pct: 85, fill: "#ea580c" },
  { office: "Township Clerk", pct: 82, fill: "#ea580c" },
  { office: "County Commissioner", pct: 68, fill: "#f59e0b" },
  { office: "School Board", pct: 52, fill: "#f59e0b" },
  { office: "City Council", pct: 34, fill: "#22c55e" },
];

const HOW_TO_RUN = [
  {
    title: "School Board",
    content: "Michigan requires nominating petitions filed with your county clerk by the filing deadline (~June of election year for November elections). Petition signature requirements vary by district. Non-partisan election. No party affiliation required.",
    link: "https://mvic.sos.state.mi.us",
  },
  {
    title: "City Council",
    content: "Varies by city charter — most require a nominating petition or caucus process. Check your city clerk's office for specific requirements and filing deadlines. Some cities hold partisan primaries; many are non-partisan.",
    link: "https://mvic.sos.state.mi.us",
  },
  {
    title: "Township Board",
    content: "File with your county clerk. Petition signatures range from 10 to 50 depending on township population. Partisan primary in August; general election in November. Includes supervisor, clerk, treasurer, and trustee positions.",
    link: "https://mvic.sos.state.mi.us",
  },
  {
    title: "County Commission",
    content: "File with your county clerk. Partisan primary. District-based seats. Petition signature requirements vary by population. Filing deadline is typically April of election year.",
    link: "https://mvic.sos.state.mi.us",
  },
  {
    title: "State Legislature",
    content: "File with the Michigan Secretary of State. District-based petitions required. Partisan primary in August. Senate districts (4-year terms) and House districts (2-year terms). Must be a registered voter in the district.",
    link: "https://mvic.sos.state.mi.us",
  },
];

const CivicRacesPage = () => {
  usePageMeta({
    title: "Races That Need Candidates — Access Michigan",
    description: "79.7% of Michigan's 15,139 races in 2024 were uncontested. See which regions and office types need candidates most.",
    path: "/civic-power/races",
  });

  const [openAccordion, setOpenAccordion] = useState<number | null>(null);

  const stateData = [...STATE_UNCONTESTED_COMPARISON]
    .sort((a, b) => b.pct - a.pct)
    .map(s => ({
      ...s,
      fill: s.state === "Michigan" ? "#dc2626" : s.state === "National Average" ? "#6b7280" : "#0A4C95",
    }));

  return (
    <Layout>
      <Breadcrumbs items={[
        { label: "Civic Power Map", href: "/civic-power" },
        { label: "Races That Need Candidates" },
      ]} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-red-500/10 via-primary/5 to-background py-12 md:py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-red-500/10 px-4 py-1.5">
              <Vote className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-600">Races That Need Candidates</span>
            </div>
            <h1 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">
              79.7% Uncontested. #1 Among Large States.
            </h1>
            <p className="text-base text-muted-foreground">
              In 2024, 12,065 of Michigan's 15,139 tracked races had only one candidate. Nationally, ~2,500 positions had zero candidates. Michigan's democracy has open seats at every level.
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">Ballotpedia 2024 · BallotReady 2023</p>
          </div>
        </div>
      </section>

      {/* State Comparison */}
      <section className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Michigan vs. Midwest Peers</CardTitle>
            <p className="text-xs text-muted-foreground">Source: Ballotpedia Analysis of Uncontested Elections 2024</p>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stateData} layout="vertical" margin={{ left: 110 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                  <YAxis dataKey="state" type="category" tick={{ fontSize: 11 }} width={100} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v: number) => `${v}%`} />
                  <ReferenceLine x={70} stroke="#6b7280" strokeDasharray="6 4" />
                  <Bar dataKey="pct" radius={[0, 4, 4, 0]}>
                    {stateData.map(e => <Cell key={e.state} fill={e.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Regional Breakdown Table */}
      <section className="container pb-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Regional Breakdown</CardTitle>
            <p className="text-xs text-muted-foreground">Source: Ballotpedia / Michigan SOS 2024</p>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-2 pr-4 text-xs font-semibold text-muted-foreground">Region</th>
                  <th className="py-2 pr-4 text-xs font-semibold text-muted-foreground">Total Races</th>
                  <th className="py-2 pr-4 text-xs font-semibold text-muted-foreground">Uncontested %</th>
                  <th className="py-2 pr-4 text-xs font-semibold text-muted-foreground">Zero Candidates</th>
                  <th className="py-2 text-xs font-semibold text-muted-foreground">Best Opportunity</th>
                </tr>
              </thead>
              <tbody>
                {MICHIGAN_RACE_DATA.map(r => (
                  <tr key={r.region} className="border-b border-border/40">
                    <td className="py-2.5 pr-4 font-medium">{r.region}</td>
                    <td className="py-2.5 pr-4 tabular-nums">{r.totalRaces.toLocaleString()}</td>
                    <td className="py-2.5 pr-4">
                      <span className={`font-bold tabular-nums ${r.uncontestedPct >= 85 ? "text-red-600" : r.uncontestedPct >= 75 ? "text-orange-600" : "text-amber-600"}`}>
                        {r.uncontestedPct}%
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 tabular-nums">{r.zeroCandidate}</td>
                    <td className="py-2.5 text-muted-foreground text-xs">{r.bestOpportunity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>

      {/* Office Type Breakdown */}
      <section className="container pb-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Which Offices Are Most Uncontested?</CardTitle>
            <p className="text-xs text-muted-foreground">Michigan 2024 — estimated by office type. Source: Ballotpedia / Michigan SOS</p>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={OFFICE_TYPE_DATA} layout="vertical" margin={{ left: 120 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                  <YAxis dataKey="office" type="category" tick={{ fontSize: 11 }} width={110} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v: number) => `${v}% uncontested`} />
                  <Bar dataKey="pct" radius={[0, 4, 4, 0]}>
                    {OFFICE_TYPE_DATA.map(e => <Cell key={e.office} fill={e.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* How to Run Accordion */}
      <section className="container pb-10">
        <h2 className="text-lg font-bold text-foreground mb-4">How to Run for Office in Michigan</h2>
        <div className="space-y-2">
          {HOW_TO_RUN.map((item, i) => (
            <Card key={item.title}>
              <button
                onClick={() => setOpenAccordion(openAccordion === i ? null : i)}
                className="w-full px-4 py-3 flex items-center justify-between text-left"
                aria-expanded={openAccordion === i}
                aria-controls={`how-to-run-${i}`}
              >
                <span className="text-sm font-semibold text-foreground">{item.title}</span>
                {openAccordion === i ? <ChevronUp className="h-4 w-4 text-muted-foreground" aria-hidden="true" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
              </button>
              {openAccordion === i && (
                <CardContent className="pt-0 pb-4" id={`how-to-run-${i}`}>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-2">{item.content}</p>
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1" aria-label="Michigan Voter Information Center, opens in new window">
                    Michigan Voter Information Center <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Cards */}
      <section className="container pb-12">
        <h2 className="text-base font-bold text-foreground mb-4">Resources for Candidates</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Run for Something", desc: "Recruit and support first-time candidates", url: "https://runforsomething.net" },
            { title: "MI League of Women Voters", desc: "Candidate resources and voter guides", url: "https://lwvmi.org" },
            { title: "MML New Officials Workshop", desc: "Training for newly elected local officials", url: "https://mml.org" },
            { title: "Michigan SOS Candidate Info", desc: "Official filing and petition resources", url: "https://mvic.sos.state.mi.us" },
          ].map(r => (
            <a key={r.title} href={r.url} target="_blank" rel="noopener noreferrer" className="group" aria-label={`${r.title}, opens in new window`}>
              <Card className="h-full hover:shadow-md hover:border-primary/30 transition-all">
                <CardContent className="py-4">
                  <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{r.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{r.desc}</p>
                  <span className="text-[10px] text-primary mt-2 inline-flex items-center gap-1">
                    Visit <ExternalLink className="h-3 w-3" />
                  </span>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </section>

      <section className="container pb-8">
        <Button asChild variant="outline">
          <Link to="/civic-power"><ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Civic Power Map</Link>
        </Button>
      </section>
    </Layout>
  );
};

export default CivicRacesPage;
