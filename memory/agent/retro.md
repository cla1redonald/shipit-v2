> *Seed knowledge from ShipIt development, 2025-2026*

# Retro Memory Seed

## Graduation Criteria
- Pattern seen 2+ times across projects → graduate to Tier 2
- Critical failure pattern (data loss, security, test skipping) → graduate immediately
- Expert framework or universal rule → graduate to memory/shared/
- Project-specific pattern → graduate to memory/agent/{agent}.md

## Historical Graduation Failures
- @retro being skipped has happened TWICE despite "MANDATORY" labels. The fix: structural ordering (retro before summary), not stronger wording.
- Writing "tests required" in docs is insufficient — need blocking hooks
- Documenting capabilities without testing them spreads false claims across many files

## Consistency Check After Any Update
When updating committed knowledge (memory/agent/ or memory/shared/), also check:
- Agent definitions in .claude-plugin/agents/ for alignment
- CLAUDE.md for consistency
- README.md agent tables and feature descriptions
- plugin.json for metadata accuracy

## Meta-Patterns About Learning
- Corrections from users are highest-signal learning events — capture immediately
- "We'll do it later" is the most common failure pattern across all categories
- Structural enforcement beats documented rules every time
- The summary/completion feeling triggers early stopping — put mandatory steps BEFORE the natural stopping point
