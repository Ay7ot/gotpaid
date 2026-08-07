import { relations } from "drizzle-orm";
import {
  addressTable,
  collectionTable,
  customerTable,
  dropTable,
  orderItemTable,
  orderTable,
  productImageTable,
  productTable,
  variantTable,
} from "@/db/schema";

export const collectionRelations = relations(collectionTable, ({ many }) => ({
  products: many(productTable),
}));

export const dropRelations = relations(dropTable, ({ many }) => ({
  products: many(productTable),
}));

export const productRelations = relations(productTable, ({ one, many }) => ({
  collection: one(collectionTable, {
    fields: [productTable.collectionId],
    references: [collectionTable.id],
  }),
  drop: one(dropTable, {
    fields: [productTable.dropId],
    references: [dropTable.id],
  }),
  variants: many(variantTable),
  images: many(productImageTable),
}));

export const variantRelations = relations(variantTable, ({ one, many }) => ({
  product: one(productTable, {
    fields: [variantTable.productId],
    references: [productTable.id],
  }),
  orderItems: many(orderItemTable),
}));

export const productImageRelations = relations(productImageTable, ({ one }) => ({
  product: one(productTable, {
    fields: [productImageTable.productId],
    references: [productTable.id],
  }),
}));

export const customerRelations = relations(customerTable, ({ many }) => ({
  addresses: many(addressTable),
  orders: many(orderTable),
}));

export const addressRelations = relations(addressTable, ({ one }) => ({
  customer: one(customerTable, {
    fields: [addressTable.customerId],
    references: [customerTable.id],
  }),
}));

export const orderRelations = relations(orderTable, ({ one, many }) => ({
  customer: one(customerTable, {
    fields: [orderTable.customerId],
    references: [customerTable.id],
  }),
  shippingAddress: one(addressTable, {
    fields: [orderTable.shippingAddressId],
    references: [addressTable.id],
  }),
  items: many(orderItemTable),
}));

export const orderItemRelations = relations(orderItemTable, ({ one }) => ({
  order: one(orderTable, {
    fields: [orderItemTable.orderId],
    references: [orderTable.id],
  }),
  variant: one(variantTable, {
    fields: [orderItemTable.variantId],
    references: [variantTable.id],
  }),
}));
