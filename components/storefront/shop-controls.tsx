"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";

const SORTS = [
  { value: "newest", label: "NEWEST" },
  { value: "price-asc", label: "PRICE: LOW → HIGH" },
  { value: "price-desc", label: "PRICE: HIGH → LOW" },
];

export function ShopControls({
  facets,
  basePath,
}: {
  facets: { categories: string[]; sizes: string[] };
  basePath: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [min, setMin] = useState(searchParams.get("min") ?? "");
  const [max, setMax] = useState(searchParams.get("max") ?? "");

  const sort = searchParams.get("sort") ?? "newest";
  const category = searchParams.get("category") ?? "";
  const size = searchParams.get("size") ?? "";
  const inStock = searchParams.get("in_stock");

  const update = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "" || value === "newest") params.delete(key);
        else params.set(key, value);
      }
      params.delete("page");
      const qs = params.toString();
      router.push(`${basePath}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [basePath, router, searchParams],
  );

  const applyPrice = () => {
    update({
      min: min ? String(Number(min)) : null,
      max: max ? String(Number(max)) : null,
    });
  };

  return (
    <div className="border-hairline border-b">
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-wrap items-end gap-5">
            <div>
              <label
                htmlFor="sort"
                className="text-micro text-smoke mb-1 block font-mono tracking-[0.14em] uppercase"
              >
                Sort
              </label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => update({ sort: e.target.value })}
                className="border-hairline text-caption focus:border-void w-full border-0 border-b bg-transparent py-1.5 font-mono tracking-[0.06em] uppercase focus:outline-none"
              >
                {SORTS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {facets.categories.length > 1 ? (
              <div>
                <label
                  htmlFor="category"
                  className="text-micro text-smoke mb-1 block font-mono tracking-[0.14em] uppercase"
                >
                  Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => update({ category: e.target.value })}
                  className="border-hairline text-caption focus:border-void w-full border-0 border-b bg-transparent py-1.5 font-mono tracking-[0.06em] uppercase focus:outline-none"
                >
                  <option value="">All</option>
                  {facets.categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <div>
              <p className="text-micro text-smoke mb-1 font-mono tracking-[0.14em] uppercase">
                Size
              </p>
              <div className="flex flex-wrap gap-2">
                {facets.sizes.map((s) => {
                  const active = size === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => update({ size: active ? null : s })}
                      className={cn(
                        "text-micro flex h-9 min-w-9 items-center justify-center border px-2 font-mono tracking-[0.06em] uppercase transition-colors",
                        active
                          ? "border-void bg-void text-paper"
                          : "border-hairline text-void hover:border-void",
                      )}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-5">
            <div>
              <p className="text-micro text-smoke mb-1 font-mono tracking-[0.14em] uppercase">
                Availability
              </p>
              <div className="border-hairline flex border">
                {[
                  { value: null, label: "ALL" },
                  { value: "1", label: "IN STOCK" },
                  { value: "0", label: "SOLD OUT" },
                ].map((option) => {
                  const active = inStock === option.value;
                  return (
                    <button
                      key={String(option.value)}
                      type="button"
                      onClick={() => update({ in_stock: option.value })}
                      className={cn(
                        "text-micro px-3 py-2 font-mono tracking-[0.1em] uppercase transition-colors",
                        active ? "bg-void text-paper" : "text-smoke hover:text-void",
                      )}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-end gap-2">
              <div>
                <label
                  htmlFor="min"
                  className="text-micro text-smoke mb-1 block font-mono tracking-[0.14em] uppercase"
                >
                  ₦ From
                </label>
                <input
                  id="min"
                  type="number"
                  inputMode="numeric"
                  value={min}
                  onChange={(e) => setMin(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applyPrice()}
                  placeholder="0"
                  className="border-hairline text-caption focus:border-void w-24 border-0 border-b bg-transparent py-1.5 font-mono focus:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="max"
                  className="text-micro text-smoke mb-1 block font-mono tracking-[0.14em] uppercase"
                >
                  ₦ To
                </label>
                <input
                  id="max"
                  type="number"
                  inputMode="numeric"
                  value={max}
                  onChange={(e) => setMax(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applyPrice()}
                  placeholder="∞"
                  className="border-hairline text-caption focus:border-void w-24 border-0 border-b bg-transparent py-1.5 font-mono focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={applyPrice}
                className="border-void text-micro hover:bg-void hover:text-paper border px-3 py-2 font-mono tracking-[0.1em] uppercase transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
