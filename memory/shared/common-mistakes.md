> *Seed knowledge from ShipIt development, 2025-2026*

# Common Mistakes to Avoid

Patterns from past projects. Every agent should be aware of these.

## Testing Failures

### Shipping Without Tests
PowderPost shipped without any tests despite "tests required" being in docs. Root cause: no hard enforcement. Now enforced with blocking hooks.

### "We'll Add Tests Later"
This never happens. Write tests WITH each feature.

### No Test Infrastructure
Four consecutive commits shipped without tests because the project had no test runner, no test script, no test config. The project was structurally incapable of running tests. **Before writing ANY code, verify test infrastructure exists.**

### Running Wrong Build Command
`tsc --noEmit` and `tsc -b` can produce different results. Always run the project's ACTUAL build command from package.json. The command CI/Vercel runs is the one that matters.

## Infrastructure Failures

### Vercel 4.5MB Body Size Limit
Serverless functions reject requests > 4.5MB (HTTP 413). For file uploads, use direct-to-storage uploads with signed URLs.

### Supabase Client at Module Level
Creating Supabase client at module level crashes the build if env vars are missing. Always lazy-load.

### Supabase RLS Policies
Forgetting to enable RLS is a security hole. Always enable RLS and create policies for SELECT/INSERT/UPDATE/DELETE.

### Environment Variables Not Documented
Causes setup friction. Always maintain .env.example.

### Service Role Keys in Client Code
Security risk. Never expose service role keys client-side.

### Next.js + React Version Mismatch
**What happens:** React 19 is installed alongside Next.js 14 (which requires React 18). Libraries like react-leaflet@5 use React 19-only APIs (`React.use()`), causing immediate client-side crash in production.
**Root cause:** Scaffold phase installs packages without validating cross-dependency version constraints. Adding `legacy-peer-deps=true` to `.npmrc` suppresses the warnings, hiding the real conflict.
**Prevention:** After `npm install`, run `npm ls react` and verify the React version matches the Next.js requirement (Next.js 13-14 = React 18, Next.js 15 = React 19). Never add `legacy-peer-deps=true` as a workaround -- resolve the actual conflict.
**Source:** London Transit Pulse, 2026-02-07. App crashed on page load in production.

### Gitignored Paths That Code Imports From
**What happens:** A directory like `/data/` is added to `.gitignore` (treating it as generated/raw data), but the application imports directly from `data/*.json`. Files never reach the deploy target, causing "Module not found" build failure.
**Root cause:** The scaffold thread treats data directories as excludable without checking the import graph.
**Prevention:** Cross-reference every `.gitignore` entry against the application's imports. Run `next build` locally before first deploy -- any "Module not found" for a gitignored path reveals this conflict.
**Source:** London Transit Pulse, 2026-02-07. 7 JSON data files missing from Vercel build.

### No Local Build Before First Deploy
**What happens:** First deploy to Vercel fails because nobody ran `next build` locally. A successful local build would have caught version conflicts, missing files, and other build errors before they hit production.
**Prevention:** `next build` must succeed locally before the first `vercel deploy`. This is a hard gate. The first deploy is the highest-risk deployment because there is no known-good baseline.
**Source:** London Transit Pulse, 2026-02-07.

### Vercel Build Cache Retains Old Dependencies
**What happens:** After fixing a dependency version in `package-lock.json`, Vercel's cached `node_modules` from the previous build is reused, serving the old broken dependency.
**Prevention:** When fixing dependency versions, set `VERCEL_FORCE_NO_BUILD_CACHE=1` in Vercel environment variables or deploy with `--force`. After deploy, verify the production URL serves the new deployment.
**Source:** London Transit Pulse, 2026-02-07. React 19 persisted in deployed bundle despite lockfile specifying React 18.

## Code Failures

### Type Propagation Rule
When adding a required field to a TypeScript type, grep the ENTIRE codebase for every construction site. The places that get missed: migration functions, test fixtures, factory functions, mock data, seed scripts, default objects.

### Merge Conflict Markers Left in Code
After rebase/merge, always: (1) grep for conflict markers, (2) run actual build command, (3) run full test suite. A partial conflict resolution is worse than none.

