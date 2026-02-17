import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { usePageMeta } from "@/hooks/usePageMeta";
import { MapPin, Users, Building2, ArrowRight, BarChart3 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MICHIGAN_REGIONS } from "@/data/michigan-regions";
import { getCountyProfile } from "@/data/michigan-county-profiles";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.35 } }),
};

export default function RegionsPage() {
  usePageMeta({
    title: "Michigan Regions — Regional Health & Services Overview",
    description: "Explore Michigan's six regions for comparable health metrics, access gaps, community resources, and nonprofit organizations.",
    path: "/regions",
  });

  return (
    <Layout>
      <section className="bg-gradient-to-b from-accent/5 to-background py-10 lg:py-16">
        <div className="container max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="mb-4 inline-block rounded-full bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent">
              Regional Intelligence
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-3 text-3xl font-bold text-foreground lg:text-5xl">
            Michigan Regions
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Compare health outcomes, access gaps, and community resources across Michigan's six geographic regions.
          </motion.p>
        </div>
      </section>

      <div className="container max-w-6xl py-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {MICHIGAN_REGIONS.map((region, i) => {
            const totalPop = region.counties.reduce((sum, c) => sum + getCountyProfile(c).population, 0);
            const avgUninsured = region.counties.reduce((sum, c) => {
              const h = getCountyProfile(c).healthHighlights.find(x => x.label === "Uninsured rate");
              return sum + (h ? parseFloat(h.value) : 6.5);
            }, 0) / region.counties.length;

            return (
              <motion.div key={region.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <Link to={`/region/${region.id}`}>
                  <Card className="h-full hover-lift cursor-pointer group border-l-4" style={{ borderLeftColor: region.color }}>
                    <CardContent className="py-5 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ background: region.color }} />
                        <h2 className="font-bold text-foreground">{region.name}</h2>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{region.description}</p>
                      <div className="flex flex-wrap gap-2 text-[11px]">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-3 w-3" />{region.counties.length} counties
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Users className="h-3 w-3" />{totalPop.toLocaleString()}
                        </span>
                      </div>
                      <Badge variant={avgUninsured > 7.5 ? "destructive" : "secondary"} className="text-[10px]">
                        Avg uninsured: {avgUninsured.toFixed(1)}%
                      </Badge>
                      <p className="text-xs font-medium text-primary flex items-center gap-1 pt-1 group-hover:underline">
                        Explore region <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
