import React from "react";
import { io, type Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { useMatch } from "react-router-dom";
import { useAuth } from "@/features/auth/auth.context";
import { getAccessToken } from "@/lib/api-client";
import { applyIncomingMessage } from "./chat-cache";
import { useChatDockOptional } from "./chat-dock.context";
import type { ChatMessage } from "./types";

type ChatSocketContextValue = {
  socket: Socket | null;
};

const ChatSocketContext = React.createContext<ChatSocketContextValue>({
  socket: null,
});

export const ChatSocketProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const dock = useChatDockOptional();
  const threadMatch = useMatch("/messages/:conversationId");
  const openConversationId =
    threadMatch?.params.conversationId ?? dock?.conversationId ?? undefined;
  const openConversationIdRef = React.useRef(openConversationId);
  const [socket, setSocket] = React.useState<Socket | null>(null);

  React.useEffect(() => {
    openConversationIdRef.current = openConversationId;
  }, [openConversationId]);

  React.useEffect(() => {
    if (!isAuthenticated || !user) {
      return;
    }

    const token = getAccessToken();
    if (!token) {
      return;
    }

    const baseURL = import.meta.env.VITE_API_URL ?? "";
    const next = io(`${baseURL}/chat`, {
      auth: { token },
      transports: ["websocket"],
    });

    next.on("message", (message: ChatMessage) => {
      applyIncomingMessage(
        queryClient,
        message,
        user.id,
        openConversationIdRef.current,
      );
    });

    setSocket(next);

    return () => {
      next.removeAllListeners();
      next.close();
      setSocket(null);
    };
  }, [isAuthenticated, queryClient, user]);

  const value = React.useMemo(() => ({ socket }), [socket]);

  return (
    <ChatSocketContext.Provider value={value}>
      {children}
    </ChatSocketContext.Provider>
  );
};

export function useChatSocket() {
  return React.useContext(ChatSocketContext);
}
