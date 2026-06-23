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
    <section className="relative border-b border-border/60 overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(60% 50% at 15% 0%, hsl(var(--michigan-blue) / 0.35), transparent 70%), radial-gradient(40% 40% at 95% 100%, hsl(var(--info) / 0.18), transparent 70%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"
      />
      <div className="relative container mx-auto px-4 pt-20 pb-16 md:pt-24 md:pb-20 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-8"
        >
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="h-px w-8 bg-accent"
            />
            <p className="text-caption text-accent">
              Michigan civic data ledger
            </p>
          </div>

          <h1 className="font-serif text-[2.5rem] sm:text-5xl md:text-6xl font-semibold leading-[1.02] tracking-[-0.02em] text-foreground">
            Civic intelligence for every{" "}
            <span className="italic text-accent">Michigan</span> county.
          </h1>

          <p className="text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Independent data, federal sources, and the methodology behind every
            number - organized so you can find what affects you, your patients,
            or your community.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (zip.trim().length === 5) onZipSubmit(zip.trim());
            }}
            className="pt-2"
            aria-label="Find data for your ZIP code"
          >
            <label
              htmlFor="hero-zip"
              className="text-caption mb-2 inline-block"
            >
              Start with your ZIP
            </label>
            <div className="flex flex-col sm:flex-row gap-2 max-w-md">
              <Input
                id="hero-zip"
                inputMode="numeric"
                pattern="[0-9]{5}"
                maxLength={5}
                placeholder="e.g. 48104"
                value={zip}
                onChange={(e) => setZip(e.target.value.replace(/\D/g, ""))}
                className="h-12 bg-card/70 text-foreground text-base tracking-[0.15em] border-border/80 placeholder:text-muted-foreground/60 placeholder:tracking-normal focus-visible:border-accent focus-visible:ring-accent"
                data-numeric
                aria-label="ZIP code"
              />
              <Button
                type="submit"
                disabled={zip.trim().length !== 5}
                className="h-12 px-5 group"
              >
                Look up
                <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </div>
          </form>

          <div className="pt-2">
            <Link
              to="/methodology"
              className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors group"
            >
              <Sparkles
                className="w-3.5 h-3.5 text-accent"
                aria-hidden="true"
              />
              <span className="underline-offset-4 group-hover:underline">
                Every number carries its source and label - see the methodology
              </span>
              <ArrowRight
                className="w-3 h-3 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0"
                aria-hidden="true"
              />
            </Link>
          </div>
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

function ClusterCard({
  cluster,
  index,
}: {
  cluster: Cluster;
  index: number;
}) {
  const Icon = cluster.icon;
  const isBenefits = cluster.id === "learn-benefits";
  return (
    <article
      id={cluster.id}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-border/70 bg-card/80 p-6 transition-all duration-300 hover:border-border hover:bg-card hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-20px_hsl(var(--michigan-blue)/0.45)] focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2 focus-within:ring-offset-background"
    >
      <span
        aria-hidden="true"
        className={`absolute left-0 top-0 h-full w-[3px] ${cluster.rule} opacity-80 transition-opacity group-hover:opacity-100`}
      />
      <div className="flex items-start justify-between mb-5">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-md border border-border/60 bg-background/60 ${cluster.iconClass}`}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <span
          className="font-serif text-xs tracking-[0.2em] text-muted-foreground/70"
          aria-hidden="true"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <h2 className="font-serif text-xl font-semibold leading-tight tracking-tight text-foreground mb-2">
        {cluster.label}
      </h2>
      <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
        {cluster.purpose}
      </p>
      <ul className="space-y-0.5 border-t border-border/50 pt-3">
        {cluster.tools.map((tool) => (
          <li key={tool.href}>
            <Link
              to={tool.href}
              className="flex items-center justify-between gap-2 -mx-2 px-2 py-1.5 rounded text-sm text-foreground/90 hover:text-foreground hover:bg-muted/40 focus-visible:outline-none focus-visible:bg-muted/60 transition-colors group/row"
            >
              <span>{tool.label}</span>
              <ArrowRight
                className="h-3.5 w-3.5 text-muted-foreground/60 -translate-x-1 opacity-0 transition-all group-hover/row:opacity-100 group-hover/row:translate-x-0 group-hover/row:text-accent"
                aria-hidden="true"
              />
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
      className="group relative flex flex-col overflow-hidden rounded-lg border border-dashed border-border/70 bg-muted/30 p-6 transition-all duration-300 hover:border-accent/60 hover:bg-muted/50"
    >
      <span
        aria-hidden="true"
        className="absolute left-0 top-0 h-full w-[3px] bg-michigan-teal opacity-80"
      />
      <div className="flex items-start justify-between mb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border/60 bg-background/60 text-michigan-teal">
          <Database className="h-5 w-5" aria-hidden="true" />
        </div>
        <span
          className="font-serif text-xs tracking-[0.2em] text-muted-foreground/70"
          aria-hidden="true"
        >
          LOG
        </span>
      </div>
      <h2 className="font-serif text-xl font-semibold leading-tight tracking-tight text-foreground mb-2">
        Recently added
      </h2>
      <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
        New tools, datasets, and methodology updates land here.
      </p>
      <Link
        to="/changelog"
        className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:gap-2 transition-all group/link"
      >
        See the systems history
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-0.5" />
      </Link>
    </article>
  );
}

function Layer2ClusterGrid() {
  return (
    <section
      aria-label="Choose a path"
      className="container mx-auto px-4 py-16 md:py-20 max-w-5xl"
    >
      <div className="flex flex-col gap-3 mb-10 max-w-2xl">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-8 bg-accent" />
          <p className="text-caption text-accent">Pick a path</p>
        </div>
        <h2 className="font-serif text-3xl md:text-4xl font-semibold tracking-[-0.015em] text-foreground">
          Choose where to begin.
        </h2>
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
          Four entry points into the ledger. Every link leads to a destination
          tool with sourced numbers and integrity labels intact.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CLUSTERS.map((c, i) => (
          <ClusterCard key={c.id} cluster={c} index={i} />
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
