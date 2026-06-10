import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { OfficialChannelNotice } from "@/components/shared/OfficialChannelNotice";

describe("OfficialChannelNotice", () => {
  it("full variant contains the independence sentence", () => {
    render(<OfficialChannelNotice variant="full" />);
    expect(
      screen.getByText(
        /AccessMI is an independent educational resource\. It is not affiliated with the State of Michigan and cannot enroll you in any program\./i,
      ),
    ).toBeInTheDocument();
  });

  it("compact variant renders the same sentence", () => {
    render(<OfficialChannelNotice variant="compact" />);
    expect(
      screen.getByText(/AccessMI is an independent educational resource\./i),
    ).toBeInTheDocument();
  });

  it("links to newmibridges.michigan.gov", () => {
    render(<OfficialChannelNotice />);
    const link = screen.getByRole("link", {
      name: /newmibridges\.michigan\.gov/i,
    });
    expect(link).toHaveAttribute("href", "https://newmibridges.michigan.gov");
  });

  it("has role=note for assistive technology", () => {
    render(<OfficialChannelNotice />);
    expect(screen.getByRole("note")).toBeInTheDocument();
  });
});
