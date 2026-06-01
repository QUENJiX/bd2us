# Deploying BD2US

This guide is written for a first deployment. You do not need to configure every service at once.

## The Short Version

Deploy to a temporary Vercel URL first. Do not move `www.bd2us.app` yet.

For the first preview deployment, you only need:

1. A GitHub account.
2. A Vercel account.
3. This repository pushed to GitHub.
4. One Vercel environment variable:

```text
NEXT_PUBLIC_SITE_URL=https://YOUR-VERCEL-URL.vercel.app
```

The public guide, blog, roadmap, colleges, search, and guest progress work without Supabase.

## What Can Wait?

| Feature | Works on the first preview? | Extra setup needed later |
| --- | --- | --- |
| Homepage, guide chapters, blog, resources, FAQ, About | Yes | None |
| Roadmap for guests | Yes | None |
| College explorer | Yes | None |
| Search | Yes | None |
| Login and synced dashboard | Not yet | Supabase |
| Saved account data and admin publishing | Not yet | Supabase |
| Stored contact messages | Preview response only | Supabase |
| `www.bd2us.app` | Keep the current site for now | Domain cutover after review |

## Recommended Order

Use this order so that each step stays understandable:

1. Deploy a temporary Vercel preview.
2. Review the public pages on that temporary URL.
3. Connect Supabase for accounts and stored data.
4. Move `www.bd2us.app` only when you are happy with the preview.

---

## Step 1: Run One Final Local Check

Open PowerShell in the project folder and run:

```powershell
npm run lint
npm run typecheck
npm test
npm run build
```

Deployment is ready when all four commands finish without an error.

## Step 2: Put the Project on GitHub

Vercel deploys the project from a GitHub repository.

