"use client";

import { useActionState } from "react";
import { notifyMe } from "@/app/(storefront)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { cn } from "@/lib/utils";

export function NotifyMe({ dropId, className }: { dropId: string; className?: string }) {
  const [state, formAction, pending] = useActionState(notifyMe.bind(null, dropId), undefined);

  return (
    <div className={cn("mt-7 max-w-xl", className)}>
      {state?.success ? (
        <p className="border-paper/30 text-caption text-paper border px-4 py-3 font-mono">
          YOU&rsquo;RE ON THE LIST - CREDIT ALERT INCOMING.
        </p>
      ) : (
        <form action={formAction} className="space-y-3">
          <p className="text-micro text-paper/60 font-mono tracking-[0.18em] uppercase">
            Notify me when it drops
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              name="email"
              type="email"
              placeholder="EMAIL"
              className="border-paper/40 bg-void/50 text-paper placeholder:text-paper/40 focus:border-paper"
            />
            <Input
              name="whatsapp"
              type="tel"
              placeholder="WHATSAPP"
              className="border-paper/40 bg-void/50 text-paper placeholder:text-paper/40 focus:border-paper"
            />
            <Button type="submit" disabled={pending} className="shrink-0">
              {pending ? "…" : "NOTIFY ME"}
            </Button>
          </div>
          {state?.error ? (
            <p className="text-micro text-alert font-mono tracking-[0.1em] uppercase" role="alert">
              {state.error}
            </p>
          ) : null}
        </form>
      )}
    </div>
  );
}
