import Link from "next/link";
import { AdminOrdersToolbar } from "@/components/admin/admin-orders-toolbar";
import { Badge } from "@/components/ui/badge";
import { getAdminOrders, type OrderStatus } from "@/lib/admin-orders";
import { formatDate, formatNaira } from "@/lib/format";

export const metadata = { title: "Orders - GOTPAID Admin" };

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

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const result = await getAdminOrders({
    status: single(sp.status) as OrderStatus | undefined,
    q: single(sp.q),
    page: single(sp.page) ? Number(single(sp.page)) : undefined,
  });

  const totalPages = Math.max(1, Math.ceil(result.total / result.perPage));

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-micro text-smoke font-mono tracking-[0.16em] uppercase">Sales</p>
          <h1 className="font-display text-display-sm tracking-display mt-2 leading-[0.95] uppercase">
            Orders
          </h1>
        </div>
      </div>

      <div className="mt-6">
        <AdminOrdersToolbar />
      </div>

      <p className="text-micro text-smoke mt-4 font-mono tracking-[0.14em] uppercase">
        {result.total} {result.total === 1 ? "order" : "orders"}
      </p>

      <div className="mt-3 overflow-x-auto">
        <table className="text-caption w-full border-collapse font-mono">
          <thead>
            <tr className="border-hairline text-micro text-smoke border-b text-left tracking-[0.12em] uppercase">
              <th className="py-2 pr-4 font-normal">Order</th>
              <th className="py-2 pr-4 font-normal">Customer</th>
              <th className="py-2 pr-4 font-normal">Items</th>
              <th className="py-2 pr-4 font-normal">Total</th>
              <th className="py-2 pr-4 font-normal">Status</th>
            </tr>
          </thead>
          <tbody>
            {result.orders.map((order) => {
              const itemCount = order.items.reduce((n, i) => n + i.quantity, 0);
              return (
                <tr key={order.id} className="border-hairline border-b">
                  <td className="py-2 pr-4">
                    <Link href={`/admin/orders/${order.orderNumber}`} className="hover:underline">
                      {order.orderNumber}
                    </Link>
                    <span className="text-micro text-smoke block">
                      {formatDate(order.createdAt)}
                    </span>
                  </td>
                  <td className="py-2 pr-4">
                    <span className="block">{order.customer?.name ?? "Guest"}</span>
                    <span className="text-micro text-smoke block">
                      {order.customer?.email ?? "-"}
                    </span>
                  </td>
                  <td className="py-2 pr-4">{itemCount}</td>
                  <td className="py-2 pr-4">{formatNaira(order.total)}</td>
                  <td className="py-2 pr-4">
                    <Badge tone={order.status === "pending_payment" ? "alert" : "void"}>
                      {STATUS_LABELS[order.status] ?? order.status}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {result.orders.length === 0 ? (
          <p className="text-caption text-smoke py-12 text-center font-mono tracking-[0.14em] uppercase">
            No orders match.
          </p>
        ) : null}
      </div>

      {totalPages > 1 ? (
        <div className="text-caption mt-6 flex items-center justify-between font-mono">
          <Link
            href={`/admin/orders?${new URLSearchParams({
              ...Object.fromEntries(Object.entries(sp).filter(([, v]) => typeof v === "string")),
              page: String(Math.max(1, result.page - 1)),
            })}`}
            className={result.page <= 1 ? "text-smoke pointer-events-none" : "hover:underline"}
          >
            Previous
          </Link>
          <span className="text-micro text-smoke tracking-[0.12em] uppercase">
            Page {result.page} of {totalPages}
          </span>
          <Link
            href={`/admin/orders?${new URLSearchParams({
              ...Object.fromEntries(Object.entries(sp).filter(([, v]) => typeof v === "string")),
              page: String(Math.min(totalPages, result.page + 1)),
            })}`}
            className={
              result.page >= totalPages ? "text-smoke pointer-events-none" : "hover:underline"
            }
          >
            Next
          </Link>
        </div>
      ) : null}
    </div>
  );
}
