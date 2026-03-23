import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { usePageMeta } from "@/hooks/usePageMeta";
import MichiganQuiz from "@/components/tools/MichiganQuiz";

export default function QuizPage() {
  usePageMeta({
    title: "How Well Do You Know Michigan? | Data Quiz | accessmi.org",
    description: "Test your knowledge of Michigan health, taxes, housing, and equity data with 10 questions backed by verified public sources.",
    path: "/quiz",
  });

  return (
    <Layout>
      <Breadcrumbs items={[{ label: "Michigan Quiz" }]} />
      <section className="bg-gradient-to-b from-primary/5 to-background py-12">
        <div className="container max-w-2xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge variant="outline" className="mb-3 text-xs uppercase tracking-wider border-primary/30 text-primary">
              <HelpCircle className="h-3 w-3 mr-1" /> Interactive Quiz
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight">How Well Do You Know Michigan?</h1>
            <p className="text-sm text-muted-foreground mt-2">10 questions. Real data. Share your score.</p>
          </motion.div>
        </div>
      </section>
      <div className="container max-w-lg py-8">
        <MichiganQuiz />
      </div>
    </Layout>
  );
}
