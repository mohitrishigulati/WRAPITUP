import { z } from "zod";

export const addressSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required"),
  line1: z.string().trim().min(3, "Address line is required"),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(2, "City is required"),
  state: z.string().trim().optional(),
  postalCode: z.string().trim().min(3, "Postal code is required"),
  country: z.string().trim().min(2, "Country is required").default("US"),
  phone: z.string().trim().optional(),
});

export const checkoutSchema = z
  .object({
    guestEmail: z.string().email().optional(),
    couponCode: z.string().trim().optional(),
    billingSameAsShipping: z.boolean().default(true),
    shipping: addressSchema,
    billing: addressSchema.optional(),
    saveAddress: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.billingSameAsShipping && !data.billing) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Billing address is required",
        path: ["billing"],
      });
    }
  });

export const cartLineSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
  personalization: z.record(z.string(), z.string()).optional(),
});

export const cartLinesSchema = z.array(cartLineSchema).min(1);

export type AddressInput = z.infer<typeof addressSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;

export type CheckoutPendingPayload = {
  items: { variantId: string; quantity: number; personalization?: Record<string, string> }[];
  couponCode?: string;
  guestEmail?: string;
  shipping: AddressInput;
  billing: AddressInput;
  billingSameAsShipping: boolean;
  saveAddress?: boolean;
};
