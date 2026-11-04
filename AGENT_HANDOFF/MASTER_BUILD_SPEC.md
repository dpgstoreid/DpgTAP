# DpgTAP — Master Build Specification (v6 handoff)

## 0. Non-negotiable product rule
The approved DpgTAP UI and DPG-kun visual identity are LOCKED.
- Do not redesign, rearrange, rename, recolor, or replace approved screens/components.
- Do not replace the supplied DPG-kun image with generic AI art or a stock mascot.
- Do not change the approved navy / blue / turquoise fintech direction.
- Do not remove or hide the card balance area.
- If a technical change requires a UI change, stop and report the reason; propose the smallest possible change and wait for approval.
- Treat the current web UI in `web/src/app/page.tsx`, `web/src/app/globals.css`, and `web/public/dpg-kun-hero.jpg` as the approved reference baseline. Preserve the visual structure and only wire real data/behaviour into it.
- Before changing UI files, make a git commit/backup. Keep changes isolated to data, services, state management, platform integration, and accessibility fixes that do not alter the approved visual design.

## 1. Product scope
Build DpgTAP as:
1. Responsive website/PWA for dashboard, account, saved-card overview, receipt search, history, reports, help, and subscription management.
2. Android and iOS mobile app using Flutter for NFC reading and mobile-specific functions.
3. Shared backend using Next.js API routes initially, with Supabase Auth + PostgreSQL + Storage where required.
4. Local-first default: ordinary use must not require account creation. Cloud backup/sync is optional and requires sign-in.
5. The web version must never claim to read NFC cards if browser/platform support is unavailable. Explain that NFC balance reading is performed in the mobile app; web can show synced/entered readings.

## 2. Locked product decisions
- Brand: DpgTAP.
- Mascot: approved DPG-kun from supplied project asset/reference. No substitute.
- Main promise: check e-money balance and consolidate toll receipts/history.
- Card issuers initially: Mandiri e-Money, BRI BRIZZI, BCA Flazz, BNI TapCash. Add other issuers only after protocol and device compatibility are verified.
- Local-first; no mandatory login.
- Multi-card storage.
- Show each card's latest balance prominently, formatted in Indonesian Rupiah, with `lastReadAt` and read method. Never invent a balance. If unread, show an empty state. Clearly label it “Saldo terakhir terbaca”, not live balance.
- Add card by NFC scan, manual card number, or card photo only if the issuer workflow can safely support it. A photo must not be treated as a reliable card-number OCR result without user confirmation.
- Toll search periods: exactly 7, 14, or 30 days; default 30 days.
- Toll operator search: automatic fan-out to all configured/verified operator connectors; no operator picker before search. Post-result filters by operator are allowed.
- Search is on-demand only after explicit user consent. Show per-operator progress/status.
- Merge and sort receipts by transaction time. Conservative deduplication; retain source/operator provenance and original receipt URL/file when available.
- Never fabricate data, receipt IDs, balance values, operator connectivity, or nationwide coverage.
- Premium: Rp49.000/year. Free tier remains usable. Premium entitlement must be verified server-side by store receipt/webhook; never trust a client-supplied `isPremium` flag.
- No monthly plan unless the product owner explicitly changes this decision.
- The previously discussed 3-day trial is a product option, not permission to start billing automatically. Trial and renewal wording must be clear and compliant with Google Play/App Store rules.
- Initial delivery: Android + responsive website. iOS build target included in Flutter project, but NFC/issuer compatibility must be tested on real iPhones before promising full NFC functionality.

## 3. Required mobile app (Flutter)
Screens and flows:
- Splash / onboarding using approved DPG-kun visual.
- Home/dashboard preserving approved design language and information hierarchy.
- My Cards: list cards, issuer, masked last four digits, latest balance, last-read timestamp.
- Add Card: NFC scan; manual entry fallback; photo-assisted entry only with confirmation.
- Card detail: latest balance, read history, transaction history if available from card chip, scan again, rename, remove.
- Toll Receipt Search: card selection, 7/14/30 selector, consent, automatic operator fan-out, per-operator progress, merged results, operator filters.
- Receipt detail: source, original receipt, verification state, download/share.
- Reports: PDF/CSV/print/share. Clearly label DpgTAP-generated report versus operator-issued original receipt.
- Premium page: Rp49.000/year, features, restore purchases, store-managed cancellation/renewal disclosures.
- Settings: privacy, local data, optional account/cloud sync, export/delete data, help/about.
- Offline: show locally stored cards, last-read balances, cached history and receipts; explain when a network operation is required.

NFC engineering:
- Use Flutter platform channels/plugins only after verifying current plugin support and each issuer's card protocol.
- Implement issuer-specific APDU/secure messaging only using documented/authorized specifications. Do not guess keys or bypass security.
- Keep card data in memory as briefly as possible. Never log full card number, APDU payloads, keys, PIN, OTP, or secrets.
- NFC read failure must be a clear error with retry/manual fallback.
- Balance snapshots must record method, timestamp, issuer, and device-local source.
- Do not represent chip balance as bank-authoritative live account balance.

## 4. Required website
- Preserve existing approved UI in `web/src/app/page.tsx` and `globals.css`.
- Responsive desktop/tablet/mobile browser layouts.
- Website functions: dashboard, saved cards (local browser storage when signed out), cloud sync when signed in, receipt search, result filtering, receipt detail, CSV/PDF print, Premium status, privacy/help.
- Website cannot directly claim NFC support. Display synced mobile card balances or allow manual balance entry clearly labeled as manual.
- Use secure session handling. Do not expose Supabase service-role key in browser code.
- PWA/offline caching must not cache private API responses or expose one user's data to another.

