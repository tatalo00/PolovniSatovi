# Troubleshooting Guide

## Fixed Issues

### 1. ✅ Prisma Client Import Error
**Problem:** `Cannot find module '../lib/generated/prisma'`

**Solution:** Updated seed.ts to import from the correct path:
```typescript
import { PrismaClient } from "../lib/generated/prisma/client";
```

### 2. ✅ Environment Variable Loading
**Problem:** Prisma config was skipping environment variable loading

**Solution:** Updated `prisma.config.ts` to explicitly load `.env.local`:
```typescript
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });
```

## Current Issue: Database Connection

### Problem: "Can't reach database server at `db.xfgyjeqhvveahdyojfde.supabase.co:5432`"

This is a **Supabase configuration issue**, not a code issue. You need to configure Supabase to allow external connections.

### Steps to Fix:

1. **Go to Supabase Dashboard:**
   - Visit https://supabase.com/dashboard
   - Select your project

2. **Check Database Settings:**
   - Go to **Settings** → **Database**
   - Verify your project is active (not paused)

3. **Get Connection String:**
   - In **Settings** → **Database** → **Connection string**
   - Select **URI** format
   - Copy the connection string

4. **Update .env.local:**
   - Make sure `.env.local` is in the `web/` directory
   - Use the connection string from Supabase (it will have your actual password)
   - Include `?sslmode=require` at the end
   - Example format:
     ```
     DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres?sslmode=require"
     ```

5. **Check IP Restrictions:**
   - In Supabase Dashboard → **Settings** → **Database**
   - Look for IP restrictions or firewall settings
   - If enabled, add your current IP or disable for development

6. **Test Connection:**
   - Try using Supabase SQL Editor first
   - If SQL Editor works, the issue is with your connection string format
   - If SQL Editor doesn't work, check if your project is active

### Quick Checklist:

- [ ] Supabase project is active (not paused)
- [ ] Using port 5432 (direct connection, not pooler)
- [ ] Connection string includes `?sslmode=require`
- [ ] Password is correct (or try resetting in Supabase)
- [ ] No IP restrictions blocking your connection
- [ ] `.env.local` file exists in `web/` directory

### Alternative: Use Supabase SQL Editor

If you can't connect via Prisma migrations, you can manually run the SQL:

1. Go to Supabase Dashboard → **SQL Editor**
2. Run the migration SQL manually (you can see the SQL Prisma generates)
3. Or use Supabase's migration tool

## Next Steps After Connection Works

Once you can connect to the database:

1. **Run migrations:**
   ```bash
   cd web
   npm run prisma:migrate
   ```
   When prompted, enter: `init`

2. **Generate Prisma Client (if not done):**
   ```bash
   npm run prisma:generate
   ```

3. **Seed database (optional):**
   ```bash
   npm run prisma:seed
   ```

## Still Having Issues?

1. Check the detailed guide: `SUPABASE_SETUP.md`
2. Verify your `.env.local` file format
3. Test connection with: `node scripts/check-env.js`
4. Check Supabase status: https://status.supabase.com

