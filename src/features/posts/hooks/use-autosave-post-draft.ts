import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postsApi } from "../posts.api";
import { postsQueryOptionsFactory } from "../posts-query-options-factory";
import type { CreatePostDto } from "../types";

type AutosavePostDraftInput = {
  id?: string;
  dto: CreatePostDto;
};

export function useAutosavePostDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["posts", "autosave-draft"],
    mutationFn: ({ id, dto }: AutosavePostDraftInput) => {
      const draft = { ...dto, isPublished: false as const };
      if (id) {
        return postsApi.update(id, {
          content: draft.content ?? "",
          topicIds: draft.topicIds ?? [],
          imageMediaIds: draft.imageMediaIds ?? [],
          imageLayout: draft.imageLayout,
          isPublished: false,
        });
      }
      return postsApi.create(draft);
    },
    onSuccess: (post) => {
      queryClient.setQueryData(
        postsQueryOptionsFactory.details(post.id).queryKey,
        post,
      );
      void queryClient.invalidateQueries({
        queryKey: postsQueryOptionsFactory.drafts().queryKey,
      });
    },
  });
}
