import { and, asc, desc, eq, gt, type SQL } from "drizzle-orm";
import { db } from "@/db/index";
import { collectionTable, dropTable, productTable, type Product, type Variant } from "@/db/schema";

export type DropState = "live" | "upcoming" | "none";

export function productPrice(variants: Variant[]): number {
  const prices = variants
    .map((v) => v.priceOverride)
    .filter((price): price is number => price != null);
  return prices.length ? Math.min(...prices) : 0;
}

export function productSoldOut(variants: Variant[]): boolean {
  if (!variants.length) return false;
  return variants.every((v) => v.stockQuantity - v.reservedQuantity <= 0);
}

export type CatalogProduct = {
  product: Product;
  price: number;
  soldOut: boolean;
};

async function productsWithPrice(
  where: SQL | undefined,
  limit?: number,
): Promise<CatalogProduct[]> {
  const rows = await db.query.productTable.findMany({
    where,
    with: { variants: true },
    orderBy: desc(productTable.createdAt),
    limit,
  });
  return rows.map(({ variants, ...product }) => ({
    product,
    price: productPrice(variants),
    soldOut: productSoldOut(variants),
  }));
}

function buildProductWhere() {
  return eq(productTable.status, "published");
}

export async function getPrimaryDrop(): Promise<
  | { drop: null; state: "none" }
  | { drop: typeof dropTable.$inferSelect; state: "live" | "upcoming" }
> {
  const live = await db.query.dropTable.findFirst({
    where: eq(dropTable.status, "live"),
    orderBy: desc(dropTable.releaseAt),
  });
  if (live) return { drop: live, state: "live" };

  const upcoming = await db.query.dropTable.findFirst({
    where: and(eq(dropTable.status, "scheduled"), gt(dropTable.releaseAt, new Date())),
    orderBy: asc(dropTable.releaseAt),
  });
  if (upcoming) return { drop: upcoming, state: "upcoming" };

  return { drop: null, state: "none" };
}

export function getFeaturedProducts(limit = 4) {
  return productsWithPrice(buildProductWhere(), limit);
}

export async function getDropBySlug(slug: string) {
  return db.query.dropTable.findFirst({ where: eq(dropTable.slug, slug) });
}

export function getDropProducts(dropId: string) {
  return productsWithPrice(and(buildProductWhere(), eq(productTable.dropId, dropId)));
}

export async function getCollections() {
  return db.query.collectionTable.findMany({
    with: { products: { where: eq(productTable.status, "published") } },
    orderBy: asc(collectionTable.name),
  });
}
