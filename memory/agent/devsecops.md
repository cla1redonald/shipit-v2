> *Seed knowledge from ShipIt development, 2025-2026*

# DevSecOps Memory Seed

## Infrastructure Setup
- Deploy to Vercel from day one — catches deployment issues early
- `gh`, `vercel`, and `supabase` CLIs automate most setup
- `supabase projects create` CLI has region issues — easier to create in dashboard then link
- Vercel alias: `vercel alias [source] [target].vercel.app`

## Security Checklist
- RLS enabled on ALL Supabase tables
- Environment variables documented in .env.example
- Service role keys never in client code
- CORS configured
- Input validation on all API routes

## Gotchas
- Vercel 4.5MB body limit for serverless functions
- Always set up .env.example before other agents start
- Vercel build cache retains old `node_modules` — when fixing dependency versions, set `VERCEL_FORCE_NO_BUILD_CACHE=1` env var or deploy with `--force`
- Vercel CDN edge cache can serve stale deployments after redeploy — use `vercel alias <deployment-url> <production-url>` to force-point production to new deployment
- Never add `legacy-peer-deps=true` to `.npmrc` — it masks real dependency conflicts that surface in production
- Cross-reference `.gitignore` entries against import statements — if code imports from a gitignored path, the build will fail on Vercel

## Pre-Deploy Checklist
1. `next build` succeeds locally (or project's actual build command)
2. `npm ls react` shows correct React version for the Next.js version
3. No `.npmrc` workarounds for peer dependency warnings
4. Every gitignored directory cross-referenced against imports (no "Module not found" risk)
5. `.env.example` lists all required environment variables
6. After first deploy, verify production URL serves the new deployment (not cached old one)