1. Go to [github.com/new](https://github.com/new).
2. Create a repository such as `bd2us`.
3. Keep it private if you do not want the code publicly visible.
4. Push this local project to that repository.

Do not upload `.env.local`. It contains secrets and is already ignored by Git.

If the repository is already on GitHub, skip this step.

## Step 3: Create the First Vercel Deployment

1. Sign in at [vercel.com](https://vercel.com/) with GitHub.
2. Click **New Project**.
3. Select the GitHub repository containing BD2US.
4. Vercel should detect **Next.js** automatically.
5. Open **Environment Variables**.
6. Add:

```text
Name: NEXT_PUBLIC_SITE_URL
Value: https://YOUR-VERCEL-URL.vercel.app
```

At this first step, it is okay to deploy once without this value, copy the URL Vercel gives you, add the variable, and redeploy.

7. Click **Deploy**.
8. Wait for the deployment to finish and open the temporary `.vercel.app` URL.

You now have a public preview. GitHub Pages cannot host this dynamic Next.js app, so the final site will be served by Vercel.

## Step 4: Review the Public Preview

Before adding accounts or moving the domain, open these pages:

```text
/
/roadmap
/guide/orientation
/guide/financial-aid
/colleges
/blog
/success-stories
/about
/contact
/search
/sitemap.xml
/rss.xml
```

Also try:

1. Switching light and dark mode.
2. Searching for `fee waiver`, `full scholarship`, and a typo such as `englsh proficency`.
3. Opening the site on your phone.
4. Clicking the important buttons and navigation links.

If you only want to show the redesigned public platform for review, you can stop here.

---

## Step 5: Connect Supabase

Supabase adds login, synced student progress, stored contact submissions, search analytics, and admin data.

### Create a Project

1. Sign in at [supabase.com](https://supabase.com/).
2. Click **New project**.
3. Choose a strong database password and save it somewhere secure.
4. Wait for the project to finish creating.

### Run the Database Setup

1. In Supabase, open **SQL Editor**.
2. Click **New query**.
3. Copy and run the complete contents of:

```text
supabase/migrations/202606010001_bd2us_platform.sql
```

4. Create another query.
5. Copy and run the complete contents of:

```text
supabase/migrations/202606010002_search_quality.sql
```

Run them in that order.

### Copy the Three Supabase Values

In Supabase, open the project's **Connect** dialog. You can also find the keys under **Settings** and then **API Keys**. Copy:

```text
Project URL
publishable key
secret key
```

The `secret` key is private. Never paste it into frontend code, GitHub, or a public message. Supabase may also show older `anon` and `service_role` keys under a legacy tab. The newer publishable and secret keys are the preferred choices.

### Add the Values to Vercel

In Vercel:

1. Open the BD2US project.
2. Go to **Settings** and then **Environment Variables**.
3. Add:

```text
NEXT_PUBLIC_SUPABASE_URL=your Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=your publishable key
SUPABASE_SERVICE_ROLE_KEY=your secret key
```

4. Apply the values to **Production**, **Preview**, and **Development** for now.
5. Redeploy the latest Vercel deployment.

### Configure Login Redirects

In Supabase:

1. Go to **Authentication**, then **URL Configuration**.
2. Set **Site URL** to your temporary Vercel URL.
3. Add this redirect URL:

```text
https://YOUR-VERCEL-URL.vercel.app/auth/callback
```

Later, add the production version too:

```text
https://www.bd2us.app/auth/callback
```

Email magic-link login now has the required backend configuration. Google login is optional and can be added later from Supabase Auth providers.

---

## Step 6: Move `www.bd2us.app`

Do this only after the Vercel preview looks right.

1. In Vercel, open **Settings** and then **Domains**.
2. Add:

```text
www.bd2us.app
```

3. Vercel will show the DNS record that must be added or updated where your domain is managed.
4. Make that DNS change.
5. In Vercel, change:

```text
NEXT_PUBLIC_SITE_URL=https://www.bd2us.app
```

6. Redeploy.
7. In Supabase Auth URL Configuration, set:

```text
Site URL: https://www.bd2us.app
Redirect URL: https://www.bd2us.app/auth/callback
```

Keep the temporary Vercel redirect URL too if you still use preview deployments.

DNS changes can take some time to appear everywhere. Keep the old GitHub Pages deployment untouched until the Vercel domain is working.

## Step 7: Final Checks After the Domain Move

Open:

```text
https://www.bd2us.app
https://www.bd2us.app/roadmap
https://www.bd2us.app/colleges
https://www.bd2us.app/blog
https://www.bd2us.app/sitemap.xml
https://www.bd2us.app/rss.xml
```

Then verify:

1. Old `.html` links redirect to their new pages.
2. Search works.
3. Magic-link login works if Supabase is connected.
4. Contact submissions are stored if Supabase is connected.
5. The site works on mobile.

Submit `https://www.bd2us.app/sitemap.xml` to [Google Search Console](https://search.google.com/search-console/about) after the domain is live.

---

## Environment Variable Reference

| Variable | Needed immediately? | What it does |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Yes | Tells the site its public address for sitemap, RSS, and links. |
| `NEXT_PUBLIC_SUPABASE_URL` | Later | Connects the browser to your Supabase project. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Later | Public Supabase key used with database access rules. |
| `SUPABASE_SERVICE_ROLE_KEY` | Later, keep secret | Private server-only Supabase key for trusted API routes. |

## Optional: Staging

You do not need a separate staging setup for your first deployment.

When you want a more formal release process:

1. Create a second Supabase project for staging.
2. Add a staging domain such as `staging.bd2us.app`.
3. Use staging environment values for testing.
4. Keep production data isolated from experiments.

## When Something Goes Wrong

Start with the Vercel deployment page and open the build logs.

Common issues:

| Problem | First thing to check |
| --- | --- |
| Build failed | Run `npm run build` locally and read the first error. |
| Login link returns to the wrong page | Check Supabase Auth Site URL and redirect URLs. |
| Contact form responds but nothing is saved | Check the three Supabase environment variables and redeploy. |
| Domain does not open | Check the DNS record Vercel requested and wait for propagation. |
| Old `.html` link does not redirect | Confirm the Vercel deployment is serving the domain instead of GitHub Pages. |

## Useful Links

- [Vercel: Import a Git repository](https://vercel.com/docs/getting-started-with-vercel/import)
- [Vercel: Environment variables](https://vercel.com/docs/environment-variables)
- [Vercel: Add a domain](https://vercel.com/docs/domains/add-a-domain)
- [Supabase: Create a project](https://supabase.com/docs/guides/getting-started)
- [Supabase: Auth redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)
- [Supabase: Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
