import { eq } from "drizzle-orm";
import { db } from "@/db/index";
import { orderTable } from "@/db/schema";
import { markOrderPaid } from "@/lib/orders";
import { getPaymentProvider } from "@/lib/payments";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const raw = await request.text();
  const signature = request.headers.get("x-paystack-signature") ?? undefined;

  let result: { reference: string; status: "success" | "failed" };
  try {
    const provider = getPaymentProvider();
    result = await provider.handleWebhook(raw, signature);
  } catch (error) {
    return new Response(`Invalid webhook: ${(error as Error).message}`, { status: 400 });
  }

  const order = await db.query.orderTable.findFirst({
    where: eq(orderTable.paystackReference, result.reference),
  });
  if (!order) {
    return new Response("Order not found", { status: 404 });
  }

  if (result.status === "success") {
    await markOrderPaid(order.orderNumber);
  }

  return new Response("ok", { status: 200 });
}
