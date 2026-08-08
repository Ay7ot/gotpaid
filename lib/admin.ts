import { and, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db/index";
import { productTable, variantTable, type Variant } from "@/db/schema";

export type ProductStatus = "draft" | "published" | "archived";

export type AdminProductFilters = {
  status?: ProductStatus;
  collectionId?: string;
  dropId?: string;
  q?: string;
  page?: number;
};

export async function getAdminProducts(filters: AdminProductFilters = {}) {
  const page = Math.max(1, filters.page ?? 1);
  const perPage = 20;

  const where: SQL[] = [];
  if (filters.status) where.push(eq(productTable.status, filters.status));
  if (filters.collectionId) where.push(eq(productTable.collectionId, filters.collectionId));
  if (filters.dropId) where.push(eq(productTable.dropId, filters.dropId));
  if (filters.q) {
    const search = or(
      ilike(productTable.name, `%${filters.q}%`),
      ilike(productTable.slug, `%${filters.q}%`),
      sql`exists (
        select 1 from ${variantTable} v
        where v.product_id = ${productTable.id} and v.sku ilike ${`%${filters.q}%`}
      )`,
    );
    if (search) where.push(search);
  }

  const [rows, count] = await Promise.all([
    db.query.productTable.findMany({
      where: and(...where),
      with: {
        variants: true,
        images: { orderBy: (images, { asc }) => [asc(images.position)] },
        collection: true,
        drop: true,
      },
      orderBy: desc(productTable.createdAt),
      offset: (page - 1) * perPage,
      limit: perPage,
    }),
    db
      .select({ count: sql<number>`count(*)` })
      .from(productTable)
      .where(and(...where)),
  ]);

  return { products: rows, total: Number(count[0]?.count ?? 0), page, perPage };
}

export function stockSummary(variants: Variant[]) {
  return {
    total: variants.reduce((n, v) => n + v.stockQuantity, 0),
    available: variants.reduce((n, v) => n + Math.max(0, v.stockQuantity - v.reservedQuantity), 0),
    sizes: variants.length,
  };
}

export function basePrice(variants: Variant[]): number | null {
  const prices = variants
    .map((v) => v.priceOverride)
    .filter((price): price is number => price != null);
  return prices.length ? Math.min(...prices) : null;
}
