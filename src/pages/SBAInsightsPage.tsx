import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Badge } from "@/components/ui/badge";
import PrintButton from "@/components/shared/PrintButton";
import SBADashboard from "@/components/tools/SBADashboard";

const fade = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function SBAInsightsPage() {
  usePageMeta({
    title: "SBA Economic Intelligence — Access Michigan",
    description: "Small business lending trends across Michigan counties, including SBA loan volume, equity metrics, and industry breakdown.",
    path: "/sba-insights",
  });

  return (
    <Layout>
      <Breadcrumbs items={[{ label: "Data & Insights", href: "/data-and-insights" }, { label: "SBA Insights" }]} />

      <section className="bg-gradient-to-b from-primary/5 to-background py-12">
        <div className="container max-w-5xl">
          <motion.div initial="hidden" animate="visible" variants={fade}>
            <Badge variant="outline" className="mb-3 uppercase tracking-wider text-xs">Economic Intelligence</Badge>
            <h1 className="text-3xl font-extrabold text-foreground mb-2">SBA Small Business Lending</h1>
            <p className="text-muted-foreground">
              County-level SBA lending data for Michigan — loan volume, equity indicators, and economic impact.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container max-w-5xl py-8">
        <SBADashboard />
      </div>
      <PrintButton />
    </Layout>
  );
}
