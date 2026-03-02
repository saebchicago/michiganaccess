import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown as ChevronDownIcon } from "lucide-react";
import {
  Search,
  Apple,
  Bus,
  HeartPulse,
  Pill,
  MapPin,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Mic,
  MicOff,
  Lock,
  User,
  Hash,
  Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getSearchSuggestions,
  getPopularSuggestions,
  parseComboQuery,
  getMisspellingCorrection,
  type SearchSuggestion,
} from "@/utils/searchUtils";
import { logSearch } from "@/utils/searchAnalytics";
import { parseNaturalLanguage } from "@/utils/naturalLanguageParser";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
const quickPills = [
  {
    icon: HeartPulse,
    label: "Find Care",
    href: "/find-care",
    primary: true,
  },
  {
    icon: User,
    label: "Find a Doctor",
    href: "/find-care?mode=name",
    secondary: true,
  },
  {
    icon: Pill,
    label: "Financial Help",
    href: "/financial-help",
  },
  {
    icon: Apple,
    label: "Community Resources",
    href: "/resources",
  },
  {
    icon: Brain,
    label: "Mental Health",
    href: "/conditions?category=mental-health",
  },
  {
    icon: Bus,
    label: "Transportation",
    href: "/transportation",
  },
  {
    icon: MapPin,
    label: "Zoning Info",
    href: "/zoning",
  },
  {
    icon: Bus,
    label: "More Services",
    href: "/wellness",
  },
];

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

const categoryIcon = (cat: string) => {
  switch (cat) {
    case "county":
      return <MapPin className="h-4 w-4 text-michigan-sky" />;
    case "correction":
      return <AlertCircle className="h-4 w-4 text-warm-gold" />;
    case "popular":
      return <TrendingUp className="h-4 w-4 text-muted-foreground" />;
    case "zip":
      return <Hash className="h-4 w-4 text-michigan-teal" />;
    case "city":
      return <MapPin className="h-4 w-4 text-forest-green" />;
    case "provider":
      return <User className="h-4 w-4 text-michigan-blue" />;
    default:
      return <Search className="h-4 w-4 text-primary" />;
  }
};

const langLinks = [
  { code: "es", label: "Español" },
  { code: "ar", label: "العربية" },
  { code: "bn", label: "বাংলা" },
];

function LanguageStrip() {
  const { i18n } = useTranslation();
  const switchLang = (code: string) => {
    i18n.changeLanguage(code);
    document.documentElement.dir = code === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = code;
  };
  return (
    <p className="mt-1.5 text-xs text-primary-foreground/50 text-center">
      {langLinks.map((l, i) => (
        <span key={l.code}>
          {i > 0 && <span className="mx-1.5">·</span>}
          <button
            type="button"
            onClick={() => switchLang(l.code)}
            className="underline underline-offset-2 hover:text-primary-foreground/80 transition-colors"
          >
            {l.label}
          </button>
        </span>
      ))}
    </p>
  );
}

