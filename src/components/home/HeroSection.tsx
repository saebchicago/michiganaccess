import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Apple, ShieldCheck, Bus, HeartPulse, Pill, FileWarning } from "lucide-react";
import { Button } from "@/components/ui/button";

const quickPills = [
  { icon: HeartPulse, label: "Find a Doctor", href: "/find-care" },
  { icon: Pill, label: "Utility Assistance", href: "/financial-help" },
  { icon: Bus, label: "Bus Safety", href: "/transportation" },
  { icon: Apple, label: "Free Food", href: "/resources" },
  { icon: FileWarning, label: "Insurance Help", href: "/health/insurance-appeals" },
  { icon: ShieldCheck, label: "Air Quality", href: "/environment" },
];

/* Simplified Michigan outline as SVG watermark */
const MichiganOutline = () => (
  <svg
    viewBox="0 0 400 500"
    className="absolute right-0 top-1/2 -translate-y-1/2 h-[120%] w-auto opacity-[0.04]"
    aria-hidden="true"
  >
    <path
      d="M200 180 L240 200 L270 250 L280 310 L260 370 L220 400 L180 410 L140 380 L120 330 L130 270 L150 220 Z"
      fill="currentColor"
      className="text-primary-foreground"
    />
    <path
      d="M100 140 L160 120 L220 130 L240 150 L200 170 L140 165 L100 155 Z"
      fill="currentColor"
      className="text-primary-foreground"
    />
  </svg>
);

const HeroSection = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/find-care?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-hero" aria-label="Hero">
        <MichiganOutline />

        {/* Noise texture */}
        <div
          className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
            backgroundSize: "128px",
          }}
          aria-hidden="true"
        />

        <div className="container relative z-10 py-20 md:py-28 lg:py-36">
          <div className="mx-auto max-w-2xl text-center">
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl md:text-5xl lg:text-[3.25rem] leading-tight"
            >
              Your guide to{" "}
              <span className="bg-gradient-to-r from-michigan-sky via-michigan-teal to-michigan-gold bg-clip-text text-transparent">
                health, safety, energy &amp; services
              </span>{" "}
              across Michigan.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-5 text-base text-primary-foreground/70 md:text-lg"
            >
              No sign-up needed. Free, confidential, and built for every county.
            </motion.p>

            {/* Search Bar — 1.5x larger */}
            <motion.form
              onSubmit={handleSearch}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="mt-8 mx-auto max-w-xl"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search clinics, transit, energy programs, food pantries, insurance help…"
                  className="w-full rounded-full border-2 border-white/20 bg-white/95 dark:bg-background/95 py-4 pl-12 pr-32 text-base text-foreground placeholder:text-muted-foreground shadow-2xl focus:outline-none focus:ring-2 focus:ring-michigan-gold focus:border-transparent transition-all"
                  aria-label="Search for services"
                />
                <Button
                  type="submit"
                  size="lg"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-primary hover:bg-primary/90 px-6 font-semibold shadow-lg"
                >
                  Search
                </Button>
              </div>
            </motion.form>

            {/* Quick-link pills */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-6 flex flex-wrap items-center justify-center gap-2"
            >
            {quickPills.map((pill) => (
                <Link
                  key={pill.label}
                  to={pill.href}
                  className="group inline-flex items-center gap-1.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 px-3.5 py-1.5 text-xs font-medium text-primary-foreground/90 transition-all hover:scale-105"
                >
                  <pill.icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {pill.label}
                </Link>
              ))}
            </motion.div>

            {/* Stakeholder Shortcut */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.75, duration: 0.5 }}
              className="mt-5"
            >
              <a
                href="#data-snapshot"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("data-snapshot")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-sm text-primary-foreground/50 hover:text-primary-foreground/80 hover:underline transition-colors"
              >
                For Providers &amp; Policymakers: View Live System Data &amp; Impact →
              </a>
            </motion.div>

          </div>
        </div>

        {/* Geometric accents */}
        <div className="absolute inset-0 opacity-[0.04]" aria-hidden="true">
          <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-primary-foreground blur-3xl" />
          <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-primary-foreground blur-3xl" />
        </div>
      </section>
  );
};

export default HeroSection;
