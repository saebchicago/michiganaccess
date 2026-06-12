import { describe, it, expect } from "vitest";
import { getCountyTrends, isUninsuredPending } from "@/data/trendSeries";
import rawData from "@/data/trendSeries.json";

// ── delta math fixtures ───────────────────────────────────────────────────────

describe("population delta math  -  fixed fixtures", () => {
  it("Saginaw: 2024 pop minus 2020 pop equals expected delta", () => {
    const t = getCountyTrends("Saginaw");
    expect(t).not.toBeNull();
    const series = t!.population.series;
    const p2020 = series.find((p) => p.vintage === 2020)!.value;
    const p2024 = series.find((p) => p.vintage === 2024)!.value;
    const delta = p2024 - p2020;
    // PEP data: Saginaw declined 2020→2024
    expect(delta).toBeLessThan(0);
    // Should be in range -10,000 to -1,000
    expect(delta).toBeGreaterThan(-10_000);
    expect(delta).toBeLessThan(-1_000);
  });

  it("Keweenaw: 2024 pop minus 2020 pop is positive (growing)", () => {
    const t = getCountyTrends("Keweenaw");
    expect(t).not.toBeNull();
    const series = t!.population.series;
    const p2020 = series.find((p) => p.vintage === 2020)!.value;
    const p2024 = series.find((p) => p.vintage === 2024)!.value;
    expect(p2024 - p2020).toBeGreaterThan(0);
  });

  it("Wayne: population values are plausible (500 < value < 2,000,000)", () => {
    const t = getCountyTrends("Wayne");
    expect(t).not.toBeNull();
    for (const p of t!.population.series) {
      expect(p.value).toBeGreaterThan(500);
      expect(p.value).toBeLessThan(2_000_000);
    }
  });
});

// ── ACS state (pending-ci or populated) ──────────────────────────────────────

describe("ACS uninsured pending-ci state", () => {
  it("Saginaw uninsuredRate is properly structured (pending or populated)", () => {
    const t = getCountyTrends("Saginaw");
    expect(t).not.toBeNull();
    const u = t!.uninsuredRate;
    if (isUninsuredPending(u)) {
      expect(u.status).toBe("pending-ci");
    } else {
      expect(u.points).toHaveLength(2);
      for (const p of u.points) {
        expect(p.value).toBeGreaterThanOrEqual(0);
        expect(p.value).toBeLessThanOrEqual(50);
      }
    }
  });

  it("pending-ci entry has a pendingReason string", () => {
    const t = getCountyTrends("Saginaw")!;
    if (isUninsuredPending(t.uninsuredRate)) {
      expect(typeof t.uninsuredRate.pendingReason).toBe("string");
      expect(t.uninsuredRate.pendingReason.length).toBeGreaterThan(10);
    }
  });

  it("pending-ci entry declares vintages array with 2 years", () => {
    const t = getCountyTrends("Keweenaw")!;
    if (isUninsuredPending(t.uninsuredRate)) {
      expect(t.uninsuredRate.vintages).toHaveLength(2);
      expect(t.uninsuredRate.vintages[0]).toBeLessThan(
        t.uninsuredRate.vintages[1],
      );
    }
  });

  it("ACS pair gap is >= 5 years (non-overlapping guarantee)", () => {
    const t = getCountyTrends("Wayne")!;
    if (isUninsuredPending(t.uninsuredRate)) {
      const [v1, v2] = t.uninsuredRate.vintages;
      expect(v2 - v1).toBeGreaterThanOrEqual(5);
    } else {
      const [p1, p2] = t.uninsuredRate.points;
      expect(p2.vintageYear - p1.vintageYear).toBeGreaterThanOrEqual(5);
    }
  });
});

// ── schema completeness ───────────────────────────────────────────────────────

describe("trendSeries.json completeness", () => {
  const counties = rawData.counties as Record<string, unknown>;

  it("has exactly 83 counties", () => {
    expect(Object.keys(counties)).toHaveLength(83);
  });

  it("every county has a population block with 5 PEP vintage points", () => {
    for (const [name, c] of Object.entries(counties)) {
      const county = c as {
        population: { series: { vintage: number; value: number }[] };
      };
      expect(
        county.population,
        `${name}: missing population block`,
      ).toBeDefined();
      expect(
        county.population.series,
        `${name}: missing population.series`,
      ).toHaveLength(5);
    }
  });

  it("every county has an uninsuredRate block (populated or pending-ci)", () => {
    for (const [name, c] of Object.entries(counties)) {
      const county = c as {
        uninsuredRate?: { status?: string; points?: unknown[] };
      };
      expect(
        county.uninsuredRate,
        `${name}: missing uninsuredRate block`,
      ).toBeDefined();
      const u = county.uninsuredRate!;
      const hasPending = u.status === "pending-ci";
      const hasPoints = Array.isArray(u.points) && u.points.length >= 2;
      expect(
        hasPending || hasPoints,
        `${name}: uninsuredRate must be pending-ci or have >= 2 points`,
      ).toBe(true);
    }
  });

  it("PEP vintages span 2020–2024 in order", () => {
    const saginaw = getCountyTrends("Saginaw")!;
    const vintages = saginaw.population.series.map((p) => p.vintage);
    expect(vintages).toEqual([2020, 2021, 2022, 2023, 2024]);
  });

  it("schema version is trendSeries.v1", () => {
    expect((rawData as { $schema: string }).$schema).toBe("trendSeries.v1");
  });
});

// ── vintage labels in output ─────────────────────────────────────────────────

describe("vintage label presence", () => {
  it("each PEP point has a numeric vintage field", () => {
    const t = getCountyTrends("Oakland")!;
    for (const p of t.population.series) {
      expect(typeof p.vintage).toBe("number");
      expect(p.vintage).toBeGreaterThanOrEqual(2020);
      expect(p.vintage).toBeLessThanOrEqual(2024);
    }
  });

  it("ACS pending-ci entry has vintages array labeling both years", () => {
    const t = getCountyTrends("Marquette")!;
    if (isUninsuredPending(t.uninsuredRate)) {
      // vintages must be [2018, 2023] or similar non-overlapping pair
      const [v1, v2] = t.uninsuredRate.vintages;
      expect(v1).toBe(2018);
      expect(v2).toBe(2023);
    }
  });
});
