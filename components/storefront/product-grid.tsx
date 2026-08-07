"use client";

import { useState } from "react";
import { ProductCard } from "@/components/ui/product-card";
import { cn } from "@/lib/utils";

export type GridProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  soldOut: boolean;
};

export function ProductGrid({
  products,
  total,
  page,
  query,
  className,
}: {
  products: GridProduct[];
  total: number;
  page: number;
  query: string;
  className?: string;
}) {
  const [items, setItems] = useState<GridProduct[]>(products);
  const [nextPage, setNextPage] = useState(page + 1);
  const [hasMore, setHasMore] = useState(products.length < total);
  const [loading, setLoading] = useState(false);

  async function loadMore() {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/products?${query}&page=${nextPage}`, { cache: "no-store" });
      const data = (await res.json()) as {
        products: GridProduct[];
        total: number;
        page: number;
      };
      setItems((prev) => [...prev, ...data.products]);
      setNextPage(data.page + 1);
      setHasMore(items.length + data.products.length < data.total);
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div
        className={cn("grid grid-cols-2 gap-x-4 gap-y-12 sm:grid-cols-3 lg:grid-cols-4", className)}
      >
        {items.map((item) => (
          <ProductCard
            key={item.id}
            name={item.name}
            price={item.price}
            href={`/products/${item.slug}`}
            badge={item.soldOut ? "SOLD OUT" : undefined}
            badgeTone="alert"
          />
        ))}
      </div>

      {hasMore ? (
        <div className="mt-12 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="border-void text-caption hover:bg-void hover:text-paper inline-flex items-center justify-center border px-8 py-3 font-mono tracking-[0.12em] uppercase transition-colors disabled:opacity-40"
          >
            {loading ? "Loading…" : "Load more"}
          </button>
        </div>
      ) : null}

      {!items.length ? (
        <p className="text-caption text-smoke py-20 text-center font-mono tracking-[0.14em] uppercase">
          No products match those filters.
        </p>
      ) : null}
    </div>
  );
}
