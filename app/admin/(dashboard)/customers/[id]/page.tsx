import Link from "next/link";
import { notFound } from "next/navigation";
import { getCustomerDetail } from "@/lib/admin-customers";
import { formatDate, formatNaira } from "@/lib/format";

export const metadata = { title: "Customer - GOTPAID Admin" };

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "PENDING PAYMENT",
  paid: "PAID",
  fulfilled: "FULFILLED",
  shipped: "SHIPPED",
  delivered: "DELIVERED",
  cancelled: "CANCELLED",
  refunded: "REFUNDED",
  payment_received_insufficient_stock: "STOCK HOLD",
};

export default async function AdminCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await getCustomerDetail(id);
  if (!customer) notFound();

  const ltv = customer.orders.reduce(
    (sum, order) =>
      ["paid", "fulfilled", "shipped", "delivered"].includes(order.status)
        ? sum + order.total
        : sum,
    0,
  );

  return (
    <div className="max-w-4xl">
      <p className="text-micro text-smoke font-mono tracking-[0.16em] uppercase">
        <Link href="/admin/customers" className="hover:underline">
          Customers
        </Link>{" "}
        / {customer.name ?? "Guest"}
      </p>
      <h1 className="font-display text-display-sm tracking-display mt-2 leading-[0.95] uppercase">
        {customer.name ?? "Guest"}
      </h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="border-hairline text-micro text-smoke border-b pb-2 font-mono tracking-[0.16em] uppercase">
            Contact
          </h2>
          <dl className="text-caption mt-4 space-y-2 font-mono">
            <div className="flex justify-between gap-4">
              <dt className="text-smoke">Email</dt>
              <dd>{customer.email ?? "-"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-smoke">Phone</dt>
              <dd>{customer.phone ?? "-"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-smoke">WhatsApp</dt>
              <dd>{customer.whatsappNumber ?? "-"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-smoke">Customer since</dt>
              <dd>{formatDate(customer.createdAt)}</dd>
            </div>
            <div className="border-hairline flex justify-between gap-4 border-t pt-2">
              <dt className="text-void">Lifetime value</dt>
              <dd>{formatNaira(ltv)}</dd>
            </div>
          </dl>

          <h2 className="border-hairline text-micro text-smoke mt-8 border-b pb-2 font-mono tracking-[0.16em] uppercase">
            Addresses
          </h2>
          {customer.addresses.length ? (
            <ul className="mt-4 space-y-3">
              {customer.addresses.map((address) => (
                <li key={address.id} className="border-hairline text-caption border p-3 font-mono">
                  <p>{address.recipientName}</p>
                  <p>{address.streetAddress}</p>
                  <p>
                    {address.city}, {address.state}
                  </p>
                  <p className="text-smoke">{address.phone}</p>
                  {address.landmark ? <p className="text-smoke">{address.landmark}</p> : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-caption text-smoke mt-4 font-mono">No saved addresses.</p>
          )}
        </section>

        <section>
          <h2 className="border-hairline text-micro text-smoke border-b pb-2 font-mono tracking-[0.16em] uppercase">
            Order history
          </h2>
          {customer.orders.length ? (
            <ul className="divide-hairline border-hairline mt-4 divide-y border-y">
              {customer.orders.map((order) => {
                const itemCount = order.items.reduce((n, i) => n + i.quantity, 0);
                return (
                  <li key={order.id}>
                    <Link
                      href={`/admin/orders/${order.orderNumber}`}
                      className="group flex items-center justify-between gap-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="text-caption font-mono uppercase group-hover:underline">
                          {order.orderNumber}
                        </p>
                        <p className="text-micro text-smoke mt-0.5 font-mono uppercase">
                          {formatDate(order.createdAt)} · {itemCount}{" "}
                          {itemCount === 1 ? "item" : "items"}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-caption font-mono">{formatNaira(order.total)}</p>
                        <p className="text-micro text-smoke mt-0.5 font-mono uppercase">
                          {STATUS_LABELS[order.status] ?? order.status}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-caption text-smoke mt-4 font-mono">No orders yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}
