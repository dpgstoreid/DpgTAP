# DpgTAP acceptance test matrix

## UI lock
- Compare baseline and final screenshots at desktop, tablet and mobile widths.
- DPG-kun asset remains the approved supplied image.
- No layout, typography, color, copy hierarchy, or navigation redesign without owner approval.
- Latest balance card remains visible.

## Local-first
- Fresh install opens without account.
- Add a card locally; close/reopen app; card remains.
- No full card number appears in logs, database, analytics or crash reports.
- No balance shown until a real NFC/manual reading is supplied.
- Balance displays IDR formatting, source method, and last-read timestamp.

## Balance
- NFC success creates a balance snapshot.
- NFC failure does not create a fake snapshot.
- Manual entry is clearly labeled manual.
- Latest snapshot is selected by read_at, not created_at.
- Offline mode displays last stored snapshot and marks it as last-read.

## Toll search
- Only 7, 14, 30 accepted; default 30.
- Search cannot start without explicit consent.
- All enabled connectors start automatically; no pre-search operator picker.
- Each connector has independent timeout and truthful status.
- One connector failure does not cancel other connectors.
- Empty results are clearly distinguished from connector failure.
- Results sorted newest first and preserve operator/source provenance.
- Deduplication uses receipt ID or strong deterministic keys.
- Original operator receipt remains distinguishable from DpgTAP summary.
- Search audit stores only last4 and safe metadata, not full card number.

## Cloud and security
- Sign-in optional for local use.
- Cloud sync requires authenticated user.
- RLS prevents user A from reading/updating/deleting user B's records.
- Service role key absent from browser bundle and git.
- Sensitive endpoints use no-store, rate limits, schema validation and safe errors.
- User can export and delete their cloud data.

## Premium
- Price shown as Rp49.000/year consistently.
- Free use remains available.
- Client cannot self-grant Premium.
- Store purchase is verified server-side.
- Restore purchase works.
- Expiry/cancellation reflects verified store state.

## Release builds
- Web: install, lint, typecheck, test, production build.
- Flutter: format, analyze, unit/widget tests, Android debug/release build.
- iOS: build/archive on macOS with signing configured.
- Record versions, commands, outputs, and known limitations.
