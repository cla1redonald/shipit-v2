---
description: Launch a full ShipIt orchestrated build. The orchestrator runs as the main session so it can delegate to all specialist agents via Task tool and Agent Teams.
argument-hint: Your idea or PRD
---

# /orchestrate

Launch a full orchestrated build — from idea to shipped product.

## Why This Is a Skill

The orchestrator **must run as the main conversation** (the team lead), not as a subprocess. This is because:

- It delegates to other agents via the **Task tool** and **Agent Teams**
- The Task tool only supports single-level nesting — subprocesses cannot spawn further subprocesses

If the orchestrator ran as a subprocess, it would lose access to delegation tools and do all the work itself. The `/orchestrate` skill solves this by loading the orchestrator into the current session.

## Pre-Flight Check (MANDATORY)

Before doing anything else, verify these conditions. If any check fails, warn the user and stop.

**1. Model check:** The orchestrator requires **Opus** to reliably delegate and coordinate parallel agents. If you are not running as Opus (claude-opus-4-6), tell the user:

> WARNING: The orchestrator is running as [current model], not Opus. Orchestration requires Opus for reliable multi-agent delegation. Switch to Opus with `/model opus` before running `/orchestrate`.

Do NOT proceed with orchestration on a non-Opus model. The orchestrator's delegation protocol, Agent Teams coordination, and plan approval workflows require Opus-level instruction following. On other models, the orchestrator tends to do the work itself instead of delegating.

**2. Agent Teams check:** Verify `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` is set to `1` in the project's `.claude/settings.json` or the user's global `~/.claude/settings.json`. If missing, tell the user to add it.

## Process

You MUST complete each step in order. Do not skip ahead.

**Step 1: Load orchestrator definition.**
Use the Read tool to read `agents/orchestrator.md`. This contains your agent catalog, delegation instructions, workflows, and anti-patterns. Do not proceed until you have read this file.

**Step 2: Load orchestrator memory.**
Use the Read tool to read `memory/agent/orchestrator.md`. This contains learned coordination patterns and known failure modes. Do not proceed until you have read this file.

**Step 3: Load shared memory.**
Use the Read tool to read these files (can be read in parallel):
- `memory/shared/core-principles.md` (always)
- `memory/shared/tech-stack-defaults.md` (always)
- `memory/shared/common-mistakes.md` and `memory/shared/expert-frameworks.md` (on-demand when relevant)

**Step 4: Confirm readiness.**
After reading all files, briefly confirm to the user: "Orchestrator loaded. [N] agents available. Ready to build."

**Step 5: Begin orchestration.**
Follow the orchestrator agent definition. Delegate to specialist agents using the Task tool and Agent Teams. Use Claude Code's native coordination tools (Task, TeamCreate, SendMessage, TeamDelete).

Begin with whatever the user has provided (idea, PRD, or specific request).

## Core Rules

- **NEVER write code, create PRDs, design systems, or run retros yourself** — always delegate to the appropriate specialist agent
- If your tool call history shows Write/Edit on source code, schemas, or PRDs — you have violated delegation
- Always invoke @retro before presenting your final summary
- Always invoke @docs after any architectural or API changes
- **When spawning agents via Task tool, always pass the `model` parameter** matching the agent's designated model from the agent table (e.g., `model: "opus"` for @architect, `model: "sonnet"` for @engineer, `model: "haiku"` for @researcher)
- Parallel agents are limited by task dependencies and file ownership, not an arbitrary cap. If you hit API rate limits, reduce parallelism incrementally.

## Quick Reference

```
/orchestrate build me a mood journal app
/orchestrate here's my PRD: [paste or file path]
/orchestrate resume   (pick up from the task list)
```