## 5. Backend modules
Implement clean service boundaries:
- Auth/session: optional account for cloud sync.
- Cards: CRUD for nickname, issuer, last4, non-reversible per-install fingerprint; no full PAN stored.
- Balance: append-only snapshots; latest snapshot query; manual vs NFC read method.
- Card transaction history: separate from toll website receipts; retain source and verification metadata.
- Operator registry: code, display name, source type, status, last checked, terms/authorization notes, enabled flag.
- Connector orchestration: fan-out to every enabled connector; independent timeout/retry/backoff; per-operator status; cancellation; rate limit; bounded concurrency.
- Receipt normalization: one canonical transaction model, source provenance, original receipt URL or locally stored document.
- Deduplication: prefer operator receipt ID; fallback only to strong composite keys. Never merge solely on approximate amount/time.
- Export: CSV and PDF. Preserve original receipts as appendix/attachments where legally and technically possible.
- Entitlement: server-side verified Google Play/App Store purchases; yearly Rp49,000 product ID configured separately per store.
- Audit/privacy: record consent timestamp, period, card last4, connector count and result count only; never full card number.
- Admin/operations: connector health, error summaries, disable switch, no raw sensitive card data in logs.

## 6. Canonical data model
Use UUID primary keys and UTC timestamps; present dates in Asia/Jakarta.
- profiles: id = auth.users.id, created_at, updated_at.
- cards: id, user_id nullable only for device-local records (cloud table requires user_id), issuer, nickname, last4, card_fingerprint, created_at, updated_at.
- balance_snapshots: id, user_id, card_id, balance bigint IDR, currency='IDR', read_method ('nfc'|'manual'|'synced'), read_at, device_id optional.
- card_transactions: id, card_id, occurred_at, amount nullable, balance_after nullable, transaction_type, terminal/location, read_source, raw_source_hash; no raw APDU.
- toll_operators: code, name, website/source URL, connector_status, enabled, last_checked_at, authorization_note.
- toll_searches: id, user_id nullable for local mode, card_last4, period_days in (7,14,30), consented_at, started_at, completed_at, status.
- toll_receipts: id, search_id, operator_code, operator_receipt_id, occurred_at, entry_gate, exit_gate, amount, balance_after, original_receipt_url, local_file_path/storage_key, source_url, verification_status, dedupe_key, created_at.
- subscription_entitlements: user_id, plan ('free'|'premium_yearly'|'lifetime'), status, provider, product_id, purchase_token_hash/original_transaction_id, expires_at, verified_at.
- connector_runs: id, search_id, operator_code, status, started_at, completed_at, http_status nullable, safe_error_code, result_count. Do not store raw request bodies or card number.

## 7. API contract
Keep current routes backward-compatible where possible:
- GET /api/health
- GET /api/toll/operators
- POST /api/toll/search { cardNumber, periodDays: 7|14|30, consent: true }
- GET/POST /api/cards
- GET/DELETE /api/cards/:id
- GET/POST /api/cards/:id/balance
- GET /api/cards/:id/history
- GET /api/receipts and GET /api/receipts/:id
- POST /api/reports/export
- GET /api/me/entitlement
- POST /api/billing/verify (server verifies store receipt; never accepts a plan flag)
Use Zod validation, auth checks, rate limits, safe errors, request IDs, and no-store for sensitive endpoints.

## 8. Security and privacy
- Never persist full card number, PIN, OTP, card cryptographic keys, APDU data, or operator passwords.
- Use secure device storage for local secrets; encrypt sensitive local records where feasible.
- Supabase RLS must be enabled on every user-owned table. Add tests proving cross-user access is denied.
- Service-role key is server-only and must not be prefixed NEXT_PUBLIC_.
- Require explicit consent before toll operator lookup. Explain which card/date data goes to public operator sources.
- Respect each operator site's terms, robots/access rules, rate limits, and authorization. No CAPTCHA bypass, login bypass, or access-control circumvention.
- Connector failure is `unavailable` or `not_configured`, never success.
- Logs contain request ID, operator code, status, latency, result count only.
- Add retention and user data deletion/export flows.

## 9. Delivery order
P0 — inspect existing repo and make baseline git commit. Do not redesign UI.
P1 — make web project install/build/lint; fix code errors without visual changes.
P2 — complete Supabase migrations, RLS tests, auth and optional sync.
P3 — Flutter app shell matching the approved UI; local DB; cards/balance screens.
P4 — implement NFC proof-of-concept for one supported card/Android device using verified specs.
P5 — toll connector framework and first authorized real connector; no broad claims until verified.
P6 — reports and original receipt archive.
P7 — verified yearly billing, restore purchases, entitlement.
P8 — production hardening, privacy, monitoring, backups, store/web release.

## 10. Definition of done
- Web `npm ci`, lint, typecheck, build pass.
- Flutter analyze and Android debug build pass; iOS build checked on macOS.
- UI screenshot comparison confirms approved UI has not changed.
- User can use web/mobile without account for local features.
- Latest balance appears with timestamp and provenance; no fake balance.
- Cloud sync works only after sign-in; RLS isolation tests pass.
- Search only runs with consent; periods are exactly 7/14/30; every enabled connector reports truthful status.
- At least one operator connector has been technically verified and authorized before any real receipt claim.
- Premium unlock only after verified store purchase; yearly price is Rp49,000.
- Data export and deletion tested.
- README includes exact setup, env variables, migrations, test commands, and known limitations.
