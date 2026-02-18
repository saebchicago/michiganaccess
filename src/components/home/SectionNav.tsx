import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Route, Layers, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

interface NavSection {
  label: string;
  icon: React.ReactNode;
  items: { label: string; href: string }[];
}

const SECTIONS: NavSection[] = [
  {
    label: "Pathways",
    icon: <Route className="h-3.5 w-3.5" />,
    items: [
      { label: "Find Care", href: "/find-care" },
      { label: "Financial Help", href: "/financial-help" },
      { label: "Insurance Appeals", href: "/health/insurance-appeals" },
      { label: "Life Navigator", href: "/life-navigator" },
      { label: "Prevention & Wellness", href: "/wellness" },
    ],
  },
  {
    label: "Sectors",
    icon: <Layers className="h-3.5 w-3.5" />,
    items: [
      { label: "Health Conditions", href: "/conditions" },
      { label: "Environment & Air", href: "/environment" },
      { label: "Transportation", href: "/transportation" },
      { label: "Civic Data", href: "/civic-data" },
      { label: "Quality Ratings", href: "/quality" },
      { label: "Cost Transparency", href: "/costs" },
    ],
  },
  {
    label: "Counties",
    icon: <MapPin className="h-3.5 w-3.5" />,
    items: [
      { label: "Wayne County", href: "/county/wayne" },
      { label: "Oakland County", href: "/county/oakland" },
      { label: "Kent County", href: "/county/kent" },
      { label: "Genesee County", href: "/county/genesee" },
      { label: "Washtenaw County", href: "/county/washtenaw" },
      { label: "All Regions", href: "/regions" },
    ],
  },
];

export default function SectionNav() {
  const [visible, setVisible] = useState(false);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [focusIdx, setFocusIdx] = useState(-1);
  const navRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 340);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenIdx(null);
        setFocusIdx(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus the active menu item when focusIdx changes
  useEffect(() => {
    if (focusIdx >= 0 && itemRefs.current[focusIdx]) {
      itemRefs.current[focusIdx]?.focus();
    }
  }, [focusIdx]);

  const handleTriggerKeyDown = (e: React.KeyboardEvent, i: number) => {
    const items = SECTIONS[i].items;
    switch (e.key) {
      case "ArrowDown":
      case "Enter":
      case " ":
        e.preventDefault();
        setOpenIdx(i);
        setFocusIdx(0);
        itemRefs.current = [];
        break;
      case "ArrowRight":
        e.preventDefault();
        setOpenIdx(Math.min(i + 1, SECTIONS.length - 1));
        setFocusIdx(-1);
        break;
      case "ArrowLeft":
        e.preventDefault();
        setOpenIdx(Math.max(i - 1, 0));
        setFocusIdx(-1);
        break;
      case "Escape":
        e.preventDefault();
        setOpenIdx(null);
        setFocusIdx(-1);
        break;
    }
  };

  const handleItemKeyDown = (e: React.KeyboardEvent, sectionIdx: number, itemIdx: number) => {
    const items = SECTIONS[sectionIdx].items;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusIdx(Math.min(itemIdx + 1, items.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        if (itemIdx === 0) {
          setFocusIdx(-1);
          // Return focus to trigger button
          (navRef.current?.querySelectorAll<HTMLButtonElement>('[aria-haspopup="true"]')[sectionIdx])?.focus();
        } else {
          setFocusIdx(itemIdx - 1);
        }
        break;
      case "Escape":
      case "Tab":
        setOpenIdx(null);
        setFocusIdx(-1);
        break;
      case "Home":
        e.preventDefault();
        setFocusIdx(0);
        break;
      case "End":
        e.preventDefault();
        setFocusIdx(items.length - 1);
        break;
    }
  };

  if (!visible) return null;

  return (
    <motion.div
      ref={navRef}
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-16 left-0 right-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-md"
      role="navigation"
      aria-label="Section navigation"
    >
      <div className="container flex items-center gap-1 h-10">
        {SECTIONS.map((section, i) => (
          <div key={section.label} className="relative">
            <button
              onClick={() => { setOpenIdx(openIdx === i ? null : i); setFocusIdx(-1); }}
              onKeyDown={(e) => handleTriggerKeyDown(e, i)}
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              aria-expanded={openIdx === i}
              aria-haspopup="true"
              aria-controls={`section-menu-${i}`}
            >
              {section.icon}
              {section.label}
              <ChevronDown className={`h-3 w-3 transition-transform ${openIdx === i ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {openIdx === i && (
                <motion.div
                  id={`section-menu-${i}`}
                  role="menu"
                  aria-label={`${section.label} menu`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute left-0 top-full mt-1 w-48 rounded-lg border border-border bg-card p-1 shadow-lg z-50"
                >
                  {section.items.map((item, j) => (
                    <Link
                      key={item.href}
                      ref={(el) => { itemRefs.current[j] = el; }}
                      to={item.href}
                      role="menuitem"
                      tabIndex={focusIdx === j ? 0 : -1}
                      onClick={() => { setOpenIdx(null); setFocusIdx(-1); }}
                      onKeyDown={(e) => handleItemKeyDown(e, i, j)}
                      className="block rounded-md px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:bg-muted focus-visible:text-foreground focus-visible:outline-none"
                    >
                      {item.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
