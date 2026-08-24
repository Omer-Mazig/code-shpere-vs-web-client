import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postsApi } from "../posts.api";
import { postsQueryOptionsFactory } from "../posts-query-options-factory";
import type { UpdatePostDto } from "../types";

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["posts", "update"],
    mutationFn: ({ id, dto }: { id: string; dto: UpdatePostDto }) =>
      postsApi.update(id, dto),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: postsQueryOptionsFactory.all().queryKey,
      });
    },
  });
}
