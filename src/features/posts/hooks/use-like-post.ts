import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

export function useLikePost() {
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationKey: ["interactions", "like", "post"],
    mutationFn: (targetId: string) =>
      apiClient.post("/interactions/likes", {
        targetId,
        targetType: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: () => {
      toast.error("Failed to like post");
    },
  });

  const unlikeMutation = useMutation({
    mutationKey: ["interactions", "unlike", "post"],
    mutationFn: (targetId: string) =>
      apiClient.delete("/interactions/likes", {
        data: { targetId, targetType: "POST" },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: () => {
      toast.error("Failed to unlike post");
    },
  });

  return { likeMutation, unlikeMutation };
}
