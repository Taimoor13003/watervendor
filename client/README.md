# Water Vendor

Water Vendor is a Next.js application for water-delivery operations, including customer management, orders, products, vouchers, accounts, invoices, and operational reports.

## Local development

1. Copy `.env.example` to `.env.local` and provide a PostgreSQL `DATABASE_URL`.
2. Install dependencies with `npm ci`.
3. Start the app with `npm run dev`.
4. Build the production bundle with `npm run build`.

`DATABASE_URL` must be kept in `.env.local` or your deployment secret manager. Never commit credentials.

## Production requirements

- Use the Supabase pooler connection string when the deployment platform is IPv4-only.
- Configure Firebase Authentication for the Google sign-in flow.
- Before public deployment, configure Firebase Admin credentials and an authorized-user policy, then enforce Firebase ID-token verification for every `/api/*` route. The client already stores the Firebase ID token after sign-in; API enforcement remains a deployment configuration task.
- Keep only the Water Vendor routes public. Legacy template routes are blocked by middleware; the invoice print route remains available for the customer-invoice workflow.

## Verification performed

- TypeScript check: `npx tsc --noEmit`
- Production build: `npm run build`
- Live read checks for customers, orders, products, vouchers, accounts, invoices, and reports
- Transactional database write check with rollback
