---
description: Test-Driven Development build workflow. Writes failing tests first, implements iteratively until green, then refactors. Tracks iteration count and reports which tests were hardest to pass.
argument-hint: Feature description to build TDD-style
---

# /tdd-build — Test-Driven Autonomous Build

You are running the `/tdd-build` workflow. This skill enforces strict test-driven development: tests are written FIRST, verified to FAIL, then implementation proceeds iteratively until ALL tests pass. You do not stop or ask for input until tests are green.

## Core Rule

```
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST.
NO STOPPING UNTIL ALL TESTS ARE GREEN.
```

If you catch yourself writing implementation before tests exist, STOP and restart from Step 1.

## Setup

Before starting, ensure the project has a test runner configured:

1. Check for existing test config (`jest.config.*`, `vitest.config.*`, or `test` script in `package.json`)
2. If no test runner exists, set up Vitest (preferred) or Jest with TypeScript support
3. Confirm `npm test -- --run` executes without config errors (zero tests is OK)

## Workflow Steps

Track iteration count from the start. An **iteration** = one cycle of [write/modify code → run tests].

### Step 1: RED — Write Comprehensive Failing Tests (NEVER SKIP)

**This is the most important step. Do not shortcut it.**

Invoke @qa as a subagent via the Task tool to write the test suite:

```
Use the Task tool to invoke @qa with:
- The feature description
- Instruction to write tests covering ALL of the following categories:
  1. Happy path (core functionality works as expected)
  2. Edge cases (empty states, boundary values, long inputs, special characters)
  3. Error handling (invalid input, missing data, network failures)
  4. SSR/Client safety (component renders without crashing in both environments)
  5. API route correctness (correct status codes, 404 for missing routes, auth checks)
  6. Browser policy compliance (audio autoplay restrictions, iframe embedding, CORS)
  7. Integration boundaries (data flows between components/routes correctly)
```

@qa writes the tests. You review them for completeness before proceeding.

**Minimum test categories required** (skip only if genuinely not applicable to the feature):

| Category | What to Test |
|----------|-------------|
| Happy path | Core user flow works end-to-end |
| Empty/null states | No data, undefined props, missing params |
| Boundary values | 0, 1, max, negative, overflow |
| SSR safety | No `window`/`document` access during server render |
| Client hydration | Component mounts without errors after SSR |
| API routes | Correct HTTP methods, status codes, 404 for bad paths |
| Auth boundaries | Protected routes reject unauthenticated requests |
| Audio/media | Autoplay policies handled (user gesture required) |
| Iframe/embed | CSP and X-Frame-Options respected |
| Error recovery | Graceful degradation on failure, no white screens |

### Step 2: Verify RED

Run the full test suite:

```bash
npm test -- --run 2>&1
```

**Every new test MUST fail.** If any test passes before implementation:
- The test is not testing new behavior — rewrite it
- Or the feature already exists — reassess scope

Record: `failing_count = [number of failing tests]`

Do not proceed until all new tests fail for the RIGHT reasons (missing implementation, not syntax errors).

### Step 3: GREEN — Implement Iteratively

Now write implementation code. Follow this loop:

```
iteration = 0
while (failing tests > 0):
    iteration += 1

    1. Read the FIRST failing test carefully
    2. Write the MINIMUM code to make it pass
    3. Run: npm test -- --run
    4. Record: which tests now pass, which still fail
    5. If a previously passing test broke → fix regression FIRST
    6. Continue to next failing test
```

**Rules during GREEN phase:**
- Write the simplest code that makes the test pass — do not over-engineer
- If you need to modify a test because the interface changed, that is OK — but document why
- If a test is genuinely wrong (testing impossible behavior), fix it and note it in the summary
- Do NOT add features beyond what tests specify
- Run tests after EVERY change — no batching multiple changes

**Stuck detection:** If the same test has failed for 3+ consecutive iterations:
1. Re-read the test to verify it is testing the right thing
2. Check for environment issues (missing mocks, wrong imports)
3. Try a different implementation approach
4. If still stuck after 5 iterations on the same test, note it as "hardest test" and try the next test

### Step 4: Verify GREEN

Run the full test suite one final time:

```bash
npm test -- --run 2>&1
```

**ALL tests must pass.** If any test still fails, return to Step 3.

Also run type checking:

```bash
npx tsc --noEmit 2>&1
```

Fix any type errors before proceeding.

### Step 5: REFACTOR

With all tests green, clean up the implementation:

1. Remove duplication
2. Extract functions if code is too long
3. Improve naming
4. Remove dead code or unused imports
5. Run tests after EACH refactor to ensure nothing breaks:

```bash
npm test -- --run 2>&1
```

If any test fails during refactoring, revert the refactor and try a different approach.

### Step 6: Final Verification

Run the full quality gate:

```bash
npm test -- --run && npx tsc --noEmit
```

Both must pass. If the project has a build step:

```bash
npm run build
```

### Step 7: TDD Summary Report

Write a summary in this format:

```markdown
## TDD Build Report: [Feature Name]

### Metrics
- **Total iterations:** [count]
- **Tests written:** [count]
- **Tests modified during implementation:** [count] (with reasons)
- **Red phase duration:** [how many tests were initially failing]
- **Green phase iterations:** [count from Step 3]
- **Refactor changes:** [count of refactoring edits]

### Test Difficulty Ranking
1. **[Hardest test name]** — [why it was hard, how many iterations]
2. **[Second hardest]** — [reason]
3. ...

### Tests by Category
- Happy path: [count] tests
- Edge cases: [count] tests
- SSR/Client safety: [count] tests
- API routes: [count] tests
- Error handling: [count] tests
- Browser policies: [count] tests

### Key Learnings
- [What was surprising]
- [What pattern emerged]
- [What would be done differently next time]
```

## Failure Recovery

| Problem | Action |
|---------|--------|
| Test runner not configured | Set up Vitest/Jest, return to Step 1 |
| Tests pass immediately (Step 2) | Tests are wrong — rewrite them |
| Stuck on same test 5+ iterations | Skip, note in report, come back after other tests pass |
| Previously passing test breaks | Fix regression before continuing (this is iteration +1) |
| Type errors after GREEN | Fix types, re-run tests, count as iteration |
| Build fails after all tests pass | Fix build issue, re-run tests |

## What This Skill Prevents

- Writing code without knowing what "done" looks like
- Shipping features that break SSR
- API routes that 404 unexpectedly
- Audio/media features that fail browser autoplay policies
- iframe embeds blocked by CSP
- Features that work in dev but crash in production
- "It works on my machine" without proof

## Quick Reference

```
/tdd-build a dark mode toggle with system preference detection
/tdd-build an API route for user preferences with auth
/tdd-build an audio player component with autoplay handling
```
