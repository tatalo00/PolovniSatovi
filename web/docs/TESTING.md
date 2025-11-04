# Testing Guide

## 1. Build Test (Required Before Deployment)

First, verify that the project builds successfully:

```bash
cd web
npm run test:build
```

This will:
- Generate Prisma client
- Build the Next.js application
- Check for TypeScript errors
- Verify all route files are valid

**Expected Result**: Build completes without errors.

---

## 2. Development Server Test

Start the development server and check for runtime errors:

```bash
cd web
npm run dev
```

Visit `http://localhost:3000` and check:
- ✅ Homepage loads without errors
- ✅ No console errors in browser DevTools
- ✅ No errors in terminal

---

## 3. Authentication Testing

### Sign Up
1. Go to `/auth/signup`
2. Create a new account
3. Verify email verification works (if configured)
4. Check that you're redirected after signup

### Sign In
1. Go to `/auth/signin`
2. Sign in with existing credentials
3. Verify session is created
4. Check redirect to dashboard

### Forgot Password
1. Go to `/auth/forgot-password`
2. Enter your email
3. Check email is sent (check Resend dashboard or logs)
4. Click reset link in email
5. Set new password
6. Verify you can sign in with new password

---

## 4. Listings API Testing

### Create Listing (POST `/api/listings`)
```bash
# While logged in, test via browser console or Postman
fetch('/api/listings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: "Test Watch",
    brand: "Rolex",
    model: "Submariner",
    condition: "Excellent",
    priceEurCents: 1050000,
    photos: []
  })
})
```

**Expected**: Listing created with status "DRAFT"

### Get Listings (GET `/api/listings`)
```bash
# Visit: http://localhost:3000/api/listings
# Or: http://localhost:3000/api/listings?status=APPROVED&brand=Rolex
```

**Expected**: Returns list of approved listings (or filtered by status)

### Update Listing (PATCH `/api/listings/[id]`)
```bash
# Update your own listing
fetch('/api/listings/[listing-id]', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: "Updated Title"
  })
})
```

**Expected**: Listing updated successfully

### Submit for Approval (POST `/api/listings/[id]/submit`)
```bash
# Submit a DRAFT listing
fetch('/api/listings/[listing-id]/submit', {
  method: 'POST'
})
```

**Expected**: Status changes from "DRAFT" to "PENDING"

### Report Listing (POST `/api/listings/[id]/report`)
```bash
# Report someone else's listing
fetch('/api/listings/[listing-id]/report', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    reason: "This listing violates rules"
  })
})
```

**Expected**: Report created with status "OPEN"

---

## 5. Admin Functionality Testing

### Access Admin Dashboard
1. Sign in as admin user
2. Go to `/admin`
3. Verify dashboard loads
4. Check pending listings count

### Approve Listing (POST `/api/admin/listings/[id]/approve`)
```bash
# As admin, approve a pending listing
fetch('/api/admin/listings/[listing-id]/approve', {
  method: 'POST'
})
```

**Expected**: 
- Listing status changes to "APPROVED"
- Email sent to seller (check logs)

### Reject Listing (POST `/api/admin/listings/[id]/reject`)
```bash
# As admin, reject a pending listing
fetch('/api/admin/listings/[listing-id]/reject', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    reason: "Image quality too low"
  })
})
```

**Expected**: 
- Listing status changes to "REJECTED"
- Email sent to seller with reason

### Close Report (PATCH `/api/admin/reports/[id]`)
```bash
# As admin, close a report
fetch('/api/admin/reports/[report-id]', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: "CLOSED"
  })
})
```

**Expected**: Report status changes to "CLOSED"

---

## 6. User Profile Testing

### Update Profile (PATCH `/api/user/profile`)
```bash
fetch('/api/user/profile', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: "New Name",
    locationCity: "Belgrade",
    locationCountry: "RS"
  })
})
```

**Expected**: Profile updated successfully

---

