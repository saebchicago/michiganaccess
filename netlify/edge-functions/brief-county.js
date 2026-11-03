// Netlify Edge Function: serve the prerendered county brief for
// /brief?county=<county>.
//
// The sitemap lists all 83 /brief?county=<slug> URLs as canonical, but a
// static host serves one file per path, so every one of them used to ship the
// generic /brief head and body. scripts/prerender-meta.mjs writes one file per
// county at /brief-county/<slug>/index.html; this function serves it in place,
// keeping the requested URL. It runs before redirects, so the pretty-URL
// /brief -> /brief/ hop never splits the query URL from its canonical.
//
// Accepts both forms the app links with: slugs ("grand-traverse") and county
// names ("Grand Traverse", "St. Clair"). Fail-open: no county, an unknown
// county, or any error falls through to the normal /brief page.

export function countySlug(raw) {
  return String(raw)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/\./g, "");
}

export default async function handler(request) {
  try {
    const url = new URL(request.url);
    const raw = url.searchParams.get("county");
    if (!raw) return;
    const slug = countySlug(raw);
    if (!/^[a-z][a-z-]{1,30}$/.test(slug)) return;
    const res = await fetch(new URL(`/brief-county/${slug}/index.html`, url.origin));
    if (!res.ok) return;
    return new Response(res.body, { status: 200, headers: res.headers });
  } catch {
    return;
  }
}

export const config = { path: ["/brief", "/brief/"] };
