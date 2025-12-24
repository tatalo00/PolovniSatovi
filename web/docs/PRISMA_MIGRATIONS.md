# Prisma Migrations Guide

This guide explains the best practices for handling Prisma migrations in this project.

## Why Migrations Fail

The most common reasons Prisma migrations fail:

1. **Missing `DIRECT_URL` environment variable** - Migrations require a direct database connection (not PgBouncer)
2. **Using pooled connection** - Migrations cannot use connection poolers (port 6543)
3. **Schema drift** - Database schema doesn't match migration history
4. **Migration conflicts** - Multiple developers working on migrations simultaneously

## Understanding Connection Types

This project uses **two different database connections**:

### 1. `DATABASE_URL` (Runtime Connection)
- **Purpose**: Used by the application at runtime
- **Type**: Can use PgBouncer connection pooler (port 6543)
- **Use Case**: All application queries and operations
- **Format**: `postgresql://user:pass@host:6543/db?sslmode=require` (pooled)
- **OR**: `postgresql://user:pass@host:5432/db?sslmode=require` (direct)

### 2. `DIRECT_URL` (Migration Connection)
- **Purpose**: Used by Prisma migrations ONLY
- **Type**: **MUST** be a direct connection (port 5432)
- **Use Case**: Running `prisma migrate` commands
- **Format**: `postgresql://user:pass@host:5432/db?sslmode=require` (direct only)
- **Why**: Prisma migrations require administrative operations that don't work through poolers

## Setup

### 1. Configure Environment Variables

Add both `DATABASE_URL` and `DIRECT_URL` to your `.env.local`:

```env
# For runtime (can be pooled or direct)
DATABASE_URL=postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:6543/postgres?sslmode=require

# For migrations (MUST be direct connection on port 5432)
DIRECT_URL=postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres?sslmode=require
```

**Important**: 
- Both should point to the **same database**
- `DIRECT_URL` must use port **5432** (direct connection)
- `DATABASE_URL` can use port **5432** or **6543** (pooled)

### Getting Your Connection Strings from Supabase

1. Go to Supabase Dashboard → Settings → Database
2. Under "Connection string" → "URI"
3. Copy the connection string
4. Replace `[YOUR-PASSWORD]` with your database password

**For DIRECT_URL**: Use the connection string as-is (port 5432)
**For DATABASE_URL**: You can optionally use the "Connection pooling" string (port 6543) for better performance

## Migration Workflow

### Development

#### Creating a New Migration

```bash
# 1. Make changes to schema.prisma
# Edit web/prisma/schema.prisma

# 2. Create and apply migration
cd web
npm run prisma:migrate:dev

# Follow the prompts:
# - Enter a migration name (e.g., "add_user_phone")
# - Review the generated SQL
# - Confirm to apply
```

This will:
- Generate a new migration file in `prisma/migrations/`
- Apply the migration to your local database
- Regenerate Prisma Client

#### Resetting Database (Development Only)

```bash
# ⚠️ WARNING: This will delete all data!
cd web
npm run prisma:migrate:reset
```

#### Checking Migration Status

```bash
cd web
npm run prisma:migrate:status
```

This shows:
- Which migrations have been applied
- Which migrations are pending
- Any schema drift issues

### Production / Deployment

#### Option 1: Manual Migration Before Deployment (Recommended)

**Best Practice**: Run migrations manually before deploying code changes.

**Why**:
- Prevents build failures if migrations fail
- Allows you to test migrations in staging first
- Avoids migration conflicts from concurrent deployments
- Gives you full control over when schema changes are applied

**Steps**:

1. **Test migration locally**:
   ```bash
   cd web
   npm run prisma:migrate:dev
   ```

2. **Apply to production before deployment**:
   ```bash
   cd web
   DIRECT_URL="your-production-direct-url" npm run prisma:migrate:deploy
   ```

3. **Then deploy your code**:
   ```bash
   git push  # Triggers Vercel deployment
   ```

**Prerequisites**:
- `DIRECT_URL` must be set in your local environment or passed inline
- Production database must be accessible from your machine (or use Supabase SQL Editor)

#### Option 2: Migration via Supabase SQL Editor (Emergency Only)

For emergencies or when you can't access the database via CLI:

1. Go to Supabase Dashboard → SQL Editor
2. Copy the SQL from the migration file: `prisma/migrations/[migration-name]/migration.sql`
3. Paste and run in SQL Editor
4. Mark migration as applied (to prevent Prisma from trying to apply it again):
   ```sql
   -- Get the migration checksum from the migration.sql file or run:
   -- SELECT checksum FROM "_prisma_migrations" WHERE migration_name = '[migration-name]';
   
   INSERT INTO "_prisma_migrations" (
     id, 
     checksum, 
     finished_at, 
     migration_name, 
     logs, 
     rolled_back_at, 
     started_at, 
     applied_steps_count
   ) VALUES (
     gen_random_uuid()::text,
     '[checksum-from-migration-file]',
     NOW(),
     '[migration-name]',
     NULL,
     NULL,
     NOW(),
     1
   );
   ```

