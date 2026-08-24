import { queryOptions } from "@/lib/query-options";
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
      // App bootstrap — don't pad the splash screen on a fast session check.
      meta: { minPending: false },
    }),
};
