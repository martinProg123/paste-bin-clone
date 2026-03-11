import { z } from 'zod';

export const CreatePasteSchema = z.object({
  title: z.string().max(100, "Title is too long").or(z.literal('Untitled')),
  content: z.string()
    .min(1, "Content is required")
    .max(500000, "Content must be under 500kb"),
  visibility: z.enum(['public', 'private', 'unlisted']),
  expiresAt: z.string().optional(),
});

// Create a type from the schema for your TypeScript interfaces
export type CreatePasteInput = z.infer<typeof CreatePasteSchema>;