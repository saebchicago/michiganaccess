import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Search, Shield, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import BenefitsWizard from "./BenefitsWizard";

const HeroSection = () => {
  const { t } = useTranslation();
  const [wizardOpen, setWizardOpen] = useState(false);

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-hero" aria-label="Hero">
        <div className="container relative z-10 py-20 md:py-28 lg:py-32">
          <div className="mx-auto max-w-2xl text-center">
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl md:text-5xl"
            >
              {t("hero.title")}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-5 text-lg text-primary-foreground/80 md:text-xl"
            >
              {t("hero.subtitle")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:flex-wrap"
            >
              <Button
                size="lg"
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 px-8 text-base font-semibold"
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
                className="bg-michigan-gold text-foreground hover:bg-michigan-gold/90 px-8 text-base font-semibold border-0"
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

        {/* Subtle geometric accent */}
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
