import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import QuickActions from "@/components/home/QuickActions";
import StatsBar from "@/components/home/StatsBar";
import FeaturedTopics from "@/components/home/FeaturedTopics";
import HowItHelps from "@/components/home/HowItHelps";
import TrustIndicators from "@/components/home/TrustIndicators";

const Index = () => (
  <Layout>
    <HeroSection />
    <QuickActions />
    <StatsBar />
    <FeaturedTopics />
    <HowItHelps />
    <TrustIndicators />
  </Layout>
);

export default Index;