## 7. Seller Profile Testing

### Create Seller Profile (POST `/api/seller/profile`)
```bash
fetch('/api/seller/profile', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    storeName: "My Watch Store",
    locationCountry: "RS",
    locationCity: "Belgrade",
    description: "Selling luxury watches"
  })
})
```

**Expected**: Seller profile created

### Update Seller Profile (PATCH `/api/seller/profile`)
```bash
fetch('/api/seller/profile', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    storeName: "Updated Store Name"
  })
})
```

**Expected**: Seller profile updated

---

## 8. Image Upload Testing

### Upload Image (POST `/api/upload/supabase`)
1. Go to `/dashboard/listings/new`
2. Try uploading an image
3. Verify image appears in Supabase Storage
4. Check image URL is returned

**Expected**: Image uploaded successfully and URL returned

---

## 9. Frontend Page Testing

### Homepage (`/`)
- ✅ Hero section displays
- ✅ Featured listings load
- ✅ Categories display
- ✅ No errors in console

### Listings Page (`/listings`)
- ✅ Listings grid displays
- ✅ Filters work (brand, search, price)
- ✅ Pagination (if implemented)

### Listing Detail (`/listing/[id]`)
- ✅ Listing details display
- ✅ Seller information shows
- ✅ Photos display correctly
- ✅ Report button works (if logged in)

### Dashboard (`/dashboard`)
- ✅ User's listings display
- ✅ Can create new listing
- ✅ Can edit own listings
- ✅ Can delete own listings

### Admin Pages
- ✅ `/admin` - Dashboard loads
- ✅ `/admin/listings` - Pending listings queue
- ✅ `/admin/reports` - Reports list
- ✅ Can approve/reject listings
- ✅ Can close reports

---

## 10. Error Handling Testing

### Test Unauthorized Access
1. Sign out
2. Try accessing `/api/listings` with POST
3. **Expected**: 401 Unauthorized error

### Test Forbidden Access
1. Sign in as regular user
2. Try accessing `/api/admin/listings/[id]/approve`
3. **Expected**: 403 Forbidden error

### Test Invalid Data
1. Try creating listing with invalid data (empty title, negative price)
2. **Expected**: 400 Bad Request with validation error message

---

## 11. Database Testing

### Verify Prisma Connection
```bash
cd web
npx prisma studio
```

Opens Prisma Studio to browse database:
- Check users table
- Check listings table
- Check reports table
- Verify relationships work

---

## 12. Environment Variables Check

Verify all required environment variables are set:

```bash
# Check .env.local has:
- DATABASE_URL
- AUTH_SECRET
- AUTH_URL
- RESEND_API_KEY
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

## 13. Production Build Test

Before deploying to Vercel:

```bash
cd web
npm run build
npm run start
```

Test production build locally:
- Visit `http://localhost:3000`
- Test key functionality
- Check for runtime errors

---

## Quick Testing Checklist

- [ ] Build succeeds (`npm run test:build`)
- [ ] Dev server starts without errors
- [ ] Can sign up new user
- [ ] Can sign in
- [ ] Can reset password
- [ ] Can create listing
- [ ] Can update listing
- [ ] Can submit listing for approval
- [ ] Can report listing
- [ ] Admin can approve listing
- [ ] Admin can reject listing
- [ ] Admin can close report
- [ ] Can upload images
- [ ] Homepage displays correctly
- [ ] Listings page works
- [ ] No console errors
- [ ] No linter errors

---

## Troubleshooting

### Build Fails
- Check for TypeScript errors
- Verify all route files have content
- Run `npm run prisma:generate`

### API Routes Return 500
- Check database connection
- Check environment variables
- Check server logs in terminal

### Images Not Uploading
- Verify Supabase credentials
- Check storage bucket permissions
- Verify CORS settings

### Authentication Issues
- Check AUTH_SECRET is set
- Verify AUTH_URL matches your domain
- Check NextAuth configuration

