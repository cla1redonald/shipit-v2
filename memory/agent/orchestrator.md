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

## Patterns to Avoid
- Never resolve merge conflicts yourself — delegate to @engineer
- Never do agent work yourself — always delegate via Task tool or Agent Teams
- Never skip @reviewer before deployment, even for small features
- Background agents can't run bash — @engineer, @devsecops, @qa need foreground
- Never run more than 4 teammates simultaneously
- Never spawn @orchestrator as a subprocess via Task tool — it loses delegation ability

## Agent Teams Best Practices
- Use delegate mode for pure coordination
- Use plan approval for complex implementations
- Size tasks at 5-6 per teammate — not too small (coordination overhead) or too large (risk of wasted effort)
- Assign file ownership — two teammates editing same file causes overwrites
- Start with research/review tasks to build confidence before parallel implementation
