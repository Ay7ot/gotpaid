"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { refundOrder } from "@/app/admin/(dashboard)/orders/actions";

export function RefundButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [arming, setArming] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    if (pending) return;
    if (!arming) {
      setArming(true);
      window.setTimeout(() => setArming(false), 4000);
      return;
    }
    setError(null);
    const formData = new FormData();
    formData.set("id", orderId);
    startTransition(async () => {
      const result = await refundOrder(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="border-alert text-caption text-alert hover:bg-alert hover:text-paper border px-5 py-3 font-mono tracking-[0.12em] uppercase transition-colors disabled:opacity-40"
      >
        {pending ? "Refunding…" : arming ? "Confirm refund?" : "Refund order"}
      </button>
      {error ? (
        <p className="text-micro text-alert mt-2 font-mono tracking-[0.1em] uppercase">{error}</p>
      ) : null}
    </div>
  );
}
