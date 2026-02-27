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
- Backend routes proxying external APIs should stream responses through with `response.body` pipe, not buffer with `await response.arrayBuffer()`

## File Creation: ALWAYS Use Write/Edit Tools, NEVER Bash Heredocs

**This is a hard rule.** When creating or modifying files:

- **Use the Write tool** to create new files (any language, any size)
- **Use the Edit tool** to modify existing files
- **NEVER use `cat > file << 'EOF'`**, `echo > file`, or any Bash redirect to write file content
- **NEVER use Bash `for` loops** to create multiple files -- use individual Write calls

**Why:** Bash heredoc commands containing file content get saved as permission "allow" patterns in `settings.local.json`. These multi-hundred-line escaped strings corrupt the JSON file and break Claude Code's permission system on next startup. This happened during the London Transit Pulse build: 16 entries containing full TypeScript components, test files, and markdown corrupted the settings file, making all saved permissions inaccessible.

**Acceptable Bash file operations:** `mkdir -p` (directories), `cp`/`mv` (copy/move), `chmod` (permissions), `rm` (deletion), `touch` (empty files). These are metadata operations that produce short, safe permission patterns.

## Scaffold Must Include .gitignore

**Context:** When creating a new project scaffold (Thread 1)
**Learning:** Focus Timer scaffold created package.json, tsconfig, and source directories but omitted .gitignore. The first `git add -A` committed node_modules/ and .next/, requiring git history rewriting. This is the second scaffold infrastructure failure after London Transit Pulse.
**Action:** Every scaffold MUST create a `.gitignore` file before the first git commit. Standard template: `node_modules/`, `.next/`, `.env.local`, `.env`, `.claude/settings.local.json`, `dist/`, `.DS_Store`, `*.log`. Verify with `git status` that generated directories are excluded before committing. The `.claude/settings.local.json` entry is critical — this file stores Bash command permission patterns that may contain API keys passed through shell commands.
**Source:** Focus Timer, 2026-02-25.

## Integration Tests: Write WITH Features, Not After

**Context:** When implementing any feature that interacts with app state, context providers, or other components
**Learning:** Three projects have now deferred integration tests to a "later" thread that never executes: London Transit Pulse (4 integration bugs post-deploy), NYC Transit Pulse (shallow integration tests), Focus Timer (empty integration test folder). This pattern is not dashboard-specific -- it happens on simple apps too.
**Action:** Write at least one integration test per feature, IN the feature thread, before marking the thread complete. Do not accept "Thread N will add integration tests" -- that thread will be cut when feature threads overrun. The definition of done for any feature thread includes: "integration test exists proving this feature works with real app state."
**Source:** Focus Timer, 2026-02-25. Third occurrence across projects.

## Async/Void Interface Mismatch

**Context:** When implementing interfaces or type declarations for functions that involve browser APIs (notifications, permissions, audio, WebSocket)
**Learning:** TypeScript allows `async () => Promise<void>` to satisfy `() => void` without error. In Focus Timer, `useNotifications` declared `notify` as returning `void` but the implementation was `async`. The first notification silently failed because the Promise rejection was swallowed.
**Action:** If an implementation needs to be `async`, the interface must declare `Promise<void>`, not `void`. When writing hooks or utilities that wrap browser APIs (Notification, getUserMedia, AudioContext), always check whether the underlying API returns a Promise. If it does, the interface must reflect that.
**Source:** Focus Timer, 2026-02-25.

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
- Validating an ID with a regex that does not match the ID generator's alphabet — if you use nanoid, its default alphabet includes `_` and `-`; validate with `/^[a-zA-Z0-9_-]+$/`, not `/^[a-zA-Z0-9]+$/`
- Spreading a full session/model object into `localStorage` or any persistence layer without stripping transient fields — fields like `isStreaming`, `isLoading`, `isPending` must be explicitly omitted before persist; use destructuring: `const { isStreaming, ...persistable } = session`
- Duplicating validation constants between the client (e.g., `MAX_CHARS = 1000`) and the server schema (e.g., Zod `max(2000)`) — the server schema is the source of truth; derive or re-export the constant from there, never set it independently

