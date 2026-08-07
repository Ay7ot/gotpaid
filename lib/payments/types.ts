import type { Order } from "@/db/schema";

export interface PaymentInitializationInput {
  order: Order;
  amount: number;
  customerEmail: string;
  callbackUrl: string;
}

export interface PaymentVerificationResult {
  reference: string;
  status: "success" | "failed" | "abandoned";
}

export interface RefundResult {
  reference: string;
  status: "success" | "failed";
  message?: string;
}

export interface WebhookResult {
  reference: string;
  status: "success" | "failed";
}

export interface PaymentProvider {
  initialize(input: PaymentInitializationInput): Promise<{
    authorization_url: string;
    reference: string;
  }>;
  verify(reference: string): Promise<PaymentVerificationResult>;
  refund(reference: string, amount?: number): Promise<RefundResult>;
  handleWebhook(payload: unknown, signature?: string): Promise<WebhookResult>;
}
