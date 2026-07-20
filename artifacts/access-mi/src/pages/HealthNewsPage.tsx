import { motion } from "framer-motion";
import { Newspaper, ExternalLink } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Card, CardContent } from "@/components/ui/card";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function HealthNewsPage() {
  usePageMeta({
    title: "Michigan Health News",
    description:
      "Curated Michigan health news and policy updates, linking out to original reporting from statewide and local outlets.",
    path: "/news",
  });
  return (
    <Layout>
      <section className="bg-gradient-to-b from-michigan-sky/5 to-background py-12 lg:py-20">
        <div className="container max-w-4xl text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <span className="mb-4 inline-block rounded-full bg-michigan-sky/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-michigan-sky">
              Health News & Insights
            </span>
          </motion.div>
          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mb-3 text-3xl font-bold text-foreground lg:text-5xl"
          >
            Michigan Health News
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mx-auto max-w-2xl text-lg text-muted-foreground"
          >
            Curated Michigan health news - sourced from official agencies and
            linked to primary documents.
          </motion.p>
        </div>
      </section>

      <div className="container max-w-3xl py-16 space-y-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <Card className="border-border/50 bg-muted/20">
            <CardContent className="py-10 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-michigan-sky/10">
                <Newspaper className="h-7 w-7 text-michigan-sky" />
              </div>
              <h2 className="text-xl font-bold text-foreground">
                Sourced items will appear here
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                Curated Michigan health news will appear here as sourced items
                are added. Every item links directly to its primary source
                document - no summaries without a retrievable original.
              </p>
              <p className="text-xs text-muted-foreground">
                In the meantime, find current Michigan health information at
                official sources:
              </p>
              <div className="flex flex-wrap gap-3 justify-center pt-2">
                {[
                  {
                    label: "Michigan DHHS Newsroom",
                    url: "https://www.michigan.gov/mdhhs/inside-mdhhs/newsroom",
                  },
                  {
                    label: "CDC Michigan",
                    url: "https://www.cdc.gov/nchs/pressroom/states/michigan/michigan.htm",
                  },
                  {
                    label: "MDHHS Public Health Advisories",
                    url: "https://www.michigan.gov/mdhhs/keep-mi-healthy/publichealth",
                  },
                ].map((link) => (
                  <a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-xs text-primary hover:bg-muted/50 transition-colors"
                  >
                    {link.label}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