### Silent API Failures
`setPosts(data.posts || [])` silently swallows API errors. Always show errors to users during development.

### Hardcoded Counts Across Files
When numeric metadata (test counts, version numbers) are hardcoded in multiple files, they drift silently. Store in single source of truth.

## Process Failures

### @retro Skipped at End
The orchestrator's summary feels like a "done" state — it forgets to invoke @retro after. Fix: @retro runs BEFORE the summary.

### Skipped Agents Without Justification
There's a difference between "not needed" and "forgot." All agents must be explicitly listed as Invoke or Skip (with reason).

### Documentation Drift
When @docs is skipped, no one checks if existing docs are still accurate. Always assess documentation impact before shipping.

### Background Agents Can't Run Bash
Agents spawned in background mode have bash auto-denied. Agents needing bash (@engineer, @devsecops, @qa) must run in foreground.

### Documenting Before Testing
We documented agent capabilities without testing them. The documented feature did not actually work. Always verify capabilities before documenting them.

## Rewrite Contamination

### Predecessor Concepts Leak Into Rewrites
When rewriting a system, the builder has the predecessor in context. Architecture changes successfully (new patterns adopted) but content does not (old terminology, old concepts, old comparison tables leak through). The fix is an explicit "eliminated concepts" list in CLAUDE.md that is greppable, plus a review step that checks for references to eliminated concepts.

### Comparison Tables in READMEs
A product's README should describe that product. A "Differences from v1" table makes the product define itself through its predecessor, which is not how standalone products work. If migration guidance is needed, put it in a separate MIGRATION.md.

### Hallucinated Platform Features
When building on a platform (Claude Code, Vercel, Supabase), do not assume features exist without testing them. The `hooks:` YAML frontmatter field was added to agent definitions without verifying it was a real Claude Code feature — it was not. Always test platform capabilities before documenting or building on them.

### Confident Misimplementation of Platform Conventions
**What happens:** The builder implements real platform features with the wrong structure or configuration. The code appears to work in development but fails when the platform tries to auto-discover or distribute the artifacts. In ShipIt v2, agents/skills/hooks were placed inside `.claude-plugin/` instead of at the plugin root — exactly what the Anthropic docs call a "Common mistake."
**Root cause:** The builder's mental model of how plugins work (from other ecosystems like VSCode, npm) produces a plausible-looking but incorrect structure. Unlike hallucinated features, misimplemented conventions do not immediately error — they silently fail at distribution/discovery time.
**Prevention:** (1) Fetch and read the actual platform documentation before designing directory structures. (2) @architect must cite the specific documentation section justifying platform-specific structural decisions. (3) Run a plugin loading smoke test as part of Gate 3 (Infrastructure Ready).
**Detection:** Integration test that verifies the platform can find and load all declared agents, skills, and hooks from their expected locations.

### Docs-Say-But-Didn't-Read (Acknowledged Instructions, Ignored Execution)
**What happens:** The user explicitly says "follow the documentation for X." The builder acknowledges this and proceeds to build from its own knowledge instead of actually fetching and reading the docs. The result diverges from the docs in ways the user has to discover themselves.
**Root cause:** The builder has high confidence in its existing knowledge and interprets "follow the docs" as "I know the docs" rather than "go read the docs right now." For rapidly-evolving platforms, the builder's training data may be stale or incomplete.
**Prevention:** When a user references specific documentation, the orchestrator must create a blocking task: "Fetch and summarize current documentation for [X]." This task must complete before the design phase begins. @researcher is invoked to fetch the actual docs via WebFetch, and the output is provided to @architect as a concrete reference.
**Detection:** @reviewer's review checklist includes a "Source Verification" step: for every platform-specific structural decision, verify the cited documentation source exists and matches the implementation.

## Integration Testing Failures

