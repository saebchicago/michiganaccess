import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  BarChart3, Database, Download, FileText, Copy,
  ArrowRight, Stethoscope, MessageSquare
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const actions = [
  {
    icon: Download,
    title: "Download a County Profile",
    description: "Get a print-ready PDF summary for any of Michigan's 83 counties.",
    href: "/county/wayne",
  },
  {
    icon: FileText,
    title: "Export Programs as CSV",
    description: "Download all verified community programs for a county or region.",
    href: "/data-and-insights",
  },
  {
    icon: BarChart3,
    title: "Compare Two Counties",
    description: "Side-by-side health metrics, demographics, and resource availability.",
    href: "/data",
  },
  {
    icon: Database,
    title: "Open Data & Methodology",
    description: "Datasets, technical docs, and citation guidance for researchers.",
    href: "/data-and-insights",
  },
];

const aiExamples = [
  "List all Medicaid transportation options in Genesee County",
  "Summarize key disparities in Wayne vs. Oakland County",
  "Show me energy programs for seniors in the Upper Peninsula",
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.35 } }),
};

export const ProfessionalGateway = () => {
  return (
    <section className="py-16 bg-michigan-navy/5">
      <div className="container">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-10 max-w-2xl"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-michigan-navy/60 mb-2">
            For health systems · community orgs · journalists · planners
          </p>
          <h2 className="text-2xl font-bold text-foreground md:text-3xl mb-3">
            Professional Tools & Data
          </h2>
          <p className="text-muted-foreground">
            Access Michigan provides dashboards, datasets, and community program directories to support better decisions for Michigan communities.
          </p>
        </motion.div>

        {/* Action cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
          {actions.map((action, i) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
              >
                <Link to={action.href}>
                  <Card className="h-full border border-michigan-navy/10 hover:shadow-lg hover:border-michigan-navy/20 transition-all cursor-pointer group">
                    <CardContent className="py-6 space-y-3">
                      <div className="inline-flex items-center justify-center rounded-lg p-3 bg-michigan-navy/5 group-hover:bg-michigan-navy/10 transition-colors">
                        <Icon className="h-5 w-5 text-michigan-navy" />
                      </div>
                      <h3 className="text-sm font-bold text-foreground">{action.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{action.description}</p>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-michigan-navy group-hover:underline">
                        Get started <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* AI Assistant examples */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-xl border border-michigan-navy/15 bg-card p-6 mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-michigan-navy" />
            <h3 className="font-bold text-foreground">Try asking Access Michigan</h3>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {aiExamples.map((example) => (
              <div
                key={example}
                className="rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground italic"
              >
                "{example}"
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Use the "Ask Access Michigan" chat at the bottom of any page to explore data and programs.
          </p>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link to="/data-and-insights">
            <Button size="lg" className="bg-michigan-navy hover:bg-michigan-navy/90 px-8">
              <BarChart3 className="mr-2 h-4 w-4" /> Explore Data & Insights
            </Button>
          </Link>
          <Link to="/contact">
            <Button size="lg" variant="outline" className="px-8">
              <Stethoscope className="mr-2 h-4 w-4" /> Contact Us
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ProfessionalGateway;
