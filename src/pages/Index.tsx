import { AccessChat } from "@/components/AccessChat";
import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import HealthDataSnapshot from "@/components/home/HealthDataSnapshot";
import CoreAccessGrid from "@/components/home/CoreAccessGrid";
import GuidedPathways from "@/components/home/GuidedPathways";
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
import { usePageMeta } from "@/hooks/usePageMeta";

const Index = () => {
  usePageMeta({
    title: "Access Michigan: Health, Transport & Safety Hub | Powered by Open Data",
    description: "One structured gateway to health, housing, food, and family services across all 83 Michigan counties.",
    path: "/",
  });

  return (
    <Layout>
      <OnboardingTour />
      <SectionNav />
      <CountyWelcomeBanner />
      <HeroSection />
      <GuidedPathways />
      <CoreAccessGrid />
      <RegionalGateway />
      <CountyInfoCard />
      <SmartRecommendations />
      <SuccessStories />
      <SpotlightTabs />
      <SystemsExplainer />
      <TrustIndicators />
      <HealthDataSnapshot />
      <AccessChat />
    </Layout>
  );
};

export default Index;
