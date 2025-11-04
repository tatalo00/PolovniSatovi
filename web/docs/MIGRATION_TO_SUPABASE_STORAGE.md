# Migration to Supabase Storage - Setup Instructions

The application has been migrated from Cloudinary to Supabase Storage for image uploads. Follow these steps to complete the setup:

## Step 1: Create Storage Bucket in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on **Storage** in the left sidebar
4. Click **Create a new bucket**
5. Create a bucket with these settings:
   - **Name:** `listings` (must match exactly)
   - **Public bucket:** ✅ **Yes** (check this box - images need to be publicly accessible)
   - Click **Create bucket**

## Step 2: Set Up Storage Policies

After creating the bucket, you need to set up security policies:

### Policy 1: Allow Authenticated Uploads

1. Click on the `listings` bucket
2. Go to **Policies** tab
3. Click **New Policy**
4. Select **Create a policy from scratch** or use the SQL editor
5. Create an INSERT policy:
   - **Policy name:** `Allow authenticated uploads`
   - **Allowed operation:** `INSERT`
   - **Target roles:** `authenticated`
   - **USING expression:** `(bucket_id = 'listings'::text)`
   - **WITH CHECK expression:** `(bucket_id = 'listings'::text) AND ((auth.role() = 'authenticated'::text))`
   - Click **Save**

### Policy 2: Allow Public Reads

1. Still in the Policies tab, click **New Policy** again
2. Create a SELECT policy:
   - **Policy name:** `Allow public reads`
   - **Allowed operation:** `SELECT`
   - **Target roles:** `anon`, `authenticated`
   - **USING expression:** `(bucket_id = 'listings'::text)`
   - Click **Save**

## Step 3: Get Your Supabase Credentials

1. In Supabase Dashboard, go to **Settings** → **API**
2. You'll find:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

## Step 4: Add Environment Variables

Add these to your `.env.local` file in the `web` directory:

```env
# Supabase Storage (for image uploads)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

**Important:**
- Replace `xxxxx` with your actual Supabase project reference
- Replace `eyJ...` with your actual anon key
- These must start with `NEXT_PUBLIC_` because they're used in client-side code
- Don't commit `.env.local` to git (it should already be in `.gitignore`)

## Step 5: Restart Your Development Server

After adding the environment variables:

1. Stop your development server (Ctrl+C)
2. Start it again:
   ```bash
   npm run dev
   ```

## Step 6: Test Image Upload

1. Go to your application
2. Sign in to your account
3. Navigate to "Create Listing" or edit an existing listing
4. Try uploading an image - it should work now!
5. Check Supabase Dashboard → Storage → listings bucket to see your uploaded files

## Troubleshooting

### Error: "Storage bucket not found"
- ✅ Make sure you created the bucket with the exact name `listings`
- ✅ Check it's set to **public** (important!)

### Error: "new row violates row-level security policy"
- ✅ Check your storage policies are set up correctly (Step 2)
- ✅ Make sure you have both INSERT and SELECT policies
- ✅ Verify the user is authenticated (signed in)

### Error: "Invalid API key" or "Missing Supabase environment variables"
- ✅ Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set correctly
- ✅ Make sure they start with `NEXT_PUBLIC_`
- ✅ Restart your development server after adding them

### Images not uploading
- ✅ Check the browser console (F12) for detailed error messages
- ✅ Make sure you're logged in (authentication is required)
- ✅ Verify your Supabase project is active
- ✅ Check that the bucket is public

## What Changed?

- ✅ Image uploads now use Supabase Storage instead of Cloudinary
- ✅ Upload endpoint changed from `/api/upload/signature` to `/api/upload/supabase`
- ✅ No more Cloudinary credentials needed
- ✅ All images are stored in your Supabase project

## Benefits

- ✅ Free tier: 1 GB storage, 2 GB bandwidth/month
- ✅ Integrated with your existing Supabase setup
- ✅ No additional accounts needed
- ✅ Easy to upgrade later if needed

## Image Transformations

Supabase Storage supports image transformations via URL parameters:
```
https://your-project.supabase.co/storage/v1/object/public/listings/image.jpg?width=800&height=600&resize=cover
```

This is useful for thumbnails and optimized images. You can add this feature later if needed.

## Need Help?

- Check the browser console (F12) for detailed error messages
- Verify all steps above are completed
- Check Supabase Dashboard to ensure bucket and policies are set up correctly

