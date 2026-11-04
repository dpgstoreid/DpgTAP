# DpgTAP repair changelog

This repair package preserves the approved visual page and DPG-kun mascot. Every toll operator adapter remains disabled.

## Changes

- Upgrade from unsupported Next.js 14.2.15 to Next.js 16.4.4; update React and React DOM to 19.2, Supabase JS to 2.118.0, require Node.js 22.13+, and migrate ESLint 10 to flat config.
- Keep the Next.js 16 App Router route parameter asynchronous and replace the removed `next lint` command with the ESLint CLI.
- Execute only explicitly enabled adapters that also provide an exact approved source-domain allowlist.
- Add AbortSignal to adapter contracts and abort work when the 12-second connector timeout fires or the client disconnects.
- Validate connector responses and transaction fields at runtime, including adapter identity, card last-four, Jakarta date range, numeric bounds, timestamps, HTTPS allowlisted source domains, and source URLs that must not embed the full card number.
- Keep deduplication conservative. Receipt IDs are preferred; records without IDs are only collapsed when all meaningful fields and source references are identical.
- Bound the in-memory limiter and never trust proxy identity headers unless explicitly configured. Production toll-search requests fail closed until trusted proxy identity is configured.
- Use a shared bounded streaming JSON reader for toll-search, card, and balance endpoints; require JSON content type and enforce byte limits.
- Reject cross-origin toll-search requests when an Origin header is present; keep API responses private/no-store.
- Add security response headers, correct health-mode detection, and explicit user ownership filtering for balance snapshot operations.
- Lock down unused Supabase search/transaction tables with migration 003.
- Add 18 static project checks, runtime smoke-test coverage, privacy/release documentation, and a changelog.

## Not completed / not claimed

- No operator is authorized or connected. No live toll receipt has been tested.
- A real adapter must use the supplied AbortSignal in its HTTP client, set `enabled: true` only after written authorization and technical verification, and configure exact `allowedDomains`.
- In-memory rate limiting is not suitable as the sole production control for multi-instance deployments; configure a shared limiter/WAF.
- Full package install, lockfile generation, npm audit, dependency-backed lint/typecheck and production build could not be completed because npm registry access timed out in the authoring environment.
- No browser/device end-to-end QA or live HTTPS deployment was performed.
- NFC balance reading, payment, premium entitlements and AI chat are not enabled by this backend repair.
