import Link from "next/link";
import { AdminCustomersToolbar } from "@/components/admin/admin-customers-toolbar";
import { getAdminCustomers } from "@/lib/admin-customers";
import { formatNaira } from "@/lib/format";

export const metadata = { title: "Customers - GOTPAID Admin" };

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const result = await getAdminCustomers({
    q: single(sp.q),
    page: single(sp.page) ? Number(single(sp.page)) : undefined,
  });

  const totalPages = Math.max(1, Math.ceil(result.total / result.perPage));

  return (
    <div>
      <div>
        <p className="text-micro text-smoke font-mono tracking-[0.16em] uppercase">People</p>
        <h1 className="font-display text-display-sm tracking-display mt-2 leading-[0.95] uppercase">
          Customers
        </h1>
      </div>

      <div className="mt-6">
        <AdminCustomersToolbar />
      </div>

      <p className="text-micro text-smoke mt-4 font-mono tracking-[0.14em] uppercase">
        {result.total} {result.total === 1 ? "customer" : "customers"}
      </p>

      <div className="mt-3 overflow-x-auto">
        <table className="text-caption w-full border-collapse font-mono">
          <thead>
            <tr className="border-hairline text-micro text-smoke border-b text-left tracking-[0.12em] uppercase">
              <th className="py-2 pr-4 font-normal">Customer</th>
              <th className="py-2 pr-4 font-normal">Phone</th>
              <th className="py-2 pr-4 font-normal">Orders</th>
              <th className="py-2 pr-4 font-normal">Lifetime value</th>
            </tr>
          </thead>
          <tbody>
            {result.customers.map((customer) => (
              <tr key={customer.id} className="border-hairline border-b">
                <td className="py-2 pr-4">
                  <Link href={`/admin/customers/${customer.id}`} className="hover:underline">
                    <span className="block">{customer.name ?? "Guest"}</span>
                    <span className="text-micro text-smoke block">{customer.email ?? "-"}</span>
                  </Link>
                </td>
                <td className="py-2 pr-4">{customer.phone ?? "-"}</td>
                <td className="py-2 pr-4">{Number(customer.orderCount)}</td>
                <td className="py-2 pr-4">{formatNaira(Number(customer.lifetimeValue))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {result.customers.length === 0 ? (
          <p className="text-caption text-smoke py-12 text-center font-mono tracking-[0.14em] uppercase">
            No customers match.
          </p>
        ) : null}
      </div>

      {totalPages > 1 ? (
        <div className="text-caption mt-6 flex items-center justify-between font-mono">
          <Link
            href={`/admin/customers?${new URLSearchParams({
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
            href={`/admin/customers?${new URLSearchParams({
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
