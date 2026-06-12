import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import QuickExitBar from "@/components/shared/QuickExitBar";

describe("QuickExitBar", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.style.visibility = "";
  });

  it("QuickExitBar ESC keydown triggers the exit handler", () => {
    const replaceSpy = vi.fn();
    vi.stubGlobal("location", { replace: replaceSpy });

    render(<QuickExitBar />);
    fireEvent.keyDown(window, { key: "Escape" });

    expect(replaceSpy).toHaveBeenCalledWith("https://www.weather.com");
  });

  it("QuickExitBar non-Escape keydown does not trigger exit", () => {
    const replaceSpy = vi.fn();
    vi.stubGlobal("location", { replace: replaceSpy });

    render(<QuickExitBar />);
    fireEvent.keyDown(window, { key: "Enter" });

    expect(replaceSpy).not.toHaveBeenCalled();
  });
});
