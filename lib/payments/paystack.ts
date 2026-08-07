import { createHmac } from "node:crypto";
import type {
  PaymentInitializationInput,
  PaymentProvider,
  PaymentVerificationResult,
} from "@/lib/payments/types";

function secretKey() {
  if (!process.env.PAYSTACK_SECRET_KEY) {
    throw new Error("PAYSTACK_SECRET_KEY is not set");
  }
  return process.env.PAYSTACK_SECRET_KEY;
}

export const PaystackPaymentProvider: PaymentProvider = {
  async initialize({ order, amount, customerEmail, callbackUrl }: PaymentInitializationInput) {
    const reference = order.paystackReference ?? `GP-${order.orderNumber}`;

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        email: customerEmail,
        reference,
        callback_url: callbackUrl,
        currency: "NGN",
      }),
    });

    const data = (await response.json()) as {
      status: boolean;
      message?: string;
      data?: { authorization_url?: string; reference?: string };
    };

    if (!response.ok || !data.status || !data.data?.authorization_url) {
      throw new Error(data.message ?? "Paystack initialize failed");
    }

    return {
      authorization_url: data.data.authorization_url,
      reference: data.data.reference ?? reference,
    };
  },

  async verify(reference: string): Promise<PaymentVerificationResult> {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${secretKey()}` } },
    );

    const data = (await response.json()) as {
      status?: boolean;
      data?: { status?: string };
    };

    const status = data.data?.status === "success" ? "success" : "failed";
    return { reference, status };
  },

  async refund(reference: string, amount?: number) {
    const response = await fetch("https://api.paystack.co/refund", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ transaction: reference, amount: amount ?? 0 }),
    });

    const data = (await response.json()) as { status?: boolean; message?: string };
    return {
      reference,
      status: data.status ? "success" : "failed",
      message: data.message,
    };
  },

  async handleWebhook(payload: unknown, signature?: string) {
    const body = typeof payload === "string" ? payload : JSON.stringify(payload);
    const expected = createHmac("sha512", secretKey()).update(body).digest("hex");
    if (!signature || expected !== signature) {
      throw new Error("Invalid Paystack webhook signature");
    }

    const parsed =
      typeof payload === "string"
        ? (JSON.parse(payload) as Record<string, unknown>)
        : (payload as Record<string, unknown>);
    const event = parsed?.event;
    const data = (parsed?.data ?? {}) as { reference?: string };

    return {
      reference: String(data.reference ?? ""),
      status: event === "charge.success" ? "success" : "failed",
    };
  },
};
