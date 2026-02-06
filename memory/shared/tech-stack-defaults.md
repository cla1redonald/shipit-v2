> *Seed knowledge from ShipIt development, 2025-2026*

# Default Tech Stack

Unless specified otherwise, use this stack for all projects.

## Stack
- **Language:** TypeScript
- **Framework:** Next.js (App Router)
- **Hosting:** Vercel
- **Database:** Supabase (when needed)
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui
- **Repo:** GitHub
- **Test Runner:** Vitest (preferred) or Jest

## Project Structure (Next.js)
```
/src
  /app
    /api
    /(routes)
  /components
    /ui
    /features
  /lib
    /db
    /utils
  /types
/tests
/public
```

## Supabase Schema Pattern
```sql
-- Always include in schema.sql
-- 1. Tables with user_id for multi-user readiness
-- 2. RLS enabled on all tables
-- 3. Storage buckets via INSERT
-- 4. created_at/updated_at timestamps
```

## Environment Variables Pattern
```
# .env.example - always include
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
```

## Quality Bar
- Not embarrassing to show someone
- Core functionality works end-to-end
- Tests passing
- Mobile responsive
- Live on Vercel
