/**
 * "Understand My Community" — Global CTA component
 * ZIP input → navigates to Place page, auto-scrolls to Community Summary.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { zipToCounty } from "@/data/michigan-county-seats";
import { countyToSlug } from "@/utils/countyUtils";

export default function UnderstandMyCommunity({ variant = "card" }: {variant?: "card" | "inline";}) {
  const [zip, setZip] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = zip.trim();
    if (!trimmed) return;

    // Try ZIP first
    if (/^\d{5}$/.test(trimmed)) {
      const county = zipToCounty(trimmed);
      if (county) {
        navigate(`/place/zip/${trimmed}#community-summary`);
        return;
      }
    }

    // Try as county slug
    navigate(`/place/${countyToSlug(trimmed)}-county#community-summary`);
  };

  if (variant === "inline") {
    return (
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-1 max-w-[200px]">
          <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            placeholder="Enter ZIP code"
            className="w-full rounded-full border border-border bg-card pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            maxLength={5}
            inputMode="numeric"
            pattern="\d{5}"
            aria-label="Enter ZIP code to understand your community" />

        </div>
        <Button type="submit" size="sm" className="rounded-full gap-1.5">
          Go <ArrowRight className="h-3 w-3" />
        </Button>
      </form>);

  }

  return (
    <section className="rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/8 via-background to-accent/5 p-6 md:p-8 text-center">
      <MapPin className="h-8 w-8 text-primary mx-auto mb-3" />
      <h2 className="text-xl font-bold text-foreground mb-2">What's happening in your community?</h2>
      <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
        Enter your ZIP code to see what matters most where you live — key data, resources, and actions in under 10 seconds.
      </p>
      <form onSubmit={handleSubmit} className="flex items-center justify-center gap-2 max-w-xs mx-auto">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            placeholder="Enter ZIP code"
            className="w-full rounded-full border border-border bg-card pl-9 pr-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary"
            maxLength={5}
            inputMode="numeric"
            pattern="\d{5}"
            aria-label="Enter ZIP code to understand your community" />

        </div>
        <Button type="submit" size="lg" className="rounded-full gap-1.5 px-6">
          Go <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
    </section>);

}