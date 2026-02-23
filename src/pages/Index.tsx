import { useState, lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";

import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import GuidedPathways from "@/components/home/GuidedPathways";
import AuthorityStrip from "@/components/home/AuthorityStrip";
import CountyWelcomeBanner from "@/components/home/CountyWelcomeBanner";
import AudienceSelector from "@/components/home/AudienceSelector";
import DiscoveryWizard from "@/components/home/DiscoveryWizard";
import OutageAlertBanner from "@/components/home/OutageAlertBanner";
import SocialProofStrip from "@/components/home/SocialProofStrip";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Button } from "@/components/ui/button";
import { AccessChat } from "@/components/AccessChat";

import LazySection from "@/components/shared/LazySection";
import DataProvenance from "@/components/shared/DataProvenance";

// ── Layer 3+: lazy-loaded below the fold ──
const HealthDataSnapshot = lazy(() => import("@/components/home/HealthDataSnapshot"));
const NearbyResourceFinder = lazy(() => import("@/components/home/NearbyResourceFinder"));
const CoreAccessGrid = lazy(() => import("@/components/home/CoreAccessGrid"));
const TransportationSafetyCallout = lazy(() => import("@/components/home/TransportationSafetyCallout"));
const SpotlightTabs = lazy(() => import("@/components/shared/SpotlightTabs"));
const CommunityAlerts = lazy(() => import("@/components/home/CommunityAlerts"));
const RegionalGateway = lazy(() => import("@/components/home/RegionalGateway"));
const SuccessStories = lazy(() => import("@/components/home/SuccessStories"));
const DrugPriceLookup = lazy(() => import("@/components/learn/DrugPriceLookup"));
const CountyInfoCard = lazy(() => import("@/components/home/CountyInfoCard"));
const SmartRecommendations = lazy(() => import("@/components/home/SmartRecommendations"));
const SystemsExplainer = lazy(() => import("@/components/home/SystemsExplainer"));
const TrustIndicators = lazy(() => import("@/components/home/TrustIndicators"));
const CountyChoropleth = lazy(() => import("@/components/dashboard/CountyChoropleth"));

const SectionFallback = () => (
  <div className="py-8 flex justify-center">
    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

const Index = () => {
  const { t } = useTranslation();
  const [dataExpanded, setDataExpanded] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);

  usePageMeta({
    title: "Access Michigan: Health, Housing, Energy & Services | Open Data",
    description:
      "Independent civic resource organizing health, housing, energy, transportation, and legal services across all 83 Michigan counties. Free, no tracking, open data.",
    path: "/",
  });

  return (
    <Layout>
      {/* ═══════════════════════════════════════════════════════════════════
          LAYER 1 — IMMEDIATE HELP
          Always visible. Crisis resources + outage alerts + county context.
          CrisisBar is already pinned in Layout.
      ═══════════════════════════════════════════════════════════════════ */}
      <OutageAlertBanner />
      <CountyWelcomeBanner />

      {/* ═══════════════════════════════════════════════════════════════════
          LAYER 2 — SEARCH & GUIDED PATHWAYS
          Primary decision interface: hero search, persona selector,
          wizard CTA, and guided pathways.
      ═══════════════════════════════════════════════════════════════════ */}
      <HeroSection />

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

      {/* ═══════════════════════════════════════════════════════════════════
          LAYER 3 — PERSONALIZED SNAPSHOT
          Context-aware, region-reactive content. Lazy-loaded.
      ═══════════════════════════════════════════════════════════════════ */}
      <LazySection>
        <Suspense fallback={<SectionFallback />}>
          <HealthDataSnapshot />
          <NearbyResourceFinder />
          <CoreAccessGrid />
          <TransportationSafetyCallout />
        </Suspense>
      </LazySection>

      {/* ═══════════════════════════════════════════════════════════════════
          LAYER 4 — EXPLORATION (lower priority, progressive disclosure)
          Community spotlights, alerts, data deep-dives, regional gateways.
      ═══════════════════════════════════════════════════════════════════ */}
      <LazySection>
        <Suspense fallback={<SectionFallback />}>
          <SpotlightTabs />
          <CommunityAlerts />

          {/* Data Insights — collapsed by default */}
          <section className="py-6">
            <div className="container">
              <div className="flex items-center justify-center">
                <Button
                  variant="outline"
                  onClick={() => setDataExpanded((v) => !v)}
                  className="gap-2 text-sm"
                  aria-expanded={dataExpanded}
                >
                  {dataExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  {dataExpanded ? t("home.collapseData") : t("home.exploreData")}
                </Button>
              </div>

              {dataExpanded && (
                <div className="mt-8 space-y-8 animate-in fade-in slide-in-from-top-4 duration-300">
                  <DrugPriceLookup />
                  <CountyInfoCard />
                  <SmartRecommendations />
                  <SystemsExplainer />
                  <TrustIndicators />
                </div>
              )}
            </div>
          </section>

          <section className="py-8">
            <div className="container max-w-5xl">
              <CountyChoropleth highlightCounty="Oakland" />
            </div>
          </section>

          <div className="container pb-10">
            <DataProvenance source="State of Michigan & other public sources" updated="2026-02-23" methodologyHref="/about" />
          </div>

          <RegionalGateway />
          <SuccessStories />
        </Suspense>
      </LazySection>

      {/* AI Chat — just above footer */}
      <AccessChat />
    </Layout>
  );
};

export default Index;
