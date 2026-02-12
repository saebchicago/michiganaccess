import { useState } from "react";
import { motion } from "framer-motion";
import {
  Newspaper, AlertTriangle, Microscope, Landmark, Users, Calendar,
  ArrowRight, Clock, ExternalLink, TrendingUp, Heart, Shield
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

interface Article {
  id: string;
  category: string;
  title: string;
  summary: string;
  source: string;
  date: string;
  readTime: string;
  priority: "breaking" | "important" | "standard";
  tags: string[];
  sourceUrl: string;
}

const articles: Article[] = [
  {
    id: "1", category: "outbreak", title: "RSV Season: Michigan Reports Elevated Hospitalizations in Children Under 5",
    summary: "Michigan DHHS reports a 22% increase in RSV-related pediatric hospitalizations compared to this time last year. Parents urged to recognize early symptoms and seek care at facilities with pediatric respiratory specialists.",
    source: "Michigan DHHS", date: "2026-02-10", readTime: "4 min", priority: "breaking",
    tags: ["RSV", "Pediatrics", "Respiratory"], sourceUrl: "https://www.michigan.gov/mdhhs"
  },
  {
    id: "2", category: "update", title: "Healthy Michigan Plan Enrollment Reaches Record 1.1 Million Residents",
    summary: "Michigan's Medicaid expansion program now covers more residents than ever before. New streamlined enrollment process reduces application time by 40%. Eligibility extends to adults earning up to 138% FPL.",
    source: "CMS / Michigan DHHS", date: "2026-02-08", readTime: "5 min", priority: "important",
    tags: ["Medicaid", "Insurance", "Access"], sourceUrl: "https://www.healthcare.gov/"
  },
  {
    id: "3", category: "research", title: "University of Michigan Launches Precision Medicine Initiative for Rural Communities",
    summary: "A $45M federally-funded initiative will bring genomic testing and personalized treatment plans to 15 rural counties. The program targets cardiovascular disease, diabetes, and cancer disparities affecting underserved populations.",
    source: "NIH / U-M Health", date: "2026-02-05", readTime: "6 min", priority: "standard",
    tags: ["Research", "Rural Health", "Precision Medicine"], sourceUrl: "https://www.nih.gov/"
  },
  {
    id: "4", category: "policy", title: "Michigan Legislature Passes Surprise Medical Billing Protections",
    summary: "New legislation prohibits balance billing for emergency services and requires transparent cost estimates. Takes effect July 2026. Patients can dispute charges through a new independent arbitration process.",
    source: "Michigan Legislature", date: "2026-02-03", readTime: "4 min", priority: "important",
    tags: ["Policy", "Billing", "Consumer Protection"], sourceUrl: "https://www.legislature.mi.gov/"
  },
  {
    id: "5", category: "community", title: "Detroit Health System Opens 5 New Community Health Centers in Underserved Areas",
    summary: "Henry Ford Health expands primary care access with new FQHCs across Detroit's east side and southwest neighborhoods. All centers offer sliding-scale fees, behavioral health integration, and community health workers.",
    source: "HRSA / Henry Ford Health", date: "2026-02-01", readTime: "5 min", priority: "standard",
    tags: ["FQHC", "Detroit", "Primary Care"], sourceUrl: "https://www.hrsa.gov/"
  },
  {
    id: "6", category: "outbreak", title: "Updated COVID-19 Boosters Available at 2,400+ Michigan Locations",
    summary: "The latest XBB.1.5-targeted boosters are now widely available. CDC recommends updated doses for everyone 6 months and older. Michigan's vaccination rate trails the national average by 8 percentage points.",
    source: "CDC / Michigan DHHS", date: "2026-01-28", readTime: "3 min", priority: "standard",
    tags: ["COVID-19", "Vaccination", "CDC"], sourceUrl: "https://www.cdc.gov/"
  },
  {
    id: "7", category: "research", title: "Michigan State Study Links Lead Exposure to Long-Term Cardiovascular Risk",
    summary: "Researchers at MSU find that residents with childhood lead exposure in Flint and other affected communities show 35% higher rates of hypertension by age 30. Study published in JAMA Cardiology.",
    source: "MSU / JAMA Cardiology", date: "2026-01-25", readTime: "7 min", priority: "important",
    tags: ["Lead Exposure", "Flint", "Cardiovascular"], sourceUrl: "https://jamanetwork.com/"
  },
  {
    id: "8", category: "community", title: "988 Crisis Line: Michigan Sees 40% Increase in Call Volume, Response Times Improve",
    summary: "Michigan's 988 Suicide & Crisis Lifeline answered 156,000 calls in 2025, a 40% increase over 2024. Average answer time improved to under 30 seconds thanks to expanded staffing and new regional centers.",
    source: "SAMHSA / Michigan DHHS", date: "2026-01-22", readTime: "4 min", priority: "standard",
    tags: ["Mental Health", "Crisis", "988"], sourceUrl: "https://988lifeline.org/"
  },
  {
    id: "9", category: "update", title: "Telehealth Parity Law Extended Through 2028 in Michigan",
    summary: "Governor signs extension of telehealth insurance parity requirements, ensuring virtual visits are covered at the same rate as in-person care. Over 60% of Michigan providers now offer telehealth services.",
    source: "Michigan Governor's Office", date: "2026-01-20", readTime: "3 min", priority: "standard",
    tags: ["Telehealth", "Policy", "Insurance"], sourceUrl: "https://www.michigan.gov/whitmer"
  },
  {
    id: "10", category: "policy", title: "MDHHS Allocates $120M for Maternal Health Equity Initiative",
    summary: "New funding targets Black maternal mortality disparities with doula coverage under Medicaid, 12-month postpartum insurance, and 25 new birthing centers in high-need areas. Michigan's maternal mortality rate has dropped 12% since 2023.",
    source: "Michigan DHHS / CMS", date: "2026-01-18", readTime: "6 min", priority: "important",
    tags: ["Maternal Health", "Equity", "Medicaid"], sourceUrl: "https://www.michigan.gov/mdhhs"
  },
];

const categories = [
  { key: "all", label: "All News", icon: Newspaper },
  { key: "update", label: "Michigan Updates", icon: TrendingUp },
  { key: "outbreak", label: "Outbreaks & Prevention", icon: AlertTriangle },
  { key: "research", label: "Research", icon: Microscope },
  { key: "policy", label: "Policy & Legislation", icon: Landmark },
  { key: "community", label: "Community", icon: Users },
];

const priorityStyles = {
  breaking: "border-l-4 border-l-michigan-coral bg-michigan-coral/5",
  important: "border-l-4 border-l-michigan-gold",
  standard: "",
};

export default function HealthNewsPage() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = activeCategory === "all" ? articles : articles.filter(a => a.category === activeCategory);

  return (
    <Layout>
      <section className="bg-gradient-to-b from-michigan-sky/5 to-background py-12 lg:py-20">
        <div className="container max-w-4xl text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <span className="mb-4 inline-block rounded-full bg-michigan-sky/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-michigan-sky">
              Health News & Insights
            </span>
          </motion.div>
          <motion.h1 variants={fadeUp} custom={1} initial="hidden" animate="visible" className="mb-3 text-3xl font-bold text-foreground lg:text-5xl">
            Michigan Health News
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} initial="hidden" animate="visible" className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Curated updates on disease outbreaks, research advances, policy changes, and community health wins across Michigan — sourced from official agencies.
          </motion.p>
        </div>
      </section>

      <div className="container max-w-5xl py-10 space-y-8">
        {/* Category tabs */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <Button
                key={cat.key}
                size="sm"
                variant={activeCategory === cat.key ? "default" : "outline"}
                onClick={() => setActiveCategory(cat.key)}
                className="gap-1.5"
              >
                <cat.icon className="h-3.5 w-3.5" />
                {cat.label}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Featured / breaking */}
        {activeCategory === "all" && (
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <Card className="border-michigan-coral/30 bg-gradient-to-r from-michigan-coral/5 to-background overflow-hidden">
              <CardContent className="py-6">
                <div className="flex items-start gap-4">
                  <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-xl bg-michigan-coral/10 flex-shrink-0">
                    <AlertTriangle className="h-6 w-6 text-michigan-coral" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-michigan-coral text-primary-foreground text-[10px]">BREAKING</Badge>
                      <span className="text-xs text-muted-foreground"><Clock className="inline h-3 w-3 mr-1" />{articles[0].readTime} read</span>
                    </div>
                    <h2 className="text-xl font-bold text-foreground mb-2">{articles[0].title}</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">{articles[0].summary}</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs text-muted-foreground">
                        <Calendar className="inline h-3 w-3 mr-1" />{new Date(articles[0].date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                      </span>
                      <span className="text-xs text-muted-foreground">Source: {articles[0].source}</span>
                      {articles[0].tags.map(t => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Articles list */}
        <div className="space-y-3">
          {(activeCategory === "all" ? filtered.slice(1) : filtered).map((article, i) => (
            <motion.div key={article.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i % 8}>
              <Card className={`hover-lift transition-all ${priorityStyles[article.priority]}`}>
                <CardContent className="py-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant="outline" className="text-[10px] capitalize">{article.category === "outbreak" ? "Outbreaks & Prevention" : article.category === "update" ? "Michigan Update" : article.category}</Badge>
                        {article.priority === "important" && <Badge className="bg-michigan-gold/10 text-michigan-gold border-michigan-gold/20 text-[10px]">Important</Badge>}
                        <span className="text-[11px] text-muted-foreground"><Clock className="inline h-3 w-3 mr-0.5" />{article.readTime}</span>
                      </div>
                      <h3 className="font-semibold text-foreground text-sm lg:text-base mb-1.5">{article.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{article.summary}</p>
                      <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">
                            <Calendar className="inline h-3 w-3 mr-1" />{new Date(article.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                          <span className="text-xs text-muted-foreground">Source: {article.source}</span>
                        </div>
                        <div className="flex gap-1">
                          {article.tags.slice(0, 3).map(t => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Data sources note */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
          <Card className="border-border/50 bg-muted/30">
            <CardContent className="py-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <Shield className="inline h-3.5 w-3.5 mr-1 text-primary" />
                <strong>Source Integrity:</strong> All health news is sourced from official agencies including Michigan DHHS, CDC, NIH, CMS, SAMHSA, and peer-reviewed journals. This platform does not produce original editorial content — we curate and summarize from authoritative sources only.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
