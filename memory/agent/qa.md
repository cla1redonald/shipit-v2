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

## Dashboard / Shared State Testing

### Integration Tests for Filter-to-Component Pipelines Are Mandatory
**Context:** Any dashboard or app with shared filter/toggle state (date range, mode selectors, search, etc.)
**Learning:** London Transit Pulse had 177 passing unit tests but 4 critical integration bugs (KPIs static, values identical across ranges, sparklines frozen, mode toggles visual-only). All components passed in isolation; none were tested with the actual filter context.
**Action:** For every component that consumes shared state, write at least one integration test that:
1. Renders the component within the state provider
2. Changes a filter/toggle value
3. Asserts the rendered output actually changes (not just that it renders)
This is the minimum viable test suite for dashboards. Without it, 100% unit test coverage gives 0% confidence in filter interactivity.
**Source:** London Transit Pulse, 2026-02-07.

### Test Data Variation, Not Just Data Presence
**Context:** Dashboard components that display computed values (averages, sums, percentages)
**Learning:** Tests that assert "KPI section renders 4 cards" pass even when all 4 cards show identical values for every filter. Tests must assert that different inputs produce different outputs.
**Action:** Include at least one assertion per component that verifies output differs for two different filter states. Example: `expect(value7d).not.toEqual(value30d)`.
**Source:** London Transit Pulse, 2026-02-07. 7D/30D/90D all showed identical KPI values.

### Visual State vs Data State Must Be Tested Separately
**Context:** Toggle or filter controls that have both a visual effect (dimming, highlighting) and a data effect (recalculation)
**Learning:** Mode toggles dimmed cards but never recalculated sums. The visual change created the illusion the feature worked, so nobody tested the data change.
**Action:** Write separate assertions for (1) visual state change (CSS class applied) and (2) data state change (computed value differs). A toggle that only changes appearance is a broken toggle.
**Source:** London Transit Pulse, 2026-02-07.

### Value Format Assertions
**Context:** Components displaying percentages, currency, or other formatted numbers
**Learning:** KPICard displayed "0.854" instead of "85.4%" because no format prop existed. Any test asserting the actual rendered text would have caught this.
**Action:** For components that display formatted values, assert the formatted string in at least one test (e.g., expect rendered text to contain "%" for percentage values).
**Source:** London Transit Pulse, 2026-02-07.

## Pre-Deploy Verification

### Local Build as QA Gate
**Context:** Any project deploying to Vercel or similar platform
**Learning:** London Transit Pulse's first deploy failed because `next build` was never run locally. It would have caught both the React version conflict and the missing data files.
**Action:** `next build` (or equivalent build command) succeeding locally is a QA gate before first deploy. This is not optional and should be part of the @qa pre-deploy checklist.
**Source:** London Transit Pulse, 2026-02-07.

## Safari vs Chrome
- Camera/media APIs behave differently on Safari — always test both
