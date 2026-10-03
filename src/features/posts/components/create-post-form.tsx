import React from "react";
import { useForm, useStore } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError } from "@/components/ui/field";
import type { useCreatePost } from "../hooks/use-create-post";
import { useUpdatePost } from "../hooks/use-update-post";
import { useAutosavePostDraft } from "../hooks/use-autosave-post-draft";
import type { Post, PostImage, PostImageLayout } from "../types";
import { postsApi } from "../posts.api";
import {
  forgetPostDraft,
  readPostDraftId,
  rememberPostDraft,
} from "../post-draft-storage";
import { useAuth } from "@/features/auth/auth.context";
import { useViewer } from "@/features/users/hooks/use-viewer";
import { TopicPicker } from "@/features/topics/components/topic-picker";
import { useSignInModal } from "@/features/auth/sign-in-modal.context";
import { toast } from "sonner";
import { UserAvatar } from "@/components/shared/user-avatar";
import { createPostSchema } from "@/lib/form-schemas";
import { isFieldInvalid } from "@/lib/form";
import { getApiError } from "@/lib/errors";
import { PostImagePicker } from "./post-image-picker";

const AUTOSAVE_MS = 800;

type DraftSnapshot = {
  content: string;
  topicIds: string[];
  imageMediaIds: string[];
  imageLayout: PostImageLayout;
};

type CreatePostFormProps = {
  createPost: ReturnType<typeof useCreatePost>;
  onCreated?: (post: Post) => void;
};

const snapshotKey = (value: DraftSnapshot) =>
  JSON.stringify({
    content: value.content,
    topicIds: value.topicIds,
    imageMediaIds: value.imageMediaIds,
    imageLayout: value.imageLayout,
  });

