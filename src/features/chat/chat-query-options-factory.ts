import { keepPreviousData } from "@tanstack/react-query";
import { infiniteQueryOptions, queryOptions } from "@/lib/query-options";
import { chatApi } from "./chat.api";
import type { ConversationListQueryDto } from "./types";

const INBOX_LIMIT = 20;
const MESSAGES_LIMIT = 30;

export const chatQueryOptionsFactory = {
  all: () => queryOptions({ queryKey: ["chat"] }),

  lists: () =>
    queryOptions({
      queryKey: [...chatQueryOptionsFactory.all().queryKey, "inbox"],
    }),

  inbox: (query?: Omit<ConversationListQueryDto, "page">) =>
    infiniteQueryOptions({
      queryKey: [...chatQueryOptionsFactory.lists().queryKey, query],
      queryFn: ({ pageParam }) =>
        chatApi.listConversations({
          ...query,
          page: Number(pageParam),
          limit: INBOX_LIMIT,
        }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
      placeholderData: keepPreviousData,
      staleTime: 1000 * 30,
    }),

  allDetails: () =>
    queryOptions({
      queryKey: [...chatQueryOptionsFactory.all().queryKey, "details"],
    }),

  details: (id: string) =>
    queryOptions({
      queryKey: [...chatQueryOptionsFactory.allDetails().queryKey, id],
      queryFn: () => chatApi.getConversation(id),
      staleTime: 1000 * 30,
    }),

  messages: (conversationId: string) =>
    infiniteQueryOptions({
      queryKey: [
        ...chatQueryOptionsFactory.all().queryKey,
        "messages",
        conversationId,
      ],
      queryFn: ({ pageParam }) =>
        chatApi.listMessages(conversationId, {
          page: Number(pageParam),
          limit: MESSAGES_LIMIT,
        }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
      staleTime: 1000 * 15,
    }),

  unreadCount: () =>
    queryOptions({
      queryKey: [...chatQueryOptionsFactory.all().queryKey, "unread-count"],
      queryFn: () => chatApi.getUnreadCount(),
      staleTime: 1000 * 15,
      meta: { minPending: false },
    }),
};
