import { ArrowRight, Layers, MapPinned, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { usePageMeta } from "@/hooks/usePageMeta";

const REPLACEMENTS = [
  {
    title: "Community Opportunity Atlas",
    body: "Start with a county, supported city, or Michigan ZIP. See governed local signals, data-resolution status, action pathways, comparisons, and shareable findings.",
    href: "/opportunity",
    cta: "Explore a community",
  },
  {
    title: "Health Map",
    body: "Use the maintained facility map for hospitals, clinics, FQHCs, and behavioral-health services across Michigan.",
    href: "/health-map",
    cta: "Open the Health Map",
  },
  {
    title: "Environment",
    body: "Use the governed environmental intelligence surfaces for air, water, energy, and disaster context with source-specific caveats.",
    href: "/environment",
    cta: "Explore environmental data",
  },
  {
    title: "Food Access Explorer",
    body: "Use the maintained county food-access surface while the newer USDA 2025 tract ingestion is validated for the Opportunity Atlas.",
    href: "/food-access",
    cta: "Open food access",
  },
] as const;

export default function DeepMapPage() {
  usePageMeta({
    title: "Legacy Deep Map | Access Michigan",
    description:
      "The early Deep Map prototype is retired from public analysis. Use AccessMI's governed Community Opportunity Atlas, Health Map, Environment, and Food Access surfaces instead.",
    path: "/map/layers",
  });

  return (
    <Layout>
      <Breadcrumbs
        items={[
          { label: "Explore", href: "/explore" },
          { label: "Legacy Deep Map" },
        ]}
      />
      <main className="container max-w-5xl py-10 sm:py-14">
        <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-semibold text-muted-foreground">
                <Layers className="h-4 w-4" aria-hidden="true" />
                Legacy exploratory surface
              </div>
              <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Deep Map prototype retired from public analysis
              </h1>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                This early map combined several experimental layers before AccessMI had a consistent statewide provenance, geography, and freshness contract for each one. It is no longer presented as a current statewide analytical map.
              </p>
            </div>
            <ShieldCheck className="h-10 w-10 shrink-0 text-primary" aria-hidden="true" />
          </div>

          <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm leading-relaxed text-foreground">
            <strong>Why this changed:</strong> AccessMI does not substitute a small county-centroid sample, stale release, or coarse proxy when a source is not yet normalized at the geography a claim requires. The newer Opportunity Atlas keeps incomplete neighborhood layers explicitly PENDING until authoritative ingestion or redistribution requirements are satisfied.
          </div>

          <Button className="mt-6 min-h-11 gap-2" asChild>
            <Link to="/opportunity">
              <MapPinned className="h-4 w-4" aria-hidden="true" />
              Open the Community Opportunity Atlas
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </section>

        <section className="mt-8" aria-labelledby="replacement-heading">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Use the maintained surface for the question
          </p>
          <h2 id="replacement-heading" className="mt-1 font-display text-2xl font-bold text-foreground">
            Governed paths forward
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {REPLACEMENTS.map((item) => (
              <article key={item.href} className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                <Link
                  to={item.href}
                  className="mt-4 inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {item.cta}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        </section>
      </main>
    </Layout>
  );
}
