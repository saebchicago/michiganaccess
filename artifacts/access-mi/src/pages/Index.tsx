import { useState, lazy, Suspense } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";

import Layout from "@/components/layout/Layout";
import { STATE_UNCONTESTED_COMPARISON } from "@/data/uncontestedRaces";
import OutageAlertBanner from "@/components/home/OutageAlertBanner";
import CountyWelcomeBanner from "@/components/home/CountyWelcomeBanner";
import IntelligenceBriefing from "@/components/home/IntelligenceBriefing";
import { EDITORIAL } from "@/components/home/editorialTheme";
import {
  ProvenanceTag,
  type ProvenanceLabel,
} from "@/components/shared/ProvenanceTag";
import { MI_COUNTY_FIPS } from "@/data/census-geographies";
import { usePageMeta } from "@/hooks/usePageMeta";
import {
  getFeaturedRail,
  getIntentCards,
  getSubjectCounts,
  getLibrarySize,
} from "@/components/home/homeDestinations";
import { AI_CHAT_ENABLED } from "@/config/aiChat";

// Lazy chat, gated by env flag (unchanged behavior).
const AccessChat = lazy(() =>
  import("@/components/AccessChat").then((m) => ({ default: m.AccessChat })),
);

// Lazy so its raw JSON dataset (hrsa-hpsa-county.generated.json ~70 KB)
// splits out of the eager homepage chunk.
const NeedCapacityCard = lazy(() =>
  import("@/components/shared/NeedCapacityCard").then((m) => ({
    default: m.NeedCapacityCard,
  })),
);

// Keeps the HRSA county payload out of the homepage's critical bundle while
// still deriving every displayed oral-health metric from the source extract.
const OralHealthIntelligence = lazy(() =>
  import("@/components/home/OralHealthIntelligence").then((m) => ({
    default: m.OralHealthIntelligence,
  })),
);

export type PersonaView = "resident" | "professional";

// ─── Editorial palette (locked from the redesign direction) ───────────────
// Applied as inline values so the change is scoped to the homepage and
// does not disturb the site-wide token system. Not migrated into
// --civic-* tokens yet: the redesign is scoped to this page. Definition
// lives in components/home/editorialTheme.ts, shared with the homepage
// sections that render outside this file.
const C = EDITORIAL;

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
          <span className="italic normal-case tracking-normal">
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
          <div
            className="font-serif leading-none tracking-tight"
            style={{ color: C.emerald, fontSize: "clamp(2.75rem, 5vw, 4rem)" }}
          >
            AccessMI
          </div>
          <p
            className="text-xs sm:text-sm font-medium uppercase"
            style={{ color: C.emeraldMid, letterSpacing: "0.2em" }}
          >
            Civic intelligence for every Michigan community
          </p>
          <p
            className="text-xs font-normal normal-case"
            style={{ color: C.emeraldMid }}
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
                  color: active ? C.cream : `${C.emerald}bf`,
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

