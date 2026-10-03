import { queryOptions } from "@/lib/query-options";
import { savedApi } from "./saved.api";

export const savedQueryOptionsFactory = {
  all: () => queryOptions({ queryKey: ["saved"] }),

  list: () =>
    queryOptions({
      queryKey: [...savedQueryOptionsFactory.all().queryKey, "list"],
      queryFn: () => savedApi.list({ page: 1, limit: 50 }),
    }),
};
