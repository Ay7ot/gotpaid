# Godpaid — Product Requirements Document

**Version:** 1.0
**Status:** Ready for build
**Owner:** Ayomide (Product/Technical Lead)
**Audience for this doc:** Any engineer or AI coding agent picking up implementation. This document is self-contained — read it fully before writing code. Pair it with `DESIGN_GUIDE.md` for all visual and UX decisions.

---

## 1. Product Summary

Godpaid is a direct-to-consumer streetwear e-commerce platform for a Nigerian clothing brand, targeting young Nigerians (roughly 16–30) who shop primarily on mobile, are highly online (Instagram/TikTok-driven discovery), and expect the buying experience to feel as premium as the brand imagery — not like a generic Shopify template.

The product has two halves:

1. **Storefront** — the public shopping site where customers browse drops, view products, and check out.
2. **Admin CRM** — an internal dashboard where the brand team manages products, inventory, orders, drops, and customers, without needing a developer.

Payments run through **Paystack**, in Naira (NGN), supporting card, bank transfer, and USSD — the payment methods that actually work for the target audience, not just card-only checkout.

---

## 2. Goals

### Business goals
- Launch a store that can sell out a "drop" (limited release) without breaking under moderate concurrent traffic.
- Give the brand a way to run scarcity-driven releases (limited quantity, timed drops) — a core streetwear sales mechanic.
- Reduce founder/staff manual work: order management, stock updates, and customer comms should not require touching a database or a developer.
- Build a brand-grade digital presence that matches the quality bar of brands like Aimé Leon Dore, Palace, and Fear of God — because that visual credibility is part of what sells streetwear.

### User goals
- Browse and shop comfortably on a phone, on average Nigerian mobile network conditions.
- Trust the site enough to pay real money on first visit (this matters a lot for a young/newer brand — trust signals, clear policies, real order confirmation).
- Pay with whatever method is easiest for them (card, transfer, USSD) without friction.
- Know clearly what's in stock, what's sold out, and when the next drop is.

