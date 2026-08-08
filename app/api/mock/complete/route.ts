import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/index";
import { orderTable } from "@/db/schema";
import { getOrderByNumber, markOrderPaid, releaseReservation } from "@/lib/orders";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as { order?: string; outcome?: string };
  const { order: orderNumber, outcome } = body;

  if (!orderNumber || !outcome) {
    return NextResponse.json({ redirect: "/shop" }, { status: 400 });
  }

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
