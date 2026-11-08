import { describe, expect, it } from "vitest";
import {
  CLOSURE_WATCH_FALLBACK,
  isOccurredServiceLoss,
} from "../closureWatchFallback";

// Regression tests from the 2026-11-08 readiness audit: record verification
// and event occurrence are different things, and ownership change is not
// service loss.
describe("Closure Watch event model", () => {
  it("every entry carries an event status", () => {
    for (const e of CLOSURE_WATCH_FALLBACK) expect(e.eventStatus).toBeTruthy();
  });

  it("no entry dated after its last verification is marked occurred", () => {
    for (const e of CLOSURE_WATCH_FALLBACK) {
      if (e.closureDate > e.asOf) {
        expect(e.eventStatus, e.id).not.toBe("occurred");
      }
    }
  });

  it("non-occurred events explain what is unverified", () => {
    for (const e of CLOSURE_WATCH_FALLBACK.filter((x) => x.eventStatus !== "occurred")) {
      expect(e.occurrenceNote, e.id).toBeTruthy();
    }
  });

  it("mergers and conversions never count as service loss", () => {
    for (const e of CLOSURE_WATCH_FALLBACK) {
      if (e.closureType === "merger" || e.closureType === "conversion") {
        expect(isOccurredServiceLoss(e), e.id).toBe(false);
      }
    }
  });

  it("Grayling OB is an announced event, not a completed closure", () => {
    const g = CLOSURE_WATCH_FALLBACK.find((e) => e.id === "munson-grayling-ob-announced-2023");
    expect(g?.eventStatus).toBe("announced");
    expect(isOccurredServiceLoss(g!)).toBe(false);
  });

  it("facility name matches the facility city (Tawas, not West Branch)", () => {
    const t = CLOSURE_WATCH_FALLBACK.find((e) => e.id === "ascension-mymichigan-tawas-transfer-2024");
    expect(t?.city).toBe("Tawas City");
    expect(t?.facilityName).toMatch(/Tawas$/);
    expect(t?.facilityName).not.toMatch(/West Branch/);
  });
});
