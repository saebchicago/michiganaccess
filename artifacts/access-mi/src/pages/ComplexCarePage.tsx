import { useState } from "react";
import { motion } from "framer-motion";
import { usePageMeta } from "@/hooks/usePageMeta";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Search, Heart, Users, MapPin, Phone, Globe, ExternalLink,
  Dna, Brain, ShieldCheck, BookOpen, Stethoscope, HandHeart,
  AlertTriangle, ArrowRight
} from "lucide-react";

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

const conditions = [
  {
    name: "Lupus (SLE)",
    category: "Autoimmune",
    prevalence: "~16,000 MI residents",
    icon: ShieldCheck,
    specialists: ["Rheumatology", "Nephrology", "Dermatology"],
    support: "Lupus Foundation of America – Michigan Chapter",
  },
  {
    name: "Multiple Sclerosis",
    category: "Autoimmune / Neurological",
    prevalence: "~20,000 MI residents",
    icon: Brain,
    specialists: ["Neurology", "Neuroimmunology", "Physical Medicine"],
    support: "National MS Society – Michigan Chapter",
  },
  {
    name: "Crohn's Disease & Ulcerative Colitis",
    category: "Autoimmune / GI",
    prevalence: "~30,000 MI residents",
    icon: Stethoscope,
    specialists: ["Gastroenterology", "Colorectal Surgery"],
    support: "Crohn's & Colitis Foundation – Michigan",
  },
  {
    name: "Sickle Cell Disease",
    category: "Rare / Hematological",
    prevalence: "~5,000 MI residents",
    icon: Dna,
    specialists: ["Hematology", "Pain Management", "Pediatric Hematology"],
    support: "Sickle Cell Disease Association of America – MI",
  },
  {
    name: "Cystic Fibrosis",
    category: "Rare / Genetic",
    prevalence: "~2,500 MI residents",
    icon: Dna,
    specialists: ["Pulmonology", "Genetics", "Nutrition"],
    support: "Cystic Fibrosis Foundation – Great Lakes Chapter",
  },
  {
    name: "Ehlers-Danlos Syndromes",
    category: "Rare / Connective Tissue",
    prevalence: "Estimated 1 in 5,000",
    icon: Dna,
    specialists: ["Genetics", "Rheumatology", "Cardiology"],
    support: "The Ehlers-Danlos Society",
  },
  {
    name: "Scleroderma",
    category: "Autoimmune / Rare",
    prevalence: "~3,000 MI residents",
    icon: ShieldCheck,
    specialists: ["Rheumatology", "Pulmonology", "Dermatology"],
    support: "Scleroderma Foundation – Michigan Chapter",
  },
  {
    name: "Huntington's Disease",
    category: "Rare / Neurological",
    prevalence: "~1,500 MI residents",
    icon: Brain,
    specialists: ["Neurology", "Psychiatry", "Genetics"],
    support: "Huntington's Disease Society of America – MI",
  },
];

const communityFinderCards = [
  {
    title: "Michigan Rare Disease Coalition",
    desc: "Statewide advocacy network connecting patients and families affected by rare conditions to peer support, research updates, and legislative action.",
    link: "https://www.michiganrare.org",
    icon: Users,
    tags: ["Peer Support", "Advocacy", "Research"],
  },
  {
    title: "NORD (National Organization for Rare Disorders)",
    desc: "Patient assistance programs, educational resources, and a comprehensive rare disease database with Michigan-specific provider directories.",
    link: "https://rarediseases.org",
    icon: BookOpen,
    tags: ["Patient Assistance", "Database", "Education"],
  },
  {
    title: "Autoimmune Association",
    desc: "Support groups, webinars, and a validated symptom checklist for 100+ autoimmune conditions. Connect with peers navigating similar diagnoses.",
    link: "https://autoimmune.org",
    icon: HandHeart,
    tags: ["Support Groups", "Symptom Tools", "Webinars"],
  },
  {
    title: "Michigan 2-1-1 – Complex Care Navigation",
    desc: "Free, confidential referral service for transportation, home care, and disability support services available in all 83 Michigan counties.",
    link: "https://www.mi211.org",
    icon: Phone,
    tags: ["Referrals", "Transportation", "Home Care"],
  },
];

