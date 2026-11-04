# DpgTAP — Device-less Verification Plan

Status date: 2026-11-03

## Owner environment

- macOS/Xcode: not available
- Apple Developer Program: not enrolled
- Android NFC handset: not available
- Physical e-money card: owner has one; do not copy its full card number into source code, screenshots, issue trackers, logs, or chat.

## What can be completed now

1. Web MVP installation and local run on Windows.
2. TypeScript/typecheck, lint, production build, API contract tests, and database migration review.
3. UI regression checks. The approved `web/src/app/page.tsx`, `web/src/app/globals.css`, and `web/public/dpg-kun-hero.jpg` are frozen brand assets; do not alter without owner approval.
4. Backend tests using synthetic fixtures only. Clearly label fixture data as DEMO; never show it as a real balance, transaction, receipt, or operator response.
5. Operator connector contract tests with mocked HTTP responses, timeout, unavailable-source, malformed-response, deduplication, sorting, consent-required, and date-window cases.
6. Privacy checks: redact card identifiers from logs; require explicit consent before a real operator lookup; keep source provenance and original receipt references; do not bypass authentication, CAPTCHA, or bot protection.
7. Flutter project structure and platform integration notes can be prepared, but NFC behavior cannot be certified without an actual Android handset and card.

## What cannot be claimed yet

- Physical NFC read success for Mandiri e-Money, BRIZZI, Flazz, or TapCash.
- Real chip balance or transaction history.
- End-to-end operator receipt lookup for any connector not tested against its official live portal with owner consent.
- iOS archive, code signing, TestFlight upload, or App Store readiness.

## Required local web verification (Windows PowerShell)

Run from the extracted project root:

```powershell
npm run install:web
Copy-Item .env.example web/.env.local
npm run typecheck
npm run lint
npm run build
npm run dev
```

Open `http://localhost:3000`. Supabase environment variables are optional for local UI/demo mode unless a tested feature explicitly requires the backend. Never paste production secrets into an agent prompt or commit `.env.local`.

If a command fails, capture the complete terminal error with secrets and personal identifiers removed. Do not report a check as passed unless its command exits successfully.

## Operator connector verification gates

A connector may move from `not_configured` to enabled only after all of these are documented:

- Official operator source and terms/permission reviewed.
- Exact public workflow and request/response format observed; no guessed endpoints.
- Owner consent captured for sending card/date information.
- Sanitized request/response fixtures committed without real card numbers or personal data.
- Parser tests cover empty, malformed, duplicate, delayed, and unavailable results.
- Original receipt URL/file provenance retained where legally and technically permitted.
- Timeout, backoff, and per-operator status are tested.
- A real test with the owner's card has been completed and explicitly approved.

Do not scrape private/account-only pages, defeat CAPTCHA, bypass access controls, or claim nationwide coverage from a partial set of public portals.

## Hardware acquisition / test sequence

1. Obtain temporary access to an NFC-capable Android phone before purchasing hardware if possible.
2. Confirm Android NFC is enabled and identify Android version/model.
3. Test NFC discovery first, then supported tag technology, then protocol/APDU behavior only where authorized and technically supported.
4. Record only sanitized metadata (issuer chosen by owner, success/failure, timestamp, device model, app version). Do not store raw APDU payloads or card secrets by default.
5. Test each issuer independently. A successful scan of one issuer is not proof of compatibility with the others.
6. Verify displayed balance against an official issuer source or trusted reader; otherwise label it as an unverified chip-read value.

## iOS/TestFlight gate

Flutter iOS release requires macOS and Xcode. TestFlight distribution requires an app build uploaded to App Store Connect and appropriate Apple Developer Program membership/signing. Until the owner has Mac access and enrollment, keep iOS source/configuration prepared but mark the iOS release gate BLOCKED. Do not promise a TestFlight date.

## Acceptance status vocabulary

- `PASS`: executed successfully with evidence.
- `FAIL`: executed and failed; attach sanitized error.
- `BLOCKED_NO_DEVICE`: cannot execute because required hardware/account is unavailable.
- `MOCK_ONLY`: synthetic fixture test; not real-world verification.
- `NOT_RUN`: not executed.

Never convert `MOCK_ONLY`, `BLOCKED_NO_DEVICE`, or `NOT_RUN` into `PASS`.
