import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  Home,
  Search,
  MapPin,
  Heart,
  ArrowLeft,
  Compass,
  Database,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { APP_ROUTES } from "@/config/routes";

/**
 * Recovery-flavored 404 page. The previous version was a generic
 * "Page Not Found" message wrapped in the full app shell (heavy
 * footer, animated nav, etc.). For a user who hit a broken or
 * misremembered URL, we instead offer:
 *
 *   - A prominent search input that matches against declared routes,
 *   - "Did you mean..." suggestions for paths similar to the one
 *     they tried, derived from a Levenshtein-style distance,
 *   - A short list of primary destinations,
 *   - A go-back action.
 *
 * The chrome is intentionally minimal: this component does NOT render
 * the full Layout (header, footer, crisis bar) so the recovery state
 * is calm and focused rather than busy with global navigation.
 */

/** Primary destinations shown alongside the search. Kept short on
 *  purpose so the recovery UI doesn't reproduce the whole site map. */
const PRIMARY_DESTINATIONS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Find Care", href: "/find-care", icon: Heart },
  { label: "Community Resources", href: "/resources", icon: MapPin },
  { label: "Health Data Dashboard", href: "/data", icon: Database },
  { label: "Methodology", href: "/methodology", icon: HelpCircle },
  { label: "ZIP Intelligence", href: "/zip-intelligence", icon: Compass },
] as const;

/** Minimal edit-distance between two strings, used for did-you-mean. */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  const prev = new Array<number>(n + 1);
  const curr = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= n; j++) prev[j] = curr[j];
  }
  return prev[n];
}

interface RouteSuggestion {
  path: string;
  label: string;
  score: number;
}

function getRouteSuggestions(query: string): RouteSuggestion[] {
  const q = query.trim().toLowerCase().replace(/^\/+/, "");
  if (!q) return [];
  const candidates: RouteSuggestion[] = [];
  for (const route of APP_ROUTES) {
    if (!route.path || route.path.includes(":")) continue;
    const path = route.path.replace(/^\/+/, "").toLowerCase();
    const label = (route.label ?? path).toLowerCase();
    const pathDistance = levenshtein(q, path);
    const labelDistance = levenshtein(q, label);
    const contains =
      path.includes(q) || label.includes(q) || q.includes(path) ? 0 : 4;
    const score = Math.min(pathDistance, labelDistance) - contains;
    candidates.push({
      path: route.path,
      label: route.label ?? route.path,
      score,
    });
  }
  return candidates.sort((a, b) => a.score - b.score).slice(0, 5);
}

export function NotFound() {
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState(() =>
    location.pathname.replace(/^\/+/, ""),
  );

  useEffect(() => {
    // Surface the bad path in the console so the operator can see
    // what URL users are trying. Keep this as a console.warn so the
    // recovery flow stays quiet for normal users.
    console.warn(
      `[NotFound] No route matched ${location.pathname}${location.search}`,
    );
  }, [location.pathname, location.search]);

  const suggestions = useMemo(() => getRouteSuggestions(query), [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (suggestions[0]) {
      navigate(suggestions[0].path);
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Minimal top bar: a single back link to home. No global nav,
          no crisis bar, no footer chrome. */}
      <header className="border-b border-border">
        <div className="container max-w-4xl py-4 flex items-center gap-2">
          <Link
            to="/"
            className="text-sm font-semibold text-foreground hover:text-primary inline-flex items-center gap-1.5"
            aria-label="Access Michigan home"
          >
            <Home className="h-4 w-4" />
            Access Michigan
          </Link>
        </div>
      </header>

      <section className="flex-1 container max-w-2xl py-16 md:py-20">
        <div className="text-center space-y-2">
          <p
            className="text-5xl font-bold text-muted-foreground tabular-nums"
            aria-hidden="true"
          >
            404
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            We couldn't find that page
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            The path{" "}
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
              {location.pathname}
            </code>{" "}
            isn't one of our routes. Try a search or one of the destinations
            below.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          role="search"
          aria-label="Search the site"
          className="mt-8"
        >
          <label htmlFor="not-found-search" className="sr-only">
            Search for a page or topic
          </label>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="not-found-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try: methodology, health-map, county/wayne, /benefits"
              className="pl-9 h-11 text-base"
              autoFocus
            />
          </div>
          {suggestions.length > 0 && (
            <div className="mt-3 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Did you mean
              </p>
              <ul className="rounded-lg border border-border bg-card">
                {suggestions.map((s) => (
                  <li
                    key={s.path}
                    className="border-b border-border/40 last:border-0"
                  >
                    <Link
                      to={s.path}
                      className="flex items-center justify-between gap-3 px-3 py-2 text-sm hover:bg-muted transition-colors"
                    >
                      <span className="font-medium text-foreground">
                        {s.label}
                      </span>
                      <code className="text-xs text-muted-foreground font-mono">
                        {s.path}
                      </code>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </form>

        <Card className="mt-8 border-muted bg-muted/30">
          <CardContent className="py-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Primary destinations
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {PRIMARY_DESTINATIONS.map((d) => (
                <Button
                  key={d.href}
                  variant="outline"
                  className="justify-start gap-2"
                  asChild
                >
                  <Link to={d.href}>
                    <d.icon
                      className="h-4 w-4 text-primary"
                      aria-hidden="true"
                    />
                    {d.label}
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            className="gap-1.5 text-muted-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Go back
          </Button>
        </div>
      </section>
    </main>
  );
}

export default NotFound;
