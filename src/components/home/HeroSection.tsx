import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Apple, Bus, HeartPulse, Pill, MapPin, Sparkles, TrendingUp, AlertCircle, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSearchSuggestions, getPopularSuggestions, parseComboQuery, getMisspellingCorrection, type SearchSuggestion } from "@/utils/searchUtils";
import { logSearch } from "@/utils/searchAnalytics";

// Extend Window for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const quickPills = [
  { icon: HeartPulse, label: "Find Care", href: "/find-care" },
  { icon: Pill, label: "Financial Help", href: "/financial-help" },
  { icon: Apple, label: "Community Resources", href: "/resources" },
  { icon: Bus, label: "More Services", href: "/wellness" },
];

const MichiganOutline = () => (
  <svg
    viewBox="0 0 400 500"
    className="absolute right-0 top-1/2 -translate-y-1/2 h-[120%] w-auto opacity-[0.04]"
    aria-hidden="true"
  >
    <path d="M200 180 L240 200 L270 250 L280 310 L260 370 L220 400 L180 410 L140 380 L120 330 L130 270 L150 220 Z" fill="currentColor" className="text-primary-foreground" />
    <path d="M100 140 L160 120 L220 130 L240 150 L200 170 L140 165 L100 155 Z" fill="currentColor" className="text-primary-foreground" />
  </svg>
);

const categoryIcon = (cat: string) => {
  switch (cat) {
    case "county": return <MapPin className="h-4 w-4 text-michigan-sky" />;
    case "correction": return <AlertCircle className="h-4 w-4 text-warm-gold" />;
    case "popular": return <TrendingUp className="h-4 w-4 text-muted-foreground" />;
    default: return <Search className="h-4 w-4 text-primary" />;
  }
};

