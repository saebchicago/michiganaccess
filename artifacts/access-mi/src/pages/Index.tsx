import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Heart,
  MapPin,
  Database,
  BarChart3,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AccessChat } from "@/components/AccessChat";
import OutageAlertBanner from "@/components/home/OutageAlertBanner";
import CountyWelcomeBanner from "@/components/home/CountyWelcomeBanner";
import { OfficialChannelNotice } from "@/components/shared/OfficialChannelNotice";
import { usePageMeta } from "@/hooks/usePageMeta";

// Preserved for back-compat with consumers like AudienceSelector that still
// import this type from the home page.
export type PersonaView = "resident" | "professional";

// ─── Layer 2 cluster definitions ─────────────────────────────────────────────
//
// Each cluster card carries: a label, a one-line purpose, an anchor id (used by
// nav), and a short list of tools. "Tools" are the existing Layer 3 destination
// pages  -  clicking through goes to the actual tool, not back to this card.

type ClusterTool = { label: string; href: string };
type Cluster = {
  id: string;
  label: string;
  purpose: string;
  icon: typeof Heart;
  accent: string;
  tools: ClusterTool[];
};

const CLUSTERS: Cluster[] = [
  {
    id: "policy-investment",
    label: "Policy and investment",
    purpose: "Federal investment, equity atlas, briefs, and full data exports.",
    icon: BarChart3,
    accent: "border-purple-200 bg-purple-50 dark:bg-purple-950/20",
    tools: [
      { label: "Public investment", href: "/public-investment" },
      { label: "Health equity atlas", href: "/health-equity-atlas" },
      { label: "Data sources", href: "/data-sources" },
      { label: "Downloads", href: "/downloads" },
      { label: "Methodology", href: "/methodology" },
    ],
  },
  {
    id: "health-coverage",
    label: "Health and coverage",
    purpose: "Coverage at risk, access gaps, and closure tracking.",
    icon: ShieldCheck,
    accent: "border-amber-200 bg-amber-50 dark:bg-amber-950/20",
    tools: [
      {
        label: "Medicaid coverage at risk",
        href: "/data/medicaid-coverage-at-risk",
      },
      { label: "SNAP coverage at risk", href: "/data/snap-coverage-at-risk" },
      { label: "Dual-eligible exposure", href: "/data/dual-eligible-exposure" },
      { label: "Closure watch", href: "/closure-watch" },
      { label: "Detection gap", href: "/detection-gap" },
    ],
  },
  {
    id: "explore-area",
    label: "Explore your area",
    purpose: "County and ZIP-level signals, comparisons, and cost of living.",
    icon: MapPin,
    accent: "border-teal-200 bg-teal-50 dark:bg-teal-950/20",
    tools: [
      { label: "ZIP intelligence", href: "/zip-intelligence" },
      { label: "Find your city", href: "/find-your-city" },
      { label: "Compare counties", href: "/compare" },
      { label: "Tax comparison", href: "/tax-comparison" },
      { label: "Civic data hub", href: "/civic-data-hub" },
    ],
  },
  {
    id: "learn-benefits",
    label: "Learn about benefits",
    purpose: "How Michigan benefit programs and eligibility rules work.",
    icon: Heart,
    accent: "border-rose-200 bg-rose-50 dark:bg-rose-950/20",
    tools: [
      { label: "Life event navigator", href: "/benefits" },
      { label: "Find care near you", href: "/find-care" },
      { label: "Insurance & coverage", href: "/insurance-coverage" },
      { label: "Financial help", href: "/financial-help" },
      { label: "Community resources", href: "/resources" },
    ],
  },
];

// ─── Layer 1: orientation strip (above the fold) ─────────────────────────────

