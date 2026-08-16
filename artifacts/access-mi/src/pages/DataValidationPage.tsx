import Layout from "@/components/layout/Layout";
import { usePageMeta } from "@/hooks/usePageMeta";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import {
  Database,
  ExternalLink,
  AlertTriangle,
  ShieldCheck,
  Clock,
  FileText,
  Info,
} from "lucide-react";
import {
  COUNTIES_COVERED,
  DATA_PUBLISHER_COUNT,
  DATA_SOURCE_COUNT,
} from "@/config/platformConstants";
import { DATA_CATALOG } from "@/data/dataCatalog";

/**
 * Rendered from the governed catalog in `src/data/dataCatalog.ts`. This
 * page used to keep its own hardcoded array, which drifted from the feed
 * registry - wrong publisher URLs, cadences that disagreed with the
 * registry, and publishers that appeared nowhere else. `pnpm
 * check:data-catalog` now fails the build if a local list reappears here.
 */
const DATA_SOURCES = [...DATA_CATALOG].sort((a, b) =>
  a.name.localeCompare(b.name),
);

const TYPE_LABELS: Record<
  string,
  { label: string; color: string; description: string }
> = {
  live_api: {
    label: "Live API",
    color:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    description: "Fetched in real-time or near-real-time from the source API.",
  },
  modeled: {
    label: "Modeled",
    color:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    description:
      "Derived from published research; may involve estimates or interpolation.",
  },
  curated: {
    label: "Curated",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    description: "Manually compiled and verified from official sources.",
  },
  static: {
    label: "Static Reference",
    color: "bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-300",
    description: "Point-in-time snapshot from published reports.",
  },
};

