export const ARTICLE_CONTENT_MAX_LENGTH = 100_000;

const WORDS_PER_MINUTE = 200;

const SAFE_MARKDOWN_URL = /^(https?:|mailto:|\/|#)/i;

export function toSafeMarkdownUrl(url: string): string {
  const trimmed = url.trim();
  return SAFE_MARKDOWN_URL.test(trimmed) ? trimmed : "";
}

export function excerptFromMarkdown(
  markdown: string,
  maxChars = 180,
): string {
  const withoutFences = markdown.replace(/```[\s\S]*?```/g, " ");
  const withoutImages = withoutFences.replace(/!\[[^\]]*]\([^)]*\)/g, " ");
  const withoutLinks = withoutImages.replace(/\[([^\]]+)]\([^)]*\)/g, "$1");
  const plain = withoutLinks
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/[*_~`>#]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (plain.length <= maxChars) {
    return plain;
  }

  return `${plain.slice(0, maxChars).trimEnd()}…`;
}

export function estimateReadTimeMinutes(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE) || 1);
}

export function countMarkdownWords(markdown: string): number {
  return markdown.trim().split(/\s+/).filter(Boolean).length;
}

export function insertMarkdownImage(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  url: string,
): { next: string; cursor: number } {
  const selected = value.slice(selectionStart, selectionEnd).trim();
  const alt = selected || "image";
  const snippet = `![${alt}](${url})`;
  const next =
    value.slice(0, selectionStart) + snippet + value.slice(selectionEnd);
  return { next, cursor: selectionStart + snippet.length };
}
