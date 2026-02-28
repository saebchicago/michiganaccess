import { lazy, Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import { Database, Globe2, Building2, ShieldCheck } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import CitizenInitiativeBanner from "@/components/civic/CitizenInitiativeBanner";
import DatasetCard from "@/components/civic/DatasetCard";
import DataProvenance from "@/components/shared/DataProvenance";
import LazySection from "@/components/shared/LazySection";
import { STATEWIDE_DATASETS, DETROIT_DATASETS } from "@/data/datasetRegistry";
import { useCivicDataset } from "@/hooks/useCivicDataset";

const InsightPanel = lazy(() => import("@/components/civic/InsightPanel"));

const SectionFallback = () => (
  <div className="py-8 flex justify-center">
    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

/** Detail view when a dataset is selected */
function DatasetDetail({ datasetId }: { datasetId: string }) {
  const { data, loading, error, lastUpdated } = useCivicDataset(datasetId);
  const dataset = [...STATEWIDE_DATASETS, ...DETROIT_DATASETS].find((d) => d.id === datasetId);

  if (!dataset) return <p className="text-sm text-muted-foreground">Dataset not found.</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-foreground">{dataset.name}</h2>
      {dataset.description && (
        <p className="text-sm text-muted-foreground">{dataset.description}</p>
      )}

      {loading && <SectionFallback />}
      {error && (
        <p className="text-sm text-destructive">
          Unable to load data: {error}. This dataset may use placeholder endpoints.
        </p>
      )}

      {!loading && data.length > 0 && (
        <Suspense fallback={<SectionFallback />}>
          <InsightPanel data={data} datasetName={dataset.name} />
        </Suspense>
      )}

      {!loading && data.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-xs min-w-[500px]">
            <thead className="bg-muted/50">
              <tr>
                {Object.keys(data[0]).slice(0, 6).map((key) => (
                  <th key={key} className="px-3 py-2 text-left font-medium text-muted-foreground">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 10).map((row, i) => (
                <tr key={i} className="border-t border-border/50">
                  {Object.keys(data[0]).slice(0, 6).map((key) => (
                    <td key={key} className="px-3 py-2 text-foreground">
                      {String(row[key] ?? "—").slice(0, 80)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && data.length === 0 && !error && (
        <p className="text-sm text-muted-foreground">
          No records returned. This dataset may require specific query parameters or use placeholder endpoints.
        </p>
      )}

      <DataProvenance
        source={`${dataset.provider} — ${dataset.name}`}
        updated={lastUpdated?.toLocaleDateString() ?? "Pending"}
        methodologyHref="/data-validation"
      />
    </div>
  );
}

const CivicDataHubPage = () => {
  const [searchParams] = useSearchParams();
  const selectedDataset = searchParams.get("dataset");

  usePageMeta({
    title: "Civic Data Hub | Michigan Civic Intelligence",
    description:
      "Explore Michigan statewide and local civic datasets from ArcGIS and Socrata. Public open data for residents, advocates, and policymakers.",
    path: "/civic-data-hub",
  });

  return (
    <Layout>
      <Breadcrumbs items={[{ label: "Data & Insights", href: "/data-and-insights" }, { label: "Civic Data Hub" }]} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/5 to-background py-14 md:py-18">
        <div className="container max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5">
            <Database className="h-4 w-4 text-primary" aria-hidden="true" />
            <span className="text-sm font-medium text-primary">Civic Intelligence</span>
          </div>
          <h1 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">
            Michigan Civic Data Hub
          </h1>
          <p className="text-muted-foreground">
            Explore public datasets powering civic transparency across Michigan — from county
            boundaries and transportation to housing and public safety.
          </p>
        </div>
      </section>

      <div className="container py-8 space-y-12">
        <CitizenInitiativeBanner />

        {/* Dataset detail view */}
        {selectedDataset && (
          <LazySection minHeight="200px">
            <DatasetDetail datasetId={selectedDataset} />
          </LazySection>
        )}

        {/* Michigan Statewide Intelligence */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Globe2 className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-xl font-bold text-foreground">Michigan Statewide Intelligence</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {STATEWIDE_DATASETS.map((ds) => (
              <DatasetCard key={ds.id} source={ds} />
            ))}
          </div>
        </section>

        {/* Detroit Local Intelligence */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-xl font-bold text-foreground">Detroit Local Intelligence</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DETROIT_DATASETS.map((ds) => (
              <DatasetCard key={ds.id} source={ds} />
            ))}
          </div>
        </section>

        {/* Civic Infrastructure & Services */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-xl font-bold text-foreground">Civic Infrastructure & Services</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Access public directories for essential civic services across Michigan.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Libraries", href: "/libraries", desc: "Public library directory with county filtering" },
              { label: "Notary Services", href: "/notary-services", desc: "Find nearby notaries via official state resources" },
              { label: "Community Infrastructure", href: "/community-infrastructure", desc: "Courts, transit, voting, community centers" },
            ].map((item) => (
              <a key={item.href} href={item.href} className="block rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors">
                <h3 className="font-semibold text-sm text-foreground mb-1">{item.label}</h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </a>
            ))}
          </div>
        </section>

        {/* Data Transparency */}
        <section className="pb-4">
          <h2 className="text-xl font-bold text-foreground mb-4">Data Transparency</h2>
          <DataProvenance
            source="ArcGIS REST Services (State of Michigan GIS), City of Detroit Open Data (Socrata SODA API)"
            updated="Live — cached 10 min"
            methodologyHref="/data-validation"
          />
        </section>
      </div>
    </Layout>
  );
};

export default CivicDataHubPage;
