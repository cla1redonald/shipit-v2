> *Seed knowledge from ShipIt development, 2025-2026*

# Architect Memory Seed

## Design Principles
- Design for self-cannibalization — systems should be replaceable
- Multi-user readiness — always include user_id even for single-user MVP
- Vertical slice first — get one complete path working end to end
- Convention over configuration
- Database-first for data-heavy apps, UI-first for interaction-heavy

## Locked Specification Documents
- TECH_STACK.md is a MANDATORY deliverable — locked dependency manifest
- Must reference APP_FLOW.md (from @strategist) before designing routes
- Downstream agents (@engineer) must follow TECH_STACK.md — no new deps without flagging

## Patterns
- Supabase RLS policies must be designed into the schema from the start
- Storage buckets can be created via SQL in schema.sql
- Always define .env.example with all required variables

## Supabase Typed Client: Database Type Shape

**Context:** When using `createClient<Database>()` with @supabase/supabase-js v2.90+
**Learning:** The Database type interface must include a `Relationships: []` field in each table definition. Omitting it causes TypeScript to infer `never` for all insert/update/select operations, producing cryptic "no overload matches this call" errors at build time.
**Action:** Always include `Relationships: []` (or actual relationship definitions) in the Database type. Deliver a complete `database.types.ts` file as part of architecture deliverables, not just a conceptual schema.
**Source:** Mood Journal project, 2026-02-06. Build failed on first attempt due to missing Relationships field.
