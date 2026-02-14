import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import CoreAccessGrid from "@/components/home/CoreAccessGrid";
import SystemsExplainer from "@/components/home/SystemsExplainer";
import TrustIndicators from "@/components/home/TrustIndicators";

const Index = () => (
  <Layout>
    <HeroSection />
    <CoreAccessGrid />
    <SystemsExplainer />
    <TrustIndicators />
  </Layout>
);

export default Index;
