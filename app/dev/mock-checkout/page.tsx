import { notFound } from "next/navigation";
import { MockPayment } from "@/components/storefront/mock-payment";
import { CartProvider } from "@/lib/cart";
import { getOrderByNumber } from "@/lib/orders";

export const metadata = {
  title: "Mock Checkout — GOTPAID",
};

export default async function MockCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderNumber } = await searchParams;
  if (!orderNumber) notFound();

  const order = await getOrderByNumber(orderNumber);
  if (!order) notFound();

  return (
    <CartProvider>
      <MockPayment orderNumber={order.orderNumber} total={order.total} />
    </CartProvider>
  );
}
