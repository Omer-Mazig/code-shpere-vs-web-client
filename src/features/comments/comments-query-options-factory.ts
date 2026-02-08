import { queryOptions } from "@tanstack/react-query";
import { commentsApi } from "./comments.api";

export const commentsQueryOptionsFactory = {
  // ["comments"]
  all: () => queryOptions({ queryKey: ["comments"] }),

  // ["comments", targetType, targetId]
  forTarget: (targetId: string, targetType: "POST" | "ARTICLE") =>
    queryOptions({
      queryKey: [
        ...commentsQueryOptionsFactory.all().queryKey,
        targetType,
        targetId,
      ],
      queryFn: () => commentsApi.getComments(targetId, targetType),
      staleTime: 1000 * 60 * 2, // 2 minutes
    }),
};
