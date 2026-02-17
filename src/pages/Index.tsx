import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
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
import { usePageMeta } from "@/hooks/usePageMeta";

const Index = () => {
  usePageMeta({
    title: "Michigan Access — Statewide Services Gateway",
    description: "One structured gateway to health, housing, food, and family services across all 83 Michigan counties.",
    path: "/",
  });
  return (
    <Layout>
      <OnboardingTour />
      <CountyWelcomeBanner />
      <HeroSection />
      <RegionalGateway />
      <CountyInfoCard />
      <SmartRecommendations />
      <CoreAccessGrid />
      <GuidedPathways />
      <SpotlightTabs />
      <EngineeringFAQ />
      <SystemsExplainer />
      <TrustIndicators />
    </Layout>
  );
};

export default Index;