### Components Built in Isolation Without Shared State Integration
**What happens:** Dashboard components are unit-tested with mock data and pass, but they never integrate with the shared filter/state system. The result: filters appear to work (UI changes) but displayed data never changes. Users discover this by clicking through the deployed app.
**Root cause:** Each component is built and tested in its own thread without any integration test verifying the full state-to-render pipeline. The test suite gives 100% false confidence.
**Prevention:** For any app with shared state (filters, toggles, context providers), write integration tests that: (1) render the component within the provider, (2) change a state value, (3) assert the rendered output changes. At minimum one integration test per component that consumes shared state.
**Detection:** If a dashboard has N filter controls and M display components, but zero tests that change a filter and assert a component's output changes, integration testing is missing.
**Source:** London Transit Pulse, 2026-02-07. 4 separate integration bugs (Issues 5-8) discovered only by user.

### Visual State Change Without Data State Change
**What happens:** A toggle "dims" or "highlights" a card (visual state) but does not recalculate the underlying data (data state). The visual change creates the illusion the feature works, so neither developer nor reviewer verifies actual data recalculation.
**Root cause:** Visual feedback is easier to implement than data flow. The developer implements the CSS/opacity change, sees something happen on click, and moves on. Missing `useMemo` dependency arrays go unnoticed because the component appears responsive.
**Prevention:** Test visual state and data state independently. For mode toggles: assert that the sum/average changes when modes are toggled, not just that a CSS class is applied.
**Source:** London Transit Pulse, 2026-02-07. Mode toggles dimmed cards but never recalculated "Avg Daily Journeys."

### Hardcoded Data Slicing Ignoring Filter Range
**What happens:** A component uses `data.slice(-30)` to show "last 30 entries" regardless of the selected date range (7D, 30D, 90D). The graph never changes when filters change.
**Root cause:** Developer uses a fixed slice for visual consistency without considering that the slice should be relative to the filtered data range.
**Prevention:** Never hardcode slice parameters in components that consume filtered data. Use the filtered array length to determine the slice, or downsample the full filtered range to a target number of data points.
**Source:** London Transit Pulse, 2026-02-07. Sparklines showed identical graphs for all date ranges.

## Code Duplication Across Module Boundaries

### Duplicate Utility Functions When Architecture Does Not Specify Shared Boundaries
**What happens:** Multiple engineers independently create local copies of the same utility function (formatters, helpers, tooltips) in their own modules instead of importing from a shared location. The duplicates have subtly different behavior (e.g., one rounds to 0 decimals, another to 1), creating inconsistency and maintenance burden.
**Root cause:** The architecture spec defines the shared module and city modules but does not explicitly list which utility functions belong where. Engineers working in parallel default to creating local copies to avoid blocking on shared code.
**Prevention:** Architecture spec must include a "Shared Utilities" section that: (1) explicitly lists every shared function with its signature, (2) specifies import path, (3) notes which city-specific functions intentionally differ from the shared version and why. During @reviewer pass, grep for function names that appear in both shared and city modules -- duplicates with identical signatures are always bugs.
**Detection:** Grep for common function names (`formatNumber`, `formatPercent`, `formatDate`) across all module boundaries. If the same function name appears in 3+ locations, consolidation is needed.
**Seen in:** London Transit Pulse (CustomTooltip x4 files), Retro Pinball (duplicate high score logic in GameState + GameHUD), Transit Pulse combined (formatNumber/formatPercent/formatDate in 3 locations). Third occurrence -- pattern is proven.

## UX/UI Failures

### Hardcoded Theme Colors in Components
**What happens:** Components use raw Tailwind gray scales (`text-gray-900`, `bg-gray-200`) or hex values (`#1a1a2e`) instead of CSS variable-based theme tokens (`text-foreground`, `hsl(var(--muted-foreground))`). Works in one theme, breaks in the other.
**Root cause:** Engineers default to familiar Tailwind utility classes or copy colors from design mockups as literal values. The architecture doc does not explicitly forbid it.
**Prevention:** Architecture doc must include a "Theming Rules" section: "All colors must use CSS variable tokens. Never use raw Tailwind color scales or hex values in components." @reviewer checks for hardcoded color patterns in every review.
**Detection:** Grep for `text-gray-`, `bg-gray-`, `text-\[#`, `bg-\[#` in component files. Any match outside `globals.css` or theme config is a bug.