const HeroSection = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [correction, setCorrection] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const recognitionRef = useRef<any>(null);

  const speechSupported =
    typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

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

  const [parsedIntent, setParsedIntent] = useState<ReturnType<typeof parseNaturalLanguage> | null>(null);

  // Phase 2: Typewriter placeholder cycle
  const placeholders = [
    "Search by city, ZIP, county, service, or doctor",
    "Try: food pantry near 48322...",
    "Try: mental health Oakland County...",
    "Try: emergency shelter Detroit...",
    "Try: utility assistance Wayne County...",
  ];
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [placeholderOpacity, setPlaceholderOpacity] = useState(1);

  useEffect(() => {
    if (isFocused) return;
    const interval = setInterval(() => {
      setPlaceholderOpacity(0);
      setTimeout(() => {
        setPlaceholderIdx((prev) => (prev + 1) % placeholders.length);
        setPlaceholderOpacity(1);
      }, 300);
    }, 4000);
    return () => clearInterval(interval);
  }, [isFocused, placeholders.length]);

  // NPI detection for 10-digit numbers
  const npiDetected = /^\d{10}$/.test(searchQuery.trim());

  const updateSuggestions = useCallback((q: string) => {
    if (q.length < 2) {
      setSuggestions(getPopularSuggestions());
      setCorrection(null);
      setParsedIntent(null);
      return;
    }
    const results = getSearchSuggestions(q);
    const misspelling = getMisspellingCorrection(q);
    setCorrection(misspelling);

    const intent = parseNaturalLanguage(q);
    setParsedIntent(intent.service || intent.county ? intent : null);

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

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setShowDropdown(false);

    // If 10-digit number, navigate to NPI lookup
    if (/^\d{10}$/.test(searchQuery.trim())) {
      navigate(`/find-care?npi=${searchQuery.trim()}`);
      return;
    }

    const intent = parseNaturalLanguage(searchQuery);

    logSearch({
      term: searchQuery,
      source: "hero",
      resultCount: suggestions.length,
      hadCorrection: !!correction,
      correctedTo: correction ?? undefined,
    });

    navigate(intent.resolvedHref);
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
          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl md:text-6xl leading-tight"
          >
            Michigan help, at your fingertips.
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="mt-4 text-lg text-primary-foreground/80 md:text-xl"
          >
            Free, instant access to housing, health, food, legal, and energy resources across all 83 Michigan counties.
          </motion.p>

          {/* Privacy Statement */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="mt-4 flex items-center justify-center gap-2 text-sm text-primary-foreground/90"
          >
            <Lock className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span>No account, no tracking, no personal data stored.</span>
          </motion.div>

          {/* Smart Search Bar */}
          <motion.form
            onSubmit={handleSearch}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="mt-8 mx-auto max-w-xl relative"
          >
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                ref={inputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setActiveIndex(-1);
                }}
                onFocus={() => { setShowDropdown(true); setIsFocused(true); setPlaceholderIdx(0); setPlaceholderOpacity(1); }}
                onBlur={() => setIsFocused(false)}
                onKeyDown={handleKeyDown}
                placeholder={placeholders[placeholderIdx]}
                className={`hero-search-input w-full rounded-full border-2 border-white/20 bg-white/95 dark:bg-background/95 py-4 pl-12 pr-40 text-base text-foreground placeholder:text-muted-foreground shadow-2xl focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:ring-offset-1 focus:border-transparent focus:scale-[1.015] transition-all duration-200 ${placeholderOpacity === 0 ? 'placeholder-fading' : ''}`}
                role="combobox"
                aria-label="Search for services by location, doctor name, or NPI"
                aria-expanded={showDropdown}
                aria-haspopup="listbox"
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

            {/* Search helper text */}
            <p className="mt-2 text-xs text-primary-foreground/60 text-center">
              Search services, ZIP codes, cities, counties — or type a clinic name, community service, or health
              facility
            </p>

            {/* Language quick-switch strip */}
            <LanguageStrip />

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
                  {/* NPI detection chip */}
                  {npiDetected && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowDropdown(false);
                        navigate(`/find-care?npi=${searchQuery.trim()}`);
                      }}
                      className="w-full px-4 py-2.5 text-sm text-left bg-primary/5 hover:bg-primary/10 transition-colors flex items-center gap-2 border-b border-border"
                    >
                      <Hash className="h-3.5 w-3.5 text-primary" />
                      <span className="text-foreground">
                        Search NPI <strong className="font-mono">{searchQuery.trim()}</strong>
                      </span>
                      <span className="ml-auto text-xs text-primary font-medium">Find Care →</span>
                    </button>
                  )}

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

                  {parsedIntent && searchQuery.length >= 3 && !npiDetected && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowDropdown(false);
                        navigate(parsedIntent.resolvedHref);
                      }}
                      className="w-full px-4 py-2.5 text-sm text-left bg-primary/5 hover:bg-primary/10 transition-colors flex items-center gap-2 border-b border-border"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      <span className="text-muted-foreground">{parsedIntent.explanation}</span>
                      <span className="ml-auto text-xs text-primary font-medium">Go →</span>
                    </button>
                  )}

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
                    <div className="px-4 pt-3 pb-1.5 border-b border-border/40">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Try a popular search
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        No results for &ldquo;{searchQuery}&rdquo; — try a county name, ZIP code, or service type
                      </p>
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
                        i === activeIndex ? "bg-primary/10 dark:bg-primary/20" : "hover:bg-muted"
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

          {/* Example search pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="mt-4 flex flex-wrap items-center justify-center gap-2"
          >
            <span className="text-xs text-primary-foreground/60">Try:</span>
            {[
              { label: "48322 food pantry", query: "48322 food pantry" },
              { label: "Oakland County mental health", query: "Oakland County mental health" },
              { label: "Appeal Insurance Denial", query: "Appeal Insurance Denial" },
            ].map((ex) => (
              <button
                key={ex.label}
                type="button"
                onClick={() => {
                  setSearchQuery(ex.query);
                  updateSuggestions(ex.query);
                  inputRef.current?.focus();
                }}
                className="rounded-full bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-1 text-[11px] text-primary-foreground/80 transition-all hover:scale-105"
              >
                {ex.label}
              </button>
            ))}
          </motion.div>

          {/* Popular shortcut pills */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.5 }}
            className="mt-6 flex flex-col items-center gap-2"
          >
            <span className="text-[10px] font-semibold uppercase tracking-widest text-primary-foreground/45">
              Popular shortcuts
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {quickPills
                .filter((p) => !(p as any).secondary)
                .map((pill) => (
                  <Link
                    key={pill.label}
                    to={pill.href}
                    className={`group inline-flex items-center gap-1.5 rounded-full border border-white/20 px-3.5 py-1.5 text-xs font-medium text-primary-foreground/90 transition-all hover:scale-105 ${(pill as any).primary ? "bg-white/25 ring-1 ring-white/30" : "bg-white/15 hover:bg-white/25"}`}
                  >
                    <pill.icon className="h-3.5 w-3.5" aria-hidden="true" />
                    {pill.label}
                  </Link>
                ))}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
              {quickPills
                .filter((p) => (p as any).secondary)
                .map((pill) => (
                  <Link
                    key={pill.label}
                    to={pill.href}
                    className="group inline-flex items-center gap-1 rounded-full bg-white/8 hover:bg-white/15 border border-white/10 px-3 py-1 text-[11px] font-normal text-primary-foreground/60 transition-all hover:text-primary-foreground/80"
                  >
                    <pill.icon className="h-3 w-3" aria-hidden="true" />
                    {pill.label}
                  </Link>
                ))}
            </div>
          </motion.div>

          {/* Scroll-to-explore chevron */}
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            onClick={() => {
              const next = document.querySelector('[aria-labelledby="core-access-heading"]');
              next?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="scroll-explore-chevron mt-6 mx-auto flex flex-col items-center gap-0.5 text-primary-foreground/50 hover:text-primary-foreground/80 transition-colors"
            aria-label="Scroll to explore"
          >
            <span className="text-[10px] font-medium tracking-wider uppercase">Scroll to explore</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                ...(typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
                  ? { repeat: 0 }
                  : {}),
              }}
            >
              <ChevronDownIcon className="h-5 w-5" />
            </motion.div>
          </motion.button>
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
