import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, MapPin, Stethoscope, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-michigan.jpg";

const searchCategories = [
  { icon: MapPin, label: "Location", placeholder: "ZIP code or city..." },
  { icon: Stethoscope, label: "Condition", placeholder: "e.g. diabetes, mental health..." },
  { icon: Building2, label: "Service", placeholder: "e.g. urgent care, mammogram..." },
];

const HeroSection = () => {
  const [activeCategory, setActiveCategory] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/find-care?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroImage} alt="Michigan Great Lakes landscape" className="h-full w-full object-cover" />
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
            A Citizen-Driven Initiative
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6 text-4xl font-bold leading-tight tracking-tight text-primary-foreground md:text-5xl lg:text-6xl"
          >
            Your Guide to Resources in Michigan
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-10 text-lg text-primary-foreground/80 md:text-xl"
          >
            Resources for Health, Safety, Transportation, Environment & Civic Engagement across Michigan.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mx-auto max-w-2xl"
          >
            {/* Category Tabs */}
            <div className="mb-3 flex items-center justify-center gap-2">
              {searchCategories.map((cat, i) => (
                <button
                  key={cat.label}
                  onClick={() => setActiveCategory(i)}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                    activeCategory === i
                      ? "bg-primary-foreground text-primary shadow-sm"
                      : "text-primary-foreground/70 hover:text-primary-foreground"
                  }`}
                >
                  <cat.icon className="h-3.5 w-3.5" />
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="flex items-center gap-2 rounded-xl bg-primary-foreground/95 p-2 shadow-2xl backdrop-blur-sm">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder={searchCategories[activeCategory].placeholder}
                  className="border-0 bg-transparent pl-10 text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              <Button onClick={handleSearch} className="bg-gradient-michigan hover:opacity-90 transition-opacity px-6">
                Search
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
