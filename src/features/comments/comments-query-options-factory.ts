import { infiniteQueryOptions, queryOptions } from "@/lib/query-options";
import { commentsApi } from "./comments.api";
import type { CommentTargetType } from "./types";

const TOP_LEVEL_LIMIT = 10;
const REPLIES_LIMIT = 10;

export const commentsQueryOptionsFactory = {
  // ["comments"]
  all: () => queryOptions({ queryKey: ["comments"] }),

  // ["comments", targetType, targetId, "thread"]
  thread: (targetId: string, targetType: CommentTargetType) =>
    infiniteQueryOptions({
      queryKey: [
        ...commentsQueryOptionsFactory.all().queryKey,
        targetType,
        targetId,
        "thread",
      ],
      queryFn: ({ pageParam }) =>
        commentsApi.getComments(
          targetId,
          targetType,
          Number(pageParam),
          TOP_LEVEL_LIMIT,
        ),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
      staleTime: 1000 * 60 * 2,
    }),

  // ["comments", "replies", commentId]
  replies: (commentId: string) =>
    infiniteQueryOptions({
      queryKey: [
        ...commentsQueryOptionsFactory.all().queryKey,
        "replies",
        commentId,
      ],
      queryFn: ({ pageParam }) =>
        commentsApi.getReplies(commentId, Number(pageParam), REPLIES_LIMIT),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
      staleTime: 1000 * 60 * 2,
    }),

  // ["comments", "mention-candidates", targetType, targetId, parentId, query]
  mentionCandidates: (
    targetId: string,
    targetType: CommentTargetType,
    parentId?: string,
    query?: string,
  ) =>
    queryOptions({
      queryKey: [
        ...commentsQueryOptionsFactory.all().queryKey,
        "mention-candidates",
        targetType,
        targetId,
        parentId,
        query ?? "",
      ],
      queryFn: () =>
        commentsApi.getMentionCandidates(
          targetId,
          targetType,
          parentId,
          query || undefined,
        ),
      staleTime: query ? 1000 * 30 : 1000 * 60 * 5,
      // Typeahead — a 300ms floor would make mention search feel laggy.
      meta: { minPending: false },
    }),
};
