# BD2US Student Platform

BD2US is a public-first planning platform for Bangladeshi students applying to U.S. colleges. It combines a readable guide, interactive roadmap, curated college explorer, search, optional private dashboard, editorial workspace, and saved offline reading.

The original static HTML/CSS/JS site remains in this repository as migration input. The production replacement is the Next.js app under `app/`, `components/`, and `lib/`.

## Stack

- Next.js App Router, TypeScript, Tailwind CSS
- Supabase Postgres, Auth, Storage-ready schema, SSR adapter, and RLS
- Vercel preview, staging, and production deployment

## Local Development

```bash
npm install
cp .env.example .env.local
npm run dev
```

The public experience works without environment variables. Add Supabase credentials to enable auth, synced workspaces, publishing, and stored contact messages.

## Important Routes

- `/roadmap`
- `/guide/[slug]`
- `/colleges` and `/colleges/[slug]`
- `/search`
- `/dashboard`
- `/resources`, `/faq`, `/about`, `/contact`
- `/admin`

Legacy `.html` routes permanently redirect from `next.config.ts`.

## Quality Checks

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

## Hosted Setup

Start with a Vercel preview. The public experience works before Supabase is configured, so accounts can be connected afterward without blocking the first deployment.

## Content Ownership

The original static pages remain the migration source for existing BD2US writing. The team controls content review, publishing decisions, and updates.
