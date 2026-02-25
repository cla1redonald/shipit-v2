# Case Study: Focus Timer

> Built 2026-02-24 using ShipIt's orchestrated workflow. First build after the orchestrator delegation guardrails, model passthrough, review-to-retro loop, and framework validation suite were added.

**Repo:** https://github.com/cla1redonald/focus-timer
**Live:** https://focus-timer-silk-seven.vercel.app

---

## What Was Built

A single-page Pomodoro timer web app with a calm, professional aesthetic. Standard 25/5/15 min cycles, SVG progress ring with phase-colored accents, synthesized ambient sound (Web Audio API, no audio files), keyboard shortcuts, browser notifications, dark/light theme, and localStorage session tracking. No auth, no backend, no database.

---

## Build Metrics

| Metric | Value |
|--------|-------|
| Source files | 62 |
| Tests | 361 (unit + integration) |
| Test files | 19 |
| First-load JS | 93.2 kB (budget: <150 kB) |
| React version | 18.3.1 (pinned) |
| Hardcoded colors | 0 (all via CSS custom properties) |
| Build threads | 6 (2 parallel pairs) |
| Review findings (must-fix) | 3 (all resolved before ship) |
| Deploy failures | 0 |

---

## Workflow Execution

### Agent Sequence

```
@strategist (PRD + APP_FLOW)
    |
    v
@architect + @designer  [parallel]
    |
    v
@engineer T1 (scaffold + timer engine)
    |
    v
@engineer T2 (timer UI + progress ring)
    |
    v
@engineer T3 (sound) + @engineer T4 (shortcuts)  [parallel]
    |
    v
@engineer T5 (theme + polish)
    |
    v
@reviewer + @docs  [parallel]
    |
    v
@engineer (review fixes + integration tests)
    |
    v
@retro (4 learnings graduated to Tier 2)
    |
    v
Ship
```

### Agent Model Assignments

| Agent | Model | Phase |
|-------|-------|-------|
| @strategist | opus | PRD creation |
| @architect | opus | System design |
| @designer | sonnet | Visual design system |
| @engineer (x7 invocations) | sonnet | All build threads + review fixes |
| @reviewer | sonnet | Code review |
| @docs | sonnet | README |
| @retro | opus | Retrospective — graduated 4 learnings to Tier 2 |

---

## What Went Well

### Parallel Execution Worked Cleanly

Two parallel pairs ran with zero file conflicts:
- **Design phase:** @architect (ARCHITECTURE.md, TECH_STACK.md) + @designer (FRONTEND_GUIDELINES.md) — completely independent deliverables
- **Build phase:** T3 (sound: hooks/useAmbientSound, lib/sound-generator, components/sound-controls) + T4 (shortcuts: hooks/useKeyboardShortcuts, hooks/useNotifications, components/shortcut-hints) — independent file trees

The PRD's file ownership map (APP_FLOW.md) explicitly assigned each file to a thread, which prevented conflicts.

### Model Passthrough Worked Correctly

The orchestrator passed `model: "opus"` for @architect and @retro, `model: "sonnet"` for @engineer, @designer, @reviewer, @docs. This was the first build using the mandatory model passthrough added in the orchestrator guardrails PR. No agent ran at the wrong model level.

### Pre-Flight Check Confirmed Opus

The `/orchestrate` skill's pre-flight check verified the session was running as Opus before starting. This was the guardrail added to prevent the delegation failure that prompted the original investigation.

### Code Review Caught Real Bugs

@reviewer found 3 must-fix issues that would have caused real user-facing problems:

1. **`notify` type mismatch** — Interface declared `void`, implementation was `Promise<void>`. On first visit (notification permission not yet granted), the permission dialog would appear asynchronously and the first notification would silently fail.

2. **Missing integration tests** — The `src/__tests__/integration/` directory was empty despite the PRD, architecture doc, and README all claiming integration tests existed. This is the same pattern that caused 10 post-deploy bugs in London Transit Pulse.

