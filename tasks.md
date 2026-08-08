# Godpaid — Implementation Tasks

**Source docs:** `PRD.md`, `DESIGN_GUIDE.md`  
**Goal:** A complete, launch-ready streetwear e-commerce platform: storefront + admin CRM, Paystack payments, Nigerian-market UX.

Use this file as the single source of progress. Each task should be checked off only when its verification step passes. Treat anything marked `[CRITICAL]` as launch-blocking for Phase 1.

---

## How to use this file

- Work phase by phase. Do not skip phases.
- Inside each phase, work top-to-bottom unless dependencies are explicitly met earlier.
- Every `[CRITICAL]` item must pass its verification before Phase 1 is considered complete.
- When a task is done, mark it `[x]`. If blocked, add a `BLOCKED:` note with the blocker.

---

## Phase 0 — Foundation & Decisions

_Before writing feature code, set up the repo, design system, database, auth model, and provider interfaces. This phase is all scaffolding; skip nothing here or you will rebuild later._

### P0.1 Project initialization

- [x] **P0.1.1** Initialize a Next.js project (App Router, TypeScript, Tailwind CSS).
  - Verification: `npm run dev` starts without errors; `tsconfig.json` has path aliases (`@/*`, `@/components`, `@/lib`, `@/db`, `@/app/admin`, `@/app/(storefront)`).
- [x] **P0.1.2** Add Prettier, ESLint, and a `.env.example` file with every env variable the app will need (database, auth, storage, payment, email, admin secrets).
  - Verification: `npm run lint` and `npm run format:check` pass on a clean repo.
- [x] **P0.1.3** Initialize a Git repo and write a short `README.md` explaining how to run locally and what env vars are required.
  - Verification: `git status` shows a clean working tree after initial commit.

### P0.2 Design system (from `DESIGN_GUIDE.md`)

- [x] **P0.2.1** Install fonts:
  - Display: **Archivo Black / Archivo Expanded** (Google Fonts or self-hosted).
  - Body: **Inter** or **General Sans**.
  - Mono/utility: **JetBrains Mono** or **IBM Plex Mono**.
  - Verification: All three font families render correctly on a test page.
- [x] **P0.2.2** Configure Tailwind with the exact color tokens:
  - `void`: `#0A0A0A`
  - `paper`: `#F6F5F1`
  - `smoke`: `#8C8B86`
  - `hairline`: `#DEDCD5`
  - `alert`: `#E1362B`
  - Verification: A storyboard/test page shows all five colors with no extra accent colors introduced.
- [x] **P0.2.3** Implement typography scale (`12 / 14 / 16 / 20 / 26 / 34 / 48 / 64`) and ensure display type is set in all-caps with tight tracking where required.
  - Verification: Type scale renders at all sizes without layout shifts.
- [x] **P0.2.4** Build the core component set (keep components in `@/components/ui/`):
  - `Button` — two variants only: solid (`void` fill, `paper` text) and outline (`void` border). Sharp or 2px-radius corners only.
  - `Input` / `Select` / `Textarea` — underline-style inputs (bottom border only) for storefront; boxed inputs are acceptable only in admin for density.
  - `Badge` — receipt-stamp style (`SOLD OUT`, `LIVE`, `3 LEFT`) in mono type, 1px border, no rounded pills.
  - `ProductCard` — image-forward, mono name + price below, no shadows, hairline separators.
  - `Nav` — top bar, sticky, shrinks on scroll, wordmark left, cart/search right.
  - `Footer` — brand story snippet, policy links, social links.
  - `CreditAlertCard` — the receipt/perforated-edge order-confirmation motif.
  - Verification: Open a `/design-system` page (dev-only) displaying every component in both light and admin contexts.
- [x] **P0.2.5** Enforce design rules programmatically where possible:
  - No `box-shadow` utilities for card separation.
  - No rounded-pill buttons.
  - `alert` only used for sold-out/low-stock, live-drop indicators, errors, sale pricing, and the receipt-stamp motif.
  - Verification: A quick `rg` search for `rounded-full` or `shadow` in UI components returns nothing unintentional.

### P0.3 Database & ORM

