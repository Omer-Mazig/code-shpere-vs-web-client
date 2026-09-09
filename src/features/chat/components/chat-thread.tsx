import React from "react";
import { Link } from "react-router-dom";
import {
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { ArrowLeft, Maximize2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar, getUserDisplayName } from "@/components/shared/user-avatar";
import { QueryBoundary } from "@/components/errors/query-boundary";
import { InlineErrorFallback } from "@/components/errors/inline-error-fallback";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Message,
  MessageContent,
  MessageFooter,
} from "@/components/ui/message";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { CHAT_PATHS, chatThreadPath, profilePath } from "@/lib/routes.constants";
import { useAuth } from "@/features/auth/auth.context";
import { RelativeTime } from "@/components/shared/relative-time";
import { chatQueryOptionsFactory } from "../chat-query-options-factory";
import { useChatSocket } from "../chat-socket.context";
import { useChatDockOptional } from "../chat-dock.context";
import { useMarkConversationRead } from "../hooks/use-mark-conversation-read";
import { ChatComposer } from "./chat-composer";
import type { ChatMessage } from "../types";

type ChatThreadProps = {
  conversationId: string;
  variant?: "page" | "dock";
  onClose?: () => void;
};

export const ChatThread = ({
  conversationId,
  variant = "page",
  onClose,
}: ChatThreadProps) => (
  <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
    <QueryBoundary
      fallback={<ThreadSkeleton />}
      ErrorFallback={InlineErrorFallback}
      resetKeys={[conversationId]}
    >
      <ChatThreadBody
        conversationId={conversationId}
        variant={variant}
        onClose={onClose}
      />
    </QueryBoundary>
  </div>
);

const ThreadSkeleton = () => (
  <div className="flex h-full flex-col">
    <Skeleton className="h-14 w-full rounded-none" />
    <div className="flex flex-1 flex-col justify-end gap-3 p-4">
      <Skeleton className="h-12 w-2/3 rounded-2xl" />
      <Skeleton className="ml-auto h-12 w-1/2 rounded-2xl" />
    </div>
  </div>
);

const ChatThreadBody = ({
  conversationId,
  variant = "page",
  onClose,
}: ChatThreadProps) => {
  const { user } = useAuth();
  const { socket } = useChatSocket();
  const dock = useChatDockOptional();
  const markRead = useMarkConversationRead();
  const { data: conversation } = useSuspenseQuery(
    chatQueryOptionsFactory.details(conversationId),
  );
  const messagesQuery = useSuspenseInfiniteQuery(
    chatQueryOptionsFactory.messages(conversationId),
  );
  const { ref: loadOlderRef, isIntersecting } = useIntersectionObserver({
    rootMargin: "120px",
  });
  const [typing, setTyping] = React.useState(false);
  const typingTimerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (!socket) {
      return;
    }
    socket.emit("join", { conversationId });

    const onTyping = (payload: { conversationId: string; userId: string }) => {
      if (
        payload.conversationId !== conversationId ||
        payload.userId === user?.id
      ) {
        return;
      }
      setTyping(true);
      if (typingTimerRef.current) {
        window.clearTimeout(typingTimerRef.current);
      }
      typingTimerRef.current = window.setTimeout(() => setTyping(false), 1500);
    };

    socket.on("typing", onTyping);
    return () => {
      socket.off("typing", onTyping);
      if (typingTimerRef.current) {
        window.clearTimeout(typingTimerRef.current);
      }
    };
  }, [conversationId, socket, user?.id]);

  React.useEffect(() => {
    if (conversation.unreadCount > 0) {
      markRead.mutate(conversationId);
    }
    // markRead identity changes each render; unreadCount dropping to 0 stops the loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation.unreadCount, conversationId]);

  React.useEffect(() => {
    const onFocus = () => {
      markRead.mutate(conversationId);
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  React.useEffect(() => {
    if (
      isIntersecting &&
      messagesQuery.hasNextPage &&
      !messagesQuery.isFetchingNextPage
    ) {
      void messagesQuery.fetchNextPage();
    }
  }, [isIntersecting, messagesQuery]);

  const chronological = React.useMemo(() => {
    const pages = [...messagesQuery.data.pages].reverse();
    return pages.flatMap((page) => [...page.items].reverse());
  }, [messagesQuery.data.pages]);

  const lastOwn = [...chronological]
    .reverse()
    .find((message) => message.senderId === user?.id);
  const seen =
    Boolean(lastOwn) &&
    Boolean(conversation.otherLastReadAt) &&
    new Date(conversation.otherLastReadAt ?? 0).getTime() >=
      new Date(lastOwn?.createdAt ?? 0).getTime();

  const name = getUserDisplayName(conversation.otherUser);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-2 border-b px-3 py-2">
        {variant === "page" ? (
          <Button
            variant="ghost"
            size="icon-sm"
            className="md:hidden"
            asChild
          >
            <Link to={CHAT_PATHS.MESSAGES} aria-label="Back to messages">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        ) : null}
        <Link
          to={profilePath(conversation.otherUser.id)}
          className="flex min-w-0 flex-1 items-center gap-2"
        >
          <UserAvatar user={conversation.otherUser} size="sm" />
          <span className="truncate font-medium">{name}</span>
        </Link>
        {variant === "dock" ? (
          <div className="flex shrink-0 items-center">
            <Button variant="ghost" size="icon-sm" asChild>
              <Link
                to={chatThreadPath(conversationId)}
                aria-label="Open in Messages"
                onClick={() => dock?.closeDock()}
              >
                <Maximize2 className="h-4 w-4" />
              </Link>
            </Button>
            {onClose ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Close chat"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      <MessageScrollerProvider>
        <MessageScroller className="min-h-0 flex-1">
          <MessageScrollerViewport>
            <MessageScrollerContent className="gap-3 p-4">
              <div ref={loadOlderRef} className="h-1" />
              {chronological.map((message, index) => (
                <ThreadMessage
                  key={message.id}
                  message={message}
                  isOwn={message.senderId === user?.id}
                  scrollAnchor={index === chronological.length - 1}
                  showSeen={
                    seen &&
                    lastOwn?.id === message.id &&
                    message.senderId === user?.id
                  }
                />
              ))}
              {typing ? (
                <p className="text-xs text-muted-foreground">{name} is typing…</p>
              ) : null}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>

      <ChatComposer conversationId={conversationId} />
    </div>
  );
};

const ThreadMessage = ({
  message,
  isOwn,
  scrollAnchor,
  showSeen,
}: {
  message: ChatMessage;
  isOwn: boolean;
  scrollAnchor: boolean;
  showSeen: boolean;
}) => (
  <MessageScrollerItem scrollAnchor={scrollAnchor}>
    <Message align={isOwn ? "end" : "start"}>
      <MessageContent>
        <Bubble variant={isOwn ? "default" : "secondary"} align={isOwn ? "end" : "start"}>
          <BubbleContent>{message.body}</BubbleContent>
        </Bubble>
        <MessageFooter>
          <RelativeTime date={message.createdAt} />
          {showSeen ? <span className="ml-2">Seen</span> : null}
        </MessageFooter>
      </MessageContent>
    </Message>
  </MessageScrollerItem>
);
