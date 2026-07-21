import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import OnboardingTour from "@/components/shared/OnboardingTour";

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <OnboardingTour />
    </MemoryRouter>,
  );
}

describe("OnboardingTour launch gating", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  it("launches on a first visit to the homepage", () => {
    renderAt("/");
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(
      screen.getByRole("dialog", { name: /onboarding tour/i }),
    ).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("does NOT launch when the first visit lands on a deep link", () => {
    renderAt("/about");
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(
      screen.queryByRole("dialog", { name: /onboarding tour/i }),
    ).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it("does not relaunch once seen", () => {
    localStorage.setItem("accessmi_tour_seen", "true");
    renderAt("/");
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(
      screen.queryByRole("dialog", { name: /onboarding tour/i }),
    ).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it("honors the ?tour=true contract even after the tour was seen", () => {
    localStorage.setItem("accessmi_tour_seen", "true");
    renderAt("/?tour=true");
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(
      screen.getByRole("dialog", { name: /onboarding tour/i }),
    ).toBeInTheDocument();
    vi.useRealTimers();
  });
});
