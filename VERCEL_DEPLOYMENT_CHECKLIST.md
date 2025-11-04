# Quick Vercel Deployment Checklist

## Before You Deploy

### 1. Files Ready ✅
- [x] `vercel.json` created in root directory
- [x] `package.json` has proper build scripts
- [x] `.gitignore` excludes `.env.local` and other sensitive files
- [x] Code pushed to Git repository

### 2. Environment Variables to Set in Vercel

Go to **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**

Add these variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Supabase PostgreSQL connection | `postgresql://postgres:PASS@db.xxx.supabase.co:5432/postgres?sslmode=require` |
| `NEXTAUTH_URL` | Your Vercel deployment URL | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | Random secret (32+ chars) | Generate with `openssl rand -base64 32` |
| `AUTH_SECRET` | Same as NEXTAUTH_SECRET | Same as above |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `RESEND_API_KEY` | Resend API key | `re_xxxxx` |

### 3. Generate Secrets

Run this command to generate secure secrets:
```bash
openssl rand -base64 32
```

Use the output for both `NEXTAUTH_SECRET` and `AUTH_SECRET`.

### 4. Database Migrations

Before first deployment, run migrations:

```bash
cd web
DATABASE_URL="your-production-database-url" npm run prisma:migrate deploy
```

Or run SQL manually in Supabase Dashboard → SQL Editor.

### 5. Deploy Steps

1. **Connect Repository:**
   - Go to vercel.com/dashboard
   - Click "Add New Project"
   - Import your Git repository

2. **Configure Project:**
   - Root Directory: `web` (or use vercel.json)
   - Framework: Next.js (auto-detected)

3. **Add Environment Variables:**
   - Copy all variables from the table above
   - Set `NEXTAUTH_URL` to your Vercel URL after first deployment

4. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete

5. **Update NEXTAUTH_URL:**
   - After first deployment, get your Vercel URL
   - Update `NEXTAUTH_URL` environment variable in Vercel
   - Redeploy

### 6. Post-Deployment

- [ ] Test homepage loads
- [ ] Test user signup/login
- [ ] Test listing creation
- [ ] Test image uploads
- [ ] Create admin user
- [ ] Test admin panel

## Troubleshooting

**Build fails?**
- Check build logs in Vercel
- Verify all environment variables are set
- Ensure `DATABASE_URL` is correct

**Database errors?**
- Check Supabase project is active
- Verify migrations ran successfully
- Check connection string format

**Auth not working?**
- Verify `NEXTAUTH_URL` matches your deployment URL
- Check `NEXTAUTH_SECRET` and `AUTH_SECRET` are set and identical

**Images not loading?**
- Check Supabase Storage bucket is public
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set

See `docs/VERCEL_DEPLOYMENT.md` for detailed guide.

