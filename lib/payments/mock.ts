import type {
  PaymentInitializationInput,
  PaymentProvider,
  PaymentVerificationResult,
} from "@/lib/payments/types";

const store = new Map<string, { status: PaymentVerificationResult["status"] }>();

export function setMockStatus(reference: string, status: PaymentVerificationResult["status"]) {
  store.set(reference, { status });
}

export const MockPaymentProvider: PaymentProvider = {
  async initialize({ order }: PaymentInitializationInput) {
    const reference = `mock_${Date.now()}_${order.orderNumber}`;
    store.set(reference, { status: "abandoned" });
    return {
      authorization_url: `/dev/mock-checkout?reference=${reference}&order=${order.orderNumber}`,
      reference,
    };
  },

  async verify(reference: string) {
    const record = store.get(reference);
    const status = record?.status ?? "abandoned";
    return { reference, status };
  },

  async refund(reference: string) {
    return { reference, status: "success" };
  },

  async handleWebhook(payload: unknown) {
    const reference = (payload as { reference?: string })?.reference ?? "";
    return { reference, status: "success" };
  },
};
