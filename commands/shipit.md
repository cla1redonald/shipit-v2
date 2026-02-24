---
description: Enforced commit workflow — test, typecheck, build, commit, retro, docs, push, PR, review, retro, merge. Ensures quality gates pass, mandatory agents run, and code is reviewed before shipping.
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

### Step 4: Ensure Feature Branch

Before committing, check the current branch:

```bash
git branch --show-current
```

If on `main` or `master`, create a feature branch first:

```bash
git checkout -b [type]/[short-description]
```

All work must be committed to a feature branch, never directly to main.

### Step 5: Commit

Stage and commit changes with a clear message:

```bash
git add [specific files]
git commit -m "[type]: [description]"
```

Use conventional commit prefixes: `feat:`, `fix:`, `test:`, `docs:`, `refactor:`, `chore:`.

### Step 6: Run @retro (NEVER SKIP)

**This step is mandatory. There is no acceptable justification for skipping it.**

Invoke @retro as a subagent to evaluate learnings from this change:

```
Use the Task tool to invoke @retro with:
- What changed and why
- Any patterns worth capturing
- Any mistakes made during implementation
```

Wait for @retro to complete before proceeding.

### Step 7: Run @docs (NEVER SKIP)

**This step is mandatory. There is no acceptable justification for skipping it.**

Invoke @docs as a subagent to assess documentation impact:

```
Use the Task tool to invoke @docs with:
- What changed (files, APIs, types, schemas)
- Whether existing docs are still accurate
- Whether new documentation is needed
```

If @docs identifies updates needed, make them before proceeding.

### Step 8: Push

**Prerequisite:** Verify GitHub access before pushing:

```bash
gh auth status
```

If auth fails, stop and tell the user to run `gh auth login`.

Push the feature branch:

```bash
git push -u origin HEAD
```

The `pre-push-check.js` hook will verify tests and build one more time before allowing the push.

### Step 9: Create PR (NEVER SKIP)

**This step is mandatory.** After pushing, create a pull request.

First check if a PR already exists for this branch:

```bash
gh pr view --json number -q '.number' 2>/dev/null
```

If a PR already exists, save that number and skip to Step 10. Otherwise, create one:

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

**Capture the PR number** from the URL printed by `gh pr create` (the final number in the URL path). Save it for Steps 10-12. You can also retrieve it with:

```bash
gh pr view --json number -q '.number'
```

### Step 10: Code Review (NEVER SKIP)

**This step is mandatory.** Review the PR before merging.

First, fetch the PR diff yourself:

```bash
gh pr diff [PR_NUMBER]
```

Then invoke @reviewer to review it:

```
Use the Task tool to invoke @reviewer (model: "sonnet") with:
- The PR number
- The full PR diff output (paste the diff into the prompt)
- The full code-review checklist from commands/code-review.md
- Instruction to report findings using severity levels (Must Fix / Should Fix / Nice to Have)
```

Note: @reviewer does not have Bash access — you must provide the diff content in the task prompt.

Wait for the review to complete.

**Evaluate the verdict:**

| Verdict | Action |
|---------|--------|
| **Ready to ship** | Proceed to Step 11 (Post-Review Retro) |
| **Fix and re-review** | Fix all "Must Fix" and "Should Fix" issues, re-run Steps 1-3 (test, typecheck, build), commit with prefix `fix(review):`, push, then re-run Step 10 |
| **Major rework** | Stop. Present the review findings to the user for guidance before continuing |

**Fix loop:** Maximum 3 review cycles. If not resolved after 3 rounds, stop and ask the user. Leave the PR open for the user to resolve manually.

### Step 11: Post-Review Retro (NEVER SKIP)

**This step is mandatory.** After the code review is complete (regardless of verdict), invoke @retro to capture learnings from the review.

```
Use the Task tool to invoke @retro (model: "opus") with:
- The complete review output (all Must Fix, Should Fix, and Nice to Have findings)
- What was fixed during the review fix loop (if anything)
- How many review cycles were needed
- Instruction to cross-reference findings against existing committed memory and evaluate each for Tier 1 vs Tier 2 graduation
```

Note: Recurrence detection is @retro's responsibility — do not pre-classify findings yourself. Provide the raw review data and let @retro assess against its memory.

@retro will:
1. Evaluate each review finding as a potential learning
2. Check if any findings match patterns already seen in committed memory
3. Graduate recurring patterns or critical findings to Tier 2 (`memory/agent/` or `memory/shared/`)
4. Report what was captured and what was graduated

Wait for @retro to complete before proceeding to merge.

**Why this matters:** Review findings are high-signal learning material. A "Must Fix" that slipped through implementation reveals a gap in agent knowledge. Without this step, the same mistakes recur across projects.

### Step 12: Merge PR

Once the review verdict is "Ready to ship":

```bash
gh pr merge [PR_NUMBER] --squash --delete-branch
```

Use `--squash` to keep the main branch history clean. The `--delete-branch` flag cleans up the feature branch.

Confirm the merge succeeded:

```bash
gh pr view [PR_NUMBER] --json state -q '.state'
```

Expected output: `MERGED`. If not, wait 5 seconds and retry once before reporting a failure.

## Failure Recovery

| Step Failed | Action |
|-------------|--------|
| Tests | Fix failing tests, re-run from Step 1 |
| Type check | Fix type errors, re-run from Step 2 |
| Build | Fix build errors, re-run from Step 3 |
| Feature branch | If `git checkout -b` fails (branch exists), use `git checkout [branch]` |
| Commit | Resolve staging issues, retry Step 5 |
| @retro | Retry invocation — never skip |
| @docs | Retry invocation — never skip |
| Push | Check `gh auth status`, check hook output, fix issues, retry |
| Create PR | If PR already exists, use `gh pr view --json number -q '.number'` and continue. If auth fails, run `gh auth login` |
| Code review | If @reviewer fails to invoke, retry. If review finds issues: fix, re-run Steps 1-3, commit, push, then retry Step 10 |
| Post-review retro | Retry invocation — never skip |
| Merge | Check for merge conflicts, resolve, re-run Steps 1-3, push, retry merge |

## What This Skill Prevents

- Committing directly to main without a PR review
- Pushing code without tests passing
- Pushing code with type errors
- Pushing code that doesn't build
- Skipping @retro (the most common failure mode in past projects)
- Skipping @docs (documentation drift)
- Pushing without quality gate verification
- Merging unreviewed code to main
- Shipping code with known Must Fix or Should Fix issues
- Losing review learnings that could prevent recurring issues across projects
