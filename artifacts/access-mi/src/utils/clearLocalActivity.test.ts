import { describe, expect, it, beforeEach } from "vitest";
import { clearLocalActivity, KEEP_KEYS } from "@/utils/clearLocalActivity";

describe("clearLocalActivity", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("removes the activity trail a visitor would not want another person to find", () => {
    localStorage.setItem("mi-recent-searches", JSON.stringify(["domestic violence shelter"]));
    localStorage.setItem("mi-browsing-history", JSON.stringify([{ path: "/behavioral-health" }]));
    localStorage.setItem("am_user_zip", "48226");
    localStorage.setItem("michigan-access-county", "Wayne");
    localStorage.setItem("mi-access-eligibility", JSON.stringify({ income: 21000 }));
    localStorage.setItem("mi-access-checklist", JSON.stringify(["shelter"]));

    const { removed } = clearLocalActivity();

    expect(removed).toBe(6);
    expect(localStorage.getItem("mi-recent-searches")).toBeNull();
    expect(localStorage.getItem("mi-browsing-history")).toBeNull();
    expect(localStorage.getItem("am_user_zip")).toBeNull();
    expect(localStorage.getItem("michigan-access-county")).toBeNull();
    expect(localStorage.getItem("mi-access-eligibility")).toBeNull();
    expect(localStorage.getItem("mi-access-checklist")).toBeNull();
  });

  it("keeps display preferences so clearing does not undo an accessibility setup", () => {
    for (const key of KEEP_KEYS) localStorage.setItem(key, "x");

    const { removed, kept } = clearLocalActivity();

    expect(removed).toBe(0);
    expect(kept.sort()).toEqual([...KEEP_KEYS].sort());
    for (const key of KEEP_KEYS) expect(localStorage.getItem(key)).toBe("x");
  });

  // Deny-by-default is the point: a key nobody thought about at review time
  // must still be cleared, because the alternative is a trail that outlives
  // Quick Exit.
  it("removes keys it has never heard of", () => {
    localStorage.setItem("some-feature-added-next-year", "sensitive");

    clearLocalActivity();

    expect(localStorage.getItem("some-feature-added-next-year")).toBeNull();
  });

  it("clears sessionStorage too", () => {
    sessionStorage.setItem("in-flight", "value");
    clearLocalActivity();
    expect(sessionStorage.getItem("in-flight")).toBeNull();
  });
});
