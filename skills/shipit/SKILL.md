---
name: shipit
description: Enforced commit workflow — test, typecheck, build, commit, retro, docs, push. Ensures quality gates pass and mandatory agents run before shipping.
---

# /shipit — Enforced Commit Workflow

You are running the `/shipit` commit workflow. This skill enforces the correct sequence of steps before pushing code. Every step must pass before proceeding to the next.

## Workflow Steps

Execute these steps in order. If any step fails, stop and fix before continuing.

### Step 1: Run Tests

```bash
npm test -- --run
```

If tests fail, fix them. Do not proceed with failing tests.

### Step 2: Type Check

```bash
npx tsc --noEmit
```

If there are type errors, fix them. Do not proceed with type errors.

### Step 3: Build

Run the project's actual build command from `package.json`:

```bash
npm run build
```

If build fails, fix it. The build command in `package.json` is what CI/Vercel runs — `tsc --noEmit` alone is insufficient.

### Step 4: Commit

Stage and commit changes with a clear message:

```bash
git add [specific files]
git commit -m "[type]: [description]"
```

Use conventional commit prefixes: `feat:`, `fix:`, `test:`, `docs:`, `refactor:`, `chore:`.

### Step 5: Run @retro (NEVER SKIP)

**This step is mandatory. There is no acceptable justification for skipping it.**

Invoke @retro as a subagent to evaluate learnings from this change:

```
Use the Task tool to invoke @retro with:
- What changed and why
- Any patterns worth capturing
- Any mistakes made during implementation
```

Wait for @retro to complete before proceeding.

### Step 6: Run @docs (NEVER SKIP)

**This step is mandatory. There is no acceptable justification for skipping it.**

Invoke @docs as a subagent to assess documentation impact:

```
Use the Task tool to invoke @docs with:
- What changed (files, APIs, types, schemas)
- Whether existing docs are still accurate
- Whether new documentation is needed
```

If @docs identifies updates needed, make them before proceeding.

### Step 7: Push

```bash
git push
```

The `pre-push-check.js` hook will verify tests and build one more time before allowing the push.

## Failure Recovery

| Step Failed | Action |
|-------------|--------|
| Tests | Fix failing tests, re-run from Step 1 |
| Type check | Fix type errors, re-run from Step 2 |
| Build | Fix build errors, re-run from Step 3 |
| Commit | Resolve staging issues, retry Step 4 |
| @retro | Retry invocation — never skip |
| @docs | Retry invocation — never skip |
| Push | Check hook output, fix issues, retry |

## What This Skill Prevents

- Pushing code without tests passing
- Pushing code with type errors
- Pushing code that doesn't build
- Skipping @retro (the most common failure mode in past projects)
- Skipping @docs (documentation drift)
- Pushing without quality gate verification
