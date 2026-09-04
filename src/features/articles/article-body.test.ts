import { describe, expect, it } from "vitest";
import {
  countMarkdownWords,
  estimateReadTimeMinutes,
  excerptFromMarkdown,
  insertMarkdownImage,
  toSafeMarkdownUrl,
} from "./article-body";

describe("excerptFromMarkdown", () => {
  it("strips headings, fences, and emphasis for a card blurb", () => {
    expect(
      excerptFromMarkdown(
        "## Hello\n\n```ts\nconst x = 1;\n```\n\nA **practical** guide to [generics](https://example.com).",
      ),
    ).toBe("Hello A practical guide to generics.");
  });

  it("truncates long copy", () => {
    const excerpt = excerptFromMarkdown("word ".repeat(80), 40);
    expect(excerpt.endsWith("…")).toBe(true);
    expect(excerpt.length).toBeLessThanOrEqual(41);
  });
});

describe("estimateReadTimeMinutes", () => {
  it("is at least one minute", () => {
    expect(estimateReadTimeMinutes("short")).toBe(1);
  });
});

describe("countMarkdownWords", () => {
  it("counts words", () => {
    expect(countMarkdownWords("one two three")).toBe(3);
  });
});

describe("insertMarkdownImage", () => {
  it("wraps the selection as alt text", () => {
    expect(insertMarkdownImage("see diagram here", 4, 11, "/api/media/abc")).toEqual({
      next: "see ![diagram](/api/media/abc) here",
      cursor: 30,
    });
  });

  it("uses a default alt when nothing is selected", () => {
    expect(insertMarkdownImage("ab", 1, 1, "/api/media/x")).toEqual({
      next: "a![image](/api/media/x)b",
      cursor: 23,
    });
  });
});

describe("toSafeMarkdownUrl", () => {
  it("allows http(s), mailto, root-relative, and hash urls", () => {
    expect(toSafeMarkdownUrl("https://example.com/a")).toBe(
      "https://example.com/a",
    );
    expect(toSafeMarkdownUrl("mailto:dev@example.com")).toBe(
      "mailto:dev@example.com",
    );
    expect(toSafeMarkdownUrl("/articles/slug")).toBe("/articles/slug");
    expect(toSafeMarkdownUrl("#section")).toBe("#section");
  });

  it("rejects javascript and data urls", () => {
    expect(toSafeMarkdownUrl("javascript:alert(1)")).toBe("");
    expect(toSafeMarkdownUrl("data:text/html,hi")).toBe("");
  });
});
