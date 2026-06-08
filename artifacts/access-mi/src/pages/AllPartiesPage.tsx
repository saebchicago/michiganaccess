import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Vote,
  ArrowLeft,
  ExternalLink,
  Info,
  AlertTriangle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePageMeta } from "@/hooks/usePageMeta";
import {
  MICHIGAN_PARTIES,
  MICHIGAN_FILING_COMPARISON,
  BALLOT_ACCESS_COMPARISON,
} from "@/data/michiganParties";
import { MICHIGAN_POLITICAL_PARTY_COUNT } from "@/config/platformConstants";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

const STATUS_STYLES: Record<string, string> = {
  Major: "bg-primary/10 text-primary",
  Minor: "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
  "Seeking Access": "bg-muted text-muted-foreground",
};

const accessData = BALLOT_ACCESS_COMPARISON.map((s) => ({
  state: s.state,
  difficulty:
    s.difficulty === "Easy"
      ? 20
      : s.difficulty === "Moderate"
        ? 40
        : s.difficulty === "Moderate-Hard"
          ? 60
          : s.difficulty === "Hard"
            ? 80
            : 95,
  fill: s.state === "Michigan" ? "#0A4C95" : "#64748b",
  note: s.note,
}));

export default function AllPartiesPage() {
  usePageMeta({
    title: "All Michigan Political Parties | Access Michigan",
    description: `All ${MICHIGAN_POLITICAL_PARTY_COUNT} Michigan registered political parties shown equally. Filing guides, petition requirements, ballot access comparisons.`,
    path: "/transparency/parties",
  });

  return (
    <Layout>
      <Breadcrumbs
        items={[
          { label: "Transparency", href: "/transparency" },
          { label: "All Parties" },
        ]}
      />

      <section className="relative overflow-hidden bg-slate-900 py-12 md:py-16">
        <div className="container">
          <motion.div
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-3xl text-center"
          >
            <motion.div
              variants={fadeUp}
              custom={0}
              className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5"
            >
              <Vote className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white">
                All Michigan Parties - Equal Treatment
              </span>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="mb-4 text-3xl font-bold text-white md:text-4xl"
            >
              All Michigan Political Parties
            </motion.h1>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-base text-slate-300"
            >
              Michigan has {MICHIGAN_PARTIES.length} registered parties. All are
              public record. All have equal access to this platform.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <div className="container py-10 space-y-10">
        {/* No-party registration note */}
        <Card className="border-amber-200/50 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-950/10">
          <CardContent className="py-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-foreground mb-1">
                  Michigan Does Not Register Voters by Party
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Any registered voter can request any party's primary ballot on
                  Election Day. Only major parties hold primary elections. Minor
                  party candidates appear on the general election ballot.
                </p>
                <p className="text-[9px] text-muted-foreground/60 mt-1">
                  Source: Michigan Election Law MCL 168.613
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Party Cards - IDENTICAL structure for all */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MICHIGAN_PARTIES.map((party, i) => (
            <motion.div
              key={party.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(i * 0.05, 0.3) }}
            >
              <Card className="h-full flex flex-col">
                <div
                  className="h-1.5 rounded-t-lg"
                  style={{ backgroundColor: party.color }}
                />
                <CardContent className="py-4 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-bold text-foreground">
                      {party.officialName}
                    </h3>
                    <Badge
                      className={`text-[10px] ${STATUS_STYLES[party.ballotStatus] ?? ""}`}
                    >
                      {party.ballotStatus}
                    </Badge>
                  </div>
                  {party.founded && (
                    <p className="text-[10px] text-muted-foreground mb-2">
                      Founded: {party.founded}
                    </p>
                  )}
                  <div className="space-y-1.5 mb-3 text-[10px] text-muted-foreground">
                    <p>
                      <span className="font-medium text-foreground">
                        Officeholders:
                      </span>{" "}
                      {party.currentStateOfficeholders}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">
                        Filing:
                      </span>{" "}
                      {party.candidateFilingProcess}
                    </p>
                    {party.petitionNote && (
                      <p className="text-amber-600 dark:text-amber-400">
                        {party.petitionNote}
                      </p>
                    )}
                  </div>
                  <div className="mb-3">
                    <p className="text-[10px] font-medium text-foreground mb-1">
                      Policy focus:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {party.keyPolicyFocus.slice(0, 4).map((p) => (
                        <Badge key={p} variant="outline" className="text-[9px]">
                          {p}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {party.lastGovernorVotePct != null && (
                    <p className="text-[10px] text-muted-foreground mb-2">
                      Last governor: {party.lastGovernorCandidate} -{" "}
                      {party.lastGovernorVotePct}% ({party.lastGovernorVoteYear}
                      )
                    </p>
                  )}
                  <div className="mt-auto pt-2 border-t border-border/50">
                    {party.website ? (
                      <a
                        href={`https://${party.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-primary hover:underline inline-flex items-center gap-1"
                        aria-label={`${party.shortName} website, opens in new window`}
                      >
                        {party.website}{" "}
                        <ExternalLink className="h-3 w-3" aria-hidden="true" />
                      </a>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">
                        No website listed
                      </span>
                    )}
                  </div>
                  <p className="text-[9px] text-muted-foreground/60 mt-1">
                    {party.source}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Filing Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Filing Requirements: Major vs. Minor Parties
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Source: Michigan Election Law, MCL 168.544c; Michigan SOS
            </p>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-2 pr-4 text-xs font-semibold text-muted-foreground">
                    Requirement
                  </th>
                  <th className="py-2 pr-4 text-xs font-semibold text-muted-foreground">
                    Major Party
                  </th>
                  <th className="py-2 text-xs font-semibold text-muted-foreground">
                    Minor Party
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/40">
                  <td className="py-2 pr-4 font-medium">Statewide petitions</td>
                  <td className="py-2 pr-4">
                    {MICHIGAN_FILING_COMPARISON.majorPartyStatewidePetitions}
                  </td>
                  <td className="py-2 text-amber-600">
                    {MICHIGAN_FILING_COMPARISON.minorPartyStatewidePetitions}
                  </td>
                </tr>
                <tr className="border-b border-border/40">
                  <td className="py-2 pr-4 font-medium">Local petitions</td>
                  <td className="py-2 pr-4">
                    {MICHIGAN_FILING_COMPARISON.majorPartyLocalPetitions}
                  </td>
                  <td className="py-2">
                    {MICHIGAN_FILING_COMPARISON.minorPartyLocalPetitions}
                  </td>
                </tr>
                <tr className="border-b border-border/40">
                  <td className="py-2 pr-4 font-medium">Primary election</td>
                  <td className="py-2 pr-4">Yes</td>
                  <td className="py-2">No - convention nomination</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Ballot Access Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Michigan vs. Other States - Ballot Access Difficulty
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Source: Ballot Access News / Michigan SOS
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={accessData}
                  layout="vertical"
                  margin={{ left: 90 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fontSize: 11 }}
                    tickFormatter={() => ""}
                  />
                  <YAxis
                    dataKey="state"
                    type="category"
                    tick={{ fontSize: 11 }}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{ fontSize: 11, borderRadius: 8 }}
                    formatter={(
                      _: unknown,
                      __: unknown,
                      props: { payload?: { note?: string } },
                    ) => props.payload?.note ?? ""}
                    labelFormatter={(l) => `${l}`}
                  />
                  <Bar dataKey="difficulty" radius={[0, 4, 4, 0]}>
                    {accessData.map((e) => (
                      <Cell key={e.state} fill={e.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1 px-[90px]">
              <span>Easy</span>
              <span>Hard</span>
            </div>
          </CardContent>
        </Card>

        <Button asChild variant="outline">
          <Link to="/transparency">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Transparency
          </Link>
        </Button>
      </div>
    </Layout>
  );
}
