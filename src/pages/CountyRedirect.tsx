import { Navigate, useParams } from "react-router-dom";
import NotFound from "./NotFound";

/**
 * Reserved slugs that must never be treated as county shortcuts.
 * Includes all top-level static routes plus common future paths.
 */
const RESERVED_SLUGS = new Set([
  "partners", "about", "contact", "donate", "volunteer", "careers",
  "find-care", "health-map", "financial-help", "quality", "conditions",
  "resources", "news", "costs", "wellness", "clinical-trials", "support",
  "learn", "data", "transportation", "environment", "civic-data",
  "partnerships", "site-report", "events", "embed", "methodology",
  "research", "impact", "technical", "accessibility", "install",
  "insurance-appeals", "health", "complex-care", "life-navigator",
  "regions", "region", "equity", "lean-healthcare", "for-health-systems",
  "executive-summary", "case-studies", "changelog", "press", "sitemap",
  "county",
]);

const CountyRedirect = () => {
  const { slug } = useParams<{ slug: string }>();

  if (!slug || RESERVED_SLUGS.has(slug.toLowerCase())) {
    return <NotFound />;
  }

  return <Navigate to={`/county/${slug}`} replace />;
};

export default CountyRedirect;
