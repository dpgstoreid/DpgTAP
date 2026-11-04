# Codex execution prompt — DpgTAP full-stack

Implement the DpgTAP repository according to `MASTER_BUILD_SPEC.md`. Preserve the approved UI and DPG-kun mascot exactly; do not redesign screens or alter visual hierarchy. Treat the existing page and stylesheet as locked baseline.

Work in a safe sequence:
1. Inspect repo, create baseline commit, run existing install/lint/typecheck/build and record failures.
2. Fix web backend/API/type errors with minimal diffs; preserve UI.
3. Finish Supabase migrations, RLS, auth session, optional cloud sync, and tests.
4. Create Flutter mobile app for Android/iOS with matching approved design, local storage, saved cards and balance display. Android NFC POC first.
5. Implement receipt normalization, connector registry/orchestration, per-operator status, consent, and exports.
6. Integrate only verified/authorized toll sources. No scraping around CAPTCHA or authentication.
7. Add store purchase verification for Rp49,000/year; server-side entitlement only.
8. Add tests and complete release documentation.

Constraints:
- Local-first; no mandatory login.
- Latest balance must be visible and timestamped; never invent balance.
- Period selector exactly 7/14/30 days, default 30.
- Search all enabled operators automatically; no pre-search operator picker.
- No full card PAN, PIN, OTP, APDU, cryptographic keys, or passwords stored/logged.
- Never put Supabase service-role key in client or `NEXT_PUBLIC_*`.
- Do not claim real NFC, receipts, or payment integration until tested.
- Preserve current UI and supplied DPG-kun asset. Make a screenshot comparison before/after and explain any unavoidable differences.

Do not stop after writing a plan. Implement what can be completed locally, run checks, and provide a precise completion report. Ask only when blocked by external credentials, hardware, permissions, or an ambiguous product decision.
