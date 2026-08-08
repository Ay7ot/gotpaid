"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db/index";
import { orderTable } from "@/db/schema";
import { getOrderByNumber } from "@/lib/orders";
import { getPaymentProvider } from "@/lib/payments";

export async function retryPayment(orderNumber: string) {
  const order = await getOrderByNumber(orderNumber);
  if (!order) return;

  const provider = getPaymentProvider();
  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/orders/${order.orderNumber}`;
  const init = await provider.initialize({
    order,
    amount: order.total,
    customerEmail: order.customer?.email ?? "",
    callbackUrl,
  });

  await db
    .update(orderTable)
    .set({ paystackReference: init.reference })
    .where(eq(orderTable.id, order.id));

  redirect(init.authorization_url);
}
