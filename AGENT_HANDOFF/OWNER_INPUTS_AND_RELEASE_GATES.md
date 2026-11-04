# Owner inputs and release gates

## Already decided — do not ask again
- Product: DpgTAP.
- UI/mascot: approved DPG-kun reference and current web implementation are frozen; no redesign.
- Targets: website + mobile app.
- Mobile framework: Flutter; Android NFC proof-of-concept first; iOS target included subject to issuer/platform capability.
- Website framework: existing Next.js App Router.
- Backend/database: Supabase Auth + PostgreSQL; local-first without mandatory login.
- Toll search: all enabled/verified Indonesian operator connectors automatically; no pre-search operator picker.
- Search periods: exactly 7, 14, 30 days; default 30.
- Consent: explicit and on-demand before sending card/date information to operator sources.
- Balance: display latest actual read and timestamp; no fabricated/live claim.
- Premium: Rp49,000/year.
- Budget preference: keep development/test infrastructure on free tiers where practical; avoid paid services without approval.

## Inputs needed from owner before public release
1. Final legal business name and contact email for Privacy Policy/Terms/support.
2. Public domain and DNS access for website.
3. Supabase project URL and anon key; service-role key stays in server secret manager only.
4. Google Play Console account and app signing access for Android release.
5. Apple Developer account and macOS/Xcode access for iOS release.
6. Confirm final product identifiers for annual subscription in Google Play and App Store; do not invent them.
7. Final privacy policy, terms, data retention/deletion policy, and customer support channel.
8. Real Android NFC test phones and physical test cards for each issuer.
9. Operator portal/source list, permission/terms review, and test examples for every proposed connector.
10. Confirm whether cloud sync is enabled at launch or remains optional/beta.

## Not needed for local development
- Public domain.
- Store accounts.
- Production payment credentials.
- Real card numbers. Use synthetic test fixtures.
- Toll operator production credentials if the source is genuinely public and permitted; if authorization is required, obtain it before enabling the connector.

## Release gates
Do not publish until security, privacy, app-store billing, device NFC, operator connectors, backups, monitoring, support and legal pages are verified.
