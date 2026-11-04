# DpgTAP v9 UX QA — Windows + iPhone 11–13

Date: 2026-11-03
Scope: source-level UX audit, responsive CSS inspection, PWA configuration, and static integrity checks.

## Summary

- ZIP integrity: PASS (`unzip -t`).
- PWA manifest parses as JSON: PASS.
- Core screen and interaction source inspection: PASS WITH ISSUES.
- Mobile mascot visibility: ISSUE FOUND AND PATCHED in this QA build.
- Real Safari/iPhone rendering: NOT RUN (no iPhone/browser device session available here).
- Next.js typecheck/build: NOT RUN (dependencies are not installed in this environment; network package install is unavailable).
- Offline app-shell behavior: LIMITED. Service worker caches only `/offline.html` and `/manifest.webmanifest`; it does not cache the home page, CSS, JS, or images. Therefore this is an offline fallback page, not a fully offline-capable app.

## Findings

### Fixed in this QA build

1. **Mobile mascot was hidden by conflicting CSS rules.** The first `@media(max-width:700px)` block set `.heroArt{display:none}`. A later mobile block adjusted its size but did not restore its display. Added `display:grid` to the later rule so the approved DPG-kun artwork can appear in the mobile hero.

### Remaining UX / product issues

2. **Search action gives validation errors only after tapping.** The user can tap Search with fewer than 8 digits or without consent. Consider disabling the action until input is 8–24 digits and consent is checked, while keeping a clear helper message.
3. **Mobile transaction table hides the receipt column.** The responsive CSS hides the final column, which is the original receipt link. This removes a key proof/verification action on narrow screens. A mobile card/list layout should expose the receipt link rather than hide it.
4. **PWA icon setup is incomplete for best iOS presentation.** Manifest currently points to a JPEG with `sizes:any`; add dedicated square PNG icons (192, 512, and Apple touch icon 180) and metadata for the Apple touch icon.
5. **Offline behavior is overstated if described as offline-first PWA.** Current service worker only displays an offline fallback when navigation fails. It does not cache the actual app shell or transaction data. Keep local data claims precise; do not imply saved history is already persisted locally.
6. **Mascot image is used as both brand icon and hero image.** The source is reused with crop/fit, which is acceptable for MVP but should be checked at actual iPhone icon dimensions.
7. **Premium price appears in the header before entitlement/payment flow exists.** Keep it clearly marked as planned/preview until StoreKit/Play Billing and server-side entitlement verification are implemented.
8. **Balance panel correctly avoids fabricating a balance**, but its Scan NFC button currently displays an explanatory message. On iPhone 11–13, do not present this as a working e-Money scan feature.
9. **Search response currently has no real operator connectors enabled.** The empty result message is honest and should remain so until sources are verified.

## Static checks

- `manifest.webmanifest`: valid JSON.
- PWA registration component: registers service worker only in production.
- Consent: frontend sends `consent:true`; backend schema requires literal `true`.
- Card input: strips non-digits and limits to 24 characters; API requires 8–24 digits.
- Search periods: restricted to 7, 14, and 30 days.
- Export: CSV uses quoted/escaped cells and UTF-8 BOM; print action calls browser print.
- Search backend: uses `Promise.allSettled`, 12-second connector timeout, conservative dedupe by operator + receipt ID, newest-first sort.
- Operator registry: all nine adapters remain disabled and return `not_configured`; no real receipt retrieval is claimed.

## QA verdict

**Conditional PASS for source-level MVP review; NOT READY for user acceptance or production release.** The mobile mascot visibility bug is fixed in this QA package. Before asking the owner to test, implement a visible mobile receipt link, improve validation affordance, add proper iOS PWA icons, and clarify premium/offline status. Then run a real browser responsive test and a physical iPhone Safari test over HTTPS.

## Additional QA fixes (v10)

- Added dedicated `icon-192.png`, `icon-512.png`, and `apple-touch-icon.png` derivatives from the approved DPG-kun artwork; manifest and Apple metadata now reference the PNG icons.
- Search button is disabled until the card number is 8–24 digits, consent is checked, and the request is not already running.
- Mobile transaction layout no longer hides the receipt column; original receipt links remain visible.
- Premium label now says `PREMIUM SEGERA` because payment/entitlement is not implemented.
- Static assertions for manifest JSON, icon dimensions, search gating, premium label, and mobile receipt visibility: PASS.
- `unzip -t` for v10 archive: PASS.
- TypeScript check was attempted using globally available `tsc`, but cannot complete because `node_modules` are absent. Reported errors are missing dependencies/types (`next`, `react`, `zod`, Supabase SDK, `@types/node`) and cascading JSX typing errors; this is NOT a confirmed application-code type failure and is NOT a passing typecheck.
