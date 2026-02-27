> *Seed knowledge from ShipIt development, 2025-2026*

# Orchestrator Memory Seed

## Coordination Patterns That Work
- Architecture-led builds produce clean implementations — detailed specs with line-level references eliminate ambiguity
- Agent Teams with delegate mode creates real separation — teammates work independently with their own context
- Agent disposition tables (all agents listed, Skip requires justification) prevent accidental omissions
- @retro must run BEFORE the final summary — the summary feels like "done" and triggers early stopping

## Invocation Pattern
- Always invoked via `/orchestrate` skill (loads into main conversation as team lead)
- NEVER spawned as a subprocess — cannot delegate if running as subprocess
- If detected running as subprocess, report error immediately and stop
- Two delegation mechanisms: Task tool (sequential) and TeamCreate (parallel)

## Mandatory Documentation Research for Platform Builds

**Context:** When building ON a platform (not just WITH a platform) — e.g., building a Claude Code plugin, a Vercel integration, a Supabase extension.
**Learning:** ShipIt v2 shipped with the wrong plugin directory structure because no agent fetched and read the actual Anthropic documentation, despite the user explicitly asking for it. The builder's pre-existing knowledge was stale/incorrect. Every agent assumed the structure was correct. The user had to audit it themselves.
**Action:** Before @architect begins design, the orchestrator MUST create a blocking task for @researcher to fetch the platform's official documentation via WebFetch. The output must be provided to @architect as a concrete reference document. "I know the docs" is not acceptable — "I read the docs just now and here is what they say" is the standard.
**Source:** ShipIt v2 plugin structure failure, 2026-02-06. Required v2.1 restructure after user audit.

## Subdirectory App Scaffold: Requires Own settings.json

**Context:** When the build creates a subdirectory app (e.g., `web/`, `frontend/`) inside a repo that has a restrictive root `.claude/settings.json`
**Learning:** ProveIt's root settings restrict Bash to WebSearch/WebFetch only (intentional security policy). When @devsecops scaffolded `web/` as a Next.js app, Bash permission prompts interrupted every subagent file write despite `bypassPermissions` mode. Root-level permission restrictions propagate into subdirectory work contexts.
**Action:** When authorizing @devsecops to scaffold a subdirectory app, include this in the task: "Create `{subdir}/.claude/settings.json` with Bash allowed before running npm install or any shell commands." This prevents permission interruptions from blocking the scaffold phase and keeps the root security policy intact.
**Source:** ProveIt web build, 2026-02-22.

## Integration Tests: Never Defer to a Standalone Thread

**Context:** When reviewing or approving a PRD/thread plan that includes a dedicated "Integration Tests" thread
**Learning:** Three projects have allocated a standalone thread for integration tests, and all three times the thread was either cut, deferred, or produced shallow tests: London Transit Pulse (4 integration bugs post-deploy), NYC Transit Pulse (shallow), Focus Timer (empty folder caught by @reviewer). The pattern: feature threads overrun, the integration test thread gets deprioritized, and the project ships without integration coverage.
**Action:** During PRD review or thread planning, reject any plan that has a standalone "Integration Tests" thread. Instead, require each feature thread to include integration test(s) in its definition of done. When spawning @engineer for a feature thread, include in the task description: "Thread is not complete until at least one integration test exists proving this feature works with real app context." When spawning @qa, include: "Verify integration tests exist per feature, not in a separate thread."
**Source:** Focus Timer, 2026-02-25. Third occurrence -- pattern proven.

## Retro Agent Invocation: Use Narrow, Enumerated Prompts

**Context:** When invoking @retro at end-of-project or end-of-phase
**Learning:** Focus Timer's @retro was given a broad "evaluate the entire build" prompt and timed out after 43 minutes without producing output. The same retro, re-invoked with 5 specific enumerated learnings and explicit scope boundaries ("do NOT read the entire codebase"), completed successfully.
**Action:** When invoking @retro, always provide: (1) a numbered list of specific learnings to evaluate, (2) the target agents for each learning, (3) an explicit scope boundary ("evaluate ONLY these N learnings, do not read the full codebase"). Never give @retro an open-ended "evaluate the entire build" prompt. If the build produced many learnings, batch them into groups of 5-7 with separate @retro invocations.
**Source:** Focus Timer, 2026-02-25.

