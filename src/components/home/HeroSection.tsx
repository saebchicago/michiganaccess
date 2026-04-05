import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCounty } from "@/contexts/CountyContext";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown as ChevronDownIcon } from "lucide-react";
import {
  Search,
  HeartPulse,
  MapPin,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Mic,
  MicOff,
  Hash,
  Database,
  Shield,
  BarChart3,
  FileText,
  UserX,
  Eye,
  CalendarCheck,
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
      return <MapPin className="h-4 w-4 text-michigan-blue" />;
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
      <span className="ml-2 text-primary-foreground/40">(Key pages available in these languages)</span>
    </p>
  );
}

/** "First time here?" dismissable prompt */
function FirstTimePrompt() {
  const [dismissed, setDismissed] = useState(() =>
    typeof window !== "undefined" && localStorage.getItem("accessmi-first-time-dismissed") === "1"
  );
  if (dismissed) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.4 }}
      className="mt-4 mx-auto max-w-md"
    >
      <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-3 text-center">
        <p className="text-xs font-semibold text-primary-foreground mb-1">First time here?</p>
        <p className="text-[11px] text-primary-foreground/70 leading-relaxed mb-2">
          Tell us what you need — we'll show you where to start. No account required.
        </p>
        <div className="flex items-center justify-center gap-2">
          <Link
            to="/find-care"
            className="rounded-full bg-white/20 hover:bg-white/30 border border-white/20 px-3 py-1.5 text-[11px] font-medium text-primary-foreground transition-colors"
          >
            I need help now
          </Link>
          <Link
            to="/brief"
            className="rounded-full bg-white/20 hover:bg-white/30 border border-white/20 px-3 py-1.5 text-[11px] font-medium text-primary-foreground transition-colors"
          >
            Explore my community
          </Link>
          <button
            onClick={() => { setDismissed(true); localStorage.setItem("accessmi-first-time-dismissed", "1"); }}
            className="text-[10px] text-primary-foreground/50 hover:text-primary-foreground/80 transition-colors ml-1"
          >
            Dismiss
          </button>
        </div>
      </div>
    </motion.div>
  );
}

const ROTATING_STATS = [
  { text: "ZIP 48201 in Detroit scores 28/100 for healthcare access", href: "/zip/48201" },
  { text: "76 of 83 Michigan counties have zero pedestrian data", href: "/transportation" },
  { text: "625,852 Michigan residents called 211 last year", href: "/resources" },
  { text: "Only 27.4% of patients are screened for social needs", href: "/detection-gap" },
];

