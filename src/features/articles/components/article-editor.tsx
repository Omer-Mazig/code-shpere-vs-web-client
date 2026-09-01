import React from "react";
import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { articleEditorSchema } from "@/lib/form-schemas";
import { isFieldInvalid } from "@/lib/form";
import type { CreateArticleDto } from "../types";
import { TopicPicker } from "@/features/topics/components/topic-picker";

type ArticleEditorProps = {
  initialTitle?: string;
  initialContent?: string;
  initialCoverImageUrl?: string;
  initialTopicIds?: string[];
  onSubmit: (data: CreateArticleDto) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
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
      const contentBlocks = value.body
        .split("\n\n")
        .filter(Boolean)
        .map((block) => {
          if (block.startsWith("```")) {
            return { type: "code", content: block.replace(/```/g, "").trim() };
          }
          if (block.startsWith("# ")) {
            return { type: "heading", content: block.slice(2).trim() };
          }
          return { type: "paragraph", content: block.trim() };
        });

      onSubmit({
        title: value.title.trim(),
        content: contentBlocks,
        coverImageUrl: value.coverImageUrl.trim() || undefined,
        isPublished: publishIntentRef.current,
        topicIds: value.topicIds.length > 0 ? value.topicIds : undefined,
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
                  Cover Image URL (optional)
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
                  placeholder="Article title..."
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={invalid}
                  aria-label="Article title"
                  className="border-0 bg-transparent text-3xl font-bold focus-visible:ring-0 px-0"
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
            return (
              <Field data-invalid={invalid}>
                <Textarea
                  id={field.name}
                  name={field.name}
                  placeholder="Write your article content here... Use markdown-like formatting: ``` for code blocks, # for headings."
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={invalid}
                  aria-label="Article content"
                  rows={20}
                  className="resize-none border-0 bg-transparent text-base leading-relaxed focus-visible:ring-0 px-0"
                />
                {invalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />
      </FieldGroup>

      <form.Subscribe
        selector={(state) =>
          [state.values.title, state.values.body, state.isSubmitting] as const
        }
        children={([title, body, formSubmitting]) => {
          const disabled =
            isSubmitting ||
            formSubmitting ||
            !title.trim() ||
            !body.trim();
          return (
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => submitWithIntent(false)}
                disabled={disabled}
              >
                Save Draft
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-auto"
                disabled={disabled}
              >
                {isSubmitting || formSubmitting ? "Saving..." : submitLabel}
              </Button>
            </div>
          );
        }}
      />
    </form>
  );
};
