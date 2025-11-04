# How to Test Build Before Deployment

## Step 1: Fix TypeScript Error (if any)

First, ensure there are no TypeScript errors. The build will fail if there are any.

## Step 2: Run Build Test

Open your terminal in the project root and run:

```bash
cd web
npm run test:build
```

This command will:
1. Generate Prisma client (`prisma generate`)
2. Build the Next.js application (`next build --webpack`)
3. Check for TypeScript errors
4. Verify all route files compile correctly

**What to look for:**
- ✅ "Compiled successfully" message
- ✅ No TypeScript errors
- ✅ Build completes without errors
- ❌ If you see "Failed to compile" - fix the errors before proceeding

## Step 3: Test Production Build Locally

After a successful build, test the production version:

```bash
cd web
npm run build
npm run start
```

Then visit `http://localhost:3000` and test:
- Homepage loads
- Can navigate between pages
- No console errors in browser
- No errors in terminal

## Step 4: Quick Checklist

Before deploying to Vercel, verify:

- [ ] Build succeeds (`npm run test:build`)
- [ ] Production build runs locally (`npm run build && npm run start`)
- [ ] All environment variables are set in `.env.local`
- [ ] Database connection works
- [ ] No TypeScript errors
- [ ] No linter errors (`npm run lint` if configured)

## Step 5: Environment Variables Check

Make sure these are set in `.env.local`:
- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_URL`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Common Issues

**Build fails with "supabase is possibly null"**
- Fix: Add null check before using supabase

**Build fails with "route.ts is not a module"**
- Fix: Ensure route files have content (not empty)

**Build fails with Prisma errors**
- Fix: Run `npm run prisma:generate` first

**Build succeeds but app crashes at runtime**
- Check environment variables
- Check database connection
- Check server logs for errors

## Ready for Deployment

Once `npm run test:build` succeeds without errors, you're ready to deploy to Vercel!

