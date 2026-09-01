import React from "react";
import { Copy, MessageCircle, Repeat2, Share2 } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError } from "@/components/ui/field";
import { LikeButton } from "@/features/interactions/components/like-button";
import { useAuth } from "@/features/auth/auth.context";
import { useSignInModal } from "@/features/auth/sign-in-modal.context";
import { cn } from "@/lib/utils";
import { isFieldInvalid } from "@/lib/form";
import { getApiError } from "@/lib/errors";
import { resharePostSchema } from "@/lib/form-schemas";
import { toast } from "sonner";
import type { Post as PostType, SharedPostPreview } from "../types";
import { SharedPostEmbed } from "./shared-post-embed";
import { useCopyPostLink, useResharePost } from "../hooks/use-share-post";

type PostActionsProps = {
  post: PostType;
  onCommentClick?: () => void;
};

const toPreview = (post: PostType): SharedPostPreview => ({
  id: post.id,
  content: post.content,
  author: post.author,
  createdAt: post.createdAt,
});

export const PostActions = ({ post, onCommentClick }: PostActionsProps) => {
  const { isAuthenticated } = useAuth();
  const { open: openSignIn } = useSignInModal();
  const copyLink = useCopyPostLink();
  const reshare = useResharePost();
  const [reshareOpen, setReshareOpen] = React.useState(false);
  const [shareMenuOpen, setShareMenuOpen] = React.useState(false);

  const originalPreview = post.sharedPost ?? toPreview(post);

  const form = useForm({
    defaultValues: {
      content: "",
    },
    validators: {
      onSubmit: resharePostSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await reshare.mutateAsync({
          content: value.content.trim(),
          sharedPostId: post.id,
        });
        toast.success("Post shared");
        form.reset();
        setReshareOpen(false);
      } catch (error) {
        toast.error(getApiError(error).message ?? "Couldn’t share this post");
      }
    },
  });

  return (
    <div className="grid w-full grid-cols-3">
      <LikeButton
        targetId={post.id}
        targetType="POST"
        isLiked={post.isLiked}
        likesCount={post.likesCount}
        className="w-full justify-center"
      />

      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-center gap-2 text-muted-foreground"
        aria-label={`Comments, ${post.commentsCount}`}
        onClick={() => onCommentClick?.()}
      >
        <MessageCircle className="h-4 w-4" />
        <span className="text-xs tabular-nums">{post.commentsCount}</span>
      </Button>

      <DropdownMenu
        open={shareMenuOpen}
        onOpenChange={(open) => {
          if (!isAuthenticated) {
            openSignIn();
            return;
          }
          setShareMenuOpen(open);
        }}
      >
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "w-full justify-center gap-2",
              post.isShared
                ? "text-primary hover:text-primary"
                : "text-muted-foreground",
            )}
            aria-label="Share post"
          >
            <Share2 className="h-4 w-4" />
            <span className="text-xs tabular-nums">{post.sharesCount ?? 0}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem
            onClick={() =>
              copyLink.mutate(post.id, {
                onSuccess: () => toast.success("Link copied"),
                onError: () => toast.error("Couldn’t copy the link"),
              })
            }
          >
            <Copy />
            Copy link
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              form.reset();
              setReshareOpen(true);
            }}
          >
            <Repeat2 />
            Reshare as post
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={reshareOpen}
        onOpenChange={(open) => {
          if (reshare.isPending) return;
          setReshareOpen(open);
          if (!open) {
            form.reset();
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Reshare as post</DialogTitle>
            <DialogDescription>
              Share this with your network. A comment is optional.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              form.handleSubmit();
            }}
          >
            <form.Field
              name="content"
              children={(field) => {
                const invalid = isFieldInvalid(field);
                return (
                  <Field data-invalid={invalid}>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      placeholder="Add a comment…"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      aria-invalid={invalid}
                      rows={3}
                      maxLength={5000}
                      className="min-h-20 max-h-48 field-sizing-content resize-none"
                    />
                    {invalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />
            <SharedPostEmbed
              post={originalPreview}
              className="pointer-events-none mt-0"
            />
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                disabled={reshare.isPending}
                onClick={() => setReshareOpen(false)}
              >
                Cancel
              </Button>
              <form.Subscribe
                selector={(state) => state.isSubmitting}
                children={(isSubmitting) => (
                  <Button
                    type="submit"
                    disabled={isSubmitting || reshare.isPending}
                  >
                    {isSubmitting || reshare.isPending ? "Sharing…" : "Post"}
                  </Button>
                )}
              />
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