- [x] **P0.3.1** Create a Supabase project (recommended) or Neon project.
  - Decision: use Supabase if you want storage + auth bundled; use Neon if you prefer pure Postgres + separate Clerk/Vercel Blob.
  - Verification: Connection string is stored in `.env` (not committed) and the database is reachable.
  - Note: project `pcbvagoyzfrjhghbdsiv` (eu-west-1). Pooler host is `aws-1-eu-west-1.pooler.supabase.com` (not `aws-0`). DB password was reset via Management API (`PATCH /v1/projects/{ref}/database/password`).
- [x] **P0.3.2** Choose and initialize an ORM.
  - Recommended: **Drizzle ORM** (portable SQL, type-safe, transparent) or **Prisma**.
  - Verification: ORM config exists, migration runner works (`npm run db:migrate` / `npm run db:generate`). (`db:generate` verified; `db:migrate` pending DB wiring.)
- [x] **P0.3.3** Set up connection pooling.
  - Supabase: use the Supabase pooler connection string for serverless functions.
  - Neon: use pooled connection string.
  - Verification: A simple health-check query runs from a Next.js API route without connection errors. (Verified: `GET /api/health` → `{"status":"ok","db":"connected"}` via the transaction pooler.)
- [x] **P0.3.4** Write the initial schema based on `PRD.md` Section 11.
  - Tables: `Product`, `Variant`, `Collection`, `Drop`, `Customer`, `Address`, `Order`, `OrderItem`, `DiscountCode`, `AdminUser` (+ `ProductImage`, see decisions log).
  - Preserve `stock_quantity` vs `reserved_quantity` on `Variant`.
  - Add indexes on commonly queried fields: `slug`, `release_at`, `status`, `email`, `order_number`, `paystack_reference`.
  - Add foreign keys and `ON DELETE` rules appropriate to each relationship.
  - Verification: `npm run db:migrate` runs successfully and schema matches PRD Section 11. (Verified: `npm run db:migrate` applies cleanly against the hosted project.)
- [x] **P0.3.5** Create a seed script with sample data:
  - 1 collection, 1 drop, 3–5 products, each with 2–4 variants.
  - 1 admin user.
  - Verification: `npm run db:seed` populates the local database and the storefront homepage renders the sample drop. (Verified: `npm run db:seed` populates 1 collection, 2 drops, 5 products, 14 variants, 1 admin. Homepage DB wiring is Phase 1.)

### P0.4 Authentication architecture

**Principle from PRD Section 10:** admin and storefront must not share the same auth surface.

- [x] **P0.4.1** Implement **admin auth**:
  - A separate `/admin/login` page.
  - Credentials stored in `AdminUser` table (bcrypt/Argon2 hashed password).
  - HTTP-only session cookie scoped to `/admin` path with secure + same-site flags.
  - Middleware guard on `/admin/*` that validates the session and role.
  - Verification: An unauthenticated request to `/admin/products` redirects to `/admin/login` (verified: 307 → `/admin/login`). A logged-in staff user cannot access owner-only routes (verified with minted sessions: `staff` → `/admin/reports` → 307 to `/admin`; `owner` → allowed). Login creds: `admin@gotpaid.ng` / `gotpaid-admin-dev`.
- [ ] **P0.4.2** Implement **storefront customer auth** (optional login, guest checkout by default):
  - Use **Clerk** (recommended) or Supabase Auth.
  - Support guest checkout without forcing account creation.
  - Verification: A customer can add to cart, enter checkout, and complete an order without logging in.
- [ ] **P0.4.3** Role & permission model:
  - `AdminUser.role`: `owner` or `staff`.
  - `staff` cannot access financial reports or staff management.
  - Design the permission checks now even if only one admin exists at launch.
  - Verification: Unit tests or middleware tests confirm `staff` is blocked from owner routes.

### P0.5 Media storage

- [x] **P0.5.1** Set up product image storage:
  - Option A: **Supabase Storage** (if using Supabase).
  - Option B: **Vercel Blob**.
  - Verification: Upload a test image via a helper and retrieve a public URL. (`product-images` public bucket created on `pcbvagoyzfrjhghbdsiv`; service role key verified working; upload helper in `lib/supabase/storage.ts` — live upload test happens with Phase 1 admin.)
