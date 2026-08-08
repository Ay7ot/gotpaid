"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function AdminInventoryToolbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  function update(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === "" || value === "all") params.delete(key);
      else params.set(key, value);
    }
    router.push(`/admin/inventory?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="border-hairline flex flex-col gap-3 border-y py-3 lg:flex-row lg:items-center">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && update({ q })}
        placeholder="Search product / SKU / size…"
        className="border-hairline text-caption focus:border-void w-full border-0 border-b bg-transparent py-1.5 font-mono focus:outline-none lg:max-w-64"
      />
      <select
        value={searchParams.get("stock") ?? "all"}
        onChange={(e) => update({ stock: e.target.value })}
        className="border-hairline text-caption focus:border-void border-0 border-b bg-transparent py-1.5 font-mono uppercase focus:outline-none"
      >
        <option value="all">All stock</option>
        <option value="low">Low stock</option>
        <option value="out">Out of stock</option>
      </select>
    </div>
  );
}
