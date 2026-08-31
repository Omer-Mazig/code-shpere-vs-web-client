import { queryOptions } from "@/lib/query-options";
import { topicsApi } from "./topics.api";

export const topicsQueryOptionsFactory = {
  all: () => queryOptions({ queryKey: ["topics"] }),

  list: (viewerId?: string) =>
    queryOptions({
      queryKey: [
        ...topicsQueryOptionsFactory.all().queryKey,
        "list",
        viewerId ?? "guest",
      ],
      queryFn: () => topicsApi.list(),
      staleTime: 1000 * 60 * 5,
    }),
};
