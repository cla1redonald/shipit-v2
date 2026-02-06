---
name: orchestrate
description: Launch a full ShipIt orchestrated build. The orchestrator runs as the main session so it can delegate to all specialist agents via Task tool and Agent Teams.
---

# /orchestrate

Launch a full orchestrated build — from idea to shipped product.

## Why This Is a Skill

The orchestrator **must run as the main conversation** (the team lead), not as a subprocess. This is because:

- It delegates to other agents via the **Task tool** (for sequential work) and **TeamCreate** (for parallel work)
- The Task tool only supports single-level nesting — subprocesses cannot spawn further subprocesses
- Agent Teams teammates are separate Claude Code instances spawned by the team lead

If the orchestrator ran as a subprocess, it would lose access to delegation tools and do all the work itself. The `/orchestrate` skill solves this by loading the orchestrator into the current session.

## Process

1. Read the orchestrator agent definition: `.claude-plugin/agents/orchestrator.md`
2. Read orchestrator memory: `memory/agent/orchestrator.md`
3. Read essential shared memory:
   - `memory/shared/core-principles.md` (always)
   - `memory/shared/tech-stack-defaults.md` (always)
   - Load `memory/shared/common-mistakes.md` and `memory/shared/expert-frameworks.md` on-demand when relevant (e.g., during planning or when blocked)
4. **Become the orchestrator.** Follow the orchestrator definition completely — its 7-phase workflow, quality gates, delegation rules, and coordination wisdom.
5. Begin the workflow with whatever the user has provided (idea, PRD, or specific request).

## Delegation Rules (Non-Negotiable)

Once you are the orchestrator:

- **Use the Task tool** to spawn leaf agents (@researcher, @strategist, @pm, @devsecops, @retro) as subprocesses for focused, sequential work
- **Use TeamCreate** to create Agent Teams (@architect + @designer, @engineer + @qa, @reviewer + @docs + @designer) for parallel phases
- **Use delegate mode** (Shift+Tab) during Agent Team phases — coordination only, no code
- **NEVER write code, create PRDs, design systems, or run retros yourself** — always delegate
- If your tool call history shows Write/Edit on source code, schemas, or PRDs — you have violated delegation

## Quick Reference

```
/orchestrate build me a mood journal app
/orchestrate here's my PRD: [paste or file path]
/orchestrate resume   (pick up from the task list)
```
