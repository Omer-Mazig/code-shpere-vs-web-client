import React from "react";
import { useForm } from "@tanstack/react-form";
import {
  Bold,
  Code,
  Heading2,
  Italic,
  Link as LinkIcon,
  List,
  Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { articleEditorSchema } from "@/lib/form-schemas";
import { isFieldInvalid } from "@/lib/form";
import type { CreateArticleDto } from "../types";
import { TopicPicker } from "@/features/topics/components/topic-picker";
import { ArticleMarkdown } from "./article-markdown";
import {
  ARTICLE_CONTENT_MAX_LENGTH,
  countMarkdownWords,
} from "../article-body";

const BODY_PLACEHOLDER = `Tell the story in Markdown.

## A section

- Lists, **bold**, and \`inline code\`
- Images from a URL: ![alt](https://…)

\`\`\`ts
const greeting = "hello";
\`\`\`
`;

type ArticleEditorProps = {
  initialTitle?: string;
  initialContent?: string;
  initialCoverImageUrl?: string;
  initialTopicIds?: string[];
  onSubmit: (data: CreateArticleDto) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
};

type WrapArgs = {
  prefix: string;
  suffix?: string;
  placeholder?: string;
  asLinePrefix?: boolean;
};

const applyMarkdown = (
  textarea: HTMLTextAreaElement | null,
  value: string,
  onChange: (next: string) => void,
  { prefix, suffix = prefix, placeholder = "text", asLinePrefix }: WrapArgs,
) => {
  if (!textarea) {
    onChange(`${value}${prefix}${placeholder}${suffix}`);
    return;
  }

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = value.slice(start, end) || placeholder;

  if (asLinePrefix) {
    const lineStart = value.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
    const next =
      value.slice(0, lineStart) + prefix + value.slice(lineStart);
    onChange(next);
    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = end + prefix.length;
      textarea.setSelectionRange(start + prefix.length, cursor);
    });
    return;
  }

  const next =
    value.slice(0, start) + prefix + selected + suffix + value.slice(end);
  onChange(next);
  requestAnimationFrame(() => {
    textarea.focus();
    textarea.setSelectionRange(
      start + prefix.length,
      start + prefix.length + selected.length,
    );
  });
};

