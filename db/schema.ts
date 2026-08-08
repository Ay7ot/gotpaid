import { sql } from "drizzle-orm";
import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const productStatusEnum = pgEnum("product_status", ["draft", "published", "archived"]);

export const dropStatusEnum = pgEnum("drop_status", ["draft", "scheduled", "live", "ended"]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending_payment",
  "payment_received_insufficient_stock",
  "paid",
  "fulfilled",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
]);

export const discountTypeEnum = pgEnum("discount_type", ["percentage", "fixed"]);

export const adminRoleEnum = pgEnum("admin_role", ["owner", "staff"]);

export const collectionTable = pgTable(
  "collection",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    image: text("image"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("collection_slug_unique").on(table.slug)],
);

export const dropTable = pgTable(
  "drop",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    releaseAt: timestamp("release_at", { withTimezone: true }).notNull(),
    endAt: timestamp("end_at", { withTimezone: true }),
    status: dropStatusEnum("status").notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("drop_release_at_idx").on(table.releaseAt),
    index("drop_status_idx").on(table.status),
    uniqueIndex("drop_slug_unique").on(table.slug),
  ],
);

export const dropNotificationTable = pgTable(
  "drop_notification",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    dropId: uuid("drop_id").references(() => dropTable.id, { onDelete: "set null" }),
    email: text("email"),
    whatsappNumber: text("whatsapp_number"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("drop_notification_drop_idx").on(table.dropId)],
);

export const productTable = pgTable(
  "product",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    category: text("category"),
    collectionId: uuid("collection_id").references(() => collectionTable.id, {
      onDelete: "set null",
    }),
    dropId: uuid("drop_id").references(() => dropTable.id, { onDelete: "set null" }),
    status: productStatusEnum("status").notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("product_slug_unique").on(table.slug),
    index("product_status_idx").on(table.status),
    index("product_collection_idx").on(table.collectionId),
    index("product_drop_idx").on(table.dropId),
  ],
);

export const variantTable = pgTable(
  "variant",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    productId: uuid("product_id")
      .notNull()
      .references(() => productTable.id, { onDelete: "cascade" }),
    size: text("size"),
    color: text("color"),
    sku: text("sku"),
    priceOverride: integer("price_override"),
    stockQuantity: integer("stock_quantity").notNull().default(0),
    reservedQuantity: integer("reserved_quantity").notNull().default(0),
  },
  (table) => [index("variant_product_idx").on(table.productId)],
);

export const productImageTable = pgTable(
  "product_image",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    productId: uuid("product_id")
      .notNull()
      .references(() => productTable.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    alt: text("alt"),
    position: integer("position").notNull().default(0),
  },
  (table) => [index("product_image_product_idx").on(table.productId)],
);

export const customerTable = pgTable(
  "customer",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: text("name"),
    email: text("email"),
    phone: text("phone"),
    whatsappNumber: text("whatsapp_number"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("customer_email_idx").on(table.email)],
);

export const addressTable = pgTable(
  "address",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customerTable.id, { onDelete: "cascade" }),
    label: text("label"),
    recipientName: text("recipient_name").notNull(),
    phone: text("phone").notNull(),
    state: text("state").notNull(),
    city: text("city").notNull(),
    streetAddress: text("street_address").notNull(),
    landmark: text("landmark"),
  },
  (table) => [index("address_customer_idx").on(table.customerId)],
);

export const orderTable = pgTable(
  "order",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    orderNumber: text("order_number").notNull(),
    customerId: uuid("customer_id").references(() => customerTable.id, { onDelete: "set null" }),
    status: orderStatusEnum("status").notNull().default("pending_payment"),
    subtotal: integer("subtotal").notNull().default(0),
    shippingFee: integer("shipping_fee").notNull().default(0),
    discountTotal: integer("discount_total").notNull().default(0),
    total: integer("total").notNull().default(0),
    currency: text("currency").notNull().default("NGN"),
    paymentProvider: text("payment_provider").notNull().default("mock"),
    paystackReference: text("paystack_reference"),
    paymentStatus: text("payment_status"),
    trackingNumber: text("tracking_number"),
    shippingAddressId: uuid("shipping_address_id").references(() => addressTable.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("order_order_number_unique").on(table.orderNumber),
    index("order_status_idx").on(table.status),
    index("order_paystack_reference_idx").on(table.paystackReference),
    index("order_customer_idx").on(table.customerId),
  ],
);

export const orderItemTable = pgTable(
  "order_item",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orderTable.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id").references(() => variantTable.id, { onDelete: "set null" }),
    productName: text("product_name"),
    variantLabel: text("variant_label"),
    quantity: integer("quantity").notNull(),
    unitPriceAtPurchase: integer("unit_price_at_purchase").notNull(),
  },
  (table) => [index("order_item_order_idx").on(table.orderId)],
);

export const discountCodeTable = pgTable(
  "discount_code",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    code: text("code").notNull(),
    type: discountTypeEnum("type").notNull(),
    value: integer("value").notNull(),
    minOrderValue: integer("min_order_value"),
    usageLimit: integer("usage_limit"),
    perCustomerLimit: integer("per_customer_limit"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("discount_code_unique").on(table.code)],
);

export const rateLimitTable = pgTable(
  "rate_limit",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    key: text("key").notNull(),
    windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
    count: integer("count").notNull().default(0),
  },
  (table) => [uniqueIndex("rate_limit_key_window_unique").on(table.key, table.windowStart)],
);

export const adminUserTable = pgTable(
  "admin_user",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: text("name").notNull(),
    email: text("email").notNull(),
    role: adminRoleEnum("role").notNull().default("staff"),
    passwordHash: text("password_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("admin_user_email_unique").on(table.email)],
);

export type Collection = typeof collectionTable.$inferSelect;
export type NewCollection = typeof collectionTable.$inferInsert;
export type Drop = typeof dropTable.$inferSelect;
export type NewDrop = typeof dropTable.$inferInsert;
export type Product = typeof productTable.$inferSelect;
export type NewProduct = typeof productTable.$inferInsert;
export type Variant = typeof variantTable.$inferSelect;
export type NewVariant = typeof variantTable.$inferInsert;
export type ProductImage = typeof productImageTable.$inferSelect;
export type NewProductImage = typeof productImageTable.$inferInsert;
export type Customer = typeof customerTable.$inferSelect;
export type NewCustomer = typeof customerTable.$inferInsert;
export type Address = typeof addressTable.$inferSelect;
export type NewAddress = typeof addressTable.$inferInsert;
export type Order = typeof orderTable.$inferSelect;
export type NewOrder = typeof orderTable.$inferInsert;
export type OrderItem = typeof orderItemTable.$inferSelect;
export type NewOrderItem = typeof orderItemTable.$inferInsert;
export type DiscountCode = typeof discountCodeTable.$inferSelect;
export type NewDiscountCode = typeof discountCodeTable.$inferInsert;
export type AdminUser = typeof adminUserTable.$inferSelect;
export type NewAdminUser = typeof adminUserTable.$inferInsert;
