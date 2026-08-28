#!/usr/bin/env node
/**
 * Normalize built structured data so AccessMI is represented as an independent
 * civic-intelligence project rather than as a government service or a legal
 * organization. This runs after prerendering because county prerender metadata
 * historically emitted GovernmentService JSON-LD.
 *
 * The guard at the end fails the build if an Access Michigan GovernmentService
 * provider survives normalization, preventing a silent institutional-identity
 * regression in deploy output.
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..");
const distDir = path.join(projectRoot, "dist");
const homePath = path.join(distDir, "index.html");

const SITE_URL = "https://accessmi.org";
const PROJECT_DESCRIPTION =
  "Independent Michigan civic-intelligence project and public-data journal; not a government agency, health system, benefits administrator, or 211 provider.";
const HOME_TITLE = "AccessMI - Civic intelligence for every Michigan community";
const HOME_DESCRIPTION =
  "AccessMI is an independent Michigan civic-intelligence project and public-data journal organizing sourced local data and service-navigation context across all 83 counties.";

const creator = {
  "@type": "Person",
  name: "Saeb A. Ahsan",
  url: "https://michigans.me",
};

const website = {
  "@type": "WebSite",
  name: "Access Michigan",
  url: SITE_URL,
};

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function setMeta(html, attribute, key, content) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(
    `<meta\\s+${attribute}=["']${escapedKey}["'][^>]*>`,
    "i",
  );
  const replacement = `<meta ${attribute}="${key}" content="${escapeAttr(content)}" />`;
  return re.test(html)
    ? html.replace(re, replacement)
    : html.replace(/<\/head>/i, `  ${replacement}\n  </head>`);
}

function normalizeNode(node, counters) {
  if (!node || typeof node !== "object" || Array.isArray(node)) return node;

  if (
    node["@type"] === "GovernmentService" &&
    node.provider?.name === "Access Michigan"
  ) {
    counters.governmentService += 1;
    return {
      "@context": node["@context"] ?? "https://schema.org",
      "@type": "WebPage",
      name: node.name,
      ...(node.url ? { url: node.url } : {}),
      ...(node.serviceArea ? { about: node.serviceArea } : {}),
      isPartOf: website,
      creator,
      disambiguatingDescription: PROJECT_DESCRIPTION,
    };
  }

  if (node["@type"] === "WebSite" && node.name === "Access Michigan") {
    counters.website += 1;
    const normalized = { ...node };
    delete normalized.publisher;
    normalized.creator = creator;
    normalized.description = HOME_DESCRIPTION;
    normalized.disambiguatingDescription = PROJECT_DESCRIPTION;
    return normalized;
  }

  if (
    node["@type"] === "Dataset" &&
    node.creator?.name === "Access Michigan"
  ) {
    counters.dataset += 1;
    return {
      ...node,
      creator,
      isPartOf: website,
    };
  }

  return node;
}

function normalizeJsonLd(html, counters) {
  return html.replace(
    /<script([^>]*\btype=["']application\/ld\+json["'][^>]*)>([\s\S]*?)<\/script>/gi,
    (full, attrs, raw) => {
      try {
        const parsed = JSON.parse(raw.trim());
        const normalized = Array.isArray(parsed)
          ? parsed.map((node) => normalizeNode(node, counters))
          : normalizeNode(parsed, counters);
        return `<script${attrs}>\n${JSON.stringify(normalized, null, 2)}\n    </script>`;
      } catch {
        return full;
      }
    },
  );
}

function containsMisclassifiedAccessMiGovernmentService(html) {
  const scripts = html.match(
    /<script[^>]*\btype=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi,
  );
  if (!scripts) return false;

  return scripts.some((script) => {
    const raw = script
      .replace(/^<script[^>]*>/i, "")
      .replace(/<\/script>$/i, "")
      .trim();
    try {
      const parsed = JSON.parse(raw);
      const nodes = Array.isArray(parsed) ? parsed : [parsed];
      return nodes.some(
        (node) =>
          node?.["@type"] === "GovernmentService" &&
          node?.provider?.name === "Access Michigan",
      );
    } catch {
      return false;
    }
  });
}

async function collectHtmlFiles(dir, files = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await collectHtmlFiles(full, files);
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(full);
    }
  }
  return files;
}

async function main() {
  const files = await collectHtmlFiles(distDir);
  const counters = { governmentService: 0, website: 0, dataset: 0 };
  const violations = [];
  let changed = 0;

  for (const file of files) {
    const original = await readFile(file, "utf8");
    let html = normalizeJsonLd(original, counters);

    if (file === homePath) {
      html = html.replace(
        /<title>[\s\S]*?<\/title>/i,
        `<title>${HOME_TITLE}</title>`,
      );
      html = setMeta(html, "name", "description", HOME_DESCRIPTION);
      html = setMeta(
        html,
        "property",
        "og:title",
        "Access Michigan: independent civic intelligence for Michigan",
      );
      html = setMeta(html, "property", "og:description", HOME_DESCRIPTION);
      html = setMeta(
        html,
        "name",
        "twitter:title",
        "Access Michigan: independent civic intelligence for Michigan",
      );
      html = setMeta(html, "name", "twitter:description", HOME_DESCRIPTION);
    }

    if (containsMisclassifiedAccessMiGovernmentService(html)) {
      violations.push(path.relative(distDir, file));
    }

    if (html !== original) {
      await writeFile(file, html, "utf8");
      changed += 1;
    }
  }

  if (violations.length > 0) {
    console.error(
      `[normalize-project-schema] FAIL - AccessMI is still emitted as a GovernmentService in: ${violations.join(", ")}`,
    );
    process.exit(1);
  }

  console.log(
    `[normalize-project-schema] ok - ${changed} HTML file(s) normalized; ` +
      `${counters.governmentService} AccessMI GovernmentService block(s) converted; ` +
      `${counters.website} WebSite and ${counters.dataset} Dataset identity block(s) normalized.`,
  );
}

main().catch((error) => {
  console.error("[normalize-project-schema] failed:", error);
  process.exit(1);
});
