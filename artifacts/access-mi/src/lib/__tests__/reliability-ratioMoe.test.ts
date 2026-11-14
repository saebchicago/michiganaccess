import { describe, it, expect } from "vitest";
import { ratioMoe, ratioOnlyMoe, getReliability } from "../reliability";

describe("ratioMoe (ACS proportion formula)", () => {
  // Worked example, ACS General Handbook style: num 450 (MOE 90) of den
  // 1,500 (MOE 120). p = 0.3. Radicand = 90^2 - 0.09 * 120^2 = 8100 - 1296
  // = 6804. MOE = sqrt(6804) / 1500 = 0.05499...
  it("matches the hand-computed proportion MOE", () => {
    expect(ratioMoe(450, 90, 1500, 120)).toBeCloseTo(Math.sqrt(6804) / 1500, 10);
    expect(ratioMoe(450, 90, 1500, 120)).toBeCloseTo(0.055, 3);
  });

  it("falls back to the ratio formula when the radicand is negative", () => {
    // p = 0.9, radicand = 10^2 - 0.81 * 200^2 < 0
    const m = ratioMoe(900, 10, 1000, 200);
    expect(m).toBeCloseTo(ratioOnlyMoe(900, 10, 1000, 200) as number, 12);
    expect(m).toBeGreaterThan(0);
  });

  it("returns null for any null input or a zero denominator", () => {
    expect(ratioMoe(null, 1, 10, 1)).toBeNull();
    expect(ratioMoe(1, null, 10, 1)).toBeNull();
    expect(ratioMoe(1, 1, null, 1)).toBeNull();
    expect(ratioMoe(1, 1, 10, null)).toBeNull();
    expect(ratioMoe(1, 1, 0, 1)).toBeNull();
  });

  it("flags a shaky percentage through getReliability", () => {
    const pct = (45 / 1500) * 100; // 3%
    const moePts = (ratioMoe(45, 60, 1500, 120) as number) * 100;
    expect(getReliability(pct, moePts).status).toBe("suppressed");
  });
});
