/**
 * Regression tests for the per-route metadata bugs found in the SEO audit:
 *  - stale description/canonical/og:* leaking from the previous route
 *    (usePageMeta's cleanup only reset document.title, not the rest)
 *  - duplicate brand suffix ("X - Access Michigan - Access Michigan")
 *  - canonical/og:url trailing-slash normalization
 */
import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { buildPageTitle, usePageMeta } from "@/hooks/usePageMeta";
import { SITE_NAME, BASE_URL } from "@/config/site";

function getMeta(attr: string, key: string) {
  return document
    .querySelector(`meta[${attr}="${key}"]`)
    ?.getAttribute("content");
}

function getCanonical() {
  return document.querySelector('link[rel="canonical"]')?.getAttribute("href");
}

function Page({
  title,
  description,
  path,
}: {
  title: string;
  description?: string;
  path?: string;
}) {
  usePageMeta({ title, description, path });
  return null;
}

describe("buildPageTitle", () => {
  it("appends the brand exactly once for a plain title", () => {
    expect(buildPageTitle("Methodology")).toBe(`Methodology | ${SITE_NAME}`);
  });

  it("does not double-brand a title that already ends with ' | Access Michigan'", () => {
    const title = buildPageTitle(`Compare Places | ${SITE_NAME}`);
    expect(title).toBe(`Compare Places | ${SITE_NAME}`);
    expect(title.split(SITE_NAME)).toHaveLength(2);
  });

  it("does not double-brand a title that already ends with ' - Access Michigan'", () => {
    const title = buildPageTitle(`FEMA Disaster History - ${SITE_NAME}`);
    expect(title).toBe(`FEMA Disaster History | ${SITE_NAME}`);
    expect(title.split(SITE_NAME)).toHaveLength(2);
  });

  it("never emits both '-' and '|' brand separators", () => {
    const cases = [
      "Methodology",
      `About | ${SITE_NAME}`,
      `Compare - ${SITE_NAME}`,
      SITE_NAME,
    ];
    for (const input of cases) {
      const out = buildPageTitle(input);
      const hasPipeBrand = out.includes(` | ${SITE_NAME}`);
      const hasDashBrand = out.includes(` - ${SITE_NAME}`) && !hasPipeBrand;
      // Exactly one brand occurrence, and if branded, only the pipe form.
      expect(out.split(SITE_NAME).length - 1).toBeLessThanOrEqual(1);
      expect(hasDashBrand).toBe(false);
    }
  });

  it("leaves an exact SITE_NAME title untouched", () => {
    expect(buildPageTitle(SITE_NAME)).toBe(SITE_NAME);
  });
});

describe("usePageMeta", () => {
  afterEach(() => {
    cleanup();
  });

  it("does not leak the previous route's description/canonical into a route that omits them", () => {
    const first = render(
      <Page
        title="FEMA Disaster History"
        description="Interactive dashboard of FEMA disaster declarations."
        path="/disaster-history"
      />,
    );
    expect(getMeta("name", "description")).toBe(
      "Interactive dashboard of FEMA disaster declarations.",
    );
    expect(getCanonical()).toBe(`${BASE_URL}/disaster-history/`);

    // Simulate a client-side route change to a page that (like the real
    // HealthDataDashboardPage bug) forgets to pass description/path.
    first.unmount();
    render(<Page title="Health Data Dashboard" />);

    expect(getMeta("name", "description")).not.toBe(
      "Interactive dashboard of FEMA disaster declarations.",
    );
    expect(getCanonical()).not.toBe(`${BASE_URL}/disaster-history/`);
  });

  it("normalizes canonical/og:url to a trailing slash for non-root, non-query paths", () => {
    render(<Page title="Methodology" path="/methodology" />);
    expect(getCanonical()).toBe(`${BASE_URL}/methodology/`);
    expect(getMeta("property", "og:url")).toBe(`${BASE_URL}/methodology/`);
  });

  it("leaves the root path and query-string paths unmodified", () => {
    const root = render(<Page title={SITE_NAME} path="/" />);
    expect(getCanonical()).toBe(`${BASE_URL}/`);
    root.unmount();

    render(<Page title="Search" path="/find-care?q=dentist" />);
    expect(getCanonical()).toBe(`${BASE_URL}/find-care?q=dentist`);
  });
});
