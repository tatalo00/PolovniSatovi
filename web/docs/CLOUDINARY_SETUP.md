# Cloudinary Setup Guide

This guide will help you configure Cloudinary for image uploads in the PolovniSatovi application.

## Step 1: Create a Cloudinary Account

1. Go to [https://cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. Sign up for a free account (it's free forever with generous limits)
3. Verify your email address

## Step 2: Get Your API Credentials

After signing up and logging in:

1. Go to your **Dashboard** (you'll be redirected there after signup)
2. Look for the **"Account Details"** section
3. You'll see three important values:
   - **Cloud Name** (e.g., `dxyz123abc`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz123456`)
4. Click on "Reveal" next to API Secret to see it (you'll need it)

## Step 3: Add Credentials to Your Environment File

Open your `.env.local` file in the `web` directory and add your Cloudinary credentials:

```env
# Cloudinary (add these lines)
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

**Important:** 
- Replace `your_cloud_name_here`, `your_api_key_here`, and `your_api_secret_here` with your actual values from Step 2
- Do NOT commit `.env.local` to git (it should already be in `.gitignore`)

## Step 4: Verify Installation

Make sure the Cloudinary package is installed:

```bash
cd web
npm install cloudinary
```

If you see "up to date" or "added 1 package", you're good to go!

## Step 5: Restart Your Development Server

After adding the credentials:

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

## Troubleshooting

### Error: "Cloudinary nije konfigurisan"
- Check that all three environment variables are set in `.env.local`
- Make sure there are no extra spaces around the `=` sign
- Restart your development server after adding the variables

### Error: "Invalid API credentials"
- Double-check that you copied the credentials correctly from Cloudinary Dashboard
- Make sure you're using the API Secret (not the API Key) for `CLOUDINARY_API_SECRET`
- Verify your Cloudinary account is active

### Images not uploading
- Check the browser console (F12) for detailed error messages
- Make sure you're logged in (authentication is required)
- Verify your Cloudinary account hasn't exceeded its free tier limits

## Free Tier Limits

Cloudinary's free tier includes:
- 25 GB storage
- 25 GB monthly bandwidth
- 25,000 transformations per month

This is more than enough for development and small to medium applications!

## Security Notes

- Never share your API Secret publicly
- Keep your `.env.local` file secure
- Use environment variables in production (not hardcoded values)
- Consider using Cloudinary's signed uploads (already implemented in this app)

## Need Help?

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Cloudinary Support](https://support.cloudinary.com/)
- Check the browser console for detailed error messages

