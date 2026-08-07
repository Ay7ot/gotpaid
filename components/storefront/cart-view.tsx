"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";

export function CartView({ shippingFee }: { shippingFee: number }) {
  const { items, subtotal, updateQty, removeItem } = useCart();
  const total = subtotal + (items.length ? shippingFee : 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-display-sm tracking-display leading-[0.95] uppercase">
        Cart
      </h1>
      <p className="text-caption text-smoke mt-2 font-mono tracking-[0.16em] uppercase">
        {items.length} {items.length === 1 ? "item" : "items"}
      </p>

      {items.length === 0 ? (
        <div className="border-hairline border-t py-20 text-center">
          <p className="text-caption text-smoke font-mono tracking-[0.14em] uppercase">
            Your cart is empty.
          </p>
          <Link
            href="/shop"
            className="border-void text-caption hover:bg-void hover:text-paper mt-6 inline-flex border px-8 py-3 font-mono tracking-[0.12em] uppercase transition-colors"
          >
            Shop the shop
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_320px]">
          <ul className="divide-hairline border-hairline divide-y border-y">
            {items.map((item) => (
              <li key={item.variantId} className="flex gap-4 py-5 sm:gap-6">
                <Link
                  href={`/products/${item.slug}`}
                  className="border-hairline bg-paper relative block h-28 w-24 shrink-0 border"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- placeholder */}
                  <img
                    src="/images/product-placeholder.png"
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </Link>
                <div className="flex flex-1 flex-col justify-between gap-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link href={`/products/${item.slug}`} className="hover:underline">
                        <h2 className="text-caption font-mono tracking-[0.04em] uppercase">
                          {item.name}
                        </h2>
                      </Link>
                      {item.variantLabel ? (
                        <p className="text-micro text-smoke mt-1 font-mono tracking-[0.1em] uppercase">
                          {item.variantLabel}
                        </p>
                      ) : null}
                    </div>
                    <p className="text-caption font-mono">
                      {formatNaira(item.unitPrice * item.qty)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="border-hairline flex border">
                      <button
                        type="button"
                        onClick={() => updateQty(item.variantId, item.qty - 1)}
                        aria-label="Decrease quantity"
                        className="hover:bg-void hover:text-paper flex h-9 w-9 items-center justify-center font-mono transition-colors"
                      >
                        −
                      </button>
                      <span className="text-caption flex h-9 min-w-9 items-center justify-center px-2 font-mono">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQty(item.variantId, item.qty + 1)}
                        aria-label="Increase quantity"
                        className="hover:bg-void hover:text-paper flex h-9 w-9 items-center justify-center font-mono transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.variantId)}
                      className="text-micro text-smoke hover:text-alert font-mono tracking-[0.1em] uppercase"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="border-hairline h-fit border p-6">
            <h2 className="text-micro text-smoke font-mono tracking-[0.16em] uppercase">Summary</h2>
            <dl className="text-caption mt-5 space-y-3 font-mono">
              <div className="flex justify-between gap-4">
                <dt className="text-smoke">Subtotal</dt>
                <dd>{formatNaira(subtotal)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-smoke">Shipping</dt>
                <dd>{items.length ? formatNaira(shippingFee) : formatNaira(0)}</dd>
              </div>
              <div className="border-hairline flex justify-between gap-4 border-t pt-3">
                <dt className="text-void">Total</dt>
                <dd className={cn("text-title")}>{formatNaira(total)}</dd>
              </div>
            </dl>
            <p className="border-hairline text-micro text-smoke mt-5 border-t pt-4 font-mono tracking-[0.1em] uppercase">
              Checkout is next — coming in the next build pass.
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
