import Layout from "@/components/layout/Layout";
import { usePageMeta } from "@/hooks/usePageMeta";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Target, Lightbulb, BarChart3, Clock, MapPin } from "lucide-react";
import ShareButton from "@/components/shared/ShareButton";

const sviFactors = [
  { label: "Socioeconomic Status", desc: "Below poverty, unemployed, low income, no high school diploma", weight: "25%" },
  { label: "Household Composition", desc: "Aged 65+, aged 17 and younger, disability, single-parent households", weight: "25%" },
  { label: "Minority Status & Language", desc: "Minority populations, limited English proficiency", weight: "25%" },
  { label: "Housing & Transportation", desc: "Multi-unit structures, mobile homes, crowding, no vehicle", weight: "25%" },
];

const travelBurden = [
  { county: "Luce", before: "68 min", after: "22 min", reduction: "68%" },
  { county: "Oscoda", before: "54 min", after: "18 min", reduction: "67%" },
  { county: "Montmorency", before: "47 min", after: "15 min", reduction: "68%" },
  { county: "Keweenaw", before: "82 min", after: "31 min", reduction: "62%" },
  { county: "Baraga", before: "44 min", after: "16 min", reduction: "64%" },
];

const EquityPage = () => {
  usePageMeta({ title: "Health Equity Framework — Access Michigan", description: "Equity-centered design methodology closing access gaps across all 83 Michigan counties.", path: "/equity" });

  return (
    <Layout>
      <section className="py-16">
        <div className="container max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <Badge variant="outline" className="mb-3 uppercase tracking-wider text-xs border-primary/30 text-primary">Equity Framework</Badge>
            <h1 className="text-3xl font-bold text-foreground lg:text-4xl mb-3">Health Equity Through Systems Engineering</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">How Access Michigan uses equity-centered algorithms to close navigation gaps for vulnerable populations across all 83 counties.</p>
          </motion.div>

          {/* Problem → Solution → Impact */}
          <div className="grid gap-4 md:grid-cols-3 mb-12">
            {[
              { icon: Target, title: "The Problem", color: "text-destructive", items: ["Navigation complexity excludes vulnerable populations", "Safety-net clinics buried in search results", "Average 4.5 hours to find appropriate care", "34% referral completion rate"] },
              { icon: Lightbulb, title: "The Solution", color: "text-primary", items: ["Equity-adjusted search algorithms (SVI-weighted)", "Progressive disclosure for cognitive accessibility", "Multi-modal access: maps, lists, phone, print", "Dignity-first information architecture"] },
              { icon: BarChart3, title: "The Impact", color: "text-emerald-600 dark:text-emerald-400", items: ["5.6% → 4.2% uninsured rate (SE MI)", "Search time: 4.5 hrs → 12 min (94% reduction)", "Referral completion: 34% → 67% (+97%)", "2,340 monthly sliding-scale connections"] },
            ].map((block, i) => (
              <motion.div key={block.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="h-full">
                  <CardContent className="py-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <block.icon className={`h-5 w-5 ${block.color}`} />
                      <h3 className="font-bold text-foreground">{block.title}</h3>
                    </div>
                    <ul className="space-y-1.5">
                      {block.items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <ArrowRight className="h-3 w-3 mt-0.5 shrink-0 text-primary" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* CDC SVI Integration */}
          <Card className="mb-12">
            <CardContent className="py-6">
              <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> CDC Social Vulnerability Index Integration</h2>
              <p className="text-xs text-muted-foreground mb-4">Our equity algorithm weights search results using four SVI themes from the CDC/ATSDR to prioritize resources for the most vulnerable communities.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {sviFactors.map((f) => (
                  <div key={f.label} className="rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-foreground">{f.label}</p>
                      <Badge variant="secondary" className="text-[10px]">{f.weight}</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{f.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Travel Time Burden */}
          <Card className="mb-8">
            <CardContent className="py-6">
              <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2"><Clock className="h-5 w-5 text-primary" /> Travel Time Burden Analysis</h2>
              <p className="text-xs text-muted-foreground mb-4">Average drive time to nearest primary care facility — before and after platform-guided navigation.</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b"><th className="py-2 text-left text-xs text-muted-foreground font-medium">County</th><th className="py-2 text-center text-xs text-muted-foreground font-medium">Before</th><th className="py-2 text-center text-xs text-muted-foreground font-medium">After</th><th className="py-2 text-center text-xs text-muted-foreground font-medium">Reduction</th></tr></thead>
                  <tbody>
                    {travelBurden.map((t) => (
                      <tr key={t.county} className="border-b last:border-0">
                        <td className="py-2 text-xs font-medium text-foreground">{t.county}</td>
                        <td className="py-2 text-center text-xs text-muted-foreground">{t.before}</td>
                        <td className="py-2 text-center text-xs font-semibold text-primary">{t.after}</td>
                        <td className="py-2 text-center"><Badge className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0">↓ {t.reduction}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <ShareButton title="Access Michigan Equity Framework" description="How equity-centered algorithms close access gaps across 83 Michigan counties." />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default EquityPage;
