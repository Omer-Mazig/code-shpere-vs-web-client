import { useMutation, useQueryClient } from "@tanstack/react-query";
import { topicsApi } from "../topics.api";
import { topicsQueryOptionsFactory } from "../topics-query-options-factory";

export function useFollowTopic(topicId: string) {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: topicsQueryOptionsFactory.all().queryKey,
    });

  const followMutation = useMutation({
    mutationKey: ["topics", "follow", topicId],
    mutationFn: () => topicsApi.follow(topicId),
    onSettled: invalidate,
  });

  const unfollowMutation = useMutation({
    mutationKey: ["topics", "unfollow", topicId],
    mutationFn: () => topicsApi.unfollow(topicId),
    onSettled: invalidate,
  });

  return { followMutation, unfollowMutation };
}
