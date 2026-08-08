"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function AdminCustomersToolbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  function update(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === "") params.delete(key);
      else params.set(key, value);
    }
    params.delete("page");
    router.push(`/admin/customers?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="border-hairline border-y py-3">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && update({ q })}
        placeholder="Search name / email / phone…"
        className="border-hairline text-caption focus:border-void w-full border-0 border-b bg-transparent py-1.5 font-mono focus:outline-none lg:max-w-72"
      />
    </div>
  );
}
