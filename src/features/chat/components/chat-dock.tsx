import { Link, useLocation } from "react-router-dom";
import { ChevronDown, ChevronUp, Maximize2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/features/auth/auth.context";
import { CHAT_PATHS } from "@/lib/routes.constants";
import { cn } from "@/lib/utils";
import { useChatDock } from "../chat-dock.context";
import { useUnreadChatCount } from "../hooks/use-unread-chat-count";
import { ChatInbox } from "./chat-inbox";
import { ChatThread } from "./chat-thread";

export const ChatDock = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const {
    inboxOpen,
    conversationId,
    openInbox,
    closeInbox,
    openThread,
    closeThread,
    closeDock,
  } = useChatDock();
  const unreadQuery = useUnreadChatCount(isAuthenticated);
  const unread = unreadQuery.data?.count ?? 0;
  const onMessagesPage = location.pathname.startsWith(CHAT_PATHS.MESSAGES);

  if (!isAuthenticated || onMessagesPage) {
    return null;
  }

  const toggleInbox = () => {
    if (inboxOpen) {
      closeInbox();
    } else {
      openInbox();
    }
  };

  return (
    <div className="pointer-events-none fixed right-4 bottom-0 z-40 hidden items-end gap-3 md:flex">
      {conversationId ? (
        <div className="pointer-events-auto flex h-112 w-90 flex-col overflow-hidden rounded-t-xl border border-b-0 bg-card shadow-lg">
          <ChatThread
            conversationId={conversationId}
            variant="dock"
            onClose={closeThread}
          />
        </div>
      ) : null}

      <div
        className={cn(
          "pointer-events-auto flex w-80 flex-col overflow-hidden rounded-t-xl border border-b-0 bg-card shadow-lg",
          inboxOpen ? "h-112" : "h-12",
        )}
      >
        <div
          className={cn(
            "flex h-12 shrink-0 items-center gap-1 px-2",
            inboxOpen && "border-b",
          )}
        >
          <button
            type="button"
            className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-accent"
            aria-expanded={inboxOpen}
            aria-label={
              unread > 0
                ? `Messages, ${unread} unread`
                : inboxOpen
                  ? "Hide messages"
                  : "Open messages"
            }
            onClick={toggleInbox}
          >
            <MessageCircle className="h-5 w-5 shrink-0" />
            <span className="truncate font-semibold">Messaging</span>
            {!inboxOpen && unread > 0 ? (
              <Badge className="h-5 min-w-5 rounded-full px-1.5 text-[10px]">
                {unread > 99 ? "99+" : unread}
              </Badge>
            ) : null}
          </button>
          {inboxOpen ? (
            <Button variant="ghost" size="icon-sm" asChild>
              <Link
                to={CHAT_PATHS.MESSAGES}
                aria-label="Open Messages page"
                onClick={closeDock}
              >
                <Maximize2 className="h-4 w-4" />
              </Link>
            </Button>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={inboxOpen ? "Minimize messages" : "Open messages"}
            onClick={toggleInbox}
          >
            {inboxOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
        </div>
        {inboxOpen ? (
          <ChatInbox
            selectedConversationId={conversationId ?? undefined}
            onSelectConversation={openThread}
          />
        ) : null}
      </div>
    </div>
  );
};
