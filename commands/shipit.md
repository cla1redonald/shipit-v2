---
description: Enforced commit workflow — test, typecheck, build, commit, retro, docs, push, PR, review, merge. Ensures quality gates pass, mandatory agents run, and code is reviewed before shipping.
---

# /shipit — Enforced Commit Workflow

You are running the `/shipit` commit workflow. This skill enforces the correct sequence of steps before shipping code. Every step must pass before proceeding to the next.

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
git push -u origin HEAD
```

The `pre-push-check.js` hook will verify tests and build one more time before allowing the push.

### Step 8: Create PR (NEVER SKIP)

**This step is mandatory.** After pushing, create a pull request.

Check the current branch:

```bash
git branch --show-current
```

If on `main` or `master`, you must create a feature branch first:

```bash
git checkout -b [type]/[short-description]
git push -u origin HEAD
```

Create the PR targeting the main branch:

```bash
gh pr create --title "[type]: [description]" --body "$(cat <<'EOF'
## Summary
[1-3 bullet points describing the change]

## Test plan
- [ ] Tests pass (`npm test`)
- [ ] Types check (`tsc --noEmit`)
- [ ] Build succeeds (`npm run build`)
EOF
)"
```

### Step 9: Code Review (NEVER SKIP)

**This step is mandatory.** Invoke @reviewer to review the PR.

```
Use the Task tool to invoke @reviewer (model: "sonnet") with:
- The PR number from Step 8
- Instruction to run: gh pr diff [PR_NUMBER]
- The full code-review checklist from commands/code-review.md
- Instruction to report findings using the standard severity levels (Must Fix / Should Fix / Nice to Have)
```

Wait for the review to complete.

**Evaluate the verdict:**

| Verdict | Action |
|---------|--------|
| **Ready to ship** | Proceed to Step 10 |
| **Fix and re-review** | Fix all "Must Fix" and "Should Fix" issues, re-run Steps 1-3 (test, typecheck, build), commit fixes, push, then re-run Step 9 |
| **Major rework** | Stop. Present the review findings to the user for guidance before continuing |

**Fix loop:** If fixing review feedback, commit fixes with prefix `fix(review):`, push, then re-invoke @reviewer on the updated PR. Repeat until the verdict is "Ready to ship". Maximum 3 review cycles — if not resolved after 3 rounds, stop and ask the user.

### Step 10: Merge PR

Once the review verdict is "Ready to ship":

```bash
gh pr merge [PR_NUMBER] --squash --delete-branch
```

Use `--squash` to keep the main branch history clean. The `--delete-branch` flag cleans up the feature branch.

Confirm the merge succeeded:

```bash
gh pr view [PR_NUMBER] --json state -q '.state'
```

Expected output: `MERGED`.

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
| Create PR | Check `gh auth status`, ensure branch is pushed, retry |
| Code review | If @reviewer fails to invoke, retry. If review finds issues, fix and re-review |
| Merge | Check for merge conflicts, resolve, re-run Steps 1-3, push, retry merge |

## What This Skill Prevents

- Pushing code without tests passing
- Pushing code with type errors
- Pushing code that doesn't build
- Skipping @retro (the most common failure mode in past projects)
- Skipping @docs (documentation drift)
- Pushing without quality gate verification
- Merging unreviewed code to main
- Shipping code with known Must Fix or Should Fix issues