export default function DataValidationPage() {
  usePageMeta({
    title: "Data Sources & Validation",
    description:
      "Complete list of data sources, update cadences, and methodology behind Access Michigan's health, energy, civic, and transportation data.",
    path: "/data-validation",
    jsonLd: {
      "@type": "WebPage",
      name: "Data Sources & Validation - Access Michigan",
      description:
        "Transparency page listing all data sources, methodologies, and limitations.",
      url: "https://accessmi.org/data-validation",
    },
  });

  return (
    <Layout>
      <div className="container py-8 max-w-4xl">
        <Breadcrumbs items={[{ label: "Data Sources & Validation" }]} />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mt-6 mb-10"
        >
          <Badge
            variant="outline"
            className="mb-3 text-xs uppercase tracking-wider border-primary/30 text-primary"
          >
            <Database className="h-3 w-3 mr-1" /> Transparency
          </Badge>
          <h1 className="text-3xl font-bold text-foreground mb-3">
            Data Sources & Validation
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Access Michigan is an independent civic project. This page documents
            every data source, how it's used, and what limitations apply. We
            believe transparency is essential to trust.
          </p>
        </motion.div>

        {/* Platform statement */}
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardContent className="py-5">
            <p className="text-sm text-foreground leading-relaxed">
              <strong>Access Michigan</strong> is an independent civic project
              that organizes Michigan health, housing, energy, transportation,
              and legal resources in one place. It does not track individuals,
              use cookies, or share personal data. All data comes from public
              government sources and is documented below.
            </p>
          </CardContent>
        </Card>

        {/* Data type legend */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" /> Data Type Legend
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(TYPE_LABELS).map(([key, val]) => (
              <div
                key={key}
                className="flex items-start gap-3 p-3 rounded-lg border border-border"
              >
                <Badge className={`${val.color} text-[10px] shrink-0`}>
                  {val.label}
                </Badge>
                <p className="text-xs text-muted-foreground">
                  {val.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <Separator className="my-6" />

        {/* Data sources table */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" /> All Data Sources (
            {DATA_SOURCES.length})
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            Every entry below is reconciled at build time against the platform
            feed registry ({DATA_SOURCE_COUNT} feeds from{" "}
            {DATA_PUBLISHER_COUNT} publishers). Where a dataset's cadence or
            link differs from its publisher's headline feed, the reason is
            stated on the card rather than left to drift.
          </p>
          <div className="space-y-4">
            {DATA_SOURCES.map((src, i) => (
              <motion.div
                key={src.name}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <CardTitle className="text-sm">{src.name}</CardTitle>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {src.publisherOrg}
                          {src.kind === "reference" &&
                            " - reference link, no figure computed from it"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={`${TYPE_LABELS[src.access].color} text-[10px]`}
                        >
                          {TYPE_LABELS[src.access].label}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" /> {src.cadence}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-1.5">
                    <p className="text-xs text-muted-foreground">
                      {src.description}
                    </p>
                    <p className="text-xs text-foreground">
                      <strong>Used for:</strong>{" "}
                      {src.poweredSurfaces.join(", ")}
                    </p>
                    {src.cadenceNote && (
                      <p className="text-[11px] text-muted-foreground/80">
                        <strong>Cadence note:</strong> {src.cadenceNote}
                      </p>
                    )}
                    {src.urlNote && (
                      <p className="text-[11px] text-muted-foreground/80">
                        <strong>Link note:</strong> {src.urlNote}
                      </p>
                    )}
                    <a
                      href={src.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-primary hover:underline inline-flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" /> {src.sourceUrl}
                    </a>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <Separator className="my-8" />

        {/* Resource database section */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" /> Resource Database
          </h2>
          <Card>
            <CardContent className="py-5 space-y-3 text-sm text-muted-foreground">
              <p>
                The Access Michigan resource database indexes records across
                hospitals, providers, services, and facility rows, including{" "}
                <strong className="text-foreground">
                  88 healthcare facilities
                </strong>{" "}
                and{" "}
                <strong className="text-foreground">170+ municipalities</strong>{" "}
                across all {COUNTIES_COVERED} Michigan counties.
              </p>
              <p>
                <strong className="text-foreground">Curation:</strong> Resources
                are manually compiled from government directories, health
                department listings, and verified nonprofit registries. Each
                entry includes source organization, services offered, and
                contact information.
              </p>
              <p>
                <strong className="text-foreground">Tags:</strong> Tags like
                "free," "walk-ins welcome," "bilingual staff," and "no ID
                required" reflect information published by the provider. We
                recommend confirming details directly with the provider.
              </p>
              <p>
                <strong className="text-foreground">Updates:</strong> Resources
                are reviewed periodically. The "last updated" timestamp on data
                pages reflects the most recent database modification.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Limitations */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-michigan-gold-deep" /> Limitations
            & Disclaimers
          </h2>
          <Card className="border-michigan-gold/20">
            <CardContent className="py-5 space-y-3 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">Not exhaustive.</strong>{" "}
                This platform does not list every available service in Michigan.
                Results should be supplemented with local 211 services and
                direct provider inquiries.
              </p>
              <p>
                <strong className="text-foreground">
                  Not medical or legal advice.
                </strong>{" "}
                Health information, drug data, and FOIA templates are provided
                for informational purposes. Consult healthcare providers and
                legal professionals for personal decisions.
              </p>
              <p>
                <strong className="text-foreground">Modeled data.</strong>{" "}
                Energy burden maps and some health visualizations use modeled
                estimates derived from published research. These are labeled as
                such and should not be interpreted as individualized risk
                predictions.
              </p>
              <p>
                <strong className="text-foreground">
                  Illustrative scenarios.
                </strong>{" "}
                Impact stories and use case examples on partner and homepage
                sections are hypothetical illustrations of how the platform
                could be used - not documented outcomes.
              </p>
              <p>
                <strong className="text-foreground">No endorsements.</strong>{" "}
                Listing a resource, organization, or data source does not
                constitute endorsement. Similarly, references to data partners
                (CDC, CMS, etc.) indicate data sourcing, not organizational
                affiliation.
              </p>
            </CardContent>
          </Card>
        </section>

        <div className="text-center text-[10px] text-muted-foreground space-y-1">
          <p>
            Questions about our data?{" "}
            <Link to="/contact" className="text-primary hover:underline">
              Contact us
            </Link>{" "}
            ·{" "}
            <Link to="/methodology" className="text-primary hover:underline">
              View methodology
            </Link>
          </p>
          <p>Last reviewed: March 2026</p>
        </div>
      </div>
    </Layout>
  );
}
