/**
 * Sticky domain jump navigation for long Place pages.
 * Scrolls to sections by domain ID.
 */
import { useState, useEffect } from "react";
import { Heart, Home, Zap, Droplets, Bus, Shield, GraduationCap, Apple, Compass } from "lucide-react";

const DOMAINS = [
  { id: "indicators", label: "Indicators", icon: Compass },
  { id: "programs", label: "Programs", icon: Heart },
  { id: "resources", label: "Resources", icon: Home },
  { id: "analysts", label: "For Analysts", icon: Shield },
] as const;

export default function DomainJumpNav() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <nav
      aria-label="Page sections"
      className="fixed bottom-16 lg:bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 rounded-full border border-border bg-background/95 backdrop-blur-sm px-2 py-1.5 shadow-lg"
    >
      {DOMAINS.map(d => (
        <button
          key={d.id}
          onClick={() => document.getElementById(d.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
          className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label={`Jump to ${d.label}`}
        >
          <d.icon className="h-3 w-3" />
          <span className="hidden sm:inline">{d.label}</span>
        </button>
      ))}
    </nav>
  );
}
