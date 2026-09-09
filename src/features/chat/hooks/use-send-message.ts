import { useMutation, useQueryClient } from "@tanstack/react-query";
import { chatApi } from "../chat.api";
import { applyIncomingMessage } from "../chat-cache";
import type { CreateChatMessageDto } from "../types";
import { useAuth } from "@/features/auth/auth.context";

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationKey: ["chat", "send", conversationId],
    mutationFn: (dto: CreateChatMessageDto) =>
      chatApi.sendMessage(conversationId, dto),
    onSuccess: (message) => {
      if (!user) {
        return;
      }
      applyIncomingMessage(queryClient, message, user.id, conversationId);
    },
  });
}
