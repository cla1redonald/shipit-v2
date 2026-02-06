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

## UX/UI Failures

### Generic Styling
Default Bootstrap/generic styling looks amateur. Use professional color palettes with proper contrast ratios.

### Desktop-Only Testing
Always test on mobile. Mobile-first responsive design saves rework.

### Dashed Borders
Look "wireframey." Use solid subtle borders or card shadows for polish.

### Low Contrast Text
Always test text colors visually. `text-slate-800` on `bg-slate-100` can be hard to read despite looking fine in code.

## Delegation Failures

### Orchestrator Does Everything Itself
In the first ShipIt v2 end-to-end test, the orchestrator made **zero Task tool calls** out of 123 total. It wrote code, created schemas, designed architecture, and role-played @retro — all things it is explicitly forbidden from doing. Root cause: the orchestrator was spawned as a **Task tool subprocess**, but subprocesses cannot spawn further subprocesses (single-level nesting constraint). It silently did everything itself instead of reporting the error.

**Fix:** The orchestrator is now invoked via the `/orchestrate` skill, which loads it into the **main conversation** (team lead). As the top-level session, it has full access to Task tool (for subagents) and TeamCreate (for Agent Teams). The orchestrator definition includes a fail-safe: if it detects it's running as a subprocess, it reports an error instead of proceeding.

**Prevention:** All documentation directs users to `/orchestrate` instead of `@orchestrator`. The README, CLAUDE.md, and global CLAUDE.md all explain the constraint.

### README Omits Agents
The README listed 9 of 12 agents, omitting @pm, @devsecops, and @retro. Nobody caught this because no review step checks the README agent list against the actual agent directory. Fix: verification step that counts agents in README vs files in `agents/`.