function EditorialHero({
  onZipSubmit,
}: {
  onZipSubmit: (zip: string) => void;
}) {
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
            <h1
              id="hero-headline"
              className="font-serif leading-[1.05]"
              style={{
                color: C.emerald,
                fontSize: "clamp(2.5rem, 6vw, 4.75rem)",
              }}
            >
              Local data for{" "}
              <em className="italic font-serif" style={{ color: C.emeraldMid }}>
                public
              </em>{" "}
              good.
            </h1>
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
                style={{ backgroundColor: C.gold, color: C.emeraldInk }}
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
                <div className="mb-4">
                  <input
                    id="hero-zip"
                    inputMode="numeric"
                    pattern="[0-9]{5}"
                    maxLength={5}
                    placeholder="Enter ZIP"
                    value={zip}
                    onChange={(e) => setZip(e.target.value.replace(/\D/g, ""))}
                    aria-label="ZIP code"
                    className="w-full min-h-[48px] border px-3 bg-transparent text-xl font-serif outline-none placeholder:opacity-60 focus-visible:ring-2 focus-visible:ring-offset-2"
                    style={{ color: C.cream, borderColor: `${C.cream}66` }}
                  />
                  <button
                    type="submit"
                    aria-label="Explore civic data for this ZIP code"
                    disabled={zip.trim().length !== 5}
                    className="mt-3 min-h-[48px] w-full flex items-center justify-center gap-2 px-5 text-sm font-bold transition-colors disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    style={{ backgroundColor: C.gold, color: C.emeraldInk }}
                  >
                    Explore my area
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
                <Link
                  to="/find-care"
                  className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold underline underline-offset-4 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 transition-opacity"
                  style={{ color: C.cream }}
                >
                  Find help without entering a ZIP
                  <ArrowRight className="w-3 h-3" aria-hidden="true" />
                </Link>
              </form>
              <p
                className="mt-5 flex items-start gap-2 border-t pt-4 text-xs leading-relaxed"
                style={{ borderColor: `${C.cream}2E`, color: `${C.cream}CC` }}
              >
                <ShieldCheck
                  className="mt-0.5 h-4 w-4 shrink-0"
                  aria-hidden="true"
                />
                Independent public data. Every figure links to its source and
                methodology.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Bridge-to-resources band ───────────────────────────────────────────────

// ─── Need vs. capacity band ─────────────────────────────────────────────────
// "See the need, find the help" - surfaced immediately after the hero using
// the standard Card-based NeedCapacityCard (also used on FindCarePage and
// CountyPage), not a homepage-only bespoke variant.
function NeedHelpBand() {
  return (
    <section
      className="container mx-auto max-w-6xl px-4 pb-12 pt-4"
      aria-labelledby="need-help-heading"
    >
      <div className="mb-5 max-w-2xl">
        <span
          className="text-[11px] uppercase font-semibold"
          style={{ color: C.goldInk, letterSpacing: "0.18em" }}
        >
          See the need, find the help
        </span>
        <h2
          id="need-help-heading"
          className="font-serif text-2xl md:text-3xl mt-1"
          style={{ color: C.emerald }}
        >
          Where care is short, and where to turn.
        </h2>
        <p className="text-sm mt-2" style={{ color: `${C.emerald}cc` }}>
          Michigan's provider shortages, mapped against the help already
          available - statewide today, by county once you pick one.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
        <Suspense
          fallback={
            <div className="min-h-40 rounded-lg bg-muted/30 animate-pulse" />
          }
        >
          <NeedCapacityCard />
        </Suspense>
        <div
          className="flex flex-col justify-center gap-3 rounded-lg border p-5"
          style={{ borderColor: `${C.emerald}33`, backgroundColor: C.cream }}
        >
          <p className="font-serif text-lg" style={{ color: C.emerald }}>
            Need help now?
          </p>
          <p className="text-sm" style={{ color: `${C.emerald}cc` }}>
            Search verified care, benefits, and community resources across all
            83 counties.
          </p>
          <Link
            to="/find-care"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] text-sm font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2"
            style={{
              borderColor: C.emerald,
              color: C.cream,
              backgroundColor: C.emerald,
            }}
          >
            Find help near you
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Intent cards (What are you here for?) ──────────────────────────────────
// Four concrete intents replace the abstract Understand/Visualize/Belong
// doors. Card contents come from the route taxonomy via the manifest
// (getIntentCards resolves lazily inside render - see homeDestinations.ts);
// this file holds no destination copy of its own. The taxonomy guard pins
// exactly 3 destinations per intent, so the 4x3 grid cannot silently break.

function IntentCardsSection({ mode }: { mode: PersonaView }) {
  const cards = getIntentCards();
  const pathways = [
    cards[0],
    cards[1],
    {
      ...cards[3],
      id: "decide-with-data",
      title: "Use data to decide",
      lede: "Follow public money, compare places, and export evidence.",
      destinations: [...cards[2].destinations, ...cards[3].destinations],
    },
  ];
  // Analyst mode leads with data tools; every pathway remains one tab stop away.
  const ordered = mode === "professional" ? [...pathways].reverse() : pathways;
  return (
    <section
      className="container mx-auto max-w-6xl px-4 pb-14"
      aria-labelledby="intent-heading"
    >
      <div className="mb-6 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
        <h2
          id="intent-heading"
          className="font-serif text-2xl md:text-3xl"
          style={{ color: C.emerald }}
        >
          Three ways in
        </h2>
        <Link
          to="/explore"
          className="inline-flex min-h-[40px] items-center gap-1 text-[11px] font-semibold uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{ color: C.goldInk, letterSpacing: "0.16em" }}
        >
          Browse everything
          <ArrowRight className="w-3 h-3" aria-hidden="true" />
        </Link>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {ordered.map((card, i) => (
          <motion.article
            key={card.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="flex h-full flex-col border-l pl-5 py-3"
            style={{ borderColor: `${C.emerald}1A` }}
          >
            <h3
              className="font-serif text-xl leading-tight"
              style={{ color: C.emerald }}
            >
              {card.title}
            </h3>
            <p
              className="mt-1.5 text-[13px] leading-relaxed"
              style={{ color: `${C.emerald}CC` }}
            >
              {card.lede}
            </p>
            <ul
              role="list"
              className="mt-4 border-t pt-1"
              style={{ borderColor: `${C.emerald}14` }}
            >
              {card.destinations.map((d) => (
                <li key={d.href}>
                  <Link
                    to={d.href}
                    className="group flex min-h-[40px] items-center justify-between gap-2 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
                    style={{ color: C.emerald }}
                  >
                    <span className="font-medium group-hover:underline underline-offset-4">
                      {d.label}
                    </span>
                    <ArrowRight
                      className="h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-70"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

// ─── Worth a look (editorial picks) ─────────────────────────────────────────
// The taxonomy's `featured` flags: an editorial pick set, not a popularity
// measurement. Card copy is each page's ROUTE_META summary. The
// uncontested-races figure keeps its inline source line exactly as the old
// Belong door disclosed it.

function WorthALookRail() {
  const featured = getFeaturedRail();
  const miUncontested = STATE_UNCONTESTED_COMPARISON.find(
    (st) => st.state === "Michigan",
  );
  return (
    <section
      className="container mx-auto max-w-6xl px-4 pb-14"
      aria-labelledby="featured-heading"
    >
      <div className="mb-5 max-w-2xl">
        <span
          className="text-[11px] uppercase font-semibold"
          style={{ color: C.goldInk, letterSpacing: "0.18em" }}
        >
          Worth a look
        </span>
        <h2
          id="featured-heading"
          className="font-serif text-2xl md:text-3xl mt-1"
          style={{ color: C.emerald }}
        >
          The things people don't know are here.
        </h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((d) => (
          <Link
            key={d.href}
            to={d.href}
            className="group flex h-full flex-col border p-5 transition-colors hover:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{ borderColor: `${C.emerald}26`, color: C.emerald }}
          >
            <h3 className="font-serif text-xl leading-tight group-hover:underline underline-offset-4">
              {d.label}
            </h3>
            {d.description && (
              <p
                className="mt-2 flex-1 text-sm leading-relaxed"
                style={{ color: `${C.emerald}CC` }}
              >
                {d.description}
              </p>
            )}
            {d.href === "/civic-power" && miUncontested && (
              <div
                className="mt-3 border-t pt-3"
                style={{ borderColor: `${C.emerald}14` }}
              >
                <p className="font-serif text-3xl leading-none">
                  {miUncontested.pct}%
                </p>
                <p
                  className="mt-1 text-xs leading-snug"
                  style={{ color: `${C.emerald}CC` }}
                >
                  of Michigan local races ran uncontested (2024).
                </p>
                <p
                  className="mt-1.5 text-[10px] leading-snug"
                  style={{ color: `${C.emerald}bf` }}
                >
                  Source: Ballotpedia analysis / Michigan SOS 2024. Formal
                  provenance label pending.
                </p>
              </div>
            )}
            <span
              className="mt-4 inline-flex items-center gap-1 text-[11px] font-semibold uppercase"
              style={{ color: C.emeraldMid, letterSpacing: "0.16em" }}
            >
              Open
              <ArrowRight className="w-3 h-3" aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ─── Explore band ───────────────────────────────────────────────────────────
// Per-subject counts are computed from the same taxonomy-curated index the
// /explore page renders, so the numbers here can never disagree with the
// library behind the link.

function ExploreBand() {
  const counts = getSubjectCounts();
  const total = getLibrarySize();
  return (
    <section
      className="py-10"
      style={{ backgroundColor: C.emerald, color: C.cream }}
      aria-labelledby="explore-band-heading"
    >
      <div className="container mx-auto max-w-6xl px-4 grid gap-8 lg:grid-cols-[1fr_1.3fr] lg:items-center">
        <div>
          <span
            className="text-[11px] uppercase font-semibold"
            style={{ color: C.goldBright, letterSpacing: "0.18em" }}
          >
            The full library
          </span>
          <h2
            id="explore-band-heading"
            className="font-serif text-2xl md:text-3xl mt-2"
            style={{ color: C.cream }}
          >
            {total} destinations, finally browsable.
          </h2>
          <p
            className="mt-2 text-sm leading-relaxed"
            style={{ color: `${C.cream}C7` }}
          >
            Everything on the platform in one searchable index, grouped by
            subject, with a plain-language line on each.
          </p>
          <Link
            to="/explore"
            className="mt-5 inline-flex min-h-[44px] items-center gap-1.5 px-5 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{ backgroundColor: C.gold, color: C.emeraldInk }}
          >
            Explore the library
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
        <ul role="list" className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {counts.map((subject) => (
            <li key={subject.id}>
              <Link
                to="/explore"
                className="flex h-full flex-col rounded-md border px-3 py-2.5 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2"
                style={{ borderColor: `${C.cream}33` }}
              >
                <span
                  className="font-serif text-xl leading-none"
                  style={{ color: C.goldBright }}
                >
                  {subject.count}
                </span>
                <span
                  className="mt-1 text-[11.5px] leading-snug"
                  style={{ color: `${C.cream}D6` }}
                >
                  {subject.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ─── Provenance strip ──────────────────────────────────────────────────────

function ProvenanceStrip() {
  // Must list every label the platform can render. ProvenanceTag added
  // PENDING in Round 5; the heading below promises the full set.
  const items: {
    label: ProvenanceLabel;
    gloss: string;
  }[] = [
    {
      label: "VERIFIED",
      gloss: "Direct tabulation from a named primary source.",
    },
    { label: "MODELED", gloss: "Calculated from verified inputs." },
    { label: "PROJECTED", gloss: "Forward-looking estimate." },
    { label: "PENDING", gloss: "Not yet ingested; shown as a known gap." },
  ];
  return (
    <section
      className="border-t"
      style={{ borderColor: `${C.emerald}1A` }}
      aria-labelledby="provenance-heading"
    >
      <div className="container mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col md:flex-row md:items-baseline gap-4 md:gap-10">
          <h2
            id="provenance-heading"
            className="font-serif text-xl md:text-2xl shrink-0"
            style={{ color: C.emerald }}
          >
            Every number carries a label.
          </h2>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 flex-1">
            {items.map(({ label, gloss }) => (
              <div key={label} className="flex flex-col gap-1.5">
                <dt>
                  <ProvenanceTag label={label} legend />
                </dt>
                <dd
                  className="text-sm leading-relaxed"
                  style={{ color: `${C.emerald}bf` }}
                >
                  {gloss}
                </dd>
              </div>
            ))}
          </dl>
          <Link
            to="/methodology"
            className="text-[11px] uppercase font-semibold underline underline-offset-4 shrink-0"
            style={{ color: C.goldInk, letterSpacing: "0.16em" }}
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
const countySlug = (name: string) => name.toLowerCase().replace(/[.\s]+/g, "-");

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
        <h2
          id="county-heading"
          className="font-serif text-2xl md:text-3xl"
          style={{ color: C.emerald }}
        >
          Or pick a county.
        </h2>
        <span
          className="text-[11px] uppercase font-semibold hidden sm:inline"
          style={{ color: C.goldInk, letterSpacing: "0.18em" }}
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
          style={{
            backgroundColor: `${C.emerald}1A`,
            borderColor: `${C.emerald}1A`,
          }}
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
          <IntentCardsSection mode={mode} />
          <NeedHelpBand />
          <Suspense
            fallback={
              <div
                className="container mx-auto mb-14 min-h-64 max-w-6xl animate-pulse bg-muted/30"
                aria-hidden="true"
              />
            }
          >
            <OralHealthIntelligence />
          </Suspense>
          <IntelligenceBriefing />
          <WorthALookRail />
          <ExploreBand />
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
