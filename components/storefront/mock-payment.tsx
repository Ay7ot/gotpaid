"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";
import { formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";

type Outcome = "success" | "failed" | "abandon";

export function MockPayment({ orderNumber, total }: { orderNumber: string; total: number }) {
  const { clear } = useCart();
  const [busy, setBusy] = useState<Outcome | null>(null);

  async function complete(outcome: Outcome) {
    setBusy(outcome);
    const res = await fetch("/api/mock/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: orderNumber, outcome }),
    });
    const data = (await res.json()) as { redirect: string };
    if (outcome === "success") clear();
    window.location.assign(data.redirect);
  }

  const options: { outcome: Outcome; label: string; className: string }[] = [
    {
      outcome: "success",
      label: "SUCCESS",
      className: "border-void bg-void text-paper hover:bg-void/90",
    },
    {
      outcome: "failed",
      label: "FAILED",
      className: "border-hairline text-void hover:border-alert hover:text-alert",
    },
    {
      outcome: "abandon",
      label: "ABANDON",
      className: "border-hairline text-smoke hover:border-void",
    },
  ];

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="border-void bg-paper border p-6">
        <p className="text-micro text-smoke font-mono tracking-[0.16em] uppercase">
          Mock payment — dev only
        </p>
        <p className="text-caption mt-2 font-mono">
          Order <span className="text-void">{orderNumber}</span>
        </p>
        <p className="text-micro text-smoke mt-3 font-mono tracking-[0.12em] uppercase">AMT</p>
        <p className="text-display-sm text-void font-mono">{formatNaira(total)}</p>
      </div>

      <p className="text-micro text-smoke mt-8 font-mono tracking-[0.14em] uppercase">
        Choose an outcome
      </p>
      <div className="mt-3 grid gap-3">
        {options.map((option) => (
          <button
            key={option.outcome}
            type="button"
            disabled={busy !== null}
            onClick={() => complete(option.outcome)}
            className={cn(
              "text-caption border px-6 py-4 font-mono tracking-[0.14em] uppercase transition-colors disabled:opacity-40",
              option.className,
            )}
          >
            {busy === option.outcome ? "Processing…" : option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