export const CreatePostForm = ({
  createPost,
  onCreated,
}: CreatePostFormProps) => {
  const { user, isAuthenticated } = useAuth();
  const viewer = useViewer();
  const { open: openSignIn } = useSignInModal();
  const updatePost = useUpdatePost();
  const autosave = useAutosavePostDraft();
  const [attached, setAttached] = React.useState<PostImage[]>([]);
  const [imagesBusy, setImagesBusy] = React.useState(false);
  const [ready, setReady] = React.useState(false);
  const [saveLabel, setSaveLabel] = React.useState<string | null>(null);
  const draftIdRef = React.useRef<string | null>(null);
  const savedKeyRef = React.useRef("");
  const autosaveRef = React.useRef(autosave.mutateAsync);
  autosaveRef.current = autosave.mutateAsync;

  const form = useForm({
    defaultValues: {
      content: "",
      topicIds: [] as string[],
      imageMediaIds: [] as string[],
      imageLayout: "GALLERY" as PostImageLayout,
    },
    validators: {
      onSubmit: createPostSchema,
    },
    onSubmit: async ({ value }) => {
      if (!isAuthenticated) {
        openSignIn();
        return;
      }

      const dto = {
        content: value.content.trim() || undefined,
        topicIds: value.topicIds.length > 0 ? value.topicIds : undefined,
        imageMediaIds:
          value.imageMediaIds.length > 0 ? value.imageMediaIds : undefined,
        imageLayout: value.imageLayout,
        isPublished: true,
      };

      try {
        const post = draftIdRef.current
          ? await updatePost.mutateAsync({
              id: draftIdRef.current,
              dto: {
                content: value.content.trim(),
                topicIds: value.topicIds,
                imageMediaIds: value.imageMediaIds,
                imageLayout: value.imageLayout,
                isPublished: true,
              },
            })
          : await createPost.mutateAsync(dto);
        toast.success("Post created!");
        onCreated?.(post);
        draftIdRef.current = null;
        savedKeyRef.current = "";
        forgetPostDraft();
        setAttached([]);
        setSaveLabel(null);
        form.reset();
      } catch (error) {
        toast.error(getApiError(error).message ?? "Could not create post");
      }
    },
  });

  const values = useStore(form.store, (state) => state.values);

  React.useEffect(() => {
    let cancelled = false;
    const storedId = readPostDraftId();
    if (!storedId) {
      setReady(true);
      return;
    }

    postsApi
      .getById(storedId)
      .then((post) => {
        if (cancelled || post.isPublished) {
          forgetPostDraft();
          return;
        }
        draftIdRef.current = post.id;
        const next = {
          content: post.content,
          topicIds: post.topics.map((topic) => topic.id),
          imageMediaIds: post.images.map((image) => image.id),
          imageLayout: post.imageLayout,
        };
        savedKeyRef.current = snapshotKey(next);
        form.setFieldValue("content", next.content);
        form.setFieldValue("topicIds", next.topicIds);
        form.setFieldValue("imageMediaIds", next.imageMediaIds);
        form.setFieldValue("imageLayout", next.imageLayout);
        setAttached(post.images);
        setSaveLabel("Draft saved");
      })
      .catch(() => {
        forgetPostDraft();
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
    // Hydrate the in-progress draft once. `form` is stable for field updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (!ready || !isAuthenticated || imagesBusy) return;

    const snapshot: DraftSnapshot = {
      content: values.content,
      topicIds: values.topicIds,
      imageMediaIds: values.imageMediaIds,
      imageLayout: values.imageLayout,
    };
    const key = snapshotKey(snapshot);
    if (key === savedKeyRef.current) return;
    // Field updates from hydration can land a render after the draft id is set.
    if (
      draftIdRef.current &&
      savedKeyRef.current &&
      !snapshot.content &&
      snapshot.imageMediaIds.length === 0 &&
      snapshot.topicIds.length === 0
    ) {
      return;
    }

    const hasPayload =
      snapshot.content.trim().length > 0 || snapshot.imageMediaIds.length > 0;
    if (!draftIdRef.current && !hasPayload) return;

    const timer = window.setTimeout(() => {
      setSaveLabel("Saving draft…");
      void autosaveRef
        .current({
          id: draftIdRef.current ?? undefined,
          dto: {
            content: snapshot.content.trim() || undefined,
            topicIds: snapshot.topicIds,
            imageMediaIds: snapshot.imageMediaIds,
            imageLayout: snapshot.imageLayout,
          },
        })
        .then((post) => {
          draftIdRef.current = post.id;
          rememberPostDraft(post.id);
          savedKeyRef.current = key;
          setSaveLabel("Draft saved");
        })
        .catch(() => {
          setSaveLabel("Couldn’t save draft");
        });
    }, AUTOSAVE_MS);

    return () => window.clearTimeout(timer);
  }, [imagesBusy, isAuthenticated, ready, values]);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!isAuthenticated) {
          openSignIn();
          return;
        }
        form.handleSubmit();
      }}
      className="rounded-xl border bg-card p-4 shadow-xs"
    >
      <div className="flex gap-3">
        <UserAvatar
          user={viewer ?? user}
          size="lg"
        />
        <form.Field
          name="content"
          children={(field) => {
            const invalid = isFieldInvalid(field);
            return (
              <Field
                data-invalid={invalid}
                className="min-w-0 flex-1"
              >
                <Textarea
                  id={field.name}
                  name={field.name}
                  placeholder="Share a snippet, a win, or a question with the community…"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={invalid}
                  rows={3}
                  className="min-h-20 max-h-48 field-sizing-content resize-none border-0 bg-transparent px-0 focus-visible:ring-0"
                />
                {invalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />
      </div>
      <form.Field
        name="imageLayout"
        children={(layoutField) => (
          <form.Field
            name="imageMediaIds"
            children={(idsField) => (
              <div className="mt-3">
                <PostImagePicker
                  images={attached}
                  layout={layoutField.state.value}
                  disabled={createPost.isPending || updatePost.isPending}
                  onBusyChange={setImagesBusy}
                  onLayoutChange={layoutField.handleChange}
                  onImagesChange={(next) => {
                    setAttached(next);
                    idsField.handleChange(next.map((image) => image.id));
                  }}
                />
              </div>
            )}
          />
        )}
      />
      <form.Field
        name="topicIds"
        children={(field) => (
          <div className="mt-3">
            <TopicPicker
              value={field.state.value}
              onChange={field.handleChange}
              disabled={createPost.isPending || updatePost.isPending}
            />
          </div>
        )}
      />
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-center text-xs text-muted-foreground sm:text-left">
          {saveLabel}
        </p>
        <form.Subscribe
          selector={(state) =>
            [
              state.values.content,
              state.values.imageMediaIds,
              state.isSubmitting,
            ] as const
          }
          children={([content, imageMediaIds, isSubmitting]) => (
            <Button
              type="submit"
              size="sm"
              className="w-full sm:w-auto"
              disabled={
                (!content.trim() && imageMediaIds.length === 0) ||
                isSubmitting ||
                createPost.isPending ||
                updatePost.isPending ||
                imagesBusy
              }
            >
              {isSubmitting || createPost.isPending || updatePost.isPending
                ? "Posting..."
                : "Post"}
            </Button>
          )}
        />
      </div>
    </form>
  );
};