function Layer1Hero({ onZipSubmit }: { onZipSubmit: (zip: string) => void }) {
  const [zip, setZip] = useState("");

  return (
    <section className="container mx-auto px-4 pt-16 pb-12 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center space-y-5"
      >
        <h1 className="text-3xl md:text-4xl font-bold leading-tight text-foreground">
          Civic intelligence for every Michigan county.
        </h1>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto">
          Independent data, federal sources, and the methodology behind every
          number  -  organized so you can find what affects you, your patients, or
          your community.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (zip.trim().length === 5) onZipSubmit(zip.trim());
          }}
          className="flex gap-2 max-w-sm mx-auto"
          aria-label="Find data for your ZIP code"
        >
          <Input
            inputMode="numeric"
            pattern="[0-9]{5}"
            maxLength={5}
            placeholder="Enter your ZIP code"
            value={zip}
            onChange={(e) => setZip(e.target.value.replace(/\D/g, ""))}
            className="text-center"
            aria-label="ZIP code"
          />
          <Button type="submit" disabled={zip.trim().length !== 5}>
            Look up
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>

        <p className="text-xs text-muted-foreground">
          <Link
            to="/methodology"
            className="inline-flex items-center gap-1 underline-offset-2 hover:underline"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Every number carries its source and label  -  see the methodology
          </Link>
        </p>
      </motion.div>
    </section>
  );
}

// ─── Layer 2: cluster cards + Recently added ─────────────────────────────────

function ClusterCard({ cluster }: { cluster: Cluster }) {
  const Icon = cluster.icon;
  const isBenefits = cluster.id === "learn-benefits";
  return (
    <article
      id={cluster.id}
      className={`rounded-xl border p-5 transition-shadow hover:shadow-md ${cluster.accent}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-5 w-5 text-foreground" />
        <h2 className="text-base font-semibold text-foreground">
          {cluster.label}
        </h2>
      </div>
      <p className="text-xs text-muted-foreground mb-4">{cluster.purpose}</p>
      <ul className="space-y-1.5">
        {cluster.tools.map((tool) => (
          <li key={tool.href}>
            <Link
              to={tool.href}
              className="inline-flex items-center gap-1.5 text-sm text-foreground hover:text-primary group"
            >
              <ArrowRight className="h-3.5 w-3.5 text-primary/70 group-hover:text-primary transition-colors" />
              <span className="group-hover:underline">{tool.label}</span>
            </Link>
          </li>
        ))}
      </ul>
      {isBenefits && (
        <div className="mt-4">
          <OfficialChannelNotice variant="compact" />
        </div>
      )}
    </article>
  );
}

function RecentlyAddedCard() {
  return (
    <article
      id="recently-added"
      className="rounded-xl border border-border bg-muted/30 p-5"
    >
      <div className="flex items-center gap-2 mb-2">
        <Database className="h-5 w-5 text-foreground" />
        <h2 className="text-base font-semibold text-foreground">
          Recently added
        </h2>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        New tools, datasets, and methodology updates land here.
      </p>
      <Link
        to="/changelog"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        See the systems history
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </article>
  );
}

function Layer2ClusterGrid() {
  return (
    <section
      aria-label="Choose a path"
      className="container mx-auto px-4 pb-16 max-w-5xl"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CLUSTERS.map((c) => (
          <ClusterCard key={c.id} cluster={c} />
        ))}
        <RecentlyAddedCard />
      </div>
    </section>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

const Index = () => {
  const navigate = useNavigate();
  usePageMeta({
    title: "AccessMI  -  Civic intelligence for Michigan",
    description:
      "Explore Michigan policy and investment data, health coverage trends, county and ZIP-level signals, and educational explainers of how benefit programs work  -  all sourced from primary federal records.",
  });

  return (
    <Layout>
      <OutageAlertBanner />
      <CountyWelcomeBanner />

      <Layer1Hero onZipSubmit={(zip) => navigate(`/zip/${zip}`)} />
      <Layer2ClusterGrid />

      <AccessChat />
    </Layout>
  );
};

export default Index;
