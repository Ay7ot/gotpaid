# GOTPAID

Direct-to-consumer streetwear e-commerce for a Nigerian clothing brand. Storefront + admin CRM, Paystack payments, Naira-first UX.

Source docs: [`PRD.md`](./PRD.md), [`DESIGN_GUIDE.md`](./DESIGN_GUIDE.md), [`tasks.md`](./tasks.md) (implementation checklist — single source of progress).

## Stack

- **Framework:** Next.js (App Router), TypeScript, Tailwind CSS v4
- **Database:** Supabase (PostgreSQL) + Drizzle ORM
- **Auth:** Supabase Auth (customers) / cookie-session admin auth (`AdminUser` table)
- **Storage:** Supabase Storage
- **Payments:** Paystack (dev fallback: mock provider)
- **Email:** Resend

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the env template and fill in the values:

   ```bash
   cp .env.example .env.local
   ```

3. Required env vars (see `.env.example` for the full list):
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - `DATABASE_URL` — Supabase pooler connection string
   - `ADMIN_SESSION_SECRET` — generate with `openssl rand -base64 32`
   - `PAYSTACK_SECRET_KEY`, `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` (leave blank for mock mode)
   - `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_FROM_NAME`

4. Set up the database:

   ```bash
   npm run db:generate   # generate migrations from the schema
   npm run db:migrate    # apply migrations
   npm run db:seed       # seed sample drop + admin user
   ```

5. Run the dev server:

   ```bash
   npm run dev
   ```

   Open http://localhost:3000. The dev-only design-system page lives at `/design-system`.

## Scripts

| Command                                   | Description                                |
| ----------------------------------------- | ------------------------------------------ |
| `npm run dev`                             | Start the dev server                       |
| `npm run build` / `npm run start`         | Production build / start                   |
| `npm run lint`                            | ESLint                                     |
| `npm run format` / `npm run format:check` | Format / verify formatting                 |
| `npm run db:generate`                     | Generate Drizzle migration                 |
| `npm run db:migrate`                      | Apply migrations                           |
| `npm run db:push`                         | Push schema without a migration (dev only) |
| `npm run db:studio`                       | Open Drizzle Studio                        |
| `npm run db:seed`                         | Seed sample data                           |

## Env vars

All environment variables are documented in [`.env.example`](./.env.example). Never commit `.env.local` or real secrets.
