import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import DisasterHistoryDashboard from "@/components/tools/DisasterHistoryDashboard";

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// Source: FEMA OpenFEMA.
const DISASTER_TRENDS = [
  {
    label: "1980s average",
    value: "12/decade",
    context: "Federal disaster declarations for Michigan",
    source: "FEMA OpenFEMA",
  },
  {
    label: "2020s pace",
    value: "25+/decade",
    context: "Declarations are accelerating",
    source: "FEMA OpenFEMA",
  },
  {
    label: "Top hazard type",
    value: "Severe storms",
    context: "58% of declared events",
    source: "FEMA OpenFEMA",
  },
];

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

      <section className="container max-w-5xl pt-8 space-y-4" aria-labelledby="disaster-trends-heading">
        <h2 id="disaster-trends-heading" className="text-lg font-bold text-foreground">
          Michigan Disaster Trends
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {DISASTER_TRENDS.map((s) => (
            <Card key={s.label}>
              <CardContent className="py-3 space-y-1">
                <p className="text-xl font-bold text-foreground">{s.value}</p>
                <p className="text-[11px] font-medium text-muted-foreground">{s.label}</p>
                <p className="text-[11px] text-muted-foreground/80">{s.context}</p>
                <p className="text-[10px] text-muted-foreground/70">{s.source}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <div className="container max-w-5xl py-8">
        <DisasterHistoryDashboard />
      </div>
    </Layout>
  );
}
