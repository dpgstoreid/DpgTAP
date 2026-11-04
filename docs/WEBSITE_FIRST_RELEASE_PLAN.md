# Website-first release plan

## Release objective
Ship a useful, honest web experience first. The website is the product surface; native NFC is explicitly out of scope for this release.

## Required gates

1. Install dependencies and run `npm run typecheck`, `npm run lint`, and `npm run build`.
2. Run the Next.js production server and verify `/`, `/api/health`, `/api/toll/operators`, and invalid/consent-missing `/api/toll/search` requests.
3. Confirm all adapters remain disabled until their public access method, terms, request/response shape, and receipt provenance have been verified.
4. Run browser checks at desktop, tablet, and narrow mobile widths; inspect keyboard navigation, labels, focus, empty/error/loading states, CSV export and print.
5. Deploy to HTTPS staging; test Safari on iPhone using the staging URL and Add to Home Screen.
6. Run security checks: no card number logging, no card number in analytics, consent enforcement server-side, rate limiting, bounded request timeouts, and no-store response headers.
7. Only then promote the website to public production.

## Current state at handoff

- Static source/configuration inspection: completed.
- npm dependency installation in this execution environment: timed out; no claim of successful build.
- Browser-based visual QA: not run.
- iPhone Safari QA: blocked until HTTPS staging URL and physical device session.
- Live operator connectors: not configured/verified; registry entries intentionally disabled.

## UX truthfulness requirements

- Keep the balance panel labeled as last-read balance; do not fabricate a balance.
- Keep NFC scan clearly unavailable on web and do not imply it can scan a physical card in Safari.
- Keep connector states as not connected until verified.
- Keep explicit consent before any operator request.
- Show an empty-state explanation that distinguishes no receipt found from unavailable/unconfigured connectors.
