import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { usePageMeta } from "@/hooks/usePageMeta";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, GitBranch, Mail, MessageSquare, ShieldCheck } from "lucide-react";
import {
  DATA_SOURCE_DISPLAY,
  COUNTIES_COVERED,
} from "@/config/platformConstants";

const FACTS = [
  { label: "Project Type", value: "Independent civic project" },
  {
    label: "Geographic Coverage",
    value: `${COUNTIES_COVERED} / ${COUNTIES_COVERED} Michigan counties`,
  },
  { label: "Public Data Sources", value: DATA_SOURCE_DISPLAY },
  { label: "Languages", value: "English, Spanish, Arabic, Bengali" },
  { label: "Access", value: "Free - No login required" },
  { label: "Analytics", value: "Aggregate GA4 measurement" },
  { label: "Data Policy", value: "No sale of personal data" },
];

const FIELD_TAGS = [
  "civic data",
  "open civic data",
  "social-service navigation",
  "government transparency",
  "data journalism",
];

export default function PressPage() {
  usePageMeta({
    title: "Press, Media & Directory Kit | Access Michigan",
    description:
      "Directory-ready project description, verified facts, press context, and media resources for AccessMI, an independent Michigan civic-intelligence project.",
    path: "/press",
    jsonLd: {
      "@type": "WebPage",
      name: "Press, Media & Directory Kit - Access Michigan",
      url: "https://accessmi.org/press",
    },
  });

  return (
    <Layout>
      <section className="bg-gradient-to-br from-primary/8 via-primary/3 to-background py-14">
        <div className="container max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Badge
              variant="outline"
              className="mb-3 border-primary/30 text-xs uppercase tracking-wider text-primary"
            >
              Press · Media · Directory Kit
            </Badge>
            <h1 className="mb-2 text-3xl font-bold text-foreground">
              Describe AccessMI accurately
            </h1>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              AccessMI should be listed and cited as an independent civic-tech
              project and public-data journal, not as a government service,
              nonprofit, vendor, or benefits administrator.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container max-w-3xl space-y-10 py-10">
        <section aria-labelledby="identity-heading">
          <h2 id="identity-heading" className="mb-4 text-lg font-bold text-foreground">
            Project identity
          </h2>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="space-y-4 py-5">
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Type
                  </p>
                  <p className="mt-1 font-medium text-foreground">
                    Independent civic-intelligence project / public-data journal
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Legal / institutional status
                  </p>
                  <p className="mt-1 font-medium text-foreground">
                    Unaffiliated independent project
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Geography
                  </p>
                  <p className="mt-1 font-medium text-foreground">
                    Michigan · all {COUNTIES_COVERED} counties
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Primary audiences
                  </p>
                  <p className="mt-1 font-medium text-foreground">
                    Residents; analysts; journalists; planners; civic partners
                  </p>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-background p-4 text-sm text-muted-foreground">
                <strong className="font-semibold text-foreground">Not:</strong>{" "}
                a government agency or official Michigan portal; a health
                system; a 211 provider; a benefits administrator; or software
                sold to governments.
              </div>
            </CardContent>
          </Card>
        </section>

        <section aria-labelledby="listing-copy-heading">
          <h2 id="listing-copy-heading" className="mb-4 text-lg font-bold text-foreground">
            Directory-ready copy
          </h2>
          <div className="space-y-4">
            <Card>
              <CardContent className="py-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  One-line description
                </p>
                <p className="text-sm leading-relaxed text-foreground">
                  AccessMI is an independent civic-intelligence project and
                  public-data journal that turns public records into sourced,
                  county- and ZIP-level intelligence for Michigan's 83 counties
                  so residents can find help and analysts can trace figures to
                  their source.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Longer description
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  AccessMI is an independent, unaffiliated public-data journal
                  for Michigan. It covers all 83 counties and serves two
                  audiences: residents who need care, food, housing, benefits,
                  and crisis pathways, and analysts, journalists, and planners
                  who need comparable local indicators with source context.
                  Quantitative outputs use provenance labels including VERIFIED,
                  MODELED, PROJECTED, and PENDING. Eligibility content is
                  educational only; applications and final determinations remain
                  with official programs. AccessMI is not a government agency,
                  health system, benefits administrator, or 211 provider. The
                  project is maintained independently, uses public data, accepts
                  corrections, and publishes its methods and source catalog.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section aria-labelledby="tags-heading">
          <h2 id="tags-heading" className="mb-3 text-lg font-bold text-foreground">
            Suggested field tags
          </h2>
          <div className="flex flex-wrap gap-2">
            {FIELD_TAGS.map((tag) => (
              <Badge key={tag} variant="secondary" className="font-normal">
                {tag}
              </Badge>
            ))}
          </div>
        </section>

        <section aria-labelledby="facts-heading">
          <h2 id="facts-heading" className="mb-4 text-lg font-bold text-foreground">
            Quick facts
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FACTS.map((fact) => (
              <Card key={fact.label}>
                <CardContent className="py-4 text-center">
                  <p className="text-sm font-bold text-foreground">{fact.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{fact.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Analytics and privacy language intentionally follows the public
            privacy policy: AccessMI uses aggregate Google Analytics measurement
            and may receive information that a visitor voluntarily submits; it
            does not claim that no data is ever processed.
          </p>
        </section>

        <section aria-labelledby="accountability-heading">
          <h2 id="accountability-heading" className="mb-3 text-lg font-bold text-foreground">
            Accountability & verification
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              to="/about"
              className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
            >
              <ShieldCheck className="mb-2 h-5 w-5 text-primary" />
              <p className="text-sm font-semibold text-foreground">About & methodology</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Independence, limitations, sourcing, and public-benefit commitments.
              </p>
            </Link>
            <Link
              to="/feedback?initial_category=data_accuracy"
              className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
            >
              <MessageSquare className="mb-2 h-5 w-5 text-primary" />
              <p className="text-sm font-semibold text-foreground">Suggest a correction</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Report a data error, stale source, broken link, or framing concern.
              </p>
            </Link>
            <Link
              to="/data-sources"
              className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
            >
              <ExternalLink className="mb-2 h-5 w-5 text-primary" />
              <p className="text-sm font-semibold text-foreground">Source catalog</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Inspect the public sources behind the project's civic intelligence.
              </p>
            </Link>
            <a
              href="https://github.com/saebchicago/michiganaccess"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
            >
              <GitBranch className="mb-2 h-5 w-5 text-primary" />
              <p className="text-sm font-semibold text-foreground">Public source code</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Review implementation history and repository contents on GitHub.
              </p>
            </a>
          </div>
        </section>

        <section aria-labelledby="media-contact-heading">
          <h2 id="media-contact-heading" className="mb-3 text-lg font-bold text-foreground">
            Media & directory contact
          </h2>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="flex items-center gap-4 py-4">
              <Mail className="h-6 w-6 flex-shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Questions, corrections, or listing verification
                </p>
                <Link
                  to="/contact"
                  className="flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  Contact AccessMI <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>

        <section aria-labelledby="coverage-heading">
          <h2 id="coverage-heading" className="mb-3 text-lg font-bold text-foreground">
            Coverage & mentions
          </h2>
          <p className="text-sm text-muted-foreground">
            External coverage should be added here only after a verifiable
            publication, citation, library guide, county memo, or partner reference
            exists. No placeholder endorsements are presented as evidence.
          </p>
        </section>
      </div>
    </Layout>
  );
}
