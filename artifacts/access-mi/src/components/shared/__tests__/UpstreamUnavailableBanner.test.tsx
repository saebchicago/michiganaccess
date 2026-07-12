import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { UpstreamUnavailableBanner } from "@/components/shared/UpstreamUnavailableBanner";
import { getSourceHealth } from "@/data/sourceHealth";

vi.mock("@/data/sourceHealth", () => ({
  getSourceHealth: vi.fn(),
}));

const mockGetSourceHealth = vi.mocked(getSourceHealth);

describe("UpstreamUnavailableBanner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing when the source has no recorded health", () => {
    mockGetSourceHealth.mockReturnValue(null);
    const { container } = render(
      <UpstreamUnavailableBanner sourceId="unwired-source" />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when no sourceId is given", () => {
    const { container } = render(<UpstreamUnavailableBanner sourceId={undefined} />);
    expect(container).toBeEmptyDOMElement();
    expect(mockGetSourceHealth).not.toHaveBeenCalled();
  });

  it("renders nothing when the source's latest attempt was valid", () => {
    mockGetSourceHealth.mockReturnValue({
      latest_valid: true,
      latest_retrieved_at: "2026-06-01T00:00:00.000Z",
      last_valid_retrieved_at: "2026-06-01T00:00:00.000Z",
      invalid_reason: null,
    });
    const { container } = render(
      <UpstreamUnavailableBanner sourceId="healthy-source" />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the exact owner-decided copy when the latest attempt failed", () => {
    mockGetSourceHealth.mockReturnValue({
      latest_valid: false,
      latest_retrieved_at: "2026-06-15T00:00:00.000Z",
      last_valid_retrieved_at: "2026-05-01T00:00:00.000Z",
      invalid_reason: "HTTP 403",
    });
    render(<UpstreamUnavailableBanner sourceId="unhealthy-source" />);
    expect(
      screen.getByText(
        /Upstream source unavailable as of June 15, 2026\. Displaying last verified snapshot from May 1, 2026\./,
      ),
    ).toBeInTheDocument();
  });

  it("falls back to a no-snapshot note when there is no prior valid attempt", () => {
    mockGetSourceHealth.mockReturnValue({
      latest_valid: false,
      latest_retrieved_at: "2026-06-15T00:00:00.000Z",
      last_valid_retrieved_at: null,
      invalid_reason: "HTTP 403",
    });
    render(<UpstreamUnavailableBanner sourceId="never-valid-source" />);
    expect(
      screen.getByText(/No previously verified snapshot is available/),
    ).toBeInTheDocument();
  });

  it("has role=status for assistive technology", () => {
    mockGetSourceHealth.mockReturnValue({
      latest_valid: false,
      latest_retrieved_at: "2026-06-15T00:00:00.000Z",
      last_valid_retrieved_at: "2026-05-01T00:00:00.000Z",
      invalid_reason: "HTTP 403",
    });
    render(<UpstreamUnavailableBanner sourceId="unhealthy-source" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("compact mode renders the same copy in the compact layout", () => {
    mockGetSourceHealth.mockReturnValue({
      latest_valid: false,
      latest_retrieved_at: "2026-06-15T00:00:00.000Z",
      last_valid_retrieved_at: "2026-05-01T00:00:00.000Z",
      invalid_reason: "HTTP 403",
    });
    render(<UpstreamUnavailableBanner sourceId="unhealthy-source" compact />);
    expect(
      screen.getByText(/Upstream source unavailable as of June 15, 2026/),
    ).toBeInTheDocument();
  });
});
