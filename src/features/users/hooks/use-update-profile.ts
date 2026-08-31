import { useMutation, useQueryClient } from "@tanstack/react-query";
import { articlesQueryOptionsFactory } from "@/features/articles/articles-query-options-factory";
import { commentsQueryOptionsFactory } from "@/features/comments/comments-query-options-factory";
import { postsQueryOptionsFactory } from "@/features/posts/posts-query-options-factory";
import { usersApi } from "../users.api";
import { usersQueryOptionsFactory } from "../users-query-options-factory";
import type { UpdateProfileDto } from "../types";

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["users", "updateMyProfile"],
    mutationFn: (dto: UpdateProfileDto) => usersApi.updateMyProfile(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: usersQueryOptionsFactory.allProfiles().queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: postsQueryOptionsFactory.all().queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: commentsQueryOptionsFactory.all().queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: articlesQueryOptionsFactory.all().queryKey,
      });
    },
  });
}
