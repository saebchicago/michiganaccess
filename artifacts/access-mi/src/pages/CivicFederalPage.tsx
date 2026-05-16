import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building2, ArrowLeft, ArrowRight, ExternalLink, MapPin, Users, Info,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePageMeta } from "@/hooks/usePageMeta";
import { MICHIGAN_FEDERAL_AGENCIES, MICHIGAN_RELEVANT_FACA } from "@/data/federalPresence";

const CivicFederalPage = () => {
  usePageMeta({
    title: "Federal Presence in Michigan — Access Michigan",
    description: "7 major federal agencies, 140+ Michigan offices, and federal advisory committees with public nomination processes.",
    path: "/civic-power/federal",
  });

  return (
    <Layout>
      <Breadcrumbs items={[
        { label: "Civic Power Map", href: "/civic-power" },
        { label: "Federal Presence" },
      ]} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-michigan-forest/10 via-primary/5 to-background py-12 md:py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-michigan-forest/10 px-4 py-1.5">
              <Building2 className="h-4 w-4 text-michigan-forest" />
              <span className="text-sm font-medium text-michigan-forest">Federal Presence in Michigan</span>
            </div>
            <h1 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">
              The Federal Government in Your County
            </h1>
            <p className="text-base text-muted-foreground">
              The federal government employs ~100,000+ people in Michigan across 83 counties. $14.2B in awards flowed here in FY2024. Many federal advisory committees accept public nominations.
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">OPM FedScope · USASpending.gov FY2024 · facadatabase.gov</p>
          </div>
        </div>
      </section>

      {/* Agency Cards */}
      <section className="container py-10">
        <h2 className="text-lg font-bold text-foreground mb-4">Federal Agencies in Michigan</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MICHIGAN_FEDERAL_AGENCIES.map((agency, i) => (
            <motion.div
              key={agency.acronym}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(i * 0.05, 0.3) }}
            >
              <Card className="h-full">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">{agency.agency}</h3>
                      <Badge variant="outline" className="text-[10px] mt-1">{agency.acronym}</Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground tabular-nums">{agency.michiganOffices}</p>
                      <p className="text-[10px] text-muted-foreground">MI offices</p>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mb-3">{agency.missionRelevance}</p>

                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Users className="h-3 w-3 shrink-0" />
                      <span>{agency.michiganEmployees} Michigan employees</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
                      <MapPin className="h-3 w-3 shrink-0 mt-0.5" />
                      <span>{agency.keyCounties.join(", ")}</span>
                    </div>
                  </div>

                  {agency.advisoryCommittees && (
                    <div className="rounded-md bg-primary/5 border border-primary/10 p-2 mb-3">
                      <p className="text-[10px] font-semibold text-primary mb-1">Advisory Committees:</p>
                      {agency.advisoryCommittees.map(c => (
                        <p key={c} className="text-[10px] text-muted-foreground">• {c}</p>
                      ))}
                    </div>
                  )}

                  <a
                    href={agency.publicContactUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-primary hover:underline inline-flex items-center gap-1"
                    aria-label={`${agency.acronym} public contact, opens in new window`}
                  >
                    Public Contact <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FACA Panel */}
      <section className="container pb-10">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              Federal Advisory Committees (FACA)
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              ~1,000 federal advisory committees exist nationally. Most have public nomination processes. Most Michigan residents don't know they exist.
            </p>
            <p className="text-[9px] text-muted-foreground/60">Source: facadatabase.gov</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {MICHIGAN_RELEVANT_FACA.map(faca => (
                <div key={faca.name} className="rounded-lg border border-border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{faca.name}</h4>
                      <Badge variant="outline" className="text-[10px] mt-1">{faca.agency}</Badge>
                    </div>
                    {faca.publicNominations && (
                      <Badge className="text-[10px] bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400 shrink-0">
                        Public Nominations Open
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{faca.relevance}</p>
                  <p className="text-[10px] text-muted-foreground/70 mt-1">
                    Michigan representation: {faca.michiganRepresentation}
                  </p>
                  {faca.publicNominations && (
                    <a
                      href={faca.nominationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline mt-2 inline-flex items-center gap-1"
                      aria-label={`Apply to ${faca.name}, opens in new window`}
                    >
                      Apply / Nominate <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Link to Public Investment */}
      <section className="container pb-12">
        <Card className="bg-primary/[0.03] border-primary/20">
          <CardContent className="py-6 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              See how $14.2B in federal dollars flows through Michigan counties
            </p>
            <Button asChild>
              <Link to="/public-investment">
                Public Investment Dashboard <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="container pb-8">
        <Button asChild variant="outline">
          <Link to="/civic-power"><ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Civic Power Map</Link>
        </Button>
      </section>
    </Layout>
  );
};

export default CivicFederalPage;
