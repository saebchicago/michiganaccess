import { describe, expect, it } from "vitest";
import data from "@/config/relatedProjects.json";
import { BUILT_BY, OTHER_PROJECTS } from "@/config/relatedProjects";
// @ts-expect-error plain .mjs build helper, no type declarations
import { buildArticle } from "../../../scripts/lib/prerender-body.mjs";

describe("related projects", () => {
  it("never links Access Michigan to itself", () => {
    expect(OTHER_PROJECTS.map((p) => p.url)).not.toContain(data.self);
  });

  it("links every sibling project and the builder page", () => {
    expect(OTHER_PROJECTS).toHaveLength(data.projects.length - 1);
    expect(BUILT_BY.url).toBe("https://michigans.me/");
  });

  it("puts every link in each prerendered article, and none to itself", () => {
    const article: string = buildArticle({ h1: "Example", paragraphs: ["Example."] });
    for (const p of [...OTHER_PROJECTS, BUILT_BY]) {
      expect(article).toContain(`<a href="${p.url}">${p.name}</a>`);
    }
    expect(article).not.toContain(`<a href="${data.self}">Access Michigan</a>`);
  });
});
