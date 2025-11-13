# PolovniSatovi - Marketplace for Used Watches

A full-stack marketplace application built with Next.js 16, TypeScript, Prisma, and Supabase.

## Quick Start

### Local Development

```bash
cd web
npm install
cp .env.example .env.local  # Configure your environment variables
npm run prisma:generate
npm run prisma:migrate deploy
npm run dev
```

### Deployment to Vercel

1. Push code to Git repository
2. Import project in Vercel dashboard
3. Set Root Directory to `web` (or use `vercel.json`)
4. Add environment variables (see `docs/VERCEL_DEPLOYMENT.md`)
5. Deploy!

See `VERCEL_DEPLOYMENT_CHECKLIST.md` for quick reference.

## Documentation

- **Deployment**: `docs/VERCEL_DEPLOYMENT.md` or `VERCEL_DEPLOYMENT_CHECKLIST.md`
- **Environment Variables**: `docs/ENVIRONMENT.md`
- **Setup**: `SETUP.md`
- **Features**: `FEATURES.md`
- **Troubleshooting**: `TROUBLESHOOTING.md`

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Auth**: NextAuth.js v5
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Storage**: Supabase Storage
- **Email**: Brevo

## Project Structure

```
web/
├── app/              # Next.js App Router pages
├── components/       # React components
├── lib/             # Utility libraries
├── prisma/          # Database schema and migrations
└── public/          # Static assets
```

## License

[Add your license here]

