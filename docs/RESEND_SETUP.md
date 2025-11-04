# Resend Setup Guide

This guide will help you configure Resend for email functionality (password reset, contact form, listing notifications) in the PolovniSatovi application.

## Step 1: Create a Resend Account

1. Go to [https://resend.com](https://resend.com)
2. Click **"Sign Up"** or **"Get Started"**
3. Sign up with your email address (or use GitHub/Google OAuth)
4. Verify your email address if prompted

## Step 2: Get Your API Key

After signing up and logging in:

1. Go to your **Dashboard** (you'll be redirected there after signup)
2. Look for **"API Keys"** in the left sidebar menu
3. Click on **"API Keys"**
4. Click **"Create API Key"** button
5. Give it a name (e.g., "PolovniSatovi Development" or "Local Development")
6. Select permissions:
   - **Sending access** - Full access (recommended for development)
   - Or **Sending access** - Read & Write (for production)
7. Click **"Add"** or **"Create"**
8. **IMPORTANT:** Copy the API key immediately - it starts with `re_` and looks like `re_123456789abcdefghijklmnopqrstuvwxyz`
   - ⚠️ You won't be able to see this key again after closing the dialog!
   - If you lose it, you'll need to create a new API key

## Step 3: Add API Key to Your Environment File

Open your `.env.local` file in the `web` directory and add your Resend API key:

```env
# Email (Resend)
RESEND_API_KEY=re_your_api_key_here
```

**Important:** 
- Replace `re_your_api_key_here` with your actual API key from Step 2
- Do NOT include quotes around the API key value
- Do NOT commit `.env.local` to git (it should already be in `.gitignore`)

Example:
```env
RESEND_API_KEY=re_123456789abcdefghijklmnopqrstuvwxyz
```

## Step 4: Verify Installation

Make sure the Resend package is installed:

```bash
cd web
npm list resend
```

If you see `resend@` followed by a version number, you're good to go!

If not, install it:
```bash
npm install resend
```

## Step 5: Restart Your Development Server

After adding the API key:

1. Stop your development server (Ctrl+C)
2. Start it again:
   ```bash
   npm run dev
   ```

## Step 6: Test Email Functionality

Now you can test:

1. **Forgot Password:**
   - Go to `/auth/forgot-password`
   - Enter your email
   - Check your email inbox for the reset link

2. **Contact Seller:**
   - Go to any listing detail page
   - Fill out the contact form
   - The seller should receive an email

3. **Listing Approval/Rejection:**
   - As an admin, approve or reject a listing
   - The seller should receive an email notification

## Step 7: Domain Setup (Optional - for Production)

**Note:** For development, Resend allows you to send emails from `onboarding@resend.dev` automatically. However, for production:

1. Go to **"Domains"** in Resend dashboard
2. Click **"Add Domain"**
3. Add your domain (e.g., `polovnisatovi.com`)
4. Follow DNS setup instructions to verify domain ownership
5. Update the `from` email in `web/lib/email.ts` to use your verified domain

Example:
```typescript
from: "PolovniSatovi <noreply@polovnisatovi.com>"
```

## Resend Free Tier Limits

Resend offers a generous free tier:
- **100 emails/day** - Perfect for development and testing
- **3,000 emails/month** - Good for small applications
- No credit card required

For production, consider upgrading to a paid plan if you need more.

## Troubleshooting

### Error: "Missing API key. Pass it to the constructor `new Resend("re_123")`"
- ✅ Make sure `RESEND_API_KEY` is set in your `.env.local` file
- ✅ Check that the API key starts with `re_`
- ✅ Verify there are no extra spaces or quotes around the API key
- ✅ Restart your development server after adding the key

### Error: "RESEND_API_KEY environment variable is not set"
- ✅ Check that `.env.local` is in the `web/` directory (same level as `package.json`)
- ✅ Verify the file is named exactly `.env.local` (not `.env.local.txt`)
- ✅ Make sure the variable name is exactly `RESEND_API_KEY` (case-sensitive)

### Emails not being received
- ✅ Check your spam/junk folder
- ✅ Verify the email address is correct
- ✅ Check Resend dashboard → **Logs** to see if emails were sent
- ✅ Make sure you haven't exceeded the free tier limit (100 emails/day)

### "Domain not verified" error
- ✅ For development, you can use `onboarding@resend.dev` automatically
- ✅ For production, verify your domain in Resend dashboard → Domains
- ✅ Update the `from` email in `web/lib/email.ts` to match your verified domain

## Need Help?

- Resend Documentation: https://resend.com/docs
- Resend Support: https://resend.com/support
- Check Resend Dashboard → Logs to see email sending status

