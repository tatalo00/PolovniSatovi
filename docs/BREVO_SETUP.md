# Brevo Email Setup

This project now uses [Brevo](https://www.brevo.com) for transactional email (forgot password, contact requests, welcome emails, etc.). Follow the steps below to configure it locally and in production.

## 1. Create a Brevo Account
1. Sign up at [https://www.brevo.com](https://www.brevo.com/) if you don’t already have an account.
2. Complete the onboarding steps and verify your email/domain as required.

## 2. Generate an API Key
1. In the Brevo dashboard, go to **SMTP & API**.
2. Click **Create a New API Key**.
3. Choose a descriptive name (e.g. `PolovniSatovi Production`).
4. Copy the generated key – it will only be shown once.

## 3. Configure Environment Variables
Add the API key to your environments:

### Local `.env.local`
```env
BREVO_API_KEY=brevo_your_api_key_here
```

### Vercel / Production
Go to your project **Settings → Environment Variables** and add:
```text
BREVO_API_KEY  brevo_your_api_key_here
```

> **Tip:** Store separate keys for development, staging, and production.

## 4. Test the Integration Locally
1. Restart your dev server after updating `.env.local`.
2. Trigger the **Forgot Password** flow from the UI – the email should arrive within a minute.
3. Check Brevo’s **Transactional → Logs** to confirm the message was delivered.

## 5. Recommended Settings
- Enable **tracking & analytics** in Brevo if you need delivery/open metrics.
- Configure **default sender** information that matches your domain (e.g. `noreply@polovnisatovi.com`).
- Set up **DMARC/SPF/DKIM** records for better deliverability (Brevo provides DNS instructions).

## 6. Rotating / Revoking Keys
If a key is compromised or you need to rotate credentials:
1. Generate a new key in Brevo.
2. Update the environment variables in all environments.
3. Remove the old key from Brevo to prevent further use.

That’s it! All transactional emails in this project now depend on `BREVO_API_KEY`. If emails fail to send, check:
- The key is present and correct in the environment.
- The account has not reached its monthly email quota.
- Brevo logs for any reported errors.
