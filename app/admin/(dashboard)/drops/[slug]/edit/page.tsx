import Link from "next/link";
import { notFound } from "next/navigation";
import { DropForm } from "@/components/admin/drop-form";
import { db } from "@/db/index";
import { dropTable, productTable } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export default async function EditDropPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const drop = await db.query.dropTable.findFirst({ where: eq(dropTable.slug, slug) });
  if (!drop) notFound();

  const products = await db
    .select({ id: productTable.id, name: productTable.name })
    .from(productTable)
    .where(eq(productTable.status, "published"))
    .orderBy(asc(productTable.name));

  const linked = await db
    .select({ id: productTable.id })
    .from(productTable)
    .where(eq(productTable.dropId, drop.id));

  return (
    <div className="max-w-3xl">
      <p className="text-micro text-smoke font-mono tracking-[0.16em] uppercase">
        <Link href="/admin/drops" className="hover:underline">
          Releases
        </Link>{" "}
        / {drop.name}
      </p>
      <div className="mt-2 flex items-center justify-between gap-4">
        <h1 className="font-display text-display-sm tracking-display leading-[0.95] uppercase">
          Edit drop
        </h1>
        <Link
          href={`/drops/${drop.slug}`}
          target="_blank"
          rel="noreferrer"
          className="border-void text-micro hover:bg-void hover:text-paper shrink-0 border px-4 py-2 font-mono tracking-[0.12em] uppercase transition-colors"
        >
          Preview storefront
        </Link>
      </div>
      <div className="mt-8">
        <DropForm
          initial={{
            id: drop.id,
            name: drop.name,
            slug: drop.slug,
            description: drop.description,
            releaseAt: drop.releaseAt.toISOString(),
            endAt: drop.endAt ? drop.endAt.toISOString() : null,
            status: drop.status,
            productIds: linked.map((p) => p.id),
          }}
          products={products}
        />
      </div>
    </div>
  );
}
