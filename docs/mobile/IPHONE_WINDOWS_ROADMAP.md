# DpgTAP: Windows + iPhone 11–13 Roadmap

## Delivery strategy
- Keep the approved Next.js web UI and DPG-kun artwork unchanged.
- Deliver the web experience as an installable PWA first. On iPhone, open the HTTPS site in Safari and use Share > Add to Home Screen.
- Use Windows for Next.js, backend, Supabase migrations, automated tests, and Flutter/Dart source development.
- Keep Flutter as the cross-platform native app target; do not represent the PWA as a native NFC reader.

## iPhone NFC reality
- iPhone XS and later support background tag reading for compatible NDEF URI tags; this is not equivalent to arbitrary e-money card reading.
- Core NFC exposes supported tag technologies/protocols to an app session, but the issuer card's secure application, keys, commands, and data access determine whether balance/history can be read.
- Do not infer that Mandiri e-Money, BRIZZI, Flazz, or TapCash balance/history is readable merely because the phone has NFC.
- The first iPhone NFC spike must identify the physical card's technology and test only documented, authorized read operations. No key extraction, authentication bypass, or write/value modification.
- If a card's secure protocol is inaccessible on iOS, keep iPhone PWA for account/history/receipt workflows and plan an Android NFC reader or supported external reader for physical card reading.

## PWA validation checklist
1. Run `npm run build` and `npm run start` from the project root after dependencies are installed.
2. Serve over HTTPS for real iPhone testing (localhost/LAN HTTP is only a development convenience and may not provide full install/service-worker behavior).
3. Open the HTTPS URL in Safari on iPhone 11–13.
4. Share > Add to Home Screen; launch the installed web app.
5. Verify layout, navigation, card management, consent, operator search statuses, history, CSV, and print/share flows.
6. Disable network and verify only the offline notice appears. Never show cached balance/transactions as current or live.
7. Re-enable network and verify the app recovers.

## Flutter on Windows
- Windows can host Flutter/Dart development and Android builds if Android SDK tooling is installed.
- iOS simulator, iOS signing, IPA archive, and TestFlight upload still require macOS/Xcode. A Windows-generated Flutter project does not remove this requirement.
- Keep NFC behind a platform interface: `NfcReader` with platform implementations and explicit `unsupported`, `not_available`, `permission_denied`, `tag_detected`, `read_success`, and `read_failed` states.
- Do not hardcode or log full card identifiers or raw secure tag payloads.

## Release gates
- PWA: PASS only after real iPhone Safari + HTTPS validation.
- iPhone card NFC: BLOCKED until exact card model/protocol and permitted data access are verified on device.
- Android NFC: BLOCKED until Android NFC test device is available.
- iOS TestFlight: BLOCKED until Mac/Xcode and Apple Developer Program access are available.
