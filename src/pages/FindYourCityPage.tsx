import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { usePageMeta } from "@/hooks/usePageMeta";
import CityRanker from "@/components/tools/CityRanker";

export default function FindYourCityPage() {
  usePageMeta({
    title: "Find Your City — Pick Your Priorities | Access Michigan",
    description:
      "Rank 25 Michigan cities by what matters to you: affordability, health, schools, safety, and environment. Real data, real-time results.",
    path: "/find-your-city",
  });

  return (
    <Layout>
      <Breadcrumbs items={[{ label: "Find Your City" }]} />

      <section className="bg-gradient-to-b from-primary/5 to-background py-12">
        <div className="container max-w-3xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge
              variant="outline"
              className="mb-3 text-xs uppercase tracking-wider border-primary/30 text-primary"
            >
              <MapPin className="h-3 w-3 mr-1" /> Interactive Tool
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Find Your Michigan City
            </h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">
              Set your priorities across five dimensions and watch 25 cities re-rank
              in real time. Each score combines tax rates, health outcomes, graduation
              rates, crime data, and environmental quality.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container max-w-3xl py-8">
        <CityRanker />
      </div>
    </Layout>
  );
}
