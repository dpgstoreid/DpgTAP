# DpgTAP Website Final QA Checklist

## Local engineering checks
- [ ] `npm run install:web` completes and creates `web/package-lock.json`.
- [ ] `npm run verify` passes.
- [ ] `npm run typecheck` passes with installed dependencies.
- [ ] `npm run lint` passes without warnings that affect release.
- [ ] `npm run build` completes successfully.
- [ ] `npm run start` serves the production build.

## Browser and responsive checks
- [ ] Desktop Chromium: dashboard, consent, validation, search result, CSV, print.
- [ ] Mobile viewport 375×812: no horizontal overflow; mascot and key actions visible.
- [ ] Tablet viewport 768×1024: layout and table remain usable.
- [ ] iPhone Safari over HTTPS: Add to Home Screen, standalone launch, icons, safe-area spacing.
- [ ] Offline: previously loaded page shows a clear offline fallback; no false claim that live search works offline.

## Security and data checks
- [ ] Confirm hosting disables request-body logging for `/api/toll/search`.
- [ ] Configure shared rate limiting/WAF; in-memory limiter is not sufficient for multi-instance production.
- [ ] Verify consent is required server-side and no full card number is persisted.
- [ ] Verify adapters cannot run unless enabled and assigned exact approved source domains.
- [ ] Verify timeout AbortSignal reaches each connector network request.
- [ ] Run migration 003 and test that unused search/transaction tables are inaccessible to anon/authenticated users.
- [ ] Verify Supabase RLS using two separate test users before enabling cloud sync.
- [ ] Check CSV formula-injection behavior using synthetic operator fields.

## Operator connector checks
- [ ] Confirm official source terms/access rules.
- [ ] Use a test card controlled by the owner; do not use card numbers in source, logs, or fixtures.
- [ ] Verify request parameters, response parsing, date/time/timezone and source URL.
- [ ] Compare results with original operator receipt evidence.
- [ ] Test empty results, unavailable source, timeout, retry/backoff and duplicate receipt handling.
- [ ] Enable one connector only after all preceding checks pass.

## Release decision
Do not release publicly while any required engineering, browser, security, or operator gate is unchecked. Current release status is documented in `RELEASE_READINESS_STATUS.md`.
