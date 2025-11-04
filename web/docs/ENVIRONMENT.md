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

# Email (Resend)
RESEND_API_KEY=
```

Do not commit `.env.local` to source control.


