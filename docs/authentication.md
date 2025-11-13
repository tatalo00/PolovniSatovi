# User Authentication & Didit Integration

This document summarises the KYC-style authentication flow powered by Didit. The platform delegates identity checks to Didit, never stores user documents locally, and relies on their decision to mark accounts as authenticated. Verified seller status remains a separate manual flag (`User.isVerified`).

## Environment configuration

Configure the following variables (e.g. in `.env.local` or your deployment secret store):

| Variable | Description |
| --- | --- |
| `DIDIT_API_KEY` | Server-side API key issued by Didit |
| `DIDIT_BASE_URL` | Optional override for the Didit API base URL (`https://api.getdidit.com`) |
| `DIDIT_WORKFLOW_ID` | Workflow ID for the hosted authentication link (copy from the Didit dashboard) |
| `DIDIT_WEBHOOK_SECRET` | Shared secret used to validate Didit webhook signatures (HMAC-SHA256) |
| `DIDIT_SUCCESS_REDIRECT` | Optional success redirect URL after a completed session |
| `DIDIT_FAILURE_REDIRECT` | Optional failure redirect URL if the session is canceled/failed |
| `DIDIT_CALLBACK_URL` | Optional server-to-server callback URL Didit can ping once the workflow completes |

## Workflow overview

1. **Dashboard alert** – unauthenticated users see the `AuthenticationStatusCard` CTA on `/dashboard/profile`.
2. **Session creation** – clicking “Započni autentifikaciju” calls `POST /api/authentication/session`, which requests a hosted link from the Didit `/v2/session` endpoint, stores the returned metadata, and redirects the user to Didit.
3. **Didit webhook** – `POST /api/authentication/webhook` validates the signature and updates the `UserAuthentication` record with the reported status. No media is fetched or stored.
4. **Status display** – once Didit marks the session `APPROVED`, listings show the “Autentifikovani korisnik” badge (unless the seller is manually verified, which takes precedence).

## Database changes

- `User.isVerified` remains the manual “Verified seller” flag.
- `UserAuthentication` keeps lightweight metadata: Didit session/authentication IDs, status (`PENDING`, `APPROVED`, `REJECTED`, `CANCELED`), optional status detail, and timestamps.

Relevant migrations:

- `prisma/migrations/20251109130000_user_verification` – initial KYC tables/flag (now interpreted as authentication).
- `prisma/migrations/20251109150000_user_verification_simplify` – removed encrypted asset storage and admin review references.
- _(Pending)_ Rename migration to switch `UserVerification` → `UserAuthentication` and associated enums.

## Webhooks

- Header: `didit-signature` (hex-encoded HMAC-SHA256).
- Body: raw JSON is required for signature verification.
- Endpoint: `https://<your-domain>/api/authentication/webhook`
- Actions:
  - `status` of `approved/completed/verified/success` → mark authentication status `APPROVED`.
  - `declined/failed` → status `REJECTED`, store the provided reason.
  - `canceled` → status `CANCELED`.
  - Any other value keeps the status `PENDING` and stores the detail for troubleshooting.

## Admin impact

No admin UI is required. Trust-level badges are assigned automatically based on Didit’s decision (authentication) and manual seller review (verified seller flag).

## Testing checklist

- `pnpm lint`
- `pnpm build`
- Manual smoke tests:
  - Trigger `POST /api/authentication/session` and confirm redirect to Didit.
  - Simulate webhook callbacks with various statuses and verify `UserAuthentication` records update accordingly (seller verification badge should remain unchanged).

### Mocking the webhook locally

```bash
payload='{"data":{"session_id":"sess_123","status":"approved"}}'
signature=$(echo -n "$payload" | openssl dgst -sha256 -hmac "$DIDIT_WEBHOOK_SECRET" -hex | cut -d' ' -f2)
curl -X POST \
  -H "Content-Type: application/json" \
  -H "didit-signature: $signature" \
  -d "$payload" \
  http://localhost:3000/api/authentication/webhook
```

Ensure a `UserAuthentication` record exists with `diditSessionId = 'sess_123'` before calling the webhook (via Prisma Studio or SQL).
