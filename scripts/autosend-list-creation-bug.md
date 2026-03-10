# AutoSend API Bug Report: POST /v1/contact-lists returns 500

**Date:** 2026-03-10
**Account project ID:** 698f59e4f722b176bcc7a636
**API version:** v1

## Summary

`POST /v1/contact-lists` consistently returns HTTP 500 with `{"success":false,"error":{"message":"Failed to create contact list"}}` regardless of request payload or auth method. Other endpoints (contacts, custom-fields, mails) work correctly with the same API key.

## Steps to Reproduce

```bash
curl -X POST https://api.autosend.com/v1/contact-lists \
  -H "Authorization: Bearer AS_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test List","type":"list"}'
```

**Response (HTTP 500):**
```json
{"success":false,"error":{"message":"Failed to create contact list"}}
```

## Payloads Tested (all return 500)

| # | Payload | Result |
|---|---------|--------|
| 1 | `{"name":"Test List","type":"list"}` | 500 |
| 2 | `{"name":"Test List"}` | 500 |
| 3 | `{"name":"completed","type":"list"}` | 500 |
| 4 | `{"name":"Test List","type":"list","description":"desc"}` | 500 |
| 5 | `{"name":"Test","type":"list","allow_duplicates":false,"permission":"private"}` | 500 |
| 6 | `{"name":"Test","type":"list","projectId":"698f59e4f722b176bcc7a636"}` | 500 |
| 7 | `{"name":"Test","type":"list","organizationId":"698f59e4f722b176bcc7a633"}` | 500 |

## Validation Does Work

The endpoint validates correctly before the 500 — indicating the route exists and parses the body:

```bash
# Missing name → proper 400
curl -X POST ... -d '{"listName":"Test","type":"list"}'
# → {"success":false,"error":{"message":"List name is required","code":"LIST_NAME_REQUIRED"}}

# Invalid type → proper 400
curl -X POST ... -d '{"name":"Test","type":"static"}'
# → {"success":false,"error":{"message":"Invalid list type. Must be either \"list\" or \"segment\"","code":"INVALID_LIST_TYPE"}}
```

## Auth Methods Tested

Both return the same 500:
- `Authorization: Bearer <key>`
- `x-api-key: <key>`

Both auth methods work on other endpoints (verified below).

## Other Endpoints Working (same key, same session)

| Endpoint | Method | Status |
|----------|--------|--------|
| `/v1/contact-lists` | GET | ✅ 200 — returns existing lists |
| `/v1/contacts` | POST | ✅ 200 — creates contacts |
| `/v1/contacts/email` | POST | ✅ 200 — upserts contacts |
| `/v1/custom-fields` | GET | ✅ 200 — lists fields |
| `/v1/custom-fields` | POST | ✅ 200 — creates fields |
| `/v1/mails/send` | POST | ✅ 200 — sends email |
| `/v1/contact-lists` | **POST** | **❌ 500** |

## Response Headers (from 500 response)

```
HTTP/2 500
content-type: application/json; charset=utf-8
x-powered-by: Express
x-railway-edge: railway/europe-west4
x-ratelimit-limit: 3
x-ratelimit-remaining: 2
```

## Environment

- API key format: `AS_...` (valid, works on all other endpoints)
- Tested via: cURL 8.7.1, autosendjs SDK v1.0.3 (`client.http.post`)
- Tested from: macOS, Europe region
- Existing lists on account: "All Contacts" (global), "LastOpened" (created via dashboard — works fine)

## Expected Behavior

`POST /v1/contact-lists` with `{"name":"...","type":"list"}` should return 201 with the created list ID, as it does when lists are created through the dashboard UI.

## Workaround

Creating lists via the dashboard UI works. Only the API endpoint is broken.