### Non-goals (explicitly out of scope for v1)
- Multi-brand or multi-vendor marketplace functionality.
- International shipping/fulfillment logistics (design should not block it, but don't build it now).
- Native mobile app (this is a responsive web app only).
- Loyalty points / rewards program.
- Multi-language support (English only for v1).
- Multi-currency (NGN only for v1).

---

## 3. Target Users & Personas

### Primary: "The Customer" — young Nigerian streetwear buyer
- Age 16–30, lives in a major Nigerian city (Lagos, Abuja, PH), discovers drops via Instagram/WhatsApp/TikTok.
- Shops almost entirely on a phone.
- Price-sensitive but willing to pay for pieces that feel exclusive/limited.
- Distrusts unfamiliar online stores — has been burned before by fake vendors. Needs visible trust signals.
- Comfortable paying via bank transfer or USSD as much as (or more than) card.

### Secondary: "The Brand Operator" — admin/staff user
- Founder or 1–3 staff members managing the store day to day.
- Not necessarily technical — needs a CRM that's closer to "Notion-simple" than "enterprise dashboard."
- Needs to: add new drops fast (ideally the night before or morning of a release), update stock as items sell, see and fulfil orders, and message/refund customers when something goes wrong.

---

## 4. Core Concepts & Domain Model

Streetwear commerce has specific mechanics that differ from generic e-commerce. Build for these from the start:

- **Product** — a design (e.g., "Godpaid Varsity Jacket"). Has multiple **Variants** (size × colorway combinations), each with its own stock count, SKU, and optionally its own price.
- **Drop** — a scheduled release event. A drop bundles one or more products, has a `release_at` timestamp, and can gate visibility (products in an upcoming drop are visible as "coming soon" but not purchasable until release time).
- **Collection** — a curated grouping of products for browsing (not necessarily tied to a drop — e.g., "Core", "Archive").
- **Order** — a completed or in-progress purchase, tied to a customer, containing one or more order line items (variant + quantity + price at time of purchase).
- **Customer** — a shopper account (guest checkout must also be supported — do not force account creation to buy).
- **Inventory** — stock is tracked at the variant level. Must decrement atomically on successful payment to prevent overselling during high-demand drops.

---

## 5. Functional Requirements — Storefront

### 5.1 Homepage
- Hero section built around the current or upcoming drop (the brief's single most important message: "what's dropping and when").
- If a drop is scheduled but not live: show a countdown and allow email/WhatsApp signup for a "notify me" list.
- Featured/new arrivals grid.
- Entry points into collections.
- Footer with brand story snippet, policy links (shipping, returns, size guide), and social links.

### 5.2 Product Listing Page (PLP)
- Grid of products per collection/category.
- Filters: size, color, category, price range, availability (in stock / sold out).
- Sort: newest, price low–high, price high–low.
- Sold-out products remain visible (do not hide — streetwear customers browse sold-out drops; this also builds FOMO for the next release) but are clearly marked and non-purchasable.
- Infinite scroll or pagination — pick one, be consistent.

### 5.3 Product Detail Page (PDP)
- Image gallery (multiple angles, zoom on tap for mobile).
- Size selector — sizes with zero stock shown but disabled, not hidden.
- Color/variant selector where applicable.
- Price (NGN, formatted with thousands separator, e.g. ₦45,000).
- Stock urgency indicator when stock is low (e.g., "Only 3 left") — genuine, driven by real inventory numbers, never fake.
- Add to cart / Buy now.
- Product description, materials, fit notes, size guide link.
- Related products.

### 5.4 Cart
- Persistent cart (survives page reload — use a cart token in a cookie/localStorage tied to a server-side cart record, not just client state, so it also works if the customer switches devices when logged in).
- Editable quantities, remove items.
- Real-time stock validation — if an item sold out while in someone's cart, flag it before checkout, don't let checkout fail silently.
- Order summary with subtotal, shipping estimate, total.

### 5.5 Checkout
- Guest checkout by default; optional account creation/login.
- Shipping address form — must support Nigerian address conventions (state, LGA optional, no rigid Western ZIP-code assumptions).
- Shipping method/cost (flat rate acceptable for v1; structure the schema so per-state or per-zone rates can be added later without a rebuild).
- Order review step showing full breakdown before payment.
- **Payment via Paystack** (see Section 7) — this is the final step; on success, redirect to an order confirmation page.
- Order confirmation page + email (and ideally WhatsApp message, given the brand's existing WhatsApp-driven customer habits) with order number and summary.

### 5.6 Customer Account (optional login)
- Order history and order status tracking.
- Saved addresses.
- Wishlist/saved items.
- Basic profile (name, email, phone, WhatsApp number).

### 5.7 Trust & Content Pages
- About/brand story.
- Size guide.
- Shipping & delivery policy.
- Returns/exchange policy.
- Contact (with WhatsApp deep link, since that's the brand's actual support channel).
- FAQ.

---

## 6. Functional Requirements — Admin CRM

The CRM is a separate authenticated area (e.g. `admin.godpaid.com` or `/admin`), built for non-technical staff. Prioritize speed of common tasks over feature completeness.

### 6.1 Roles & Permissions
- **Owner/Admin** — full access including staff management, financial data, discount codes.
- **Staff** — product/order/inventory management, no access to financial reports or staff management.
- Design the permission model now even if only one role is used at launch — retrofitting roles later is painful.

### 6.2 Product Management
- Create/edit/archive products.
- Multi-image upload with drag-to-reorder.
- Variant management (add/remove size & color combinations, set stock and price per variant).
- Bulk stock update (CSV import/export is a strong nice-to-have, not blocking for v1).
- Assign products to collections and drops.
- Draft vs Published state — allows staff to prep a drop in advance without it being publicly visible.

### 6.3 Drop Management
- Create a drop: name, description, linked products, `release_at` timestamp, optional `end_at` for limited-time drops.
- Preview mode so staff can see exactly what the countdown/live page will look like before it goes public.

### 6.4 Order Management
- Order list with filters (status: pending payment, paid, fulfilled, shipped, delivered, cancelled, refunded).
- Order detail view: customer info, line items, payment status (synced from Paystack), shipping address.
- Manual status updates (mark as shipped, add tracking reference).
- Refund initiation (should call Paystack's refund API, not just mark internally as refunded).
- Export orders (CSV) for offline processing/accounting.

### 6.5 Customer Management
- Customer list with order history and lifetime value.
- Basic search by name/email/phone.
- View a customer's full order and contact history in one place.

### 6.6 Inventory Overview
- Cross-product stock view — a single screen to see what's low/out of stock across the whole catalog, since restocking decisions need this at a glance.

### 6.7 Discount Codes
- Create percentage or fixed-amount discount codes.
- Usage limits (total uses, per-customer uses), expiry date, minimum order value.

### 6.8 Dashboard/Analytics (v1: simple, not a BI tool)
- Revenue over time (day/week/month toggle).
- Top-selling products/variants.
- Order volume and average order value.
- Live view of "current drop performance" during an active release — this matters more to the brand than general analytics.

---

## 7. Payments — Paystack Integration

This is a hard requirement, not a nice-to-have, and it needs to be correct — this is money.

### 7.1 Method
- Use **Paystack's hosted checkout (Paystack Inline or Standard Checkout)** for v1 — do not attempt to build a custom card form (PCI scope, and Paystack's hosted flow already supports card, bank transfer, and USSD out of the box, which covers the target audience's actual payment habits).
- Currency: NGN. Amounts must be sent to Paystack in kobo (multiply NGN by 100) — a very common and easy bug to introduce; flag this explicitly in code review.

### 7.2 Flow
1. Customer completes checkout form → server creates a `pending` order record with a unique reference.
2. Server initializes a Paystack transaction (`/transaction/initialize`) with that reference, amount, customer email, and a callback URL.
3. Customer is redirected to Paystack's hosted payment page (or Inline popup) to complete payment.
4. **Do not trust the client-side redirect alone to confirm payment.** On return, verify the transaction server-side via `/transaction/verify/:reference`.
5. **Set up a Paystack webhook** (`charge.success` event) as the source of truth for payment confirmation — this covers cases where the customer closes the tab after paying but before the redirect completes. Webhook handler must verify Paystack's signature header before trusting the payload.
6. Only decrement inventory and mark the order `paid` after webhook/verify confirmation, never on the client-side success callback alone.
7. Handle idempotency: if the webhook fires more than once for the same reference (Paystack can retry), the handler must be safe to run twice without double-decrementing stock or double-fulfilling the order. (Ayomide has existing reference material on idempotent payment handling in Nigerian payment contexts — apply the same pattern here: check current order status before applying the state transition.)

### 7.3 Failure & Edge Cases
- Payment failed/abandoned → order stays `pending`, customer can retry from the order page, and stock should be held only briefly (e.g., a short reservation window) rather than indefinitely, so abandoned pending orders don't lock up inventory during a hot drop.
- Partial/failed webhook delivery → build a fallback reconciliation job that polls Paystack for any `pending` orders older than a few minutes and verifies their real status.
- Refunds — trigger via Paystack's refund API from the admin CRM (Section 6.4), and reflect the resulting status back on the order.

### 7.4 Environment & Secrets
- Paystack public key used client-side for Inline; secret key stays server-side only, never shipped to the client bundle.
- Separate test/live key pairs, environment-gated.

---

## 8. Notifications

- Order confirmation — email at minimum; WhatsApp message is strongly preferred given the brand's existing customer relationship style (this can use a WhatsApp Business API/Cloud API integration, or a simpler click-to-chat link approach for v1 if the full API integration isn't ready).
- Shipping/status update notifications.
- "Drop is live" notification to the notify-me list built from the homepage countdown signup (Section 5.1).
- Low-stock alert to admin (internal, e.g. Slack/email/WhatsApp to staff) when a variant crosses a stock threshold.

---

## 9. Non-Functional Requirements

- **Mobile-first, seriously.** The overwhelming majority of traffic will be mobile Safari/Chrome on mid-range Android devices over Nigerian mobile networks. Design and test for that reality, not for a wide desktop viewport.
- **Performance under drop-day load.** A drop can drive a traffic spike far above normal daily traffic. Product and checkout pages should be fast and resilient to concurrent load; avoid patterns that hammer the database per-request for read-heavy pages (cache product/PLP data).
- **No overselling.** Stock decrement on payment confirmation must be atomic/transactional — this is the single most damaging bug class for a drop-based store (selling more units than exist, then having to cancel/refund and damage trust).
- **SEO-friendly storefront** — server-rendered or statically generated product pages, proper meta tags/OG images (product images matter a lot for social sharing of drops).
- **Accessibility** — real focus states, sufficient contrast (see `DESIGN_GUIDE.md` for how this is handled within a black-and-white palette), alt text on product images.
- **Security** — standard auth hardening on the admin CRM (this holds customer PII and order data), rate limiting on checkout/login endpoints, Paystack webhook signature verification (Section 7.2).

---

## 10. Suggested Technical Stack

This is a recommendation, not a mandate — an implementing agent should follow it unless there's a strong reason not to, since it matches the founder's existing toolchain across other projects and keeps operational overhead low.

- **Frontend/Framework:** Next.js (App Router), React, TypeScript.
- **Styling:** Tailwind CSS, using the token system defined in `DESIGN_GUIDE.md`.
- **Database:** PostgreSQL (Neon or Supabase both fit; Supabase additionally offers storage + auth if that reduces total moving parts).
- **Auth:** Clerk (or Supabase Auth) for customer accounts; a separate, more locked-down auth path for the admin CRM (do not reuse the exact same auth surface/roles for storefront customers and staff).
- **Media storage:** Vercel Blob or Supabase Storage for product images.
- **Payments:** Paystack (Section 7).
- **Hosting:** Vercel.
- **Notifications:** Resend/Postmark for transactional email; WhatsApp Cloud API (or click-to-chat as a v1 shortcut) for WhatsApp messages.

---

## 11. Data Model (high-level entities)

```
Product
  id, name, slug, description, category, collection_id, drop_id,
  status (draft|published|archived), created_at, updated_at

Variant
  id, product_id, size, color, sku, price_override (nullable),
  stock_quantity, reserved_quantity

Collection
  id, name, slug, description

Drop
  id, name, description, release_at, end_at (nullable), status

Customer
  id, name, email, phone, whatsapp_number, created_at

Address
  id, customer_id, label, recipient_name, phone, state, city,
  street_address, landmark (nullable)

Order
  id, order_number, customer_id (nullable for guest), status,
  subtotal, shipping_fee, discount_total, total, currency,
  paystack_reference, payment_status, shipping_address_id,
  created_at, updated_at

OrderItem
  id, order_id, variant_id, quantity, unit_price_at_purchase

DiscountCode
  id, code, type (percentage|fixed), value, min_order_value,
  usage_limit, per_customer_limit, expires_at

AdminUser
  id, name, email, role (owner|staff), created_at
```

Use this as a starting schema, not a final one — an implementing agent should adjust field types/constraints to fit the chosen ORM, but the entity relationships and the separation of `stock_quantity` vs `reserved_quantity` (for handling pending-checkout holds, Section 7.3) should be preserved.

---

## 12. Key User Flows to Build & Test End-to-End

1. **First-time customer buys a single item, guest checkout, pays by card.**
2. **Returning customer buys during a live drop with a size selector under contention (stock hits zero while they're mid-checkout)** — must fail gracefully, not oversell.
3. **Customer pays by bank transfer via Paystack, closes the browser tab before redirect completes** — order must still be correctly marked paid via webhook.
4. **Staff creates a new drop the night before, schedules release time, previews it, and it goes live automatically at the scheduled time with zero manual action needed at go-time.**
5. **Staff processes a refund from the CRM** and the customer's order status and Paystack record both reflect it.
6. **Staff updates stock mid-drop** and the storefront reflects it without a hard refresh being required (real-time or near-real-time stock accuracy matters a lot during a drop).

---

## 13. Phasing

**Phase 1 — MVP (launch-blocking)**
Sections 5 (minus wishlist), 6.1–6.4, Section 7 in full, basic order confirmation email.

**Phase 2 (fast follow)**
Wishlist, discount codes (6.7), analytics dashboard (6.8), WhatsApp notifications, low-stock alerts.

**Phase 3 (later)**
CSV bulk import/export, per-zone shipping rates, customer accounts' saved addresses polish, loyalty/referral mechanics (if the business decides to pursue this later — currently a non-goal).

---

## 14. Open Questions / Assumptions the Implementing Agent Should Flag or Confirm

- Exact shipping fee structure (flat rate vs zone-based) — v1 assumes flat rate.
- Whether WhatsApp Cloud API integration is available at build time, or whether v1 should ship with a click-to-chat fallback.
- Return/exchange policy specifics (time window, condition requirements) — needed for the policy content page copy, not just the schema.
- Whether guest checkout customers should be soft-matched to an account by email for order history purposes, or kept fully separate.
- Final brand name confirmation — this document uses "Godpaid" throughout; confirm this matches the registered brand/domain before hardcoding it into copy, metadata, and legal pages.

---

*Pair this document with `DESIGN_GUIDE.md` for the full visual system before starting implementation.*
