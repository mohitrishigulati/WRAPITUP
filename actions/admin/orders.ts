"use server";

import { revalidatePath } from "next/cache";
import { OrderStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getAdminOrder } from "@/lib/admin/queries";
import { sendShippingUpdateEmail } from "@/lib/mail-shipping";
import { orderUpdateSchema } from "@/lib/validators/admin";
import type { ActionResult } from "@/types/actions";

export async function updateOrderAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin("/admin/orders");

  const parsed = orderUpdateSchema.safeParse({
    orderId: formData.get("orderId"),
    status: formData.get("status"),
    trackingNumber: formData.get("trackingNumber") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, message: "Invalid order update" };
  }

  const existing = await getAdminOrder(parsed.data.orderId);
  if (!existing) {
    return { ok: false, message: "Order not found" };
  }

  const nextStatus = parsed.data.status as OrderStatus;
  const trackingNumber = parsed.data.trackingNumber?.trim() || null;
  const wasNotShipped = existing.status !== "SHIPPED";
  const nowShipped = nextStatus === "SHIPPED";

  await db.order.update({
    where: { id: parsed.data.orderId },
    data: {
      status: nextStatus,
      trackingNumber,
    },
  });

  if (wasNotShipped && nowShipped) {
    const to = existing.user?.email ?? existing.guestEmail;
    if (to) {
      await sendShippingUpdateEmail({
        to,
        orderNumber: existing.orderNumber,
        trackingNumber,
      }).catch((error) => {
        console.error("[admin:order:email]", error);
      });
    }
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${parsed.data.orderId}`);
  return { ok: true, message: "Order updated" };
}
