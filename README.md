# ShipIt v2

A team of 12 specialist AI agents for Claude Code that takes products from idea to shipped software.

## What It Does

ShipIt gives you a full product development team inside Claude Code:

- **@researcher** finds existing solutions before you build
- **@strategist** shapes ideas into clear PRDs
- **@pm** makes scope decisions and guards requirements
- **@architect** designs the system
- **@designer** specs the user experience
- **@engineer** writes the code
- **@devsecops** handles infrastructure, deployment, and security
- **@reviewer** catches what others miss
- **@qa** writes tests alongside features
- **@docs** ensures knowledge survives
- **@retro** runs retrospectives and graduates learnings into the system
- **@orchestrator** coordinates the whole team

Agents work in parallel using Claude Code's native Agent Teams, communicate directly via messaging, and improve over time through persistent memory.

## Prerequisites

- **Claude Code** (latest version)
- **Agent Teams** enabled (see Setup below)

## Installation

### Step 1: Enable Agent Teams

Add this to your **user-level** Claude Code settings (`~/.claude/settings.json`):

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

If you already have a `~/.claude/settings.json`, merge the `env` key into it.

### Step 2: Install the Plugin

**Clone the repo** (if you haven't already):

```bash
git clone https://github.com/cla1redonald/shipit-v2.git ~/shipit-v2
```

**Register as a local marketplace** in your **user-level** settings (`~/.claude/settings.json`):

```json
{
  "extraKnownMarketplaces": {
    "shipit": {
      "source": {
        "source": "directory",
        "path": "/absolute/path/to/shipit-v2"
      }
    }
  },
  "enabledPlugins": {
    "shipit@shipit": true
  }
}
```

> **Important:** Use the absolute path to your cloned `shipit-v2` directory. Merge these keys into your existing settings — don't replace the whole file.

**Alternative — Single session (no persistent install):**

```bash
claude --plugin-dir ~/shipit-v2
```

This loads the plugin for one session only. Use the marketplace method above for persistent access across all projects.

### Step 3: Verify Installation

Start a new Claude Code session and check that agents are available:

```
# Try invoking an agent
Use @researcher to find existing solutions for task management apps

# Try a skill
/prd-review
```

You should see the agents listed in Claude Code's skill/agent list.

## Quick Start

```
# Full orchestrated build — PRD to shipped product
/orchestrate build [your idea]

# Individual agents for specific tasks
Use @researcher to find existing solutions for [problem]
Use @strategist to create a PRD for [idea]
Use @architect to design the system for [PRD]
Use @engineer to implement [feature]
Use @reviewer to review the code
```

> **Important:** Use `/orchestrate` (not `@orchestrator`) to start a full build. The orchestrator must run as the main session to delegate to other agents. See [Troubleshooting](#orchestrator-not-delegating) if agents aren't being invoked.

### Skills

```
/orchestrate    — Launch a full orchestrated build (main session)
/shipit         — Enforced commit workflow (test → typecheck → build → commit → retro → docs → push)
/prd-review     — Review and improve a PRD
/code-review    — Structured code review
/prd-threads    — Convert a PRD into executable implementation threads
```

> **Note:** If installed as a plugin, commands use the `shipit:` prefix (e.g., `/shipit:prd-review`).

## Architecture

### How It Works

ShipIt provides **expert agents** and **quality enforcement**. Claude Code handles coordination natively.

**Expert Agents** — 12 specialist agent definitions with deep domain knowledge (security checklists, test strategies, review patterns, architecture principles). Each agent is 150-400 lines of expertise loaded on demand.

**Quality Hooks** — Automatic enforcement that blocks pushes without tests, deploys without security review, and validates on agent stop.

**Hybrid Memory** — Agents learn session-to-session. @retro graduates proven patterns to git-committed knowledge files.

**Native Coordination** — Claude Code's Agent Teams and Task tool handle team creation, parallelization, and messaging. ShipIt doesn't duplicate this — it provides the specialists and the standards.

### Hybrid Learning System

**Tier 1 (Persistent Memory):** Each agent learns session-to-session via native Claude Code memory. Fast, automatic, no commits needed.

**Tier 2 (Committed Knowledge):** @retro graduates proven patterns to git-committed files in `memory/`. Durable, version-controlled, shareable.

### Quality Gates

Six gates enforced automatically via hooks:

| Gate | Type | What It Checks |
|------|------|----------------|
| 1. PRD Approval | HARD | User must approve scope |
| 2. Architecture Review | Soft | Design soundness |
| 3. Infrastructure Ready | Soft | Deployment working |
| 4. Code Review | Soft | Tests pass, build succeeds before push |
| 5. Security Scan | HARD | No secrets, no vulnerabilities before deploy |
| 6. Ship Ready | HARD | All gates passed on completion |

### Model Strategy

- **Opus** for thinkers: orchestrator, strategist, pm, architect, reviewer, retro
- **Sonnet** for executors: engineer, designer, devsecops, qa, docs
- **Haiku** for speed: researcher

## Project Structure

```
shipit-v2/
├── .claude-plugin/
│   └── plugin.json          # Plugin manifest (auto-discovers components)
├── .claude/
│   └── settings.json        # Project-level settings (Agent Teams, permissions)
├── agents/                  # 12 agent definitions (YAML frontmatter)
├── commands/                # 5 commands (orchestrate, shipit, prd-review, code-review, prd-threads)
├── hooks/                   # Quality gate enforcement
│   ├── hooks.json           # Hook configuration
│   ├── pre-push-check.js    # Gate 4: blocks push without review
│   ├── security-scan.js     # Gate 5: blocks deploy without security check
│   └── post-completion.js   # Gate 6: validates on agent stop
├── docs/                    # Reference materials
│   ├── prd-template.md      # PRD format
│   ├── prd-questions.md     # 17-step questioning flow
│   ├── reasoning-levels.md  # Task complexity assessment
│   ├── quality-gates.md     # Gate definitions
│   ├── phase-checklists.md  # Phase checklists and deliverables
│   └── recommended-hooks.md # Recommended project hooks
├── memory/                  # Hybrid learning system
│   ├── shared/              # Institutional knowledge (all agents read)
│   └── agent/               # Per-agent knowledge (graduated by @retro)
├── CLAUDE.md                # Project instructions
├── SOUL.md                  # System identity and philosophy
└── README.md                # This file
```

## Configuration

### Project-Level Settings (`.claude/settings.json`)

The repo includes a project-level settings file that enables Agent Teams and configures permissions. This file is used when you work **inside** the shipit-v2 repo itself (e.g., to develop or test agents).

When ShipIt is installed as a **plugin** in another project, hooks are auto-discovered from `hooks/hooks.json`. You still need Agent Teams enabled in your user-level or project-level settings.

### Hooks

Quality gates are enforced by three hook scripts:

- **`pre-push-check.js`** — Blocks `git push` if tests fail, build fails, or conflict markers exist
- **`security-scan.js`** — Blocks `vercel --prod` if secrets are exposed
- **`post-completion.js`** — Validates test coverage when agents stop

All hooks are **fail-closed**: if a hook crashes, it blocks the action rather than silently allowing it.

### Setting Up Hooks in Your Project

Hooks are auto-discovered from `hooks/hooks.json` when the plugin is loaded. No manual hook configuration needed in your project's settings.

## Troubleshooting

### Agents not loading

- Ensure the plugin is installed: `claude --plugin-dir ~/shipit-v2`
- Start a fresh session after installing
- Check that `.claude-plugin/plugin.json` exists and `agents/` directory contains agent definitions

### Agent Teams not working

- Ensure `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` is set in your settings
- Agent Teams is experimental — if unavailable, the orchestrator falls back to sequential subagents

### Hooks blocking unexpectedly

- Hooks only activate on specific commands (`git push` and `vercel --prod`)
- Check the hook output for the specific error message
- If a hook is crashing, check that Node.js is available

### Orchestrator not delegating

The orchestrator must run as the **main conversation** (team lead), not as a subprocess. If agents aren't being invoked:

- Use `/orchestrate` (or `/shipit:orchestrate`) to start a full build
- Do NOT use `@orchestrator` or spawn it via Task tool — it will lose delegation ability
- The Task tool only supports single-level nesting: the orchestrator needs to be top-level to spawn subagents
- If the orchestrator is writing code itself instead of delegating, it was likely spawned as a subprocess

### Skills not found

- Try with the `shipit:` prefix: `/shipit:prd-review`
- Verify the plugin is loaded by checking the skill list

## Token Usage

ShipIt coordinates multiple agents, each consuming tokens. Usage scales with project complexity and the number of agents invoked.

### Estimates by Project Size

| Project | Agents Invoked | Estimated Tokens | Example |
|---------|---------------|-----------------|---------|
| **Simple** | 2-3 | ~150-200k | Counter app, landing page |
| **Medium** | 5-7 | ~400-800k | CRUD app, dashboard |
| **Full build** | 8-12 (with Agent Teams) | ~700k-1.3M+ | Multi-feature product, PRD to production |

### Why Token Usage Is High

- **Opus agents** (orchestrator, strategist, pm, architect, reviewer, retro) use ~5x the quota of Sonnet agents
- **Agent Teams** create separate Claude Code instances — each teammate has its own context window
- The orchestrator reads agent definitions, memory files, and all agent output, adding coordination overhead

### Recommendations

- **Max plan gives the best experience.** Full orchestrated builds with Agent Teams and multiple Opus agents work comfortably on Max. Pro plan users may hit usage limits on larger projects.
- **Start with individual agents** (`@engineer`, `@reviewer`) to get value without the full orchestration overhead
- **The orchestrator is lightweight** — it delegates to specialists and lets Claude coordinate natively
- **Use `/orchestrate` for real projects**, individual agents for quick tasks

## License

MIT
