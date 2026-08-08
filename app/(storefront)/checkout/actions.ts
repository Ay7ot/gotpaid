"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db/index";
import { orderTable } from "@/db/schema";
import { normalizePhone } from "@/lib/nigeria";
import { createOrder } from "@/lib/orders";
import { getPaymentProvider } from "@/lib/payments";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { checkoutSchema, firstError } from "@/lib/validators";

export type CheckoutState = { error?: string } | undefined;

export async function submitCheckout(_prevState: CheckoutState, formData: FormData) {
  const itemsRaw = String(formData.get("items") ?? "[]");
  let items: unknown;
  try {
    items = JSON.parse(itemsRaw);
  } catch {
    return { error: "Your cart could not be read. Please try again." };
  }

  const input = {
    items,
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "")
      .trim()
      .toLowerCase(),
    phone: String(formData.get("phone") ?? "").trim(),
    state: String(formData.get("state") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim(),
    street: String(formData.get("street") ?? "").trim(),
    landmark: String(formData.get("landmark") ?? "").trim(),
  };

  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) return { error: firstError(parsed.error) };
  const { items: validItems, name, email, phone, state, city, street, landmark } = parsed.data;

  const ip = await getClientIp();
  const limited = await checkRateLimit(`checkout:${ip}`, 10, 600);
  if (!limited.ok) {
    return { error: "Too many orders from this device. Try again in a few minutes." };
  }

  let authorizationUrl: string;
  try {
    const order = await createOrder({
      items: validItems,
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
