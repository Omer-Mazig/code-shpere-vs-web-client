import { useNavigate } from "react-router-dom";
import { useSuspenseQuery } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { RelativeTime } from "@/components/shared/relative-time";
import { getApiError } from "@/lib/errors";
import { FEED_PATHS } from "@/lib/routes.constants";
import { postsQueryOptionsFactory } from "../posts-query-options-factory";
import { useDeletePost } from "../hooks/use-delete-post";
import { useUpdatePost } from "../hooks/use-update-post";
import {
  forgetPostDraft,
  readPostDraftId,
  rememberPostDraft,
} from "../post-draft-storage";

export const PostDraftsList = () => {
  const navigate = useNavigate();
  const { data } = useSuspenseQuery(postsQueryOptionsFactory.drafts());
  const updatePost = useUpdatePost();
  const deletePost = useDeletePost();

  if (data.items.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No post drafts"
        description="Start a post on the feed. It saves here until you publish it."
      />
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {data.items.map((post) => {
        const canPublish =
          post.content.trim().length > 0 || post.images.length > 0;
        return (
          <li
            key={post.id}
            className="rounded-xl border bg-card p-4"
          >
            <p className="line-clamp-3 whitespace-pre-wrap text-sm">
              {post.content.trim() || "Empty draft"}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Saved <RelativeTime date={post.updatedAt} />
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => {
                  rememberPostDraft(post.id);
                  navigate(FEED_PATHS.FEED);
                }}
              >
                Edit
              </Button>
              <Button
                type="button"
                size="sm"
                className="w-full sm:w-auto"
                disabled={!canPublish || updatePost.isPending}
                onClick={() => {
                  void updatePost
                    .mutateAsync({
                      id: post.id,
                      dto: {
                        content: post.content,
                        imageMediaIds: post.images.map((image) => image.id),
                        imageLayout: post.imageLayout,
                        topicIds: post.topics.map((topic) => topic.id),
                        isPublished: true,
                      },
                    })
                    .then(() => {
                      if (readMatches(post.id)) forgetPostDraft();
                      toast.success("Post published");
                    })
                    .catch((error: unknown) => {
                      toast.error(
                        getApiError(error).message ?? "Could not publish post",
                      );
                    });
                }}
              >
                Publish
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="w-full sm:w-auto"
                disabled={deletePost.isPending}
                onClick={() => {
                  void deletePost
                    .mutateAsync(post.id)
                    .then(() => {
                      if (readMatches(post.id)) forgetPostDraft();
                      toast.success("Draft deleted");
                    })
                    .catch((error: unknown) => {
                      toast.error(
                        getApiError(error).message ?? "Could not delete draft",
                      );
                    });
                }}
              >
                Delete
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

function readMatches(id: string) {
  return readPostDraftId() === id;
}
