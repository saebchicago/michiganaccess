import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import SisterProjectLinks, { sisterHref } from "../SisterProjectLinks";

describe("SisterProjectLinks", () => {
  it("builds URLs from the relatedProjects registry", () => {
    expect(sisterHref({ project: "ConditionMap", path: "/conditions", label: "x", why: "y" })).toBe(
      "https://conditionmap.com/conditions",
    );
    expect(sisterHref({ project: "Values in Care", path: "/eol-care", label: "x", why: "y" })).toBe(
      "https://valuesincare.com/eol-care",
    );
  });

  it("discloses shared authorship", () => {
    render(
      <SisterProjectLinks
        links={[{ project: "ConditionMap", path: "/conditions", label: "Conditions", why: "Evidence." }]}
      />,
    );
    expect(screen.getByText(/Same independent builder/)).toBeTruthy();
    expect(screen.getByRole("link").getAttribute("rel")).toContain("noopener");
  });
});
