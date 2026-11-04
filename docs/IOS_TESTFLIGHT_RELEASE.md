# iOS TestFlight release plan

## Build environment
- A Mac with a supported Xcode version is mandatory for iOS archive/signing/upload.
- Apple Developer Program membership and App Store Connect access are required.
- Flutter SDK, CocoaPods, Xcode command-line tools, and a valid bundle identifier are required.
- The current development container is Linux and has no Flutter/Xcode toolchain; an iOS archive cannot be truthfully built or uploaded here.

## TestFlight gates
1. Freeze the approved DPG-kun UI assets and compare screenshots before/after integration.
2. Add iOS app target and bundle identifier; configure signing in Xcode.
3. Implement local-first cards, balances, history, receipt search, reports, and privacy controls.
4. Check NFC availability on each supported iPhone model and implement only issuer protocols/SDKs supported by iOS and authorized by issuer. If an issuer/card is not readable on iOS, expose the supported fallback and do not promise NFC parity with Android.
5. Implement StoreKit annual Premium product at Rp49.000/year after product ID is finalized in App Store Connect; server verifies signed transaction/renewal status. Never unlock from a client flag.
6. Add privacy manifest, permission purpose strings, account deletion if account creation exists, support URL, privacy policy, and review notes.
7. Run Flutter analyze, unit/widget tests, iOS simulator tests, and physical-device tests.
8. Archive with Xcode, upload to App Store Connect, assign internal testers, then external TestFlight review if needed.
9. Verify install/update, restore purchases, expiry, offline behavior, NFC scan, operator receipt retrieval, PDF/CSV share, and crash-free sessions.

## TestFlight test evidence
For every build record: build number, iOS version/device, tester, test card issuer (masked), NFC result, last-read balance timestamp, operator connector results, receipt match evidence, export result, entitlement state, and crash/log summary. Never include full card numbers or secrets in screenshots/logs.
