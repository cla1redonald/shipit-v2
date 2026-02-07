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

## Patterns to Avoid
- Never resolve merge conflicts yourself — delegate to @engineer
- Never do agent work yourself — always delegate via Task tool or Agent Teams
- Never skip @reviewer before deployment, even for small features
- Background agents can't run bash — @engineer, @devsecops, @qa need foreground
- Never run more than 4 teammates simultaneously
- Never spawn @orchestrator as a subprocess via Task tool — it loses delegation ability
- Never proceed with platform-specific design without first having @researcher fetch the actual documentation
- Never deploy without a successful local build (`next build` or equivalent) — the first deploy is the highest-risk deployment
- Never accept `legacy-peer-deps=true` in `.npmrc` as a solution — it hides real conflicts

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

## Agent Teams Tool Lifecycle
- `TeamCreate` → `TaskCreate` (with dependencies) → `Task` (with `team_name` + `mode: "plan"`) → assign tasks → review plans via `plan_approval_response` → `SendMessage` shutdown → `TeamDelete`
- Always create tasks BEFORE spawning teammates — they need tasks to claim via `TaskList`
- Set file ownership in task descriptions to prevent edit conflicts
- Use `plan_approval_response` to approve/reject — don't just send a regular message
- `TeamDelete` fails if teammates are still active — send `shutdown_request` first and wait for confirmation
- Teammates go idle between turns — this is normal. Send a message to wake them.