**Note**: This is more error-prone than using `prisma migrate deploy`. Use only when necessary.

#### Option 3: Automated Migration in Vercel Build (Advanced - Not Recommended)

**⚠️ Warning**: This approach can cause deployment failures if migrations fail. Use with caution.

If you want migrations to run automatically during Vercel builds, you can modify `vercel.json`:

```json
{
  "buildCommand": "npm install && npm run prisma:generate && npm run prisma:migrate:deploy && npm run build"
}
```

**Requirements**:
- `DIRECT_URL` must be set in Vercel environment variables
- Migrations must be idempotent (safe to run multiple times)
- Only one deployment should run migrations at a time

**When to use**:
- Small teams with sequential deployments
- Simple migrations that rarely fail
- When you want fully automated deployments

**When NOT to use**:
- Large teams with concurrent deployments
- Complex migrations that might fail
- When you need to test migrations before applying

## Troubleshooting

For a comprehensive step-by-step troubleshooting guide with 3 main options to fix connection issues, see:
**[PRISMA_MIGRATION_TROUBLESHOOTING.md](./PRISMA_MIGRATION_TROUBLESHOOTING.md)**

### Error: "P1001: Can't reach database server"

**Cause**: Database connection failed

**Solution**:
1. Verify `DIRECT_URL` is set correctly
2. Check if using port 5432 (not 6543)
3. Verify database is not paused in Supabase
4. Check network/firewall settings

### Error: "P3005: Database schema is not empty"

**Cause**: Database has tables but no migration history

**Solution**:
```bash
# Option 1: Baseline the database (if schema matches)
cd web
npm run prisma:migrate:resolve -- --applied [migration-name]

# Option 2: Reset and start fresh (⚠️ deletes all data)
npm run prisma:migrate:reset
```

### Error: "P3009: migrate found failed migrations in the database"

**Cause**: Previous migration failed partially

**Solution**:
```bash
# Mark migration as rolled back
cd web
npm run prisma:migrate:resolve -- --rolled-back [migration-name]

# Then retry
npm run prisma:migrate:deploy
```

### Error: "Schema drift detected"

**Cause**: Database schema doesn't match Prisma schema

**Solution**:
```bash
# Check what's different
cd web
npm run prisma:migrate:status

# Option 1: Create a migration to sync
npm run prisma:migrate:dev

# Option 2: Push schema directly (development only)
npm run prisma:db:push
```

### Migrations Work Locally But Fail on Vercel

**Cause**: Missing or incorrect `DIRECT_URL` in Vercel

**Solution**:
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add `DIRECT_URL` with your direct connection string (port 5432)
3. Redeploy

### Schema Changes Not Reflecting

**Cause**: Prisma Client not regenerated

**Solution**:
```bash
cd web
npm run prisma:generate
```

## Best Practices

### 1. Always Use Migrations (Never `db:push` in Production)

```bash
# ✅ Good (creates migration)
npm run prisma:migrate:dev

# ❌ Bad (skips migration history)
npm run prisma:db:push  # Only for prototyping
```

### 2. Review Generated SQL

Always review the SQL in migration files before applying:
- Check for data loss (DROP TABLE, DROP COLUMN)
- Verify indexes are created
- Ensure foreign keys are correct

### 3. Test Migrations Locally First

```bash
# 1. Test on local database
npm run prisma:migrate:dev

# 2. Test on staging (if available)
DIRECT_URL="staging-url" npm run prisma:migrate:deploy

# 3. Apply to production
DIRECT_URL="production-url" npm run prisma:migrate:deploy
```

### 4. Use Descriptive Migration Names

```bash
# ✅ Good
npm run prisma:migrate:dev --name add_user_phone_field

# ❌ Bad
npm run prisma:migrate:dev --name update
```

### 5. Never Edit Applied Migrations

Once a migration is applied to production, **never edit it**. Create a new migration instead.

### 6. Keep Migrations Small

Split large changes into multiple smaller migrations:
- Easier to review
- Easier to rollback if needed
- Better for collaboration

## Helper Scripts

### Diagnose Migration Issues

```bash
cd web
npm run prisma:migrate:diagnose
```

This script checks:
- Environment variables are set
- Database connection works
- Migration status
- Schema drift

### Check Migration Status

```bash
cd web
npm run prisma:migrate:status
```

### Reset Database (Development Only)

```bash
cd web
npm run prisma:migrate:reset
```

## Migration Files Structure

```
prisma/
├── schema.prisma          # Your Prisma schema
└── migrations/
    ├── 20240101000000_init/
    │   └── migration.sql
    ├── 20240102000000_add_user_phone/
    │   └── migration.sql
    └── migration_lock.toml # Locks the provider (postgresql)
```

## Additional Resources

- [Prisma Migrate Docs](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Prisma with Supabase](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel#supabase)

