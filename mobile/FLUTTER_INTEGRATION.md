# Flutter integration notes

The Flutter app is the primary mobile client for NFC. It should:
- Offer exactly three period choices: 7, 14, 30 days.
- Never show a pre-search operator picker.
- Submit `cardNumber` and `periodDays` to `POST /api/toll/search`.
- Render operator connector statuses and a merged, newest-first transaction list.
- Keep card metadata and locally acquired scans in SQLite.
- NFC detection is not equivalent to issuer-authorized balance/history access. Implement issuer-specific readers only with approved SDK/protocol access.
- If no NFC, allow manual card number and photo as a reference/identification aid; a photo does not itself reveal balance/history.
