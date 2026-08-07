import { MockPaymentProvider } from "@/lib/payments/mock";
import { PaystackPaymentProvider } from "@/lib/payments/paystack";
import type { PaymentProvider } from "@/lib/payments/types";

export function getPaymentProvider(): PaymentProvider {
  return process.env.PAYMENT_MODE === "paystack" ? PaystackPaymentProvider : MockPaymentProvider;
}
