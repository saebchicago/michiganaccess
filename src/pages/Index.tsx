import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import CoreAccessGrid from "@/components/home/CoreAccessGrid";
import SystemsExplainer from "@/components/home/SystemsExplainer";
import TrustIndicators from "@/components/home/TrustIndicators";
import CountyWelcomeBanner from "@/components/home/CountyWelcomeBanner";
import CountyInfoCard from "@/components/home/CountyInfoCard";
import CommunityProgramSpotlights from "@/components/shared/CommunityProgramSpotlights";
import TransportationSpotlights from "@/components/shared/TransportationSpotlights";
import EnergySpotlights from "@/components/shared/EnergySpotlights";
import EnvironmentSpotlights from "@/components/shared/EnvironmentSpotlights";
import EducationSpotlights from "@/components/shared/EducationSpotlights";
import LegalCivicSpotlights from "@/components/shared/LegalCivicSpotlights";
import { usePageMeta } from "@/hooks/usePageMeta";

const Index = () => {
  usePageMeta({
    title: "Michigan Access — Statewide Services Gateway",
    description: "One structured gateway to health, housing, food, and family services across all 83 Michigan counties.",
    path: "/",
  });
  return (
  <Layout>
    <CountyWelcomeBanner />
    <HeroSection />
    <CountyInfoCard />
    <CoreAccessGrid />
    <CommunityProgramSpotlights />
    <TransportationSpotlights />
    <EnergySpotlights />
    <EnvironmentSpotlights />
    <EducationSpotlights />
    <LegalCivicSpotlights />
    <SystemsExplainer />
    <TrustIndicators />
  </Layout>
  );
};

export default Index;
