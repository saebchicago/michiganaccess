#!/usr/bin/env node
/**
 * Generates public/sitemap.xml from:
 *   - All routes in src/config/routeMeta.ts (prerendered, canonical 200s)
 *   - All 83 Michigan county routes (/county/<slug>)
 *   - All 83 brief?county= canonicals (/brief?county=<slug>)
 *
 * lastmod is the build date, never hand-typed.
 * Wired into pnpm build (first step, before check-links).
 *
 * Usage:
 *   node scripts/generate-sitemap.mjs
 */
import { writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..");
const OUT = path.join(projectRoot, "public/sitemap.xml");
const ROUTE_META_PATH = path.join(projectRoot, "src/config/routeMeta.ts");

const SITE_URL = "https://accessmi.org";
const BUILD_DATE = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

// All 83 Michigan counties — must match MI_COUNTY_FIPS in census-geographies.ts
const MI_COUNTIES_83 = [
  "Alcona", "Alger", "Allegan", "Alpena", "Antrim", "Arenac", "Baraga",
  "Barry", "Bay", "Benzie", "Berrien", "Branch", "Calhoun", "Cass",
  "Charlevoix", "Cheboygan", "Chippewa", "Clare", "Clinton", "Crawford",
  "Delta", "Dickinson", "Eaton", "Emmet", "Genesee", "Gladwin", "Gogebic",
  "Grand Traverse", "Gratiot", "Hillsdale", "Houghton", "Huron", "Ingham",
  "Ionia", "Iosco", "Iron", "Isabella", "Jackson", "Kalamazoo", "Kalkaska",
  "Kent", "Keweenaw", "Lake", "Lapeer", "Leelanau", "Lenawee", "Livingston",
  "Luce", "Mackinac", "Macomb", "Manistee", "Marquette", "Mason", "Mecosta",
  "Menominee", "Midland", "Missaukee", "Monroe", "Montcalm", "Montmorency",
  "Muskegon", "Newaygo", "Oakland", "Oceana", "Ogemaw", "Ontonagon",
  "Osceola", "Oscoda", "Otsego", "Ottawa", "Presque Isle", "Roscommon",
  "Saginaw", "St. Clair", "St. Joseph", "Sanilac", "Schoolcraft",
  "Shiawassee", "Tuscola", "Van Buren", "Washtenaw", "Wayne", "Wexford",
];

// Mirrors countyToSlug in src/utils/countyUtils.ts
function countyToSlug(county) {
  return county.toLowerCase().replace(/\s+/g, "-").replace(/\./g, "");
}

// Parse ROUTE_META paths from routeMeta.ts (same narrow regex as prerender-meta.mjs)
async function loadRoutePaths() {
  const src = await readFile(ROUTE_META_PATH, "utf8");
  const paths = [];
  const re = /path\s*:\s*"(\/[^"]*)"/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    paths.push(m[1]);
  }
  return paths;
}

// Normalize to trailing-slash so sitemap loc matches the URL Netlify serves.
// Query-string paths (e.g. /brief?county=wayne) are left unchanged because
// Netlify Pretty URLs only adds slashes to directory-style paths.
function trailingSlash(loc) {
  if (loc === "/" || loc.includes("?")) return loc;
  return loc.endsWith("/") ? loc : `${loc}/`;
}

function url(loc, { priority = "0.7", changefreq = "monthly", lastmod = null } = {}) {
  const normalized = trailingSlash(loc);
  const lastmodTag = lastmod ? `<lastmod>${lastmod}</lastmod>` : "";
  return `  <url><loc>${SITE_URL}${normalized}</loc>${lastmodTag}<changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
}

async function main() {
  const routePaths = await loadRoutePaths();

  const lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];

  // Static prerendered routes from routeMeta
  const priorities = {
    "/": { priority: "1.0", changefreq: "daily" },
    "/find-care": { priority: "0.9", changefreq: "weekly" },
    "/financial-help": { priority: "0.9", changefreq: "weekly" },
    "/benefits": { priority: "0.9", changefreq: "weekly" },
    "/health-map": { priority: "0.9", changefreq: "weekly" },
    "/data-sources": { priority: "0.8", changefreq: "weekly" },
    "/brief": { priority: "0.8", changefreq: "weekly" },
    "/resources": { priority: "0.8", changefreq: "weekly" },
    "/health": { priority: "0.8", changefreq: "weekly" },
    "/environment": { priority: "0.8", changefreq: "weekly" },
    "/compare": { priority: "0.8", changefreq: "weekly" },
    "/zip-intelligence": { priority: "0.8", changefreq: "weekly" },
    "/data": { priority: "0.7", changefreq: "weekly" },
  };

  for (const p of routePaths) {
    const opts = priorities[p] ?? { priority: "0.6", changefreq: "monthly" };
    lines.push(url(p, { ...opts, lastmod: BUILD_DATE }));
  }

  // 83 county pages
  lines.push("  <!-- Michigan county pages (83) -->");
  for (const county of MI_COUNTIES_83) {
    const slug = countyToSlug(county);
    lines.push(url(`/county/${slug}`, { priority: "0.8", changefreq: "weekly", lastmod: BUILD_DATE }));
  }

  // 83 brief?county= canonicals
  lines.push("  <!-- County brief canonicals (83) -->");
  for (const county of MI_COUNTIES_83) {
    const slug = countyToSlug(county);
    lines.push(url(`/brief?county=${slug}`, { priority: "0.7", changefreq: "monthly", lastmod: BUILD_DATE }));
  }

  lines.push("</urlset>");

  const xml = lines.join("\n") + "\n";
  await writeFile(OUT, xml, "utf8");

  const staticCount = routePaths.length;
  const countyCount = MI_COUNTIES_83.length;
  console.log(
    `✓ [generate-sitemap] wrote ${OUT.split("/").slice(-3).join("/")} ` +
    `(${staticCount} static + ${countyCount} county + ${countyCount} brief = ${staticCount + countyCount * 2} URLs, lastmod ${BUILD_DATE})`
  );
}

main().catch((err) => {
  console.error("[generate-sitemap] failed:", err.message);
  process.exit(1);
});
