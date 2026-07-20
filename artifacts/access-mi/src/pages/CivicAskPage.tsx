import { useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { usePageMeta } from "@/hooks/usePageMeta";
import { CivicAskPanel } from "@/components/civic/CivicAskPanel";
import { ShieldCheck, Database, Zap } from "lucide-react";

const HOW_IT_WORKS = [
  {
    icon: Database,
    title: "On-site data only",
    body: "Every answer is assembled from AccessMI's own verified datasets - CDC PLACES, HRSA HPSA, BLS LAUS, ACS, and more. No data is sent to external AI services.",
  },
  {
    icon: ShieldCheck,
    title: "Provenance on every figure",
    body: "Each data point displays its integrity label (VERIFIED or MODELED), the exact source dataset, and its vintage year so you can trace every claim.",
  },
  {
    icon: Zap,
    title: "All 83 Michigan counties",
    body: "Coverage spans every Michigan county. When data is thin for a county, the engine says so rather than inventing values.",
  },
];

export default function CivicAskPage() {
  usePageMeta({
    title: "Civic Intelligence - Ask AccessMI",
    description:
      "Ask plain-language questions about any Michigan county and get grounded, provenance-labeled answers from AccessMI's on-site datasets.",
    path: "/ask",
  });

  const [searchParams] = useSearchParams();
  const initialQuestion = searchParams.get("q") ?? undefined;

  return (
    <Layout>
      <div className="container max-w-3xl py-8 space-y-8">
        <Breadcrumbs items={[{ label: "Civic Intelligence" }]} />

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Civic Intelligence
          </h1>
          <p className="text-muted-foreground">
            Ask a plain-language question about any of Michigan's 83 counties.
            Every answer is built from AccessMI's on-site data - no fabrication,
            no unlabeled figures.
          </p>
        </div>

        <CivicAskPanel initialQuestion={initialQuestion} />

        <div className="grid sm:grid-cols-3 gap-4 pt-2">
          {HOW_IT_WORKS.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-lg border border-border p-4 space-y-2"
            >
              <div className="flex items-center gap-2 text-sm font-medium">
                <Icon className="h-4 w-4 text-primary" />
                {title}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {body}
              </p>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-muted-foreground border-t border-border pt-4">
          Data labels: <strong>VERIFIED</strong> = primary federal or state
          source (direct measurement); <strong>MODELED</strong> = statistical
          estimate derived from verified inputs (e.g., CDC MRP, HRSA county
          rollup). For policy decisions, always consult primary sources
          directly.
        </p>
      </div>
    </Layout>
  );
}
