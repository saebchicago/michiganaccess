import { usePageMeta } from "@/hooks/usePageMeta";
import { motion } from "framer-motion";
import { Compass, BarChart3, Sparkles } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MilestoneStepper from "@/components/civic/MilestoneStepper";
import RegionalMetricCard from "@/components/civic/RegionalMetricCard";
import LifeEventNavigator from "@/components/tools/LifeEventNavigator";
import Breadcrumbs from "@/components/layout/Breadcrumbs";

export default function LifeNavigatorPage() {
  usePageMeta({
    title: "Life Navigator — Civic Tools",
    description: "Navigate life milestones, explore value-based care benchmarks, and access civic tools for Michigan residents.",
    path: "/life-navigator",
  });

  return (
    <Layout>
      <div className="container pt-6">
        <Breadcrumbs items={[{ label: "Life Navigator" }]} />
      </div>
      <section className="bg-gradient-to-b from-primary/5 to-background py-10 lg:py-14">
        <div className="container max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              Civic Intelligence Engine
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-3 text-3xl font-bold text-foreground lg:text-5xl"
          >
            Life Navigator
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-2xl text-lg text-muted-foreground"
          >
            Step-by-step guides for major life milestones, regional health benchmarks, and civic resources — all in one place.
          </motion.p>
        </div>
      </section>

      <div className="container max-w-5xl py-8 space-y-8">
        <Tabs defaultValue="scenarios">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="scenarios">
              <Sparkles className="mr-1.5 h-4 w-4" />What's Happening
            </TabsTrigger>
            <TabsTrigger value="milestones">
              <Compass className="mr-1.5 h-4 w-4" />Life Milestones
            </TabsTrigger>
            <TabsTrigger value="benchmarks">
              <BarChart3 className="mr-1.5 h-4 w-4" />Quality Benchmarks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scenarios" className="mt-6">
            <LifeEventNavigator />
          </TabsContent>

          <TabsContent value="milestones" className="mt-6">
            <MilestoneStepper />
          </TabsContent>

          <TabsContent value="benchmarks" className="mt-6">
            <RegionalMetricCard />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
