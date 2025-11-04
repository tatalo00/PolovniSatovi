# Setup Guide

## Prerequisites

1. Make sure you're in the `web/` directory:
   ```bash
   cd web
   ```

2. Ensure `.env.local` exists in the `web/` directory with your Supabase connection string:
   
   **Important:** The password contains special characters. Use URL encoding:
   - `!` becomes `%21`
   
   ```
   DATABASE_URL="postgresql://postgres:PolovniSatovi1%21@db.xfgyjeqhvveahdyojfde.supabase.co:5432/postgres?sslmode=require"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="changeme"
   ```
   
   **Note:** For migrations, use the direct connection (port 5432) without pgbouncer. The connection pooler is for application connections only.
   
   **Alternative:** If URL encoding doesn't work, you can also wrap the entire connection string in quotes and use the password as-is, but Prisma should handle it.

## Running Prisma Commands

**Important:** Always run these commands from the `web/` directory.

### 1. Generate Prisma Client
```bash
npm run prisma:generate
```
This creates the Prisma client in `lib/generated/prisma/`.

### 2. Run Migrations (Creates Database Tables)
```bash
npm run prisma:migrate
```

When prompted, enter a migration name (e.g., `init`).

**Alternative:** If the above doesn't work, try:
```bash
npx prisma migrate dev --name init
```

### 3. Seed Database (Optional - adds demo data)
```bash
npm run prisma:seed
```

## Troubleshooting

### "Can't reach database server" error
1. **Verify Supabase is running:**
   - Go to your Supabase dashboard
   - Check that the project is active

2. **Check connection string:**
   - Use the direct connection string (not pooler) for migrations
   - Format: `postgresql://postgres:PASSWORD@HOST:5432/postgres?sslmode=require`
   - Make sure password is URL-encoded if it contains special characters

3. **Test connection:**
   ```bash
   node scripts/check-env.js
   ```
   This will verify your environment variables are loaded.

4. **Firewall/Network:**
   - Ensure your IP is allowed in Supabase (Settings → Database → Connection Pooling)
   - Try connecting from Supabase SQL Editor first

### "Module not found" or "Cannot find module" errors
- Run `npm install` to ensure all dependencies are installed
- Make sure you're in the `web/` directory
- Delete `node_modules` and `package-lock.json`, then run `npm install` again

### Environment variables not loading
- Ensure `.env.local` is in the `web/` directory (same level as `package.json`)
- Check file has no syntax errors (no extra quotes, proper line endings)
- Verify the file is named exactly `.env.local` (not `.env.local.txt`)
- Restart your terminal after creating/modifying `.env.local`

### Prisma generate works but migrate fails
- This usually means the database connection is the issue
- Double-check your DATABASE_URL
- Try connecting with a database client (like pgAdmin or DBeaver) to verify credentials

## Recommended Order

1. **First time setup:**
   ```bash
   cd web
   npm install
   npm run prisma:generate
   npm run prisma:migrate  # When prompted, enter: init
   npm run prisma:seed
   ```

2. **For development:**
   ```bash
   npm run dev
   ```

## Common Issues

### Issue: "P1001: Can't reach database server"
**Solution:** 
- Check Supabase dashboard → Settings → Database
- Verify connection string uses port 5432 (direct connection)
- Make sure SSL mode is required: `?sslmode=require`
- Check if your IP needs to be whitelisted

### Issue: Commands work from root but not from web/
**Solution:** Always run commands from the `web/` directory where `package.json` is located.

