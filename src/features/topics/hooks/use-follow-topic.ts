import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiError } from "@/lib/errors";
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
    onError: (error) => {
      if (getApiError(error).errorCode === "TOPIC_ALREADY_FOLLOWED") {
        return;
      }
      toast.error("Could not follow topic.");
    },
    onSettled: invalidate,
  });

  const unfollowMutation = useMutation({
    mutationKey: ["topics", "unfollow", topicId],
    mutationFn: () => topicsApi.unfollow(topicId),
    onError: (error) => {
      if (getApiError(error).errorCode === "TOPIC_NOT_FOLLOWED") {
        return;
      }
      toast.error("Could not unfollow topic.");
    },
    onSettled: invalidate,
  });

  return { followMutation, unfollowMutation };
}
