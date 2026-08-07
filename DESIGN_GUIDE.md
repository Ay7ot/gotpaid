# Godpaid — Design Guide

**Pairs with:** `PRD.md`
**Purpose:** This is the visual and interaction system for Godpaid. It exists so that any designer, engineer, or AI agent builds a *coherent, distinctive* product — not a black-and-white reskin of a generic Shopify template. Follow it exactly for anything it specifies; where it's silent, make choices consistent with the principles below rather than defaulting to whatever's easiest.

---

## 1. Brand Essence

Godpaid is a Nigerian streetwear label for a generation that grew up on POS transfers, "credit alert" SMS notifications, customs stamps on imported packages, and thrift/bale culture — and turned all of that into style rather than something to be embarrassed by. The name itself is a payment pun. The brand should feel **confident, dry-witted, and unmistakably Nigerian**, not a copy of an American or European streetwear identity in different packaging.

The visual system draws deliberately from three references, but should not read as a copy of any of them:

- **Aimé Leon Dore** — restraint, a strong wordmark treated as a design object in its own right, generous whitespace that lets product photography carry the page.
- **Palace** — dry humor in copy, willingness to be a little irreverent in an otherwise minimal system.
- **Fear of God** — a custom-feeling sans display face used with total consistency, so typography alone becomes recognizable.

What we borrow: restraint, confidence, letting product photography do the talking, typographic discipline.
What we do **not** borrow: their specific color choices, their exact layouts, or any literal use of their marks/fonts. Godpaid's signature comes from a different place entirely — see Section 5.

---

## 2. Design Plan (token system)

### Color — 5 named values, used with real restraint

| Token | Hex | Use |
|---|---|---|
| `void` | `#0A0A0A` | Primary black — backgrounds, primary text on light surfaces, the dominant "ink" of the brand |
| `paper` | `#F6F5F1` | Primary white — not a pure `#FFFFFF` (too clinical/screen-glare on mobile), slightly warm off-white, like uncoated paper stock |
| `smoke` | `#8C8B86` | Secondary text, placeholder text, disabled states |
| `hairline` | `#DEDCD5` | Borders, dividers, table rules — always 1px, never soft box-shadows |
| `alert` | `#E1362B` | The **single** accent color. Reserved for: live-drop indicators, "sold out"/low-stock flags, sale pricing, error states, and the receipt-stamp signature element (Section 5). Never used decoratively. |

Rule: any given screen is 90%+ `void`/`paper`/`hairline`. If `alert` appears more than once or twice on a screen, pull it back — its power is scarcity, matching the brand's actual sales mechanic (limited drops).

Do not introduce a second accent color (no blue links, no green success states) — success/confirmation states are communicated through the receipt/stamp motif and copy, not a second color, to keep the palette genuinely black-and-white as briefed.

### Typography — 3 roles

- **Display (headlines, product names, the wordmark treatment):** A tall, slightly condensed grotesk with heavy weight available — e.g. **Archivo Black** / **Archivo Expanded** (Bold/Black) as a freely-licensed stand-in if a custom face isn't commissioned. Set in all-caps for hero moments and section headers, tight tracking. This is the "shouting on a hoodie tag" voice.
- **Body (descriptions, UI copy, paragraphs):** A clean, neutral grotesk built for small sizes and Nigerian-network-friendly web font loading — e.g. **Inter** or **General Sans**. Regular/Medium only; avoid light weights (poor legibility on low-end Android screens in bright outdoor light, which is a real usage context here).
- **Utility/mono (prices, SKUs, order numbers, timestamps, countdown timers, stock counts):** A monospace face — e.g. **JetBrains Mono** or **IBM Plex Mono**. This is what makes the receipt/POS motif work — prices and order data should visually read like a printed transaction slip, not like marketing copy.

Type scale (base 16px):
`12 / 14 / 16 / 20 / 26 / 34 / 48 / 64` — display headlines live at 34–64, body at 16, captions/mono utility at 12–14.