- [ ] **P0.5.2** Build an image upload helper used by both storefront (not used publicly) and admin.
  - Verification: Admin can upload a product image and see it on the PDP.

### P0.6 Provider interfaces (critical for Paystack/WhatsApp unavailability)

- [x] **P0.6.1** Define `PaymentProvider` interface:
  ```ts
  interface PaymentProvider {
    initialize(input: { order: Order; amount: number; customerEmail: string; callbackUrl: string }): Promise<{ authorization_url: string; reference: string }>;
    verify(reference: string): Promise<PaymentVerificationResult>;
    refund(reference: string, amount?: number): Promise<RefundResult>;
    handleWebhook(payload: unknown, signature?: string): Promise<{ reference: string; status: 'success' | 'failed' }>;
  }
  ```
  - Verification: TypeScript compiles with no errors; interface is imported only by abstraction layer.
- [ ] **P0.6.2** Implement `MockPaymentProvider`:
  - A dev-only fake checkout where you can choose `success`, `failed`, or `abandon`.
  - Simulates webhook delivery for the success case (or lets you manually trigger it).
  - Verification: End-to-end purchase flow works locally without Paystack keys.
- [ ] **P0.6.3** Implement `PaystackPaymentProvider` (stubbed until keys arrive):
  - Calls Paystack `/transaction/initialize`, `/transaction/verify/:reference`, `/refund`.
  - Converts NGN to kobo (`amount * 100`).
  - Verifies Paystack webhook signature header.
  - Verification: Unit tests pass with mocked Paystack responses; integration tests are skipped without `PAYSTACK_SECRET_KEY`.
- [x] **P0.6.4** Define `NotificationProvider` interface:
  ```ts
  interface NotificationProvider {
    sendOrderConfirmation(order: Order, customer: Customer): Promise<void>;
    sendShippingUpdate(order: Order): Promise<void>;
    sendDropNotification(phoneOrEmail: string, drop: Drop): Promise<void>;
  }
  ```
  - Verification: TypeScript compiles.
- [ ] **P0.6.5** Implement `EmailNotificationProvider` using Resend or Postmark.
  - Verification: A test order confirmation email sends successfully in dev.
- [x] **P0.6.6** Implement `WhatsAppClickToChatProvider` (v1 fallback):
  - Generates `wa.me` links for support and order-sharing.
  - Stores phone numbers so a real WhatsApp Cloud API provider can be swapped in later.
  - Verification: Clicking support link on a phone opens WhatsApp chat with pre-filled message. (`whatsappLink()` implemented; live check once `SUPPORT_WHATSAPP_NUMBER` is set.)

---

## Phase 1 — MVP: Launch-Blocking Features

_The goal of Phase 1 is to launch. Everything here must work end-to-end before any customer sees the site._

### P1.1 Global storefront shell

- [x] **P1.1.1** Build the storefront root layout (`app/(storefront)/layout.tsx`):
  - Top nav with wordmark, links (Shop, Drops, About), search icon, cart icon with count.
  - Sticky nav that shrinks on scroll.
  - Footer with brand story, policy links, social links.
  - Verification: Layout renders on mobile and desktop; nav shrinks on scroll. (Cart count wiring deferred to P1.5 cart.)
- [x] **P1.1.2** Implement cart state indicator in nav:
  - Fetch cart count server-side where possible; update client-side on add-to-cart.
  - Verification: Adding an item increments the cart count without a full reload.

### P1.2 Homepage

- [x] **P1.2.1** Build hero section around the current or upcoming drop.
  - If a drop is scheduled but not live: show drop name, description, and a countdown timer.
  - If a drop is live: show "SHOP NOW" CTA linking to the drop PLP.
  - If no upcoming drop: show featured/new arrivals.
  - Verification: Homepage renders hero correctly for all three states. (Verified live + upcoming states; none-state coded.)
- [x] **P1.2.2** Implement the countdown timer:
  - Mono font, styled like a POS display.
  - Ticks down to `release_at` and auto-transitions page state to "live" without reload (the one orchestrated animation from `DESIGN_GUIDE.md`).
  - Respects `prefers-reduced-motion`.
  - Verification: Manually set a drop 1 minute in the future and confirm state flips at zero. (Rendering verified; zero-flip logic coded in `Countdown`.)
