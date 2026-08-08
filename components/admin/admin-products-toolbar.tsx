"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

const STATUSES = ["draft", "published", "archived"];

export function AdminProductsToolbar({
  collections,
  drops,
}: {
  collections: { id: string; name: string }[];
  drops: { id: string; name: string }[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  function update(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === "" || value === "all") params.delete(key);
      else params.set(key, value);
    }
    params.delete("page");
    router.push(`/admin/products?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="border-hairline flex flex-col gap-3 border-y py-3 lg:flex-row lg:items-center">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && update({ q })}
        placeholder="Search name / SKU…"
        className="border-hairline text-caption focus:border-void w-full border-0 border-b bg-transparent py-1.5 font-mono focus:outline-none lg:max-w-60"
      />

      <select
        value={searchParams.get("status") ?? "all"}
        onChange={(e) => update({ status: e.target.value })}
        className="border-hairline text-caption focus:border-void border-0 border-b bg-transparent py-1.5 font-mono uppercase focus:outline-none"
      >
        <option value="all">All statuses</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get("collection") ?? "all"}
        onChange={(e) => update({ collection: e.target.value })}
        className="border-hairline text-caption focus:border-void border-0 border-b bg-transparent py-1.5 font-mono uppercase focus:outline-none"
      >
        <option value="all">All collections</option>
        {collections.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get("drop") ?? "all"}
        onChange={(e) => update({ drop: e.target.value })}
        className="border-hairline text-caption focus:border-void border-0 border-b bg-transparent py-1.5 font-mono uppercase focus:outline-none"
      >
        <option value="all">All drops</option>
        {drops.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </select>

      {searchParams.toString() ? (
        <button
          type="button"
          onClick={() => router.push("/admin/products", { scroll: false })}
          className={cn(
            "text-micro text-smoke hover:text-alert w-fit font-mono tracking-[0.12em] uppercase underline underline-offset-4",
          )}
        >
          Clear
        </button>
      ) : null}
    </div>
  );
}
