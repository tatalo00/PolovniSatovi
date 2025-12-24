# Prisma Migration Quick Fix Guide

**Quick Reference** - For detailed steps, see [PRISMA_MIGRATION_TROUBLESHOOTING.md](./PRISMA_MIGRATION_TROUBLESHOOTING.md)

## 🚀 Quick Start

```bash
cd web
npm run prisma:migrate:diagnose
```

This tells you what's wrong. Then follow the appropriate option below.

---

## Option 1: Fix DIRECT_URL (Most Common Fix)

### Quick Check
```bash
cd web
node -e "require('dotenv').config({ path: '.env.local' }); const u = process.env.DIRECT_URL; console.log(u ? '✅ Set' : '❌ Missing'); if (u) { const p = new URL(u).port || '5432'; console.log('Port:', p, p === '5432' ? '✅' : '❌ (should be 5432)'); }"
```

### Fix Steps
1. Go to Supabase Dashboard → Settings → Database
2. Copy connection string from "Connection string" → "URI"
3. **Change port from `6543` → `5432`**
4. **Change hostname from `pooler.supabase.com` → `db.[project-ref].supabase.co`**
5. Add to `web/.env.local`:
   ```env
   DIRECT_URL=postgresql://postgres.xxx:password@db.xxx.supabase.co:5432/postgres?sslmode=require
   ```
6. Test: `npm run prisma:migrate:diagnose`

---

## Option 2: Check Database Status

### Quick Checks
1. Supabase Dashboard → Is project status "Active" or "Paused"?
   - If paused → Click "Resume" → Wait 2 minutes → Test again

2. Supabase Dashboard → SQL Editor → Run `SELECT NOW();`
   - If works → Database is fine, check Option 1 or 3
   - If fails → Database issue, contact Supabase support

3. Check status page: https://status.supabase.com/

---

## Option 3: Fix Network/IP Restrictions

### Quick Checks
1. **Find your IP:**
   ```bash
   curl -s https://api.ipify.org
   ```

2. **Supabase Dashboard → Settings → Database → IP Restrictions**
   - If enabled → Add your IP from step 1
   - If disabled → Network is fine, check Option 1 or 2

3. **Check SSL in DIRECT_URL:**
   ```bash
   cd web
   node -e "require('dotenv').config({ path: '.env.local' }); const u = process.env.DIRECT_URL; console.log(u && u.includes('sslmode') ? '✅ SSL configured' : '❌ Add ?sslmode=require');"
   ```

---

## Common Errors → Quick Fixes

| Error | Quick Fix |
|-------|-----------|
| `P1001: Can't reach database` | Try Option 1, 2, then 3 |
| `Port 6543 detected` | Change DIRECT_URL port to 5432 (Option 1) |
| `DIRECT_URL not set` | Add DIRECT_URL to .env.local (Option 1) |
| Database paused | Resume in Supabase Dashboard (Option 2) |
| IP blocked | Add IP to allowed list (Option 3) |

---

## Success Checklist

Run this to verify everything works:

```bash
cd web

# 1. Run diagnostics
npm run prisma:migrate:diagnose

# 2. If successful, check migration status
npm run prisma:migrate:status

# 3. If all good, you're ready to migrate!
npm run prisma:migrate:deploy  # Apply pending migrations
```

**Expected output:**
- ✅ DATABASE_URL is set
- ✅ DIRECT_URL is set  
- ✅ Using direct connection (port 5432)
- ✅ Database connection successful!
- Migration status shows your migrations

---

## Need More Help?

📖 **Full Guide**: [PRISMA_MIGRATION_TROUBLESHOOTING.md](./PRISMA_MIGRATION_TROUBLESHOOTING.md)  
📚 **Migration Guide**: [PRISMA_MIGRATIONS.md](./PRISMA_MIGRATIONS.md)

