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
