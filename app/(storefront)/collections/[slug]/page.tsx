import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ProductGrid } from "@/components/storefront/product-grid";
import { ShopControls } from "@/components/storefront/shop-controls";
import { db } from "@/db/index";
import { collectionTable } from "@/db/schema";
import { getProductFacets, searchProducts } from "@/lib/catalog";
import { buildShopQuery, parseShopParams, type SearchParamValue } from "@/lib/shop-filters";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const collection = await db.query.collectionTable.findFirst({
    where: eq(collectionTable.slug, slug),
  });
  if (!collection) return { title: "Collection not found — GOTPAID" };
  return {
    title: `${collection.name} — GOTPAID`,
    description: collection.description ?? undefined,
  };
}

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, SearchParamValue>>;
}) {
  const { slug } = await params;
  const collection = await db.query.collectionTable.findFirst({
    where: eq(collectionTable.slug, slug),
  });
  if (!collection) notFound();

  const sp = await searchParams;
  const filters = parseShopParams(sp);
  filters.collectionId = collection.id;

  const [result, facets] = await Promise.all([searchProducts(filters), getProductFacets()]);

  const products = result.products.map(({ product, price, soldOut }) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    price,
    soldOut,
  }));

  return (
    <div className="pt-14">
      <header className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-micro text-smoke font-mono tracking-[0.18em] uppercase">Collection</p>
        <h1 className="font-display text-display tracking-display mt-2 leading-[0.95] uppercase">
          {collection.name}
        </h1>
        {collection.description ? (
          <p className="text-caption text-smoke mt-3 max-w-md">{collection.description}</p>
        ) : null}
        <p className="text-caption text-smoke mt-3 font-mono tracking-[0.16em] uppercase">
          {result.total} {result.total === 1 ? "piece" : "pieces"}
        </p>
      </header>

      <div className="mt-8">
        <Suspense fallback={null}>
          <ShopControls facets={facets} basePath={`/collections/${slug}`} />
        </Suspense>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <ProductGrid
          products={products}
          total={result.total}
          page={result.page}
          query={buildShopQuery(sp)}
        />
      </div>
    </div>
  );
}
