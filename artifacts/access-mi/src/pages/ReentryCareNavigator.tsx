import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  IdCard,
  Home,
  Heart,
  Briefcase,
  Scale,
  Phone,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { usePageMeta } from "@/hooks/usePageMeta";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Source: MDOC press releases, May 7 2025 and Jul 2 2025; MLPP analysis of MDOC data, 2022.
const REENTRY_STATS = [
  {
    label: "Prison population",
    value: "32,778",
    context: "End of 2024, down from a 51,554 peak in 2007 - a 17-year low",
    source: "MDOC, May 2025",
  },
  {
    label: "3-year recidivism",
    value: "21.0%",
    context: "Lowest rate on state record; 79% of 2021 parolees have not returned",
    source: "MDOC, Jul 2025",
  },
  {
    label: "Vocational Village recidivism",
    value: "12%",
    context: "For program graduates, versus 21.0% statewide",
    source: "MDOC, Jul 2025",
  },
  {
    label: "Vocational Village employment",
    value: "69%",
    context: "Of graduates employed while on parole",
    source: "MLPP analysis of MDOC data, 2022",
  },
];

const SECTIONS = [
  {
    id: "id",
    icon: IdCard,
    title: "Get Your ID",
    items: [
      "Secretary of State: state ID ($10, fee waiver available through parole)",
      "Social Security card replacement (free, form SS-5)",
      "Birth certificate from Vital Records ($34)",
    ],
    note: "Michigan does not yet automatically provide state ID upon release. Ask your parole agent about fee waiver programs.",
  },
  {
    id: "housing",
    icon: Home,
    title: "Find Housing",
    items: [
      "MDOC Offender Success transitional housing (referral through parole agent)",
      "Michigan 211 housing search: call 211",
      "MSHDA emergency housing assistance",
      "Salvation Army transitional housing",
    ],
    note: "Many landlords run background checks. The Fair Chance Housing movement is expanding in Michigan.",
  },
  {
    id: "healthcare",
    icon: Heart,
    title: "Get Healthcare",
    items: [
      "Healthy Michigan Plan (Medicaid) - apply immediately, most returning citizens qualify",
      "FQHCs (community health centers) - serve everyone regardless of background",
      "Substance use treatment: MDOC OARS, Recovery Community Organizations",
      "Mental health crisis: 988 Suicide & Crisis Lifeline",
      "Hepatitis C treatment: MDOC expanded funding to $10.5M",
    ],
    note: null,
  },
  {
    id: "employment",
    icon: Briefcase,
    title: "Find Employment",
    items: [
      "Michigan Works! offices (all 83 counties)",
      "MiCRI (Michigan Citizen Reentry Initiative) - job training + placement",
      "Vocational Village graduates: see employment and recidivism outcomes above",
      "MDOC Goodwill Flip the Script",
      "Michigan Rehabilitation Services",
    ],
    note: null,
  },
  {
    id: "legal",
    icon: Scale,
    title: "Legal Help",
    items: [
      "Michigan Legal Help (free, self-help resources)",
      "State Appellate Defender Office",
      "Expungement: Michigan Clean Slate law (automatic for some offenses after waiting period)",
      "Child support modification (if applicable)",
    ],
    note: null,
  },
];

export default function ReentryCareNavigator() {
  usePageMeta({
    title:
      "Coming Home to Michigan | Reentry Resources for Housing, Healthcare, Employment | accessmi.org",
    description:
      "Housing, healthcare, ID, employment, and legal help for returning citizens and their families across 83 Michigan counties.",
    path: "/reentry",
  });

  return (
    <Layout>
      <Breadcrumbs items={[{ label: "Reentry Resources" }]} />

      <section className="bg-gradient-to-b from-primary/5 to-background py-14">
        <div className="container max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Badge
              variant="outline"
              className="mb-3 text-xs uppercase tracking-wider border-primary/30 text-primary"
            >
              Reentry Support
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Coming home to Michigan.
            </h1>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Housing, healthcare, ID, jobs, legal help. Statewide. For
              returning citizens and their families.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="container max-w-3xl py-6 space-y-4" aria-labelledby="reentry-stats-heading">
        <h2 id="reentry-stats-heading" className="text-lg font-bold text-foreground">
          Reentry in Michigan
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {REENTRY_STATS.map((s) => (
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

      <div className="container max-w-3xl py-10 space-y-4">
        <Accordion type="multiple" defaultValue={["id", "healthcare"]}>
          {SECTIONS.map((section, i) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <AccordionItem
                value={section.id}
                className="border rounded-xl mb-3 px-2"
              >
                <AccordionTrigger className="py-4 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <section.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {section.title}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 px-2">
                  <ul className="space-y-2">
                    {section.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  {section.note && (
                    <p className="text-xs text-muted-foreground mt-3 p-3 rounded-lg bg-muted/50 border border-border">
                      {section.note}
                    </p>
                  )}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>

        {/* Family support */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-5">
            <p className="text-sm text-foreground">
              <strong>For families:</strong> Nation Outside represents 2M+
              Michigan families impacted by the criminal legal system.{" "}
              <a
                href="https://nationoutside.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                nationoutside.org <ExternalLink className="inline h-3 w-3" />
              </a>
            </p>
          </CardContent>
        </Card>

        {/* 211 CTA */}
        <Card className="border-michigan-teal/20 bg-michigan-teal/5">
          <CardContent className="p-5 text-center">
            <Phone className="h-6 w-6 text-michigan-teal-deep mx-auto mb-2" />
            <p className="text-sm font-semibold text-foreground">
              Not sure where to start?
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              Call 211 - they can connect you to local reentry services.
            </p>
            <Button variant="outline" size="sm" asChild>
              <a href="tel:211">Call 2-1-1 (Free, 24/7)</a>
            </Button>
          </CardContent>
        </Card>

        <p className="text-[10px] text-muted-foreground text-center">
          Sources: MDOC Offender Success, Michigan Works!, MiCRI, Michigan Legal
          Help, MSHDA, MDHHS. Access Michigan is not affiliated with MDOC or any
          government agency.
        </p>
      </div>
    </Layout>
  );
}
