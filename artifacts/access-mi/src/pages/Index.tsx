import { useState, lazy, Suspense } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import Layout from "@/components/layout/Layout";
import UninsuredSparkline from "@/components/county/UninsuredSparkline";
import { STATE_UNCONTESTED_COMPARISON } from "@/data/uncontestedRaces";
import OutageAlertBanner from "@/components/home/OutageAlertBanner";
import CountyWelcomeBanner from "@/components/home/CountyWelcomeBanner";
import { ProvenanceTag } from "@/components/shared/ProvenanceTag";
import { MI_COUNTY_FIPS } from "@/data/census-geographies";
import { usePageMeta } from "@/hooks/usePageMeta";
import { AI_CHAT_ENABLED } from "@/config/aiChat";

// Lazy chat, gated by env flag (unchanged behavior).
const AccessChat = lazy(() =>
  import("@/components/AccessChat").then((m) => ({ default: m.AccessChat })),
);

export type PersonaView = "resident" | "professional";

// ─── Editorial palette (locked from the redesign direction) ───────────────
// Applied as Tailwind arbitrary values so the change is scoped to the
// homepage and does not disturb the site-wide token system. Not migrated
// into --civic-* tokens yet: the redesign is scoped to this page.
const C = {
  cream: "#f5f0e0",
  emerald: "#064e3b",
  emeraldMid: "#0d7a5f",
  gold: "#c9a84c",
} as const;

// ─── Three doors (Understand / Visualize / Belong) ──────────────────────────
// The homepage's three-pillar taxonomy. Each door reuses existing, already-
// labeled platform data - no agent-assigned provenance labels, no invented
// figures. Understand -> composite ZIP score (MODELED, via /zip-intelligence
// and the hero ZIP input above). Visualize -> a real ACS trend sparkline
// (VERIFIED, from static trendSeries data). Belong -> civic power; its
// uncontested-races figure is source-attributed but does not yet carry a
// formal provenance badge, so it is disclosed as such rather than labeled.

type DoorProvenance = "VERIFIED" | "MODELED" | "PROJECTED" | null;

type Door = {
  numeral: string;
  kicker: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  provenance: DoorProvenance;
};

const DOORS: Door[] = [
  {
    numeral: "I",
    kicker: "Understand",
    title: "Understand your place",
    description:
      "Enter any Michigan ZIP for a composite community access score, built from verified public health and economic data and traceable to every source.",
    href: "/zip-intelligence",
    cta: "Look up your ZIP",
    provenance: "MODELED",
  },
  {
    numeral: "II",
    kicker: "Visualize",
    title: "See the trend",
    description:
      "Watch how coverage, population, and access are changing across all 83 counties over time - not just today's snapshot.",
    href: "/data-and-insights",
    cta: "Open the dashboards",
    provenance: "VERIFIED",
  },
  {
    numeral: "III",
    kicker: "Belong",
    title: "Find your civic role",
    description:
      "Most local races in Michigan go uncontested. See where your community needs candidates, board members, and neighbors to step up.",
    href: "/civic-power",
    cta: "Explore civic power",
    provenance: null,
  },
];

// Resource-bridge chips: the "help now" pathway kept close at hand
// without dominating the hero. Every href points to a real existing route.
const BRIDGE_CHIPS: { label: string; href: string }[] = [
  { label: "Find care near you", href: "/find-care" },
  { label: "Financial help", href: "/financial-help" },
  { label: "Community resources", href: "/resources" },
  { label: "Insurance and coverage", href: "/insurance-coverage" },
  { label: "Life event navigator", href: "/benefits" },
];

// ─── Grain overlay ──────────────────────────────────────────────────────────
// Very light SVG noise so the cream reads like paper rather than a swatch.
function GrainOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 opacity-[0.06] mix-blend-multiply"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.03  0 0 0 0 0.06  0 0 0 0 0.04  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
      }}
    />
  );
}

// ─── Utility rail ───────────────────────────────────────────────────────────

