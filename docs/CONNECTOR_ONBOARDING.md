# Connector onboarding and verification register

## Rules
- Only enable a connector after testing the real public workflow, confirming terms/authorization, and recording reproducible evidence.
- Never bypass CAPTCHA, login, rate limits, bot protection, or access controls.
- Do not send a full card number to any endpoint until the user has explicitly consented for that specific search.
- Do not log or persist full card numbers. Do not invent receipts or mark a connector ready from a homepage check.
- Each adapter must have bounded timeouts, rate limiting, safe error mapping, source URL provenance, and fixture-based parser tests.

## Publicly documented candidate sources (not yet technically verified by DpgTAP)
| Operator | Public source | Evidence found | Current DpgTAP state |
|---|---|---|---|
| Astra Infra Toll Road | https://astratol.co.id/ | Public form advertises card number + date range; receipt data retained up to 30 days. | candidate / disabled |
| BSD Toll | https://www.bsdtol.com/struk | Public form requests 16-digit card number, start/end dates, and offers search/print. | candidate / disabled |
| Tol Makassar / MMN-MAN | https://tolmakassar.com/struk | Official e-struk page documents card number and date-range lookup. | candidate / disabled |
| Serbaraja | https://serbaraja.co.id/ | Operator news says digital receipts are available through its official portal; exact form/technical workflow still needs inspection. | candidate / disabled |
| Jasa Marga / Travoy | — | Digital Receipt is documented, but public evidence points to the Travoy app/account workflow. | candidate / disabled; do not automate app login |
| Citra Persada Infrastruktur | https://citrapersada.net/ | Operator/company site found; no verified public receipt form yet. | discovery required |
| JLB (JORR W1) | — | No verified official public receipt endpoint found in this pass. | discovery required |
| JTD | — | No verified official public receipt endpoint found in this pass. | discovery required |

## Required evidence before setting `enabled: true`
1. Official source URL and date checked.
2. Terms/privacy/authorization review.
3. Browser/manual flow works with an owner-provided test card on the operator's own site.
4. Network request shape and response format documented without storing real card numbers or tokens.
5. Adapter parser tests using sanitized fixtures.
6. End-to-end test confirms transaction rows and original receipt documents/URLs match the operator source.
7. Per-operator timeout, backoff, cooldown, and safe error behavior verified.
8. Owner approval to enable the connector in production.

## First verification targets
Prioritize BSD Toll and Tol Makassar because their official pages publicly document the required card-number/date search fields. AstraTol is next; its public result states a 30-day retention window, so the 30-day DpgTAP option is the maximum practical search window there. This is a candidate priority, not a claim that the adapters already work.