### Layout concept

Asymmetric, editorial, grid-based — not a centered, boxed "SaaS landing page" layout. Product photography is full-bleed or near-full-bleed wherever it appears; text blocks are narrow and left-aligned against a strict column grid, echoing a packing slip or invoice layout rather than a marketing brochure.

```
Homepage hero (ASCII wireframe):
┌──────────────────────────────────────────┐
│ GODPAID          SHOP  DROPS  ABOUT   ⚲ 🛍│  <- hairline nav, mono small-caps
├──────────────────────────────────────────┤
│                                            │
│   [FULL-BLEED DROP IMAGE]                 │
│                                            │
│   DROP 004 — "OKRIKA"                     │ <- display, huge
│   RELEASES IN  02:14:36:09                │ <- mono countdown
│   [ NOTIFY ME ]                           │ <- outline button, void on paper
└──────────────────────────────────────────┘
```

```
PDP layout:
┌───────────────┬───────────────────────────┐
│               │ GODPAID VARSITY JACKET     │
│  [IMAGE       │ ₦68,000.00                 │ <- mono price
│   GALLERY,    │ ─────────────────────────  │
│   large,      │ SIZE   [S][M][L][XL ✕]     │ <- ✕ = sold out, still visible
│   swipeable   │ ─────────────────────────  │
│   on mobile]  │ ONLY 3 LEFT                │ <- alert-colored, mono
│               │ [ ADD TO CART ]            │
│               │ DESCRIPTION ▾               │
└───────────────┴───────────────────────────┘
```

### Signature element — the "Credit Alert" motif

The single unique, memorable element of the Godpaid system, and it comes directly from the brand's own world rather than a borrowed streetwear trope: **Nigerian bank debit/credit alert SMS formatting**, reimagined as a UI pattern.

Where it shows up:
- **Order confirmation:** styled like a transaction alert — mono font, bordered ticket shape, "GODPAID" as the merchant line, order total formatted exactly like a bank alert (`AMT: ₦68,000.00`), a torn/perforated bottom edge (CSS, not an image) evoking a receipt.
- **Stock/drop status badges:** small bordered tags in mono type — `SOLD OUT`, `LIVE`, `3 LEFT` — styled like a stamped customs/inspection mark rather than a soft rounded "chip," reinforcing the import/thrift-culture reference without being literal about it.
- **Drop countdown:** rendered in mono, styled like a digital till/POS display.

This is the one place the design is allowed to be a little maximalist/playful — everywhere else stays disciplined, per the restraint principle. Use it once per key moment (order confirmation, stock badges, countdown) — don't scatter perforated-edge styling everywhere or it stops meaning anything.

---

## 3. Components

- **Buttons:** Two styles only. *Solid* (`void` fill, `paper` text) for primary actions (Add to Cart, Pay Now). *Outline* (1px `void` border, transparent fill) for secondary actions (Notify Me, View Details). No rounded pill buttons — sharp or very slightly rounded (2px max) corners throughout the system; softness reads as generic SaaS, not streetwear.
- **Product cards:** Image-forward, name and price in mono below, no drop shadows — separation between cards comes from whitespace and hairline rules, never `box-shadow`.
- **Navigation:** Minimal top bar, `paper` background with `hairline` bottom border, wordmark left, primary nav center/right, cart + search icons right. Sticky on scroll, but shrinks (reduce vertical padding) rather than staying full height, so it doesn't eat mobile screen real estate.
- **Forms (checkout, account):** Underline-style inputs (bottom border only, no boxed fields with fills) to keep the whole surface feeling like a document/ticket being filled out, not a generic form. Labels in small mono caps above each field.
- **Tables (admin CRM order/product lists):** Dense, hairline row dividers, mono for all numeric columns (SKU, stock, price, order totals) so numbers align and scan easily — this is a deliberate carry-over of the receipt motif into the operational side of the product.

---

## 4. Motion

Motion should be minimal and purposeful, not ambient decoration:

