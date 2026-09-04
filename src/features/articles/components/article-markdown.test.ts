import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ArticleMarkdown } from "./article-markdown";

describe("ArticleMarkdown", () => {
  it("renders headings, lists, and fenced code", () => {
    const html = renderToStaticMarkup(
      createElement(ArticleMarkdown, {
        markdown: "## Why\n\n- one\n- two\n\n```ts\nconst n = 1;\n```",
      }),
    );

    expect(html).toContain("Why");
    expect(html).toContain("<li");
    expect(html).toContain("const n = 1;");
    expect(html).toContain("<pre");
  });

  it("does not emit raw script tags or javascript urls", () => {
    const html = renderToStaticMarkup(
      createElement(ArticleMarkdown, {
        markdown:
          "<script>alert(1)</script>\n\n[xss](javascript:alert(1))\n\n[ok](https://example.com)",
      }),
    );

    expect(html.toLowerCase()).not.toContain("<script");
    expect(html.toLowerCase()).not.toContain("javascript:");
    expect(html).toContain("https://example.com");
  });

  it("keeps uploaded media paths on images", () => {
    const html = renderToStaticMarkup(
      createElement(ArticleMarkdown, {
        markdown:
          "![diagram](/api/media/550e8400-e29b-41d4-a716-446655440000)",
      }),
    );

    expect(html).toContain(
      'src="/api/media/550e8400-e29b-41d4-a716-446655440000"',
    );
    expect(html).toContain('alt="diagram"');
  });
});
