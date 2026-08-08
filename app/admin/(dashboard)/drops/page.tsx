import Link from "next/link";
import { deleteDrop } from "@/app/admin/(dashboard)/drops/actions";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { Badge } from "@/components/ui/badge";
import { db } from "@/db/index";
import { dropTable, productTable } from "@/db/schema";
import { desc, sql } from "drizzle-orm";
import { formatDate, isInFuture } from "@/lib/format";

export const metadata = { title: "Drops - GOTPAID Admin" };

export default async function AdminDropsPage() {
  const drops = await db.query.dropTable.findMany({
    orderBy: desc(dropTable.releaseAt),
  });

  const counts = await db
    .select({
      dropId: productTable.dropId,
      total: sql<number>`count(*)`,
    })
    .from(productTable)
    .where(sql`${productTable.dropId} is not null`)
    .groupBy(productTable.dropId);
  const countByDrop = new Map(counts.map((c) => [c.dropId, Number(c.total)]));

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-micro text-smoke font-mono tracking-[0.16em] uppercase">Releases</p>
          <h1 className="font-display text-display-sm tracking-display mt-2 leading-[0.95] uppercase">
            Drops
          </h1>
        </div>
        <Link
          href="/admin/drops/new"
          className="bg-void text-caption text-paper hover:bg-void/90 shrink-0 px-5 py-3 font-mono tracking-[0.12em] uppercase transition-colors"
        >
          New drop
        </Link>
      </div>

      <p className="text-micro text-smoke mt-6 font-mono tracking-[0.14em] uppercase">
        {drops.length} {drops.length === 1 ? "drop" : "drops"}
      </p>

      <div className="mt-3 overflow-x-auto">
        <table className="text-caption w-full border-collapse font-mono">
          <thead>
            <tr className="border-hairline text-micro text-smoke border-b text-left tracking-[0.12em] uppercase">
              <th className="py-2 pr-4 font-normal">Drop</th>
              <th className="py-2 pr-4 font-normal">Status</th>
              <th className="py-2 pr-4 font-normal">Releases</th>
              <th className="py-2 pr-4 font-normal">Products</th>
              <th className="py-2 pr-4 font-normal" />
              <th className="py-2 pr-4 font-normal" />
            </tr>
          </thead>
          <tbody>
            {drops.map((drop) => {
              const isFuture = isInFuture(drop.releaseAt);
              return (
                <tr key={drop.id} className="border-hairline border-b">
                  <td className="py-2 pr-4">
                    <Link href={`/admin/drops/${drop.slug}/edit`} className="hover:underline">
                      {drop.name}
                    </Link>
                    <span className="text-micro text-smoke block">{drop.slug}</span>
                  </td>
                  <td className="py-2 pr-4">
                    <Badge tone={drop.status === "live" ? "alert" : "void"}>{drop.status}</Badge>
                    {drop.status === "scheduled" && isFuture ? (
                      <span className="text-micro text-smoke block">countdown</span>
                    ) : null}
                  </td>
                  <td className="py-2 pr-4">{formatDate(drop.releaseAt)}</td>
                  <td className="py-2 pr-4">{countByDrop.get(drop.id) ?? 0}</td>
                  <td className="py-2 pr-4 text-right">
                    <Link
                      href={`/drops/${drop.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-micro hover:text-smoke font-mono underline underline-offset-4"
                    >
                      Preview
                    </Link>
                  </td>
                  <td className="py-2 pr-4 text-right">
                    <ConfirmButton
                      action={deleteDrop}
                      id={drop.id}
                      className="text-micro text-smoke hover:text-alert font-mono"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {drops.length === 0 ? (
          <p className="text-caption text-smoke py-12 text-center font-mono tracking-[0.14em] uppercase">
            No drops yet. Create one.
          </p>
        ) : null}
      </div>
    </div>
  );
}
