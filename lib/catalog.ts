import { and, asc, desc, eq, gt, ne, sql, type SQL } from "drizzle-orm";
import { db } from "@/db/index";
import {
  collectionTable,
  dropTable,
  productTable,
  variantTable,
  type Product,
  type Variant,
} from "@/db/schema";

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

export type ProductSort = "newest" | "price-asc" | "price-desc";

export type ProductFilters = {
  sort?: ProductSort;
  category?: string;
  size?: string;
  inStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
  collectionId?: string;
  dropId?: string;
  page?: number;
  perPage?: number;
};

export type ProductSearchResult = {
  products: CatalogProduct[];
  total: number;
  page: number;
  perPage: number;
};

const minPriceSql = sql<number>`(
  select min(v.price_override)
  from ${variantTable} v
  where v.product_id = ${productTable.id} and v.price_override is not null
)`;

const hasStockSql = sql<boolean>`exists (
  select 1 from ${variantTable} v
  where v.product_id = ${productTable.id} and (v.stock_quantity - v.reserved_quantity) > 0
)`;

export async function searchProducts(filters: ProductFilters = {}): Promise<ProductSearchResult> {
  const page = Math.max(1, filters.page ?? 1);
  const perPage = Math.min(48, Math.max(1, filters.perPage ?? 12));

  const where: SQL[] = [eq(productTable.status, "published")];
  if (filters.category) where.push(eq(productTable.category, filters.category));
  if (filters.collectionId) where.push(eq(productTable.collectionId, filters.collectionId));
  if (filters.dropId) where.push(eq(productTable.dropId, filters.dropId));
  if (filters.size) {
    where.push(
      sql`exists (
        select 1 from ${variantTable} v
        where v.product_id = ${productTable.id} and v.size = ${filters.size}
      )`,
    );
  }
  if (filters.inStock === true) where.push(hasStockSql);
  if (filters.inStock === false) where.push(sql`not ${hasStockSql}`);
  if (filters.minPrice != null) where.push(sql`${minPriceSql} >= ${filters.minPrice * 100}`);
  if (filters.maxPrice != null) where.push(sql`${minPriceSql} <= ${filters.maxPrice * 100}`);

  const orderBy =
    filters.sort === "price-asc"
      ? asc(minPriceSql)
      : filters.sort === "price-desc"
        ? desc(minPriceSql)
        : desc(productTable.createdAt);

  const [rows, count] = await Promise.all([
    db
      .select({
        product: productTable,
        price: sql<number>`coalesce(${minPriceSql}, 0)`,
        hasStock: hasStockSql,
      })
      .from(productTable)
      .where(and(...where))
      .orderBy(orderBy)
      .offset((page - 1) * perPage)
      .limit(perPage),
    db
      .select({ count: sql<number>`count(*)` })
      .from(productTable)
      .where(and(...where)),
  ]);

  return {
    products: rows.map((row) => ({
      product: row.product,
      price: row.price,
      soldOut: !row.hasStock,
    })),
    total: Number(count[0]?.count ?? 0),
    page,
    perPage,
  };
}

export async function getRelatedProducts(product: Product, limit = 4) {
  const where: SQL[] = [buildProductWhere(), ne(productTable.id, product.id)];
  if (product.collectionId) {
    where.push(eq(productTable.collectionId, product.collectionId));
  } else if (product.dropId) {
    where.push(eq(productTable.dropId, product.dropId));
  } else {
    return [];
  }
  return productsWithPrice(and(...where), limit);
}

export async function getProductFacets() {
  const [categories, sizes] = await Promise.all([
    db
      .selectDistinct({ category: productTable.category })
      .from(productTable)
      .where(eq(productTable.status, "published")),
    db
      .selectDistinct({ size: variantTable.size })
      .from(variantTable)
      .innerJoin(productTable, eq(variantTable.productId, productTable.id))
      .where(eq(productTable.status, "published")),
  ]);
  return {
    categories: categories.map((c) => c.category).filter((c): c is string => Boolean(c)),
    sizes: sizes.map((s) => s.size).filter((s): s is string => Boolean(s)),
  };
}
