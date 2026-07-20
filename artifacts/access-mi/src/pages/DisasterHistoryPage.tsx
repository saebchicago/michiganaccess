import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Badge } from "@/components/ui/badge";
import DisasterHistoryDashboard from "@/components/tools/DisasterHistoryDashboard";

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function DisasterHistoryPage() {
  usePageMeta({
    title: "FEMA Disaster History - Access Michigan",
    description:
      "Interactive dashboard of FEMA disaster declarations in Michigan from 1953 to present, powered by the live OpenFEMA API.",
    path: "/disaster-history",
  });

  return (
    <Layout>
      <Breadcrumbs
        items={[
          { label: "Data & Insights", href: "/data-and-insights" },
          { label: "Disaster History" },
        ]}
      />

      <section className="bg-gradient-to-b from-primary/5 to-background py-12">
        <div className="container max-w-5xl">
          <motion.div initial="hidden" animate="visible" variants={fade}>
            <Badge
              variant="outline"
              className="mb-3 uppercase tracking-wider text-xs"
            >
              Live FEMA Data
            </Badge>
            <h1 className="text-3xl font-extrabold text-foreground mb-2">
              Every disaster, since 1953.
            </h1>
            <p className="text-muted-foreground">
              Federal disaster declarations for Michigan. Live from FEMA
              OpenFEMA.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container max-w-5xl py-8">
        <DisasterHistoryDashboard />
      </div>
    </Layout>
  );
}
