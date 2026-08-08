"use client";

import Link from "next/link";
import { useActionState } from "react";
import { submitCheckout } from "@/app/(storefront)/checkout/actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/field";
import { useCart } from "@/lib/cart";
import { formatNaira } from "@/lib/format";
import { NIGERIAN_STATES } from "@/lib/nigeria";

export function CheckoutClient({
  shippingFee,
  prefillName,
  prefillEmail,
}: {
  shippingFee: number;
  prefillName?: string;
  prefillEmail?: string;
}) {
  const { items, subtotal } = useCart();
  const [state, formAction, pending] = useActionState(submitCheckout, undefined);

  const cartJson = JSON.stringify(items.map((i) => ({ variantId: i.variantId, qty: i.qty })));
  const shipping = items.length ? shippingFee : 0;
  const total = subtotal + shipping;

  if (!items.length) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
        <p className="text-caption text-smoke font-mono tracking-[0.14em] uppercase">
          Your cart is empty.
        </p>
        <Link
          href="/shop"
          className="border-void text-caption hover:bg-void hover:text-paper mt-6 inline-flex border px-8 py-3 font-mono tracking-[0.12em] uppercase transition-colors"
        >
          Shop the shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-display-sm tracking-display leading-[0.95] uppercase">
        Checkout
      </h1>
      <p className="text-caption text-smoke mt-2 font-mono tracking-[0.16em] uppercase">
        No account needed — pay, get the alert.
      </p>

      {state?.error ? (
        <p
          role="alert"
          className="border-alert text-micro text-alert mt-6 max-w-xl border px-4 py-3 font-mono tracking-[0.1em] uppercase"
        >
          {state.error}
        </p>
      ) : null}

      <form action={formAction} className="mt-10 grid gap-12 lg:grid-cols-[1fr_360px]">
        <input type="hidden" name="items" value={cartJson} />

        <div className="space-y-8">
          <section>
            <h2 className="border-hairline text-micro text-smoke border-b pb-2 font-mono tracking-[0.16em] uppercase">
              Contact
            </h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Recipient name</Label>
                <Input
                  id="name"
                  name="name"
                  autoComplete="name"
                  defaultValue={prefillName}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  defaultValue={prefillEmail}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="phone">Phone / WhatsApp</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  placeholder="0801 234 5678"
                  autoComplete="tel"
                  required
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="border-hairline text-micro text-smoke border-b pb-2 font-mono tracking-[0.16em] uppercase">
              Delivery address
            </h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="state">State</Label>
                <Select id="state" name="state" defaultValue="" required>
                  <option value="" disabled>
                    Select state
                  </option>
                  {NIGERIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" autoComplete="address-level2" required />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="street">Street address</Label>
                <Input
                  id="street"
                  name="street"
                  autoComplete="street-address"
                  placeholder="12 Adeola Odeku St, Victoria Island"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="landmark">Landmark (optional)</Label>
                <Input id="landmark" name="landmark" placeholder="Opposite the church" />
              </div>
            </div>
          </section>
        </div>

        <aside className="border-hairline h-fit border p-6 lg:sticky lg:top-24">
          <h2 className="text-micro text-smoke font-mono tracking-[0.16em] uppercase">Summary</h2>
          <ul className="border-hairline mt-5 space-y-3 border-b pb-5">
            {items.map((item) => (
              <li key={item.variantId} className="flex justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-caption truncate font-mono uppercase">{item.name}</p>
                  {item.variantLabel ? (
                    <p className="text-micro text-smoke mt-0.5 font-mono uppercase">
                      {item.variantLabel} × {item.qty}
                    </p>
                  ) : null}
                </div>
                <p className="text-caption shrink-0 font-mono">
                  {formatNaira(item.unitPrice * item.qty)}
                </p>
              </li>
            ))}
          </ul>
          <dl className="text-caption mt-5 space-y-3 font-mono">
            <div className="flex justify-between gap-4">
              <dt className="text-smoke">Subtotal</dt>
              <dd>{formatNaira(subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-smoke">Shipping</dt>
              <dd>{formatNaira(shipping)}</dd>
            </div>
            <div className="border-hairline flex justify-between gap-4 border-t pt-3">
              <dt className="text-void">Total</dt>
              <dd className="text-title">{formatNaira(total)}</dd>
            </div>
          </dl>
          <Button type="submit" disabled={pending} className="mt-6 w-full">
            {pending ? "Creating order…" : `Pay ${formatNaira(total)}`}
          </Button>
          <p className="text-micro text-smoke mt-4 font-mono tracking-[0.1em] uppercase">
            Card · Transfer · USSD via Paystack
          </p>
        </aside>
      </form>
    </div>
  );
}
