import React from "react";
import { useAuth } from "@/features/auth/auth.context";

type ChatDockContextValue = {
  inboxOpen: boolean;
  conversationId: string | null;
  openInbox: () => void;
  closeInbox: () => void;
  openThread: (conversationId: string) => void;
  closeThread: () => void;
  closeDock: () => void;
};

const ChatDockContext = React.createContext<ChatDockContextValue | undefined>(
  undefined,
);

export const ChatDockProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { isAuthenticated } = useAuth();
  const [inboxOpen, setInboxOpen] = React.useState(false);
  const [conversationId, setConversationId] = React.useState<string | null>(
    null,
  );

  React.useEffect(() => {
    if (!isAuthenticated) {
      setInboxOpen(false);
      setConversationId(null);
    }
  }, [isAuthenticated]);

  const value = React.useMemo<ChatDockContextValue>(
    () => ({
      inboxOpen,
      conversationId,
      openInbox: () => setInboxOpen(true),
      closeInbox: () => setInboxOpen(false),
      openThread: (id: string) => setConversationId(id),
      closeThread: () => setConversationId(null),
      closeDock: () => {
        setInboxOpen(false);
        setConversationId(null);
      },
    }),
    [conversationId, inboxOpen],
  );

  return (
    <ChatDockContext.Provider value={value}>{children}</ChatDockContext.Provider>
  );
};

export function useChatDock() {
  const context = React.useContext(ChatDockContext);
  if (!context) {
    throw new Error("useChatDock must be used within ChatDockProvider");
  }
  return context;
}

export function useChatDockOptional() {
  return React.useContext(ChatDockContext);
}
