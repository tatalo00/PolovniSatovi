# Repository Guidelines

## Project Structure & Module Organization
- `web/app/`: Next.js App Router pages and route handlers.
- `web/components/`: Reusable React components grouped by feature.
- `web/lib/`: Server/client utilities (auth, listings, validation, etc.).
- `web/prisma/`: Prisma schema, migrations, and seed scripts.
- `web/public/`: Static assets (images, icons).
- `docs/` and `web/docs/`: Project and deployment guidance.

## Build, Test, and Development Commands
Run commands from `web/` unless noted.
- `npm run dev`: Start the Next.js dev server on port 3001.
- `npm run build`: Production build for the web app.
- `npm run start`: Run the production server after build.
- `npm run lint`: ESLint checks.
- `npm run test:build`: Prisma generate + Next.js build for release readiness.
- `npm run prisma:migrate:dev`: Run local migrations against dev DB.
- `npm run prisma:seed`: Seed the database with initial data.

## Coding Style & Naming Conventions
- Language: TypeScript + React (Next.js App Router).
- Indentation: follow existing files (2-space in most TS/TSX).
- Components: `PascalCase` component names; filenames typically `kebab-case.tsx`.
- Routes: `web/app/**/page.tsx` and `web/app/api/**/route.ts` follow Next.js conventions.
- Linting: `eslint` via `npm run lint`.

## Testing Guidelines
- No dedicated unit test framework in repo; use scripted and manual checks.
- Follow `web/docs/TESTING.md` for required build and functional checks.
- Build verification: `npm run test:build` before deployments.

## Commit & Pull Request Guidelines
- Commit messages are short, imperative, and sentence case (e.g., “Optimize dashboard…”).
- Merge commits from PRs are acceptable; keep history tidy.
- For PRs, include: clear summary, testing notes (commands run), and UI screenshots when visual changes are made.

## Configuration & Secrets
- Local env lives in `web/.env.local` (see `web/docs/ENVIRONMENT.md`).
- Prisma and Supabase configuration details are in `web/docs/`.
