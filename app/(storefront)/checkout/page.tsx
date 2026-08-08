import type { Metadata } from "next";
import { CheckoutClient } from "@/components/storefront/checkout-client";
import { SHIPPING_FEE } from "@/lib/env";
import { getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Checkout — GOTPAID",
  description: "Complete your GOTPAID order.",
};

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  return (
    <CheckoutClient
      shippingFee={SHIPPING_FEE}
      prefillName={user?.name}
      prefillEmail={user?.email}
    />
  );
}
