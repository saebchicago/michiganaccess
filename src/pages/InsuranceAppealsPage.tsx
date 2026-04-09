import Layout from "@/components/layout/Layout";
import { usePageMeta } from "@/hooks/usePageMeta";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, ArrowDown } from "lucide-react";
import AppealFlowchart from "@/components/appeals/AppealFlowchart";
import AIAppealGenerator from "@/components/appeals/AIAppealGenerator";
import MedicaidSpecialist from "@/components/appeals/MedicaidSpecialist";
import ImpactDashboard from "@/components/appeals/ImpactDashboard";
import PersonaCarousel from "@/components/appeals/PersonaCarousel";
import DoctorKit from "@/components/appeals/DoctorKit";
import EnterprisePartners from "@/components/appeals/EnterprisePartners";
import Breadcrumbs from "@/components/layout/Breadcrumbs";

const InsuranceAppealsPage = () => {
  usePageMeta({
    title: "Insurance Denial Appeal Tool — Michigan",
    description:
      "Fight health insurance denials in Michigan. Appeal letter generator, Medicaid fair hearing templates, and DIFS external review guidance.",
    path: "/health/insurance-appeals",
    jsonLd: {
      "@type": "HowTo",
      "name": "How to Appeal a Health Insurance Denial in Michigan",
      "description": "Step-by-step guide to fighting insurance denials using Michigan's internal appeal and DIFS external review processes.",
      "url": "https://accessmi.org/health/insurance-appeals",
      "totalTime": "PT30M",
      "step": [
        { "@type": "HowToStep", "name": "Review your denial letter", "text": "Identify the reason for denial and gather supporting documentation." },
        { "@type": "HowToStep", "name": "File internal appeal", "text": "Submit a formal appeal to your insurance company within 180 days." },
        { "@type": "HowToStep", "name": "Request DIFS external review", "text": "If denied again, file for external review with Michigan DIFS." },
      ],
      "mainEntity": [
        { "@type": "Question", "name": "How long do I have to appeal a health insurance denial in Michigan?", "acceptedAnswer": { "@type": "Answer", "text": "You have 180 days from the date of denial to file an internal appeal with your insurance company." } },
        { "@type": "Question", "name": "Can I appeal a health insurance denial?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Michigan law gives you the right to an internal appeal with your insurer and, if denied again, an external review through DIFS." } },
        { "@type": "Question", "name": "Does Access Michigan store my health information?", "acceptedAnswer": { "@type": "Answer", "text": "No. Access Michigan does not store any personal health information. All appeal letter generation happens locally." } },
      ],
    },
  });

  return (
    <Layout>
      <div className="container pt-6">
        <Breadcrumbs items={[{ label: "Find Help", href: "/find-care" }, { label: "Insurance Appeals" }]} />
      </div>
      {/* Hero */}
      <section className="relative bg-gradient-hero py-16 md:py-24 text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--teal)/0.15),transparent_60%)]" />
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center space-y-6"
          >
            <Badge className="bg-white/15 text-white border-white/25">
              <Shield className="h-3 w-3 mr-1" />
              Michigan Insurance Appeals Hub
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight">
              Your Insurance Denial Is{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
                Not Final
              </span>
            </h1>
            <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
              Michigan law guarantees your right to appeal. Access Michigan gives you free tools
              to build your case — no sign-up, no data stored.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button size="lg" variant="secondary" asChild>
                <a href="#ai-generator">
                  Generate Appeal Letter
                </a>
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
                <a href="#flowchart">
                  See the Process <ArrowDown className="h-4 w-4" />
                </a>
              </Button>
            </div>
            <p className="text-xs text-primary-foreground/60">
              No personal health information stored · No account required · 100% free
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main content sections */}
      <div className="container py-12 space-y-16">
        {/* Persona-driven navigation */}
        <PersonaCarousel />

        {/* Flowchart */}
        <div id="flowchart">
          <AppealFlowchart />
        </div>

        {/* AI Generator */}
        <div id="ai-generator">
          <AIAppealGenerator />
        </div>

        {/* Medicaid Specialist */}
        <MedicaidSpecialist />

        {/* Doctor Kit */}
        <DoctorKit />

        {/* Impact Dashboard */}
        <ImpactDashboard />

        {/* Enterprise CTA */}
        <EnterprisePartners />
      </div>
    </Layout>
  );
};

export default InsuranceAppealsPage;
