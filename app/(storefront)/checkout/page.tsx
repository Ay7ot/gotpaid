import type { Metadata } from "next";
import { CheckoutClient } from "@/components/storefront/checkout-client";
import { SHIPPING_FEE } from "@/lib/env";

export const metadata: Metadata = {
  title: "Checkout — GOTPAID",
  description: "Complete your GOTPAID order.",
};

export default function CheckoutPage() {
  return <CheckoutClient shippingFee={SHIPPING_FEE} />;
}
