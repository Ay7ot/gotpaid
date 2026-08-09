"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/index";
import { orderItemTable, orderTable, variantTable } from "@/db/schema";
import { type OrderStatus } from "@/lib/admin-orders";
import { getAdminSession } from "@/lib/admin/session";
import { releaseReservation } from "@/lib/orders";
import { getPaymentProvider } from "@/lib/payments";

export type OrderResult = { error?: string; ok?: boolean };

const ALLOWED_STATUSES = ["paid", "fulfilled", "shipped", "delivered", "cancelled"];

export async function updateOrderStatus(formData: FormData): Promise<OrderResult> {
  const session = await getAdminSession();
  if (!session) return { error: "Not authorized." };

  const id = String(formData.get("id") ?? "");
  const statusRaw = String(formData.get("status") ?? "");
  const tracking = String(formData.get("tracking") ?? "").trim() || null;

  if (!id) return { error: "Missing order id." };
  if (!ALLOWED_STATUSES.includes(statusRaw)) return { error: "Invalid status." };
  if (statusRaw === "shipped" && !tracking) {
    return { error: "Add a tracking reference when marking as shipped." };
  }

  try {
    const order = await db.query.orderTable.findFirst({ where: eq(orderTable.id, id) });
    if (!order) return { error: "Order not found." };

    if (statusRaw === "cancelled" && order.status === "pending_payment") {
      await releaseReservation(order.orderNumber);
    }

    await db
      .update(orderTable)
      .set({ status: statusRaw as OrderStatus, trackingNumber: tracking })
      .where(eq(orderTable.id, id));

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${order.orderNumber}`);
    return { ok: true };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export async function refundOrder(formData: FormData): Promise<OrderResult> {
  const session = await getAdminSession();
  if (!session) return { error: "Not authorized." };

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing order id." };

  const order = await db.query.orderTable.findFirst({
    where: eq(orderTable.id, id),
    with: { items: true },
  });
  if (!order) return { error: "Order not found." };
  if (!order.paystackReference) return { error: "No payment reference on this order." };

  try {
    const provider = getPaymentProvider();
    const result = await provider.refund(order.paystackReference, order.total);
    if (result.status !== "success") {
      return { error: result.message ?? "Refund could not be completed." };
    }

    await db.transaction(async (tx) => {
      const items = await tx
        .select()
        .from(orderItemTable)
        .where(eq(orderItemTable.orderId, order.id));
      for (const item of items) {
        if (!item.variantId) continue;
        await tx
          .update(variantTable)
          .set({ stockQuantity: sql`${variantTable.stockQuantity} + ${item.quantity}` })
          .where(eq(variantTable.id, item.variantId));
      }
      await tx
        .update(orderTable)
        .set({ status: "refunded", paymentStatus: "refunded" })
        .where(eq(orderTable.id, order.id));
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${order.orderNumber}`);
    return { ok: true };
  } catch (error) {
    return { error: (error as Error).message };
  }
}