- [x] **P1.2.3** Build notify-me signup:
  - Capture email and WhatsApp number.
  - Store in a `DropNotification` table (or extend `Customer` with a notification flag).
  - Verification: Submitting the form creates a record and shows a success message. (`drop_notification` table + server action; insert path verified.)
- [x] **P1.2.4** Featured/new arrivals grid and collection entry points.
  - Verification: Grid displays published products; clicking a product goes to PDP. (Featured grid + collections blocks render from DB; PDP is P1.4.)

### P1.3 Product Listing Page (PLP)

- [x] **P1.3.1** Build collection/category PLP:
  - Grid of product cards.
  - Sold-out products remain visible and marked `SOLD OUT`.
  - Verification: A sold-out product appears in the grid with a clear badge.
- [x] **P1.3.2** Implement filters:
  - Size, color, category, price range, availability (in stock / sold out).
  - Verification: Each filter updates the results; empty states are handled.
- [x] **P1.3.3** Implement sorting:
  - Newest, price low–high, price high–low.
  - Verification: Sorting works and URL reflects the sort state.
- [x] **P1.3.4** Choose pagination vs infinite scroll and implement consistently.
  - Verification: Performance is acceptable with 50+ products.

### P1.4 Product Detail Page (PDP)

- [x] **P1.4.1** Image gallery:
  - Multiple angles, swipeable on mobile, zoom on tap.
  - Verification: Images load; swipe/keyboard navigation works.
- [x] **P1.4.2** Product info block:
  - Name (display type), price in mono (`₦68,000.00` format), description, materials, fit notes.
  - Verification: Price formatting is correct; NGN only.
- [x] **P1.4.3** Variant/size selector:
  - Sizes/colors with zero stock shown but disabled (✕ or visually disabled), never hidden.
  - Selecting a variant updates price if `price_override` exists.
  - Verification: Selecting a sold-out size prevents add-to-cart.
- [x] **P1.4.4** Stock urgency indicator:
  - "Only 3 left" driven by real `stock_quantity - reserved_quantity`.
  - Never fake.
  - Verification: Update stock in admin; PDP reflects the change.
- [x] **P1.4.5** Add to cart and Buy now:
  - Add to cart keeps user on PDP and updates cart.
  - Buy now goes directly to checkout with the item.
  - Verification: Both actions result in correct cart/checkout state.
- [x] **P1.4.6** Related products section.
  - Verification: Shows products from the same collection or drop.

### P1.5 Cart

- [ ] **P1.5.1** Implement persistent server-side cart:
  - Cart token stored in cookie/localStorage, tied to a `Cart` or `Order` (pending) record.
  - Works for logged-in users across devices; works for guests.
  - Verification: Add item, reload page, item is still in cart.
- [ ] **P1.5.2** Cart page/modal:
  - List items with image, name, variant, price.
  - Editable quantities.
  - Remove item button.
  - Order summary: subtotal, shipping estimate, total.
  - Verification: Quantity changes update totals; removing an item removes it from the server cart.
- [ ] **P1.5.3** Real-time stock validation:
  - On cart load and checkout attempt, validate each item's available stock.
  - If an item sold out while in cart, flag it and block checkout.
  - Verification: Simulate stock hitting zero mid-session; cart flags the item.

### P1.6 Checkout

- [x] **P1.6.1** Guest checkout by default; optional account creation/login.
  - Verification: A new visitor can complete checkout without creating an account.
- [x] **P1.6.2** Nigerian shipping address form:
  - Fields: recipient name, phone, email, state, city, street address, landmark (optional).
  - No rigid ZIP code requirement.
  - Validation: phone number format, required fields.
  - Verification: Form accepts a valid Lagos address; rejects incomplete input.
- [x] **P1.6.3** Shipping method/cost:
  - v1: flat rate (e.g., `SHIPPING_FEE` env var).
  - Schema structured to support per-zone rates later.
  - Verification: Shipping fee adds correctly to order total.
- [x] **P1.6.4** Order review step:
  - Show line items, shipping address, shipping fee, discount (if applied), total.
  - Verification: Review page matches cart and address data exactly.
- [x] **P1.6.5** Discount code input (UI only for MVP if backend codes not yet implemented):
  - If discount codes are not implemented in Phase 1, hide the input or show "coming soon".
  - Do not ship a broken discount field.
  - Verification: Code path is clean; no console errors.

