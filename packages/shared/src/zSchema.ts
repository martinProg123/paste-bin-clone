import { z } from 'zod';

export const CreatePasteSchema = z.object({
  title: z.string().max(100, "Title is too long").or(z.literal('Untitled')),
  content: z.string()
    .min(1, "Content is required")
    .max(500000, "Content must be under 500kb"),
  visibility: z.enum(['public', 'private', 'unlisted']),
  expiresAt: z.string().optional(),
  password: z.string().min(4, "Password must be at least 4 characters").optional(),
}).superRefine((data, ctx) => {
  if (data.visibility === 'private' && (!data.password || data.password.length < 4)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Password is required for private pastes (min 4 characters)",
      path: ["password"],
    });
  }
});

// Create a type from the schema for your TypeScript interfaces
export type CreatePasteInput = z.infer<typeof CreatePasteSchema>;


export const ViewPasteSchema = z.object({
  slug: z.string()
  .length(21, "Invalid Length")
  .regex(/^[A-Za-z0-9_-]+$/, "Invalid slug format")
});
export type PasteSlug = z.infer<typeof ViewPasteSchema>;

export const ViewPasteWithPasswordSchema = z.object({
  slug: z.string()
    .length(21, "Invalid Length")
    .regex(/^[A-Za-z0-9_-]+$/, "Invalid slug format"),
  password: z.string().min(4, "Password must be at least 4 characters"),
});

export const SearchSchema = z.object({
  keyword: z.string()
  .trim()  
  .min(1, "At least 1 character")
  .max(100, "Keyword is too long"),
  cursor: z.string().datetime({ message: "Invalid cursor format" }).optional(),
});
