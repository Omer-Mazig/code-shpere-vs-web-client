import React from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { useCreateComment } from "../hooks/use-create-comment";
import { commentsQueryOptionsFactory } from "../comments-query-options-factory";
import type { CommentMentionCandidate } from "../types";
import { useAuth } from "@/features/auth/auth.context";
import { useSignInModal } from "@/features/auth/sign-in-modal.context";

type CommentFormProps = {
  targetId: string;
  targetType: "POST" | "ARTICLE";
  parentId?: string;
  onSuccess?: () => void;
  createComment?: ReturnType<typeof useCreateComment>;
};

type MentionContext = {
  start: number;
  end: number;
  query: string;
};

function getMentionContext(
  value: string,
  cursorPosition: number,
): MentionContext | null {
  const beforeCursor = value.slice(0, cursorPosition);
  const match = /(^|\s)@([a-zA-Z0-9_-]*)$/.exec(beforeCursor);
  if (!match) return null;

  const query = match[2] ?? "";
  const end = cursorPosition;
  const start = end - query.length - 1;
  if (start < 0) return null;

  return { start, end, query };
}

export const CommentForm = ({
  targetId,
  targetType,
  parentId,
  onSuccess,
  createComment: propsCreateComment,
}: CommentFormProps) => {
  const { isAuthenticated } = useAuth();
  const { open: openSignIn } = useSignInModal();
  const [content, setContent] = React.useState("");
  const [cursorPosition, setCursorPosition] = React.useState(0);
  const [isMentionListOpen, setIsMentionListOpen] = React.useState(true);
  const [debouncedMentionQuery, setDebouncedMentionQuery] = React.useState<
    string | undefined
  >(undefined);
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const createComment = React.useMemo(
    () => propsCreateComment ?? useCreateComment(),
    [propsCreateComment],
  );

  const canMentionInThisForm = targetType === "POST";
  const mentionContext = React.useMemo(
    () =>
      canMentionInThisForm ? getMentionContext(content, cursorPosition) : null,
    [canMentionInThisForm, content, cursorPosition],
  );

  const mentionQuery = mentionContext?.query?.trim() ?? null;

  React.useEffect(() => {
    if (mentionQuery === null) {
      setDebouncedMentionQuery(undefined);
      return;
    }
    // Empty query (just "@") — set immediately for instant dropdown
    if (!mentionQuery) {
      setDebouncedMentionQuery("");
      return;
    }
    // Non-empty query — debounce to avoid excessive API calls
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
      parentId,
      debouncedMentionQuery,
    ),
    placeholderData: keepPreviousData,
    enabled:
      canMentionInThisForm &&
      isMentionListOpen &&
      Boolean(mentionContext) &&
      debouncedMentionQuery !== undefined,
  });

  const insertMention = (candidate: CommentMentionCandidate) => {
    if (!mentionContext) return;

    const mentionToken = `@${candidate.username} `;
    const nextValue =
      content.slice(0, mentionContext.start) +
      mentionToken +
      content.slice(mentionContext.end);

    const nextCursor = mentionContext.start + mentionToken.length;
    setContent(nextValue);
    setCursorPosition(nextCursor);
    setIsMentionListOpen(false);

    requestAnimationFrame(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(nextCursor, nextCursor);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      openSignIn();
      return;
    }

    if (!content.trim()) return;

    await createComment.mutateAsync({
      content: content.trim(),
      targetId,
      targetType,
      parentId,
    });

    setContent("");
    setCursorPosition(0);
    setDebouncedMentionQuery(undefined);
    onSuccess?.();
  };

  const showMentionDropdown =
    canMentionInThisForm &&
    Boolean(mentionContext) &&
    isMentionListOpen &&
    (mentionCandidates.length > 0 || isMentionLoading);

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2"
    >
      <div className="relative">
        <Textarea
          ref={textareaRef}
          placeholder="Write a comment..."
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setCursorPosition(e.target.selectionStart ?? e.target.value.length);
            setIsMentionListOpen(true);
          }}
          onKeyUp={(e) => {
            const target = e.currentTarget;
            setCursorPosition(target.selectionStart ?? target.value.length);
            setIsMentionListOpen(true);
          }}
          onClick={(e) => {
            const target = e.currentTarget;
            setCursorPosition(target.selectionStart ?? target.value.length);
          }}
          rows={2}
          className="resize-none"
        />

        {showMentionDropdown && (
          <div className="absolute z-20 mt-1 w-full rounded-md border bg-popover p-1 shadow-md">
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
              : mentionCandidates.map((candidate) => (
                  <button
                    key={candidate.id}
                    type="button"
                    className="flex w-full items-center justify-between gap-2 rounded px-2 py-1 text-left text-sm hover:bg-accent"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      insertMention(candidate);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Avatar size="sm">
                        <AvatarImage
                          src={candidate.avatarUrl ?? undefined}
                          alt={candidate.displayName ?? candidate.username}
                        />
                        <AvatarFallback>
                          {(
                            candidate.displayName?.[0] ??
                            candidate.username[0] ??
                            "?"
                          ).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
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
                ))}
            {mentionCandidates.length > 0 && isMentionFetching && (
              <div className="flex items-center justify-center px-2 py-1.5">
                <Spinner className="size-3.5 text-muted-foreground" />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          size="sm"
          disabled={!content.trim() || createComment.isPending}
        >
          {createComment.isPending ? "Posting..." : "Comment"}
        </Button>
      </div>
    </form>
  );
};
