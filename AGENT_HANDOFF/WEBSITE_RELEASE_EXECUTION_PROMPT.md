# Website Release Execution — DpgTAP

You are continuing the DpgTAP website-first project. Treat `MASTER_BUILD_SPEC.md` and the approved DPG-kun asset/UI as locked product requirements.

1. Install dependencies in `web/` and commit the generated package lockfile.
2. Run `npm run verify`, `npm run typecheck`, `npm run lint`, and `npm run build`; fix all source errors rather than suppressing checks.
3. Run the app in a real browser and capture desktop (1440px), tablet (768px), and mobile (375px) QA evidence. Test Safari on iPhone when a device is available.
4. Verify the consent gate, 7/14/30-day selection, invalid input, API errors, empty operator response, CSV formula safety, print/PDF, and offline fallback.
5. Do not enable an operator connector without documented official access permission and a successful test against an owner-controlled card and original receipt. Do not bypass CAPTCHA, authentication, bot protection, or access controls.
6. Configure production secrets only through the deployment platform. Never request or commit the Supabase service role key, card numbers, PINs, OTPs, or operator credentials.
7. Configure shared rate limiting/WAF before public release. The in-memory throttle is only a development safety net.
8. Deploy a staging build to HTTPS, verify `/api/health`, PWA install, logs/privacy settings, and rollback procedure.
9. Return a release report with PASS/FAIL/BLOCKED evidence. Never claim 100% bug-free or mark untested features as PASS.

Do not change the approved mascot, dashboard layout, colors, or visual identity without explicit owner approval.
