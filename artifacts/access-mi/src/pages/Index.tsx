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
import { ProvenanceTag } from "@/components/shared/ProvenanceTag";
import { MI_COUNTY_FIPS } from "@/data/census-geographies";
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
  rule: string;
  iconClass: string;
  tools: ClusterTool[];
};

const CLUSTERS: Cluster[] = [
  {
    id: "policy-investment",
    label: "Policy and investment",
    purpose: "Federal investment, equity atlas, briefs, and full data exports.",
    icon: BarChart3,
    rule: "bg-michigan-gold",
    iconClass: "text-michigan-gold",
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
    rule: "bg-michigan-coral",
    iconClass: "text-michigan-coral",
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
    rule: "bg-michigan-teal",
    iconClass: "text-michigan-teal",
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
    rule: "bg-michigan-blue",
    iconClass: "text-michigan-blue",
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
    <section className="border-b border-border/60">
      <div className="container mx-auto px-4 pt-16 pb-14 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          <p className="text-caption">Michigan civic data ledger</p>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold leading-[1.1] tracking-tight text-foreground">
            Civic intelligence for every Michigan county.
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
            Independent data, federal sources, and the methodology behind every
            number - organized so you can find what affects you, your patients,
            or your community.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (zip.trim().length === 5) onZipSubmit(zip.trim());
            }}
            className="flex gap-2 max-w-md"
            aria-label="Find data for your ZIP code"
          >
            <Input
              inputMode="numeric"
              pattern="[0-9]{5}"
              maxLength={5}
              placeholder="Enter your ZIP code"
              value={zip}
              onChange={(e) => setZip(e.target.value.replace(/\D/g, ""))}
              className="bg-card text-foreground border-border placeholder:text-muted-foreground"
              data-numeric
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
              Every number carries its source and label - see the methodology
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Provenance legend ───────────────────────────────────────────────────────
//
// Surfaces the three integrity labels and what each one means. Renders the
// canonical ProvenanceTag component so the chip a visitor sees on the landing
// is identical to the chip they see on every destination page. The label
// taxonomy (VERIFIED / MODELED / PROJECTED) and the chip color mapping are
// owned by ProvenanceTag and are not redefined here.

const LEGEND: { label: "VERIFIED" | "MODELED" | "PROJECTED"; gloss: string }[] =
  [
    {
      label: "VERIFIED",
      gloss: "Measured directly from a primary federal or state source.",
    },
    {
      label: "MODELED",
      gloss: "Derived or calculated from verified inputs.",
    },
    {
      label: "PROJECTED",
      gloss: "Forward-looking estimate.",
    },
  ];

function ProvenanceLegend() {
  return (
    <section
      aria-labelledby="legend-heading"
      className="border-b border-border/60"
    >
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="flex flex-col gap-2 mb-6">
          <p className="text-caption">Integrity labels</p>
          <h2
            id="legend-heading"
            className="font-serif text-2xl font-semibold text-foreground"
          >
            How every number is labeled.
          </h2>
        </div>
        <dl className="grid gap-4 sm:grid-cols-3">
          {LEGEND.map(({ label, gloss }) => (
            <div
              key={label}
              className="flex flex-col gap-2 border border-border/70 bg-card/60 p-4 rounded-md"
            >
              <dt>
                <ProvenanceTag label={label} />
              </dt>
              <dd className="text-sm text-muted-foreground leading-relaxed">
                {gloss}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

// ─── 83-cell county selector ─────────────────────────────────────────────────
//
// Visual shell only. Cells are alphabetical and link to the existing
// /county/<slug> route. No per-county data values are rendered here; data is
// surfaced on the destination page. Slug convention mirrors RegionalGateway.

const COUNTY_NAMES = Object.keys(MI_COUNTY_FIPS).sort((a, b) =>
  a.localeCompare(b),
);

function countySlug(name: string): string {
  return name.toLowerCase().replace(/[.\s]+/g, "-");
}

function CountySelector() {
  return (
    <section
      aria-labelledby="counties-heading"
      className="border-b border-border/60"
    >
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="flex flex-col gap-2 mb-6">
          <p className="text-caption">All counties</p>
          <h2
            id="counties-heading"
            className="font-serif text-2xl font-semibold text-foreground"
          >
            Browse by county.
          </h2>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Open the civic profile for any of the {COUNTY_NAMES.length} counties
            in Michigan.
          </p>
        </div>
        <ul
          role="list"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-px bg-border/60 border border-border/60 rounded-md overflow-hidden"
        >
          {COUNTY_NAMES.map((name) => (
            <li key={name}>
              <Link
                to={`/county/${countySlug(name)}`}
                className="flex h-full items-center justify-between gap-1 bg-card px-3 py-2.5 text-xs text-foreground hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:relative focus-visible:z-10 transition-colors"
              >
                <span className="truncate">{name}</span>
                <ArrowRight
                  className="h-3 w-3 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
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
      className="relative overflow-hidden rounded-md border border-border/70 bg-card p-5 transition-colors hover:bg-muted/40"
    >
      <span
        aria-hidden="true"
        className={`absolute left-0 top-0 h-full w-[3px] ${cluster.rule}`}
      />
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-5 w-5 ${cluster.iconClass}`} aria-hidden="true" />
        <h2 className="font-serif text-lg font-semibold text-foreground">
          {cluster.label}
        </h2>
      </div>
      <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
        {cluster.purpose}
      </p>
      <ul className="space-y-1.5">
        {cluster.tools.map((tool) => (
          <li key={tool.href}>
            <Link
              to={tool.href}
              className="inline-flex items-center gap-1.5 text-sm text-foreground hover:text-info group"
            >
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-info transition-colors" />
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
      className="relative overflow-hidden rounded-md border border-border/70 bg-muted/40 p-5"
    >
      <span
        aria-hidden="true"
        className="absolute left-0 top-0 h-full w-[3px] bg-michigan-teal"
      />
      <div className="flex items-center gap-2 mb-2">
        <Database className="h-5 w-5 text-michigan-teal" aria-hidden="true" />
        <h2 className="font-serif text-lg font-semibold text-foreground">
          Recently added
        </h2>
      </div>
      <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
        New tools, datasets, and methodology updates land here.
      </p>
      <Link
        to="/changelog"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-info hover:underline"
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
      className="container mx-auto px-4 py-14 max-w-5xl"
    >
      <div className="flex flex-col gap-2 mb-6">
        <p className="text-caption">Pick a path</p>
        <h2 className="font-serif text-2xl font-semibold text-foreground">
          Choose where to begin.
        </h2>
      </div>
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

      <div className="dark bg-background text-foreground">
        <Layer1Hero onZipSubmit={(zip) => navigate(`/zip/${zip}`)} />
        <ProvenanceLegend />
        <CountySelector />
        <Layer2ClusterGrid />
      </div>

      <AccessChat />
    </Layout>
  );
};

export default Index;
