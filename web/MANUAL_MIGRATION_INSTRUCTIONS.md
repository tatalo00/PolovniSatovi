# Manual Migration Instructions for Supabase SQL Editor

Since `npm run prisma:migrate dev` is not working, follow these steps to apply the migration manually:

## Step 1: Open Supabase SQL Editor

1. Go to https://supabase.com/dashboard
2. Select your project: **PolovniSatovi AWS**
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query** (or the "+" button)

## Step 2: Copy the Migration SQL

Open the file: `web/prisma/migrations/MANUAL_MIGRATION_add_reviews_and_updates.sql`

Copy ALL the SQL from that file (starting from line 5, excluding the comments at the top).

## Step 3: Paste and Run in SQL Editor

1. Paste the SQL into the SQL Editor text area
2. Click **Run** (or press Ctrl+Enter / Cmd+Enter)
3. Wait for the query to complete

You should see a success message like "Success. No rows returned"

## Step 4: Verify the Migration

After running the SQL, you can verify it worked by running this query:

```sql
-- Check if Review table exists
SELECT COUNT(*) FROM "Review";

-- Check if MessageThread has updatedAt column
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'MessageThread' AND column_name = 'updatedAt';
```

## Step 5: Regenerate Prisma Client

After the migration is applied, run:

```bash
cd web
npm run prisma:generate
```

## What the Migration Does

1. Adds `updatedAt` column to `MessageThread` table (for sorting conversations)
2. Creates `Review` table with all necessary fields
3. Adds foreign key relationships
4. Creates indexes for performance
5. Adds constraints (unique review per listing per user, rating 1-5)

## Troubleshooting

If you get errors:

- **"relation does not exist"**: Make sure your database has the User and Listing tables first
- **"column already exists"**: The column/table already exists, which is fine - the migration uses `IF NOT EXISTS`
- **"permission denied"**: Check that you're using the correct database user

