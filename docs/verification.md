# User Verification & Didit Integration

This document summarises the streamlined KYC flow built around Didit. The platform now handles the full verification decision and we no longer store user documents locally or require admin review.

## Environment configuration

Configure the following variables (e.g. in `.env.local` or your deployment secret store):

| Variable | Description |
| --- | --- |
| `DIDIT_API_KEY` | Server-side API key issued by Didit |
| `DIDIT_BASE_URL` | Optional override for the Didit API base URL (`https://api.getdidit.com`) |
| `DIDIT_WORKFLOW_ID` | Workflow ID for the hosted verification link (copy from the Didit dashboard) |
| `DIDIT_WEBHOOK_SECRET` | Shared secret used to validate Didit webhook signatures (HMAC-SHA256) |
| `DIDIT_SUCCESS_REDIRECT` | Optional success redirect URL after a completed session |
| `DIDIT_FAILURE_REDIRECT` | Optional failure redirect URL if the session is canceled/failed |
| `DIDIT_CALLBACK_URL` | Optional server-to-server callback URL Didit can ping once the workflow completes |

## Workflow overview

1. **Dashboard alert** – unverified users see the `VerificationStatusCard` CTA on `/dashboard/profile`.
2. **Session creation** – clicking “Započni verifikaciju” calls `POST /api/verification/session`, which requests a hosted link from the Didit `/v2/session` endpoint (workflow-based), includes optional callback/vendor metadata, stores the response, and redirects the user to Didit.
3. **Didit webhook** – `POST /api/verification/webhook` verifies the signature and updates the `UserVerification` record based on the reported status. No media is fetched or stored.
4. **Automatic approval** – when Didit reports a successful verification, we mark `User.isVerified = true`. Failure/cancellation resets the flag to `false`.

## Database changes

- `User.isVerified` boolean flag controls the verified badge.
- `UserVerification` keeps lightweight metadata: Didit session/verification IDs, status (`PENDING`, `APPROVED`, `REJECTED`, `CANCELED`), optional status detail, and timestamps.

Relevant migrations:

- `prisma/migrations/20251109130000_user_verification` – initial KYC tables/flag.
- `prisma/migrations/20251109150000_user_verification_simplify` – removed encrypted asset storage and admin review references.

## Webhooks

- Header: `didit-signature` (hex-encoded HMAC-SHA256).
- Body: raw JSON is required for signature verification.
- Endpoint: `https://<your-domain>/api/verification/webhook`
- Actions:
  - `status` of `approved/completed/verified` → mark user verified.
  - `declined/failed` → status `REJECTED`, store the provided reason.
  - `canceled` → status `CANCELED`.
  - Any other value keeps the status `PENDING`.

## Admin impact

No admin UI is required. The global dashboard no longer lists verification queues. Trust badges are assigned exclusively by Didit’s decision.

## Testing checklist

- `npm run lint`
- `npm run build`
- Manual smoke tests:
  - Trigger `/api/verification/session` and confirm redirect to Didit.
  - Simulate a webhook callback with various statuses (see below) and verify `User.isVerified` updates accordingly.

### Mocking the webhook locally

```bash
payload='{"data":{"session_id":"sess_123","status":"approved"}}'
signature=$(echo -n "$payload" | openssl dgst -sha256 -hmac "$DIDIT_WEBHOOK_SECRET" -hex | cut -d' ' -f2)
curl -X POST \
  -H "Content-Type: application/json" \
  -H "didit-signature: $signature" \
  -d "$payload" \
  http://localhost:3000/api/verification/webhook
```

Ensure a `UserVerification` record exists with `diditSessionId = 'sess_123'` before calling the webhook (Prisma Studio or SQL).
