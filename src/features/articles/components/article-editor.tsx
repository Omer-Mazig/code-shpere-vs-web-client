import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type ArticleEditorProps = {
  initialTitle?: string;
  initialContent?: string;
  initialCoverImageUrl?: string;
  onSubmit: (data: {
    title: string;
    content: Record<string, unknown>[];
    coverImageUrl?: string;
    isPublished: boolean;
  }) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
};

export const ArticleEditor = ({
  initialTitle = "",
  initialContent = "",
  initialCoverImageUrl = "",
  onSubmit,
  isSubmitting = false,
  submitLabel = "Publish",
}: ArticleEditorProps) => {
  const [title, setTitle] = React.useState(initialTitle);
  const [body, setBody] = React.useState(initialContent);
  const [coverImageUrl, setCoverImageUrl] = React.useState(initialCoverImageUrl);

  const handleSubmit = (publish: boolean) => {
    if (!title.trim() || !body.trim()) return;

    const contentBlocks = body
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
      title: title.trim(),
      content: contentBlocks,
      coverImageUrl: coverImageUrl.trim() || undefined,
      isPublished: publish,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="cover-image">Cover Image URL (optional)</Label>
        <Input
          id="cover-image"
          placeholder="https://example.com/cover.jpg"
          value={coverImageUrl}
          onChange={(e) => setCoverImageUrl(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Input
          placeholder="Article title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border-0 bg-transparent text-3xl font-bold focus-visible:ring-0 px-0"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Textarea
          placeholder="Write your article content here... Use markdown-like formatting: ``` for code blocks, # for headings."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={20}
          className="resize-none border-0 bg-transparent text-base leading-relaxed focus-visible:ring-0 px-0"
        />
      </div>

      <div className="flex gap-3 justify-end">
        <Button
          variant="outline"
          onClick={() => handleSubmit(false)}
          disabled={isSubmitting || !title.trim() || !body.trim()}
        >
          Save Draft
        </Button>
        <Button
          onClick={() => handleSubmit(true)}
          disabled={isSubmitting || !title.trim() || !body.trim()}
        >
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </div>
  );
};
