import { ProductForm } from "@/components/admin/product-form";
import { db } from "@/db/index";

export const metadata = { title: "New Product - GOTPAID Admin" };

export default async function NewProductPage() {
  const [collections, drops] = await Promise.all([
    db.query.collectionTable.findMany({ orderBy: (t, { asc }) => [asc(t.name)] }),
    db.query.dropTable.findMany({ orderBy: (t, { desc }) => [desc(t.releaseAt)] }),
  ]);

  return (
    <div className="max-w-3xl">
      <p className="text-micro text-smoke font-mono tracking-[0.16em] uppercase">Catalog</p>
      <h1 className="font-display text-display-sm tracking-display mt-2 leading-[0.95] uppercase">
        New product
      </h1>
      <div className="mt-8">
        <ProductForm collections={collections} drops={drops} />
      </div>
    </div>
  );
}