### Non-Deterministic Data in React Render
**What happens:** `Math.random()` called during render produces different output every render cycle, causing visual flickering (e.g., sparkline bars changing shape on every filter interaction).
**Root cause:** Data generation logic placed inline in component render instead of being memoized or computed once.
**Prevention:** Never call `Math.random()`, `Date.now()`, or other non-deterministic functions in the render path. Use `useMemo` with stable deps, or compute data outside the component.
**Detection:** Grep for `Math.random()` in `.tsx` files. Any match inside a component body (not wrapped in `useMemo`) is a bug.

### Generic Styling
Default Bootstrap/generic styling looks amateur. Use professional color palettes with proper contrast ratios.

### Desktop-Only Testing
Always test on mobile. Mobile-first responsive design saves rework.

### Dashed Borders
Look "wireframey." Use solid subtle borders or card shadows for polish.

### Low Contrast Text
Always test text colors visually. `text-slate-800` on `bg-slate-100` can be hard to read despite looking fine in code.

## Tool Misuse Failures

### Bash Heredoc File Creation Corrupts settings.local.json
**What happens:** An agent uses `cat > /path/to/file.tsx << 'EOF' ... EOF` via the Bash tool to create files instead of using the Write tool. When the user approves these Bash commands in the permission system, Claude Code saves the ENTIRE heredoc command -- including hundreds of lines of escaped source code -- as an "allow" pattern in `settings.local.json`. On next startup, Claude Code tries to parse these multi-hundred-line patterns, hits a `:*` pattern syntax error, and refuses to load the file entirely. The error message is: "The :* pattern must be at the end. Move :* to the end for prefix matching, or use * for wildcard matching. Files with errors are skipped entirely, not just the invalid settings."
**Root cause:** The agent defaults to Bash shell commands for file creation because heredoc syntax is familiar and straightforward. But the Bash tool's permission system was not designed to handle multi-line file content as a command string. The Write tool exists specifically for file creation and does not interact with the permission allow-list in this way.
**Impact:** All permission settings in `settings.local.json` become inaccessible. The user must manually edit the JSON file to remove corrupted entries before Claude Code will load any of their saved permissions. In the London Transit Pulse build, 16 malformed entries (containing full TypeScript components, test files, and markdown) corrupted the file.
**Prevention:**
1. **Never use `cat > file << 'EOF'`, `echo >`, or any Bash heredoc/redirect to create files.** Always use the Write tool for file creation and the Edit tool for file modification.
2. **Never use Bash `for` loops to create or modify multiple files.** Use individual Write/Edit tool calls for each file.
3. The ONLY acceptable use of Bash for file-related operations is: `mkdir -p` (creating directories), `cp`/`mv` (copying/moving files), `chmod` (permissions), and similar metadata operations.
**Detection:** Grep for `cat >`, `cat >>`, `<< 'EOF'`, `<< EOF`, `echo >` in Bash commands being executed by agents. Any match involving file content creation is a bug.
**Source:** London Transit Pulse, 2026-02-07. 16 corrupted entries in `settings.local.json` including full TSX components and test files.

## Delegation Failures

### Orchestrator Does Everything Itself
In the first ShipIt v2 end-to-end test, the orchestrator made **zero Task tool calls** out of 123 total. It wrote code, created schemas, designed architecture, and role-played @retro — all things it is explicitly forbidden from doing. Root cause: the orchestrator was spawned as a **Task tool subprocess**, but subprocesses cannot spawn further subprocesses (single-level nesting constraint). It silently did everything itself instead of reporting the error.

**Fix:** The orchestrator is now invoked via the `/orchestrate` skill, which loads it into the **main conversation** (team lead). As the top-level session, it has full access to Task tool (for subagents) and TeamCreate (for Agent Teams). The orchestrator definition includes a fail-safe: if it detects it's running as a subprocess, it reports an error instead of proceeding.

**Prevention:** All documentation directs users to `/orchestrate` instead of `@orchestrator`. The README, CLAUDE.md, and global CLAUDE.md all explain the constraint.

### README Omits Agents
The README listed 9 of 12 agents, omitting @pm, @devsecops, and @retro. Nobody caught this because no review step checks the README agent list against the actual agent directory. Fix: verification step that counts agents in README vs files in `agents/`.
