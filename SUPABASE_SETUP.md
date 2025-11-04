# Supabase Database Setup Guide

## Issue: "Can't reach database server"

If you're getting connection errors when running Prisma migrations, you need to configure Supabase to allow external connections.

## Step 1: Enable Direct Database Access

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **Database**

## Step 2: Configure Connection Pooling

1. Scroll down to **Connection Pooling** section
2. **Important:** For migrations, you need to use the **Direct connection** (port 5432), NOT the connection pooler
3. The connection pooler (port 6543) is for application connections only

## Step 3: Check IP Restrictions

1. In **Settings** → **Database**, look for **Connection string** or **Database settings**
2. Check if there are any IP restrictions enabled
3. If you see "Restrict access to specific IP addresses", you may need to:
   - Add your current IP address, OR
   - Temporarily disable IP restrictions for development

## Step 4: Get the Correct Connection String

1. In Supabase Dashboard → **Settings** → **Database**
2. Find the **Connection string** section
3. Select **URI** format
4. Copy the connection string - it should look like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```

## Step 5: Update .env.local

Your `.env.local` file in the `web/` directory should have:

```
DATABASE_URL="postgresql://postgres:PolovniSatovi1!@db.xfgyjeqhvveahdyojfde.supabase.co:5432/postgres?sslmode=require"
```

**Important notes:**
- Use port **5432** (direct connection) for migrations
- Include `?sslmode=require` for SSL
- If your password contains special characters like `!`, you may need to URL-encode them:
  - `!` → `%21`
  - So the password `PolovniSatovi1!` becomes `PolovniSatovi1%21`

## Step 6: Test Connection

Try connecting using the Supabase SQL Editor first:
1. Go to **SQL Editor** in Supabase Dashboard
2. Run a simple query: `SELECT 1;`
3. If this works, your database is accessible

## Step 7: Alternative - Use Supabase Connection Pooler for App

For your application (not migrations), you can use the connection pooler:
```
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1"
```

But for **migrations only**, always use the direct connection (port 5432).

## Common Issues

### "Connection refused" or "Can't reach database server"
- ✅ Verify your Supabase project is active
- ✅ Check you're using port 5432 (not 6543)
- ✅ Ensure SSL mode is set: `?sslmode=require`
- ✅ Check Supabase dashboard to ensure database is running

### "Authentication failed"
- ✅ Verify password is correct
- ✅ Try resetting password in Supabase Dashboard → Settings → Database
- ✅ URL-encode special characters in password

### "IP not allowed"
- ✅ Check Supabase Dashboard → Settings → Database → IP Restrictions
- ✅ Add your current IP or disable restrictions temporarily

## Still Having Issues?

1. **Test with Supabase SQL Editor** - If you can connect there, the issue is with your connection string
2. **Check Supabase Status** - Visit https://status.supabase.com
3. **Verify Project Status** - In Supabase Dashboard, check if project is paused or needs payment
4. **Try Connection String from Dashboard** - Copy the exact connection string from Supabase (it will have your actual password)

