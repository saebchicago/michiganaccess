import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { DataProvenance } from "../DataProvenance";

const BASE_MEASURED = {
  sourceName: "USDA FNS",
  sourceUrl: "https://www.fns.usda.gov",
  asOfDate: "FY2022",
  cadence: "Annual",
  dataKind: "measured" as const,
};

const BASE_PROJECTED = {
  ...BASE_MEASURED,
  dataKind: "projected" as const,
  methodologyUrl: "https://example.com/methodology",
};

describe("DataProvenance", () => {
  it("renders measured variant without methodology link", () => {
    render(<DataProvenance {...BASE_MEASURED} />);

    expect(screen.getByText(/Most current public data/i)).toBeInTheDocument();
    expect(screen.getByText("USDA FNS")).toBeInTheDocument();
    expect(screen.queryByText(/Methodology/i)).not.toBeInTheDocument();
    // no projected label
    expect(screen.queryByText("(Projected)")).not.toBeInTheDocument();
  });

  it("renders projected variant with methodology link", () => {
    render(<DataProvenance {...BASE_PROJECTED} />);

    expect(screen.getByText(/Most current public data/i)).toBeInTheDocument();
    expect(screen.getByText("(Projected)")).toBeInTheDocument();
    const methodologyLink = screen.getByRole("link", { name: /Methodology/i });
    expect(methodologyLink).toHaveAttribute("href", "https://example.com/methodology");
  });

  it("renders modeled variant with methodology link", () => {
    render(
      <DataProvenance
        {...BASE_MEASURED}
        dataKind="modeled"
        methodologyUrl="https://example.com/methodology"
      />
    );

    expect(screen.getByText("(Modeled estimate)")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Methodology/i })).toBeInTheDocument();
  });

  it("returns null and logs error when projected without methodologyUrl", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { container } = render(
      <DataProvenance {...BASE_MEASURED} dataKind="projected" />
    );

    expect(container.firstChild).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("methodologyUrl required for projected data (USDA FNS)")
    );

    consoleSpy.mockRestore();
  });

  it("returns null and logs error when modeled without methodologyUrl", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { container } = render(
      <DataProvenance {...BASE_MEASURED} dataKind="modeled" />
    );

    expect(container.firstChild).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("methodologyUrl required for modeled data (USDA FNS)")
    );

    consoleSpy.mockRestore();
  });

  it("renders compact variant when compact prop is true", () => {
    render(<DataProvenance {...BASE_MEASURED} compact />);

    // compact uses <p> not <div>
    const el = screen.getByText(/Most current public data/i).closest("p");
    expect(el).toBeInTheDocument();
    expect(screen.getByText("USDA FNS")).toBeInTheDocument();
  });

  it("always renders 'Most current public data' string", () => {
    const variants = [
      BASE_MEASURED,
      BASE_PROJECTED,
      { ...BASE_MEASURED, dataKind: "modeled" as const, methodologyUrl: "https://example.com/m" },
    ];

    for (const props of variants) {
      const { unmount } = render(<DataProvenance {...props} />);
      expect(screen.getByText(/Most current public data/i)).toBeInTheDocument();
      unmount();
    }
  });

  it("source link points to sourceUrl", () => {
    render(<DataProvenance {...BASE_MEASURED} />);
    const link = screen.getByRole("link", { name: /USDA FNS/i });
    expect(link).toHaveAttribute("href", "https://www.fns.usda.gov");
    expect(link).toHaveAttribute("target", "_blank");
  });
});
