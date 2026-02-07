> *Seed knowledge from ShipIt development, 2025-2026*

# Engineer Memory Seed

## Patterns That Work
- Deploy to Vercel from day one — catches deployment issues early
- Write tests alongside features, never "later"
- Check FRONTEND_GUIDELINES.md before building any component
- Check TECH_STACK.md before adding any dependency
- Lazy-load Supabase client to avoid build crashes from missing env vars
- Use direct-to-storage uploads for files > 4.5MB (Vercel serverless limit)
- Test API integrations with curl early — catches auth/credit issues before UI debugging
- Streaming API responses need explicit error handling in the stream callback
- Server components where possible, client components only when interactivity needed
- Run `next build` locally before first deploy — catches build-only errors that dev mode misses
- Run `npm ls react` after scaffold to verify React version matches Next.js requirement
- For dashboards: wire up shared state (filters, context) before writing component tests — test the integration, not just the component
- For dashboards: write at least one integration test per component that verifies filter change -> rendered output change

## File Creation: ALWAYS Use Write/Edit Tools, NEVER Bash Heredocs

**This is a hard rule.** When creating or modifying files:

- **Use the Write tool** to create new files (any language, any size)
- **Use the Edit tool** to modify existing files
- **NEVER use `cat > file << 'EOF'`**, `echo > file`, or any Bash redirect to write file content
- **NEVER use Bash `for` loops** to create multiple files -- use individual Write calls

**Why:** Bash heredoc commands containing file content get saved as permission "allow" patterns in `settings.local.json`. These multi-hundred-line escaped strings corrupt the JSON file and break Claude Code's permission system on next startup. This happened during the London Transit Pulse build: 16 entries containing full TypeScript components, test files, and markdown corrupted the settings file, making all saved permissions inaccessible.

**Acceptable Bash file operations:** `mkdir -p` (directories), `cp`/`mv` (copy/move), `chmod` (permissions), `rm` (deletion), `touch` (empty files). These are metadata operations that produce short, safe permission patterns.

## Common Mistakes
- Creating Supabase client at module level (crashes if env vars missing)
- Running `tsc --noEmit` instead of actual build command from package.json
- Leaving conflict markers in code after rebase
- Not grepping for type construction sites when adding required fields to types
- Silently swallowing API errors (`data.posts || []` hides failures)
- Using future/incorrect model names with AI APIs — fails silently
- Skipping empty states and loading states
- Hardcoding color values (Tailwind grays, hex codes) instead of CSS variable theme tokens — causes dark/light mode breakage
- Using `Math.random()` or non-deterministic data in React render paths — causes visual flickering on every re-render; memoize or use stable seeds
- Installing React 19 with Next.js 14 (requires React 18) — use `npm ls react` to verify after install; never use `legacy-peer-deps=true` to suppress warnings
- Adding data directories to `.gitignore` that source code imports from — cross-reference gitignore entries against import graph
- Skipping `next build` locally before first deploy — catches missing files, version conflicts, and build-only errors
- Building dashboard components with static imports instead of consuming shared filter/context state — always wire up `useFilters()` or equivalent before writing tests
- Implementing visual toggle state (dimming cards) without wiring up data recalculation — `activeModes` and similar filter state must be in `useMemo` dependency arrays
- Hardcoding `data.slice(-N)` in components that should respond to filter range — downsample from the full filtered array instead
- Assuming all numeric values are counts — add `valueFormat` props ('number' | 'percent' | 'currency') to display components from the start
- Using `cat > file << 'EOF'` or Bash heredocs to create files — corrupts `settings.local.json` permission patterns; always use Write/Edit tools instead

## Type Propagation Rule
When adding a required field to a type, grep entire codebase. The missed places are always: migration functions, test fixtures, factory functions, mock data, seed scripts, default objects.

## Path Alias Must Cover All Import Roots

**Context:** When project data or assets live outside `src/` but are imported by source code
**Learning:** Transit Pulse combined build has `data/` at the project root (outside `src/`) but city components import from it using deep relative paths like `../../../../../data/nyc/daily.json` (15 occurrences). The `@/*` alias only maps to `./src/*`, so data imports cannot use the alias. This makes imports fragile, hard to read, and error-prone when files move.
**Action:** When `tsconfig.json` defines path aliases, add aliases for every directory that source code imports from. If `data/` is outside `src/`, add `"@data/*": ["./data/*"]` to `paths`. Alternatively, move data inside `src/` so `@/data/*` works naturally. Deep relative paths with more than 2 levels (`../../..`) are a code smell indicating a missing alias.
**Source:** Transit Pulse combined build, 2026-02-07. 15 imports use `../../../../../data/`.

## Cross-Agent Feedback
- Architecture gaps → tell @retro to update @architect's memory
- Unclear PRD → tell @retro to update @strategist's memory
- Missing UI spec → tell @retro to update @designer's memory
- Infra issues → tell @retro to update @devsecops's memory