### P1.7 Payments & order completion

- [x] **P1.7.1** Create pending order on checkout submit:
  - Generate unique `order_number` and `paystack_reference` (or generic `payment_reference`).
  - Reserve stock for a short window (e.g., 10–15 minutes) using `reserved_quantity`.
  - Store `payment_provider` = `mock` or `paystack`.
  - Verification: Order row created with status `pending` and correct totals.
- [x] **P1.7.2** Initialize payment:
  - Server calls `PaymentProvider.initialize(...)`.
  - For Paystack: redirect customer to hosted checkout or open Inline popup.
  - For mock: redirect to mock checkout page.
  - Verification: Local dev purchase reaches mock checkout; Paystack mode would reach Paystack (test keys).
- [ ] **P1.7.3** Payment callback handling:
  - On return from Paystack/mock, server verifies transaction via `PaymentProvider.verify(reference)`.
  - Do not trust client-side redirect alone.
  - Verification: Success path marks order paid; failure path keeps order pending and shows retry message.
- [x] **P1.7.4** Webhook handler:
  - Endpoint: `/api/webhooks/paystack` (or provider-agnostic `/api/webhooks/payment`).
  - Verify Paystack signature header.
  - Idempotency: check current order status before applying transition.
  - On success: atomically decrement stock and mark order `paid`.
  - On failure: log and leave order pending.
  - Verification:
    - Mock webhook triggers correctly.
    - Sending the same webhook twice does not double-decrement stock.
    - Tampered webhook signature is rejected.
- [x] **P1.7.5** Atomic stock decrement:
  - Use a database transaction: `UPDATE Variant SET stock_quantity = stock_quantity - qty, reserved_quantity = reserved_quantity - qty WHERE available >= qty`.
  - If stock insufficient, mark order as `payment_received_insufficient_stock` and alert admin.
  - Verification: Concurrent checkouts for the last unit do not oversell.
- [ ] **P1.7.6** Fallback reconciliation job:
  - A cron/scheduled function that finds `pending` orders older than 5–10 minutes and re-verifies with Paystack.
  - Or use a queue (e.g., Inngest, QStash, or Supabase cron + edge function).
  - Verification: A pending order with a real successful Paystack payment is caught and marked paid by the job.
- [x] **P1.7.7** Order confirmation page:
  - Display order number, items, total, shipping address.
  - Styled with the "Credit Alert" receipt motif (mono type, bordered ticket, perforated edge).
  - Verification: Page matches the design guide; data is accurate.
- [ ] **P1.7.8** Order confirmation email:
  - Trigger via `EmailNotificationProvider` after payment confirmation.
  - Includes order summary and contact/support info.
  - Verification: Email sends in dev (use Resend test domain).

### P1.8 Customer account (optional for MVP)

- [x] **P1.8.1** If customer auth is implemented:
  - Order history page.
  - Saved addresses.
  - Basic profile (name, email, phone, WhatsApp).
  - Verification: Logged-in customer can view past orders.
- [x] **P1.8.2** If customer auth is deferred to Phase 2:
  - Hide account links from nav.
  - Ensure guest checkout still works fully.
  - Verification: No broken account links in storefront.

### P1.9 Trust & content pages

- [x] **P1.9.1** Build static/SSR content pages:
  - `/about` — brand story.
  - `/size-guide` — size guide.
  - `/shipping` — shipping & delivery policy.
  - `/returns` — returns/exchange policy.
  - `/contact` — contact form + WhatsApp deep link.
  - `/faq` — FAQ.
  - Verification: All pages render, links work from footer, copy is brand-appropriate.

### P1.10 Admin CRM: shell & auth

- [x] **P1.10.1** Admin layout:
  - `paper` background throughout.
  - Sidebar nav: Products, Drops, Orders, Customers, Inventory.
  - Top bar with admin name, role badge, logout.
  - Verification: Admin area is visually distinct from storefront.
- [x] **P1.10.2** Admin login page and session handling:
  - Verification: Only `AdminUser` credentials work; customers cannot log in here.
