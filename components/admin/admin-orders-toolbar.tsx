"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const STATUSES = [
  "pending_payment",
  "payment_received_insufficient_stock",
  "paid",
  "fulfilled",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

export function AdminOrdersToolbar() {
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
    router.push(`/admin/orders?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="border-hairline flex flex-col gap-3 border-y py-3 lg:flex-row lg:items-center">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && update({ q })}
        placeholder="Order no / email / phone…"
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
            {s.replace(/_/g, " ")}
          </option>
        ))}
      </select>
      <a
        href={`/admin/orders/export?${searchParams.toString()}`}
        className="text-micro hover:text-smoke w-fit font-mono tracking-[0.12em] uppercase underline underline-offset-4"
      >
        Export CSV
      </a>
    </div>
  );
}
