# DpgTAP Website Release Readiness — 3 November 2026

## Scope
Website-first release. Native mobile builds are outside this package. The website can run in desktop browsers and, after HTTPS deployment, Safari on iPhone as a PWA shortcut. The approved navy/blue/turquoise layout and DPG-kun mascot are retained.

## Verified in this workspace
- ZIP/source tree integrity checks.
- JSON parsing for root package, web package and PWA manifest.
- PWA icon image decoding (192, 512 and Apple Touch Icon) and DPG-kun image decoding.
- Static project verification: `node scripts/verify-project.mjs` (18 checks pass).
- TypeScript syntax transpilation: all 14 `.ts` / `.tsx` files parsed without syntax diagnostics.
- Focused API/backend TypeScript check passed with temporary ambient stubs for external Next.js, Supabase, and Zod package types. This is not a substitute for the full dependency-backed typecheck.
- Runtime smoke tests passed for bounded JSON body reading, rate limiting, trusted proxy opt-in, disabled-connector behavior, and approved-source URL handling. Search-flow smoke used a lightweight Zod test double; real Zod validation is not claimed by that test.
- Toll search route requires explicit `consent: true`, numeric card number shape (8–24 digits), same-origin Origin when present, JSON content type, and bounded request body.
- Card and balance JSON POST APIs also use the shared bounded streaming JSON reader.
- UI blocks search until consent and card length validation pass.
- CSV export neutralizes spreadsheet formula-injection prefixes.
- Search date range uses Asia/Jakarta calendar dates, independent of server timezone.
- Bounded in-process search throttling: 10 requests/60 seconds, 4,096 maximum buckets. Production search fails closed with HTTP 503 until a trusted proxy IP header is configured.
- All bundled operator adapters remain disabled. They are master-data placeholders, not live integrations.
- Only explicitly enabled adapters with a non-empty exact approved-domain allowlist are invoked.
- Connector payloads are runtime-validated; adapter identity, last four digits, Jakarta date range, numeric bounds, HTTPS allowlisted source URLs and full-PAN-free source links are checked.
- Adapter timeout and client disconnect propagate AbortSignal; future real adapters must pass it to their HTTP client to actually cancel network work.
- Supabase cloud card endpoints require bearer authentication; balance writes verify card ownership.
- Migration 003 locks down unused search-session/transaction tables until user-scoped APIs and retention rules are implemented.
- Next.js updated to 16.4.4, React/React DOM to 19.2, Supabase JS to 2.118.0, Node.js engine to 22+, and ESLint 10 uses the Next.js flat config.

## Not verified / release blockers
- `npm install` could not complete in this authoring environment: npm registry access timed out / previously returned DNS `EAI_AGAIN`. A dependency lockfile has therefore not been generated here.
- `npm run lint`, a full dependency-backed `npm run typecheck`, `npm audit`, and the Next.js production build have not been verified. The focused typecheck with stubs and syntax transpilation are narrower checks only.
- No real browser run of the Next.js app was possible; desktop and iPhone responsive/interactive QA remain pending.
- No production HTTPS host/domain or deployment credentials were supplied; no public staging URL exists.
- No toll connector is live-verified or enabled. No real toll receipt was tested.
- No real card NFC read is available in a website browser.
- Bandel Banget AI is not integrated; no provider key, model or endpoint secret is included.

## Operational cautions
- The in-memory throttle is a bounded single-process fallback only. Production must configure a shared rate limiter or platform WAF as well as a trusted proxy header. Set `DPGTAP_TRUST_PROXY_IP_HEADER` only when that trusted proxy overwrites the chosen header and direct origin access is blocked.
- Search endpoint does not persist the full card number in this code path. It is sent to the server only after the UI consent step; request-body logging must remain disabled at the hosting layer. Adapters are all disabled, so this package currently sends no card number to any toll operator.
- Before enabling an operator connector, verify official access rules, obtain written authorization, test with an owner-controlled card, set exact domains, preserve source provenance, and compare parsed fields against the official receipt.
- Supabase cloud card endpoints require a valid Supabase bearer token and correctly applied RLS migrations. Cloud sync is optional and is not required for the local web preview.
- If migrations 001 and 002 were already applied to an existing Supabase project, apply migration 003. For a fresh project, apply 001, 002, then 003 in order.
- Do not place `.env.local`, Supabase service-role keys, Bandel Banget keys, full card numbers, or private transaction exports in the public repository. Rotate any API key previously exposed in chat.

## Release gate
Do not call the website production-ready until dependencies install, a lockfile is generated and committed, `npm audit`, lint, full typecheck and production build pass, browser tests pass at desktop and iPhone widths, security review passes, HTTPS deployment is verified, shared rate limiting/WAF is configured, and operator availability is described truthfully in the UI.

## Framework and runtime notes
- Next.js 16 uses React 19.2 in the App Router and requires Node.js 20.9+. The selected Supabase JS 2.118 line has dropped Node.js 20 support, so this project sets Node.js 22.13+; Node 24 LTS is a suitable setup target.
- `next lint` was removed; linting runs through ESLint CLI and `web/eslint.config.mjs`.
- No custom Webpack configuration, deprecated middleware file, or synchronous dynamic route params were found in the current web source during this migration review.
- Next.js production build and dependency-backed lint/typecheck remain unverified until npm dependencies can be installed in a network-enabled environment.
