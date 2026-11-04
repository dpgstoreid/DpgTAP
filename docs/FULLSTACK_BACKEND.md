# DpgTAP Full-stack Backend (MVP)

## Architecture
- Next.js App Router API routes are the application backend.
- Supabase Auth provides optional accounts for cloud sync. No account is required for local-only use.
- Supabase Postgres stores card labels + last four digits, balance snapshots, entitlement state, and minimal search audit metadata.
- The full card number is used only in-memory for an explicitly consented operator lookup and is never inserted into the database.
- NFC reading remains a Flutter/native mobile responsibility; the web app cannot reliably read all Indonesian e-money chips.

## Setup
1. Create a Supabase project (free tier is sufficient for development).
2. In Supabase SQL Editor, run `supabase/migrations/001_toll_search.sql`, then `002_fullstack_core.sql`, then `003_lock_down_unreleased_tables.sql`.
3. Copy `web/.env.example` to `web/.env.local` and fill `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Never add a `service_role` key to the browser or `NEXT_PUBLIC_*`.
5. Run `cd web`, `npm install`, `npm run dev`.
6. Cloud API calls require a Supabase Auth access token in `Authorization: Bearer <access_token>`. Local-only UI remains usable without it.

## API
- `GET /api/health` — liveness and configuration mode.
- `GET /api/toll/operators` — operator registry and connector states.
- `POST /api/toll/search` — `{cardNumber,periodDays,consent:true}`. Search is on-demand.
- `GET /api/cards` — authenticated user's saved cloud cards.
- `POST /api/cards` — `{issuer,nickname,last4,cardFingerprint}`. Fingerprint is a client-generated SHA-256 digest using a random per-install salt; do not use raw card number as fingerprint.
- `POST /api/cards/:id/balance` — `{balance,currency:'IDR',readMethod:'nfc'|'manual',readAt?}`.

## Important boundaries
- Current operator adapters remain disabled; this backend does not yet retrieve real toll receipts.
- `balance_snapshots` accepts readings only; it does not read or infer balances from card numbers.
- Premium entitlement table is a server-controlled placeholder. Real App Store / Google Play receipt verification and webhook handling are not implemented. Do not unlock paid features based on client-supplied plan values.
- Configure Supabase Auth providers and redirect URLs in the Supabase dashboard before testing login.
- Before production: configure a shared rate limiter/WAF and trusted proxy identity, add audit monitoring and backup policy, finalize privacy notice/consent and data-retention controls, and complete mobile secure storage.
