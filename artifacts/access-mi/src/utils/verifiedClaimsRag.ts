/**
 * Lightweight RAG over verified platform claims (UC8 Phase 1).
 * Searches sourceManifest, causal pathways, pillar datasets, and cohort metrics.
 * No external embeddings - keyword overlap scoring only.
 */

import { SOURCE_MANIFEST, type VerifiedClaim } from "@/data/sourceManifest";
import { CAUSAL_PATHWAYS } from "@/data/causalPathways";
import { ALL_PILLAR_DATASETS } from "@/data/pillarRegistry";
import { COHORT_METRIC_META } from "@/utils/cohortResolver";

export interface RagMatch {
  id: string;
  text: string;
  source: string;
  url?: string;
  verified: boolean;
  score: number;
  category: "claim" | "pathway" | "dataset" | "metric";
}

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "is",
  "are",
  "was",
  "were",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "and",
  "or",
  "with",
  "what",
  "how",
  "why",
  "when",
  "where",
  "who",
  "which",
  "michigan",
  "mi",
  "county",
  "zip",
  "show",
  "me",
  "about",
  "tell",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP_WORDS.has(t));
}

function scoreTokens(queryTokens: string[], corpus: string): number {
  if (queryTokens.length === 0) return 0;
  const corpusLower = corpus.toLowerCase();
  let hits = 0;
  for (const t of queryTokens) {
    if (corpusLower.includes(t)) hits++;
  }
  return hits / queryTokens.length;
}

function claimMatches(query: string): RagMatch[] {
  const tokens = tokenize(query);
  return SOURCE_MANIFEST.map((c: VerifiedClaim, i) => {
    const text = `${c.context}: ${c.value} (${c.source})`;
    const score = scoreTokens(tokens, `${c.context} ${c.value} ${c.source} ${c.notes ?? ""}`);
    return {
      id: `claim-${i}`,
      text,
      source: c.source,
      url: c.url,
      verified: c.verified,
      score,
      category: "claim" as const,
    };
  }).filter((m) => m.score > 0);
}

function pathwayMatches(query: string): RagMatch[] {
  const tokens = tokenize(query);
  return CAUSAL_PATHWAYS.flatMap((p) => {
    const corpus = `${p.title} ${p.summary} ${p.steps.map((s) => s.label).join(" ")}`;
    const score = scoreTokens(tokens, corpus);
    if (score <= 0) return [];
    return [
      {
        id: `pathway-${p.id}`,
        text: `${p.title}: ${p.summary}`,
        source: "AccessMI causal pathway registry",
        url: "/environment/justice",
        verified: true,
        score,
        category: "pathway" as const,
      },
    ];
  });
}

function datasetMatches(query: string): RagMatch[] {
  const tokens = tokenize(query);
  return ALL_PILLAR_DATASETS.map((d) => {
    const corpus = `${d.name} ${d.description} ${d.pillar} ${d.keyMetrics.join(" ")}`;
    const score = scoreTokens(tokens, corpus);
    return {
      id: `dataset-${d.id}`,
      text: `${d.name} (${d.status}): ${d.description}`,
      source: d.sourceUrl,
      url: d.sourceUrl,
      verified: d.status === "live",
      score,
      category: "dataset" as const,
    };
  }).filter((m) => m.score > 0);
}

function metricMatches(query: string): RagMatch[] {
  const tokens = tokenize(query);
  return Object.entries(COHORT_METRIC_META).map(([key, meta]) => {
    const score = scoreTokens(tokens, `${meta.label} ${meta.description}`);
    return {
      id: `metric-${key}`,
      text: `${meta.label}: ${meta.description}`,
      source: "AccessMI cohort metric registry",
      url: "/cohort-builder",
      verified: true,
      score,
      category: "metric" as const,
    };
  }).filter((m) => m.score > 0);
}

/**
 * Return top verified claim matches for a natural-language query.
 */
export function searchVerifiedClaims(
  query: string,
  limit = 8,
): RagMatch[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const all = [
    ...claimMatches(trimmed),
    ...pathwayMatches(trimmed),
    ...datasetMatches(trimmed),
    ...metricMatches(trimmed),
  ];

  return all
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Format matches as a prompt block for the Mistral system message.
 */
export function formatVerifiedClaimsContext(matches: RagMatch[]): string {
  if (matches.length === 0) return "";

  const lines = matches.map((m) => {
    const badge = m.verified ? "VERIFIED" : "UNVERIFIED";
    const url = m.url ? ` (${m.url})` : "";
    return `- [${badge}] ${m.text} | Source: ${m.source}${url}`;
  });

  return [
    "VERIFIED CLAIMS CONTEXT (ground answers in these only; do not invent numbers):",
    ...lines,
    "If no verified claim covers the question, say you do not have verified data and point to /data-sources or Michigan 211.",
  ].join("\n");
}

export const EXAMPLE_ACCESSMI_QUERIES = [
  "What is Michigan's infant mortality rate?",
  "How does energy burden affect health?",
  "Which ZIPs have high PM2.5 and low primary care?",
  "How many PFAS sites are in Michigan?",
  "Find ZIPs in Wayne with high pollution and uninsured rate",
];