- Page transitions: none needed beyond standard route loading — resist the urge to add page-load animation sequences, which read as "AI-generated template" more than premium.
- **One orchestrated moment worth building:** the drop countdown ticking down to zero and the page state transitioning from "coming soon" to "shop now" live, without a page reload — this is the actual moment of tension in the product (a real drop going live) and deserves the animation budget.
- Hover states: subtle only — underline the product name, a 1px border color shift from `hairline` to `void`. No scale/zoom-on-hover product image effects; they read as stock e-commerce template behavior.
- Micro-interaction budget: add-to-cart can have a small, quick confirmation (the cart icon briefly shows a count increment) — nothing more elaborate.

---

## 5. Photography Direction

- Product photography on a `paper`-toned or true studio-white background for PLP/PDP consistency — this matters more than it sounds for a black-and-white system, since photography is the only place color/texture enters the page at all.
- Editorial/lifestyle photography (homepage hero, drop announcements) can be shot in real Nigerian urban settings — Lagos streets, danfo buses, markets — high contrast, can be black-and-white treated or full color; if full color, it should feel like the one moment of "real world" breaking into an otherwise monochrome system, which is a deliberate contrast rather than an inconsistency.
- No stock photography. No generic studio lifestyle shots that could belong to any brand.

---

## 6. Admin CRM — Separate Visual Direction

The CRM is an internal tool used daily by staff, not a brand showcase — it should borrow the *typography and mono-numeric* discipline of the storefront (for consistency and to reinforce the receipt/ledger metaphor) but should be visually quieter and denser:

- `paper` background throughout (no full-bleed black sections).
- Data-dense tables, not card grids, for orders/products/customers.
- The `alert` color is used more freely here (still only for actual alerts: low stock, payment failed, refund pending) since this is a functional tool, not a brand moment.
- No product photography treatment needed beyond small thumbnail crops in list views.
- Sidebar navigation (Products, Drops, Orders, Customers, Discounts, Analytics) rather than the storefront's top nav pattern — signals clearly to staff "you are in the back office," which matters so no one confuses draft/unpublished data with the live storefront.

---

## 7. Accessibility & Responsive Baseline

- Contrast: `void` on `paper` exceeds WCAG AAA; `smoke` text must only be used for genuinely secondary content (never body copy a user needs to read to complete a task) since it's close to the AA minimum against `paper`.
- All interactive elements need a visible keyboard focus state — a 2px `alert`-colored outline is appropriate here (the one functional, non-decorative use of the accent color beyond commerce states).
- Every product image needs real alt text (product name + color, not just filename).
- Tap targets on mobile ≥ 44px, given the mobile-first usage context established in the PRD.
- Respect `prefers-reduced-motion` — the countdown-to-live transition (Section 4) should degrade to an instant state swap rather than an animated one when the user has this preference set.

---

## 8. Do / Don't

**Do**
- Let hairline rules and whitespace create structure, not shadows or boxed cards.
- Keep `alert` red scarce and meaningful.
- Use mono type for anything that is a number a customer or staff member needs to trust (prices, stock counts, order totals, SKUs).
- Write copy with the brand's dry, confident voice (see PRD Section 5.7 for where policy/content pages live) — plain and specific, never generic marketing language ("elevate your streetwear game").

**Don't**
- Don't reach for a warm cream + terracotta palette, or a near-black + neon-green/acid accent palette — both are current AI-generated-design defaults and would undercut the "genuinely designed for this brand" goal (see brief).
- Don't use rounded pill buttons, drop shadows, or gradient accents anywhere in the system.
- Don't hide sold-out products — mark them, per PRD Section 5.2/5.3.
- Don't animate page loads with fade/slide-up sequences on every element — pick the one moment (Section 4) that deserves it and leave the rest quiet.

---

*This guide should be treated as binding for anyone implementing the Godpaid storefront or admin CRM. Deviations should be deliberate and documented, not defaults slipped in during build.*
