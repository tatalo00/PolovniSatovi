# Prisma Migration Connection Troubleshooting Guide

This guide walks you through 3 options to fix database connection issues when running Prisma migrations.

## Quick Start: Run Diagnostics First

Before troubleshooting, always run the diagnostic script:

```bash
cd web
npm run prisma:migrate:diagnose
```

This will tell you exactly what's wrong. Then follow the appropriate option below.

---

## Option 1: Fix DIRECT_URL Configuration

### Problem
- DIRECT_URL is missing, incorrect, or using the wrong port
- Error: `Can't reach database server` or `P1001`

### Step-by-Step Solution

#### Step 1.1: Verify DIRECT_URL exists

```bash
cd web
node -e "require('dotenv').config({ path: '.env.local' }); console.log('DIRECT_URL:', process.env.DIRECT_URL ? 'SET' : 'MISSING');"
```

**If MISSING**, continue to Step 1.2.  
**If SET**, continue to Step 1.3.

#### Step 1.2: Get DIRECT_URL from Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **Database**
4. Scroll to **Connection string** section
5. Under **Connection string** → **URI**, you'll see:
   ```
   postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```
6. **IMPORTANT**: Copy the connection string but change the port from `6543` to `5432`
7. Also change the hostname from `pooler.supabase.com` to `db.[project-ref].supabase.co`

**Example transformation:**
```
# Pooled (WRONG for migrations):
postgresql://postgres.xxx:password@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require

# Direct (CORRECT for migrations):
postgresql://postgres.xxx:password@db.xxx.supabase.co:5432/postgres?sslmode=require
```

#### Step 1.3: Add DIRECT_URL to .env.local

Open `web/.env.local` and add:

```env
# Direct connection for migrations (MUST use port 5432)
DIRECT_URL=postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@db.[project-ref].supabase.co:5432/postgres?sslmode=require
```

**Replace:**
- `[project-ref]` with your project reference (found in Supabase dashboard URL)
- `[YOUR-PASSWORD]` with your database password

#### Step 1.4: Verify DIRECT_URL format

Run this command to check if DIRECT_URL is correct:

```bash
cd web
node -e "
require('dotenv').config({ path: '.env.local' });
const url = process.env.DIRECT_URL;
if (!url) {
  console.log('❌ DIRECT_URL not set');
  process.exit(1);
}
try {
  const urlObj = new URL(url);
  const port = urlObj.port || '5432';
  console.log('✅ DIRECT_URL is set');
  console.log('   Host:', urlObj.hostname);
  console.log('   Port:', port);
  console.log('   Database:', urlObj.pathname);
  if (port === '6543') {
    console.log('❌ ERROR: Port is 6543 (pooler). Must be 5432 (direct)');
    process.exit(1);
  } else if (port === '5432') {
    console.log('✅ Port is correct (5432 - direct connection)');
  }
} catch (e) {
  console.log('❌ Invalid URL format:', e.message);
  process.exit(1);
}
"
```

**If you see an error**, fix the DIRECT_URL and try again.  
**If port is correct**, move to Option 2.

#### Step 1.5: Test the connection

```bash
cd web
npm run prisma:migrate:diagnose
```

**Expected result:** Should show "✅ Database connection successful!" or clear error message.

---

## Option 2: Check Database Status & Accessibility

### Problem
- Database is paused, stopped, or not accessible
- Error: `P1001: Can't reach database server`

### Step-by-Step Solution

#### Step 2.1: Check if database is paused

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Look at the project status indicator (top right)
4. Check if it says "Paused" or shows a pause icon

**If paused:**
- Click "Resume" or "Restore" to activate the database
- Wait 1-2 minutes for the database to fully start
- Then test connection: `npm run prisma:migrate:diagnose`

**If active**, continue to Step 2.2.

#### Step 2.2: Verify database is running

1. In Supabase Dashboard, go to **Settings** → **Database**
2. Check **Database** section shows "Active" status
3. Look for any error messages or warnings

#### Step 2.3: Test connection via Supabase Dashboard

1. Go to **SQL Editor** in Supabase Dashboard
2. Click **New query**
3. Run this test query:
   ```sql
   SELECT NOW(), version();
   ```
4. If this works, your database is accessible - the issue is with your connection string or network
5. If this fails, your database has a problem - contact Supabase support

#### Step 2.4: Check project status page

