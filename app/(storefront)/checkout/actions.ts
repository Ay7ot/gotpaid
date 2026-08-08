"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db/index";
import { orderTable } from "@/db/schema";
import { isValidPhone, normalizePhone } from "@/lib/nigeria";
import { createOrder, type OrderItemInput } from "@/lib/orders";
import { getPaymentProvider } from "@/lib/payments";

export type CheckoutState = { error?: string } | undefined;

const EMAIL_RE = /^\S+@\S+\.\S+$/;

export async function submitCheckout(_prevState: CheckoutState, formData: FormData) {
  const itemsRaw = String(formData.get("items") ?? "[]");
  let items: OrderItemInput[] = [];
  try {
    items = JSON.parse(itemsRaw) as OrderItemInput[];
  } catch {
    return { error: "Your cart could not be read. Please try again." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const state = String(formData.get("state") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const street = String(formData.get("street") ?? "").trim();
  const landmark = String(formData.get("landmark") ?? "").trim();

  if (!items.length) return { error: "Your cart is empty." };
  if (!name) return { error: "Enter the recipient name." };
  if (!email || !EMAIL_RE.test(email)) return { error: "Enter a valid email for your receipt." };
  if (!phone || !isValidPhone(phone)) {
    return { error: "Enter a valid Nigerian phone number (e.g. 0801 234 5678)." };
  }
  if (!state || !city || !street) {
    return { error: "Enter your delivery state, city, and street address." };
  }

  let authorizationUrl: string;
  try {
    const order = await createOrder({
      items,
      customer: { name, email, phone: normalizePhone(phone) },
      address: {
        recipientName: name,
        phone: normalizePhone(phone),
        state,
        city,
        streetAddress: street,
        landmark,
      },
    });

    const provider = getPaymentProvider();
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/orders/${order.orderNumber}`;
    const init = await provider.initialize({
      order,
      amount: order.total,
      customerEmail: email,
      callbackUrl,
    });

    await db
      .update(orderTable)
      .set({ paystackReference: init.reference })
      .where(eq(orderTable.id, order.id));

    authorizationUrl = init.authorization_url;
  } catch (error) {
    return { error: (error as Error).message };
  }

  redirect(authorizationUrl);
}
