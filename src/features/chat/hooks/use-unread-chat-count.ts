import { useQuery } from "@tanstack/react-query";
import { chatQueryOptionsFactory } from "../chat-query-options-factory";

export function useUnreadChatCount(enabled = true) {
  return useQuery({
    ...chatQueryOptionsFactory.unreadCount(),
    enabled,
  });
}