1. Go to [Supabase Status Page](https://status.supabase.com/)
2. Check if there are any ongoing incidents
3. If there are issues, wait for them to be resolved

---

## Option 3: Fix Network & IP Restrictions

### Problem
- IP address is blocked by firewall
- Network restrictions prevent connection
- Error: `P1001: Can't reach database server` or timeout

### Step-by-Step Solution

#### Step 3.1: Check IP restrictions in Supabase

1. Go to Supabase Dashboard → **Settings** → **Database**
2. Scroll to **Connection Pooling** or **Network** section
3. Look for **IP Restrictions** or **Allowed IPs**
4. Check if IP restrictions are enabled

**If IP restrictions are enabled:**
- Continue to Step 3.2

**If IP restrictions are disabled:**
- The issue is likely not network-related
- Try Option 1 or 2 instead

#### Step 3.2: Find your public IP address

Run this command to get your current public IP:

```bash
# Option A: Using curl
curl -s https://api.ipify.org

# Option B: Using dig (macOS/Linux)
dig +short myip.opendns.com @resolver1.opendns.com

# Option C: Using wget
wget -qO- https://api.ipify.org
```

**Save this IP address** - you'll need it in the next step.

#### Step 3.3: Add your IP to allowed list

1. In Supabase Dashboard → **Settings** → **Database**
2. Find **Connection Pooling** → **IP Restrictions**
3. Click **Add IP** or **Allow IP**
4. Enter your IP address from Step 3.2
5. Save changes
6. Wait 30-60 seconds for changes to propagate

#### Step 3.4: Test connection

```bash
cd web
npm run prisma:migrate:diagnose
```

**If still failing**, continue to Step 3.5.

#### Step 3.5: Temporarily disable IP restrictions (Development Only)

⚠️ **WARNING**: Only do this for development databases, never for production!

1. In Supabase Dashboard → **Settings** → **Database**
2. Find **IP Restrictions**
3. Click **Disable** or remove all restrictions
4. Save changes
5. Test connection: `npm run prisma:migrate:diagnose`

**After testing, re-enable IP restrictions for security.**

#### Step 3.6: Check SSL/TLS settings

Sometimes SSL connection issues can appear as network problems.

Verify your DIRECT_URL includes `sslmode=require`:

```bash
cd web
node -e "
require('dotenv').config({ path: '.env.local' });
const url = process.env.DIRECT_URL;
if (url && !url.includes('sslmode')) {
  console.log('⚠️  WARNING: DIRECT_URL missing sslmode parameter');
  console.log('   Add ?sslmode=require to the end of your connection string');
} else {
  console.log('✅ SSL mode is configured');
}
"
```

**If missing**, add `?sslmode=require` to the end of your DIRECT_URL.

#### Step 3.7: Test with different network

If you're on a corporate network or VPN:

1. Try disconnecting from VPN
2. Try using a different network (mobile hotspot, different WiFi)
3. Test connection: `npm run prisma:migrate:diagnose`

If it works on a different network, your original network is blocking the connection.

---

## Quick Diagnostic Checklist

Run through this checklist to quickly identify the issue:

```bash
cd web

# 1. Check if DIRECT_URL exists
echo "1. Checking DIRECT_URL..."
node -e "require('dotenv').config({ path: '.env.local' }); console.log(process.env.DIRECT_URL ? '✅ Set' : '❌ Missing');"

# 2. Check if DIRECT_URL uses correct port
echo "2. Checking DIRECT_URL port..."
node -e "
require('dotenv').config({ path: '.env.local' });
const url = process.env.DIRECT_URL;
if (url) {
  const port = new URL(url).port || '5432';
  console.log(port === '5432' ? '✅ Port 5432 (correct)' : '❌ Port ' + port + ' (should be 5432)');
}
"

# 3. Run full diagnostics
echo "3. Running full diagnostics..."
npm run prisma:migrate:diagnose
```

---

## Common Error Messages & Solutions

### Error: `P1001: Can't reach database server`

**Causes:**
- DIRECT_URL is incorrect or missing
- Database is paused
- IP address is blocked
- Network/firewall blocking connection

**Solution:** Follow Options 1, 2, and 3 in order.

### Error: `P3005: Database schema is not empty`

**Cause:** Database has tables but no migration history.

**Solution:**
```bash
cd web
# See what migrations exist
npm run prisma:migrate:status

# Mark existing migrations as applied (if schema matches)
npm run prisma:migrate:resolve -- --applied [migration-name]
```

### Error: `P3009: migrate found failed migrations`

**Cause:** Previous migration failed partially.

**Solution:**
```bash
cd web
# Mark failed migration as rolled back
npm run prisma:migrate:resolve -- --rolled-back [migration-name]

# Retry migration
npm run prisma:migrate:deploy
```

### Error: `Port 6543 detected (connection pooler)`

**Cause:** DIRECT_URL is using pooled connection (port 6543) instead of direct (port 5432).

**Solution:** 
1. Get connection string from Supabase Dashboard
2. Change port from `6543` to `5432`
3. Change hostname from `pooler.supabase.com` to `db.[project-ref].supabase.co`
4. Update DIRECT_URL in `.env.local`

---

## Still Having Issues?

If none of the 3 options work:

1. **Check Supabase Status**: https://status.supabase.com/
2. **Review Supabase Logs**: Dashboard → Logs → Database
3. **Contact Support**: 
   - Supabase: https://supabase.com/support
   - Check Supabase Discord community

4. **Alternative: Use Supabase SQL Editor**
   - Go to Supabase Dashboard → SQL Editor
   - Run migration SQL manually
   - See `PRISMA_MIGRATIONS.md` for details

---

## Success Indicators

You'll know everything is working when:

```bash
cd web
npm run prisma:migrate:diagnose
```

Shows:
- ✅ DATABASE_URL is set
- ✅ DIRECT_URL is set
- ✅ Using direct connection (port 5432)
- ✅ Database connection successful!
- ✅ Migration status shows your migrations

Then you can run:
```bash
npm run prisma:migrate:status    # Check migration status
npm run prisma:migrate:deploy    # Apply pending migrations
npm run prisma:migrate:dev       # Create new migration
```

