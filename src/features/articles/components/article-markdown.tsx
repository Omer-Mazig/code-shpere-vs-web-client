import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { cn } from "@/lib/utils";
import { toSafeMarkdownUrl } from "../article-body";

type ArticleMarkdownProps = {
  markdown: string;
  className?: string;
};

export const ArticleMarkdown = ({
  markdown,
  className,
}: ArticleMarkdownProps) => {
  const source = markdown.trim();
  if (!source) {
    return null;
  }

  return (
    <div className={cn("article-md", className)}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        urlTransform={toSafeMarkdownUrl}
        components={{
          h1: ({ children }) => (
            <h2 className="mt-10 mb-4 text-3xl font-bold tracking-tight first:mt-0">
              {children}
            </h2>
          ),
          h2: ({ children }) => (
            <h2 className="mt-10 mb-3 text-2xl font-semibold tracking-tight first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-8 mb-2 text-xl font-semibold tracking-tight first:mt-0">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-4 text-base leading-7 last:mb-0">{children}</p>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="font-medium text-primary underline-offset-4 hover:underline"
              {...(href?.startsWith("http")
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {children}
            </a>
          ),
          ul: ({ children }) => (
            <ul className="mb-4 list-disc space-y-1 pl-6 last:mb-0">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 list-decimal space-y-1 pl-6 last:mb-0">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-7 [&>p]:mb-0">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="mb-4 border-l-2 border-primary/40 pl-4 text-muted-foreground italic last:mb-0">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-8 border-border" />,
          img: ({ src, alt }) =>
            src ? (
              <img
                src={src}
                alt={alt ?? ""}
                className="my-6 max-h-[28rem] w-full rounded-lg object-cover"
              />
            ) : null,
          pre: ({ children }) => (
            <pre className="mb-4 overflow-x-auto rounded-lg bg-muted p-4 text-[13px] leading-6 last:mb-0">
              {children}
            </pre>
          ),
          code: ({ className: codeClassName, children }) => {
            const isBlock = Boolean(codeClassName?.includes("language-"));
            if (isBlock) {
              return (
                <code className={cn("font-mono", codeClassName)}>
                  {children}
                </code>
              );
            }
            return (
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em]">
                {children}
              </code>
            );
          },
          table: ({ children }) => (
            <div className="mb-4 overflow-x-auto last:mb-0">
              <table className="w-full border-collapse text-sm">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-b px-3 py-2 text-left font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b px-3 py-2 align-top">{children}</td>
          ),
        }}
      >
        {source}
      </Markdown>
    </div>
  );
};
