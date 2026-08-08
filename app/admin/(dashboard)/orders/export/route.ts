import { getAdminSession } from "@/lib/admin/session";
import { getOrdersForExport, type OrderStatus } from "@/lib/admin-orders";

export const runtime = "nodejs";

function csvCell(value: string | number | null | undefined) {
  const text = value == null ? "" : String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(request.url);
  const filters = {
    status: single(url.searchParams.get("status") ?? undefined) as OrderStatus | undefined,
    q: single(url.searchParams.get("q") ?? undefined),
  };

  const orders = await getOrdersForExport(filters);

  const header = [
    "Order",
    "Date",
    "Name",
    "Email",
    "Phone",
    "Items",
    "Subtotal",
    "Shipping",
    "Total",
    "Status",
    "Payment Status",
    "Reference",
    "State",
    "City",
    "Street",
  ];

  const rows = orders.map((order) => {
    const address = order.shippingAddress;
    const items = order.items.map((i) => `${i.productName ?? "item"} x${i.quantity}`).join(" | ");
    return [
      order.orderNumber,
      order.createdAt.toISOString(),
      order.customer?.name,
      order.customer?.email,
      order.customer?.phone,
      items,
      order.subtotal,
      order.shippingFee,
      order.total,
      order.status,
      order.paymentStatus,
      order.paystackReference,
      address?.state,
      address?.city,
      address?.streetAddress,
    ];
  });

  const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");

  return new Response(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="gotpaid-orders-${new Date()
        .toISOString()
        .slice(0, 10)}.csv"`,
    },
  });
}
