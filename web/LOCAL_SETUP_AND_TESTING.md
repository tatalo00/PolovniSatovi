# Local Setup and Testing Guide

This guide will help you run the PolovniSatovi application locally and test all features.

## Prerequisites

- Node.js 18+ installed
- npm or yarn installed
- Supabase project set up and running
- `.env.local` file configured with all required environment variables

## Step 1: Initial Setup (First Time Only)

### 1.1 Install Dependencies

```bash
cd web
npm install
```

### 1.2 Verify Environment Variables

Make sure your `web/.env.local` file has all required variables:

```env
# Database
DATABASE_URL="postgresql://postgres:PASSWORD@HOST:5432/postgres?sslmode=require"
DIRECT_URL="postgresql://postgres:PASSWORD@HOST:5432/postgres?sslmode=require"

# Supabase (for storage)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Resend (for emails)
RESEND_API_KEY="your-resend-api-key"
```

### 1.3 Generate Prisma Client

```bash
npm run prisma:generate
```

### 1.4 Verify Database is in Sync

```bash
npx prisma migrate status
```

Should show: "Database schema is up to date!"

If not, run:
```bash
npm run prisma:migrate
```

### 1.5 (Optional) Seed Test Data

```bash
npm run prisma:seed
```

This creates a demo seller and listing if your database is empty.

## Step 2: Start Development Server

```bash
npm run dev
```

The application will start at: **http://localhost:3000**

Open your browser and navigate to the URL.

## Step 3: Testing All Features

### 3.1 Create Test Accounts

#### Create a Seller Account:

1. Go to **http://localhost:3000**
2. Click **"Prijavi se"** (Sign In) or **"Registruj se"** (Register)
3. Register with:
   - Email: `seller@test.com`
   - Password: `test123`
   - Name: `Test Seller`
4. After registration, go to **Dashboard** → **Profil**
5. Complete your seller profile (store name, location, etc.)

#### Create a Buyer Account:

1. Open an **Incognito/Private window** or use a different browser
2. Register with:
   - Email: `buyer@test.com`
   - Password: `test123`
   - Name: `Test Buyer`

### 3.2 Test Listing Creation and Image Gallery

#### As a Seller:

1. **Login** as `seller@test.com`
2. Go to **Dashboard** → **Moji Oglasi** → **Novi Oglas**
3. Fill in the listing form:
   - Title: "Rolex Submariner 2020"
   - Brand: "Rolex"
   - Model: "Submariner"
   - Reference: "116610LN"
   - Year: 2020
   - Condition: "Odlično"
   - Price: 8500
   - Description: "Full set with box and papers"
   - Upload **multiple images** (at least 3-4)
