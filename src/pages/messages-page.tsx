import { Outlet, useParams } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { ChatInbox } from "@/features/chat/components/chat-inbox";
import { ChatThread } from "@/features/chat/components/chat-thread";
import { cn } from "@/lib/utils";

export const MessagesPage = () => {
  const { conversationId } = useParams<{ conversationId?: string }>();

  return (
    <div className="container mx-auto max-w-6xl px-0 md:px-4 md:py-6">
      <div className="flex h-[calc(100dvh-3.5rem)] min-h-0 overflow-hidden border-y bg-card md:h-[calc(100dvh-3.5rem-3rem)] md:rounded-xl md:border">
        <aside
          className={cn(
            "w-full min-h-0 flex-col border-r md:flex md:w-80 md:shrink-0",
            conversationId ? "hidden md:flex" : "flex",
          )}
        >
          <div className="border-b px-4 py-3">
            <h1 className="text-lg font-semibold tracking-tight">Messages</h1>
          </div>
          <ChatInbox />
        </aside>
        <section
          className={cn(
            "min-w-0 flex-1 flex-col",
            conversationId ? "flex" : "hidden md:flex",
          )}
        >
          <Outlet />
        </section>
      </div>
    </div>
  );
};

export const MessagesEmptyPane = () => (
  <EmptyState
    icon={MessageCircle}
    title="Select a conversation"
    description="Pick a thread from the list, or message someone from their profile."
    className="m-auto max-w-sm border-0 bg-transparent"
  />
);

export const MessagesThreadPane = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  if (!conversationId) {
    return <MessagesEmptyPane />;
  }
  return <ChatThread conversationId={conversationId} />;
};
