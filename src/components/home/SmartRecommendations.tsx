import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { useCounty } from "@/contexts/CountyContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RecentView {
  path: string;
  label: string;
  category: string;
}

const STORAGE_KEY = "mi-browsing-history";

/** Record a page visit for smart recommendations */
export function recordPageVisit(path: string, label: string, category: string) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const history: RecentView[] = raw ? JSON.parse(raw) : [];
    // Dedupe, keep latest 20
    const filtered = history.filter((h) => h.path !== path);
    filtered.unshift({ path, label, category });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, 20)));
  } catch {}
}

function getBrowsingHistory(): RecentView[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Category → related suggestions
const CATEGORY_RECS: Record<string, { label: string; path: string; why: string }[]> = {
  "find-care": [
    { label: "Compare Quality Ratings", path: "/quality", why: "Compare before you choose" },
    { label: "See What Care Costs", path: "/costs", why: "Understand pricing" },
    { label: "Get Financial Help", path: "/financial-help", why: "Find coverage options" },
  ],
  health: [
    { label: "Find a 46 Near You", path: "/find-care", why: "Top-rated providers" },
    { label: "Insurance Appeals", path: "/health/insurance-appeals", why: "Fight a denial" },
    { label: "Explore Health Data", path: "/data", why: "Community health metrics" },
  ],
  financial: [
    { label: "Check Your Benefits", path: "/financial-help", why: "Eligibility screener" },
    { label: "Find Local Resources", path: "/resources", why: "Community programs" },
    { label: "Insurance Appeals", path: "/health/insurance-appeals", why: "Appeal a denial" },
  ],
  civic: [
    { label: "Open Government Hub", path: "/civic-data", why: "Budget & FOIA" },
    { label: "Check Your Environment", path: "/environment", why: "Air & water quality" },
    { label: "Explore Regions", path: "/regions", why: "Regional comparisons" },
  ],
  resources: [
    { label: "Find a Support Group", path: "/support", why: "Connect with others" },
    { label: "Upcoming Events", path: "/events", why: "Community calendar" },
    { label: "Get Around Safely", path: "/transportation", why: "Transit options" },
  ],
};

// Persona-based default category when no history
const AUDIENCE_DEFAULT_CAT: Record<string, string> = {
  resident: "find-care",
  provider: "health",
  "health-system": "health",
  policymaker: "civic",
};

export default function SmartRecommendations() {
  const { county, audience } = useCounty();
  const history = getBrowsingHistory();

  const recommendations = useMemo(() => {
    // Find the most visited category, or fall back to persona default
    const catCounts: Record<string, number> = {};
    history.forEach((h) => {
      catCounts[h.category] = (catCounts[h.category] || 0) + 1;
    });

    const topCatFromHistory = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    const topCat = topCatFromHistory || (audience ? AUDIENCE_DEFAULT_CAT[audience] : null) || "find-care";
    const recs = CATEGORY_RECS[topCat] || CATEGORY_RECS["find-care"];

    // Filter out pages already visited recently
    const visitedPaths = new Set(history.slice(0, 5).map((h) => h.path));
    const filtered = recs.filter((r) => !visitedPaths.has(r.path));

    return {
      category: topCat,
      lastVisited: history[0] ?? null,
      items: filtered.length > 0 ? filtered : recs.slice(0, 2),
    };
  }, [history, audience]);

  // Show if we have history OR a persona set
  if (!audience && history.length < 2) return null;

  return (
    <section className="py-6">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <h3 className="text-sm font-bold text-foreground">Recommended for You</h3>
            {county && (
              <Badge variant="outline" className="text-[10px]">
                {county} County
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {recommendations.lastVisited ? (
              <>Based on your interest in{" "}
              <span className="font-medium text-foreground">{recommendations.lastVisited.label}</span>,
              others in your region also explored:</>
            ) : audience ? (
              <>Suggested for <span className="font-medium text-foreground">{audience === "health-system" ? "health systems" : `${audience}s`}</span>:</>
            ) : (
              <>Popular resources in your area:</>
            )}
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {recommendations.items.map((rec) => (
              <Link key={rec.path} to={rec.path}>
                <Card className="hover-lift border border-border/60 cursor-pointer">
                  <CardContent className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-foreground">{rec.label}</p>
                      <p className="text-[10px] text-muted-foreground">{rec.why}</p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
