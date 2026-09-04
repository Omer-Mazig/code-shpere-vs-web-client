import React from "react";
import { useForm, useStore } from "@tanstack/react-form";
import { useBlocker } from "react-router-dom";
import {
  Bold,
  Code,
  Heading2,
  ImagePlus,
  Italic,
  Link as LinkIcon,
  List,
  Quote,
  Redo2,
  Undo2,
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
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  useResizableLayout,
} from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { articleEditorSchema } from "@/lib/form-schemas";
import { isFieldInvalid } from "@/lib/form";
import { getApiError } from "@/lib/errors";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import type { CreateArticleDto } from "../types";
import { TopicPicker } from "@/features/topics/components/topic-picker";
import {
  IMAGE_UPLOAD_ACCEPT,
  isAcceptedImageFile,
} from "@/features/media/media.constants";
import { useUploadMedia } from "@/features/media/hooks/use-upload-media";
import { ArticleCoverField } from "./article-cover-field";
import { ArticleLeaveDialog } from "./article-leave-dialog";
import { ArticleMarkdown } from "./article-markdown";
import {
  ARTICLE_CONTENT_MAX_LENGTH,
  applyMarkdownWrap,
  countMarkdownWords,
  insertMarkdownImage,
  type MarkdownWrap,
} from "../article-body";
import {
  canRedoBody,
  canUndoBody,
  createBodyHistory,
  recordBodySnapshot,
  redoBody,
  TYPING_COALESCE_MS,
  undoBody,
  type BodyHistory,
  type BodySnapshot,
} from "../article-body-history";
import {
  hasArticleEditorChanges,
  type ArticleEditorValues,
} from "../article-editor-values";

const BODY_PLACEHOLDER = `Tell the story in Markdown.

## A section

- Lists, **bold**, and \`inline code\`
- Images: toolbar, paste, or ![alt](/api/media/…)

\`\`\`ts
const greeting = "hello";
\`\`\`
`;

const PANE_LAYOUT_ID = "article-editor-panes";
const WRITE_PANE_ID = "write";
const PREVIEW_PANE_ID = "preview";

/** Which button started the save — it decides `isPublished` and where we go next. */
type SaveIntent = "publish" | "draft" | "leave-draft";

type ArticleEditorProps = {
  initialTitle?: string;
  initialContent?: string;
  initialCoverImageUrl?: string;
  initialTopicIds?: string[];
  /** Must reject when the save fails, otherwise the editor stops treating the work as unsaved. */
  onSubmit: (data: CreateArticleDto) => void | Promise<void>;
  /**
   * Saves a draft from the leave dialog and must not navigate — the editor
   * resumes the blocked navigation itself. Omit it for published articles: the
   * dialog then offers Discard only.
   */
  onSaveDraft?: (data: CreateArticleDto) => Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;
};

