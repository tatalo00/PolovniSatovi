# Prisma: `db push` vs `migrate dev` - Why One Works and the Other Doesn't

## The Key Difference

### `prisma db push` (or `npx prisma db push`)
- **Direct schema sync**: Directly pushes your Prisma schema to the database
- **No migration files**: Does NOT create or use migration files
- **No history tracking**: Doesn't track migration history
- **Fast and simple**: Good for prototyping and development
- **Can lose data**: If you have destructive changes (dropping columns, changing types), it will apply them immediately without warning
- **Works when**: Schema changes are straightforward and you don't need migration history

### `prisma migrate dev` (or `npm run prisma:migrate`)
- **Migration-based**: Creates migration files that track schema changes
- **Version control**: Migration files are tracked in git
- **Production-ready**: Safe for production deployments
- **History tracking**: Uses `_prisma_migrations` table to track applied migrations
- **Requires sync**: Migration files must be in sync with database state
- **Works when**: Migration history is consistent and database is in expected state

## Why `db push` Works But `migrate dev` Doesn't

### Common Reasons:

#### 1. **Migration History Drift**
The `_prisma_migrations` table in your database doesn't match your migration files.

**Symptoms:**
```
Error: The migration `20251103230000_add_auth_fields` failed to apply
```

**Why it happens:**
- You manually edited the database
- You used `db push` before, which doesn't update migration history
- Migration files were deleted or modified
- Database was reset but migration files weren't

**Solution:**
```bash
# Option 1: Reset migration history (⚠️ Deletes all data!)
npx prisma migrate reset

# Option 2: Mark migrations as applied (if you already applied them manually)
npx prisma migrate resolve --applied 20251103230000_add_auth_fields

# Option 3: Use db push for now, then create baseline migration
npx prisma db push
npx prisma migrate dev --name baseline --create-only
```

#### 2. **Missing Migration Files**
Your database has migration history, but the migration files are missing locally.

**Solution:**
```bash
# Pull the migration state from database
npx prisma migrate resolve --rolled-back <migration-name>

# Or reset and start fresh
npx prisma migrate reset
```

#### 3. **Schema Drift**
Your Prisma schema doesn't match your database schema.

**Check for drift:**
```bash
npx prisma migrate diff \
  --from-schema-datamodel prisma/schema.prisma \
  --to-schema-datasource prisma/schema.prisma \
  --script
```

**Solution:**
```bash
# Use db push to sync (will lose migration history)
npx prisma db push

# Or create a migration to fix drift
npx prisma migrate dev --name fix_drift
```

#### 4. **Connection Issues**
`migrate dev` requires a stable connection because it:
- Reads migration history
- Applies migrations
- Updates migration history
- Generates client

While `db push` is simpler and more tolerant of connection issues.

#### 5. **Database State Issues**
The `_prisma_migrations` table might be corrupted or missing.

**Check:**
```sql
-- In Supabase SQL Editor
SELECT * FROM "_prisma_migrations";
```

**Solution:**
```bash
# If table is missing, create baseline migration
npx prisma migrate dev --name baseline --create-only
npx prisma migrate resolve --applied baseline
```

## When to Use Each

### Use `db push` When:
- ✅ Early development/prototyping
- ✅ Testing schema changes quickly
- ✅ You don't need migration history
- ✅ Working solo on a feature branch
- ✅ Migration history is broken and you just want to sync

### Use `migrate dev` When:
- ✅ Production-ready code
- ✅ Working with a team (migrations are version controlled)
- ✅ You need to track schema changes over time
- ✅ Deploying to production (use `migrate deploy`)
- ✅ You need rollback capability

## Fixing Your Current Situation

### If `db push` works but `migrate dev` doesn't:

**Step 1: Check migration state**
```bash
cd web
npx prisma migrate status
```

**Step 2: If migrations are out of sync, choose one:**

**Option A: Reset and start fresh (⚠️ Deletes all data)**
```bash
npx prisma migrate reset
npx prisma migrate dev --name init
```

**Option B: Baseline from current state**
```bash
# 1. Ensure schema matches database (use db push)
npx prisma db push

# 2. Create a baseline migration
npx prisma migrate dev --name baseline --create-only

# 3. Mark it as applied (since db push already applied it)
npx prisma migrate resolve --applied baseline
```

**Option C: Mark existing migrations as applied**
```bash
# If your database already has the schema changes
npx prisma migrate resolve --applied 20251103230000_add_auth_fields
npx prisma migrate resolve --applied 20251103230000_add_user_location_password_reset
# ... repeat for each migration
```

## Best Practice Workflow

### For Development:
```bash
# Make schema changes in schema.prisma
# Then:
npx prisma migrate dev --name describe_your_change

# This will:
# 1. Create migration file
# 2. Apply it to database
# 3. Generate Prisma client
```

### For Production:
```bash
# Deploy migrations (read-only, doesn't create new migrations)
npx prisma migrate deploy

# Then generate client
npx prisma generate
```

## Troubleshooting Commands

```bash
# Check migration status
npx prisma migrate status

# See what migrations are pending
npx prisma migrate list

# Create migration without applying
npx prisma migrate dev --create-only --name migration_name

# Mark migration as applied (if you applied it manually)
npx prisma migrate resolve --applied migration_name

# Mark migration as rolled back
npx prisma migrate resolve --rolled-back migration_name

# Reset database and reapply all migrations
npx prisma migrate reset

# Compare schema to database
npx prisma migrate diff \
  --from-schema-datamodel prisma/schema.prisma \
  --to-schema-datasource prisma/schema.prisma
```

## Your Specific Case

Based on your project, you have migration files but might have:
1. Used `db push` at some point, which didn't update migration history
2. Database schema doesn't match migration files exactly
3. Migration history table is out of sync

**Recommended fix:**
```bash
cd web

# 1. Check current state
npx prisma migrate status

# 2. If everything is out of sync, baseline it:
npx prisma db push  # This will sync schema to database
npx prisma migrate dev --name baseline --create-only
npx prisma migrate resolve --applied baseline

# 3. From now on, use migrate dev for new changes
npx prisma migrate dev --name your_change_name
```

This will get you back to a clean state where `migrate dev` works properly.

