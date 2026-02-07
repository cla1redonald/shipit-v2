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

## Platform Structure Decisions Must Cite Documentation

**Context:** When defining directory structures, configuration formats, or conventions for a specific platform (Claude Code plugins, Vercel functions, Supabase Edge Functions, etc.)
**Learning:** ShipIt v2 placed agents/skills/hooks inside `.claude-plugin/` instead of at the plugin root. This matched common plugin patterns from other ecosystems but violated the actual Anthropic documentation, which explicitly calls this a "Common mistake." The error was undetected until the user manually audited against the docs.
**Action:** For every platform-specific structural decision, cite the exact documentation source. If no documentation has been fetched yet, request that @researcher fetch it before proceeding. "Based on common patterns" is not acceptable when official docs exist. "Based on [Platform] documentation, [section/URL]" is the standard. If the docs are unavailable, explicitly flag the decision as unverified.
**Source:** ShipIt v2 plugin structure failure, 2026-02-06.

## Scaffold Phase Must Validate Dependency Compatibility

**Context:** When specifying the dependency list in TECH_STACK.md or during project scaffold
**Learning:** London Transit Pulse specified Next.js 14 + react-leaflet@5 + React (unversioned). react-leaflet@5 requires React 19, but Next.js 14 requires React 18. The conflict was masked by `legacy-peer-deps=true` in `.npmrc` and only surfaced as a production crash.
**Action:** The architecture spec must explicitly pin React version to match the Next.js version (Next.js 13-14 = React 18, Next.js 15 = React 19). All library versions in TECH_STACK.md must be validated against each other's peer dependency requirements. If a library requires a newer React than the Next.js version supports, choose a compatible library version (e.g., react-leaflet@4 for React 18).
**Source:** London Transit Pulse, 2026-02-07. Client-side crash on first deploy.

## Architecture Must Specify Data Flow Integration Points

**Context:** When designing dashboards or apps with shared filter/toggle state
**Learning:** London Transit Pulse architecture specified components and filter context independently but did not specify the integration contract: which components consume which filters, and how filter changes propagate to data recalculation. Each engineer built components in isolation, and none wired up the shared state correctly.
**Action:** For apps with shared state, the architecture doc must include a "Data Flow" section that explicitly maps: (1) which context providers exist, (2) which components consume each provider, (3) what the expected behavior is when state changes (e.g., "when dateRange changes, KPISection must recalculate averages over the new range"). This contract enables integration tests and prevents components from importing static data instead of consuming context.
**Source:** London Transit Pulse, 2026-02-07. 4 integration bugs from missing data flow spec.

## Multi-Variant Architecture: City-Module Pattern

**Context:** When combining multiple variants of the same app (multi-city dashboards, multi-tenant apps, multi-brand sites)
**Learning:** Transit Pulse combined two single-city dashboards into one app using a `src/cities/{city}/` directory structure. Each city module owns its own types, lib, and components. Shared primitives (KPICard, Header, Footer, utils) live in `src/components/` and `src/lib/`. This produced zero file conflicts with 3 parallel engineers and zero type leakage between cities.
**Action:** When the architecture has natural variant boundaries, use directory-level isolation:
- `src/cities/{variant}/types/` -- incompatible types stay separate
- `src/cities/{variant}/lib/` -- variant-specific state, formatters, colors
- `src/cities/{variant}/components/` -- variant-specific UI
- `src/components/` -- shared primitives (must be superset-compatible)
- Route pages (`app/{variant}/page.tsx`) wrap variant-specific providers
- Shared components import from `@/components/`, variant components import from `@/cities/{variant}/`
**Anti-pattern:** Sharing a single FilterProvider/type system across variants via union types. This loses type safety and creates coupling. Each variant should have its own typed provider.
**Source:** Transit Pulse combined build, 2026-02-07. 3 engineers, zero file conflicts, zero type leakage.

## Architect Must Specify Shared Utility Boundaries

**Context:** When designing multi-module applications where utilities may be duplicated
**Learning:** Across 3 builds (London: CustomTooltip duplicated 4x; Retro Pinball: duplicate high score logic; Transit Pulse: format utilities duplicated 3x), shared utility functions are consistently duplicated when the architecture spec does not explicitly list which functions are shared vs city-specific. Engineers independently create local copies rather than importing from shared.
**Action:** The architecture spec must include a "Shared Utilities" section that explicitly lists: (1) which utility functions belong in the shared module, (2) which are genuinely city-specific (different behavior, not just different naming), (3) import path for each. When a city-specific function has the same signature as a shared function (e.g., `formatNumber`), the spec must clarify whether to use the shared version or justify why the city version differs.
**Source:** Transit Pulse combined build, 2026-02-07. `formatNumber` exists in 3 places; London's copy is identical to shared.

## Supabase Typed Client: Database Type Shape

**Context:** When using `createClient<Database>()` with @supabase/supabase-js v2.90+
**Learning:** The Database type interface must include a `Relationships: []` field in each table definition. Omitting it causes TypeScript to infer `never` for all insert/update/select operations, producing cryptic "no overload matches this call" errors at build time.
**Action:** Always include `Relationships: []` (or actual relationship definitions) in the Database type. Deliver a complete `database.types.ts` file as part of architecture deliverables, not just a conceptual schema.
**Source:** Mood Journal project, 2026-02-06. Build failed on first attempt due to missing Relationships field.
