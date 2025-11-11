# Environment Variables

Create a `.env.local` file in the project root with the following values:

```
# Database
DATABASE_URL=

# Auth (NextAuth)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=changeme
AUTH_SECRET=changeme  # Same as NEXTAUTH_SECRET for NextAuth v5

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
# Optional overrides for post-verification redirect behaviour
DIDIT_SUCCESS_REDIRECT=http://localhost:3000/dashboard/profile?verification=success
DIDIT_FAILURE_REDIRECT=http://localhost:3000/dashboard/profile?verification=failed
DIDIT_CALLBACK_URL=http://localhost:3000/api/verification/status   # Optional server-to-server callback
```

Do not commit `.env.local` to source control.


