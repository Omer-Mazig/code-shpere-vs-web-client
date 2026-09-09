import type { components, paths } from "@/lib/api-types";

export type Conversation = components["schemas"]["ConversationResponseDto"];
export type ChatMessage = components["schemas"]["ChatMessageResponseDto"];
export type CreateConversationDto =
  components["schemas"]["CreateConversationDto"];
export type CreateChatMessageDto =
  components["schemas"]["CreateChatMessageDto"];
export type ChatUnreadCount =
  components["schemas"]["ChatUnreadCountResponseDto"];
export type ConversationListQueryDto = NonNullable<
  paths["/api/chat/conversations"]["get"]["parameters"]["query"]
>;
export type ChatMessagesQueryDto = NonNullable<
  paths["/api/chat/conversations/{id}/messages"]["get"]["parameters"]["query"]
>;
