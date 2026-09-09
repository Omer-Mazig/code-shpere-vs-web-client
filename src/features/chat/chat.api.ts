import { apiClient } from "@/lib/api-client";
import type { ApiEnvelope, PaginatedResponse } from "@/lib/types";
import type {
  ChatMessage,
  ChatMessagesQueryDto,
  ChatUnreadCount,
  Conversation,
  ConversationListQueryDto,
  CreateChatMessageDto,
  CreateConversationDto,
} from "./types";

export const chatApi = {
  listConversations: async (
    query?: ConversationListQueryDto,
  ): Promise<PaginatedResponse<Conversation>> => {
    const response = await apiClient.get<
      ApiEnvelope<PaginatedResponse<Conversation>>
    >("/chat/conversations", { params: query });
    return response.data.payload;
  },

  getUnreadCount: async (): Promise<ChatUnreadCount> => {
    const response = await apiClient.get<ApiEnvelope<ChatUnreadCount>>(
      "/chat/conversations/unread-count",
    );
    return response.data.payload;
  },

  createOrGet: async (dto: CreateConversationDto): Promise<Conversation> => {
    const response = await apiClient.post<ApiEnvelope<Conversation>>(
      "/chat/conversations",
      dto,
    );
    return response.data.payload;
  },

  getConversation: async (id: string): Promise<Conversation> => {
    const response = await apiClient.get<ApiEnvelope<Conversation>>(
      `/chat/conversations/${id}`,
    );
    return response.data.payload;
  },

  listMessages: async (
    conversationId: string,
    query?: ChatMessagesQueryDto,
  ): Promise<PaginatedResponse<ChatMessage>> => {
    const response = await apiClient.get<
      ApiEnvelope<PaginatedResponse<ChatMessage>>
    >(`/chat/conversations/${conversationId}/messages`, { params: query });
    return response.data.payload;
  },

  sendMessage: async (
    conversationId: string,
    dto: CreateChatMessageDto,
  ): Promise<ChatMessage> => {
    const response = await apiClient.post<ApiEnvelope<ChatMessage>>(
      `/chat/conversations/${conversationId}/messages`,
      dto,
    );
    return response.data.payload;
  },

  markRead: async (conversationId: string): Promise<void> => {
    await apiClient.patch(`/chat/conversations/${conversationId}/read`);
  },

  deleteConversation: async (conversationId: string): Promise<void> => {
    await apiClient.delete(`/chat/conversations/${conversationId}`);
  },
};
