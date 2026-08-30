import { z } from "zod";

const emptyOrUrl = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || z.url().safeParse(value).success,
    "Enter a valid URL",
  );

export const profileSettingsSchema = z.object({
  displayName: z
    .string()
    .max(100, "Display name must be at most 100 characters"),
  bio: z.string().max(500, "Bio must be at most 500 characters"),
  location: z.string().max(100, "Location must be at most 100 characters"),
  github: z.string().max(100, "GitHub username must be at most 100 characters"),
  website: emptyOrUrl,
  avatarUrl: emptyOrUrl,
});

export type ProfileSettingsFormValues = z.infer<typeof profileSettingsSchema>;

export const notificationPreferencesFormSchema = z.object({
  mentions: z.boolean(),
  comments: z.boolean(),
  likes: z.boolean(),
  newFollowers: z.boolean(),
});

export const settingsFormSchema = z.object({
  ...profileSettingsSchema.shape,
  ...notificationPreferencesFormSchema.shape,
});

export type SettingsFormValues = z.infer<typeof settingsFormSchema>;

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
