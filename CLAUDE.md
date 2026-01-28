# PolovniSatovi - Project Context

A marketplace for buying and selling used and vintage watches in the Balkans.

## Tech Stack

- **Framework**: Next.js 16 (App Router) with React 19
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL via Supabase with Prisma ORM
- **Auth**: NextAuth v5 (JWT strategy, Google/Facebook OAuth, email/password)
- **UI**: Tailwind CSS 4, shadcn/ui (Radix), Lucide icons
- **Email**: Brevo (transactional emails)
- **Storage**: Supabase Storage (primary), Cloudinary (backup)
- **KYC**: Didit (seller identity verification)

## Project Structure

```
web/
├── app/                    # Next.js App Router
│   ├── api/               # REST API routes
│   ├── admin/             # Admin dashboard (requires ADMIN role)
│   ├── auth/              # Auth pages (signin, signup, reset)
│   ├── dashboard/         # User dashboard
│   ├── listing/           # Single listing pages
│   ├── listings/          # Listing browsing/search
│   ├── sellers/           # Seller profiles
│   └── sell/              # Seller onboarding
├── components/            # React components
│   ├── ui/               # shadcn/ui base components
│   └── [feature]/        # Feature-specific components
├── lib/                   # Utilities
│   ├── prisma.ts         # Prisma singleton
│   ├── auth.ts           # Auth helpers (requireAuth, requireAdmin, etc.)
│   ├── validation/       # Zod schemas
│   └── api-utils.ts      # API response helpers
├── prisma/               # Database schema & migrations
├── auth.ts               # NextAuth configuration
└── middleware.ts         # Route protection
```

## Key Commands

```bash
cd web
npm run dev              # Start dev server (port 3001)
npm run build            # Production build
npm run lint             # Run ESLint
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Create new migration
npm run prisma:migrate:deploy  # Apply migrations
npm run prisma:seed      # Seed database
npm run create:admin     # Create admin user
```

## Database Models

Core models in `web/prisma/schema.prisma`:

- **User** - Authentication, roles (BUYER/SELLER/ADMIN), verification status
- **Listing** - Watch products with full specs, status (DRAFT/PENDING/APPROVED/REJECTED/ARCHIVED/SOLD)
- **SellerProfile** - Store details, branding, rating
- **SellerApplication** - Seller application workflow
- **MessageThread/Message** - Buyer-seller communication
- **Review** - Seller reviews (1-5 stars)
- **Favorite** - User watchlist
- **UserAuthentication** - Didit KYC records

## Authentication Patterns

```typescript
// In server components/API routes:
import { auth } from "@/auth";
import { requireAuth, requireAdmin, requireSeller } from "@/lib/auth";

// Get session (nullable)
const session = await auth();

// Require authentication (throws if not logged in)
const user = await requireAuth();

// Require specific role
const admin = await requireAdmin();
const seller = await requireSeller();
```

## API Response Patterns

```typescript
import { jsonWithCache, errorResponse, CACHE_CONTROL } from "@/lib/api-utils";

// Success with caching
return jsonWithCache(data, { cache: CACHE_CONTROL.SHORT });

// Error response
return errorResponse("Error message", 400);
```

## Validation with Zod

```typescript
import { listingCreateSchema } from "@/lib/validation/listing";

const validation = listingCreateSchema.safeParse(body);
if (!validation.success) {
  return errorResponse(validation.error.issues[0].message, 400);
}
```

## Protected Routes (middleware.ts)

- `/admin/*` - ADMIN role only
- `/dashboard/*` - Authenticated users
- `/sell/*` - Authenticated sellers

## User Roles

- **BUYER** - Default role, can browse and purchase
- **SELLER** - Can list items, receive messages, has SellerProfile
- **ADMIN** - Full access, moderation capabilities

## Listing Status Flow

```
DRAFT → PENDING → APPROVED → SOLD
                ↘ REJECTED
                ↘ ARCHIVED
```

## Environment Variables

Key variables in `.env.local`:
- `DATABASE_URL` - Supabase pooled connection (PgBouncer)
- `DIRECT_URL` - Direct connection for migrations
- `NEXTAUTH_SECRET` - JWT signing secret
- `NEXT_PUBLIC_SUPABASE_URL/ANON_KEY` - Storage access
- `BREVO_API_KEY` - Email service

## Conventions

- **Server-only code**: Mark with `"use server"` directive
- **Prices**: Stored in EUR cents (`priceEurCents`)
- **Images**: Use Next.js Image component with remote patterns
- **Forms**: Zod validation + server actions
- **Components**: Feature-based folders, shadcn/ui for base components
- **Error handling**: Try-catch with Prisma error type checking

## Important Files

- [auth.ts](web/auth.ts) - NextAuth config with all providers
- [middleware.ts](web/middleware.ts) - Route protection
- [lib/prisma.ts](web/lib/prisma.ts) - Prisma singleton for serverless
- [lib/auth.ts](web/lib/auth.ts) - Auth helper functions
- [lib/listings.ts](web/lib/listings.ts) - Listing search & filtering
- [prisma/schema.prisma](web/prisma/schema.prisma) - Database schema

## Documentation

Additional docs in `web/docs/`:
- ENVIRONMENT.md - Environment setup
- VERCEL_DEPLOYMENT.md - Deployment guide
- PRISMA_MIGRATIONS.md - Migration troubleshooting
