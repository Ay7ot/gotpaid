"use client";

import { useRef, useState, useTransition } from "react";
import { cn } from "@/lib/utils";

export function ConfirmButton({
  action,
  id,
  label = "Delete",
  confirmLabel = "Confirm?",
  className,
}: {
  action: (formData: FormData) => Promise<{ error?: string }>;
  id: string;
  label?: string;
  confirmLabel?: string;
  className?: string;
}) {
  const [arming, setArming] = useState(false);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleClick() {
    if (pending) return;
    if (!arming) {
      setArming(true);
      window.setTimeout(() => setArming(false), 3000);
      return;
    }
    startTransition(() => formRef.current?.requestSubmit());
  }

  return (
    <form
      ref={formRef}
      action={action as unknown as (formData: FormData) => Promise<void>}
      className="inline"
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className={cn("disabled:opacity-40", className)}
      >
        {pending ? "Deleting…" : arming ? confirmLabel : label}
      </button>
    </form>
  );
}
