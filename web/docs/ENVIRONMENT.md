# Environment Variables

Create a `.env.local` file in the project root with the following values:

```
# Database
DATABASE_URL=

# Auth (NextAuth)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=changeme
AUTH_SECRET=changeme  # Same as NEXTAUTH_SECRET for NextAuth v5
SESSION_MAX_AGE=604800  # Session expiration time in seconds (default: 7 days)
SESSION_UPDATE_AGE=86400  # How often to refresh the session in seconds (default: 1 day)

# Supabase Storage (for image uploads)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Email
BREVO_API_KEY=

# Didit KYC (hosted flow)
DIDIT_API_KEY=
DIDIT_WORKFLOW_ID=            # Copy from Didit dashboard → Workflow details
DIDIT_WEBHOOK_SECRET=         # Provided when configuring the webhook endpoint
DIDIT_BASE_URL=https://api.getdidit.com
# Optional overrides for post-authentication redirect behaviour
DIDIT_SUCCESS_REDIRECT=http://localhost:3000/dashboard/profile?authentication=success
DIDIT_FAILURE_REDIRECT=http://localhost:3000/dashboard/profile?authentication=failed
DIDIT_CALLBACK_URL=http://localhost:3000/api/authentication/status   # Optional server-to-server callback
```

Do not commit `.env.local` to source control.


