import { motion } from "framer-motion";
import { MapPin, ExternalLink, Shield } from "lucide-react";
import Layout from "@/components/layout/Layout";
import LiveTrialSearch from "@/components/health/LiveTrialSearch";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4 },
  }),
};

export default function ClinicalTrialsPage() {
  usePageMeta({
    title: "Clinical Trials",
    description:
      "Search ClinicalTrials.gov for studies recruiting in Michigan, and find the state's major research institutions.",
    path: "/clinical-trials",
    jsonLd: {
      "@type": "WebPage",
      name: "Clinical Trials - Access Michigan",
      description: "Live ClinicalTrials.gov search for studies in Michigan.",
      url: "https://accessmi.org/clinical-trials",
      specialty: { "@type": "MedicalSpecialty", name: "Clinical Research" },
    },
  });

  return (
    <Layout>
      <section className="bg-gradient-to-b from-michigan-forest/5 to-background py-12 lg:py-20">
        <div className="container max-w-4xl text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
          >
            <span className="mb-4 inline-block rounded-full bg-michigan-forest/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-michigan-forest-deep">
              Clinical Trials Finder
            </span>
          </motion.div>
          <motion.h1
            variants={fadeUp}
            custom={1}
            initial="hidden"
            animate="visible"
            className="mb-3 text-3xl font-bold text-foreground lg:text-5xl"
          >
            Find a clinical trial.
          </motion.h1>
          <motion.p
            variants={fadeUp}
            custom={2}
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-2xl text-lg text-muted-foreground"
          >
            Live ClinicalTrials.gov search for studies in Michigan.
          </motion.p>
        </div>
      </section>

      <div className="container max-w-5xl py-10 space-y-8">
        {/* Live Trial Search */}
        <LiveTrialSearch />


        {/* Research institutions */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
        >
          <h2 className="text-xl font-bold text-foreground mb-4">
            Michigan Research Institutions
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                name: "University of Michigan Health – Rogel Cancer Center",
                loc: "Ann Arbor",
                url: "https://www.rogelcancercenter.org/",
              },
              {
                name: "Henry Ford Health System",
                loc: "Detroit",
                url: "https://www.henryford.com/research",
              },
              {
                name: "Corewell Health West (formerly Spectrum Health) / Michigan State University",
                loc: "Grand Rapids",
                url: "https://www.spectrumhealth.org/research",
              },
              {
                name: "Corewell Health East (formerly Beaumont Health) / Oakland University",
                loc: "Royal Oak",
                url: "https://www.beaumont.org/research",
              },
            ].map((inst) => (
              <Card key={inst.name} className="hover-lift">
                <CardContent className="py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {inst.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <MapPin className="inline h-3 w-3 mr-1" />
                      {inst.loc}
                    </p>
                  </div>
                  <a
                    href={inst.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${inst.name ?? "trial site"} in new tab`}
                  >
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      tabIndex={-1}
                      aria-hidden="true"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.section>

        <Card className="border-border/50 bg-muted/30">
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <Shield className="inline h-3.5 w-3.5 mr-1 text-primary" />
              <strong>Data Source:</strong> Trial search results come live
              from the ClinicalTrials.gov API (U.S. National Library of
              Medicine). Enrollment status can change; always confirm with the
              study team listed on ClinicalTrials.gov. This platform does not
              recruit for or endorse specific trials.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
