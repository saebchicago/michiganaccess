import { useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart3, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { usePageMeta } from "@/hooks/usePageMeta";
import ZipIntelligenceBuilder from "@/components/tools/ZipIntelligenceBuilder";

const POPULAR_ZIPS = [
  { zip: "48201", label: "Detroit" },
  { zip: "48075", label: "Southfield" },
  { zip: "49503", label: "Grand Rapids" },
  { zip: "48823", label: "East Lansing" },
  { zip: "48126", label: "Dearborn" },
  { zip: "49001", label: "Kalamazoo" },
  { zip: "48601", label: "Saginaw" },
  { zip: "49684", label: "Traverse City" },
  { zip: "48502", label: "Flint" },
  { zip: "49855", label: "Marquette" },
];

export default function ZipIntelligencePage() {
  const [params] = useSearchParams();
  const initialZip = params.get("zip") || "";
  const isEmbed = params.get("embed") === "true";
  const initialMeasures = useMemo(() => {
    const m = params.get("measures");
    return m ? m.split(",").map((s) => s.replace(/_/g, " ")) : undefined;
  }, [params]);

  usePageMeta({
    title:
      "Health Score for Any Michigan ZIP Code | 40 CDC Measures | accessmi.org",
    description:
      "Type your ZIP code. See 40 health, equity, and social measures. Build custom charts. Compare to Michigan and national averages.",
    path: "/zip-intelligence",
    jsonLd: {
      "@type": "WebApplication",
      name: "Michigan ZIP Intelligence",
      url: "https://accessmi.org/zip-intelligence",
      applicationCategory: "HealthApplication",
      operatingSystem: "All",
    },
  });

  if (isEmbed) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <ZipIntelligenceBuilder
          key={`zip-${initialZip}`}
          initialZip={initialZip}
          initialMeasures={initialMeasures}
        />
        <p className="text-[9px] text-muted-foreground text-center mt-4">
          Powered by{" "}
          <a
            href="https://accessmi.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Access Michigan
          </a>{" "}
          · CDC PLACES 2024 (ZCTA-level)
        </p>
      </div>
    );
  }

  return (
    <Layout>
      <Breadcrumbs items={[{ label: "ZIP Intelligence" }]} />

      <section className="bg-gradient-to-br from-primary/8 via-michigan-teal/5 to-background py-12">
        <div className="container max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Badge
              variant="outline"
              className="mb-3 text-xs uppercase tracking-wider border-primary/30 text-primary"
            >
              <BarChart3 className="h-3 w-3 mr-1" /> Build Your Own Charts
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Know Your Neighborhood
            </h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">
              Type your ZIP code. See 40 health measures. Build custom charts.
              Compare to Michigan and national averages.
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              Powered by CDC PLACES (ZCTA-level) - the most granular public
              health data in America.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container max-w-4xl py-8">
        <ZipIntelligenceBuilder
          key={`zip-${initialZip}`}
          initialZip={initialZip}
          initialMeasures={initialMeasures}
        />
      </div>

      {/* Popular ZIPs */}
      <section className="container max-w-3xl py-8 border-t border-border">
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Popular Michigan ZIP codes
        </h3>
        <div className="flex flex-wrap gap-2">
          {POPULAR_ZIPS.map((z) => (
            <Link
              key={z.zip}
              to={`/zip-intelligence?zip=${z.zip}`}
              className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
            >
              <MapPin className="h-2.5 w-2.5" /> {z.zip} ({z.label})
            </Link>
          ))}
        </div>
      </section>

      {/* Source */}
      <section className="container max-w-3xl py-6 border-t border-border">
        <p className="text-[10px] text-muted-foreground text-center">
          Data from CDC PLACES 2024 release (BRFSS 2022 small area estimates).
          Robert Wood Johnson Foundation. CDC Foundation. Measures are
          model-based estimates and may differ from local surveillance. See{" "}
          <a
            href="https://www.cdc.gov/places/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            cdc.gov/places
          </a>{" "}
          for methodology.
        </p>
      </section>
    </Layout>
  );
}
