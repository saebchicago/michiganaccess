import { motion } from "framer-motion";
import { DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { usePageMeta } from "@/hooks/usePageMeta";
import TaxComparisonCalculator from "@/components/tools/TaxComparisonCalculator";
import ShouldIMoveCalculator from "@/components/tools/ShouldIMoveCalculator";

export default function TaxComparisonPage() {
  usePageMeta({
    title: "Michigan Tax Comparison Calculator | Compare Total Tax Burden by City | Access Michigan",
    description: "Compare federal, state, city income tax, property tax, and auto insurance between any two Michigan cities. See how much you'd keep.",
    path: "/tax-comparison",
  });

  return (
    <Layout>
      <Breadcrumbs items={[{ label: "Tax Comparison" }]} />
      <section className="bg-gradient-to-b from-michigan-gold/5 to-background py-12">
        <div className="container max-w-3xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge variant="outline" className="mb-3 text-xs uppercase tracking-wider border-michigan-gold/30 text-michigan-gold">
              <DollarSign className="h-3 w-3 mr-1" /> Interactive Calculator
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Michigan Tax Comparison
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Same salary, two locations — see how much you'd keep. Includes city income tax, property tax, and auto insurance.
            </p>
          </motion.div>
        </div>
      </section>
      <div className="container max-w-4xl py-8 space-y-8">
        <TaxComparisonCalculator />
        <ShouldIMoveCalculator />
      </div>
    </Layout>
  );
}
