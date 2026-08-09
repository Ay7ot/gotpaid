import { and, asc, desc, eq, gt, inArray, ne, sql, type SQL } from "drizzle-orm";
import { db } from "@/db/index";
import { cache } from "react";

function cached<F extends (...args: never[]) => Promise<unknown>>(fn: F): F {
  return cache(fn) as F;
}

import {
  collectionTable,
  dropTable,
  productImageTable,
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
  image: string | null;
};

async function productsWithPrice(
  where: SQL | undefined,
  limit?: number,
): Promise<CatalogProduct[]> {
  const rows = await db.query.productTable.findMany({
    where,
    with: { variants: true, images: true },
    orderBy: desc(productTable.createdAt),
    limit,
  });
  return rows.map(({ variants, images, ...product }) => ({
    product,
    price: productPrice(variants),
    soldOut: productSoldOut(variants),
    image: [...images].sort((a, b) => a.position - b.position)[0]?.url ?? null,
  }));
}

function buildProductWhere() {
  return eq(productTable.status, "published");
}

async function getPrimaryDropRaw(): Promise<
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

function getFeaturedProductsRaw(limit = 4) {
  return productsWithPrice(buildProductWhere(), limit);
}

async function getDropBySlugRaw(slug: string) {
  return db.query.dropTable.findFirst({ where: eq(dropTable.slug, slug) });
}

function getDropProductsRaw(dropId: string) {
  return productsWithPrice(and(buildProductWhere(), eq(productTable.dropId, dropId)));
}

async function getCollectionsRaw() {
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

async function searchProductsRaw(filters: ProductFilters = {}): Promise<ProductSearchResult> {
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
      .select({ product: productTable })
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
    products: await attachPricing(rows.map((row) => row.product)),
    total: Number(count[0]?.count ?? 0),
    page,
    perPage,
  };
}

async function attachPricing(products: Product[]): Promise<CatalogProduct[]> {
  if (!products.length) return [];
  const ids = products.map((p) => p.id);
  const [variants, images] = await Promise.all([
    db.select().from(variantTable).where(inArray(variantTable.productId, ids)),
    db
      .select()
      .from(productImageTable)
      .where(inArray(productImageTable.productId, ids))
      .orderBy(asc(productImageTable.position)),
  ]);

  const variantsByProduct = new Map<string, Variant[]>();
  for (const variant of variants) {
    const list = variantsByProduct.get(variant.productId) ?? [];
    list.push(variant);
    variantsByProduct.set(variant.productId, list);
  }

  const firstImage = new Map<string, string>();
  for (const image of images) {
    if (!firstImage.has(image.productId)) firstImage.set(image.productId, image.url);
  }

  const soldOut = new Map<string, boolean>();
  for (const product of products) soldOut.set(product.id, true);
  for (const variant of variants) {
    if (variant.stockQuantity - variant.reservedQuantity > 0) {
      soldOut.set(variant.productId, false);
    }
  }
  for (const product of products) {
    if (!soldOut.has(product.id)) soldOut.set(product.id, false);
  }

  return products.map((product) => ({
    product,
    price: productPrice(variantsByProduct.get(product.id) ?? []),
    soldOut: soldOut.get(product.id) ?? false,
    image: firstImage.get(product.id) ?? null,
  }));
}

async function getRelatedProductsRaw(product: Product, limit = 4) {
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

async function getProductFacetsRaw() {
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

export const getPrimaryDrop = cached(getPrimaryDropRaw);
export const getFeaturedProducts = cached(getFeaturedProductsRaw);
export const getDropBySlug = cached(getDropBySlugRaw);
export const getDropProducts = cached(getDropProductsRaw);
export const getCollections = cached(getCollectionsRaw);
export const searchProducts = cached(searchProductsRaw);
export const getRelatedProducts = cached(getRelatedProductsRaw);
export const getProductFacets = cached(getProductFacetsRaw);
