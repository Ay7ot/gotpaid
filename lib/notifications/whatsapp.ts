import type { Customer, Drop, Order } from "@/db/schema";
import type { NotificationProvider } from "@/lib/notifications/types";

export function whatsappLink(phoneNumber: string, message: string) {
  const digits = phoneNumber.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export const WhatsAppClickToChatProvider: NotificationProvider = {
  async sendOrderConfirmation(_order: Order, _customer: Customer) {
    // v1: support/order-sharing is handled via click-to-chat links, no outbound API yet.
  },

  async sendShippingUpdate(_order: Order) {},

  async sendDropNotification(_phoneOrEmail: string, _drop: Drop) {},
};
