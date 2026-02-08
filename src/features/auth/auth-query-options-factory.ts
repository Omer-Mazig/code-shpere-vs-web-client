import { queryOptions } from "@tanstack/react-query";
import { authApi } from "./auth.api";

export const authQueryOptionsFactory = {
  // ["auth"]
  all: () => queryOptions({ queryKey: ["auth"] }),

  // ["auth", "session"]
  session: () =>
    queryOptions({
      queryKey: [...authQueryOptionsFactory.all().queryKey, "session"],
      queryFn: () => authApi.refreshSession(),
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }),
};