function UtilityRail() {
  return (
    <div
      className="border-b"
      style={{ backgroundColor: C.cream, borderColor: `${C.emerald}1A` }}
    >
      <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-2.5 max-w-6xl">
        <div
          className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px] font-medium uppercase tracking-[0.18em]"
          style={{ color: C.emeraldMid }}
        >
          <Link
            to="/methodology"
            className="underline underline-offset-4 decoration-transparent hover:decoration-current transition-colors"
          >
            Methodology
          </Link>
          <span className="italic normal-case tracking-normal opacity-70">
            Updated{" "}
            {new Date(__BUILD_TIMESTAMP__).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Masthead ───────────────────────────────────────────────────────────────

function Masthead({
  mode,
  onModeChange,
}: {
  mode: PersonaView;
  onModeChange: (m: PersonaView) => void;
}) {
  return (
    <header className="container mx-auto max-w-6xl px-4 pt-10 pb-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1.5">
          <h1
            className="font-serif leading-none tracking-tight"
            style={{ color: C.emerald, fontSize: "clamp(2.75rem, 5vw, 4rem)" }}
          >
            AccessMI
          </h1>
          <p
            className="text-xs sm:text-sm font-medium uppercase"
            style={{ color: C.emeraldMid, letterSpacing: "0.2em" }}
          >
            Civic intelligence for every Michigan community
          </p>
          <p
            className="text-xs font-normal normal-case"
            style={{ color: `${C.emeraldMid}99` }}
          >
            An independent, public-data journal for Michigan's 83 counties. No
            government or health system affiliation.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Reader mode"
          className="inline-flex self-start md:self-auto rounded-sm p-1"
          style={{ backgroundColor: `${C.emerald}0D` }}
        >
          {(
            [
              { key: "resident", label: "Resident" },
              { key: "professional", label: "Analyst" },
            ] as const
          ).map(({ key, label }) => {
            const active = mode === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onModeChange(key)}
                className="px-4 py-2 min-h-[36px] text-[11px] font-bold uppercase tracking-[0.16em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
                style={{
                  backgroundColor: active ? C.emerald : "transparent",
                  color: active ? C.cream : `${C.emerald}99`,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}

// ─── Hero ───────────────────────────────────────────────────────────────────

function EditorialHero({ onZipSubmit }: { onZipSubmit: (zip: string) => void }) {
  const [zip, setZip] = useState("");
  // Real build/deploy date, not the client's "today" - avoids implying the
  // datasets refresh every time the page is opened.
  const updated = new Date(__BUILD_TIMESTAMP__).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <section
      className="container mx-auto max-w-6xl px-4 pb-14"
      aria-labelledby="hero-headline"
    >
      <div
        className="border-t border-b py-10 md:py-14"
        style={{ borderColor: `${C.emerald}33` }}
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="grid gap-10 lg:grid-cols-12 lg:gap-12 items-start"
        >
          {/* Left: standfirst */}
          <div className="lg:col-span-7 space-y-6">
            <h2
              id="hero-headline"
              className="font-serif leading-[1.05]"
              style={{
                color: C.emerald,
                fontSize: "clamp(2.5rem, 6vw, 4.75rem)",
              }}
            >
              Local data for{" "}
              <em
                className="italic font-serif"
                style={{ color: C.emeraldMid }}
              >
                public
              </em>{" "}
              good.
            </h2>
            <p
              className="max-w-xl text-lg md:text-xl font-light leading-relaxed"
              style={{ color: `${C.emerald}CC` }}
            >
              AccessMI turns public records into civic intelligence for
              Michigan's 83 counties, so residents can find help and analysts
              can trace every number to its source.
            </p>
          </div>

          {/* Right: emerald ZIP panel */}
          <div className="lg:col-span-5 relative">
            <div
              className="p-6 md:p-8 relative"
              style={{ backgroundColor: C.emerald, color: C.cream }}
            >
              <div
                className="absolute -top-3 -right-3 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]"
                style={{ backgroundColor: C.gold, color: C.emerald }}
              >
                Updated {updated}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (zip.trim().length === 5) onZipSubmit(zip.trim());
                }}
                aria-label="Explore your community by ZIP"
              >
                <label
                  htmlFor="hero-zip"
                  className="block text-[11px] uppercase font-semibold mb-3 opacity-80"
                  style={{ letterSpacing: "0.16em" }}
                >
                  Explore your community
                </label>
                <div
                  className="flex items-center border-b pb-2 mb-4"
                  style={{ borderColor: `${C.cream}4D` }}
                >
                  <input
                    id="hero-zip"
                    inputMode="numeric"
                    pattern="[0-9]{5}"
                    maxLength={5}
                    placeholder="Enter ZIP"
                    value={zip}
                    onChange={(e) =>
                      setZip(e.target.value.replace(/\D/g, ""))
                    }
                    aria-label="ZIP code"
                    className="w-full bg-transparent text-2xl font-serif outline-none placeholder:opacity-40"
                    style={{ color: C.cream }}
                  />
                  <button
                    type="submit"
                    aria-label="Show my area"
                    disabled={zip.trim().length !== 5}
                    className="ml-3 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors disabled:opacity-40"
                    style={{ color: C.gold }}
                  >
                    <ArrowRight className="w-6 h-6" aria-hidden="true" />
                  </button>
                </div>
                <Link
                  to="/methodology"
                  className="inline-flex items-center gap-1.5 text-[10px] uppercase font-semibold underline underline-offset-4 hover:opacity-80 transition-opacity"
                  style={{ color: C.gold, letterSpacing: "0.16em" }}
                >
                  View methodology and data integrity
                  <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                </Link>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Bridge-to-resources band ───────────────────────────────────────────────

function ResourceBridgeBand() {
  return (
    <section
      className="container mx-auto max-w-6xl px-4 pb-12"
      aria-labelledby="bridge-heading"
    >
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3 mb-4">
        <h3
          id="bridge-heading"
          className="font-serif text-2xl md:text-3xl"
          style={{ color: C.emerald }}
        >
          Need help right now?
        </h3>
        <span
          className="text-[11px] uppercase font-semibold"
          style={{ color: C.gold, letterSpacing: "0.18em" }}
        >
          Direct pathways
        </span>
      </div>
      <ul role="list" className="flex flex-wrap gap-2">
        {BRIDGE_CHIPS.map((chip) => (
          <li key={chip.href}>
            <Link
              to={chip.href}
              className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] text-sm font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2"
              style={{
                borderColor: `${C.emerald}33`,
                color: C.emerald,
                backgroundColor: `${C.cream}`,
              }}
            >
              {chip.label}
              <ArrowRight
                className="w-3.5 h-3.5 opacity-60"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ─── Three doors grid (Understand / Visualize / Belong) ─────────────────────

function ThreeDoorsGrid({ mode }: { mode: PersonaView }) {
  const miUncontested = STATE_UNCONTESTED_COMPARISON.find(
    (s) => s.state === "Michigan",
  );
  // Give each reader mode a different first door: Analyst leads with Visualize
  // (dashboards/trends), Resident leads with Understand (look up your place).
  // Numerals are position-based below so they stay sequential after reorder.
  const orderedDoors =
    mode === "professional" ? [DOORS[1], DOORS[0], DOORS[2]] : DOORS;
  const NUMERALS = ["I", "II", "III"];
  return (
    <section
      className="container mx-auto max-w-6xl px-4 pb-16"
      aria-labelledby="doors-heading"
    >
      <h3 id="doors-heading" className="sr-only">
        Three ways in: understand, visualize, belong
      </h3>
      <div className="grid gap-8 md:grid-cols-3">
        {orderedDoors.map((d, i) => (
          <motion.article
            key={d.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="group flex flex-col h-full pl-6 py-4 border-l"
            style={{ borderColor: `${C.emerald}1A` }}
          >
            <div className="mb-4 flex items-start justify-between gap-2">
              {d.provenance ? (
                <ProvenanceTag label={d.provenance} />
              ) : (
                <span
                  className="text-[10px] font-semibold uppercase tracking-[0.14em]"
                  style={{ color: `${C.emerald}80` }}
                >
                  Source-attributed
                </span>
              )}
              <span
                className="text-xs font-serif italic"
                style={{ color: `${C.emerald}66` }}
              >
                {NUMERALS[i]}
              </span>
            </div>
            <p
              className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em]"
              style={{ color: C.emeraldMid }}
            >
              {d.kicker}
            </p>
            <h4
              className="font-serif text-2xl mb-3 leading-tight"
              style={{ color: C.emerald }}
            >
              {d.title}
            </h4>
            <p
              className="text-sm leading-relaxed mb-4"
              style={{ color: `${C.emerald}B3` }}
            >
              {d.description}
            </p>

            {/* Live preview - existing, already-labeled platform data.
                Keyed off the stable door identity (kicker), not the numeral,
                which is now position-based and reorders by persona mode. */}
            <div className="mb-5 flex-1">
              {d.kicker === "Visualize" && (
                <div
                  className="border-t pt-3"
                  style={{ borderColor: `${C.emerald}14` }}
                >
                  <UninsuredSparkline county="Wayne" />
                </div>
              )}
              {d.kicker === "Belong" && miUncontested && (
                <div
                  className="border-t pt-3"
                  style={{ borderColor: `${C.emerald}14` }}
                >
                  <p
                    className="font-serif text-3xl leading-none"
                    style={{ color: C.emerald }}
                  >
                    {miUncontested.pct}%
                  </p>
                  <p
                    className="mt-1 text-xs leading-snug"
                    style={{ color: `${C.emerald}B3` }}
                  >
                    of Michigan local races ran uncontested (2024).
                  </p>
                  <p
                    className="mt-1.5 text-[10px] leading-snug"
                    style={{ color: `${C.emerald}80` }}
                  >
                    Source: Ballotpedia analysis / Michigan SOS 2024. Formal
                    provenance label pending.
                  </p>
                </div>
              )}
            </div>

            <Link
              to={d.href}
              className="mt-auto inline-flex items-center gap-1 text-[11px] font-semibold uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{ color: C.emeraldMid, letterSpacing: "0.16em" }}
            >
              {d.cta}
              <ArrowRight className="w-3 h-3" aria-hidden="true" />
            </Link>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

// ─── Provenance strip ──────────────────────────────────────────────────────

function ProvenanceStrip() {
  const items: {
    label: "VERIFIED" | "MODELED" | "PROJECTED";
    gloss: string;
  }[] = [
    { label: "VERIFIED", gloss: "Direct tabulation from a named primary source." },
    { label: "MODELED", gloss: "Calculated from verified inputs." },
    { label: "PROJECTED", gloss: "Forward-looking estimate." },
  ];
  return (
    <section
      className="border-t"
      style={{ borderColor: `${C.emerald}1A` }}
      aria-labelledby="provenance-heading"
    >
      <div className="container mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col md:flex-row md:items-baseline gap-4 md:gap-10">
          <h3
            id="provenance-heading"
            className="font-serif text-xl md:text-2xl shrink-0"
            style={{ color: C.emerald }}
          >
            Every number carries a label.
          </h3>
          <dl className="grid gap-4 sm:grid-cols-3 flex-1">
            {items.map(({ label, gloss }) => (
              <div key={label} className="flex flex-col gap-1.5">
                <dt>
                  <ProvenanceTag label={label} />
                </dt>
                <dd
                  className="text-sm leading-relaxed"
                  style={{ color: `${C.emerald}99` }}
                >
                  {gloss}
                </dd>
              </div>
            ))}
          </dl>
          <Link
            to="/methodology"
            className="text-[11px] uppercase font-semibold underline underline-offset-4 shrink-0"
            style={{ color: C.gold, letterSpacing: "0.16em" }}
          >
            Read methods
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── County picker (compact, editorial) ─────────────────────────────────────

const COUNTY_NAMES = Object.keys(MI_COUNTY_FIPS).sort((a, b) =>
  a.localeCompare(b),
);
const countySlug = (name: string) =>
  name.toLowerCase().replace(/[.\s]+/g, "-");

function CountyPicker() {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  const filtered = query.trim()
    ? COUNTY_NAMES.filter((n) =>
        n.toLowerCase().startsWith(query.trim().toLowerCase()),
      )
    : COUNTY_NAMES;

  return (
    <section
      className="container mx-auto max-w-6xl px-4 py-10"
      aria-labelledby="county-heading"
    >
      <div className="flex items-baseline justify-between mb-4">
        <h3
          id="county-heading"
          className="font-serif text-2xl md:text-3xl"
          style={{ color: C.emerald }}
        >
          Or pick a county.
        </h3>
        <span
          className="text-[11px] uppercase font-semibold hidden sm:inline"
          style={{ color: C.gold, letterSpacing: "0.18em" }}
        >
          83 counties
        </span>
      </div>
      <label htmlFor="county-search" className="sr-only">
        Search Michigan counties
      </label>
      <input
        id="county-search"
        type="search"
        placeholder="Wayne, Kent, Marquette…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full max-w-md h-11 px-3 border bg-transparent text-base outline-none focus-visible:ring-2"
        style={{
          borderColor: `${C.emerald}33`,
          color: C.emerald,
        }}
      />
      {query.trim() && filtered.length > 0 && (
        <ul
          role="list"
          className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1 max-w-2xl"
        >
          {filtered.slice(0, 9).map((name) => (
            <li key={name}>
              <Link
                to={`/county/${countySlug(name)}`}
                className="flex items-center justify-between gap-1 px-3 py-2 text-sm border transition-colors"
                style={{ borderColor: `${C.emerald}1A`, color: C.emerald }}
              >
                <span className="truncate">{name}</span>
                <ArrowRight
                  className="h-3 w-3 shrink-0 opacity-60"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="mt-4 text-xs font-semibold uppercase underline underline-offset-4"
        style={{ color: C.emeraldMid, letterSpacing: "0.14em" }}
        aria-expanded={expanded}
        aria-controls="all-counties-grid"
      >
        {expanded ? "Hide the list" : "Browse every county"}
      </button>
      {expanded && (
        <ul
          id="all-counties-grid"
          role="list"
          className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-px border"
          style={{ backgroundColor: `${C.emerald}1A`, borderColor: `${C.emerald}1A` }}
        >
          {COUNTY_NAMES.map((name) => (
            <li key={name}>
              <Link
                to={`/county/${countySlug(name)}`}
                className="flex h-full items-center justify-between gap-1 px-3 py-2.5 text-xs transition-colors"
                style={{ backgroundColor: C.cream, color: C.emerald }}
              >
                <span className="truncate">{name}</span>
                <ArrowRight
                  className="h-3 w-3 shrink-0 opacity-50"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

const Index = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<PersonaView>("resident");

  usePageMeta({
    title: "AccessMI - Civic intelligence for every Michigan community",
    description:
      "Benefits, care, closures, and community risk across Michigan. Every number traced to a primary federal or state source.",
    path: "/",
  });

  return (
    <Layout>
      <div className="relative" style={{ backgroundColor: C.cream }}>
        <GrainOverlay />
        <div className="relative z-10">
          <UtilityRail />
          <OutageAlertBanner />
          <CountyWelcomeBanner />
          <Masthead mode={mode} onModeChange={setMode} />
          <EditorialHero onZipSubmit={(zip) => navigate(`/zip/${zip}`)} />
          <ResourceBridgeBand />
          <ThreeDoorsGrid mode={mode} />
          <CountyPicker />
          <ProvenanceStrip />
        </div>
      </div>

      {AI_CHAT_ENABLED && (
        <Suspense fallback={null}>
          <AccessChat />
        </Suspense>
      )}
    </Layout>
  );
};

export default Index;
