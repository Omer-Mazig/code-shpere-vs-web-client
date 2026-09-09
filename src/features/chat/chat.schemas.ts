import { z } from "zod";

export const chatMessageSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Message is required")
    .max(2000, "Message must be at most 2000 characters"),
});

export type ChatMessageFormValues = z.infer<typeof chatMessageSchema>;
