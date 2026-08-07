"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";

export type BuyBoxVariant = {
  id: string;
  size: string | null;
  color: string | null;
  priceOverride: number | null;
  stockQuantity: number;
  reservedQuantity: number;
};

export function PdpBuyBox({
  productId,
  slug,
  name,
  basePrice,
  variants,
}: {
  productId: string;
  slug: string;
  name: string;
  basePrice: number;
  variants: BuyBoxVariant[];
}) {
  const router = useRouter();
  const { addItem } = useCart();
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    const first = variants.find((v) => v.stockQuantity - v.reservedQuantity > 0);
    return first?.id ?? null;
  });
  const [added, setAdded] = useState(false);

  const selected = variants.find((v) => v.id === selectedId) ?? null;
  const available = variants.reduce((n, v) => n + (v.stockQuantity - v.reservedQuantity), 0);
  const soldOut = available <= 0;
  const lowStock = !soldOut && available <= 3;
  const price = selected?.priceOverride ?? basePrice;
  const variantLabel = selected
    ? [selected.size, selected.color].filter(Boolean).join(" / ")
    : null;

  function addToCart() {
    if (!selected) return;
    addItem({ variantId: selected.id, productId, slug, name, variantLabel, unitPrice: price });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  }

  function buyNow() {
    if (!selected) return;
    addItem({ variantId: selected.id, productId, slug, name, variantLabel, unitPrice: price });
    router.push("/cart");
  }

  return (
    <div className="mt-7">
      <div className="border-hairline flex items-baseline justify-between border-t pt-5">
        <p className="text-micro text-smoke font-mono tracking-[0.14em] uppercase">Price</p>
        <p className="text-title text-void font-mono">{formatNaira(price)}</p>
      </div>

      <div className="mt-6">
        <p className="text-micro text-smoke font-mono tracking-[0.14em] uppercase">Size</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {variants.map((variant) => {
            const variantAvailable = variant.stockQuantity - variant.reservedQuantity > 0;
            const active = variant.id === selectedId;
            return (
              <button
                key={variant.id}
                type="button"
                disabled={!variantAvailable}
                onClick={() => setSelectedId(variant.id)}
                aria-pressed={active}
                className={cn(
                  "text-caption flex h-11 min-w-11 items-center justify-center gap-1.5 border px-3 font-mono uppercase transition-colors",
                  active
                    ? "border-void bg-void text-paper"
                    : "border-hairline text-void hover:border-void",
                  !variantAvailable &&
                    "border-hairline text-smoke hover:border-hairline cursor-not-allowed",
                )}
              >
                {variant.size ?? "OS"}
                {!variantAvailable ? (
                  <span aria-hidden="true" className="text-micro">
                    ✕
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
        {!selected ? (
          <p className="text-micro text-alert mt-3 font-mono tracking-[0.1em] uppercase">
            Select a size
          </p>
        ) : null}
      </div>

      {lowStock ? (
        <p className="text-micro text-alert mt-4 font-mono tracking-[0.14em] uppercase">
          Only {available} left
        </p>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          onClick={addToCart}
          disabled={soldOut || !selected}
          className="flex-1"
        >
          {soldOut ? "Sold out" : added ? "Added" : "Add to cart"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={buyNow}
          disabled={soldOut || !selected}
          className="flex-1"
        >
          Buy now
        </Button>
      </div>
    </div>
  );
}
