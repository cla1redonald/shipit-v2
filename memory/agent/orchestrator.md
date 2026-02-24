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
