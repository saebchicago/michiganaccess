import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Brain, ExternalLink } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePageMeta } from "@/hooks/usePageMeta";

const BenefitsGapCalculator = lazy(() => import("@/components/decision/BenefitsGapCalculator"));
const ALICESurvivalBudget = lazy(() => import("@/components/decision/ALICESurvivalBudget"));
const HospitalMarketGame = lazy(() => import("@/components/decision/HospitalMarketGame"));

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }) };
const Loader = () => <div className="h-64 animate-pulse bg-muted rounded-xl" />;

export default function DecisionSciencePage() {
  usePageMeta({
    title: "Decision Science - Game Theory for Michigan Health - Access Michigan",
    description: "Interactive simulations: Benefits Gap Calculator, Hospital Market Dynamics, ALICE Survival Budget. Powered by DecisionPlay.",
    path: "/decision-science",
  });

  return (
    <Layout>
      <Breadcrumbs items={[{ label: "Decision Science" }]} />

      <section className="bg-gradient-to-br from-primary/10 via-michigan-teal/5 to-background py-16 md:py-20">
        <div className="container max-w-3xl text-center">
          <motion.div initial="hidden" animate="visible">
            <motion.div variants={fadeUp} custom={0} className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5">
              <Brain className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Decision Science</span>
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1} className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              Why Does Michigan's Healthcare System Work This Way?
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-base text-muted-foreground">
              Interactive simulations powered by game theory and behavioral economics - using real Michigan data.
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="mt-3">
              <a href="https://decisionplay.app" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                aria-label="DecisionPlay.app, opens in new window">
                <Badge variant="outline" className="text-[9px]">Powered by DecisionPlay</Badge>
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="container py-10">
        <Tabs defaultValue="benefits" className="w-full">
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex w-max min-w-full sm:w-auto sm:min-w-0 gap-1">
              <TabsTrigger value="benefits" className="text-xs sm:text-sm whitespace-nowrap">Benefits Gap Calculator</TabsTrigger>
              <TabsTrigger value="hospital" className="text-xs sm:text-sm whitespace-nowrap">Hospital Market Dynamics</TabsTrigger>
              <TabsTrigger value="alice" className="text-xs sm:text-sm whitespace-nowrap">ALICE Survival Budget</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="benefits" className="mt-6">
            <Suspense fallback={<Loader />}><BenefitsGapCalculator /></Suspense>
          </TabsContent>
          <TabsContent value="hospital" className="mt-6">
            <Suspense fallback={<Loader />}><HospitalMarketGame /></Suspense>
          </TabsContent>
          <TabsContent value="alice" className="mt-6">
            <Suspense fallback={<Loader />}><ALICESurvivalBudget /></Suspense>
          </TabsContent>
        </Tabs>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/scenario-studio"
            className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline">
            Compare climate scenarios in Scenario Studio →
          </Link>
          <Link to="/analyst"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
            Analyst Command Center
          </Link>
        </div>
        <div className="mt-4 text-center">
          <a href="https://decisionplay.app" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
            aria-label="DecisionPlay full engine, opens in new window">
            Try the full game theory engine → DecisionPlay.app <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </section>
    </Layout>
  );
}
