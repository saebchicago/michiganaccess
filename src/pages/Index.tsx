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
      {/* 1. Hero */}
      <HeroSection />
      {/* 2. How Can We Help */}
      <GuidedPathways />
      <AuthorityStrip />
      <SocialProofStrip />
      {/* 3. County Health Snapshot — moved up */}
      <HealthDataSnapshot />
      {/* 3.5. Nearby Resource Finder */}
      <NearbyResourceFinder />
      {/* 4. Explore Community Resources */}
      <SpotlightTabs />
      {/* 5. Start Here — core access grid */}
      <CoreAccessGrid />
      {/* 6. Regional Gateway */}
      <RegionalGateway />
      <CountyInfoCard />
      <SmartRecommendations />
      {/* 7. What is Access Michigan */}
      <SystemsExplainer />
      <TrustIndicators />
      {/* 8. How Access Michigan Works (formerly Example Journeys) */}
      <SuccessStories />
      {/* 9. AI Chat */}
      <AccessChat />
    </Layout>
  );
};

export default Index;
