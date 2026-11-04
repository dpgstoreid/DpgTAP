# Antigravity execution prompt — DpgTAP full-stack

You are the implementation agent for DpgTAP. Work directly in this repository and complete the project in small verified stages.

READ FIRST:
1. `AGENT_HANDOFF/MASTER_BUILD_SPEC.md`
2. `README.md`
3. `docs/FULLSTACK_BACKEND.md`
4. `docs/API_CONTRACT.md`
5. `docs/PRIVACY_AND_SECURITY.md`
6. Existing UI source and supplied DPG-kun asset.

ABSOLUTE RULE: the approved DpgTAP UI and mascot are frozen. Do not redesign or replace them. Keep existing layout, colors, spacing, typography, content hierarchy, and DPG-kun image. Only connect real data and behavior. If any requested feature seems to require a visual change, stop and ask for approval.

Target deliverables:
A. Responsive website using the existing Next.js project.
B. Flutter Android + iOS app, sharing backend contracts and preserving the same approved design language. Android NFC proof-of-concept first; do not claim unsupported iOS issuer NFC support.
C. Supabase schema, Auth optional, RLS, migrations, seed data for operator registry.
D. API and service layer for cards, balance snapshots, card history, toll searches, receipts, reports, entitlements.
E. Tests, setup guide, `.env.example`, and deployment instructions.

Execution discipline:
- First inspect repository tree and current git status. Create a baseline commit/backup before edits.
- Do not delete working files or rewrite the project wholesale.
- Produce an implementation plan with file list, risks, and dependencies; then execute P1.
- After every stage run formatting, lint, typecheck, unit tests, and build where applicable. Fix errors before moving on.
- If external credentials, device hardware, app-store accounts, operator permissions, or undocumented card protocols are required, create explicit setup placeholders and report them. Never fabricate credentials or pretend an integration works.
- Do not use real card numbers in fixtures. Use synthetic test values only.
- Do not place secrets in source code or commit `.env.local`.
- Do not scrape or bypass CAPTCHA/login/access controls. Implement only connectors whose source and access are documented and permitted.
- Do not mark a connector active until a real integration test has passed against a permitted source.
- Do not mark Premium active based on a client-side flag.

Required verification report at the end:
1. Files created/changed.
2. Exact commands run and results.
3. Web lint/typecheck/build results.
4. Flutter analyze/build results.
5. Database migrations and RLS test results.
6. Screenshots confirming the UI is unchanged.
7. Working features vs placeholders.
8. Credentials, devices, permissions, or owner actions still needed.
9. Known defects and next steps.

Start by inspecting the current repository. Do not ask the user to restate decisions already in the spec.