export const ArticleEditor = ({
  initialTitle = "",
  initialContent = "",
  initialCoverImageUrl = "",
  initialTopicIds = [],
  onSubmit,
  isSubmitting = false,
  submitLabel = "Publish",
}: ArticleEditorProps) => {
  const publishIntentRef = React.useRef(true);
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const [mobilePane, setMobilePane] = React.useState<"write" | "preview">(
    "write",
  );

  const form = useForm({
    defaultValues: {
      title: initialTitle,
      body: initialContent,
      coverImageUrl: initialCoverImageUrl,
      topicIds: initialTopicIds as string[],
    },
    validators: {
      onSubmit: articleEditorSchema,
    },
    onSubmit: async ({ value }) => {
      onSubmit({
        title: value.title.trim(),
        content: value.body.trim(),
        coverImageUrl: value.coverImageUrl.trim() || undefined,
        isPublished: publishIntentRef.current,
        topicIds: value.topicIds,
      });
    },
  });

  const submitWithIntent = (publish: boolean) => {
    publishIntentRef.current = publish;
    form.handleSubmit();
  };

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        submitWithIntent(true);
      }}
    >
      <FieldGroup className="gap-6">
        <form.Field
          name="coverImageUrl"
          children={(field) => {
            const invalid = isFieldInvalid(field);
            return (
              <Field data-invalid={invalid}>
                <FieldLabel htmlFor={field.name}>
                  Cover image URL (optional)
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  placeholder="https://example.com/cover.jpg"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={invalid}
                />
                {invalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <form.Field
          name="title"
          children={(field) => {
            const invalid = isFieldInvalid(field);
            return (
              <Field data-invalid={invalid}>
                <Input
                  id={field.name}
                  name={field.name}
                  placeholder="Article title"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={invalid}
                  aria-label="Article title"
                  className="border-0 bg-transparent px-0 text-3xl font-bold tracking-tight focus-visible:ring-0 md:text-4xl"
                />
                {invalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <form.Field
          name="topicIds"
          children={(field) => (
            <Field>
              <FieldLabel>Topics (optional)</FieldLabel>
              <TopicPicker
                value={field.state.value}
                onChange={field.handleChange}
                disabled={isSubmitting}
              />
            </Field>
          )}
        />

        <form.Field
          name="body"
          children={(field) => {
            const invalid = isFieldInvalid(field);
            const wrap = (args: WrapArgs) =>
              applyMarkdown(
                textareaRef.current,
                field.state.value,
                field.handleChange,
                args,
              );

            const editor = (
              <Textarea
                ref={textareaRef}
                id={field.name}
                name={field.name}
                placeholder={BODY_PLACEHOLDER}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                aria-invalid={invalid}
                aria-label="Article content"
                maxLength={ARTICLE_CONTENT_MAX_LENGTH}
                className="min-h-[28rem] resize-y rounded-none border-0 bg-transparent px-4 py-3 font-mono text-sm leading-6 focus-visible:ring-0"
              />
            );

            const preview = field.state.value.trim() ? (
              <ArticleMarkdown
                markdown={field.state.value}
                className="px-4 py-3"
              />
            ) : (
              <p className="px-4 py-3 text-sm text-muted-foreground">
                The preview updates as you write.
              </p>
            );

            return (
              <Field data-invalid={invalid}>
                <FieldLabel htmlFor={field.name} className="sr-only">
                  Article content
                </FieldLabel>
                <div className="overflow-hidden rounded-xl border bg-card">
                  <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/30 px-2 py-1.5">
                    <ToolbarButton
                      label="Bold"
                      onClick={() => wrap({ prefix: "**" })}
                    >
                      <Bold />
                    </ToolbarButton>
                    <ToolbarButton
                      label="Italic"
                      onClick={() => wrap({ prefix: "_" })}
                    >
                      <Italic />
                    </ToolbarButton>
                    <ToolbarButton
                      label="Heading"
                      onClick={() =>
                        wrap({ prefix: "## ", suffix: "", asLinePrefix: true })
                      }
                    >
                      <Heading2 />
                    </ToolbarButton>
                    <Separator
                      orientation="vertical"
                      className="mx-1 h-4"
                    />
                    <ToolbarButton
                      label="List"
                      onClick={() =>
                        wrap({ prefix: "- ", suffix: "", asLinePrefix: true })
                      }
                    >
                      <List />
                    </ToolbarButton>
                    <ToolbarButton
                      label="Quote"
                      onClick={() =>
                        wrap({ prefix: "> ", suffix: "", asLinePrefix: true })
                      }
                    >
                      <Quote />
                    </ToolbarButton>
                    <ToolbarButton
                      label="Code block"
                      onClick={() =>
                        wrap({
                          prefix: "```ts\n",
                          suffix: "\n```",
                          placeholder: "code",
                        })
                      }
                    >
                      <Code />
                    </ToolbarButton>
                    <ToolbarButton
                      label="Link"
                      onClick={() =>
                        wrap({
                          prefix: "[",
                          suffix: "](https://)",
                          placeholder: "label",
                        })
                      }
                    >
                      <LinkIcon />
                    </ToolbarButton>
                  </div>

                  <Tabs
                    value={mobilePane}
                    onValueChange={(value) => {
                      if (value === "write" || value === "preview") {
                        setMobilePane(value);
                      }
                    }}
                    className="gap-0"
                  >
                    <TabsList className="w-full rounded-none border-b md:hidden">
                      <TabsTrigger value="write">Write</TabsTrigger>
                      <TabsTrigger value="preview">Preview</TabsTrigger>
                    </TabsList>
                    <div className="md:grid md:grid-cols-2">
                      <div
                        className={
                          mobilePane === "preview"
                            ? "hidden md:block md:border-r"
                            : "md:border-r"
                        }
                      >
                        {editor}
                      </div>
                      <div
                        className={
                          mobilePane === "write"
                            ? "hidden max-h-[36rem] overflow-y-auto bg-muted/15 md:block"
                            : "min-h-[28rem] max-h-[36rem] overflow-y-auto bg-muted/15 md:block"
                        }
                      >
                        {preview}
                      </div>
                    </div>
                  </Tabs>
                </div>
                {invalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />
      </FieldGroup>

      <form.Subscribe
        selector={(state) =>
          [
            state.values.title,
            state.values.body,
            state.isSubmitting,
          ] as const
        }
        children={([title, body, formSubmitting]) => {
          const disabled =
            isSubmitting ||
            formSubmitting ||
            !title.trim() ||
            !body.trim();
          const words = countMarkdownWords(body);
          return (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-center text-xs text-muted-foreground sm:text-left">
                {words} {words === 1 ? "word" : "words"}
                <span className="text-muted-foreground/70">
                  {" "}
                  · Markdown · live preview
                </span>
              </p>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => submitWithIntent(false)}
                  disabled={disabled}
                >
                  Save draft
                </Button>
                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={disabled}
                >
                  {isSubmitting || formSubmitting ? "Saving..." : submitLabel}
                </Button>
              </div>
            </div>
          );
        }}
      />
    </form>
  );
};

const ToolbarButton = ({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label={label}
        onClick={onClick}
      >
        {children}
      </Button>
    </TooltipTrigger>
    <TooltipContent>{label}</TooltipContent>
  </Tooltip>
);
