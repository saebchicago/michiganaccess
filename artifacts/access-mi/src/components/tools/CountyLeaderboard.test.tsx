import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CountyLeaderboard from "@/components/tools/CountyLeaderboard";

describe("CountyLeaderboard", () => {
  it("does not offer the fabricated 'Overall Health' (life expectancy) metric", () => {
    render(<CountyLeaderboard />);
    expect(
      screen.queryByRole("option", { name: /overall health/i }),
    ).not.toBeInTheDocument();
  });

  it("does not cite the unsupported IHME/CHR life-expectancy source", () => {
    render(<CountyLeaderboard />);
    expect(screen.queryByText(/IHME/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/life expectancy from/i)).not.toBeInTheDocument();
  });

  it("still ranks counties by the real Uninsured Rate metric by default", () => {
    render(<CountyLeaderboard />);
    expect(
      screen.getByText(/ranked by uninsured rate among/i),
    ).toBeInTheDocument();
  });
});
