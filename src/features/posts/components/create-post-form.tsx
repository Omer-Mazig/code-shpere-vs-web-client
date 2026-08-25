import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError } from "@/components/ui/field";
import type { useCreatePost } from "../hooks/use-create-post";
import { useAuth } from "@/features/auth/auth.context";
import { useSignInModal } from "@/features/auth/sign-in-modal.context";
import { toast } from "sonner";
import { UserAvatar } from "@/components/shared/user-avatar";
import { createPostSchema } from "@/lib/form-schemas";
import { isFieldInvalid } from "@/lib/form";

type CreatePostFormProps = {
  createPost: ReturnType<typeof useCreatePost>;
};

export const CreatePostForm = ({ createPost }: CreatePostFormProps) => {
  const { user, isAuthenticated } = useAuth();
  const { open: openSignIn } = useSignInModal();

  const form = useForm({
    defaultValues: {
      content: "",
    },
    validators: {
      onSubmit: createPostSchema,
    },
    onSubmit: async ({ value }) => {
      if (!isAuthenticated) {
        openSignIn();
        return;
      }

      await createPost.mutateAsync({ content: value.content.trim() });
      toast.success("Post created!");
      form.reset();
    },
  });

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
          user={user}
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
      <div className="mt-3 flex justify-end">
        <form.Subscribe
          selector={(state) => [state.values.content, state.isSubmitting] as const}
          children={([content, isSubmitting]) => (
            <Button
              type="submit"
              size="sm"
              disabled={!content.trim() || isSubmitting || createPost.isPending}
            >
              {isSubmitting || createPost.isPending ? "Posting..." : "Post"}
            </Button>
          )}
        />
      </div>
    </form>
  );
};
