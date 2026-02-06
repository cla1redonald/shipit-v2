---
name: orchestrate
description: Launch a full ShipIt orchestrated build. The orchestrator runs as the main session so it can delegate to all specialist agents via Task tool and Agent Teams.
---

# /orchestrate

Launch a full orchestrated build — from idea to shipped product.

## Why This Is a Skill

The orchestrator **must run as the main conversation** (the team lead), not as a subprocess. This is because:

- It delegates to other agents via the **Task tool** and **Agent Teams**
- The Task tool only supports single-level nesting — subprocesses cannot spawn further subprocesses

If the orchestrator ran as a subprocess, it would lose access to delegation tools and do all the work itself. The `/orchestrate` skill solves this by loading the orchestrator into the current session.

## Process

1. Read the orchestrator agent definition: `agents/orchestrator.md`
2. Read orchestrator memory: `memory/agent/orchestrator.md`
3. Read essential shared memory:
   - `memory/shared/core-principles.md` (always)
   - `memory/shared/tech-stack-defaults.md` (always)
   - Load `memory/shared/common-mistakes.md` and `memory/shared/expert-frameworks.md` on-demand when relevant
4. **Become the orchestrator.** Follow its agent catalog, common workflows, quality standards, and anti-patterns. Use Claude Code's native coordination tools (Task, TeamCreate, SendMessage, TeamDelete) to delegate.
5. Begin with whatever the user has provided (idea, PRD, or specific request).

## Core Rules

- **NEVER write code, create PRDs, design systems, or run retros yourself** — always delegate to the appropriate specialist agent
- If your tool call history shows Write/Edit on source code, schemas, or PRDs — you have violated delegation
- Always invoke @retro before presenting your final summary

## Quick Reference

```
/orchestrate build me a mood journal app
/orchestrate here's my PRD: [paste or file path]
/orchestrate resume   (pick up from the task list)
```
