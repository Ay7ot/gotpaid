"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateOrderStatus } from "@/app/admin/(dashboard)/orders/actions";
import { Button } from "@/components/ui/button";

const boxed =
  "w-full border border-hairline bg-paper px-3 py-2 font-mono text-caption focus:border-void focus:outline-none";

export function OrderStatusForm({
  orderId,
  orderNumber,
  current,
}: {
  orderId: string;
  orderNumber: string;
  current: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(current === "pending_payment" ? "paid" : current);
  const [tracking, setTracking] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const formData = new FormData();
    formData.set("id", orderId);
    formData.set("status", status);
    formData.set("tracking", tracking);
    const result = await updateOrderStatus(formData);
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error ? (
        <p className="border-alert text-micro text-alert border px-3 py-2 font-mono tracking-[0.1em] uppercase">
          {error}
        </p>
      ) : null}
      <select value={status} onChange={(e) => setStatus(e.target.value)} className={boxed}>
        {["paid", "fulfilled", "shipped", "delivered", "cancelled"].map((s) => (
          <option key={s} value={s}>
            {s.replace(/_/g, " ")}
          </option>
        ))}
      </select>
      <input
        value={tracking}
        onChange={(e) => setTracking(e.target.value)}
        placeholder="Tracking reference (required for shipped)"
        className={boxed}
      />
      <Button type="submit" disabled={busy}>
        {busy ? "Updating…" : `Update order ${orderNumber}`}
      </Button>
    </form>
  );
}