## Patterns to Avoid
- Never resolve merge conflicts yourself — delegate to @engineer
- Never do agent work yourself — always delegate via Task tool or Agent Teams
- Never skip @reviewer before deployment, even for small features
- Background agents can't run bash — @engineer, @devsecops, @qa need foreground
- Parallelism is limited by task dependencies and file ownership, not an arbitrary cap — reduce incrementally if rate-limited
- Never spawn @orchestrator as a subprocess via Task tool — it loses delegation ability
- Never proceed with platform-specific design without first having @researcher fetch the actual documentation
- Never deploy without a successful local build (`next build` or equivalent) — the first deploy is the highest-risk deployment
- Never accept `legacy-peer-deps=true` in `.npmrc` as a solution — it hides real conflicts
- If you observe an agent using Bash heredocs (`cat > file << 'EOF'`) to create files, stop them immediately — this corrupts `settings.local.json`. All file creation must use the Write tool, all file modification must use the Edit tool.

## Pre-Deploy Gate (Hard Requirement)
Before authorizing @devsecops to deploy:
1. @engineer must confirm `next build` succeeds locally
2. @qa must confirm integration tests exist for all shared state (filters, toggles, context)
3. @devsecops must confirm `.gitignore` does not exclude any paths that source code imports from
This gate was missing from London Transit Pulse and resulted in 4 deploy failures and 4 data integration bugs found by the user post-deploy.

## When NOT to Use Agent Teams

**Context:** When deciding between single-agent delegation (Task tool) and Agent Teams (TeamCreate) for a build
**Learning:** Portfolio build session (2026-02-27) completed 3 projects using single @engineer delegation per project. Each project was 10-15 source files with a "polished but not production-grade" quality bar. Parallel coordination overhead would have exceeded build time savings. AI Interview Coach: ~29 min. Prompt Evaluator: ~16 min. AI Cost Calculator: ~9 min.
**Action:** Use single-agent delegation (not Agent Teams) when: (a) the project is small (under ~20 source files), (b) the quality bar is below production-grade, (c) there are no independent parallel workstreams with distinct file ownership. Agent Teams are for projects with 3+ parallel workstreams that have clear file boundaries. Do not default to teams just because multiple phases exist — sequential single-agent delegation is simpler and faster for small projects.
**Source:** Portfolio build session, 2026-02-27.

## Agent Teams Best Practices
- Use delegate mode for pure coordination
- Use plan approval for complex implementations
- Size tasks at 5-6 per teammate — not too small (coordination overhead) or too large (risk of wasted effort)
- Assign file ownership — two teammates editing same file causes overwrites
- Start with research/review tasks to build confidence before parallel implementation

## Model Passthrough (Critical)

**Context:** When the orchestrator spawns agents via Task tool without passing the `model` parameter, all agents inherit the orchestrator's model instead of running at their designated level.
**Learning:** On Sonnet, the orchestrator didn't delegate at all — it did the work itself. Even on Opus, omitting `model` means @researcher runs as opus (wasteful) and if the session were ever sonnet, @architect would run as sonnet (quality loss).
**Action:** ALWAYS pass `model: "opus"`, `model: "sonnet"`, or `model: "haiku"` matching the agent table when calling Task tool. This is non-negotiable.
**Source:** Orchestrator delegation failure diagnosis, 2026-02-24.

## Orchestrator Requires Opus

**Context:** The `/orchestrate` skill loads the orchestrator into the user's current session model, not the `model: opus` specified in the agent YAML.
**Learning:** When the user's session was on a non-Opus model, the orchestrator failed to follow the delegation protocol — it started doing work itself instead of spawning agents, and did not create Agent Teams for parallel phases.
**Action:** The `/orchestrate` skill now includes a pre-flight model check. If not running as Opus, warn the user and stop. Do not attempt orchestration on non-Opus models.
**Source:** Orchestrator delegation failure diagnosis, 2026-02-24.

## Agent Teams Tool Lifecycle
- `TeamCreate` → `TaskCreate` (with dependencies) → `Task` (with `team_name` + `mode: "plan"`) → assign tasks → review plans via `plan_approval_response` → `SendMessage` shutdown → `TeamDelete`
- Always create tasks BEFORE spawning teammates — they need tasks to claim via `TaskList`
- Set file ownership in task descriptions to prevent edit conflicts
- Use `plan_approval_response` to approve/reject — don't just send a regular message
- `TeamDelete` fails if teammates are still active — send `shutdown_request` first and wait for confirmation
- Teammates go idle between turns — this is normal. Send a message to wake them.
