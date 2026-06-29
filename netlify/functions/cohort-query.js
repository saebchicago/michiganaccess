// netlify/functions/cohort-query.js
// Analyst cohort query API (UC8 Phase 2).
// POST { criteria: { minEjIndex?, counties?, ... } } -> { resultCount, zips[] }

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BUNDLE_PATH = resolve(__dirname, "_data/cohort-api-bundle.json");

const ALLOWED_ORIGINS = new Set([
  "https://accessmi.org",
  "https://www.accessmi.org",
  "http://localhost:5173",
  "http://localhost:4173",
]);

function getCors(event) {
  const origin = (event.headers || {}).origin || "";
  const allowedOrigin = ALLOWED_ORIGINS.has(origin)
    ? origin
    : "https://accessmi.org";
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    Vary: "Origin",
  };
}

let cachedBundle = null;

function loadBundle() {
  if (cachedBundle) return cachedBundle;
  const raw = readFileSync(BUNDLE_PATH, "utf-8");
  cachedBundle = JSON.parse(raw);
  return cachedBundle;
}

function filterProfiles(bundle, criteria) {
  const c = criteria || {};
  const hasNumeric =
    c.minEjIndex != null ||
    c.minPm25Percentile != null ||
    c.minEnergyBurdenPct != null ||
    c.minUninsuredRate != null ||
    c.minPcpRatio != null ||
    c.minPovertyRate != null;

  if (!hasNumeric) return [];

  const countySet = Array.isArray(c.counties)
    ? new Set(c.counties.map((x) => String(x).toLowerCase()))
    : null;

  return bundle.profiles.filter((p) => {
    if (countySet && !countySet.has(String(p.county).toLowerCase())) return false;
    if (c.minEjIndex != null) {
      if (p.ej_index == null || p.ej_index_integrity !== "VERIFIED") return false;
      if (p.ej_index < c.minEjIndex) return false;
    }
    if (c.minPm25Percentile != null) {
      if (p.pm25_percentile == null || p.pm25_percentile_integrity !== "VERIFIED")
        return false;
      if (p.pm25_percentile < c.minPm25Percentile) return false;
    }
    if (c.minEnergyBurdenPct != null) {
      if (p.energy_burden_pct == null || p.energy_burden_pct < c.minEnergyBurdenPct)
        return false;
    }
    if (c.minUninsuredRate != null) {
      if (p.uninsured_rate == null || p.uninsured_rate < c.minUninsuredRate) return false;
    }
    if (c.minPcpRatio != null) {
      if (p.pcp_ratio == null || p.pcp_ratio < c.minPcpRatio) return false;
    }
    if (c.minPovertyRate != null) {
      if (p.poverty_rate == null || p.poverty_rate < c.minPovertyRate) return false;
    }
    return true;
  });
}

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: getCors(event), body: "" };
  }

  if (event.httpMethod === "GET") {
    return {
      statusCode: 200,
      headers: getCors(event),
      body: JSON.stringify({
        api: "accessmi-cohort-query-v1",
        methods: ["POST"],
        docs: "https://accessmi.org/cohort-builder",
        exampleBody: { criteria: { minEjIndex: 70, counties: ["Wayne"] } },
      }),
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: getCors(event),
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const bundle = loadBundle();
    const matches = filterProfiles(bundle, body.criteria);

    return {
      statusCode: 200,
      headers: getCors(event),
      body: JSON.stringify({
        schemaVersion: "accessmi-cohort-query-v1",
        generatedAt: bundle.generatedAt,
        criteria: body.criteria ?? {},
        resultCount: matches.length,
        zips: matches,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: getCors(event),
      body: JSON.stringify({
        error: err instanceof Error ? err.message : "Cohort query failed",
      }),
    };
  }
}