import React from "react";
import { useForm, useStore } from "@tanstack/react-form";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { Field, FieldError } from "@/components/ui/field";
import { UserAvatar } from "@/components/shared/user-avatar";
import type { useCreateComment } from "../hooks/use-create-comment";
import { commentsQueryOptionsFactory } from "../comments-query-options-factory";
import type { CommentMentionCandidate, CommentTargetType } from "../types";
import { getMentionContext, insertMention } from "../comment-mentions";
import { useAuth } from "@/features/auth/auth.context";
import { useViewer } from "@/features/users/hooks/use-viewer";
import { useSignInModal } from "@/features/auth/sign-in-modal.context";
import { commentSchema } from "@/lib/form-schemas";
import { isFieldInvalid } from "@/lib/form";
import { getApiError } from "@/lib/errors";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type CommentFormProps = {
  targetId: string;
  targetType: CommentTargetType;
  parentId?: string;
  onSuccess?: () => void;
  createComment: ReturnType<typeof useCreateComment>;
  setLastCreatedCommentId: (id: string | null) => void;
  setPendingParentId: (id: string | null | undefined) => void;
};

export const CommentForm = ({
  targetId,
  targetType,
  parentId,
  onSuccess,
  createComment,
  setLastCreatedCommentId,
  setPendingParentId,
}: CommentFormProps) => {
  const { user, isAuthenticated } = useAuth();
  const viewer = useViewer();
  const { open: openSignIn } = useSignInModal();
  const [cursorPosition, setCursorPosition] = React.useState(0);
  const [isMentionListOpen, setIsMentionListOpen] = React.useState(true);
  const [activeMentionIndex, setActiveMentionIndex] = React.useState(0);
  const [debouncedMentionQuery, setDebouncedMentionQuery] = React.useState<
    string | undefined
  >(undefined);
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const mentionListId = React.useId();
  const isReply = Boolean(parentId);

  const form = useForm({
    defaultValues: {
      content: "",
    },
    validators: {
      onSubmit: commentSchema,
    },
    onSubmit: async ({ value }) => {
      if (!isAuthenticated) {
        openSignIn();
        return;
      }

      setPendingParentId(parentId ?? null);

      await new Promise<void>((resolve, reject) => {
        createComment.mutate(
          {
            content: value.content.trim(),
            targetId,
            targetType,
            parentId,
          },
          {
            onSuccess: (data) => {
              setLastCreatedCommentId(data.id);
              form.reset();
              setCursorPosition(0);
              setDebouncedMentionQuery(undefined);
              onSuccess?.();
              resolve();
            },
            onError: (error) => {
              toast.error(
                getApiError(error).message ?? "Could not post comment",
              );
              reject(error);
            },
            onSettled: () => {
              setPendingParentId(undefined);
            },
          },
        );
      });
    },
  });

  const content = useStore(form.store, (state) => state.values.content);

  const mentionContext = React.useMemo(
    () => getMentionContext(content, cursorPosition),
    [content, cursorPosition],
  );

  const mentionQuery = mentionContext?.query?.trim() ?? null;

  React.useEffect(() => {
    if (mentionQuery === null) {
      setDebouncedMentionQuery(undefined);
      return;
    }
    if (!mentionQuery) {
      setDebouncedMentionQuery("");
      return;
    }
    const timeout = window.setTimeout(() => {
      setDebouncedMentionQuery(mentionQuery);
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [mentionQuery]);

  const {
    data: mentionCandidates = [],
    isLoading: isMentionLoading,
    isFetching: isMentionFetching,
  } = useQuery({
    ...commentsQueryOptionsFactory.mentionCandidates(
      targetId,
      targetType,
      parentId,
      debouncedMentionQuery,
    ),
    placeholderData: keepPreviousData,
    enabled:
      isMentionListOpen &&
      Boolean(mentionContext) &&
      debouncedMentionQuery !== undefined,
  });

  const handleInsertMention = (candidate: CommentMentionCandidate) => {
    if (!mentionContext) return;

    const { nextValue, nextCursor } = insertMention(
      content,
      mentionContext,
      candidate.username,
    );
    form.setFieldValue("content", nextValue);
    setCursorPosition(nextCursor);
    setIsMentionListOpen(false);

    requestAnimationFrame(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(nextCursor, nextCursor);
    });
  };

  const showMentionDropdown =
    Boolean(mentionContext) &&
    isMentionListOpen &&
    (mentionCandidates.length > 0 || isMentionLoading);

  React.useEffect(() => {
    setActiveMentionIndex(0);
  }, [debouncedMentionQuery, mentionCandidates.length]);

  const activeMention =
    mentionCandidates.length > 0
      ? mentionCandidates[
          Math.min(activeMentionIndex, mentionCandidates.length - 1)
        ]
      : undefined;
  const activeMentionOptionId = activeMention
    ? `${mentionListId}-${activeMention.id}`
    : undefined;

  const handleMentionKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (!showMentionDropdown) return;

    if (event.key === "Escape") {
      event.preventDefault();
      setIsMentionListOpen(false);
      return;
    }

    if (mentionCandidates.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveMentionIndex((index) => (index + 1) % mentionCandidates.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveMentionIndex(
        (index) =>
          (index - 1 + mentionCandidates.length) % mentionCandidates.length,
      );
      return;
    }

    if (event.key === "Enter" && !event.shiftKey && activeMention) {
      event.preventDefault();
      handleInsertMention(activeMention);
    }
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!isAuthenticated) {
          openSignIn();
          return;
        }
        form.handleSubmit();
      }}
      className="flex gap-3"
    >
      <UserAvatar
        user={viewer ?? user}
        size={isReply ? "sm" : "default"}
        className="mt-0.5"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="relative">
          <form.Field
            name="content"
            children={(field) => {
              const invalid = isFieldInvalid(field);
              return (
                <Field data-invalid={invalid}>
                  <Textarea
                    ref={textareaRef}
                    id={field.name}
                    name={field.name}
                    placeholder={isReply ? "Write a reply…" : "Add a comment…"}
                    value={field.state.value}
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={showMentionDropdown}
                    aria-controls={
                      showMentionDropdown ? mentionListId : undefined
                    }
                    aria-activedescendant={
                      showMentionDropdown ? activeMentionOptionId : undefined
                    }
                    aria-label={isReply ? "Write a reply" : "Add a comment"}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      setCursorPosition(
                        e.target.selectionStart ?? e.target.value.length,
                      );
                      setIsMentionListOpen(true);
                    }}
                    onKeyDown={handleMentionKeyDown}
                    onKeyUp={(e) => {
                      const target = e.currentTarget;
                      setCursorPosition(
                        target.selectionStart ?? target.value.length,
                      );
                    }}
                    onClick={(e) => {
                      const target = e.currentTarget;
                      setCursorPosition(
                        target.selectionStart ?? target.value.length,
                      );
                    }}
                    aria-invalid={invalid}
                    rows={1}
                    className="min-h-11 max-h-40 field-sizing-content bg-background"
                  />
                  {invalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          {showMentionDropdown && (
            <div
              id={mentionListId}
              role="listbox"
              aria-label="Mention suggestions"
              className="absolute z-20 mt-1 w-full rounded-md border bg-popover p-1 shadow-md"
            >
              {isMentionLoading && mentionCandidates.length === 0
                ? Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={`mention-skeleton-${index}`}
                      className="flex items-center gap-2 rounded px-2 py-1"
                    >
                      <Skeleton className="h-7 w-7 rounded-full" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  ))
                : mentionCandidates.map((candidate, index) => {
                    const isActive = candidate.id === activeMention?.id;
                    return (
                      <button
                        key={candidate.id}
                        id={`${mentionListId}-${candidate.id}`}
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        tabIndex={-1}
                        className={cn(
                          "flex w-full items-center justify-between gap-2 rounded px-2 py-1 text-left text-sm hover:bg-accent",
                          isActive && "bg-accent",
                        )}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleInsertMention(candidate);
                        }}
                        onMouseEnter={() => setActiveMentionIndex(index)}
                      >
                        <div className="flex items-center gap-2">
                          <UserAvatar
                            user={candidate}
                            size="sm"
                          />
                          <div className="flex flex-col">
                            <span className="font-medium leading-tight">
                              {candidate.displayName ?? candidate.username}
                            </span>
                            <span className="text-xs text-muted-foreground leading-tight">
                              @{candidate.username}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
              {mentionCandidates.length > 0 && isMentionFetching && (
                <div className="flex items-center justify-center px-2 py-1.5">
                  <Spinner className="size-3.5 text-muted-foreground" />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-center text-xs text-muted-foreground sm:text-left">
            {isAuthenticated
              ? "Tip: type @ to mention someone"
              : "Sign in to comment"}
          </p>
          <form.Subscribe
            selector={(state) =>
              [state.values.content, state.isSubmitting] as const
            }
            children={([fieldContent, isSubmitting]) => (
              <Button
                type="submit"
                size="sm"
                className="w-full sm:w-auto"
                disabled={
                  !fieldContent.trim() ||
                  isSubmitting ||
                  createComment.isPending
                }
              >
                {isSubmitting || createComment.isPending
                  ? isReply
                    ? "Replying…"
                    : "Posting…"
                  : isReply
                    ? "Reply"
                    : "Comment"}
              </Button>
            )}
          />
        </div>
      </div>
    </form>
  );
};
