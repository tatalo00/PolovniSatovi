# Prisma Migration Troubleshooting Guide

If `npm run prisma:migrate dev` is not working, try these solutions in order:

## Quick Fixes

### 1. Check Database Connection

First, verify your database connection:

```bash
cd web
node scripts/check-env.js
```

If this fails, check your `.env.local` file:
- Ensure `DATABASE_URL` is correct
- Use port **5432** (direct connection, not pooler) for migrations
- Include `?sslmode=require` for SSL
- URL-encode special characters in password (e.g., `!` → `%21`)

### 2. Generate Prisma Client First

Sometimes you need to generate the client before migrating:

```bash
cd web
npm run prisma:generate
```

### 3. Try Alternative: `db push` (Development Only)

For development, you can push schema changes without creating a migration:

```bash
cd web
npx prisma db push
```

**Note:** This is only for development. It doesn't create migration files, so use `migrate dev` for production.

### 4. Reset Migration State (If Stuck)

If migrations are in a broken state:

```bash
cd web
# Reset the migration history (WARNING: This will reset your database)
npx prisma migrate reset

# Then run migrations again
npm run prisma:migrate dev --name add_reviews_and_messaging
```

**⚠️ WARNING:** `migrate reset` will **delete all data** in your database. Only use this in development!

## Common Error Messages and Solutions

### Error: "Migration ... failed to apply"
**Solution:**
1. Check the migration status:
   ```bash
   npx prisma migrate status
   ```

2. If a migration is partially applied, you may need to:
   - Manually fix the database state
   - Or reset and re-run migrations

### Error: "Can't reach database server"
**Solution:**
1. Check Supabase is running (go to dashboard)
2. Verify connection string uses port 5432
3. Check firewall/IP restrictions in Supabase settings
4. Test connection in Supabase SQL Editor first

### Error: "Schema validation errors"
**Solution:**
1. Check `schema.prisma` for syntax errors
2. Run `npm run prisma:generate` to see validation errors
3. Fix any issues in the schema file

### Error: "Migration name already exists"
**Solution:**
Provide a unique migration name:
```bash
npx prisma migrate dev --name add_reviews_and_messaging_updates
```

## Manual Migration Approach

If Prisma migrations continue to fail, you can apply changes manually:

### Option A: Use Supabase SQL Editor

1. Go to Supabase Dashboard → **SQL Editor**
2. Copy and paste the SQL from the manual migration file (see below)
3. Run the SQL

### Option B: Create Migration File Manually

1. Create a new migration directory:
   ```bash
   mkdir -p web/prisma/migrations/$(date +%Y%m%d%H%M%S)_add_reviews_and_updates
   ```

2. Create `migration.sql` in that directory with the SQL (see below)

3. Mark it as applied:
   ```bash
   npx prisma migrate resolve --applied <migration_name>
   ```

## What Changed in Schema

The following changes were made to the schema:

1. **Added Review model** - For user reviews and ratings
2. **Added `updatedAt` to MessageThread** - For sorting conversations
3. **Added relations to User model** - `reviews` and `sellerReviews`

## Recommended Steps

1. **First, try the simple approach:**
   ```bash
   cd web
   npm run prisma:generate
   npx prisma db push
   ```

2. **If that works, create a proper migration:**
   ```bash
   npx prisma migrate dev --name add_reviews_and_messaging_updates
   ```

3. **If db push fails, check connection and try manual migration (see below)**

