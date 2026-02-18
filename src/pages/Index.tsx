import { AccessChat } from "@/components/AccessChat";
import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import ComparisonTable from "@/components/home/ComparisonTable";
import CoreAccessGrid from "@/components/home/CoreAccessGrid";
import GuidedPathways from "@/components/home/GuidedPathways";
import SystemsExplainer from "@/components/home/SystemsExplainer";
import TrustIndicators from "@/components/home/TrustIndicators";
import CountyWelcomeBanner from "@/components/home/CountyWelcomeBanner";
import CountyInfoCard from "@/components/home/CountyInfoCard";
import SpotlightTabs from "@/components/shared/SpotlightTabs";
import RegionalGateway from "@/components/home/RegionalGateway";
import EngineeringFAQ from "@/components/home/EngineeringFAQ";
import SmartRecommendations from "@/components/home/SmartRecommendations";
import OnboardingTour from "@/components/shared/OnboardingTour";
import SectionNav from "@/components/home/SectionNav";
import QuickActionGrid from "@/components/home/QuickActionGrid";
import StakeholderCTAs from "@/components/home/StakeholderCTAs";
import SuccessStories from "@/components/home/SuccessStories";
import AudienceSelector, { useAudience } from "@/components/home/AudienceSelector";
import { usePageMeta } from "@/hooks/usePageMeta";

const Index = () => {
  usePageMeta({
    title: "Access Michigan: Health, Transport & Safety Hub | Powered by Open Data",
    description: "One structured gateway to health, housing, food, and family services across all 83 Michigan counties.",
    path: "/",
  });

  const { audience, select } = useAudience();

  // Audience-specific section ordering
  const renderSections = () => {
    switch (audience) {
      case "health-system":
        return (
          <>
            <EngineeringFAQ />
            <RegionalGateway />
            <SystemsExplainer />
            <CountyInfoCard />
            <CoreAccessGrid />
            <SpotlightTabs />
            <GuidedPathways />
            <SuccessStories />
            <SmartRecommendations />
            <TrustIndicators />
          </>
        );
      case "policymaker":
        return (
          <>
            <RegionalGateway />
            <EngineeringFAQ />
            <SystemsExplainer />
            <CoreAccessGrid />
            <CountyInfoCard />
            <SpotlightTabs />
            <SuccessStories />
            <SmartRecommendations />
            <GuidedPathways />
            <TrustIndicators />
          </>
        );
      case "provider":
        return (
          <>
            <RegionalGateway />
            <CoreAccessGrid />
            <CountyInfoCard />
            <SmartRecommendations />
            <GuidedPathways />
            <SuccessStories />
            <SpotlightTabs />
            <EngineeringFAQ />
            <SystemsExplainer />
            <TrustIndicators />
          </>
        );
      default: // "resident" or null
        return (
          <>
            <RegionalGateway />
            <CountyInfoCard />
            <SmartRecommendations />
            <CoreAccessGrid />
            <GuidedPathways />
            <SuccessStories />
            <SpotlightTabs />
            <EngineeringFAQ />
            <SystemsExplainer />
            <TrustIndicators />
          </>
        );
    }
  };

  return (
    <Layout>
      <OnboardingTour />
      <SectionNav />
      <AccessChat />
      <CountyWelcomeBanner />
      <HeroSection />
      <QuickActionGrid />
      <AudienceSelector audience={audience} onSelect={select} />
      <StakeholderCTAs />
      <ComparisonTable />
      {renderSections()}
    </Layout>
  );
};

export default Index;
