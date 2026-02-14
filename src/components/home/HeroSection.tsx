import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, MapPin, Stethoscope, Building2, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-michigan.jpg";

const HeroSection = () => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const searchCategories = [
    { icon: MapPin, label: t("hero.location"), placeholder: t("hero.locationPlaceholder") },
    { icon: Stethoscope, label: t("hero.condition"), placeholder: t("hero.conditionPlaceholder") },
    { icon: Building2, label: t("hero.service"), placeholder: t("hero.servicePlaceholder") },
  ];

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/find-care?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <section className="relative overflow-hidden" aria-label="Hero search">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroImage} alt="Michigan Great Lakes landscape" className="h-full w-full object-cover" loading="eager" />
        <div className="absolute inset-0 bg-gradient-hero" />
      </div>

      <div className="container relative z-10 py-20 md:py-28 lg:py-36">
        <div className="mx-auto max-w-3xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-4 text-sm font-medium uppercase tracking-widest text-michigan-gold"
          >
            {t("hero.tagline")}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6 text-4xl font-bold leading-tight tracking-tight text-primary-foreground md:text-5xl lg:text-6xl"
          >
            {t("hero.title")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-10 text-lg text-primary-foreground/80 md:text-xl"
          >
            {t("hero.subtitle")}
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mx-auto max-w-2xl"
          >
            {/* Category Tabs */}
            <div className="mb-3 flex items-center justify-center gap-2" role="tablist" aria-label="Search category">
              {searchCategories.map((cat, i) => (
                <button
                  key={cat.label}
                  onClick={() => setActiveCategory(i)}
                  role="tab"
                  aria-selected={activeCategory === i}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                    activeCategory === i
                      ? "bg-primary-foreground text-primary shadow-sm"
                      : "text-primary-foreground/70 hover:text-primary-foreground"
                  }`}
                >
                  <cat.icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="flex items-center gap-2 rounded-xl bg-primary-foreground/95 p-2 shadow-2xl backdrop-blur-sm">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder={searchCategories[activeCategory].placeholder}
                  className="border-0 bg-transparent pl-10 text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                  aria-label="Search for healthcare resources"
                />
              </div>
              <Button onClick={handleSearch} className="bg-gradient-michigan hover:opacity-90 transition-opacity px-6">
                {t("hero.search")}
              </Button>
            </div>

            {/* Quick crisis link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-4 flex items-center justify-center gap-4 text-sm text-primary-foreground/70"
            >
              <a href="tel:988" className="flex items-center gap-1 hover:text-primary-foreground transition-colors">
                <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{t("crisis.suicideCrisis")}: <strong>988</strong></span>
              </a>
              <span>·</span>
              <a href="tel:211" className="hover:text-primary-foreground transition-colors">
                {t("crisis.resources")}: <strong>2-1-1</strong>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
