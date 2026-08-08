import type { Metadata } from "next";
import { CartView } from "@/components/storefront/cart-view";
import { SHIPPING_FEE } from "@/lib/env";

export const metadata: Metadata = {
  title: "Cart - GOTPAID",
  description: "Your GOTPAID cart.",
};

export default function CartPage() {
  return <CartView shippingFee={SHIPPING_FEE} />;
}
