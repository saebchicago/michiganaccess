#!/usr/bin/env node
/**
 * Minimal static server for a built dist/ so release checks can run locally:
 *   node scripts/serve-dist.mjs [dir=dist] [port=4173]
 *   node scripts/verify-release.mjs --base http://localhost:4173
 * Mirrors Netlify's relevant behavior: dir/index.html for directory paths,
 * dist/_redirects 200 rewrites to /spa-shell.html, and HTTP 404 with
 * /404.html for anything else. Headers and edge functions are not emulated.
 */
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";

const dir = process.argv[2] || "dist";
const port = Number(process.argv[3] || 4173);
const TYPES = { ".html": "text/html; charset=utf-8", ".json": "application/json", ".js": "text/javascript", ".css": "text/css", ".txt": "text/plain; charset=utf-8", ".xml": "application/xml", ".svg": "image/svg+xml", ".png": "image/png", ".csv": "text/csv" };

const rewrites = new Set();
if (existsSync(join(dir, "_redirects"))) {
  for (const line of readFileSync(join(dir, "_redirects"), "utf8").split("\n")) {
    const [from, to, code] = line.trim().split(/\s+/);
    if (code === "200" && to === "/spa-shell.html") rewrites.add(from.replace(/\/$/, ""));
  }
}

function send(res, status, file) {
  res.writeHead(status, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
  res.end(readFileSync(file));
}

createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, "http://x").pathname);
  const safe = normalize(path).replace(/^(\.\.[/\\])+/, "");
  const target = join(dir, safe);
  if (existsSync(target) && statSync(target).isFile()) return send(res, 200, target);
  if (existsSync(join(target, "index.html"))) return send(res, 200, join(target, "index.html"));
  if (rewrites.has(path.replace(/\/$/, ""))) return send(res, 200, join(dir, "spa-shell.html"));
  return send(res, 404, join(dir, "404.html"));
}).listen(port, () => console.log(`[serve-dist] ${dir} on http://localhost:${port}`));
