import { describe, it, expect } from "vitest";
import {
  ESTIMATE_CODES,
  MOE_CODES,
  parseAcsEstimate,
  parseAcsMoe,
} from "../censusValue";

describe("parseAcsEstimate", () => {
  it.each(ESTIMATE_CODES)("sentinel %i becomes null with a reason", (code) => {
    for (const raw of [String(code), code]) {
      const r = parseAcsEstimate(raw);
      expect(r.value).toBeNull();
      expect(r.note).toBeTruthy();
    }
  });

  it("keeps suppressed, not applicable and missing as distinct outcomes", () => {
    const suppressed = parseAcsEstimate("-666666666");
    const na = parseAcsEstimate("-888888888");
    const missing = parseAcsEstimate("-999999999");
    expect(suppressed.outcome).toBe("suppressed");
    expect(na.outcome).toBe("not-applicable");
    expect(missing.outcome).toBe("missing");
    expect(new Set([suppressed.note, na.note, missing.note]).size).toBe(3);
  });

  it("treats empty, null and non-numeric cells as missing, not zero", () => {
    for (const raw of ["", "null", null, undefined, "abc", "NaN"]) {
      const r = parseAcsEstimate(raw);
      expect(r.value).toBeNull();
      expect(r.outcome).toBe("missing");
    }
  });

  it("returns a real zero as 0 with no note", () => {
    expect(parseAcsEstimate("0")).toEqual({ value: 0, outcome: "zero" });
  });

  it("returns a normal value unchanged", () => {
    expect(parseAcsEstimate("48562")).toEqual({ value: 48562, outcome: "value" });
    expect(parseAcsEstimate("12.5").value).toBe(12.5);
  });

  it("never returns an unrecognized negative as a value", () => {
    expect(parseAcsEstimate("-12345").value).toBeNull();
  });
});

describe("parseAcsMoe", () => {
  it.each(MOE_CODES)("MOE sentinel %i becomes null", (code) => {
    expect(parseAcsMoe(String(code))).toBeNull();
  });

  it("-555555555 means controlled, MOE 0", () => {
    expect(parseAcsMoe("-555555555")).toBe(0);
  });

  it("estimate sentinels in a MOE column are not usable margins", () => {
    for (const code of ESTIMATE_CODES) expect(parseAcsMoe(String(code))).toBeNull();
  });

  it("handles empty, null and normal values", () => {
    expect(parseAcsMoe("")).toBeNull();
    expect(parseAcsMoe("null")).toBeNull();
    expect(parseAcsMoe("0")).toBe(0);
    expect(parseAcsMoe("1234")).toBe(1234);
  });
});
