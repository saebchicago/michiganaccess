// Every hand-typed editorial claim must have a current review record.
// See src/data/claimReview.ts for the rules this enforces.
import { existsSync, writeFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { WEEKLY_INSIGHTS } from "@/data/insights";
import { DATA_STORIES } from "@/data/data-stories";
import { SIGNALS_2026_03 } from "@/data/monthly-signals";
import { SOURCE_MANIFEST } from "@/data/sourceManifest";
import { QUESTIONS } from "@/components/tools/MichiganQuiz";
import { ROTATING_STATS } from "@/components/home/HeroSection";
import { CLAIM_REVIEWS } from "@/data/claimReviews";
import { claimFingerprint } from "@/data/claimReview";

/** key -> fingerprint of everything a reader sees for that claim. */
function renderedClaims(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of WEEKLY_INSIGHTS) {
    out[`insight:${i.week}`] = claimFingerprint([i.text, i.source, ...(i.dataPoints ?? []).flatMap((d) => [d.label, d.value, d.context])]);
  }
  for (const s of DATA_STORIES) {
    out[`story:${s.id}`] = claimFingerprint([s.title, s.hook, s.narrative, s.stat.value, s.stat.label, s.stat.suffix, s.source]);
  }
  for (const s of SIGNALS_2026_03) out[`signal:${s.id}`] = claimFingerprint([s.text, s.source, s.date]);
  QUESTIONS.forEach((q) => {
    out[`quiz:${claimFingerprint([q.q])}`] = claimFingerprint([q.q, ...q.options, q.answer, q.fact, q.source]);
  });
  ROTATING_STATS.forEach((h) => {
    out[`hero:${claimFingerprint([h.href])}`] = claimFingerprint([h.text]);
  });
  return out;
}

describe("hand-typed claim review registry", () => {
  const rendered = renderedClaims();

  // CLAIM_FP_DUMP=<file> writes the current fingerprints for a reviewer to
  // paste into claimReviews.ts after re-checking the evidence.
  if (process.env.CLAIM_FP_DUMP) writeFileSync(process.env.CLAIM_FP_DUMP, JSON.stringify(rendered, null, 2));

  it("every rendered claim has a review record with a matching fingerprint", () => {
    const problems: string[] = [];
    for (const [key, fp] of Object.entries(rendered)) {
      const review = CLAIM_REVIEWS[key];
      if (!review) problems.push(`${key}: no review record (fingerprint ${fp})`);
      else if (review.fingerprint !== fp) problems.push(`${key}: text changed since review (${review.fingerprint} -> ${fp}); re-check the evidence, then update the record`);
    }
    expect(problems).toEqual([]);
  });

  it("has no stale records for claims that no longer render", () => {
    expect(Object.keys(CLAIM_REVIEWS).filter((k) => !(k in rendered))).toEqual([]);
  });

  it("every record carries the evidence its basis requires", () => {
    const manifestValues = new Set(SOURCE_MANIFEST.filter((m) => m.verified).map((m) => m.value));
    const testsRoot = path.resolve(__dirname, "../../..");
    for (const [key, r] of Object.entries(CLAIM_REVIEWS)) {
      expect(r.checked, key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(r.evidence.length, key).toBeGreaterThan(10);
      if (r.basis === "reported" || r.basis === "law") expect(r.url, `${key}: url`).toMatch(/^https:\/\/.+\/.+/);
      if (r.basis === "dataset") expect(existsSync(path.join(testsRoot, r.test ?? "missing")), `${key}: test file ${r.test}`).toBe(true);
      if (r.basis === "manifest") expect(manifestValues.has(r.manifestValue ?? ""), `${key}: manifest value ${r.manifestValue}`).toBe(true);
    }
  });
});
