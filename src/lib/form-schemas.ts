import { z } from "zod";
import { passwordSchema } from "@/features/auth/auth.schemas";

const emptyOrUrl = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || z.url().safeParse(value).success,
    "Enter a valid URL",
  );

const mediaObjectPath =
  /^\/api\/media\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const emptyOrProfileImage = z
  .string()
  .trim()
  .refine(
    (value) =>
      value === "" ||
      mediaObjectPath.test(value) ||
      z.url().safeParse(value).success,
    "Choose an image to upload",
  );

export const profileSettingsSchema = z.object({
  displayName: z
    .string()
    .max(100, "Display name must be at most 100 characters"),
  bio: z.string().max(500, "Bio must be at most 500 characters"),
  location: z.string().max(100, "Location must be at most 100 characters"),
  github: z.string().max(100, "GitHub username must be at most 100 characters"),
  website: emptyOrUrl,
  avatarUrl: emptyOrProfileImage,
  coverImageUrl: emptyOrProfileImage,
});

export type ProfileSettingsFormValues = z.infer<typeof profileSettingsSchema>;

export const notificationPreferencesFormSchema = z.object({
  mentions: z.boolean(),
  comments: z.boolean(),
  likes: z.boolean(),
  newFollowers: z.boolean(),
});

export const settingsPasswordFieldsSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string(),
  confirmNewPassword: z.string(),
});

export function isPasswordChangeRequested(values: {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}): boolean {
  return (
    values.currentPassword.length > 0 ||
    values.newPassword.length > 0 ||
    values.confirmNewPassword.length > 0
  );
}

export const accountSettingsSchema = settingsPasswordFieldsSchema.superRefine(
  (data, ctx) => {
    if (!isPasswordChangeRequested(data)) {
      return;
    }

    if (!data.currentPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["currentPassword"],
        message: "Current password is required",
      });
    }

    const parsedNewPassword = passwordSchema.safeParse(data.newPassword);
    if (!parsedNewPassword.success) {
      for (const issue of parsedNewPassword.error.issues) {
        ctx.addIssue({ ...issue, path: ["newPassword"] });
      }
    }

    if (data.newPassword !== data.confirmNewPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmNewPassword"],
        message: "Passwords do not match",
      });
    }
  },
);

export type AccountSettingsFormValues = z.infer<typeof accountSettingsSchema>;

export const createPostSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Write something before posting")
    .max(5000, "Post must be at most 5000 characters"),
});

export type CreatePostFormValues = z.infer<typeof createPostSchema>;

export const resharePostSchema = z.object({
  content: z.string().max(5000, "Post must be at most 5000 characters"),
});

export type ResharePostFormValues = z.infer<typeof resharePostSchema>;

export const commentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Write a comment first")
    .max(2000, "Comment must be at most 2000 characters"),
});

export type CommentFormValues = z.infer<typeof commentSchema>;

export const articleEditorSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must be at most 200 characters"),
  body: z.string().trim().min(1, "Content is required"),
  coverImageUrl: emptyOrUrl,
});

export type ArticleEditorFormValues = z.infer<typeof articleEditorSchema>;
