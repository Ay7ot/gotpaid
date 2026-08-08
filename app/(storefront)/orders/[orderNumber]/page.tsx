import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PaymentRetry } from "@/components/storefront/payment-retry";
import { CreditAlertCard } from "@/components/ui/credit-alert-card";
import { getOrderByNumber } from "@/lib/orders";
import { formatDate, formatNaira } from "@/lib/format";

export const metadata: Metadata = {
  title: "Order - GOTPAID",
  description: "Your GOTPAID order.",
};

const STATUS_LABELS: Record<string, string> = {
  paid: "CONFIRMED",
  pending_payment: "AWAITING PAYMENT",
  payment_received_insufficient_stock: "STOCK HOLD",
  fulfilled: "FULFILLED",
  shipped: "SHIPPED",
  delivered: "DELIVERED",
  cancelled: "CANCELLED",
  refunded: "REFUNDED",
};

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { orderNumber } = await params;
  const { status: failedParam } = await searchParams;
  const order = await getOrderByNumber(orderNumber);
  if (!order) notFound();

  const paid = order.status === "paid";
  const insufficient = order.status === "payment_received_insufficient_stock";
  const failed = failedParam === "failed" && order.status === "pending_payment";

  const address = order.shippingAddress;

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <p className="text-micro text-smoke font-mono tracking-[0.18em] uppercase">
        {paid ? "Payment confirmed" : "Order"}
      </p>
      <h1 className="font-display text-display-sm tracking-display mt-2 leading-[0.95] uppercase">
        {paid ? "Credit alert" : (STATUS_LABELS[order.status] ?? "Order")}
      </h1>

      {failed ? (
        <div className="border-alert mt-6 border px-4 py-3">
          <p className="text-micro text-alert font-mono tracking-[0.1em] uppercase">
            Payment didn&rsquo;t go through. Nothing was charged - try again.
          </p>
          <div className="mt-4">
            <PaymentRetry orderNumber={order.orderNumber} />
          </div>
        </div>
      ) : null}

      {insufficient ? (
        <div className="border-alert mt-6 border px-4 py-3">
          <p className="text-micro text-alert font-mono tracking-[0.1em] uppercase">
            We received your payment but an item sold out. We&rsquo;ll be in touch to sort it out.
          </p>
        </div>
      ) : null}

      <div className="mt-8">
        <CreditAlertCard
          amount={formatNaira(order.total)}
          rows={[
            { label: "ORDER", value: order.orderNumber },
            { label: "DATE", value: formatDate(order.createdAt) },
            { label: "STATUS", value: STATUS_LABELS[order.status] ?? order.status },
            { label: "SHIPPING", value: formatNaira(order.shippingFee) },
            { label: "TOTAL", value: formatNaira(order.total) },
          ]}
        />
      </div>

      <section className="mt-10">
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
      </section>

      {address ? (
        <section className="mt-8">
          <h2 className="border-hairline text-micro text-smoke border-b pb-2 font-mono tracking-[0.16em] uppercase">
            Ship to
          </h2>
          <address className="text-caption mt-3 font-mono not-italic">
            <p>{address.recipientName}</p>
            <p>{address.streetAddress}</p>
            <p>
              {address.city}, {address.state}
            </p>
            <p>{address.phone}</p>
          </address>
        </section>
      ) : null}

      <div className="mt-10">
        <Link
          href="/shop"
          className="border-void text-caption hover:bg-void hover:text-paper inline-flex border px-8 py-3 font-mono tracking-[0.12em] uppercase transition-colors"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
