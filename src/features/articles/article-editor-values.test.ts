import { describe, expect, it } from "vitest";
import {
  hasArticleEditorChanges,
  type ArticleEditorValues,
} from "./article-editor-values";

const saved: ArticleEditorValues = {
  title: "Generics",
  body: "## Intro",
  coverImageUrl: "/api/media/cover",
  topicIds: ["a", "b"],
};

describe("hasArticleEditorChanges", () => {
  it("is false for the saved snapshot", () => {
    expect(hasArticleEditorChanges({ ...saved }, saved)).toBe(false);
  });

  it("ignores topic order", () => {
    expect(
      hasArticleEditorChanges({ ...saved, topicIds: ["b", "a"] }, saved),
    ).toBe(false);
  });

  it("detects edits to every tracked field", () => {
    expect(hasArticleEditorChanges({ ...saved, title: "Generics!" }, saved)).toBe(
      true,
    );
    expect(hasArticleEditorChanges({ ...saved, body: "## Intro\n" }, saved)).toBe(
      true,
    );
    expect(hasArticleEditorChanges({ ...saved, coverImageUrl: "" }, saved)).toBe(
      true,
    );
    expect(hasArticleEditorChanges({ ...saved, topicIds: ["a"] }, saved)).toBe(
      true,
    );
  });
});
