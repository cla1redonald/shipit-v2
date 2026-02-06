# ShipIt v2

A team of 12 specialist AI agents for Claude Code that takes products from idea to shipped software.

## What It Does

ShipIt gives you a full product development team inside Claude Code:

- **@researcher** finds existing solutions before you build
- **@strategist** shapes ideas into clear PRDs
- **@architect** designs the system
- **@designer** specs the user experience
- **@engineer** writes the code
- **@reviewer** catches what others miss
- **@qa** writes tests alongside features
- **@docs** ensures knowledge survives
- **@orchestrator** coordinates the whole team

Agents work in parallel using Claude Code's native Agent Teams, communicate directly via messaging, and improve over time through persistent memory.

## Installation

### As a Plugin

```bash
# From the plugin marketplace (when published)
/plugin install shipit

# Or from local directory
claude --plugin-dir ./shipit-v2
```

### Manual Setup

1. Clone this repo
2. Ensure Claude Code is up to date
3. Agent Teams is enabled in `.claude/settings.json`

## Quick Start

```
# Full orchestrated build
Use @orchestrator to build [your idea]

# Individual agents
Use @researcher to find existing solutions for [problem]
Use @strategist to create a PRD for [idea]
Use @engineer to implement [feature]
```

## Architecture

### Two Coordination Modes

**Agent Teams** — for parallel phases where multiple agents work simultaneously:
- Design: @architect + @designer
- Build: multiple @engineer teammates + @qa
- Polish: @reviewer + @docs + @designer

**Subagents** — for focused single-agent tasks:
- Research, PRD creation, infrastructure setup, retrospectives

### Hybrid Learning System

**Tier 1 (Persistent Memory):** Each agent learns session-to-session via native Claude Code memory. Fast, automatic, no commits needed.

**Tier 2 (Committed Knowledge):** @retro graduates proven patterns to git-committed files in `memory/`. Durable, version-controlled, shareable.

### Quality Gates

Six gates enforced automatically via hooks:
- Gates 1, 5, 6 are HARD (block progression)
- Gates 2, 3, 4 are SOFT (warn and continue)

### Model Strategy

- **Opus** for thinkers: orchestrator, strategist, pm, architect, reviewer, retro
- **Sonnet** for executors: engineer, designer, devsecops, qa, docs
- **Haiku** for speed: researcher

## Project Structure

```
shipit-v2/
├── .claude-plugin/          # Plugin package
│   ├── plugin.json          # Manifest
│   ├── agents/              # 12 agent definitions
│   ├── skills/              # 3 skills (prd-review, code-review, prd-threads)
│   └── hooks/               # Quality gate enforcement
├── .claude/
│   └── settings.json        # Agent teams enabled, permissions
├── docs/                    # Reference materials
├── memory/                  # Hybrid learning system
│   ├── shared/              # Institutional knowledge
│   └── agent/               # Per-agent knowledge
├── CLAUDE.md                # Project instructions
├── SOUL.md                  # System identity
└── README.md                # This file
```

## Differences from v1

| v1 | v2 |
|----|-----|
| Sequential execution | Parallel via Agent Teams |
| HANDOFF.md bottleneck | Native inter-agent messaging |
| Custom `.shipit/` state | Native task list |
| Single `lessons-learned.md` | Hybrid memory system |
| TypeScript SDK | Eliminated (native features) |
| 8 skills | 3 skills (state management eliminated) |
| Manual quality gates | Hook-enforced gates |
| All same model | Opus/Sonnet/Haiku by role |

## License

MIT
