# Connection Issue - DNS Resolution Failing

## Problem

The seed script can't connect because DNS resolution is failing for the Supabase hostname:
```
getaddrinfo ENOTFOUND db.xfgyjeqhvveahdyojfde.supabase.co
```

This means your computer cannot resolve the hostname `db.xfgyjeqhvveahdyojfde.supabase.co` to an IP address.

## Why Migrations Might Work But Seed Doesn't

If migrations work, there might be a few reasons:
1. **Different connection string** - Migrations might be using a different URL
2. **VPN/Proxy** - Migrations might be running through a different network
3. **Cached DNS** - Your system might have cached DNS that's no longer valid

## Solutions

### 1. Verify Your Connection String

Go to Supabase Dashboard → Settings → Database → Connection string

Make sure you're using the **URI** format with the correct hostname. The hostname should look like:
- `db.xxxxx.supabase.co` (where xxxxx is your project reference)

### 2. Check Your Supabase Project Status

- Go to https://supabase.com/dashboard
- Verify your project is active (not paused)
- Check if the project URL/hostname matches what's in your `.env.local`

### 3. Test DNS Resolution

Try pinging the hostname:
```bash
ping db.xfgyjeqhvveahdyojfde.supabase.co
```

If this fails, it's a DNS/network issue.

### 4. Try Using the Connection Pooler URL

Sometimes the direct connection (5432) has restrictions, but the pooler (6543) works better:

```
DATABASE_URL="postgresql://postgres.xxxxx:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
```

Get this from: Supabase Dashboard → Settings → Database → Connection Pooling

### 5. Check Network/Firewall

- Make sure your firewall isn't blocking connections
- If you're behind a corporate firewall, you might need VPN
- Some ISPs block certain ports - try using port 6543 (pooler) instead

### 6. Verify Supabase Project Reference

The hostname format is: `db.[PROJECT_REF].supabase.co`

Make sure `[PROJECT_REF]` matches your actual Supabase project reference. You can find this in:
- Supabase Dashboard → Settings → General → Reference ID

## Quick Fix to Try

1. **Get the fresh connection string from Supabase Dashboard**
2. **Copy it exactly** (don't modify it)
3. **Update `.env.local`** with the exact string
4. **Test again**

If migrations work but seed doesn't, please share:
- The exact connection string format you're using for migrations
- Whether you're using any VPN or proxy
- The output of `ping db.xfgyjeqhvveahdyojfde.supabase.co`

