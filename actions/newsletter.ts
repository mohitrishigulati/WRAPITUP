"use server";

import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
});

export type NewsletterState = { ok: boolean; message?: string };

export async function subscribeNewsletterAction(
  _prev: NewsletterState | undefined,
  formData: FormData,
): Promise<NewsletterState> {
  const parsed = schema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { ok: false, message: "Enter a valid email address." };
  }

  try {
    await db.newsletterSubscriber.upsert({
      where: { email: parsed.data.email.toLowerCase() },
      create: { email: parsed.data.email.toLowerCase() },
      update: {},
    });
    return { ok: true, message: "Thanks — you're on the list!" };
  } catch {
    return { ok: false, message: "Something went wrong. Try again." };
  }
}