4. Click **"Kreiraj Oglas"**
5. Wait for admin approval (or if you're admin, approve it yourself)

#### Test Image Gallery:

1. Go to **Oglasi** (Listings) page
2. Click on your newly created listing
3. **Test the image gallery:**
   - Click on thumbnails to change main image
   - Click on main image to open lightbox
   - Use arrow keys or swipe on mobile to navigate
   - Click outside or press ESC to close lightbox
   - Test on mobile viewport (resize browser or use DevTools)

### 3.3 Test Messaging System

#### As a Buyer:

1. **Login** as `buyer@test.com`
2. Browse listings and find one you like
3. Click on a listing to view details
4. Click **"Kontaktiraj Prodavca"** (Contact Seller)
5. Send a message: "Da li je sat još uvek dostupan?"
6. You'll be redirected to the messages page

#### As a Seller:

1. **Login** as `seller@test.com`
2. Check **Dashboard** → **Poruke** (Messages)
3. You should see the conversation with the buyer
4. Reply to the message
5. Test the conversation flow:
   - Messages appear in real-time order
   - Timestamps are shown
   - Unread badges appear
   - Thread list updates

#### Test Mobile Messaging:

1. Open on mobile device or use DevTools mobile view
2. Test the messages interface:
   - Thread list is scrollable
   - Touch targets are large enough
   - Message bubbles are readable
   - Keyboard doesn't cover input field

### 3.4 Test Reviews System

#### As a Buyer (after purchasing/contacting):

1. **Login** as `buyer@test.com`
2. Go to a listing you've interacted with
3. Scroll down to the **Reviews** section
4. Click **"Oceni Prodavca"** (Rate Seller)
5. Fill in the review:
   - Rating: 5 stars
   - Title: "Odličan prodavac!"
   - Comment: "Brz odgovor, ljubazna komunikacija, sat je u odličnom stanju."
6. Submit the review
7. Verify it appears on the listing page

#### Test Review Display:

1. View the listing page
2. Check that:
   - Reviews are displayed with ratings
   - Seller rating summary is shown
   - Review cards show reviewer info and timestamp
   - Only one review per user per listing

### 3.5 Test Mobile UI/UX

#### Responsive Design Testing:

1. **Open DevTools** (F12)
2. **Toggle device toolbar** (Ctrl+Shift+M)
3. Test different viewports:
   - iPhone SE (375px)
   - iPhone 12/13 (390px)
   - iPad (768px)
   - Desktop (1920px)

#### Test Mobile Features:

- **Homepage:**
  - Hero section is visible and responsive
  - Featured listings grid adapts to screen size
  - Statistics cards stack on mobile

- **Listings Page:**
  - Filters are accessible on mobile
  - Listing cards are touch-friendly
  - Search works on mobile

- **Listing Detail:**
  - Image gallery is swipeable
  - Price card is sticky on mobile
  - Contact form is easy to use
  - All buttons are large enough for touch

- **Dashboard:**
  - Navigation menu works on mobile
  - Forms are easy to fill
  - Tables are scrollable

### 3.6 Test Admin Features (if you have admin account)

1. **Create admin account:**
   ```bash
   npm run create:admin
   ```
   Follow prompts to create admin user

2. **Login as admin:**
   - Go to **Admin Dashboard**
   - Approve/reject listings
   - View reports
   - Manage users

## Step 4: Testing Checklist

### Core Features ✅

- [ ] User registration and login
- [ ] Seller profile creation
- [ ] Listing creation with multiple images
- [ ] Image gallery with thumbnails and lightbox
- [ ] Listing browsing and search
- [ ] Messaging between buyer and seller
- [ ] Review submission and display
- [ ] Mobile responsive design

### Mobile-Specific ✅

- [ ] Touch targets are at least 44x44px
- [ ] Forms are easy to fill on mobile
- [ ] Images are swipeable
- [ ] Navigation works on mobile
- [ ] Price card is sticky on listing page
- [ ] No horizontal scrolling
- [ ] Text is readable without zooming

### Edge Cases ✅

- [ ] Empty states (no listings, no messages)
- [ ] Error handling (network errors, invalid data)
- [ ] Loading states
- [ ] Image upload failures
- [ ] Database connection errors

## Step 5: Common Issues and Solutions

### Issue: "Cannot find module" errors

**Solution:**
```bash
cd web
rm -rf node_modules package-lock.json
npm install
npm run prisma:generate
```

### Issue: Database connection errors

**Solution:**
1. Check your `.env.local` file
2. Verify Supabase project is active
3. Test connection:
   ```bash
   npx prisma migrate status
   ```

### Issue: Images not uploading

**Solution:**
1. Verify Cloudinary credentials in `.env.local`
2. Check Cloudinary dashboard for upload limits
3. Verify image file size (should be < 10MB)

### Issue: Authentication not working

**Solution:**
1. Check `NEXTAUTH_URL` is `http://localhost:3000`
2. Verify `NEXTAUTH_SECRET` is set
3. Clear browser cookies and try again

### Issue: Messages not sending

**Solution:**
1. Check database connection
2. Verify both users are logged in
3. Check browser console for errors

## Step 6: Development Tips

### Hot Reload

The dev server supports hot reload. Changes to:
- React components → Auto-refresh
- API routes → Restart server (automatically)
- Prisma schema → Need to regenerate client

### Debugging

1. **Browser Console:**
   - Open DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for API calls

2. **Server Logs:**
   - Check terminal where `npm run dev` is running
   - Prisma logs are shown in development mode

3. **Database:**
   - Use Supabase SQL Editor to query database
   - Use Prisma Studio:
     ```bash
     npx prisma studio
     ```
     Opens at http://localhost:5555

### Testing Production Build Locally

```bash
npm run build
npm start
```

This builds and runs the production version locally.

## Step 7: Next Steps

After testing locally:

1. **Fix any bugs** you find
2. **Test on real mobile devices** if possible
3. **Check performance** (Lighthouse audit)
4. **Prepare for deployment** (see `VERCEL_DEPLOYMENT_CHECKLIST.md`)

## Quick Reference Commands

```bash
# Start dev server
npm run dev

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database
npm run prisma:seed

# Create admin user
npm run create:admin

# Open Prisma Studio
npx prisma studio

# Build for production
npm run build

# Run production build locally
npm start
```

## Testing URLs

- **Homepage:** http://localhost:3000
- **Listings:** http://localhost:3000/listings
- **Dashboard:** http://localhost:3000/dashboard
- **Messages:** http://localhost:3000/dashboard/messages
- **Admin:** http://localhost:3000/admin
- **Prisma Studio:** http://localhost:5555 (when running `npx prisma studio`)

Happy testing! 🎉

