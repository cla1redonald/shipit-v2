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
