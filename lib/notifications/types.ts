import type { Customer, Drop, Order } from "@/db/schema";

export interface NotificationProvider {
  sendOrderConfirmation(order: Order, customer: Customer): Promise<void>;
  sendShippingUpdate(order: Order): Promise<void>;
  sendDropNotification(phoneOrEmail: string, drop: Drop): Promise<void>;
}
