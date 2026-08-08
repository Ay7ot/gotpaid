import Link from "next/link";
import { AdminInventoryToolbar } from "@/components/admin/admin-inventory-toolbar";
import { Badge } from "@/components/ui/badge";
import { db } from "@/db/index";
import { productTable, variantTable } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export const metadata = { title: "Inventory - GOTPAID Admin" };

const LOW_THRESHOLD = 3;

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = (single(sp.q) ?? "").toLowerCase();
  const stockFilter = single(sp.stock);

  const rows = await db
    .select({
      id: variantTable.id,
      sku: variantTable.sku,
      size: variantTable.size,
      color: variantTable.color,
      stock: variantTable.stockQuantity,
      reserved: variantTable.reservedQuantity,
      productId: productTable.id,
      productName: productTable.name,
      productSlug: productTable.slug,
      productStatus: productTable.status,
    })
    .from(variantTable)
    .innerJoin(productTable, eq(variantTable.productId, productTable.id))
    .orderBy(asc(productTable.name), asc(variantTable.size));

  const items = rows
    .map((row) => ({
      ...row,
      available: row.stock - row.reserved,
    }))
    .filter((row) => {
      if (q) {
        const hay = `${row.productName} ${row.sku ?? ""} ${row.size ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      const level = row.available <= 0 ? "out" : row.available <= LOW_THRESHOLD ? "low" : "ok";
      if (stockFilter === "out" && level !== "out") return false;
      if (stockFilter === "low" && level !== "low") return false;
      return true;
    });

  const outCount = items.filter((i) => i.available <= 0).length;
  const lowCount = items.filter((i) => i.available > 0 && i.available <= LOW_THRESHOLD).length;

  return (
    <div>
      <div>
        <p className="text-micro text-smoke font-mono tracking-[0.16em] uppercase">Stock</p>
        <h1 className="font-display text-display-sm tracking-display mt-2 leading-[0.95] uppercase">
          Inventory
        </h1>
        <div className="text-micro mt-3 flex gap-4 font-mono tracking-[0.12em] uppercase">
          <span>{items.length} variants</span>
          <span className="text-alert">{outCount} out</span>
          <span className="text-alert">{lowCount} low</span>
        </div>
      </div>

      <div className="mt-6">
        <AdminInventoryToolbar />
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="text-caption w-full border-collapse font-mono">
          <thead>
            <tr className="border-hairline text-micro text-smoke border-b text-left tracking-[0.12em] uppercase">
              <th className="py-2 pr-4 font-normal">Product</th>
              <th className="py-2 pr-4 font-normal">Size / Color</th>
              <th className="py-2 pr-4 font-normal">SKU</th>
              <th className="py-2 pr-4 font-normal">Stock</th>
              <th className="py-2 pr-4 font-normal">Reserved</th>
              <th className="py-2 pr-4 font-normal">Available</th>
              <th className="py-2 pr-4 font-normal">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const level =
                item.available <= 0 ? "out" : item.available <= LOW_THRESHOLD ? "low" : "ok";
              const availableLabel =
                level === "out"
                  ? "SOLD OUT"
                  : level === "low"
                    ? `LOW - ${item.available} LEFT`
                    : "IN STOCK";
              return (
                <tr key={item.id} className="border-hairline border-b">
                  <td className="py-2 pr-4">
                    <Link
                      href={`/admin/products/${item.productSlug}/edit`}
                      className={
                        item.productStatus !== "published" ? "text-smoke" : "hover:underline"
                      }
                    >
                      {item.productName}
                      {item.productStatus !== "published" ? (
                        <span className="text-micro ml-2">{item.productStatus}</span>
                      ) : null}
                    </Link>
                  </td>
                  <td className="py-2 pr-4">
                    {item.size ?? "OS"}
                    {item.color ? <span className="text-smoke"> / {item.color}</span> : null}
                  </td>
                  <td className="text-smoke py-2 pr-4">{item.sku ?? "-"}</td>
                  <td className="py-2 pr-4">{item.stock}</td>
                  <td className="py-2 pr-4">{item.reserved}</td>
                  <td className="py-2 pr-4">
                    <span className={level === "out" ? "text-alert" : undefined}>
                      {item.available}
                    </span>
                  </td>
                  <td className="py-2 pr-4">
                    <Badge tone={level === "ok" ? "void" : "alert"}>{availableLabel}</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {items.length === 0 ? (
          <p className="text-caption text-smoke py-12 text-center font-mono tracking-[0.14em] uppercase">
            No variants match.
          </p>
        ) : null}
      </div>
    </div>
  );
}