function RotatingStats() {
  const [statIndex, setStatIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatIndex((prev) => (prev + 1) % ROTATING_STATS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-4 mb-1 h-6 relative flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={statIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="absolute"
        >
          <Link
            to={ROTATING_STATS[statIndex].href}
            className="text-xs text-primary-foreground/60 hover:text-primary-foreground/90 transition-colors"
          >
            {ROTATING_STATS[statIndex].text}{" "}
            <span className="underline underline-offset-2 font-medium">See why &rarr;</span>
          </Link>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

const HeroSection = () => {
  const navigate = useNavigate();
  const { setZip } = useCounty();
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
    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionCtor();
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

  const placeholders = [
    "Try: food pantry near 48322...",
    "Try: mental health Oakland County...",
    "Try: emergency shelter Detroit...",
    "Try: utility assistance...",
    "Try: appeal insurance denial...",
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

    if (/^\d{10}$/.test(searchQuery.trim())) {
      navigate(`/find-care?npi=${searchQuery.trim()}`);
      return;
    }

    const zipMatch = searchQuery.trim().match(/\b(\d{5})\b/);
    if (zipMatch) {
      setZip(zipMatch[1]);
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

      <div className="container relative z-10 py-16 md:py-24 lg:py-32">
        <div className="mx-auto max-w-2xl text-center">
          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/60 mb-3"
          >
            Verified public data across all 83 Michigan counties
          </motion.p>

          {/* H1 */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="text-3xl font-bold tracking-tight text-primary-foreground md:text-5xl leading-tight"
          >
            Michigan's public data, organized for action.
          </motion.h1>

          {/* Subhead */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.5 }}
            className="mt-3 text-sm text-primary-foreground/75 md:text-base max-w-xl mx-auto leading-relaxed"
          >
            ZIP-level health, economic & housing data across all 83 counties. Free, forever.
          </motion.p>

          {/* Rotating Stats */}
          <RotatingStats />

          {/* ZIP Input — Primary CTA */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32, duration: 0.4 }}
            className="mt-8 max-w-lg mx-auto space-y-4"
          >
            <div className="flex gap-3 justify-center">
              <input
                type="text"
                inputMode="numeric"
                maxLength={5}
                placeholder="Enter your ZIP code"
                className="w-48 md:w-56 h-14 md:h-16 rounded-full bg-white/10 border-2 border-white/40 text-white text-center text-xl md:text-2xl font-mono placeholder:text-white/40 focus:outline-none focus:border-white/70 focus:bg-white/15 focus:scale-[1.02] transition-all shadow-lg"
                id="hero-zip"
                aria-label="Enter your 5-digit Michigan ZIP code"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const v = (e.target as HTMLInputElement).value;
                    if (v.length === 5) navigate(`/zip-intelligence?zip=${v}`);
                  }
                }}
              />
              <Button
                size="lg"
                className="h-14 md:h-16 px-6 md:px-8 rounded-full bg-white text-primary text-base md:text-lg font-bold hover:bg-white/90 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all"
                onClick={() => {
                  const v = (document.getElementById("hero-zip") as HTMLInputElement)?.value;
                  if (v?.length === 5) navigate(`/zip-intelligence?zip=${v}`);
                }}
              >
                See Your Neighborhood →
              </Button>
            </div>
            <p className="text-white/60 text-xs font-medium tracking-wide">
              40+ verified data sources · 83 counties · Independent
            </p>
          </motion.div>

          {/* Preview thumbnails — what you'll get */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex justify-center gap-6 mt-5"
          >
            <div className="text-center opacity-60">
              <div className="w-12 h-12 rounded-full border-[3px] border-white/30 flex items-center justify-center mx-auto">
                <span className="text-white text-[10px] font-bold">72</span>
              </div>
              <span className="text-[9px] text-white/40 mt-1 block">Health Score</span>
            </div>
            <div className="text-center opacity-60">
              <div className="w-12 h-12 rounded-lg border border-white/20 flex items-end justify-center gap-0.5 p-1.5 mx-auto">
                <div className="w-1.5 bg-white/40 rounded-t" style={{ height: "60%" }} />
                <div className="w-1.5 bg-teal-400/40 rounded-t" style={{ height: "45%" }} />
                <div className="w-1.5 bg-white/20 rounded-t" style={{ height: "35%" }} />
              </div>
              <span className="text-[9px] text-white/40 mt-1 block">Custom Charts</span>
            </div>
            <div className="text-center opacity-60">
              <div className="w-12 h-12 rounded-lg border border-white/20 flex items-center justify-center mx-auto">
                <span className="text-white/50 text-[9px] font-medium">6 programs</span>
              </div>
              <span className="text-[9px] text-white/40 mt-1 block">Eligibility</span>
            </div>
          </motion.div>

          {/* Secondary CTAs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="mt-5 flex items-center justify-center gap-4"
          >
            <Link
              to="/find-care"
              className="rounded-full border border-white/25 bg-white/10 hover:bg-white/20 px-4 py-2 text-xs font-medium text-primary-foreground transition-colors"
            >
              Find Help
            </Link>
            <Link
              to="/health-equity-atlas"
              className="rounded-full border border-white/25 bg-white/10 hover:bg-white/20 px-4 py-2 text-xs font-medium text-primary-foreground transition-colors"
            >
              Explore Data
            </Link>
          </motion.div>

          {/* Smart Search Bar */}
          <motion.form
            onSubmit={handleSearch}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
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
                className={`hero-search-input w-full rounded-full border-2 border-white/20 bg-white/95 dark:bg-background/95 py-4 pl-12 pr-40 text-base text-foreground placeholder:text-muted-foreground shadow-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1 focus:border-transparent focus:scale-[1.015] transition-all duration-200 ${placeholderOpacity === 0 ? 'placeholder-fading' : ''}`}
                role="combobox"
                aria-label="Search for services by need, ZIP code, county, clinic, or program"
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
                    aria-label={isListening ? "Listening… tap to stop" : "Search by voice"}
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

            {/* Search subtitle */}
            <p className="mt-2 text-[11px] text-primary-foreground/50 text-center">
              Search services, ZIP codes, cities, or counties across all 83 Michigan counties.
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

          {/* First-time user guide */}
          <FirstTimePrompt />

          {/* Scroll-to-explore chevron */}
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            onClick={() => {
              const next = document.getElementById("trust-panel") || document.getElementById("paths-heading");
              next?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="scroll-explore-chevron mt-8 mx-auto flex flex-col items-center gap-0.5 text-primary-foreground/50 hover:text-primary-foreground/80 transition-colors"
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
