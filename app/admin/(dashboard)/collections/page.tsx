import Link from "next/link";
import { CollectionForm } from "@/components/admin/collection-form";
import { Badge } from "@/components/ui/badge";
import { db } from "@/db/index";
import { productTable } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export const metadata = { title: "Collections - GOTPAID Admin" };

export default async function AdminCollectionsPage() {
  const collections = await db.query.collectionTable.findMany({
    with: { products: { where: eq(productTable.status, "published") } },
    orderBy: (t, { asc }) => [asc(t.name)],
  });

  const counts = await db
    .select({
      collectionId: productTable.collectionId,
      total: sql<number>`count(*)`,
    })
    .from(productTable)
    .groupBy(productTable.collectionId);

  const totalByCollection = new Map(counts.map((c) => [c.collectionId, Number(c.total)]));

  return (
    <div className="max-w-3xl">
      <p className="text-micro text-smoke font-mono tracking-[0.16em] uppercase">Catalog</p>
      <h1 className="font-display text-display-sm tracking-display mt-2 leading-[0.95] uppercase">
        Collections
      </h1>

      <div className="border-hairline mt-8 border p-5">
        <h2 className="text-micro text-smoke font-mono tracking-[0.16em] uppercase">
          New collection
        </h2>
        <div className="mt-4">
          <CollectionForm />
        </div>
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="text-caption w-full border-collapse font-mono">
          <thead>
            <tr className="border-hairline text-micro text-smoke border-b text-left tracking-[0.12em] uppercase">
              <th className="py-2 pr-4 font-normal">Name</th>
              <th className="py-2 pr-4 font-normal">Slug</th>
              <th className="py-2 pr-4 font-normal">Products</th>
              <th className="py-2 pr-4 font-normal" />
            </tr>
          </thead>
          <tbody>
            {collections.map((collection) => (
              <tr key={collection.id} className="border-hairline border-b">
                <td className="py-2 pr-4">
                  <Link
                    href={`/collections/${collection.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline"
                  >
                    {collection.name}
                  </Link>
                </td>
                <td className="text-smoke py-2 pr-4">{collection.slug}</td>
                <td className="py-2 pr-4">
                  {collection.products.length}
                  <span className="text-smoke">
                    {" "}
                    published / {totalByCollection.get(collection.id) ?? 0} total
                  </span>
                </td>
                <td className="py-2 pr-4 text-right">
                  <Badge tone="smoke">{collection.slug}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {collections.length === 0 ? (
          <p className="text-caption text-smoke py-8 text-center font-mono tracking-[0.14em] uppercase">
            No collections yet. Create one above.
          </p>
        ) : null}
      </div>
    </div>
  );
}
