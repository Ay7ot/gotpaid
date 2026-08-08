"use client";

import { retryPayment } from "@/app/(storefront)/orders/[orderNumber]/actions";
import { Button } from "@/components/ui/button";

export function PaymentRetry({ orderNumber }: { orderNumber: string }) {
  return (
    <form action={retryPayment.bind(null, orderNumber)}>
      <Button type="submit">Try payment again</Button>
    </form>
  );
}