export default function ComplexCarePage() {
  const [search, setSearch] = useState("");
  usePageMeta({
    title: "Complex Care Navigation - Autoimmune & Rare Diseases",
    description: "Directory of autoimmune and rare disease resources, specialists, and community support across Michigan.",
    path: "/complex-care",
  });

  const filtered = conditions.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-b from-michigan-coral/5 to-background py-16 lg:py-24">
        <div className="container max-w-4xl text-center">
          <Breadcrumbs items={[{ label: "Find Care", href: "/find-care" }, { label: "Complex Care Navigation" }]} />
          <motion.span initial="hidden" animate="visible" variants={fade} custom={0} className="mb-4 inline-block rounded-full bg-michigan-coral/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-michigan-coral">
            Complex Care Navigation
          </motion.span>
          <motion.h1 variants={fade} custom={1} initial="hidden" animate="visible" className="mb-4 text-3xl font-bold text-foreground lg:text-5xl">
            Autoimmune & Rare Disease Directory
          </motion.h1>
          <motion.p variants={fade} custom={2} initial="hidden" animate="visible" className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Navigating complex conditions shouldn't mean navigating isolation. Find specialists, community support, and peer networks across Michigan.
          </motion.p>
        </div>
      </section>

      <div className="container max-w-5xl py-12 space-y-16">
        {/* Isolation callout */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={0} className="rounded-xl border-2 border-michigan-coral/20 bg-michigan-coral/5 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-michigan-coral" />
            <div>
              <h3 className="text-sm font-bold text-foreground mb-1">Navigating Isolation</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Rare and autoimmune conditions affect an estimated 80,000+ Michigan residents, yet many face diagnostic delays of 4–7 years and limited access to specialists outside metro areas. This directory connects patients to both clinical expertise and the peer communities that are critical for long-term management.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Search + Directory */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-michigan-coral/10">
              <Dna className="h-5 w-5 text-michigan-coral" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Condition Directory</h2>
              <p className="text-sm text-muted-foreground">{filtered.length} conditions indexed</p>
            </div>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search conditions (e.g., lupus, sickle cell, EDS)…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((c, i) => (
              <motion.div key={c.name} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={i % 4}>
                <Card className="h-full hover-lift">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-michigan-coral/10">
                        <c.icon className="h-4 w-4 text-michigan-coral" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-foreground">{c.name}</h3>
                        <p className="text-[11px] text-muted-foreground">{c.category} · {c.prevalence}</p>
                      </div>
                    </div>
                    <div className="mb-3">
                      <p className="text-[11px] font-semibold text-foreground mb-1">Recommended Specialists</p>
                      <div className="flex flex-wrap gap-1">
                        {c.specialists.map((s) => (
                          <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-md bg-muted/50 p-2 border border-border">
                      <p className="text-[11px] text-muted-foreground">
                        <HandHeart className="mr-1 inline h-3 w-3 text-michigan-coral" />
                        <span className="font-semibold text-foreground">Support:</span> {c.support}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No conditions match your search. Try a different term.
            </div>
          )}
        </section>

        <Separator />

        {/* Community Finder */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Community Finder</h2>
              <p className="text-sm text-muted-foreground">Organizations breaking the isolation of rare & autoimmune conditions</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {communityFinderCards.map((card, i) => (
              <motion.div key={card.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={i}>
                <Card className="h-full hover-lift">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <card.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-foreground">{card.title}</h4>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{card.desc}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {card.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
                      ))}
                    </div>
                    <a
                      href={card.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      Visit Resource <ExternalLink className="h-3 w-3" />
                    </a>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Data sources */}
        <div className="rounded-lg border border-border bg-muted/50 p-4">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Data Sources:</span> Michigan Rare Disease Coalition, National Organization for Rare Disorders (NORD), Autoimmune Association, Michigan DHHS, CDC Rare Diseases Program. Prevalence estimates based on national ratios applied to Michigan population data.
          </p>
        </div>
      </div>
    </Layout>
  );
}