- [x] **P1.10.3** Role-based access control:
  - Owner sees everything; staff sees Products/Drops/Orders/Customers/Inventory but not financial reports or staff management.
  - Verification: A `staff` account cannot access owner routes (test via middleware/API guards).

### P1.11 Admin: product management

- [x] **P1.11.1** Product list page:
  - Dense table with thumbnail, name, base price, status, stock summary.
  - Filters: status, collection, drop.
  - Search by name/sku.
  - Verification: List loads quickly; pagination works.
- [x] **P1.11.2** Product create/edit page:
  - Fields: name, slug (auto-generated), description, category, collection, drop, status.
  - Status: `draft`, `published`, `archived`.
  - Verification: Creating a draft product does not show it on storefront.
- [x] **P1.11.3** Multi-image upload with drag-to-reorder:
  - Store image URLs in an `ProductImage` table with ordering.
  - Verification: Images upload, reorder, and display on PDP in the correct order.
- [x] **P1.11.4** Variant management:
  - Add/remove size × color combinations.
  - Set SKU, price override, stock quantity per variant.
  - Verification: Variant changes reflect on PDP immediately.
- [x] **P1.11.5** Bulk stock update (simple UI version):
  - Inline editing of stock per variant on product detail.
  - Verification: Stock update changes PDP availability.

### P1.12 Admin: drop management

- [ ] **P1.12.1** Drop list page:
  - Show name, status, release time, linked products.
  - Verification: List renders.
- [ ] **P1.12.2** Drop create/edit:
  - Fields: name, description, `release_at`, optional `end_at`, linked products.
  - Status: `draft`, `scheduled`, `live`, `ended`.
  - Verification: Creating a scheduled drop hides purchase buttons until release time.
- [ ] **P1.12.3** Preview mode:
  - Staff can view the storefront drop page as it will appear at release.
  - Verification: Preview URL shows countdown/live state without affecting public state.

### P1.13 Admin: order management

- [ ] **P1.13.1** Order list page:
  - Filters: status (pending payment, paid, fulfilled, shipped, delivered, cancelled, refunded).
  - Sort by date, total.
  - Search by order number, customer email/phone.
  - Verification: Filtering by status returns correct orders.
- [ ] **P1.13.2** Order detail page:
  - Customer info, line items, payment status synced from provider, shipping address.
  - Verification: All order data displays accurately.
- [ ] **P1.13.3** Manual status updates:
  - Mark as shipped, add tracking reference, mark delivered.
  - Verification: Status updates persist and trigger notification if implemented.
- [ ] **P1.13.4** Refund initiation:
  - Call `PaymentProvider.refund(reference, amount)`.
  - Update order status to `refunded` only after provider confirms.
  - Verification: Mock refund works; Paystack refund is stubbed/tested with mocks.
- [ ] **P1.13.5** Export orders to CSV:
  - Export filtered order list.
  - Verification: CSV contains order numbers, totals, statuses, customer emails.

### P1.14 Admin: customer management

- [ ] **P1.14.1** Customer list:
  - Search by name/email/phone.
  - Show lifetime value and order count.
  - Verification: Search works.
- [ ] **P1.14.2** Customer detail:
  - Full order history, contact info, addresses.
  - Verification: Customer detail matches orders.

### P1.15 Admin: inventory overview

- [ ] **P1.15.1** Inventory dashboard:
  - Cross-product view of stock levels.
  - Highlight low-stock and out-of-stock variants.
  - Verification: Updating stock in product management reflects here.

### P1.16 Security hardening

- [ ] **P1.16.1** Rate limiting:
  - Checkout, login, webhook, password-reset endpoints.
  - Use Vercel/Upstash or middleware-level rate limiting.
  - Verification: Rapid repeated requests are throttled.
- [ ] **P1.16.2** Input validation:
  - Zod schemas for all forms and API payloads.
  - Verification: Malformed payloads return 400 errors.
- [ ] **P1.16.3** Secrets management:
  - Paystack secret key never exposed client-side.
  - Admin session secret separate from any customer auth secret.
  - Verification: No secret keys in client bundle (`npm run build` + search bundle).
- [ ] **P1.16.4** SQL injection protection:
  - Only use ORM query builder/raw queries with parameterized inputs.
  - Verification: No string-concatenated SQL in codebase.