const HeroSection = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [correction, setCorrection] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const recognitionRef = useRef<any>(null);

  // Web Speech API setup
  const speechSupported = typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const startListening = useCallback(() => {
    if (!speechSupported) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      setShowDropdown(true);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [speechSupported]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const updateSuggestions = useCallback((q: string) => {
    if (q.length < 2) {
      setSuggestions(getPopularSuggestions());
      setCorrection(null);
      return;
    }
    const results = getSearchSuggestions(q);
    const misspelling = getMisspellingCorrection(q);
    setCorrection(misspelling);
    if (results.length === 0) {
      setSuggestions(getPopularSuggestions());
    } else {
      setSuggestions(results);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => updateSuggestions(searchQuery), 120);
    return () => clearTimeout(debounceRef.current);
  }, [searchQuery, updateSuggestions]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const { term, county } = parseComboQuery(searchQuery);
    setShowDropdown(false);

    // Log anonymized search
    logSearch({
      term: searchQuery,
      source: "hero",
      resultCount: suggestions.length,
      hadCorrection: !!correction,
      correctedTo: correction ?? undefined,
    });

    if (county) {
      navigate(`/county/${county.toLowerCase().replace(/[\s.]+/g, "-")}?q=${encodeURIComponent(term)}`);
    } else {
      navigate(`/find-care?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSuggestionClick = (s: SearchSuggestion) => {
    setShowDropdown(false);
    setSearchQuery("");
    navigate(s.href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  const handleApplyCorrection = () => {
    if (correction) {
      setSearchQuery(correction);
      setCorrection(null);
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-hero" aria-label="Hero">
      <MichiganOutline />
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

          {/* Smart Search Bar */}
          <motion.form
            onSubmit={handleSearch}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="mt-8 mx-auto max-w-xl relative"
            role="combobox"
            aria-expanded={showDropdown}
            aria-haspopup="listbox"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <input
                ref={inputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setActiveIndex(-1); }}
                onFocus={() => setShowDropdown(true)}
                onKeyDown={handleKeyDown}
                placeholder="Search clinics, transit, energy programs, food pantries, insurance help…"
                className="w-full rounded-full border-2 border-white/20 bg-white/95 dark:bg-background/95 py-4 pl-12 pr-40 text-base text-foreground placeholder:text-muted-foreground shadow-2xl focus:outline-none focus:ring-2 focus:ring-michigan-gold focus:border-transparent transition-all"
                aria-label="Search for services"
                aria-autocomplete="list"
                aria-controls="hero-search-suggestions"
                aria-activedescendant={activeIndex >= 0 ? `hero-suggestion-${activeIndex}` : undefined}
                autoComplete="off"
              />
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {speechSupported && (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={isListening ? stopListening : startListening}
                    className={`rounded-full h-10 w-10 transition-colors ${isListening ? "text-destructive bg-destructive/10 animate-pulse" : "text-muted-foreground hover:text-foreground"}`}
                    aria-label={isListening ? "Stop voice search" : "Start voice search"}
                    title={isListening ? "Listening… tap to stop" : "Voice search"}
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                )}
                <Button
                  type="submit"
                  size="lg"
                  className="rounded-full bg-primary hover:bg-primary/90 px-6 font-semibold shadow-lg"
                >
                  Search
                </Button>
              </div>
            </div>

            {/* Autocomplete Dropdown */}
            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  ref={dropdownRef}
                  id="hero-search-suggestions"
                  role="listbox"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 right-0 top-full mt-2 rounded-xl bg-white dark:bg-card border border-border shadow-2xl z-50 overflow-hidden max-h-80 overflow-y-auto"
                >
                  {/* Misspelling correction banner */}
                  {correction && searchQuery.length >= 2 && (
                    <button
                      type="button"
                      onClick={handleApplyCorrection}
                      className="w-full px-4 py-2.5 text-sm text-left bg-warm-gold/10 hover:bg-warm-gold/20 transition-colors flex items-center gap-2 border-b border-border"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-warm-gold" />
                      <span className="text-muted-foreground">Did you mean</span>
                      <span className="font-semibold text-foreground">{correction}</span>
                      <span className="text-muted-foreground">?</span>
                    </button>
                  )}

                  {/* Section label */}
                  {searchQuery.length < 2 && suggestions.length > 0 && (
                    <div className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Popular Searches
                    </div>
                  )}
                  {searchQuery.length >= 2 && suggestions.length > 0 && suggestions[0].category !== "popular" && (
                    <div className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Suggestions
                    </div>
                  )}
                  {searchQuery.length >= 2 && suggestions.length > 0 && suggestions[0].category === "popular" && (
                    <div className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      No matches found — try these popular searches
                    </div>
                  )}

                  {suggestions.map((s, i) => (
                    <button
                      key={`${s.label}-${i}`}
                      id={`hero-suggestion-${i}`}
                      role="option"
                      aria-selected={i === activeIndex}
                      type="button"
                      onClick={() => handleSuggestionClick(s)}
                      className={`w-full px-4 py-2.5 text-sm text-left flex items-center gap-3 transition-colors ${
                        i === activeIndex
                          ? "bg-primary/10 dark:bg-primary/20"
                          : "hover:bg-muted"
                      }`}
                    >
                      {categoryIcon(s.category)}
                      <span className="flex-1 truncate text-foreground">{s.label}</span>
                      {s.category === "correction" && s.matchedTerm && (
                        <span className="text-xs text-muted-foreground italic">corrected</span>
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
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

          {/* Secondary CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75, duration: 0.5 }}
            className="mt-5 flex items-center justify-center gap-3"
          >
            <a
              href="tel:988"
              className="inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/20 px-4 py-2 text-sm font-medium text-primary-foreground/90 hover:bg-white/25 transition-all"
            >
              Get help now — 988 / 2-1-1
            </a>
          </motion.div>
        </div>
      </div>

      <div className="absolute inset-0 opacity-[0.04]" aria-hidden="true">
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-primary-foreground blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-primary-foreground blur-3xl" />
      </div>
    </section>
  );
};

export default HeroSection;
