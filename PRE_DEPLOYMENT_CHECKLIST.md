# Pre-Deployment Checklist

Use this checklist before pushing to git and deploying to production.

## 1. Code Quality & Testing

### Test All Features Locally
- [ ] **Toast Notifications**
  - [ ] Create/update listing → Success toast appears
  - [ ] Delete listing → Confirmation dialog → Success toast
  - [ ] Submit review → Success toast
  - [ ] Delete review → Confirmation dialog → Success toast
  - [ ] Send message → Success/error toast
  - [ ] Report listing → Success toast
  - [ ] Upload images (exceed limit) → Error toast
  - [ ] Form validation errors → Error toast

- [ ] **Confirmation Dialogs**
  - [ ] Delete listing → Dialog appears and works
  - [ ] Delete review → Dialog appears and works
  - [ ] Approve listing (admin) → Dialog appears and works
  - [ ] Reject listing (admin) → Dialog with textarea appears and works

- [ ] **Core Functionality**
  - [ ] User registration and login
  - [ ] Create/edit/delete listings
  - [ ] Image upload works
  - [ ] Messaging works
  - [ ] Reviews work (create, edit, delete)
  - [ ] Admin panel works

- [ ] **Mobile Testing** (use browser dev tools)
  - [ ] Toasts appear at bottom-center
  - [ ] Dialogs are usable on mobile
  - [ ] Navigation works on mobile
  - [ ] Forms are mobile-friendly

### Run Linting
```bash
cd web
npm run lint
```
- [ ] No linting errors

### Test Production Build
```bash
cd web
npm run build
```
- [ ] Build succeeds without errors
- [ ] No TypeScript errors
- [ ] No missing dependencies

## 2. Code Review

- [ ] **Review Recent Changes**
  - [ ] Toast notifications added to all necessary places
  - [ ] Confirmation dialogs replace all `confirm()` calls
  - [ ] No browser `alert()` or `prompt()` calls remain
  - [ ] Review deletion bug fixed (seller profile check)

- [ ] **Check for Console Errors**
  - [ ] Open browser console (F12)
  - [ ] Navigate through the app
  - [ ] No console errors or warnings

- [ ] **Check for TODO Comments**
  - [ ] Search for `TODO` or `FIXME` in code
  - [ ] Address or document any critical ones

## 3. Database & Migrations

- [ ] **Verify Database Schema**
  - [ ] All migrations are applied locally
  - [ ] Review model exists
  - [ ] MessageThread has updatedAt field

- [ ] **Test Database Operations**
  - [ ] Create/update/delete listings
  - [ ] Create/update/delete reviews
  - [ ] Send/receive messages
  - [ ] No database errors in console

## 4. Environment Variables

### Verify Local `.env.local` Has All Required Variables
- [ ] `DATABASE_URL` - Supabase connection string
- [ ] `DIRECT_URL` - Supabase direct connection (for migrations)
- [ ] `NEXTAUTH_URL` - Your local URL (http://localhost:3000)
- [ ] `NEXTAUTH_SECRET` - Random secret (32+ chars)
- [ ] `AUTH_SECRET` - Same as NEXTAUTH_SECRET
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- [ ] `RESEND_API_KEY` - Resend API key (for emails)

### Prepare Production Environment Variables
- [ ] Copy all variables for Vercel deployment
- [ ] Generate new `NEXTAUTH_SECRET` for production:
  ```bash
  openssl rand -base64 32
  ```
- [ ] Note: `NEXTAUTH_URL` will be set after first deployment

## 5. Git Operations

### Check Git Status
```bash
git status
```

- [ ] **Review Changes**
  - [ ] All changes are intentional
  - [ ] No sensitive files committed (.env.local, .env, etc.)
  - [ ] No build artifacts committed (.next, node_modules, etc.)

### Commit Changes
```bash
git add .
git commit -m "feat: Replace alerts with toast notifications and improve UX

- Install and configure sonner toast library
- Replace all alert() calls with toast notifications
- Replace confirm() calls with ConfirmDialog component
- Replace prompt() with proper dialog for admin rejection
- Fix review deletion error when seller profile doesn't exist
- Improve mobile UX with better toast positioning"
```

- [ ] Commit message is descriptive
- [ ] All relevant files are staged

### Push to Git
```bash
git push origin main
# or
git push origin master
```

- [ ] Code pushed successfully
- [ ] No merge conflicts

## 6. Pre-Deployment Verification

### Verify .gitignore
- [ ] `.env.local` is ignored
- [ ] `.env` is ignored  
- [ ] `.next/` is ignored
- [ ] `node_modules/` is ignored

### Check Package.json
- [ ] All dependencies are listed
- [ ] `sonner` is in dependencies
- [ ] Build scripts are correct

## 7. Documentation Updates

- [ ] Update `CHANGELOG.md` or `README.md` if needed
- [ ] Document new toast notification system
- [ ] Note any breaking changes (if any)

## 8. Deployment Preparation

### Before First Deployment
- [ ] Review `VERCEL_DEPLOYMENT_CHECKLIST.md`
- [ ] Prepare all environment variables for Vercel
- [ ] Ensure Supabase database is ready
- [ ] Plan database migration strategy

### Ready to Deploy?
- [ ] All items above checked
- [ ] Local testing passed
- [ ] Build succeeds
- [ ] Code committed and pushed
- [ ] Environment variables documented

## 9. Quick Test Commands

Run these before committing:

```bash
# Check for linting errors
cd web && npm run lint

# Test production build
cd web && npm run build

# Check for TypeScript errors
cd web && npx tsc --noEmit

# Verify no alert/confirm/prompt calls remain (manual check)
# Search for: alert(, confirm(, prompt(
```

## 10. Post-Deployment Testing

After deployment, test:
- [ ] Homepage loads
- [ ] Toast notifications work
- [ ] Confirmation dialogs work
- [ ] All features work as expected
- [ ] Mobile experience is good
- [ ] No console errors in production

---

**Remember:** Always test thoroughly locally before deploying to production!

