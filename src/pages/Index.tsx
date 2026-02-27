import SectionErrorBoundary from "@/components/shared/SectionErrorBoundary";
import { useState, lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronUp, Sparkles, Heart, Users, AlertCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import GuidedPathways from "@/components/home/GuidedPathways";
import { EquityInsightCard } from "@/components/shared/EquityInsightCard";
import { ProfessionalGateway } from "@/components/home/ProfessionalGateway";
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

// ── Below-fold: lazy-loaded components ──
const UnderstandMyCommunity = lazy(() => import("@/components/place/UnderstandMyCommunity"));
const WatchlistPanel = lazy(() => import("@/components/shared/WatchlistPanel"));
const BetaImpactCounter = lazy(() => import("@/components/shared/BetaImpactCounter"));
const HealthDataSnapshot = lazy(() => import("@/components/home/HealthDataSnapshot"));
const NearbyResourceFinder = lazy(() => import("@/components/home/NearbyResourceFinder"));
const CoreAccessGrid = lazy(() => import("@/components/home/CoreAccessGrid"));
const TransportationSafetyCallout = lazy(() => import("@/components/home/TransportationSafetyCallout"));
const CommunityAlerts = lazy(() => import("@/components/home/CommunityAlerts"));
const RegionalGateway = lazy(() => import("@/components/home/RegionalGateway"));
const SuccessStories = lazy(() => import("@/components/home/SuccessStories"));
const CountyChoropleth = lazy(() => import("@/components/dashboard/CountyChoropleth"));

const SectionFallback = () => (
  <div className="py-8 flex justify-center">
    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

const Index = () => {
  const { t } = useTranslation();
  const [wizardOpen, setWizardOpen] = useState(false);

  usePageMeta({
    title: "Access Michigan: Health, Housing, Energy & Services | Open Data",
    description:
      "Independent civic resource organizing health, housing, energy, transportation, and legal services across all 83 Michigan counties. Free, no tracking, open data.",
    path: "/",
  });

  return (
    <Layout>
      {/* ═══ LAYER 1 — IMMEDIATE HELP ═══ */}
      <OutageAlertBanner />
      <CountyWelcomeBanner />

      {/* ═══ LAYER 2 — SEARCH & GUIDED PATHWAYS ═══ */}
      <HeroSection />
      <div className="container py-4">
        <DataProvenance
          source="Public datasets (State of Michigan + local agencies). Independently organized."
          updated="2026-02-23"
          methodologyHref="/about"
        />
      </div>

      <div className="container py-4 flex justify-center">
        <Button onClick={() => setWizardOpen(true)} size="lg" className="gap-2 rounded-full shadow-lg">
          <Sparkles className="h-4 w-4" /> {t("wizard.cta")}
        </Button>
      </div>
      <DiscoveryWizard open={wizardOpen} onOpenChange={setWizardOpen} />

      <AudienceSelector />
      <GuidedPathways />
      <AuthorityStrip />

      {/* ═══ UNDERSTAND MY COMMUNITY CTA ═══ */}
      <LazySection minHeight="80px">
        <Suspense fallback={<SectionFallback />}>
          <section className="py-10 container max-w-2xl">
            <UnderstandMyCommunity />
          </section>
        </Suspense>
      </LazySection>

      <LazySection minHeight="60px">
        <Suspense fallback={<SectionFallback />}>
          <WatchlistPanel />
          <BetaImpactCounter />
        </Suspense>
      </LazySection>

      <SocialProofStrip />

      {/* ═══ EQUITY INSIGHTS ═══ */}
      <LazySection minHeight="200px">
        <section className="py-14 container">
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-foreground md:text-3xl mb-2">
              Health Equity in Michigan
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Some Michigan residents face greater barriers to health and opportunity.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-6">
            <EquityInsightCard
              icon={Heart} title="Black Infant Mortality" stat="2.4x higher"
              description="Black infants in Michigan face 2.4 times higher mortality rates than white infants."
              color="coral" trend="up" ctaText="View equity data" ctaHref="/data-and-insights"
            />
            <EquityInsightCard
              icon={Users} title="Rural Uninsured Rate" stat="14%"
              description="Rural Michiganders are twice as likely to be uninsured as urban residents."
              color="gold" trend="stable" ctaText="View equity data" ctaHref="/data-and-insights"
            />
            <EquityInsightCard
              icon={AlertCircle} title="Primary Care Shortage" stat="23 counties"
              description="Nearly a third of Michigan counties lack adequate primary care providers."
              color="teal" trend="down" ctaText="View equity data" ctaHref="/data-and-insights"
            />
          </div>
        </section>
      </LazySection>

      {/* ═══ LAYER 3 — PERSONALIZED SNAPSHOT ═══ */}
      <SectionErrorBoundary title="Some content didn't load">
        <LazySection>
          <Suspense fallback={<SectionFallback />}>
            <HealthDataSnapshot />
            <NearbyResourceFinder />
            <CoreAccessGrid />
            <TransportationSafetyCallout />
          </Suspense>
        </LazySection>
      </SectionErrorBoundary>

      {/* ═══ LAYER 4 — EXPLORATION (compact) ═══ */}
      <SectionErrorBoundary title="Some content didn't load">
        <LazySection>
          <Suspense fallback={<SectionFallback />}>
            {/* Browse all resources CTA instead of full program directory */}
            <section className="py-10">
              <div className="container text-center">
                <h2 className="text-xl font-bold text-foreground mb-3">Explore Community Resources</h2>
                <p className="text-muted-foreground max-w-lg mx-auto mb-6">
                  Browse 700+ verified programs across housing, food, health, transportation, energy, education, legal, and more.
                </p>
                <Link to="/resources">
                  <Button size="lg" className="gap-2">
                    Browse All Programs <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </section>

            <CommunityAlerts />

            <section className="py-8">
              <div className="container max-w-5xl">
                <CountyChoropleth highlightCounty="Oakland" />
              </div>
            </section>

            <RegionalGateway />
            <SuccessStories />
            <ProfessionalGateway />
          </Suspense>
        </LazySection>
      </SectionErrorBoundary>

      <AccessChat />
    </Layout>
  );
};

export default Index;
