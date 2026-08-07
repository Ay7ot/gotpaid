import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductGrid } from "@/components/storefront/product-grid";
import { ShopControls } from "@/components/storefront/shop-controls";
import { getProductFacets, searchProducts } from "@/lib/catalog";
import { buildShopQuery, parseShopParams, type SearchParamValue } from "@/lib/shop-filters";

export const metadata: Metadata = {
  title: "Shop — GOTPAID",
  description: "Shop GOTPAID. Nigerian streetwear in small runs. Sold-out drops stay visible.",
};

export const revalidate = 60;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, SearchParamValue>>;
}) {
  const params = await searchParams;
  const [result, facets] = await Promise.all([
    searchProducts(parseShopParams(params)),
    getProductFacets(),
  ]);

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
        <h1 className="font-display text-display tracking-display leading-[0.95] uppercase">
          Shop
        </h1>
        <p className="text-caption text-smoke mt-2 font-mono tracking-[0.16em] uppercase">
          {result.total} {result.total === 1 ? "piece" : "pieces"}
        </p>
      </header>

      <div className="mt-8">
        <Suspense fallback={null}>
          <ShopControls facets={facets} basePath="/shop" />
        </Suspense>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <ProductGrid
          products={products}
          total={result.total}
          page={result.page}
          query={buildShopQuery(params)}
        />
      </div>
    </div>
  );
}
