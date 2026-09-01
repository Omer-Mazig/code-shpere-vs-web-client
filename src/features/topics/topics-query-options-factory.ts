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

  bySlug: (slug: string, viewerId?: string) =>
    queryOptions({
      queryKey: [
        ...topicsQueryOptionsFactory.all().queryKey,
        "detail",
        slug,
        viewerId ?? "guest",
      ],
      queryFn: () => topicsApi.getBySlug(slug),
      staleTime: 1000 * 60 * 5,
    }),
};
