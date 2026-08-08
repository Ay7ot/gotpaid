import Link from "next/link";
import { AdminProductsToolbar } from "@/components/admin/admin-products-toolbar";
import { Badge } from "@/components/ui/badge";
import { db } from "@/db/index";
import { basePrice, getAdminProducts, stockSummary, type ProductStatus } from "@/lib/admin";
import { formatNaira } from "@/lib/format";

export const metadata = { title: "Products - GOTPAID Admin" };

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const [collections, drops] = await Promise.all([
    db.query.collectionTable.findMany({ orderBy: (t, { asc }) => [asc(t.name)] }),
    db.query.dropTable.findMany({ orderBy: (t, { desc }) => [desc(t.releaseAt)] }),
  ]);

  const result = await getAdminProducts({
    status: single(sp.status) as ProductStatus | undefined,
    collectionId: single(sp.collection),
    dropId: single(sp.drop),
    q: single(sp.q),
    page: single(sp.page) ? Number(single(sp.page)) : undefined,
  });

  const totalPages = Math.max(1, Math.ceil(result.total / result.perPage));

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-micro text-smoke font-mono tracking-[0.16em] uppercase">Catalog</p>
          <h1 className="font-display text-display-sm tracking-display mt-2 leading-[0.95] uppercase">
            Products
          </h1>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-void text-caption text-paper hover:bg-void/90 shrink-0 px-5 py-3 font-mono tracking-[0.12em] uppercase transition-colors"
        >
          New product
        </Link>
      </div>

      <div className="mt-6">
        <AdminProductsToolbar collections={collections} drops={drops} />
      </div>

      <p className="text-micro text-smoke mt-4 font-mono tracking-[0.14em] uppercase">
        {result.total} {result.total === 1 ? "product" : "products"}
      </p>

      <div className="mt-3 overflow-x-auto">
        <table className="text-caption w-full border-collapse font-mono">
          <thead>
            <tr className="border-hairline text-micro text-smoke border-b text-left tracking-[0.12em] uppercase">
              <th className="py-2 pr-4 font-normal">Product</th>
              <th className="py-2 pr-4 font-normal">Price</th>
              <th className="py-2 pr-4 font-normal">Status</th>
              <th className="py-2 pr-4 font-normal">Stock</th>
              <th className="py-2 pr-4 font-normal">Collection</th>
              <th className="py-2 pr-4 font-normal">Drop</th>
            </tr>
          </thead>
          <tbody>
            {result.products.map((product) => {
              const stock = stockSummary(product.variants);
              const price = basePrice(product.variants);
              return (
                <tr key={product.id} className="border-hairline border-b">
                  <td className="py-2 pr-4">
                    <Link
                      href={`/admin/products/${product.slug}/edit`}
                      className="flex items-center gap-3 hover:underline"
                    >
                      <span className="border-hairline bg-paper h-10 w-8 shrink-0 border">
                        {/* eslint-disable-next-line @next/next/no-img-element -- storage images */}
                        <img
                          src={product.images[0]?.url ?? "/images/product-placeholder.png"}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate">{product.name}</span>
                        <span className="text-micro text-smoke block">{product.slug}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="py-2 pr-4">{price != null ? formatNaira(price) : "-"}</td>
                  <td className="py-2 pr-4">
                    <Badge tone={product.status === "published" ? "void" : "smoke"}>
                      {product.status}
                    </Badge>
                  </td>
                  <td className="py-2 pr-4">
                    <span
                      className={
                        stock.available === 0 && product.status === "published"
                          ? "text-alert"
                          : undefined
                      }
                    >
                      {stock.available} avail
                    </span>
                    <span className="text-smoke"> / {stock.sizes} sizes</span>
                  </td>
                  <td className="py-2 pr-4">{product.collection?.name ?? "-"}</td>
                  <td className="py-2 pr-4">{product.drop?.name ?? "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {result.products.length === 0 ? (
          <p className="text-caption text-smoke py-12 text-center font-mono tracking-[0.14em] uppercase">
            No products match.
          </p>
        ) : null}
      </div>

      {totalPages > 1 ? (
        <div className="text-caption mt-6 flex items-center justify-between font-mono">
          <Link
            href={`/admin/products?${new URLSearchParams({ ...Object.fromEntries(Object.entries(sp).filter(([, v]) => typeof v === "string")), page: String(Math.max(1, result.page - 1)) })}`}
            aria-disabled={result.page <= 1}
            className={result.page <= 1 ? "text-smoke pointer-events-none" : "hover:underline"}
          >
            Previous
          </Link>
          <span className="text-micro text-smoke tracking-[0.12em] uppercase">
            Page {result.page} of {totalPages}
          </span>
          <Link
            href={`/admin/products?${new URLSearchParams({ ...Object.fromEntries(Object.entries(sp).filter(([, v]) => typeof v === "string")), page: String(Math.min(totalPages, result.page + 1)) })}`}
            aria-disabled={result.page >= totalPages}
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
