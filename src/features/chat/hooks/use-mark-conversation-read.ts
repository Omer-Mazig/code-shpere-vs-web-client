import { useMutation, useQueryClient } from "@tanstack/react-query";
import { chatApi } from "../chat.api";
import { applyConversationRead } from "../chat-cache";

export function useMarkConversationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["chat", "read"],
    mutationFn: (conversationId: string) => chatApi.markRead(conversationId),
    onSuccess: (_data, conversationId) => {
      applyConversationRead(queryClient, conversationId);
    },
  });
}