## Type Propagation Rule
When adding a required field to a type, grep entire codebase. The missed places are always: migration functions, test fixtures, factory functions, mock data, seed scripts, default objects.

## Path Alias Must Cover All Import Roots

**Context:** When project data or assets live outside `src/` but are imported by source code
**Learning:** Transit Pulse combined build has `data/` at the project root (outside `src/`) but city components import from it using deep relative paths like `../../../../../data/nyc/daily.json` (15 occurrences). The `@/*` alias only maps to `./src/*`, so data imports cannot use the alias. This makes imports fragile, hard to read, and error-prone when files move.
**Action:** When `tsconfig.json` defines path aliases, add aliases for every directory that source code imports from. If `data/` is outside `src/`, add `"@data/*": ["./data/*"]` to `paths`. Alternatively, move data inside `src/` so `@/data/*` works naturally. Deep relative paths with more than 2 levels (`../../..`) are a code smell indicating a missing alias.
**Source:** Transit Pulse combined build, 2026-02-07. 15 imports use `../../../../../data/`.

## Stream-Through Proxy Pattern for External APIs

**Context:** When implementing Next.js API routes (or similar backend routes) that proxy external API calls (ElevenLabs, OpenAI, etc.)
**Learning:** Weather Mood initially used `await response.arrayBuffer()` in 3 routes (music, SFX, narration), buffering the entire response in serverless memory before sending to client. This added latency and memory pressure. When refactored to stream-through with `return new Response(response.body)`, audio started playing immediately as chunks arrived.
**Action:** Default to streaming for proxy routes. Use `return new Response(externalResponse.body, { headers: ... })` to pipe the response through without buffering. Only use `await response.arrayBuffer()` or `.json()` if you need to transform the response body. The stream-through pattern works for any binary content (audio, video, images, PDFs) and large JSON responses.
**Anti-pattern:** Copy-pasting `await response.arrayBuffer()` across multiple proxy routes without considering whether buffering is necessary.
**Source:** Weather Mood audio performance overhaul, 2026-02-07. Third occurrence of this pattern (see common-mistakes.md for related buffering issues).

## Audit AI Prompts When Removing Features

**Context:** When removing features from an application that uses AI-generated content
**Learning:** Weather Mood's Claude prompt continued generating `SoundscapeProfile` (~700 tokens) after the Web Audio synth was removed. The unused output was invisible in normal testing but wasted tokens and latency on every request.
**Action:** When removing a feature, grep prompt files for references to the removed feature. For TypeScript-based prompts, search for type names, field names, and examples. Remove unused output fields from AI prompts immediately. If using structured output schemas, ensure the schema matches only what the application actually uses.
**Source:** Weather Mood SoundscapeProfile removal, 2026-02-07.

## Streaming State: Track Concerns Separately

**Context:** When implementing streaming APIs (Anthropic, OpenAI) that interleave tool_use and text blocks in a single stream
**Learning:** ProveIt's `searching:false` emission was gated on a `textBlockStarted` flag. The assumption: a text block would always precede a tool_use block. In practice, research-phase streams start immediately with `tool_use` (web search), so `textBlockStarted` was never set when `searching:false` needed to fire. The status indicator was stuck in "searching" state for the entire research phase.
**Action:** Track each observable concern as an independent state variable. Do not reuse one flag (e.g., `textBlockStarted`) to proxy a different concern (e.g., "has the search phase ended"). Specifically: `searchingActive` should be set true on first `tool_use` block and false when the first substantive text block begins — these are two separate events, not one. When adding state to a streaming parser, ask "what exact event changes this state?" — if the answer involves an unrelated event, the state is incorrectly coupled.
**Source:** ProveIt web build, 2026-02-22. `searching:false` was never emitted when streams started with tool_use blocks (~80% of Full Validation requests).

## Cross-Agent Feedback
- Architecture gaps → tell @retro to update @architect's memory
- Unclear PRD → tell @retro to update @strategist's memory
- Missing UI spec → tell @retro to update @designer's memory
- Infra issues → tell @retro to update @devsecops's memory
