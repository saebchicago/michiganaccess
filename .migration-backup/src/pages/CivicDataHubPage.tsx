import { useState, useMemo, lazy, Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import { Database, Globe2, Building2, ShieldCheck, ArrowUpDown, ExternalLink, Search } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import CitizenInitiativeBanner from "@/components/civic/CitizenInitiativeBanner";
import DatasetCard from "@/components/civic/DatasetCard";
import DataProvenance from "@/components/shared/DataProvenance";
import LazySection from "@/components/shared/LazySection";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { STATEWIDE_DATASETS, DETROIT_DATASETS } from "@/data/datasetRegistry";
import { useCivicDataset } from "@/hooks/useCivicDataset";

const InsightPanel = lazy(() => import("@/components/civic/InsightPanel"));

const SectionFallback = () => (
  <div className="py-8 flex justify-center">
    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

/** Authoritative data catalog — curated list of public datasets referenced by Access Michigan */
interface CatalogEntry {
  name: string;
  domain: "Health" | "Social" | "Environment" | "Safety" | "Infrastructure" | "Civic";
  geography: "State" | "County" | "ZIP" | "Tract" | "Facility";
  frequency: string;
  sourceUrl: string;
  description: string;
}

const DATA_CATALOG: CatalogEntry[] = [
  { name: "CDC Social Vulnerability Index (SVI)", domain: "Health", geography: "Tract", frequency: "Every 4 years", sourceUrl: "https://www.atsdr.cdc.gov/placeandhealth/svi/", description: "Census tract-level vulnerability scores across socioeconomic, housing, and demographic dimensions." },
  { name: "United For ALICE — Michigan", domain: "Social", geography: "County", frequency: "Annual", sourceUrl: "https://www.unitedforalice.org/county-reports/Michigan", description: "Asset-Limited, Income-Constrained, Employed household counts and thresholds by county." },
  { name: "MDHHS Health Equity Data", domain: "Health", geography: "County", frequency: "Annual", sourceUrl: "https://www.michigan.gov/mdhhs/inside-mdhhs/legislationpolicy/2022-2024-social-determinants-of-health-strategy", description: "State social determinants of health strategy, hubs, and equity indicators." },
  { name: "Michigan 2-1-1", domain: "Social", geography: "County", frequency: "Ongoing", sourceUrl: "https://mi211.org", description: "Community resource referral database — food, housing, utilities, transportation." },
  { name: "CMS Provider Data Catalog", domain: "Health", geography: "Facility", frequency: "Monthly", sourceUrl: "https://data.cms.gov/provider-data", description: "Hospital quality, provider enrollment, Medicare utilization, and Open Payments data." },
  { name: "HHS Medicaid Provider Spending", domain: "Health", geography: "State", frequency: "Annual", sourceUrl: "https://opendata.hhs.gov/datasets/medicaid-provider-spending/", description: "State-level Medicaid provider spending and utilization patterns." },
  { name: "EPA AirNow", domain: "Environment", geography: "County", frequency: "Hourly", sourceUrl: "https://www.airnow.gov/", description: "Real-time air quality index (AQI) readings from monitoring stations." },
  { name: "EGLE Drinking Water", domain: "Environment", geography: "Facility", frequency: "Ongoing", sourceUrl: "https://www.michigan.gov/egle/about/organization/drinking-water-and-environmental-health", description: "Public water system violations, advisories, and compliance data." },
  { name: "NHTSA FARS", domain: "Safety", geography: "County", frequency: "Annual", sourceUrl: "https://www.nhtsa.gov/research-data/fatality-analysis-reporting-system-fars", description: "Fatal traffic crash records by location, type, and contributing factors." },
  { name: "MSP Traffic Stop Data", domain: "Safety", geography: "State", frequency: "Annual", sourceUrl: "https://www.michigan.gov/msp/public-information/transparency/accordion/reports/traffic-stop-data-main", description: "Michigan State Police traffic stop demographic data for transparency and accountability." },
  { name: "MPSC Utility Reports", domain: "Infrastructure", geography: "State", frequency: "Annual", sourceUrl: "https://www.michigan.gov/mpsc", description: "Electric and gas utility reliability, outage metrics (SAIDI/SAIFI), and rate cases." },
  { name: "County Health Rankings", domain: "Health", geography: "County", frequency: "Annual", sourceUrl: "https://www.countyhealthrankings.org/explore-health-rankings/michigan", description: "County-level health outcomes, behaviors, clinical care, and social/economic factors." },
  { name: "Census ACS 5-Year Estimates", domain: "Social", geography: "Tract", frequency: "Annual", sourceUrl: "https://data.census.gov/", description: "Demographic, economic, housing, and social characteristics at multiple geographies." },
  { name: "HRSA Health Professional Shortage Areas", domain: "Health", geography: "County", frequency: "Annual", sourceUrl: "https://data.hrsa.gov/", description: "Designated primary care, mental health, and dental provider shortage areas." },
  { name: "FBI Crime Data Explorer", domain: "Safety", geography: "County", frequency: "Annual", sourceUrl: "https://cde.ucr.cjis.gov/", description: "Uniform Crime Reporting (UCR) data including violent and property crime rates." },
  { name: "Michigan SOS FOIA Portal", domain: "Civic", geography: "State", frequency: "Ongoing", sourceUrl: "https://www.michigan.gov/sos", description: "Public records requests, campaign finance data, and election administration." },
];

const DOMAIN_COLORS: Record<string, string> = {
  Health: "bg-primary/10 text-primary",
  Social: "bg-michigan-gold/10 text-michigan-gold",
  Environment: "bg-michigan-forest/10 text-michigan-forest",
  Safety: "bg-michigan-coral/10 text-michigan-coral",
  Infrastructure: "bg-michigan-teal/10 text-michigan-teal",
  Civic: "bg-michigan-navy/10 text-michigan-navy",
};

type SortKey = "name" | "domain" | "geography" | "frequency";

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
          This dataset is being refreshed. Try again in a moment, or explore other civic data sections below.
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
                  <th key={key} className="px-3 py-2 text-left font-medium text-muted-foreground">{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 10).map((row, i) => (
                <tr key={i} className="border-t border-border/50">
                  {Object.keys(data[0]).slice(0, 6).map((key) => (
                    <td key={key} className="px-3 py-2 text-foreground">{String(row[key] ?? "—").slice(0, 80)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!loading && data.length === 0 && !error && (
        <p className="text-sm text-muted-foreground">No records returned. This dataset may require specific query parameters.</p>
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
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("domain");
  const [sortAsc, setSortAsc] = useState(true);

  usePageMeta({
    title: "Civic Data Hub — Michigan Data Catalog",
    description: "Browse Michigan's authoritative public datasets: health, social, environment, safety, and infrastructure. Direct links to official sources.",
    path: "/civic-data-hub",
  });

  const filtered = useMemo(() => {
    const items = DATA_CATALOG.filter(
      (d) =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.domain.toLowerCase().includes(search.toLowerCase()) ||
        d.description.toLowerCase().includes(search.toLowerCase())
    );
    items.sort((a, b) => {
      const av = a[sortKey].toLowerCase();
      const bv = b[sortKey].toLowerCase();
      return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return items;
  }, [search, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const SortButton = ({ k, label }: { k: SortKey; label: string }) => (
    <button
      onClick={() => toggleSort(k)}
      className="flex items-center gap-1 text-left font-medium text-muted-foreground hover:text-foreground transition-colors"
      aria-label={`Sort by ${label}`}
    >
      {label}
      <ArrowUpDown className={`h-3 w-3 ${sortKey === k ? "text-primary" : "text-muted-foreground/40"}`} />
    </button>
  );

  return (
    <Layout>
      <Breadcrumbs items={[{ label: "Data & Insights", href: "/data-and-insights" }, { label: "Civic Data Hub" }]} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/5 to-background py-14 md:py-18">
        <div className="container max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5">
            <Database className="h-4 w-4 text-primary" aria-hidden="true" />
            <span className="text-sm font-medium text-primary">Michigan Data Catalog</span>
          </div>
          <h1 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">
            Michigan Civic Data Hub
          </h1>
          <p className="text-muted-foreground">
            Browse public datasets powering civic transparency across Michigan — from health and housing to environment, safety, and infrastructure.
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

        {/* ═══ DATA CATALOG TABLE ═══ */}
        <section>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">Authoritative Data Sources</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {DATA_CATALOG.length} public datasets referenced by Access Michigan — each with a direct link to the official source.
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter datasets…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-sm"
                aria-label="Filter datasets by name, domain, or description"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-muted/30">
                <tr>
                  <th className="px-4 py-3 text-left w-1/4"><SortButton k="name" label="Dataset" /></th>
                  <th className="px-3 py-3 text-left w-20"><SortButton k="domain" label="Domain" /></th>
                  <th className="px-3 py-3 text-left w-20"><SortButton k="geography" label="Level" /></th>
                  <th className="px-3 py-3 text-left w-24"><SortButton k="frequency" label="Updated" /></th>
                  <th className="px-3 py-3 text-left">Description</th>
                  <th className="px-3 py-3 w-16" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <tr key={d.name} className="border-t border-border/40 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground text-xs">{d.name}</td>
                    <td className="px-3 py-3">
                      <Badge variant="outline" className={`text-[10px] ${DOMAIN_COLORS[d.domain] || ""}`}>{d.domain}</Badge>
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">{d.geography}</td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">{d.frequency}</td>
                    <td className="px-3 py-3 text-xs text-muted-foreground max-w-xs">{d.description}</td>
                    <td className="px-3 py-3">
                      <a href={d.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium" aria-label={`Open ${d.name} source`}>
                        Source <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">No datasets match "{search}"</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* How to use this for analysis */}
        <section>
          <Card className="border-primary/20 bg-primary/[0.03]">
            <CardContent className="py-6 space-y-3">
              <h2 className="text-lg font-bold text-foreground">How to Use This for Analysis</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The datasets listed above are the same sources used by CHNA teams, health system planners, journalists, and civic researchers across Michigan. Each links directly to the authoritative source — we do not host or mirror these datasets. To use them in your work: <strong>1)</strong> Click "Source" to visit the official portal. <strong>2)</strong> Download the data in the format you need (CSV, shapefile, API). <strong>3)</strong> Cross-reference with Access Michigan's county briefs and comparison tools for context. <strong>4)</strong> Cite both the original source and Access Michigan when publishing.
              </p>
              <p className="text-xs text-muted-foreground/70">
                Questions about data methodology or availability? <a href="/contact" className="text-primary hover:underline">Contact us</a> or see the <a href="/methodology" className="text-primary hover:underline">full methodology</a>.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Michigan Statewide Intelligence (existing dataset cards) */}
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
              <a key={item.href} href={item.href} className="block rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
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
