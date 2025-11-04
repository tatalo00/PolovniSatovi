# Local Production Build Test

This guide shows you how to test your production build locally before deploying to Vercel.

## Quick Test Commands

### Option 1: Simple Build Test (Recommended)

```bash
cd web
npm install
npm run prisma:generate
npm run build
```

This will:
- Install all dependencies
- Generate Prisma client
- Build the production version
- Show any build errors

**If build succeeds:** You're ready to deploy! ✅

**If build fails:** Fix the errors before deploying.

### Option 2: Full Production Test (with server)

```bash
cd web
npm install
npm run prisma:generate
npm run build
npm run start
```

Then open http://localhost:3000 in your browser.

**Note:** This requires:
- `.env.local` file with all environment variables
- Database connection working
- All environment variables set

## Step-by-Step Process

### 1. Ensure Environment Variables Are Set

Make sure your `web/.env.local` file has:

```env
DATABASE_URL=your-database-url
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret
AUTH_SECRET=your-secret
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-key
RESEND_API_KEY=your-resend-key
```

### 2. Install Dependencies

```bash
cd web
npm install
```

### 3. Generate Prisma Client

```bash
npm run prisma:generate
```

This simulates what happens during Vercel build.

### 4. Run Production Build

```bash
npm run build
```

**What to look for:**
- ✅ No errors
- ✅ Build completes successfully
- ✅ No missing module errors
- ✅ No Turbopack warnings (should use webpack)

### 5. (Optional) Test Production Server

```bash
npm run start
```

Then visit http://localhost:3000

**Note:** Some features might not work without proper environment variables (like emails).

## Common Build Errors & Fixes

### Error: "Cannot find module 'xxx'"
**Fix:** Move the package from `devDependencies` to `dependencies` in `package.json`

### Error: "Prisma Client not generated"
**Fix:** Run `npm run prisma:generate` before build

### Error: "Turbopack build failed"
**Fix:** Ensure `package.json` has `"build": "next build --webpack"`

### Error: "Missing environment variable"
**Fix:** Add the variable to `.env.local` or check if it's needed for build

## Pre-Deployment Checklist

Run these commands and verify:

```bash
cd web

# 1. Clean install (simulates Vercel)
rm -rf node_modules package-lock.json
npm install

# 2. Generate Prisma client
npm run prisma:generate

# 3. Build production
npm run build

# 4. (Optional) Test production server
npm run start
```

## What the Build Process Does

1. **Installs dependencies** - Same as Vercel
2. **Runs postinstall** - Generates Prisma client automatically
3. **Explicit Prisma generate** - Ensures client is ready
4. **Runs Next.js build** - Creates optimized production bundle

## If Build Succeeds Locally

✅ Your code is ready for Vercel deployment!

The build process on Vercel will be identical, so if it works locally, it should work on Vercel.

## If Build Fails Locally

❌ Fix the errors before deploying:

1. Check error messages carefully
2. Verify all dependencies are in correct `dependencies` vs `devDependencies`
3. Ensure environment variables are set (if needed for build)
4. Check that all imports are correct
5. Fix any TypeScript/ESLint errors

## Quick Reference

```bash
# Full test sequence
cd web
npm install
npm run prisma:generate
npm run build
npm run start  # Test at http://localhost:3000
```

**Tip:** You can add this as a script in `package.json`:
```json
"test:build": "npm run prisma:generate && npm run build"
```

Then run: `npm run test:build`

