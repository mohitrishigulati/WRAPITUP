import { z } from "zod";

export const reviewFormSchema = z.object({
  productId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional(),
  body: z.string().trim().min(1, "Review text is required").max(2000),
  photoUrl: z.preprocess(
    (val) => (val === "" || val == null ? undefined : String(val).trim()),
    z.string().max(512).optional(),
  ),
});

export type ReviewFormInput = z.infer<typeof reviewFormSchema>;
