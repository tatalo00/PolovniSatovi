# Migration Fix: Add Auth Fields

## Problem
The database schema is missing the Auth.js fields (`emailVerified`, `image`, `password`) on the User table, and the Auth.js tables (Account, Session, VerificationToken) are missing.

## Solution

A migration file has been created at:
```
prisma/migrations/20251103230000_add_auth_fields/migration.sql
```

### Option 1: Apply via Prisma (Recommended)
Once your database connection is restored, run:

```bash
cd web
npm run prisma:migrate deploy
```

Or use `db push` for development:
```bash
npx prisma db push
```

### Option 2: Apply Manually via Supabase Dashboard

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `prisma/migrations/20251103230000_add_auth_fields/migration.sql`
4. Run the SQL

### Option 3: Apply via psql

If you have direct database access:

```bash
psql "your-database-connection-string" -f prisma/migrations/20251103230000_add_auth_fields/migration.sql
```

## What the Migration Does

1. Adds `emailVerified` column to User table (nullable DateTime)
2. Adds `image` column to User table (nullable Text)
3. Adds `password` column to User table (nullable Text)
4. Creates `Account` table for OAuth connections
5. Creates `Session` table for user sessions
6. Creates `VerificationToken` table for email verification
7. Adds all necessary indexes and foreign keys

## After Migration

After applying the migration, regenerate the Prisma client:

```bash
npm run prisma:generate
```

Then restart your development server.

