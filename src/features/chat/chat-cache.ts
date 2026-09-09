import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import type { PaginatedResponse } from "@/lib/types";
import { prependToInfiniteList } from "@/lib/infinite-query-cache";
import { chatQueryOptionsFactory } from "./chat-query-options-factory";
import type { ChatMessage, Conversation } from "./types";

export function prependChatMessage(
  queryClient: QueryClient,
  conversationId: string,
  message: ChatMessage,
) {
  queryClient.setQueryData(
    chatQueryOptionsFactory.messages(conversationId).queryKey,
    (old: InfiniteData<PaginatedResponse<ChatMessage>> | undefined) => {
      if (!old) {
        return old;
      }
      const exists = old.pages.some((page) =>
        page.items.some((item) => item.id === message.id),
      );
      if (exists) {
        return old;
      }
      return prependToInfiniteList(old, message);
    },
  );
}

export function patchInboxConversation(
  queryClient: QueryClient,
  conversationId: string,
  patch: (conversation: Conversation) => Conversation,
) {
  queryClient.setQueriesData(
    { queryKey: chatQueryOptionsFactory.lists().queryKey },
    (old: InfiniteData<PaginatedResponse<Conversation>> | undefined) => {
      if (!old) {
        return old;
      }
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          items: page.items.map((item) =>
            item.id === conversationId ? patch(item) : item,
          ),
        })),
      };
    },
  );

  queryClient.setQueryData(
    chatQueryOptionsFactory.details(conversationId).queryKey,
    (old: Conversation | undefined) => (old ? patch(old) : old),
  );
}

export function applyIncomingMessage(
  queryClient: QueryClient,
  message: ChatMessage,
  viewerId: string,
  openConversationId?: string,
) {
  prependChatMessage(queryClient, message.conversationId, message);

  const isOwn = message.senderId === viewerId;
  const isOpen = openConversationId === message.conversationId;

  patchInboxConversation(queryClient, message.conversationId, (conversation) => ({
    ...conversation,
    lastMessage: message,
    updatedAt: message.createdAt,
    unreadCount:
      isOwn || isOpen ? 0 : conversation.unreadCount + 1,
  }));

  if (!isOwn && !isOpen) {
    queryClient.setQueryData(
      chatQueryOptionsFactory.unreadCount().queryKey,
      (old: { count: number } | undefined) => ({
        count: (old?.count ?? 0) + 1,
      }),
    );
  }

  queryClient.invalidateQueries({
    queryKey: chatQueryOptionsFactory.lists().queryKey,
  });
  queryClient.invalidateQueries({
    queryKey: chatQueryOptionsFactory.details(message.conversationId).queryKey,
  });
}

export function applyConversationRead(
  queryClient: QueryClient,
  conversationId: string,
) {
  let wasUnread = false;
  patchInboxConversation(queryClient, conversationId, (conversation) => {
    wasUnread = conversation.unreadCount > 0;
    return {
      ...conversation,
      unreadCount: 0,
      lastReadAt: new Date().toISOString(),
    };
  });

  if (wasUnread) {
    queryClient.setQueryData(
      chatQueryOptionsFactory.unreadCount().queryKey,
      (old: { count: number } | undefined) => ({
        count: Math.max(0, (old?.count ?? 1) - 1),
      }),
    );
  }
}
