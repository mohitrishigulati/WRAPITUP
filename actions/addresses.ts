"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/require-user";
import { getAddressForUser } from "@/lib/account/queries";
import { addressFormSchema } from "@/lib/validators/profile";
import type { ActionResult } from "@/types/actions";

function fieldErrors(error: { flatten: () => { fieldErrors: Record<string, string[]> } }) {
  return error.flatten().fieldErrors;
}

async function clearDefaultFlags(userId: string, field: "isDefaultShipping" | "isDefaultBilling") {
  await db.address.updateMany({
    where: { userId, [field]: true },
    data: { [field]: false },
  });
}

export async function createAddressAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser("/account/profile");

  const parsed = addressFormSchema.safeParse({
    label: formData.get("label") || undefined,
    fullName: formData.get("fullName"),
    line1: formData.get("line1"),
    line2: formData.get("line2") || undefined,
    city: formData.get("city"),
    state: formData.get("state") || undefined,
    postalCode: formData.get("postalCode"),
    country: formData.get("country") || "US",
    phone: formData.get("phone") || undefined,
    isDefaultShipping: formData.get("isDefaultShipping") === "on",
    isDefaultBilling: formData.get("isDefaultBilling") === "on",
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  }

  if (parsed.data.isDefaultShipping) {
    await clearDefaultFlags(user.id, "isDefaultShipping");
  }
  if (parsed.data.isDefaultBilling) {
    await clearDefaultFlags(user.id, "isDefaultBilling");
  }

  await db.address.create({
    data: {
      userId: user.id,
      label: parsed.data.label ?? null,
      fullName: parsed.data.fullName,
      line1: parsed.data.line1,
      line2: parsed.data.line2 ?? null,
      city: parsed.data.city,
      state: parsed.data.state ?? null,
      postalCode: parsed.data.postalCode,
      country: parsed.data.country,
      phone: parsed.data.phone ?? null,
      isDefaultShipping: parsed.data.isDefaultShipping ?? false,
      isDefaultBilling: parsed.data.isDefaultBilling ?? false,
    },
  });

  revalidatePath("/account/profile");
  return { ok: true, message: "Address saved" };
}

export async function updateAddressAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser("/account/profile");
  const addressId = String(formData.get("addressId") ?? "");
  const existing = await getAddressForUser(user.id, addressId);
  if (!existing) {
    return { ok: false, message: "Address not found" };
  }

  const parsed = addressFormSchema.safeParse({
    label: formData.get("label") || undefined,
    fullName: formData.get("fullName"),
    line1: formData.get("line1"),
    line2: formData.get("line2") || undefined,
    city: formData.get("city"),
    state: formData.get("state") || undefined,
    postalCode: formData.get("postalCode"),
    country: formData.get("country") || "US",
    phone: formData.get("phone") || undefined,
    isDefaultShipping: formData.get("isDefaultShipping") === "on",
    isDefaultBilling: formData.get("isDefaultBilling") === "on",
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  }

  if (parsed.data.isDefaultShipping) {
    await clearDefaultFlags(user.id, "isDefaultShipping");
  }
  if (parsed.data.isDefaultBilling) {
    await clearDefaultFlags(user.id, "isDefaultBilling");
  }

  await db.address.update({
    where: { id: existing.id },
    data: {
      label: parsed.data.label ?? null,
      fullName: parsed.data.fullName,
      line1: parsed.data.line1,
      line2: parsed.data.line2 ?? null,
      city: parsed.data.city,
      state: parsed.data.state ?? null,
      postalCode: parsed.data.postalCode,
      country: parsed.data.country,
      phone: parsed.data.phone ?? null,
      isDefaultShipping: parsed.data.isDefaultShipping ?? false,
      isDefaultBilling: parsed.data.isDefaultBilling ?? false,
    },
  });

  revalidatePath("/account/profile");
  return { ok: true, message: "Address updated" };
}

export async function deleteAddressAction(addressId: string): Promise<ActionResult> {
  const user = await requireUser("/account/profile");
  const existing = await getAddressForUser(user.id, addressId);
  if (!existing) {
    return { ok: false, message: "Address not found" };
  }

  const linkedOrders = await db.order.count({
    where: {
      OR: [{ shippingAddressId: addressId }, { billingAddressId: addressId }],
    },
  });
  if (linkedOrders > 0) {
    return {
      ok: false,
      message: "This address is linked to a past order and cannot be deleted",
    };
  }

  await db.address.delete({ where: { id: addressId } });
  revalidatePath("/account/profile");
  return { ok: true, message: "Address removed" };
}
