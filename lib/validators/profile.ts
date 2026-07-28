import { z } from "zod";
import { addressSchema } from "@/lib/validators/checkout";

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
});

export const addressFormSchema = addressSchema.extend({
  label: z.string().trim().optional(),
  isDefaultShipping: z.boolean().optional(),
  isDefaultBilling: z.boolean().optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type AddressFormInput = z.infer<typeof addressFormSchema>;
