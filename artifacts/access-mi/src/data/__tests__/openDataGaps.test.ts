import { describe, expect, it } from "vitest";
import {
  OPEN_DATA_GAPS,
  summarizeGaps,
  getGapById,
  GAP_LANE_LABELS,
  GAP_STATUS_LABELS,
} from "@/data/openDataGaps";

/**
 * The gaps registry is itself a set of factual claims about what government
 * does and does not publish - so it is held to the same standards as any
 * other data on the platform, plus the tone rules its header declares.
 */
describe("openDataGaps - structural integrity", () => {
  it("has unique ids", () => {
    const ids = OPEN_DATA_GAPS.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every entry names a holder and cites its gap claim", () => {
    for (const gap of OPEN_DATA_GAPS) {
      expect(gap.holder.trim().length, gap.id).toBeGreaterThan(0);
      expect(gap.gapSource.name.trim().length, gap.id).toBeGreaterThan(0);
    }
  });

  it("every entry either states the reason or explicitly declares none exists", () => {
    for (const gap of OPEN_DATA_GAPS) {
      expect(
        Boolean(gap.statedReason) !== Boolean(gap.noStatedReason),
        `${gap.id}: exactly one of statedReason / noStatedReason must be set`,
      ).toBe(true);
    }
  });

  it("leads every entry with what exists, not what is missing", () => {
    for (const gap of OPEN_DATA_GAPS) {
      expect(gap.whatExists.trim().length, gap.id).toBeGreaterThan(0);
      expect(gap.whatIsMissing.trim().length, gap.id).toBeGreaterThan(0);
      expect(gap.whyItMatters.trim().length, gap.id).toBeGreaterThan(0);
    }
  });

  it("every lane and status has a display label", () => {
    for (const gap of OPEN_DATA_GAPS) {
      expect(GAP_LANE_LABELS[gap.lane], gap.id).toBeDefined();
      expect(GAP_STATUS_LABELS[gap.status], gap.id).toBeDefined();
    }
  });

  it("summarize rollup matches the registry", () => {
    const s = summarizeGaps();
    expect(s.total).toBe(OPEN_DATA_GAPS.length);
    expect(s.notPublished + s.notYetIngested).toBe(s.total);
  });

  it("getGapById resolves and misses cleanly", () => {
    expect(getGapById("foia-statewide-counts")?.domain).toBe("Transparency");
    expect(getGapById("nonexistent")).toBeUndefined();
  });
});

describe("openDataGaps - honest lanes", () => {
  it("platform-side gaps say so and never blame the holder", () => {
    for (const gap of OPEN_DATA_GAPS) {
      if (gap.lane === "not-yet-ingested") {
        // The lane whose gap is OURS must say so in its stated reason.
        expect(gap.statedReason, gap.id).toMatch(/our gap/i);
      }
    }
  });

  it("suppression entries acknowledge the privacy rationale", () => {
    for (const gap of OPEN_DATA_GAPS) {
      if (gap.status === "suppressed-small-cells") {
        expect(
          `${gap.statedReason} ${gap.whyItMatters}`,
          `${gap.id}: suppression must be framed as protective, not as withholding`,
        ).toMatch(/privacy|protect|mislead/i);
      }
    }
  });
});

describe("openDataGaps - non-political tone (banned blame language)", () => {
  // Same mechanism as the SNAP pages' banned-language tests: the constraint
  // is enforced, not aspirational. These words convert a documented gap into
  // an accusation - the fastest way for a neutral transparency feature to
  // become a political one.
  const BANNED =
    /\b(refus\w*|hid(?:e|es|ing|den)|cover[- ]?up|conceal\w*|corrupt\w*|scandal\w*|incompeten\w*|negligen\w*|fail(?:ure|ing|ed)? to\b|stonewall\w*|obstruct\w*|blame\w*)\b/i;

  it("no entry uses blame language in any rendered field", () => {
    for (const gap of OPEN_DATA_GAPS) {
      const text = [
        gap.title,
        gap.whatExists,
        gap.whatIsMissing,
        gap.holder,
        gap.statedReason ?? "",
        gap.whyItMatters,
        gap.gapSource.name,
        gap.action?.label ?? "",
      ].join(" ");
      const match = text.match(BANNED);
      expect(
        match,
        `${gap.id}: banned blame term ${JSON.stringify(match?.[0])}`,
      ).toBeNull();
    }
  });
});

describe("openDataGaps - actions resolve", () => {
  it("every action href is an internal route or absolute URL", () => {
    for (const gap of OPEN_DATA_GAPS) {
      if (!gap.action) continue;
      expect(
        gap.action.href.startsWith("/") ||
          gap.action.href.startsWith("https://"),
        `${gap.id}: ${gap.action.href}`,
      ).toBe(true);
    }
  });
});
