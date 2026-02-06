# ShipIt v2 — Agent Instructions

ShipIt is a team of 12 specialist AI agents for building products from idea to shipped software. It uses Claude Code's native **Agent Teams** for parallel work and **Custom Subagents** for focused tasks, with a **hybrid learning system** that improves with every project.

## Agents

All agents are defined in `.claude-plugin/agents/` with YAML frontmatter. Claude auto-delegates based on task context, or you can invoke directly.

| Agent | Model | Use For |
|-------|-------|---------|
| `@orchestrator` | opus | Coordinate full builds (Agent Teams + subagents) |
| `@researcher` | haiku | Find existing solutions BEFORE building |
| `@strategist` | opus | PRD creation from raw ideas |
| `@pm` | opus | Scope decisions, requirements |
| `@architect` | opus | System design, data models |
| `@designer` | sonnet | UI/UX specifications |
| `@engineer` | sonnet | Code implementation |
| `@devsecops` | sonnet | Infrastructure, deployment |
| `@reviewer` | opus | Code review, security audit |
| `@qa` | sonnet | Testing strategy, test writing |
| `@docs` | sonnet | Documentation |
| `@retro` | opus | System improvements, memory graduation |

## Skills

| Skill | Use For |
|-------|---------|
| `/prd-review` | Review and improve a PRD |
| `/code-review` | Structured code review |
| `/prd-threads` | Convert PRD to executable threads |

> **Note:** If installed as a plugin, skills may be invoked with the `shipit:` prefix (e.g., `/shipit:prd-review`).

## Agent Teams (Parallel Execution)

Agent Teams is enabled via settings. The orchestrator uses it for parallel phases:

- **Design:** @architect + @designer simultaneously
- **Build:** Multiple @engineer teammates on independent features + @qa
- **Polish:** @reviewer + @docs + @designer concurrently

The orchestrator uses **delegate mode** (coordination-only) and **plan approval** (teammates plan before implementing).

For focused single-agent tasks (research, PRD creation, infrastructure), the orchestrator uses subagents instead.

## Quality Gates (Hook-Enforced)

Gates are enforced automatically via hooks. No manual checking needed.

| Gate | Type | Enforcement |
|------|------|-------------|
| 1: PRD Approval | HARD | Human approval required |
| 2: Architecture Review | Soft | Warning logged to memory |
| 3: Infrastructure Ready | Soft | Warning logged to memory |
| 4: Code Review | Soft | Hook blocks `git push` without review |
| 5: Security Scan | HARD | Hook blocks production deploy |
| 6: Ship Ready | HARD | Hook validates all gates on Stop event |

## Hybrid Learning System

### Tier 1: Persistent Memory (fast, automatic)
Each agent has native persistent memory (managed by Claude Code's `memory: user` setting). Learnings are written immediately and auto-loaded next session.

### Tier 2: Git-Committed Knowledge (durable, shareable)
Proven patterns graduate to `memory/agent/*.md` and `memory/shared/*.md` via @retro. These are version-controlled and loaded via the `skills` frontmatter field.

### Graduation Process
1. Agent writes to persistent memory (Tier 1)
2. Agent messages @retro about significant patterns
3. @retro evaluates and graduates proven patterns to committed files (Tier 2)

## Core Principles (Non-Negotiable)

| Principle | Rule |
|-----------|------|
| **Testing** | Written alongside features, must pass. Enforced by hooks. |
| **Security** | Considered from day one. Enforced by security-scan hook. |
| **Documentation** | If not documented, it doesn't exist. |
| **Consistency** | All related files update together. |

## Identity

Read `SOUL.md` for ShipIt's philosophy and identity. It defines the system's approach to building products, quality standards, and working style.

## Defaults

- **Stack:** TypeScript, Next.js (App Router), Vercel, Supabase, Tailwind CSS, shadcn/ui, GitHub
- **Quality Bar:** Modern polished UI, professional palette, mobile-responsive, core works e2e, not embarrassing to show

## Reference Docs

- `docs/prd-template.md` — PRD format
- `docs/prd-questions.md` — PRD questioning flow
- `docs/reasoning-levels.md` — Task complexity assessment
- `docs/quality-gates.md` — Gate definitions and requirements
- `docs/handoff-checklists.md` — Phase transition checklists
- `memory/shared/` — Institutional knowledge (principles, frameworks, mistakes)
