import React from "react";
import { NavLink } from "react-router-dom";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { RelativeTime } from "@/components/shared/relative-time";
import { UserAvatar, getUserDisplayName } from "@/components/shared/user-avatar";
import { QueryBoundary } from "@/components/errors/query-boundary";
import { InlineErrorFallback } from "@/components/errors/inline-error-fallback";
import { Skeleton } from "@/components/ui/skeleton";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { chatThreadPath } from "@/lib/routes.constants";
import { cn } from "@/lib/utils";
import { chatQueryOptionsFactory } from "../chat-query-options-factory";
import type { Conversation } from "../types";

const InboxSkeleton = () => (
  <div className="flex flex-col gap-1 p-2">
    {Array.from({ length: 6 }).map((_, index) => (
      <Skeleton key={index} className="h-16 w-full rounded-lg" />
    ))}
  </div>
);

type ChatInboxProps = {
  onSelectConversation?: (conversationId: string) => void;
  selectedConversationId?: string;
};

export const ChatInbox = ({
  onSelectConversation,
  selectedConversationId,
}: ChatInboxProps) => (
  <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
    <QueryBoundary
      fallback={<InboxSkeleton />}
      ErrorFallback={InlineErrorFallback}
    >
      <ChatInboxList
        onSelectConversation={onSelectConversation}
        selectedConversationId={selectedConversationId}
      />
    </QueryBoundary>
  </div>
);

const ChatInboxList = ({
  onSelectConversation,
  selectedConversationId,
}: ChatInboxProps) => {
  const { ref, isIntersecting } = useIntersectionObserver({
    rootMargin: "200px",
  });
  const inboxQuery = useSuspenseInfiniteQuery(chatQueryOptionsFactory.inbox());
  const conversations =
    inboxQuery.data.pages.flatMap((page) => page.items) ?? [];

  React.useEffect(() => {
    if (
      isIntersecting &&
      inboxQuery.hasNextPage &&
      !inboxQuery.isFetchingNextPage
    ) {
      void inboxQuery.fetchNextPage();
    }
  }, [inboxQuery, isIntersecting]);

  if (conversations.length === 0) {
    return (
      <EmptyState
        icon={MessageCircle}
        title="No conversations yet"
        description="Open a profile and tap Message to start a 1:1 thread."
        className="m-4 border-0 bg-transparent py-16"
      />
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <ul className="flex flex-col p-2">
        {conversations.map((conversation) => {
          const name = getUserDisplayName(conversation.otherUser);
          return (
            <li key={conversation.id}>
              {onSelectConversation ? (
                <button
                  type="button"
                  onClick={() => onSelectConversation(conversation.id)}
                  className={cn(
                    "flex w-full gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-accent",
                    selectedConversationId === conversation.id && "bg-accent",
                  )}
                >
                  <InboxRow conversation={conversation} name={name} />
                </button>
              ) : (
                <NavLink
                  to={chatThreadPath(conversation.id)}
                  className={({ isActive }) =>
                    cn(
                      "flex gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-accent",
                      isActive && "bg-accent",
                    )
                  }
                >
                  <InboxRow conversation={conversation} name={name} />
                </NavLink>
              )}
            </li>
          );
        })}
      </ul>
      <div ref={ref} className="h-8" />
    </div>
  );
};

const InboxRow = ({
  conversation,
  name,
}: {
  conversation: Conversation;
  name: string;
}) => (
  <>
    <UserAvatar user={conversation.otherUser} size="default" />
    <div className="min-w-0 flex-1">
      <div className="flex items-baseline justify-between gap-2">
        <p className="truncate font-medium">{name}</p>
        {conversation.lastMessage ? (
          <RelativeTime
            date={conversation.lastMessage.createdAt}
            className="shrink-0 text-[11px] text-muted-foreground"
          />
        ) : null}
      </div>
      <p
        className={cn(
          "truncate text-sm text-muted-foreground",
          conversation.unreadCount > 0 && "font-medium text-foreground",
        )}
      >
        {conversation.lastMessage?.body ?? "No messages yet"}
      </p>
    </div>
    {conversation.unreadCount > 0 ? (
      <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
    ) : null}
  </>
);
