import { useMutation, useQueryClient } from "@tanstack/react-query";
import { chatApi } from "../chat.api";
import { chatQueryOptionsFactory } from "../chat-query-options-factory";
import type { CreateConversationDto } from "../types";

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["chat", "create-conversation"],
    mutationFn: (dto: CreateConversationDto) => chatApi.createOrGet(dto),
    onSuccess: (conversation) => {
      queryClient.setQueryData(
        chatQueryOptionsFactory.details(conversation.id).queryKey,
        conversation,
      );
      queryClient.invalidateQueries({
        queryKey: chatQueryOptionsFactory.lists().queryKey,
      });
    },
  });
}
