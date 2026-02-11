import Layout from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Construction } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description: string;
}

const PlaceholderPage = ({ title, description }: PlaceholderPageProps) => (
  <Layout>
    <div className="container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Construction className="h-8 w-8 text-primary" />
        </div>
        <h1 className="mb-3 text-3xl font-bold text-foreground">{title}</h1>
        <p className="mx-auto max-w-md text-muted-foreground">{description}</p>
        <p className="mt-6 text-sm text-muted-foreground/60">Coming soon — this section is under development</p>
      </motion.div>
    </div>
  </Layout>
);

export const FindCare = () => (
  <PlaceholderPage
    title="Find Care Near You"
    description="Search doctors, hospitals, and urgent care by location, specialty, quality ratings, and insurance accepted."
  />
);

export const FinancialHelp = () => (
  <PlaceholderPage
    title="Financial Assistance Hub"
    description="Find free and reduced-cost care, insurance enrollment help, prescription assistance, and social services."
  />
);

export const QualityRatings = () => (
  <PlaceholderPage
    title="Quality & Safety Ratings"
    description="Compare hospitals and providers using independent safety grades, clinical quality metrics, and patient experience scores."
  />
);

export const Conditions = () => (
  <PlaceholderPage title="Health Conditions" description="Evidence-based health information, treatment options, and care pathways for major conditions." />
);

export const Resources = () => (
  <PlaceholderPage title="Community Resources" description="Food, housing, transportation, mental health, and social services across Michigan." />
);

export const News = () => (
  <PlaceholderPage title="Health News & Insights" description="Michigan health updates, disease prevention, research advances, and community spotlights." />
);

export const Costs = () => (
  <PlaceholderPage title="Cost Transparency" description="Compare procedure costs, find prescription savings, and understand medical billing." />
);

export const Wellness = () => (
  <PlaceholderPage title="Prevention & Wellness" description="Age-specific preventive care, screening calendars, healthy living resources, and vaccine finder." />
);

export const ClinicalTrials = () => (
  <PlaceholderPage title="Clinical Trials Finder" description="Search active clinical trials in Michigan by condition, location, and phase." />
);

export const Support = () => (
  <PlaceholderPage title="Support Groups & Community" description="Find support groups, peer support, caregiver resources, and crisis services." />
);

export const Learn = () => (
  <PlaceholderPage title="Health Education Library" description="Health topics A-Z, symptom checker, health calculators, and educational resources." />
);

export const HealthData = () => (
  <PlaceholderPage title="Michigan Health Data Dashboard" description="Interactive dashboards showing health trends, access indicators, and equity metrics." />
);

export const About = () => (
  <PlaceholderPage title="About & How to Use" description="Our mission, methodology, data sources, and how we rank healthcare providers." />
);