export const ArticleEditor = ({
  initialTitle = "",
  initialContent = "",
  initialCoverImageUrl = "",
  initialTopicIds = [],
  onSubmit,
  onSaveDraft,
  isSubmitting = false,
  submitLabel = "Publish",
}: ArticleEditorProps) => {
  const isMobile = useIsMobile();
  const intentRef = React.useRef<SaveIntent>("publish");
  const savingRef = React.useRef(false);
  const savedRef = React.useRef(false);
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const inlineImageInputRef = React.useRef<HTMLInputElement>(null);
  const uploadMedia = useUploadMedia();
  const [coverBusy, setCoverBusy] = React.useState(false);
  const [inlineBusy, setInlineBusy] = React.useState(false);
  const [mobilePane, setMobilePane] = React.useState<"write" | "preview">(
    "write",
  );
  const imagesBusy = coverBusy || inlineBusy || uploadMedia.isPending;

  const [savedValues, setSavedValues] = React.useState<ArticleEditorValues>(
    () => ({
      title: initialTitle,
      body: initialContent,
      coverImageUrl: initialCoverImageUrl,
      topicIds: initialTopicIds,
    }),
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
      const intent = intentRef.current;
      const save = intent === "leave-draft" ? onSaveDraft : onSubmit;
      if (!save) {
        return;
      }

      savingRef.current = true;
      try {
        await save({
          title: value.title.trim(),
          content: value.body.trim(),
          coverImageUrl: value.coverImageUrl.trim() || undefined,
          isPublished: intent === "publish",
          topicIds: value.topicIds,
        });
        setSavedValues({ ...value, topicIds: [...value.topicIds] });
        savedRef.current = true;
      } finally {
        savingRef.current = false;
      }
    },
  });

  const values = useStore(form.store, (state) => state.values);
  const formSubmitting = useStore(form.store, (state) => state.isSubmitting);
  const isSaving = isSubmitting || formSubmitting;
  const isDirty = hasArticleEditorChanges(values, savedValues);

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty &&
      !savingRef.current &&
      currentLocation.pathname !== nextLocation.pathname,
  );

  React.useEffect(() => {
    if (!isDirty) {
      return;
    }
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  /** Resolves to whether the article was actually saved. */
  const submitWithIntent = async (intent: SaveIntent) => {
    intentRef.current = intent;
    savedRef.current = false;
    try {
      await form.handleSubmit();
    } catch {
      // The caller reported the failure; leave the editor dirty so nothing is lost.
    }
    return savedRef.current;
  };

  const keepEditing = () => {
    if (blocker.state === "blocked") {
      blocker.reset();
    }
  };

  const discardAndLeave = () => {
    if (blocker.state === "blocked") {
      blocker.proceed();
    }
  };

  const saveDraftAndLeave = async () => {
    const saved = await submitWithIntent("leave-draft");
    if (blocker.state !== "blocked") {
      return;
    }
    if (saved) {
      blocker.proceed();
    } else {
      // Validation or the API refused the draft: close the dialog and stay put.
      blocker.reset();
    }
  };

  const historyRef = React.useRef<BodyHistory>(
    createBodyHistory(initialContent),
  );
  const [history, setHistory] = React.useState({
    canUndo: false,
    canRedo: false,
  });
  const lastTypedAtRef = React.useRef(0);

  const commitBody = (
    snapshot: BodySnapshot,
    source: "typing" | "command",
  ) => {
    const now = Date.now();
    const coalesce =
      source === "typing" && now - lastTypedAtRef.current < TYPING_COALESCE_MS;
    lastTypedAtRef.current = source === "typing" ? now : 0;
    historyRef.current = recordBodySnapshot(historyRef.current, snapshot, {
      coalesce,
    });
    setHistory({
      canUndo: canUndoBody(historyRef.current),
      canRedo: canRedoBody(historyRef.current),
    });
    form.setFieldValue("body", snapshot.value);
  };

  const restoreSelection = (selectionStart: number, selectionEnd: number) => {
    requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (!textarea) {
        return;
      }
      textarea.focus();
      textarea.setSelectionRange(selectionStart, selectionEnd);
    });
  };

  const runBodyCommand = (edit: BodySnapshot) => {
    commitBody(edit, "command");
    restoreSelection(edit.selectionStart, edit.selectionEnd);
  };

  const travelHistory = (next: BodyHistory) => {
    if (next === historyRef.current) {
      return;
    }
    historyRef.current = next;
    lastTypedAtRef.current = 0;
    setHistory({ canUndo: canUndoBody(next), canRedo: canRedoBody(next) });
    form.setFieldValue("body", next.present.value);
    restoreSelection(next.present.selectionStart, next.present.selectionEnd);
  };

  const bodySelection = () => {
    const value = form.state.values.body;
    const textarea = textareaRef.current;
    return {
      value,
      start: textarea?.selectionStart ?? value.length,
      end: textarea?.selectionEnd ?? value.length,
    };
  };

  const wrapBody = (wrap: MarkdownWrap) => {
    const { value, start, end } = bodySelection();
    const edit = applyMarkdownWrap(value, start, end, wrap);
    runBodyCommand({
      value: edit.next,
      selectionStart: edit.selectionStart,
      selectionEnd: edit.selectionEnd,
    });
  };

  const insertUploadedImages = async (files: File[]) => {
    const accepted = files.filter(isAcceptedImageFile);
    if (accepted.length === 0) {
      toast.error("Use a JPEG, PNG, GIF, or WebP image");
      return;
    }

    let { value: current, start, end } = bodySelection();
    setInlineBusy(true);
    try {
      for (const file of accepted) {
        try {
          const media = await uploadMedia.mutateAsync(file);
          const inserted = insertMarkdownImage(current, start, end, media.url);
          current = inserted.next;
          start = inserted.cursor;
          end = inserted.cursor;
          runBodyCommand({
            value: current,
            selectionStart: start,
            selectionEnd: end,
          });
        } catch (error) {
          toast.error(getApiError(error).message ?? "Could not upload image");
        }
      }
    } finally {
      setInlineBusy(false);
    }
  };

  const { defaultLayout, onLayoutChanged } = useResizableLayout({
    id: PANE_LAYOUT_ID,
    panelIds: [WRITE_PANE_ID, PREVIEW_PANE_ID],
  });

  const words = countMarkdownWords(values.body);
  const canSubmit =
    !isSaving && !imagesBusy && Boolean(values.title.trim() && values.body.trim());

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        void submitWithIntent("publish");
      }}
    >
      <FieldGroup className="gap-6">
        <form.Field
          name="coverImageUrl"
          children={(field) => {
            const invalid = isFieldInvalid(field);
            return (
              <ArticleCoverField
                id={field.name}
                value={field.state.value}
                invalid={invalid}
                errors={field.state.meta.errors}
                disabled={isSubmitting}
                onChange={field.handleChange}
                onBusyChange={setCoverBusy}
              />
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

            const editor = (
              <Textarea
                ref={textareaRef}
                id={field.name}
                name={field.name}
                placeholder={BODY_PLACEHOLDER}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) =>
                  commitBody(
                    {
                      value: event.target.value,
                      selectionStart: event.target.selectionStart,
                      selectionEnd: event.target.selectionEnd,
                    },
                    "typing",
                  )
                }
                onKeyDown={(event) => {
                  if (!event.metaKey && !event.ctrlKey) {
                    return;
                  }
                  const key = event.key.toLowerCase();
                  const redoShortcut =
                    key === "y" || (key === "z" && event.shiftKey);
                  if (redoShortcut) {
                    event.preventDefault();
                    travelHistory(redoBody(historyRef.current));
                    return;
                  }
                  if (key === "z") {
                    event.preventDefault();
                    travelHistory(undoBody(historyRef.current));
                  }
                }}
                onPaste={(event) => {
                  const files = Array.from(event.clipboardData.files).filter(
                    isAcceptedImageFile,
                  );
                  if (files.length === 0) {
                    return;
                  }
                  event.preventDefault();
                  void insertUploadedImages(files);
                }}
                aria-invalid={invalid}
                aria-label="Article content"
                maxLength={ARTICLE_CONTENT_MAX_LENGTH}
                className="field-sizing-fixed h-full min-h-0 overflow-y-auto rounded-none border-0 bg-transparent px-4 py-3 font-mono text-sm leading-6 focus-visible:ring-0"
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
                      onClick={() => wrapBody({ prefix: "**" })}
                    >
                      <Bold />
                    </ToolbarButton>
                    <ToolbarButton
                      label="Italic"
                      onClick={() => wrapBody({ prefix: "_" })}
                    >
                      <Italic />
                    </ToolbarButton>
                    <ToolbarButton
                      label="Heading"
                      onClick={() =>
                        wrapBody({
                          prefix: "## ",
                          suffix: "",
                          asLinePrefix: true,
                        })
                      }
                    >
                      <Heading2 />
                    </ToolbarButton>
                    <Separator orientation="vertical" className="mx-1 h-4" />
                    <ToolbarButton
                      label="List"
                      onClick={() =>
                        wrapBody({
                          prefix: "- ",
                          suffix: "",
                          asLinePrefix: true,
                        })
                      }
                    >
                      <List />
                    </ToolbarButton>
                    <ToolbarButton
                      label="Quote"
                      onClick={() =>
                        wrapBody({
                          prefix: "> ",
                          suffix: "",
                          asLinePrefix: true,
                        })
                      }
                    >
                      <Quote />
                    </ToolbarButton>
                    <ToolbarButton
                      label="Code block"
                      onClick={() =>
                        wrapBody({
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
                        wrapBody({
                          prefix: "[",
                          suffix: "](https://)",
                          placeholder: "label",
                        })
                      }
                    >
                      <LinkIcon />
                    </ToolbarButton>
                    <input
                      ref={inlineImageInputRef}
                      type="file"
                      accept={IMAGE_UPLOAD_ACCEPT}
                      multiple
                      className="sr-only"
                      disabled={isSubmitting || imagesBusy}
                      onChange={(event) => {
                        const files = Array.from(event.target.files ?? []);
                        event.target.value = "";
                        if (files.length === 0) {
                          return;
                        }
                        void insertUploadedImages(files);
                      }}
                    />
                    <ToolbarButton
                      label="Image"
                      disabled={isSubmitting || imagesBusy}
                      onClick={() => inlineImageInputRef.current?.click()}
                    >
                      <ImagePlus />
                    </ToolbarButton>
                    <Separator orientation="vertical" className="mx-1 h-4" />
                    <ToolbarButton
                      label="Undo"
                      disabled={!history.canUndo}
                      onClick={() =>
                        travelHistory(undoBody(historyRef.current))
                      }
                    >
                      <Undo2 />
                    </ToolbarButton>
                    <ToolbarButton
                      label="Redo"
                      disabled={!history.canRedo}
                      onClick={() =>
                        travelHistory(redoBody(historyRef.current))
                      }
                    >
                      <Redo2 />
                    </ToolbarButton>
                  </div>

                  {isMobile ? (
                    <Tabs
                      value={mobilePane}
                      onValueChange={(value) => {
                        if (value === "write" || value === "preview") {
                          setMobilePane(value);
                        }
                      }}
                      className="gap-0"
                    >
                      <TabsList className="w-full rounded-none border-b">
                        <TabsTrigger value="write">Write</TabsTrigger>
                        <TabsTrigger value="preview">Preview</TabsTrigger>
                      </TabsList>
                      <div className="h-120">
                        <div
                          className={cn(
                            "h-full",
                            mobilePane !== "write" && "hidden",
                          )}
                        >
                          {editor}
                        </div>
                        <div
                          className={cn(
                            "h-full overflow-y-auto bg-muted/15",
                            mobilePane !== "preview" && "hidden",
                          )}
                        >
                          {preview}
                        </div>
                      </div>
                    </Tabs>
                  ) : (
                    <div className="h-136 min-h-72 resize-y overflow-hidden">
                      <ResizablePanelGroup
                        id={PANE_LAYOUT_ID}
                        orientation="horizontal"
                        defaultLayout={defaultLayout}
                        onLayoutChanged={onLayoutChanged}
                      >
                        <ResizablePanel
                          id={WRITE_PANE_ID}
                          defaultSize="50%"
                          minSize="25%"
                        >
                          {editor}
                        </ResizablePanel>
                        <ResizableHandle withHandle />
                        <ResizablePanel
                          id={PREVIEW_PANE_ID}
                          defaultSize="50%"
                          minSize="25%"
                          className="overflow-y-auto bg-muted/15"
                        >
                          {preview}
                        </ResizablePanel>
                      </ResizablePanelGroup>
                    </div>
                  )}
                </div>
                {invalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />
      </FieldGroup>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-center text-xs text-muted-foreground sm:text-left">
          {words} {words === 1 ? "word" : "words"}
          <span className="text-muted-foreground/70">
            {" "}
            · Markdown · live preview
            {isDirty ? " · unsaved changes" : ""}
          </span>
        </p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => void submitWithIntent("draft")}
            disabled={!canSubmit}
          >
            Save draft
          </Button>
          <Button type="submit" className="w-full sm:w-auto" disabled={!canSubmit}>
            {isSaving ? "Saving..." : submitLabel}
          </Button>
        </div>
      </div>

      <ArticleLeaveDialog
        blocker={blocker}
        canSaveDraft={Boolean(onSaveDraft)}
        isSaving={isSaving}
        onKeepEditing={keepEditing}
        onDiscard={discardAndLeave}
        onSaveDraft={() => void saveDraftAndLeave()}
      />
    </form>
  );
};

const ToolbarButton = ({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label={label}
        disabled={disabled}
        onClick={onClick}
      >
        {children}
      </Button>
    </TooltipTrigger>
    <TooltipContent>{label}</TooltipContent>
  </Tooltip>
);
