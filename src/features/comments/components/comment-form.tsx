import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
}: CommentFormProps) => {
  const { isAuthenticated } = useAuth();
  const { open: openSignIn } = useSignInModal();
  const [content, setContent] = React.useState("");
  const [cursorPosition, setCursorPosition] = React.useState(0);
  const [isMentionListOpen, setIsMentionListOpen] = React.useState(true);
  const [hasMentionTriggered, setHasMentionTriggered] = React.useState(false);
  const [debouncedMentionQuery, setDebouncedMentionQuery] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const createComment = useCreateComment();

  const canMentionInThisForm = targetType === "POST" && Boolean(parentId);
  const mentionContext = React.useMemo(
    () =>
      canMentionInThisForm ? getMentionContext(content, cursorPosition) : null,
    [canMentionInThisForm, content, cursorPosition],
  );

  React.useEffect(() => {
    if (canMentionInThisForm && mentionContext && !hasMentionTriggered) {
      setHasMentionTriggered(true);
    }
  }, [canMentionInThisForm, mentionContext, hasMentionTriggered]);

  React.useEffect(() => {
    const query = mentionContext?.query?.trim() ?? "";
    const timeout = window.setTimeout(() => {
      setDebouncedMentionQuery(query);
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [mentionContext?.query]);

  const { data: mentionCandidatesPool = [] } = useQuery({
    ...commentsQueryOptionsFactory.mentionCandidatesPool(
      targetId,
      parentId ?? "",
    ),
    // Fetch once on first @ in reply forms.
    enabled: canMentionInThisForm && hasMentionTriggered,
  });

  const localFilteredCandidates = React.useMemo(() => {
    if (!mentionContext) return [];
    const search = mentionContext.query.trim().toLowerCase();
    if (!search) return mentionCandidatesPool;

    return mentionCandidatesPool.filter((candidate) => {
      const usernameMatch = candidate.username.toLowerCase().includes(search);
      const displayNameMatch = (candidate.displayName ?? "")
        .toLowerCase()
        .includes(search);
      return usernameMatch || displayNameMatch;
    });
  }, [mentionCandidatesPool, mentionContext]);

  const shouldUseFallbackSearch =
    canMentionInThisForm &&
    Boolean(mentionContext) &&
    isMentionListOpen &&
    hasMentionTriggered &&
    localFilteredCandidates.length === 0 &&
    debouncedMentionQuery.length > 0;

  const { data: fallbackMentionCandidates = [] } = useQuery({
    ...commentsQueryOptionsFactory.mentionCandidatesSearch(
      targetId,
      parentId ?? "",
      debouncedMentionQuery,
    ),
    // Debounced fallback only when local filtering has no hits.
    enabled: shouldUseFallbackSearch,
  });

  const mentionCandidates =
    localFilteredCandidates.length > 0
      ? localFilteredCandidates
      : fallbackMentionCandidates;

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
    setHasMentionTriggered(false);
    setDebouncedMentionQuery("");
    onSuccess?.();
  };

  const showMentionDropdown =
    canMentionInThisForm &&
    Boolean(mentionContext) &&
    isMentionListOpen &&
    mentionCandidates.length > 0;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
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
            {mentionCandidates.map((candidate) => (
              <button
                key={candidate.id}
                type="button"
                className="flex w-full items-center justify-between rounded px-2 py-1 text-left text-sm hover:bg-accent"
                onMouseDown={(e) => {
                  e.preventDefault();
                  insertMention(candidate);
                }}
              >
                <span className="font-medium">
                  {candidate.displayName ?? candidate.username}
                </span>
                <span className="text-xs text-muted-foreground">
                  @{candidate.username}
                </span>
              </button>
            ))}
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
