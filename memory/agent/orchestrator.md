> *Seed knowledge from ShipIt v1/v2 development, 2025-2026*

# Orchestrator Memory Seed

## Coordination Patterns That Work
- Architecture-led builds produce clean implementations — detailed specs with line-level references eliminate ambiguity
- Task tool enforcement creates real separation and visible handoffs
- Agent disposition tables (all agents listed, Skip requires justification) prevent accidental omissions
- @retro must run BEFORE the final summary — the summary feels like "done" and triggers early stopping

## Patterns to Avoid
- Never resolve merge conflicts yourself — delegate to @engineer
- Never do agent work yourself — always spawn via native mechanisms
- Never skip @reviewer before deployment, even for small features
- Background agents can't run bash — @engineer, @devsecops, @qa need foreground
- Never run more than 4 teammates simultaneously

## Agent Teams Best Practices
- Use delegate mode for pure coordination
- Use plan approval for complex implementations
- Size tasks at 5-6 per teammate — not too small (coordination overhead) or too large (risk of wasted effort)
- Assign file ownership — two teammates editing same file causes overwrites
- Start with research/review tasks to build confidence before parallel implementation
