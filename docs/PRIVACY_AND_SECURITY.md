# DpgTAP privacy and security controls

## Current MVP boundaries

- Local-first operation does not require an account. Optional cloud card storage requires a verified Supabase user session.
- The toll-search endpoint accepts only numeric card numbers (8–24 digits), periods 7/14/30, an explicit consent flag, JSON content, and a small bounded request body.
- The backend does not log request bodies, card numbers, upstream responses, or IP addresses.
- The backend only executes registry adapters with `enabled: true`. All bundled adapters remain disabled until written authorization, a verified technical interface, privacy review, and owner-controlled testing exist.
- A successful adapter response is runtime-validated. Transactions must match the adapter identity and card last four digits, be within the requested Jakarta date window, have a valid timestamp, bounded numeric values, and HTTPS URLs on that adapter’s exact approved domain allowlist.
- Timeout cancels the adapter signal. Every real adapter must pass `signal` into its outbound `fetch` call and provide an exact `allowedDomains` list. Adapters without approved domains are never executed.
- No full card number, PIN, OTP, raw APDU payload, or operator account credential may be logged or persisted.
- Balance values are snapshots only. Never describe a snapshot as a live balance.

## Rate limiting and proxy configuration

- The bundled in-memory limiter is a bounded, best-effort fallback: 10 requests per 60 seconds per configured identity and 4,096 buckets maximum.
- By default, requests share one unattributed bucket. This prevents clients from selecting arbitrary identity headers, but also means one visitor can consume the shared allowance.
- On a deployment behind a trusted reverse proxy, set `DPGTAP_TRUST_PROXY_IP_HEADER` to exactly `x-real-ip` or `cf-connecting-ip` only if that proxy overwrites the header and direct origin access is blocked.
- A process-local Map is not sufficient for multi-instance production. Configure a platform WAF/shared rate-limit service before public launch.

## Supabase

- Only the anon/publishable key may use a `NEXT_PUBLIC_` variable. Never put a service-role key there or in the repository.
- Apply migrations in numeric order. Migration `003_lock_down_unreleased_tables.sql` makes unused transaction/search tables inaccessible to anon/authenticated clients and operator master data read-only.
- Never accept a card `id` alone as proof of ownership; user-scoped RLS and explicit `user_id` filters are required.

## API secrets and AI integration

- Third-party AI API keys must remain server-side secrets in the deployment environment. Never commit `.env.local`, provider keys, service-role keys, actual card numbers, or private transactions.
- Bandel Banget integration is not included or enabled in this release. Add it only after verifying the provider's official base URL, model ID, request/response compatibility, privacy terms, and cost controls.

## Release blockers

- No operator connector is currently authorized, implemented, or enabled. Do not claim nationwide live receipt coverage.
- Production rate limiting must use a shared store or WAF.
- Run dependency audit, typecheck, lint, production build, Supabase migration review, and real-device QA before production deployment.


## Production request throttling

Production toll-search requests fail closed with HTTP 503 until `DPGTAP_TRUST_PROXY_IP_HEADER` is set to `x-real-ip` or `cf-connecting-ip` and the hosting proxy is configured to overwrite that header. The in-process limiter is a bounded fallback only; configure a shared limiter or WAF before public use. Do not trust arbitrary forwarding headers or expose the origin directly.
