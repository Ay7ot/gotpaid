import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { SignOutButton } from "@/components/storefront/sign-out-button";
import { Badge } from "@/components/ui/badge";
import { getCustomerAccount } from "@/lib/account";
import { formatDate, formatNaira } from "@/lib/format";
import { getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Account - GOTPAID",
  description: "Your GOTPAID account and orders.",
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

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/account/sign-in");
  if (!user.email) notFound();

  const account = await getCustomerAccount(user.email);

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="font-display text-display-sm tracking-display leading-[0.95] uppercase">
            Account
          </h1>
          <p className="text-caption text-smoke mt-2 font-mono">{user.email}</p>
        </div>
        <SignOutButton />
      </div>

      {account ? (
        <section className="border-hairline mt-10 border-t pt-8">
          <h2 className="text-micro text-smoke font-mono tracking-[0.16em] uppercase">Profile</h2>
          <dl className="text-caption mt-4 grid gap-3 font-mono sm:grid-cols-2">
            <div className="border-hairline flex justify-between gap-4 border-b pb-2">
              <dt className="text-smoke">Name</dt>
              <dd>{account.name ?? "-"}</dd>
            </div>
            <div className="border-hairline flex justify-between gap-4 border-b pb-2">
              <dt className="text-smoke">Phone</dt>
              <dd>{account.phone ?? "-"}</dd>
            </div>
            <div className="border-hairline flex justify-between gap-4 border-b pb-2">
              <dt className="text-smoke">Email</dt>
              <dd>{account.email ?? "-"}</dd>
            </div>
            <div className="border-hairline flex justify-between gap-4 border-b pb-2">
              <dt className="text-smoke">WhatsApp</dt>
              <dd>{account.whatsappNumber ?? "-"}</dd>
            </div>
          </dl>
        </section>
      ) : (
        <p className="border-hairline text-caption text-smoke mt-10 border-t pt-8 font-mono">
          No profile yet - place an order and it&rsquo;ll appear here.
        </p>
      )}

      <section className="mt-12">
        <h2 className="text-micro text-smoke font-mono tracking-[0.16em] uppercase">Orders</h2>
        {account && account.orders.length ? (
          <ul className="divide-hairline border-hairline mt-4 divide-y border-y">
            {account.orders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/orders/${order.orderNumber}`}
                  className="group flex items-center justify-between gap-4 py-4"
                >
                  <div className="min-w-0">
                    <p className="text-caption font-mono uppercase group-hover:underline">
                      {order.orderNumber}
                    </p>
                    <p className="text-micro text-smoke mt-0.5 font-mono uppercase">
                      {formatDate(order.createdAt)} · {order.items.length}{" "}
                      {order.items.length === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-4">
                    <Badge tone={order.status === "paid" ? "void" : "alert"}>
                      {STATUS_LABELS[order.status] ?? order.status}
                    </Badge>
                    <p className="text-caption font-mono">{formatNaira(order.total)}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-caption text-smoke mt-4 font-mono">No orders yet.</p>
        )}
      </section>

      <div className="mt-12">
        <Link
          href="/shop"
          className="border-void text-caption hover:bg-void hover:text-paper inline-flex border px-8 py-3 font-mono tracking-[0.12em] uppercase transition-colors"
        >
          Shop the shop
        </Link>
      </div>
    </div>
  );
}
