import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Search, Shield, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import BenefitsWizard from "./BenefitsWizard";

/* Floating icon that drifts across the hero */
const FloatingIcon = ({
  icon,
  duration,
  delay,
  startX,
  startY,
  endX,
  endY,
}: {
  icon: string;
  duration: number;
  delay: number;
  startX: string;
  startY: string;
  endX: string;
  endY: string;
}) => (
  <motion.span
    aria-hidden="true"
    className="absolute text-2xl opacity-[0.12] select-none pointer-events-none"
    style={{ left: startX, top: startY }}
    animate={{ x: endX, y: endY, opacity: [0, 0.12, 0.12, 0] }}
    transition={{ duration, delay, repeat: Infinity, ease: "linear" }}
  >
    {icon}
  </motion.span>
);

/* Simplified Michigan outline as SVG watermark */
const MichiganOutline = () => (
  <svg
    viewBox="0 0 400 500"
    className="absolute right-0 top-1/2 -translate-y-1/2 h-[120%] w-auto opacity-[0.04]"
    aria-hidden="true"
  >
    {/* Lower Peninsula simplified */}
    <path
      d="M200 180 L240 200 L270 250 L280 310 L260 370 L220 400 L180 410 L140 380 L120 330 L130 270 L150 220 Z"
      fill="currentColor"
      className="text-primary-foreground"
    />
    {/* Upper Peninsula simplified */}
    <path
      d="M100 140 L160 120 L220 130 L240 150 L200 170 L140 165 L100 155 Z"
      fill="currentColor"
      className="text-primary-foreground"
    />
  </svg>
);

const HeroSection = () => {
  const { t } = useTranslation();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [detectedCounty, setDetectedCounty] = useState<string | null>(null);

  useEffect(() => {
    // Check localStorage first for previously detected county
    const cached = localStorage.getItem("mi-geo-county");
    if (cached) { setDetectedCounty(cached); return; }

    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=10`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const county = data?.address?.county?.replace(/ County$/i, "");
          if (county && data?.address?.state === "Michigan") {
            setDetectedCounty(county);
            localStorage.setItem("mi-geo-county", county);
          }
        } catch {}
      },
      () => {},
      { timeout: 5000, maximumAge: 86400000 }
    );
  }, []);

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-hero" aria-label="Hero">
        {/* Michigan state outline watermark */}
        <MichiganOutline />

        {/* Floating service icons */}
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <FloatingIcon icon="🏥" duration={22} delay={0} startX="10%" startY="20%" endX="60vw" endY="-5vh" />
          <FloatingIcon icon="🚌" duration={28} delay={6} startX="80%" startY="70%" endX="-50vw" endY="-20vh" />
          <FloatingIcon icon="🏠" duration={32} delay={12} startX="20%" startY="80%" endX="40vw" endY="-40vh" />
          <FloatingIcon icon="🍎" duration={26} delay={18} startX="70%" startY="30%" endX="-30vw" endY="10vh" />
        </div>

        {/* Noise texture overlay for depth */}
        <div
          className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
            backgroundSize: "128px",
          }}
          aria-hidden="true"
        />

        <div className="container relative z-10 py-20 md:py-28 lg:py-32">
          <div className="mx-auto max-w-2xl text-center">
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl md:text-5xl lg:text-6xl"
            >
              {detectedCounty ? (
                <>
                  Resources for you in{" "}
                  <span className="bg-gradient-to-r from-michigan-sky via-michigan-teal to-michigan-gold bg-clip-text text-transparent">
                    {detectedCounty} County
                  </span>
                </>
              ) : (
                <>
                  {t("hero.title").replace("Simplified", "")}{" "}
                  <span className="bg-gradient-to-r from-michigan-sky via-michigan-teal to-michigan-gold bg-clip-text text-transparent">
                    Simplified
                  </span>
                </>
              )}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-5 text-lg text-primary-foreground/80 md:text-xl"
            >
              {t("hero.subtitle")}
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.5 }}
              className="mt-2 text-xs text-primary-foreground/50 tracking-wide"
            >
              Unlike government portals or health plans, we rank by quality — not who pays for placement.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:flex-wrap"
            >
              <Button
                size="lg"
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 px-8 text-base font-semibold shadow-lg"
                asChild
              >
                <Link to="/find-care">
                  <Search className="mr-2 h-4 w-4" aria-hidden="true" />
                  {t("hero.ctaFindServices")}
                </Link>
              </Button>
              <Button
                size="lg"
                onClick={() => setWizardOpen(true)}
                className="bg-michigan-gold text-foreground hover:bg-michigan-gold/90 px-8 text-base font-semibold border-0 shadow-lg"
              >
                <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
                Check My Benefits
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="border-2 border-white/60 text-white hover:bg-white/15 hover:border-white px-8 text-base font-medium"
                asChild
              >
                <Link to="/resources">
                  {t("hero.ctaExplore")}
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="border-2 border-white/40 text-white/90 hover:bg-white/15 hover:border-white px-6 text-sm font-medium"
                asChild
              >
                <Link to="/health/insurance-appeals">
                  <Shield className="mr-2 h-4 w-4" aria-hidden="true" />
                  Fight a Denial
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Subtle geometric accents */}
        <div className="absolute inset-0 opacity-[0.04]" aria-hidden="true">
          <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-primary-foreground blur-3xl" />
          <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-primary-foreground blur-3xl" />
        </div>
      </section>

      <BenefitsWizard open={wizardOpen} onOpenChange={setWizardOpen} />
    </>
  );
};

export default HeroSection;
