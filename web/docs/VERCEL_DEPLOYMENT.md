# Vercel Deployment Guide

This guide will help you deploy PolovniSatovi to Vercel.

## Prerequisites

1. ✅ Code pushed to Git repository (GitHub, GitLab, or Bitbucket)
2. ✅ Vercel account (sign up at https://vercel.com)
3. ✅ Supabase database configured
4. ✅ Environment variables ready

## Step 1: Connect Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your Git repository
4. Vercel will auto-detect Next.js

## Step 2: Configure Project Settings

**Important:** Since your Next.js app is in the `web/` subdirectory:

In Vercel project settings:
1. Go to **Settings** → **General**
2. Find **Root Directory** section
3. Click **Edit** and set it to: `web`
4. Click **Save**

**Framework Preset:** Next.js (auto-detected)

**Build Command:** Will run `npm run build` from the `web/` directory (includes Prisma generate via postinstall)

**Output Directory:** `.next` (default)

**Install Command:** `npm install` (default)

**Note:** The `vercel.json` file in the repository root provides build configuration. The Root Directory must be set manually in Vercel UI.

## Step 3: Configure Environment Variables

Go to **Settings** → **Environment Variables** and add:

### Required Variables

```env
# Database
DATABASE_URL=postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres?sslmode=require

# Auth (NextAuth)
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-random-secret-here-min-32-characters
AUTH_SECRET=your-random-secret-here-min-32-characters

# Supabase Storage
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Email (Resend)
RESEND_API_KEY=re_xxxxx
```

### Generating Secrets

For `NEXTAUTH_SECRET` and `AUTH_SECRET`, generate a secure random string:

```bash
openssl rand -base64 32
```

Or use an online generator: https://generate-secret.vercel.app/32

### Important Notes:

- **DATABASE_URL**: Use your Supabase connection string (port 5432 for direct connection)
- **NEXTAUTH_URL**: Set this to your Vercel deployment URL (e.g., `https://polovnisatovi.vercel.app`)
- **NEXT_PUBLIC_***: These are exposed to the browser - make sure they're safe to expose
- **RESEND_API_KEY**: Get from Resend dashboard (see `docs/RESEND_SETUP.md`)

### Environment-Specific Variables

You can set different values for:
- **Production** (default)
- **Preview** (for PR previews)
- **Development** (local development)

## Step 4: Database Migrations

**Important:** Run migrations before first deployment:

### Option 1: Via Vercel (Recommended)

1. After first deployment, go to your project
2. Open **Deployments** tab
3. Click on the latest deployment → **View Function Logs**
4. Check if migrations ran successfully

### Option 2: Manual Migration (Before First Deploy)

Run migrations locally pointing to production database:

```bash
cd web
DATABASE_URL="your-production-database-url" npm run prisma:migrate deploy
```

### Option 3: Via Supabase Dashboard

1. Go to Supabase Dashboard → SQL Editor
2. Run the migration SQL files manually from `web/prisma/migrations/`

## Step 5: Deploy

1. Click **"Deploy"** in Vercel dashboard
2. Wait for build to complete (usually 2-5 minutes)
3. Vercel will provide you with a deployment URL

## Step 6: Post-Deployment Setup

### 1. Verify Build

- Check build logs for any errors
- Ensure Prisma client generated successfully
- Verify all environment variables are set

### 2. Test Critical Features

- [ ] Homepage loads
- [ ] User signup/signin works
- [ ] Listing creation works
- [ ] Image uploads work
- [ ] Email sending works (forgot password)

### 3. Configure Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXTAUTH_URL` environment variable to match your domain

### 4. Create Admin User

After deployment, create your admin user:

```bash
# Run locally with production DATABASE_URL
cd web
DATABASE_URL="your-production-database-url" npm run create:admin your-email@example.com
```

Or use Supabase SQL Editor:
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

## Step 7: Configure Supabase Storage

Make sure your Supabase Storage bucket is configured:

1. Go to Supabase Dashboard → Storage
2. Verify `public` bucket exists
3. Check storage policies allow public access for listings
4. See `docs/SUPABASE_STORAGE_SETUP.md` for details

## Troubleshooting

### Build Fails: "Prisma Client not generated"

**Solution:** The `postinstall` script should handle this. If it fails:
1. Check build logs
2. Ensure `DATABASE_URL` is set correctly
3. Try adding explicit build command: `npm run prisma:generate && npm run build`

### Build Fails: "Module not found"

**Solution:** 
1. Check that all dependencies are in `package.json`
2. Ensure `package-lock.json` is committed
3. Check that `web/` is set as root directory

### Database Connection Errors

**Solution:**
1. Verify `DATABASE_URL` is correct in Vercel environment variables
2. Check Supabase project is not paused
3. Ensure IP restrictions allow Vercel IPs (or disable for production)
4. Use connection pooler URL for production: `postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:6543/postgres?sslmode=require`

### Email Not Working

**Solution:**
1. Verify `RESEND_API_KEY` is set in Vercel
2. Check Resend dashboard for email logs
3. Verify domain is verified in Resend (for production)

### Images Not Loading

**Solution:**
1. Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
2. Check Supabase Storage bucket is public
3. Verify storage policies allow read access

## Environment Variables Checklist

Before deploying, ensure you have:

- [ ] `DATABASE_URL` - Supabase PostgreSQL connection string
- [ ] `NEXTAUTH_URL` - Your Vercel deployment URL
- [ ] `NEXTAUTH_SECRET` - Random 32+ character string
- [ ] `AUTH_SECRET` - Same as NEXTAUTH_SECRET
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- [ ] `RESEND_API_KEY` - Resend API key (optional but recommended)

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma with Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Supabase Documentation](https://supabase.com/docs)

## Support

If you encounter issues:
1. Check build logs in Vercel dashboard
2. Check function logs for runtime errors
3. Review environment variables are set correctly
4. Check Supabase dashboard for database issues

