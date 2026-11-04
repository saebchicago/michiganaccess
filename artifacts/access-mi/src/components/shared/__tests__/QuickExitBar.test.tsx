import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import QuickExitBar from "@/components/shared/QuickExitBar";

describe("QuickExitBar", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.style.visibility = "";
  });

  it("focused Quick Exit button activates through its click handler", () => {
    const replaceSpy = vi.fn();
    vi.stubGlobal("location", { replace: replaceSpy });

    const { getByRole } = render(<QuickExitBar />);
    const button = getByRole("button", { name: /quick exit/i });
    button.focus();
    fireEvent.click(button);

    expect(replaceSpy).toHaveBeenCalledWith("https://www.weather.com");
  });

  it("Escape is available for dismissing dialogs", () => {
    const replaceSpy = vi.fn();
    vi.stubGlobal("location", { replace: replaceSpy });

    render(<QuickExitBar />);
    fireEvent.keyDown(window, { key: "Escape" });

    expect(replaceSpy).not.toHaveBeenCalled();
  });
});
