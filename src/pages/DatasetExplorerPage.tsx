import { lazy, Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import { Database } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useCounty } from "@/contexts/CountyContext";
import type { Pillar } from "@/data/pillarRegistry";

const DatasetExplorer = lazy(() => import("@/components/pillars/DatasetExplorer"));

const SectionFallback = () => (
  <div className="py-8 flex justify-center">
    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

const DatasetExplorerPage = () => {
  const [searchParams] = useSearchParams();
  const { county } = useCounty();
  const pillarParam = searchParams.get("pillar") as Pillar | null;

  usePageMeta({
    title: "Dataset Explorer | Michigan Civic Intelligence",
    description:
      "Explore real Michigan datasets across health, environment, mobility, and economic pillars. All data from public authoritative sources.",
    path: "/datasets",
  });

  return (
    <Layout>
      <Breadcrumbs
        items={[
          { label: "Data & Insights", href: "/data-and-insights" },
          { label: "Dataset Explorer" },
        ]}
      />

      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/5 to-background py-12 md:py-16">
        <div className="container max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5">
            <Database className="h-4 w-4 text-primary" aria-hidden="true" />
            <span className="text-sm font-medium text-primary">Civic Intelligence</span>
          </div>
          <h1 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">
            Michigan Dataset Explorer
          </h1>
          <p className="text-muted-foreground">
            Browse datasets across four civic pillars — health access, environmental risk,
            mobility, and economic stress. All data sourced from authoritative public agencies.
          </p>
        </div>
      </section>

      <div className="container py-8">
        <Suspense fallback={<SectionFallback />}>
          <DatasetExplorer
            defaultPillar={pillarParam ?? undefined}
            countyFilter={county ?? undefined}
          />
        </Suspense>
      </div>
    </Layout>
  );
};

export default DatasetExplorerPage;
