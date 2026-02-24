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
- Agent definitions in agents/ for alignment
- CLAUDE.md for consistency
- README.md agent tables and feature descriptions
- plugin.json for metadata accuracy

## Runtime Bugs Missed by Review
- **Phaser PostFX pipeline init (Retro Pinball, 2026-02-06):** `new CRTFilter(game)` + `setPostPipeline(instance)` crashed at runtime because Phaser needs to instantiate the pipeline itself to compile the WebGL shader. Fix: pass the *class* to `setPostPipeline(CRTFilter)`, then retrieve with `getPostPipeline(CRTFilter)`. This passed code review and all 140 tests because unit tests don't run WebGL. **Lesson:** Framework lifecycle methods (Phaser pipelines, React refs, etc.) that require the framework to instantiate objects are invisible to static review and mocked tests — only caught by running the app.
- **`Date.now()` vs game clock (Retro Pinball, 2026-02-06):** `GravityWell` used `Date.now()` for capture timing, which keeps ticking during pause. Fix: use `this.scene.time.now`. **Lesson:** Real-time clocks in pausable game loops are always wrong — use the engine's time source.

## Review-to-Retro Loop

**Context:** @retro is now invoked after every PR code review in the `/shipit` workflow (Step 11).
**Learning:** Review findings are the second-highest-signal learning source after user corrections. A "Must Fix" that slipped through implementation reveals a gap in agent knowledge that, if not captured, will recur. Review findings that needed multiple fix cycles are the strongest graduation candidates.
**Action:** When invoked after review, cross-reference every finding against existing committed memory. Recurring patterns graduate immediately. First-time non-critical findings (including actionable "Nice to Have" items) go to Tier 1. Update `memory/agent/reviewer.md` only when the finding represents a class of issue @reviewer should detect earlier — not for every finding.
**Source:** ShipIt workflow enhancement, 2026-02-24.

## Meta-Patterns About Learning
- Corrections from users are highest-signal learning events — capture immediately
- Review findings are second-highest-signal — always invoke @retro after code review
- "We'll do it later" is the most common failure pattern across all categories
- Structural enforcement beats documented rules every time
- The summary/completion feeling triggers early stopping — put mandatory steps BEFORE the natural stopping point

## Distinguish Fabrication from Misimplementation

**Context:** When classifying platform-related failures for graduation
**Learning:** "Hallucinated Platform Features" (inventing features that do not exist) and "Confident Misimplementation" (implementing real features with wrong structure) are distinct failure modes with different detection strategies. Fabrication is caught when the feature does not work at all. Misimplementation appears to work locally but fails at distribution/discovery time. ShipIt v2 had both: `hooks:` YAML was fabrication, `.claude-plugin/agents/` was misimplementation.
**Action:** When evaluating a platform-related failure, classify it as one of three modes: (1) Fabrication — feature does not exist, (2) Misimplementation — feature exists but structure is wrong, (3) Docs-Say-But-Didn't-Read — user gave correct instruction, builder ignored it. Each requires different prevention: fabrication needs testing, misimplementation needs doc verification, docs-ignored needs process enforcement.
**Source:** ShipIt v2 retro, 2026-02-06.

## User Trust Erosion Is a Critical Failure

**Context:** When evaluating severity of process failures
**Learning:** When a user gives explicit instructions ("follow the official docs") and the system fails to follow them, the resulting trust erosion is itself a critical failure — independent of the technical severity of the bug. The user having to audit the system's work against docs they already referenced is a process failure that graduates immediately, regardless of how many times it has occurred.
**Action:** Any failure where the user had to catch something the system should have caught — especially when the user gave explicit instructions that were acknowledged but not followed — is an immediate Tier 2 graduation. Do not wait for a second occurrence.
