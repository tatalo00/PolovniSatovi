# Supabase Storage Setup Guide

This guide will help you configure Supabase Storage for image uploads instead of Cloudinary.

## Step 1: Enable Storage in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on **Storage** in the left sidebar
4. Click **Create a new bucket**
5. Create a bucket named `listings` with these settings:
   - **Name:** `listings`
   - **Public bucket:** ✅ Yes (so images can be accessed publicly)
   - Click **Create bucket**

## Step 2: Set Up Storage Policies

1. After creating the bucket, click on it
2. Go to **Policies** tab
3. Click **New Policy**
4. Create a policy for uploading:
   - **Policy name:** `Allow authenticated uploads`
   - **Allowed operation:** INSERT
   - **Target roles:** authenticated
   - **Policy definition:** 
     ```sql
     (bucket_id = 'listings'::text) AND ((auth.role() = 'authenticated'::text))
     ```
   - Click **Save**

5. Create another policy for reading:
   - **Policy name:** `Allow public reads`
   - **Allowed operation:** SELECT
   - **Target roles:** anon, authenticated
   - **Policy definition:**
     ```sql
     (bucket_id = 'listings'::text)
     ```
   - Click **Save**

## Step 3: Get Your Supabase Credentials

1. In Supabase Dashboard, go to **Settings** → **API**
2. You'll need:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## Step 4: Install Supabase Client

```bash
cd web
npm install @supabase/supabase-js
```

## Step 5: Add Environment Variables

Add these to your `.env.local` file:

```env
# Supabase Storage (you already have the database URL)
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**Important:** These must start with `NEXT_PUBLIC_` because they're used in client-side code.

## Step 6: Update Image Upload Implementation

We'll need to create a new Supabase storage upload component. This will replace the Cloudinary upload component.

### Create Supabase Client

Create `lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Update API Route

Create `app/api/upload/supabase/route.ts`:
```typescript
import "server-only";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // For server-side operations
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from('listings')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: { publicUrl } } = supabase.storage
      .from('listings')
      .getPublicUrl(filePath);

    return NextResponse.json({ 
      url: publicUrl,
      path: filePath 
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
```

## Step 7: Update Image Upload Component

The component will need to be updated to use the Supabase upload endpoint instead of Cloudinary.

## Step 8: Test

1. Restart your development server
2. Try uploading an image
3. Check Supabase Dashboard → Storage → listings bucket to see your uploaded files

## Troubleshooting

### Error: "Storage bucket not found"
- Make sure you created the bucket with the exact name `listings`
- Check it's set to public

### Error: "new row violates row-level security policy"
- Check your storage policies are set up correctly (Step 2)
- Make sure the user is authenticated

### Error: "Invalid API key"
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
- Make sure they start with `NEXT_PUBLIC_`

## Image Transformations

Supabase Storage supports image transformations via URL parameters:
```
https://your-project.supabase.co/storage/v1/object/public/listings/image.jpg?width=800&height=600&resize=cover
```

This is useful for thumbnails and optimized images.

## Need Help?

I can help you implement the Supabase Storage upload component. Just let me know!

