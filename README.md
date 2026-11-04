# DpgTAP

DpgTAP is a local-first toll-card companion and receipt-search MVP for Indonesia. The approved navy/blue/turquoise UI and DPG-kun mascot are retained.

## Current release scope

- Next.js web/PWA application in `web/`.
- Optional user-scoped Supabase cloud card storage; local-first use does not require Supabase.
- Toll receipt search API with explicit consent, bounded request validation, safe response handling, and operator status reporting.
- CSV export and browser print/PDF from the web UI.
- Operator registry is master data only. Every bundled connector remains disabled until written authorization, a verified technical interface, an allowlisted official domain, privacy review, and owner-controlled testing exist.
- Web NFC balance reading is not implemented in this MVP. Displayed balance must remain a timestamped snapshot, never a live-balance claim.

## Requirements

- Node.js 22.13 or newer (required by the selected Supabase JS and ESLint 10 lines; Node 24 LTS is a suitable installation target).
- npm 10 or compatible npm release.
- Next.js 16.4.4 with React 19.2; Supabase JS 2.118.0; ESLint 10 flat configuration.

## Local setup

From the repository root:

```bash
npm run install:web
```

Copy `web/.env.example` to `web/.env.local` only if optional Supabase cloud sync is configured. Do not put service-role keys, Bandel Banget keys, card numbers, or transaction exports in `.env.example` or GitHub.

Run:

```bash
npm run dev
npm run verify
npm run lint
npm run typecheck
npm run build
```

## Supabase migrations

For optional cloud sync, apply migrations in order:

1. `supabase/migrations/001_toll_search.sql`
2. `supabase/migrations/002_fullstack_core.sql`
3. `supabase/migrations/003_lock_down_unreleased_tables.sql`

The third migration locks down unused search-session and transaction tables until a dedicated user-scoped API and retention policy are built.

## Production release gates

Do not launch public receipt aggregation until all items below are complete:

- Configure a shared rate limiter or platform WAF. The bundled Map limiter is only a bounded single-process fallback. Production search requests return 503 until a trusted proxy IP header is explicitly configured.
- If using proxy IP headers, set `DPGTAP_TRUST_PROXY_IP_HEADER` only when the trusted proxy overwrites that header and direct origin access is blocked.
- Obtain written operator authorization and verify each technical interface and its domain allowlist. No connector is enabled in this repository.
- Run dependency installation, lockfile generation, `npm audit`, lint, typecheck, production build, and browser/device QA in the deployment environment.
- Configure HTTPS and deployment secrets outside the repository.
- Review privacy notices, consent wording, retention, deletion, support, and applicable legal requirements before public launch.

See `docs/PRIVACY_AND_SECURITY.md` and `docs/RELEASE_READINESS_STATUS.md` before release.
