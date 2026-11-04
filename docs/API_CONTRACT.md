# API contract

`POST /api/toll/search`

Request:
```json
{"cardNumber":"1234567890123456","periodDays":30}
```
`periodDays` accepts exactly 7, 14, or 30. No operator selection field exists.

Response:
```json
{
  "periodDays":30,
  "dateFrom":"YYYY-MM-DD",
  "dateTo":"YYYY-MM-DD",
  "connectors":[
    {"code":"JM","name":"Jasa Marga / Travoy","status":"not_configured","message":"..."}
  ],
  "transactions":[],
  "note":"..."
}
```
Connector status values: `ready`, `not_configured`, `unavailable`.

Normalized transaction fields: operator identity, timestamp, entry/exit gate, gate/lane, vehicle class, amount, balance after (if returned), card last four digits, receipt ID, source URL, original receipt URL, verification type.

Never label an app-generated summary as an official operator receipt. Preserve original operator PDFs byte-for-byte where terms permit. The normalized summary must be branded as a DpgTAP report.