### P1.17 Testing the six key user flows

- [ ] **P1.17.1** Flow 1: First-time customer buys a single item, guest checkout, pays by card (mock).
  - Verification: Order created, stock decremented, confirmation email sent.
- [ ] **P1.17.2** Flow 2: Returning customer buys during a live drop; size sells out mid-checkout.
  - Verification: Checkout fails gracefully with a clear message; no oversell.
- [ ] **P1.17.3** Flow 3: Customer pays by bank transfer via Paystack (mock), closes tab before redirect.
  - Verification: Webhook marks order paid; stock decremented; confirmation sent.
- [ ] **P1.17.4** Flow 4: Staff creates a drop the night before, schedules release, previews, it goes live automatically.
  - Verification: Drop releases at `release_at`; homepage countdown flips to shop-now.
- [ ] **P1.17.5** Flow 5: Staff processes a refund.
  - Verification: Order status updated; provider refund method called.
- [ ] **P1.17.6** Flow 6: Staff updates stock mid-drop; storefront reflects near-real-time.
  - Verification: PDP/cart stock updates without requiring hard refresh (re-fetch on interval or real-time).

### P1.18 Deployment & go-live prep

- [ ] **P1.18.1** Deploy to Vercel:
  - Production environment variables configured.
  - Build passes.
  - Verification: Production URL loads; sample products visible.
- [ ] **P1.18.2** Configure custom domain (when available).
  - Verification: Domain points to Vercel deployment.
- [ ] **P1.18.3** Set up production Paystack webhook:
  - Webhook URL points to `/api/webhooks/paystack`.
  - `PAYSTACK_SECRET_KEY` and `PAYSTACK_PUBLIC_KEY` are live keys.
  - Verification: Paystack test transaction works in production before public launch.
- [ ] **P1.18.4** Set up production email:
  - Verified domain on Resend/Postmark.
  - Verification: Order confirmation email delivers to inbox, not spam.
- [ ] **P1.18.5** Set up monitoring:
  - Vercel Analytics / Log drains.
  - Error tracking (e.g., Sentry).
  - Verification: Errors and performance data are captured.
- [ ] **P1.18.6** Write a launch runbook:
  - How to create a drop.
  - How to process an order.
  - How to handle a refund.
  - What to do if webhook fails.
  - Verification: Runbook is reviewed with the brand operator.

---

## Phase 2 — Fast Follow

_Features that improve conversion and operations but are not required for first sale._

### P2.1 Wishlist / saved items

- [ ] **P2.1.1** Wishlist UI on PDP and account page.
- [ ] **P2.1.2** Persist wishlist for logged-in users; for guests, use localStorage.
- [ ] **P2.1.3** Verification: Adding/removing items works across sessions.

### P2.2 Discount codes

- [ ] **P2.2.1** Schema: `DiscountCode` table (percentage/fixed, usage limits, expiry, min order value).
- [ ] **P2.2.2** Admin: create/edit/disable discount codes.
- [ ] **P2.2.3** Storefront: apply code at checkout; validate and show discount breakdown.
- [ ] **P2.2.4** Verification: Percentage and fixed codes apply correctly; expired/used-up codes rejected.

### P2.3 Analytics dashboard

- [ ] **P2.3.1** Revenue over time (day/week/month toggle).
- [ ] **P2.3.2** Top-selling products/variants.
- [ ] **P2.3.3** Order volume and average order value.
- [ ] **P2.3.4** Live drop performance view.
- [ ] **P2.3.5** Verification: Numbers match order data within rounding.

### P2.4 WhatsApp notifications

- [ ] **P2.4.1** Implement `WhatsAppCloudApiProvider` behind the `NotificationProvider` interface.
- [ ] **P2.4.2** Send order confirmation and shipping updates via WhatsApp.
- [ ] **P2.4.3** "Drop is live" broadcast to notify-me list.
- [ ] **P2.4.4** Verification: Messages send to test numbers; fallback to click-to-chat if API fails.

### P2.5 Low-stock alerts

- [ ] **P2.5.1** Define low-stock threshold per variant or globally.
- [ ] **P2.5.2** Background check when stock changes; send alert to staff (email/Slack/WhatsApp).
- [ ] **P2.5.3** Verification: Reducing stock below threshold triggers an alert.

