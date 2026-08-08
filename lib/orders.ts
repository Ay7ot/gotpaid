import { randomInt } from "node:crypto";
import { and, eq, gte, inArray, sql } from "drizzle-orm";
import { db } from "@/db/index";
import {
  addressTable,
  customerTable,
  orderItemTable,
  orderTable,
  productTable,
  variantTable,
  type Order,
} from "@/db/schema";
import { SHIPPING_FEE } from "@/lib/env";

export type OrderItemInput = { variantId: string; qty: number };

export type NewOrderInput = {
  items: OrderItemInput[];
  customer: { name?: string; email?: string; phone?: string };
  address: {
    recipientName: string;
    phone: string;
    state: string;
    city: string;
    streetAddress: string;
    landmark?: string;
  };
};

export function generateOrderNumber() {
  const time = Date.now().toString(36).toUpperCase().slice(-6);
  const random = randomInt(1000, 9999);
  return `GP-${time}${random}`;
}

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

async function findOrCreateCustomer(tx: Tx, customer: NewOrderInput["customer"]) {
  if (customer.email) {
    const existing = await tx
      .select()
      .from(customerTable)
      .where(eq(customerTable.email, customer.email))
      .limit(1);
    if (existing[0]) return existing[0].id;
  }
  const [created] = await tx
    .insert(customerTable)
    .values({
      name: customer.name ?? null,
      email: customer.email ?? null,
      phone: customer.phone ?? null,
      whatsappNumber: customer.phone ?? null,
    })
    .returning();
  return created.id;
}

export async function createOrder(input: NewOrderInput) {
  if (!input.items.length) throw new Error("Your cart is empty.");

  const orderNumber = await db.transaction(async (tx) => {
    const variants = await tx
      .select()
      .from(variantTable)
      .where(
        inArray(
          variantTable.id,
          input.items.map((i) => i.variantId),
        ),
      );
    if (variants.length !== input.items.length) {
      throw new Error("Some items are no longer available.");
    }
    const variantById = new Map(variants.map((v) => [v.id, v]));

    const products = await tx
      .select()
      .from(productTable)
      .where(inArray(productTable.id, [...new Set(variants.map((v) => v.productId))]));
    const productById = new Map(products.map((p) => [p.id, p]));

    let subtotal = 0;
    const lines = input.items.map((item) => {
      const variant = variantById.get(item.variantId);
      if (!variant) throw new Error("An item is no longer available.");
      if (variant.stockQuantity - variant.reservedQuantity < item.qty) {
        throw new Error("An item in your cart is out of stock.");
      }
      const unitPrice = variant.priceOverride ?? 0;
      subtotal += unitPrice * item.qty;
      return {
        variant,
        product: productById.get(variant.productId),
        qty: item.qty,
        unitPrice,
      };
    });

    const shippingFee = SHIPPING_FEE;
    const total = subtotal + shippingFee;

    const customerId = await findOrCreateCustomer(tx, input.customer);
    const [address] = await tx
      .insert(addressTable)
      .values({
        customerId,
        recipientName: input.address.recipientName,
        phone: input.address.phone,
        state: input.address.state,
        city: input.address.city,
        streetAddress: input.address.streetAddress,
        landmark: input.address.landmark ?? null,
      })
      .returning();

    const orderNumber = generateOrderNumber();
    const [order] = await tx
      .insert(orderTable)
      .values({
        orderNumber,
        customerId,
        status: "pending_payment",
        subtotal,
        shippingFee,
        discountTotal: 0,
        total,
        currency: "NGN",
        paymentProvider: process.env.PAYMENT_MODE === "paystack" ? "paystack" : "mock",
        shippingAddressId: address.id,
      })
      .returning();

    for (const line of lines) {
      await tx.insert(orderItemTable).values({
        orderId: order.id,
        variantId: line.variant.id,
        productName: line.product?.name ?? null,
        variantLabel: [line.variant.size, line.variant.color].filter(Boolean).join(" / ") || null,
        quantity: line.qty,
        unitPriceAtPurchase: line.unitPrice,
      });
      const reserved = await tx
        .update(variantTable)
        .set({
          reservedQuantity: sql`${variantTable.reservedQuantity} + ${line.qty}`,
        })
        .where(
          and(
            eq(variantTable.id, line.variant.id),
            gte(sql`${variantTable.stockQuantity} - ${variantTable.reservedQuantity}`, line.qty),
          ),
        );
      if (reserved.count === 0) {
        throw new Error("Stock changed - please review your cart.");
      }
    }

    return order.orderNumber;
  });

  const order = await getOrderByNumber(orderNumber);
  if (!order) throw new Error("Order could not be created.");
  return order;
}

export async function getOrderByNumber(orderNumber: string) {
  return db.query.orderTable.findFirst({
    where: eq(orderTable.orderNumber, orderNumber),
    with: {
      customer: true,
      shippingAddress: true,
      items: true,
    },
  });
}

export async function markOrderPaid(orderNumber: string): Promise<Order> {
  return db.transaction(async (tx) => {
    const [order] = await tx
      .select()
      .from(orderTable)
      .where(eq(orderTable.orderNumber, orderNumber))
      .for("update");
    if (!order) throw new Error("Order not found.");
    if (order.status === "paid") return order;

    const items = await tx
      .select()
      .from(orderItemTable)
      .where(eq(orderItemTable.orderId, order.id));

    let insufficient = false;
    for (const item of items) {
      if (!item.variantId) continue;
      const [variant] = await tx
        .select()
        .from(variantTable)
        .where(eq(variantTable.id, item.variantId))
        .for("update");
      if (!variant || variant.stockQuantity - variant.reservedQuantity < item.quantity) {
        insufficient = true;
        break;
      }
    }

    if (insufficient) {
      const [updated] = await tx
        .update(orderTable)
        .set({ status: "payment_received_insufficient_stock", paymentStatus: "insufficient_stock" })
        .where(eq(orderTable.id, order.id))
        .returning();
      return updated;
    }

    for (const item of items) {
      if (!item.variantId) continue;
      await tx
        .update(variantTable)
        .set({
          stockQuantity: sql`${variantTable.stockQuantity} - ${item.quantity}`,
          reservedQuantity: sql`${variantTable.reservedQuantity} - ${item.quantity}`,
        })
        .where(eq(variantTable.id, item.variantId));
    }

    const [updated] = await tx
      .update(orderTable)
      .set({ status: "paid", paymentStatus: "success" })
      .where(eq(orderTable.id, order.id))
      .returning();
    return updated;
  });
}

export async function releaseReservation(orderNumber: string) {
  return db.transaction(async (tx) => {
    const [order] = await tx
      .select()
      .from(orderTable)
      .where(eq(orderTable.orderNumber, orderNumber))
      .for("update");
    if (!order || order.status !== "pending_payment") return;

    const items = await tx
      .select()
      .from(orderItemTable)
      .where(eq(orderItemTable.orderId, order.id));
    for (const item of items) {
      if (!item.variantId) continue;
      await tx
        .update(variantTable)
        .set({
          reservedQuantity: sql`greatest(${variantTable.reservedQuantity} - ${item.quantity}, 0)`,
        })
        .where(eq(variantTable.id, item.variantId));
    }
  });
}
