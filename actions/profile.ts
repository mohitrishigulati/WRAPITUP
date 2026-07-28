"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/require-user";
import { profileSchema } from "@/lib/validators/profile";
import { sanitizeReviewText } from "@/lib/sanitize";
import type { ActionResult } from "@/types/actions";

function fieldErrors(error: { flatten: () => { fieldErrors: Record<string, string[]> } }) {
  return error.flatten().fieldErrors;
}

export async function updateProfileAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser("/account/profile");

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  }

  const email = parsed.data.email.toLowerCase();
  if (email !== user.email) {
    const taken = await db.user.findUnique({ where: { email } });
    if (taken && taken.id !== user.id) {
      return {
        ok: false,
        fieldErrors: { email: ["That email is already in use"] },
      };
    }
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      name: sanitizeReviewText(parsed.data.name) ?? parsed.data.name,
      email,
      emailVerified: email === user.email ? undefined : null,
    },
  });

  revalidatePath("/account/profile");
  return { ok: true, message: "Profile updated" };
}