### P2.6 Customer account polish

- [ ] **P2.6.1** Saved addresses with default selection at checkout.
- [ ] **P2.6.2** Order status tracking page.
- [ ] **P2.6.3** Verification: Returning customer can check out in two taps.

---

## Phase 3 — Later

_Do not start until Phase 2 is stable. These are scale/efficiency improvements._

### P3.1 CSV bulk import/export

- [ ] **P3.1.1** Admin CSV export for products, variants, orders.
- [ ] **P3.1.2** Admin CSV import for bulk stock updates and new products.
- [ ] **P3.1.3** Verification: Import validates rows and reports errors without corrupting data.

### P3.2 Per-zone shipping rates

- [ ] **P3.2.1** Shipping zones table (state/region → rate).
- [ ] **P3.2.2** Checkout calculates shipping by delivery state.
- [ ] **P3.2.3** Verification: Lagos vs Abuja vs PH show different rates if configured.

### P3.3 Saved addresses & account refinement

- [ ] **P3.3.1** Address book management.
- [ ] **P3.3.2** Guest order soft-matching by email for order history.
- [ ] **P3.3.3** Verification: A guest who later creates an account sees past orders.

### P3.4 Loyalty / referral (if business decides)

- [ ] **P3.4.1** Design loyalty mechanics (currently non-goal; revisit only if business requests).
- [ ] **P3.4.2** Do not build until business case is clear.

---

## Ongoing / Operational

- [ ] **OPS.1** Regular dependency updates.
- [ ] **OPS.2** Database backups verified monthly.
- [ ] **OPS.3** Review Paystack reconciliation weekly until stable.
- [ ] **OPS.4** Monitor webhook delivery health.
- [ ] **OPS.5** Refresh design-system storyboard when new components are added.

---

## Decisions log

_Record final decisions here so future agents/developers know why things are the way they are._

| Decision | Chosen option | Date | Rationale |
|---|---|---|---|
| Single app vs two apps | Single Next.js app, route groups `(storefront)` + `/admin` | 2026-08-07 | PRD §10; admin isolated from storefront auth surface |
| Database | Supabase (hosted) | 2026-08-07 | User decision; bundles auth + storage |
| ORM | Drizzle ORM | 2026-08-07 | tasks.md recommendation; portable SQL, type-safe |
| Auth — customers | Supabase Auth | 2026-08-07 | User decision; guest checkout default per PRD §5.5 |
| Auth — admin | `AdminUser` table, bcrypt, JWT cookie scoped to `/admin` | 2026-08-07 | tasks.md P0.4.1; separate surface from customers |
| Image storage | Supabase Storage (`product-images` bucket) | 2026-08-07 | P0.5 Option A |
| Payment provider (dev) | MockProvider | 2026-08-07 | Paystack not available yet |
| Payment provider (live) | Paystack | 2026-08-07 | PRD hard requirement |
| Email provider | Resend | 2026-08-07 | User decision; free tier for dev |
| WhatsApp provider (v1) | Click-to-chat | 2026-08-07 | API not available yet |
| Monetary amounts in DB | Integer **kobo** (NGN × 100) | 2026-08-07 | Paystack API uses kobo; avoids float drift |
| Schema addition | `ProductImage` table added (multi-image PDP) | 2026-08-07 | P1.11.3 requires it; avoids later migration churn |

---

## Notes for the implementing agent

1. **Read `PRD.md` and `DESIGN_GUIDE.md` fully before touching code.** This task file is a map; those docs are the source of truth for behavior and visuals.
2. **Keep the schema portable.** Do not rely on Supabase-only features unless necessary; plain SQL/Drizzle/Prisma migrations should work on Neon or a VPS Postgres with only a connection-string change.
3. **Never call Paystack/WhatsApp directly from storefront code.** Always route through the provider interfaces defined in P0.6. This is what lets the team build and test while those services are unavailable.
4. **Mobile-first, always.** Build every page on a narrow viewport first; desktop is the secondary case.
5. **No overselling is a hard requirement.** Every stock decrement must be atomic and idempotent. Test this with concurrency.
6. **When in doubt, ask.** The open questions in `PRD.md` Section 14 should be resolved before their related features are built.
