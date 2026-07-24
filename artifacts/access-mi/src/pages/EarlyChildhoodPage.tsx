import { Link } from "react-router-dom";
import { ArrowRight, Baby, CheckCircle2, MapPin } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Card, CardContent } from "@/components/ui/card";
import { ProvenanceTag } from "@/components/shared/ProvenanceTag";
import { useCounty } from "@/contexts/CountyContext";
import CountyInsightLinks from "@/components/county/CountyInsightLinks";
import ChildcareEducationHub from "@/components/family/ChildcareEducationHub";
import ChildcareDesertCard from "@/components/equity/ChildcareDesertCard";
import {
  RX_KIDS_COMMUNITIES,
  RX_KIDS_COVERED_COUNTIES,
  RX_KIDS_OUTCOMES,
  RX_KIDS_PROGRAM_FACTS,
  getRxKidsCommunities,
  isRxKidsActive,
} from "@/data/rx-kids";

// Source: MiLEAP press releases, Mar 25 2026 and May 21 2026.
const PREK_FOR_ALL_STATS = [
  {
    label: "Four-year-olds enrolled in GSRP",
    value: "~55,000",
    context: "Record high, more than double since 2021",
    source: "MiLEAP, Mar 2026",
  },
  {
    label: "Funded seats vs. eligible children",
    value: "~50%",
    context: "~59,000 funded seats for about 118,000 Michigan four-year-olds",
    source: "MiLEAP, Mar 2026",
  },
  {
    label: "2026-27 applications so far",
    value: "+65%",
    context: "36,000+ applications as of May 2026",
    source: "MiLEAP, May 2026",
  },
];

/** Group community rows by county for the full coverage list. */
function groupByCounty() {
  const groups = new Map<string, typeof RX_KIDS_COMMUNITIES>();
  for (const row of RX_KIDS_COMMUNITIES) {
    const list = groups.get(row.county) ?? [];
    list.push(row);
    groups.set(row.county, list);
  }
  return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
}

