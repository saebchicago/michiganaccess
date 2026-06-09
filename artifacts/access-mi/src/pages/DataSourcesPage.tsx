import { motion } from "framer-motion";
import { Database, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { usePageMeta } from "@/hooks/usePageMeta";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import {
  DATA_SOURCE_DISPLAY,
  DATA_SOURCE_BREAKDOWN,
} from "@/config/platformConstants";
import {
  SOURCES_BY_CATEGORY as SOURCES,
  SOURCES_REGISTRY,
} from "@/data/sourcesRegistry";

export default function DataSourcesPage() {
  usePageMeta({
    title: "Data Sources - Access Michigan",
    description: `${DATA_SOURCE_DISPLAY} verified public source organizations (${DATA_SOURCE_BREAKDOWN.federal} federal, ${DATA_SOURCE_BREAKDOWN.state} state, ${DATA_SOURCE_BREAKDOWN.nonprofit} nonprofit) powering Michigan's civic intelligence platform. Every organization credited.`,
    path: "/data-sources",
  });

  const totalSources = SOURCES_REGISTRY.length;

  return (
    <Layout>
      <Breadcrumbs items={[{ label: "Data Sources" }]} />
      <section className="bg-gradient-to-b from-primary/5 to-background py-14">
        <div className="container max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Badge
              variant="outline"
              className="mb-3 text-xs uppercase tracking-wider border-primary/30 text-primary"
            >
              Transparency
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              <AnimatedCounter
                value={totalSources}
                suffix="+"
                className="text-primary"
              />{" "}
              Verified Data Sources
            </h1>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Every data point on this platform comes from a public source. No
              contribution influences rankings, visibility, or content.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container max-w-4xl py-10 space-y-10">
        {Object.entries(SOURCES).map(([category, sources]) => (
          <section key={category}>
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" /> {category}
              <Badge variant="secondary" className="text-[10px]">
                {sources.length}
              </Badge>
            </h2>
            <div className="space-y-1">
              {sources.map((src) => (
                <details
                  key={src.name}
                  className="group rounded-lg border border-border"
                >
                  <summary className="flex items-center justify-between gap-3 px-4 py-2.5 cursor-pointer hover:bg-muted/50 transition-colors list-none">
                    <span className="text-sm font-medium text-foreground">
                      {src.name}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className="text-[8px]">
                        {src.org}
                      </Badge>
                      <span className="text-[9px] text-muted-foreground">
                        {src.frequency}
                      </span>
                      <svg
                        className="h-3 w-3 text-muted-foreground transition-transform group-open:rotate-180"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </summary>
                  <div className="px-4 pb-2.5 border-t border-border/50">
                    <p className="text-xs text-muted-foreground mt-2">
                      Powers: {src.powers}
                    </p>
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-primary hover:underline flex items-center gap-0.5 mt-1"
                    >
                      {src.url} <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>
    </Layout>
  );
}
