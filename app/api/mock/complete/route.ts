import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/index";
import { orderTable } from "@/db/schema";
import { getOrderByNumber, markOrderPaid, releaseReservation } from "@/lib/orders";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { firstError, mockCompleteSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const ip = await getClientIp();
  const limited = await checkRateLimit(`mock:${ip}`, 30, 60);
  if (!limited.ok) {
    return NextResponse.json({ redirect: "/shop" }, { status: 429 });
  }

  const body = mockCompleteSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ redirect: "/shop", error: firstError(body.error) }, { status: 400 });
  }

  const { order: orderNumber, outcome } = body.data;

  const order = await getOrderByNumber(orderNumber);
  if (!order) {
    return NextResponse.json({ redirect: "/shop" }, { status: 404 });
  }

  if (outcome === "success") {
    const updated = await markOrderPaid(order.orderNumber);
    return NextResponse.json({
      redirect: `/orders/${order.orderNumber}${
        updated.status === "paid" ? "" : "?status=insufficient"
      }`,
    });
  }

  await releaseReservation(order.orderNumber);
  await db
    .update(orderTable)
    .set({ paymentStatus: outcome === "failed" ? "failed" : "abandoned" })
    .where(eq(orderTable.id, order.id));

  return NextResponse.json({ redirect: `/orders/${order.orderNumber}?status=failed` });
}
