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

## Subdirectory App Permissions

**Context:** When a project contains a subdirectory app (e.g., `web/`, `app/`, `frontend/`) that is scaffolded as a separate Next.js project within a monorepo or plugin repo
**Learning:** ProveIt's root `.claude/settings.json` only allows WebSearch/WebFetch (intentionally, for security). When @devsecops scaffolded the Next.js app at `~/proveit/web/`, Bash permission prompts appeared for every file write even though `bypassPermissions` was set on the subagent. The root settings propagated into the subdirectory. The fix: create `web/.claude/settings.json` with Bash permission explicitly allowed for the subdirectory scope.
**Action:** When scaffolding a subdirectory app that needs Bash access (npm install, next build, git operations), create a `.claude/settings.json` in that subdirectory with the required Bash permissions. Do not assume root-level settings will be inherited correctly by subagents working in subdirectories. Template:
```json
{
  "permissions": {
    "allow": ["Bash(*)"],
    "deny": []
  }
}
```
This is especially important in repos where the root settings deliberately restrict Bash for security reasons.
**Source:** ProveIt web build, 2026-02-22.

## Scaffold Verification: .gitignore Must Exist Before First Commit

**Context:** When verifying scaffold output before the first `git add` / `git commit`
**Learning:** Focus Timer scaffold omitted .gitignore entirely. The first `git add -A` committed node_modules/ and .next/ to the repo. This required destructive git history rewriting before the repo could be pushed. This is the second scaffold infrastructure failure (London Transit Pulse had data/ in .gitignore that blocked imports).
**Action:** Add to scaffold verification: before the first commit, confirm `.gitignore` exists and excludes at minimum: `node_modules/`, `.next/`, `.env.local`, `.env`, `dist/`, `.DS_Store`. Run `git status` and verify no generated directories appear as untracked. If .gitignore is missing, create it BEFORE `git add`.
**Source:** Focus Timer, 2026-02-25.

## Pre-Deploy Checklist
1. `.gitignore` exists and excludes generated/secret directories (verify before first commit)
2. `next build` succeeds locally (or project's actual build command)
3. `npm ls react` shows correct React version for the Next.js version
4. No `.npmrc` workarounds for peer dependency warnings
5. Every gitignored directory cross-referenced against imports (no "Module not found" risk)
6. `.env.example` lists all required environment variables
7. After first deploy, verify production URL serves the new deployment (not cached old one)
