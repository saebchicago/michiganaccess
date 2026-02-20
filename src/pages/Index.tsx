import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AccessChat } from "@/components/AccessChat";
import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import HealthDataSnapshot from "@/components/home/HealthDataSnapshot";
import CoreAccessGrid from "@/components/home/CoreAccessGrid";
import GuidedPathways from "@/components/home/GuidedPathways";
import AuthorityStrip from "@/components/home/AuthorityStrip";
import SystemsExplainer from "@/components/home/SystemsExplainer";
import TrustIndicators from "@/components/home/TrustIndicators";
import CountyWelcomeBanner from "@/components/home/CountyWelcomeBanner";
import CountyInfoCard from "@/components/home/CountyInfoCard";
import SpotlightTabs from "@/components/shared/SpotlightTabs";
import RegionalGateway from "@/components/home/RegionalGateway";
import SmartRecommendations from "@/components/home/SmartRecommendations";
import OnboardingTour from "@/components/shared/OnboardingTour";
import SectionNav from "@/components/home/SectionNav";
import SuccessStories from "@/components/home/SuccessStories";
import SocialProofStrip from "@/components/home/SocialProofStrip";
import NearbyResourceFinder from "@/components/home/NearbyResourceFinder";
import AudienceSelector from "@/components/home/AudienceSelector";
import DiscoveryWizard from "@/components/home/DiscoveryWizard";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";

const Index = () => {
  const { t } = useTranslation();
  const [dataExpanded, setDataExpanded] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);

  usePageMeta({
    title: "Access Michigan: Health, Housing, Energy & Services | Open Data",
    description: "Independent civic resource organizing health, housing, energy, transportation, and legal services across all 83 Michigan counties. Free, no tracking, open data.",
    path: "/",
  });

  return (
    <Layout>
      <OnboardingTour />
      <SectionNav />

      {/* ── Layer 1: Crisis & Urgent Help (always pinned via CrisisBar in Layout) ── */}
      <CountyWelcomeBanner />

      {/* ── Layer 2: Search & Top Pathways ── */}
      <HeroSection />

      {/* Wizard CTA */}
      <div className="container py-4 flex justify-center">
        <Button onClick={() => setWizardOpen(true)} size="lg" className="gap-2 rounded-full shadow-lg">
          <Sparkles className="h-4 w-4" /> {t("wizard.cta")}
        </Button>
      </div>
      <DiscoveryWizard open={wizardOpen} onOpenChange={setWizardOpen} />

      <AudienceSelector />
      <GuidedPathways />
      <AuthorityStrip />
      <SocialProofStrip />

      {/* ── Layer 3: Personalized Snapshot (region-reactive) ── */}
      <HealthDataSnapshot />
      <NearbyResourceFinder />
      <SpotlightTabs />
      <CoreAccessGrid />

      {/* ── Layer 4: Data Insights (collapsed by default) ── */}
      <section className="py-6">
        <div className="container">
          <div className="flex items-center justify-center">
            <Button
              variant="outline"
              onClick={() => setDataExpanded(!dataExpanded)}
              className="gap-2 text-sm"
              aria-expanded={dataExpanded}
            >
              {dataExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {dataExpanded ? t("home.collapseData") : t("home.exploreData")}
            </Button>
          </div>
          {dataExpanded && (
            <div className="mt-8 space-y-8 animate-in fade-in slide-in-from-top-4 duration-300">
              <CountyInfoCard />
              <SmartRecommendations />
              <SystemsExplainer />
              <TrustIndicators />
            </div>
          )}
        </div>
      </section>

      {/* ── Layer 5: Regional Gateway & Use Cases ── */}
      <RegionalGateway />
      <SuccessStories />

      {/* AI Chat — positioned just above footer */}
      <AccessChat />
    </Layout>
  );
};

export default Index;
