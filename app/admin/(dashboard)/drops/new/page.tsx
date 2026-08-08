import { DropForm } from "@/components/admin/drop-form";
import { db } from "@/db/index";
import { productTable } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export const metadata = { title: "New Drop - GOTPAID Admin" };

export default async function NewDropPage() {
  const products = await db
    .select({ id: productTable.id, name: productTable.name })
    .from(productTable)
    .where(eq(productTable.status, "published"))
    .orderBy(asc(productTable.name));

  return (
    <div className="max-w-3xl">
      <p className="text-micro text-smoke font-mono tracking-[0.16em] uppercase">Releases</p>
      <h1 className="font-display text-display-sm tracking-display mt-2 leading-[0.95] uppercase">
        New drop
      </h1>
      <div className="mt-8">
        <DropForm products={products} />
      </div>
    </div>
  );
}
