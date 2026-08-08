import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { RefundButton } from "@/components/admin/refund-button";
import { Badge } from "@/components/ui/badge";
import { db } from "@/db/index";
import { orderTable } from "@/db/schema";
import { formatDate, formatNaira } from "@/lib/format";

export const metadata = { title: "Order - GOTPAID Admin" };

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "PENDING PAYMENT",
  payment_received_insufficient_stock: "STOCK HOLD",
  paid: "PAID",
  fulfilled: "FULFILLED",
  shipped: "SHIPPED",
  delivered: "DELIVERED",
  cancelled: "CANCELLED",
  refunded: "REFUNDED",
};

export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const order = await db.query.orderTable.findFirst({
    where: eq(orderTable.orderNumber, orderNumber),
    with: { customer: true, items: true, shippingAddress: true },
  });
  if (!order) notFound();

  const address = order.shippingAddress;

  return (
    <div className="max-w-4xl">
      <p className="text-micro text-smoke font-mono tracking-[0.16em] uppercase">
        <Link href="/admin/orders" className="hover:underline">
          Orders
        </Link>{" "}
        / {order.orderNumber}
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-display-sm tracking-display leading-[0.95] uppercase">
          {order.orderNumber}
        </h1>
        <Badge tone={order.status === "pending_payment" ? "alert" : "void"}>
          {STATUS_LABELS[order.status] ?? order.status}
        </Badge>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="border-hairline text-micro text-smoke border-b pb-2 font-mono tracking-[0.16em] uppercase">
            Customer
          </h2>
          <dl className="text-caption mt-4 space-y-2 font-mono">
            <div className="flex justify-between gap-4">
              <dt className="text-smoke">Name</dt>
              <dd>{order.customer?.name ?? "Guest"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-smoke">Email</dt>
              <dd>{order.customer?.email ?? "-"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-smoke">Phone</dt>
              <dd>{order.customer?.phone ?? "-"}</dd>
            </div>
          </dl>

          <h2 className="border-hairline text-micro text-smoke mt-8 border-b pb-2 font-mono tracking-[0.16em] uppercase">
            Ship to
          </h2>
          {address ? (
            <address className="text-caption mt-4 font-mono not-italic">
              <p>{address.recipientName}</p>
              <p>{address.streetAddress}</p>
              <p>
                {address.city}, {address.state}
              </p>
              <p>{address.phone}</p>
            </address>
          ) : (
            <p className="text-caption text-smoke mt-4 font-mono">No address.</p>
          )}

          <h2 className="border-hairline text-micro text-smoke mt-8 border-b pb-2 font-mono tracking-[0.16em] uppercase">
            Payment
          </h2>
          <dl className="text-caption mt-4 space-y-2 font-mono">
            <div className="flex justify-between gap-4">
              <dt className="text-smoke">Provider</dt>
              <dd>{order.paymentProvider}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-smoke">Reference</dt>
              <dd className="text-right break-all">{order.paystackReference ?? "-"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-smoke">Payment status</dt>
              <dd>{order.paymentStatus ?? "-"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-smoke">Tracking</dt>
              <dd>{order.trackingNumber ?? "-"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-smoke">Date</dt>
              <dd>{formatDate(order.createdAt)}</dd>
            </div>
          </dl>
        </section>

        <section>
          <h2 className="border-hairline text-micro text-smoke border-b pb-2 font-mono tracking-[0.16em] uppercase">
            Items
          </h2>
          <ul className="divide-hairline border-hairline divide-y border-b">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="text-caption truncate font-mono uppercase">
                    {item.productName ?? "Item"}
                  </p>
                  <p className="text-micro text-smoke mt-0.5 font-mono uppercase">
                    {item.variantLabel ?? "-"} × {item.quantity}
                  </p>
                </div>
                <p className="text-caption shrink-0 font-mono">
                  {formatNaira(item.unitPriceAtPurchase * item.quantity)}
                </p>
              </li>
            ))}
          </ul>
          <dl className="text-caption mt-4 space-y-2 font-mono">
            <div className="flex justify-between gap-4">
              <dt className="text-smoke">Subtotal</dt>
              <dd>{formatNaira(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-smoke">Shipping</dt>
              <dd>{formatNaira(order.shippingFee)}</dd>
            </div>
            <div className="border-hairline flex justify-between gap-4 border-t pt-2">
              <dt>Total</dt>
              <dd className="text-title">{formatNaira(order.total)}</dd>
            </div>
          </dl>

          <div className="border-hairline mt-8 border-t pt-5">
            <h3 className="text-micro text-smoke font-mono tracking-[0.16em] uppercase">
              Update status
            </h3>
            <div className="mt-3 max-w-sm">
              <OrderStatusForm
                orderId={order.id}
                orderNumber={order.orderNumber}
                current={order.status}
              />
            </div>
          </div>

          <div className="mt-6">
            <RefundButton orderId={order.id} />
          </div>
        </section>
      </div>
    </div>
  );
}