3. **Double `aria-live="assertive"`** — Both the PhaseIndicator component and a separate sr-only region in page.tsx were marked assertive, causing screen readers to announce phase transitions twice.

### Test-Alongside-Feature Pattern

Tests were written in each build thread, not deferred to a later thread. By the time the review phase started, 334 tests already existed. The review added 27 more integration tests, bringing the total to 361.

### Bundle Size Well Under Budget

93.2 kB first-load JS against a 150 kB budget. Key decisions that kept it small:
- Web Audio API synthesized sound (no audio file imports)
- Only 2 shadcn/ui components (Button, Slider)
- No state management library (hooks only)
- System font stack with Inter as a web font

---

## What Could Improve

### Integration Tests Were Not Written During Build

Despite the PRD allocating Thread 6 specifically for integration tests, no build thread actually wrote them. @reviewer caught this gap. The integration tests were written during the review fix phase instead.

**Learning:** Integration tests should be part of each feature thread's definition of done, not deferred to a separate "testing thread." The PRD thread structure encouraged this deferral by making T6 a dedicated testing thread.

### @retro Required a Second Invocation

The first @retro invocation timed out due to a connectivity issue. A second invocation with a narrower, enumerated prompt (5 specific learnings to evaluate) completed successfully and graduated 4 patterns to Tier 2 memory across 6 files. Lesson: narrow prompts with explicit scope boundaries are more resilient than broad "evaluate the whole build" prompts.

### .gitignore Was Missing From Scaffold

Thread 1 (scaffold) did not create a `.gitignore`. The first `git add -A` committed `node_modules/` and `.next/`, requiring history rewriting before push. This should be a mandatory scaffold checklist item.

### Should-Fix Items Were Already Correct

5 of the reviewer's "should fix" items turned out to already be implemented correctly. This suggests the reviewer may have been working from a slightly stale snapshot of the codebase, or the review prompt did not emphasize checking current state before flagging issues.

---

## Learnings Graduated by @retro

| # | Learning | Tier | Target Files |
|---|----------|------|--------------|
| 1 | Missing .gitignore in scaffold — 2nd scaffold infrastructure failure across projects | Tier 2 | common-mistakes.md, engineer.md, devsecops.md |
| 2 | Integration tests deferred to standalone thread — 3rd occurrence (London, NYC, Focus Timer) | Tier 2 | common-mistakes.md, engineer.md, qa.md, orchestrator.md |
| 3 | async/void type mismatch — TypeScript silently allows, notifications fail at runtime | Tier 2 | common-mistakes.md, engineer.md, reviewer.md |
| 4 | Double aria-live="assertive" — screen reader double-announcements | Tier 1 | Persistent memory only (first occurrence) |
| 5 | @retro needs narrow enumerated prompts, not broad "evaluate everything" | Tier 2 | orchestrator.md |

---

## ShipIt Features Validated

This build was the first to use several new ShipIt features added earlier in the same session:

| Feature | Status | Notes |
|---------|--------|-------|
| Orchestrator pre-flight model check | Confirmed working | Verified Opus before starting |
| Mandatory model passthrough | Confirmed working | All agents ran at designated model level |
| Removed 3-agent parallel cap | Confirmed working | Parallel pairs ran without artificial limit |
| `/shipit` PR + review + merge workflow | Not tested | Build used `/orchestrate`, not `/shipit` |
| Review-to-retro loop | Confirmed working | @reviewer found 3 must-fix issues, @retro graduated 4 learnings to Tier 2 |
| 190-test framework validation suite | Not run during build | Framework tests validate ShipIt itself, not project builds |

---

## Tech Stack

| Package | Version | Purpose |
|---------|---------|---------|
| Next.js | 14.2.21 | Framework |
| React | 18.3.1 | UI (pinned, not 19) |
| TypeScript | 5.7.3 | Language |
| Tailwind CSS | 3.4.17 | Styling |
| shadcn/ui | Button + Slider | Component primitives |
| Vitest | 2.1.8 | Testing |
| Web Audio API | Browser native | Ambient sound |

No database. No auth. No API routes. Client-side only.