function RxKidsStatusCard({ county }: { county: string | null }) {
  if (county === null) {
    return (
      <Card>
        <CardContent className="py-4 flex items-start gap-3">
          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            Select your county from the header to see whether Rx Kids serves your community.
          </p>
        </CardContent>
      </Card>
    );
  }

  const active = isRxKidsActive(county);
  const communities = getRxKidsCommunities(county);

  if (!active) {
    return (
      <Card>
        <CardContent className="py-4 flex items-start gap-3">
          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            Rx Kids has not yet announced a community in {county} County. See the full coverage
            list below - the program has expanded to a new set of counties every few months.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-michigan-forest/30 bg-michigan-forest/5">
      <CardContent className="py-4 space-y-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-michigan-forest-deep shrink-0" aria-hidden="true" />
          <p className="text-sm font-semibold text-foreground">
            Rx Kids is live in {county} County
          </p>
        </div>
        <ul className="text-sm text-muted-foreground space-y-1 pl-6">
          {communities.map((c) => (
            <li key={c.community}>
              {c.community}
              {c.eligibilityStart && ` - eligible since ${c.eligibilityStart}`}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export default function EarlyChildhoodPage() {
  usePageMeta({
    title: "Early Childhood in Michigan - Rx Kids & Childcare Access",
    description:
      "Rx Kids coverage by county, published program outcomes, and Michigan's childcare and preschool landscape - every number sourced.",
    path: "/early-childhood",
  });

  const { county } = useCounty();
  const grouped = groupByCounty();
  const heroParagraph =
    `Rx Kids pairs pregnant residents and new parents with unconditional cash - ` +
    `$${RX_KIDS_PROGRAM_FACTS.prenatalPayment.toLocaleString()} mid-pregnancy plus ` +
    `$${RX_KIDS_PROGRAM_FACTS.monthlyPayment} a month after birth, for ${RX_KIDS_PROGRAM_FACTS.paymentDurationNote}. ` +
    `Founded by ${RX_KIDS_PROGRAM_FACTS.founders}, it launched in ${RX_KIDS_PROGRAM_FACTS.launchLocation} in ` +
    `${RX_KIDS_PROGRAM_FACTS.launchDate} and has since expanded to ${RX_KIDS_COVERED_COUNTIES.length} of Michigan's 83 counties.`;

  return (
    <Layout>
      <Breadcrumbs items={[{ label: "Early Childhood" }]} />

      <section className="border-b border-border/40 bg-muted/20">
        <div className="container max-w-4xl py-12 md:py-16 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Early childhood
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground leading-tight">
            Rx Kids and Michigan's childcare landscape
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
            {heroParagraph}
          </p>
        </div>
      </section>

      <section className="container max-w-4xl py-10 space-y-4" aria-labelledby="coverage-heading">
        <h2 id="coverage-heading" className="text-lg font-bold text-foreground">
          Coverage in your county
        </h2>
        <RxKidsStatusCard county={county} />
      </section>

      <section className="container max-w-4xl py-6 space-y-4" aria-labelledby="outcomes-heading">
        <div className="flex items-center gap-2">
          <ProvenanceTag label="VERIFIED" />
          <h2 id="outcomes-heading" className="text-lg font-bold text-foreground">
            Published outcomes
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Peer-reviewed evaluations of the Flint program - the site with enough enrollment
          history for a published outcomes study so far.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {RX_KIDS_OUTCOMES.map((o) => (
            <Card key={o.finding}>
              <CardContent className="py-3 space-y-1">
                <p className="text-sm font-semibold text-foreground">{o.finding}</p>
                <p className="text-sm text-michigan-forest-deep font-medium">{o.metric}</p>
                <p className="text-[11px] text-muted-foreground">{o.studyPopulation}</p>
                <p className="text-[11px] text-muted-foreground/80">{o.citation}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          State investment: {RX_KIDS_PROGRAM_FACTS.stateInvestment} ({RX_KIDS_PROGRAM_FACTS.stateInvestmentSource}).
        </p>
      </section>

      <section className="container max-w-4xl py-6 space-y-3" aria-labelledby="full-coverage-heading">
        <h2 id="full-coverage-heading" className="text-lg font-bold text-foreground">
          Full coverage list
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {grouped.map(([countyName, rows]) => (
            <Card key={countyName}>
              <CardContent className="py-3 space-y-1">
                <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Baby className="h-3.5 w-3.5 text-michigan-teal-deep" aria-hidden="true" />
                  {countyName} County
                </p>
                {rows.map((r) => (
                  <p key={r.community} className="text-[11px] text-muted-foreground">
                    {r.community}
                  </p>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container max-w-4xl py-8 space-y-4 border-t border-border/30" aria-labelledby="prek-heading">
        <h2 id="prek-heading" className="text-lg font-bold text-foreground">
          Preschool in Michigan
        </h2>
        <p className="text-sm text-muted-foreground">
          PreK for All is Michigan's push toward universal state-funded preschool. Enrollment in
          the Great Start Readiness Program just hit a record high - but it still covers only
          about half of the state's four-year-olds.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {PREK_FOR_ALL_STATS.map((s) => (
            <Card key={s.label}>
              <CardContent className="py-3 space-y-1">
                <p className="text-xl font-bold text-foreground">{s.value}</p>
                <p className="text-[11px] font-medium text-muted-foreground">{s.label}</p>
                <p className="text-[11px] text-muted-foreground/80">{s.context}</p>
                <p className="text-[10px] text-muted-foreground/70">{s.source}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container max-w-4xl py-8 space-y-4 border-t border-border/30" aria-labelledby="landscape-heading">
        <h2 id="landscape-heading" className="text-lg font-bold text-foreground">
          Childcare and preschool
        </h2>
        <ChildcareEducationHub />
        <ChildcareDesertCard />
        <div className="flex flex-wrap gap-2">
          <Link
            to="/maternal-health"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            Maternal & infant health
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
          <Link
            to="/find-care?q=children"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            Find children & family services
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="container max-w-4xl py-8 border-t border-border/30">
        <Card className="bg-muted/30">
          <CardContent className="py-4 space-y-2">
            <p className="text-sm font-semibold text-foreground">What we don't have yet</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Michigan discontinued its statewide Kindergarten Entry (readiness) Assessment in
              2021, so no county-level readiness indicator exists to show. The closest available
              proxy is 3rd-grade M-STEP English language arts proficiency - 38.9% in spring 2025,
              an 11-year low, down from 39.6% in 2024 (MDE / CEPI via MI School Data) - but that
              measures a different grade and a different construct, not a substitute for a
              readiness assessment. County-level childcare capacity and preschool enrollment data
              (Great Start Readiness Program, Head Start) are on our roadmap for a future update
              but not yet on the platform.
            </p>
          </CardContent>
        </Card>
      </section>

      {county && (
        <section className="container max-w-4xl py-8 border-t border-border/30">
          <CountyInsightLinks countyName={county} />
        </section>
      )}
    </Layout>
  );
}
