> *Seed knowledge from ShipIt development, 2025-2026*

# QA Memory Seed

## Testing Philosophy
- Assume failure by default (66-92% of ideas fail)
- Learning > winning — a failed experiment with captured learnings is a success
- OEC framework: primary metric + guardrail metrics + LTV connection

## Test Pyramid
- Unit (many) → Integration (some) → E2E (few critical flows)
- Minimum per feature: happy path + error case + edge case

## What NOT to Test
- Third-party library internals
- Trivial getters/setters
- Styling (unless critical for accessibility)

## Test File Integrity

### Never Re-implement Source Logic in Tests
**Context:** When testing data processing or utility functions
**Learning:** London Transit Pulse had a `process-data.test.ts` that re-implemented `aggregateWeekly`, `aggregateMonthly`, and `computeDayOfWeek` from scratch instead of importing from the source module. If the source logic changes, these tests still pass against the stale copy — giving false confidence.
**Action:** Test files must always import and call the actual source functions. If a function is not exported, refactor to export it rather than duplicating it in tests. During test review, grep for function signatures that appear in both source and test files — duplicates indicate this anti-pattern.
**Source:** London Transit Pulse build, 2026-02-07.

## Safari vs Chrome
- Camera/media APIs behave differently on Safari — always test both
