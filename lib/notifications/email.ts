import { Resend } from "resend";
import { formatNaira } from "@/lib/format";
import type { Customer, Drop, Order } from "@/db/schema";
import type { NotificationProvider } from "@/lib/notifications/types";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

function fromAddress() {
  return `${process.env.EMAIL_FROM_NAME ?? "GOTPAID"} <${process.env.EMAIL_FROM ?? "on@gotpaid.ng"}>`;
}

function orderSummary(order: Order) {
  return [
    `Order: ${order.orderNumber}`,
    `Subtotal: ${formatNaira(order.subtotal)}`,
    `Shipping: ${formatNaira(order.shippingFee)}`,
    `Total: ${formatNaira(order.total)}`,
  ].join("\n");
}

export const EmailNotificationProvider: NotificationProvider = {
  async sendOrderConfirmation(order: Order, customer: Customer) {
    if (!resend) {
      console.warn("RESEND_API_KEY not set - skipping order confirmation email");
      return;
    }
    if (!customer.email) {
      console.warn("Customer has no email - skipping order confirmation email");
      return;
    }
    await resend.emails.send({
      from: fromAddress(),
      to: customer.email,
      subject: `GOTPAID - Order ${order.orderNumber} confirmed`,
      text: `Your GOTPAID order is confirmed.\n\n${orderSummary(order)}\n\nQuestions? WhatsApp the store: ${process.env.SUPPORT_WHATSAPP_NUMBER ?? "-"}`,
    });
  },

  async sendShippingUpdate(order: Order) {
    if (!resend) return;
    if (!order.customerId) return;
    await resend.emails.send({
      from: fromAddress(),
      to: "customer@example.com",
      subject: `GOTPAID - Order ${order.orderNumber} shipped`,
      text: `Your order ${order.orderNumber} is on the way.\n\n${orderSummary(order)}`,
    });
  },

  async sendDropNotification(phoneOrEmail: string, drop: Drop) {
    if (!resend) return;
    const destination = phoneOrEmail.includes("@") ? phoneOrEmail : "customer@example.com";
    await resend.emails.send({
      from: fromAddress(),
      to: destination,
      subject: `GOTPAID - ${drop.name} is live`,
      text: `${drop.name} has dropped. Shop it now before it's gone.`,
    });
  },
};
