# Quality Gates

Explicit checkpoints that must pass before proceeding to the next phase. No gate, no progress.

---

## First-Class Citizens

Every gate must verify these four principles. They are non-negotiable.

| Principle | Question to Ask | If No, Gate Fails |
|-----------|-----------------|-------------------|
| **Testing** | Are tests written/updated for this phase? Do they pass? | Yes |
| **Security** | Were security implications considered? | Yes |
| **Documentation** | Is this documented? Are docs updated? | Yes |
| **Consistency** | Are all related files in sync? | Yes |

These checks apply to EVERY gate, not just the final ones. A gate cannot pass if any of these are incomplete.

---

## How Gates Work in v2

ShipIt v2 enforces gates through **two mechanisms**:

### 1. Hook-Based Enforcement (Automatic)
Hook scripts in `.claude-plugin/hooks/` automatically block actions when gates are not met. All hooks are registered globally in `.claude/settings.json` (the canonical location) and fire for every agent — there is no per-agent hook configuration:
- `pre-push-check.js` -- PreToolUse on Bash: blocks `git push` if tests fail, build fails, or conflict markers exist
- `security-scan.js` -- PreToolUse on Bash: blocks `vercel --prod` if secrets are exposed or security checks fail
- `post-completion.js` -- Stop event: validates test coverage when any agent stops

Hooks are fail-closed: if a hook crashes unexpectedly, it blocks the action (exit 2) rather than silently allowing it.

### 2. Orchestrator Checkpoints (Manual)
The orchestrator verifies gates at phase transitions before spawning the next agent or team.

---

## Gate 1: PRD Approval

**When:** After PRD creation, before architecture
**Gatekeeper:** @pm (or user)
**Blocks:** @architect from starting
**Type:** HARD -- always requires human approval

### Required Checks

| Check | Pass Criteria |
|-------|---------------|
| Problem clarity | Can explain the problem in one sentence |
| User identified | Know who this is for |
| Success defined | Measurable criteria for "it works" |
| MVP scoped | Feature list is ruthlessly minimal |
| No scope creep | Nothing snuck in that isn't core |
| User approved | User has explicitly said "yes, build this" |

---

## Gate 2: Architecture Review

**When:** After architecture, before infrastructure setup
**Gatekeeper:** @architect (self-review) + @reviewer
**Blocks:** @devsecops from starting
**Type:** Soft -- logs concerns, continues in autonomous mode

### Required Checks

| Check | Pass Criteria |
|-------|---------------|
| Data model complete | All entities defined with relationships |
| API structure defined | Endpoints documented |
| Security considered | Auth approach, RLS, input validation planned |
| Multi-user ready | user_id on entities, even if single-user MVP |
| Tech decisions documented | Choices made with rationale |
| TECH_STACK.md created | Locked dependency manifest with exact versions |
| APP_FLOW.md reviewed | Routes and screen inventory used for API design |
| Feasibility confirmed | Nothing impossible or wildly complex |

---

## Gate 3: Infrastructure Ready

**When:** After setup, before coding
**Gatekeeper:** @devsecops
**Blocks:** @engineer from starting
**Type:** Soft -- logs issues, continues if basic setup works

### Required Checks

| Check | Pass Criteria |
|-------|---------------|
| Repo created | GitHub repo exists and pushed |
| Deployment working | Vercel deployment succeeds (even if empty) |
| Database ready | Supabase project created, schema pushed |
| Env vars configured | All required vars set in Vercel |
| CI pipeline exists | GitHub Actions workflow created |
| Local dev works | `npm run dev` works with `.env.local` |
| **Test infrastructure exists** | Test runner in devDependencies, `test` script in package.json, test config file present. Without this, Gate 4 is structurally impossible to pass. |

---

## Gate 4: Code Review

**When:** After feature implementation, before merge
**Gatekeeper:** @reviewer
**Blocks:** Merge to main
**Type:** Soft -- flags issues for later in autonomous mode
**Hook Enforcement:** `pre-push-check.js` blocks `git push` if tests fail or build fails

### Required Checks

| Check | Pass Criteria |
|-------|---------------|
| Functionality works | Core feature does what PRD says |
| Tests exist | Tests written for happy path + key errors |
| Tests pass | All tests green |
| No security issues | No vulnerabilities found |
| Code quality acceptable | Readable, maintainable, not embarrassing |
| Error handling present | Errors caught and handled gracefully |
| FRONTEND_GUIDELINES.md followed | Colours, spacing, typography match design tokens |
| TECH_STACK.md respected | No unapproved packages introduced |

### Severity Levels

- **Must Fix** - Blocks merge
- **Should Fix** - Fix before ship, doesn't block merge
- **Nice to Have** - Optional improvements

---

## Gate 5: Security Scan

**When:** After code complete, before production deploy
**Gatekeeper:** @devsecops + @reviewer
**Blocks:** Production deployment
**Type:** HARD -- cannot ship with known vulnerabilities
**Hook Enforcement:** `security-scan.js` blocks `vercel --prod` if checks fail

### Required Checks

| Check | Pass Criteria |
|-------|---------------|
| RLS enabled | All Supabase tables have RLS |
| RLS policies exist | SELECT/INSERT/UPDATE/DELETE policies |
| No exposed secrets | No keys in code or git history |
| Input validation | All user inputs validated |
| Auth checks | Protected routes require auth (if applicable) |
| HTTPS only | No HTTP endpoints |
| Env vars secured | Service keys not in client bundle |

---

## Gate 6: Ship Ready

**When:** After all other gates, before declaring "done"
**Gatekeeper:** @orchestrator
**Blocks:** Shipping
**Type:** HARD -- final checklist requires human judgment
**Hook Enforcement:** `post-completion.js` validates on orchestrator Stop event

### Required Checks

| Check | Pass Criteria |
|-------|---------------|
| All gates passed | Gates 1-5 documented and passed |
| Definition of Done met | See checklist below |
| User has dogfooded | Used it themselves |
| No blocking bugs | No known critical issues |

### Definition of Done Checklist

- [ ] Not embarrassing to show someone
- [ ] Core functionality works end-to-end
- [ ] Live on Vercel (not localhost)
- [ ] Tests passing
- [ ] Documentation exists
- [ ] Security review passed
- [ ] User has used it

---

## Gate Enforcement Summary

| Gate | Type | Enforcement | What Happens on Failure |
|------|------|-------------|------------------------|
| 1. PRD Approval | HARD | Orchestrator checkpoint | Stops. Requires human approval. |
| 2. Architecture Review | Soft | Orchestrator checkpoint | Logs warning to memory. Continues. |
| 3. Infrastructure Ready | Soft | Orchestrator checkpoint | Logs warning to memory. Continues if basics work. |
| 4. Code Review | Soft | `pre-push-check.js` hook | Hook blocks `git push`. Warning logged. |
| 5. Security Scan | HARD | `security-scan.js` hook | Hook blocks `vercel --prod`. Stops. |
| 6. Ship Ready | HARD | `post-completion.js` hook | Hook validates on Stop. Stops if not ready. |

### Hard Gates (Always Stop on Failure)
- Gate 1: User must confirm scope before building
- Gate 5: Cannot ship with known vulnerabilities
- Gate 6: Final checklist requires human judgment

### Soft Gates (Warn and Continue in Autonomous Mode)
- Gate 2: Log concerns, continue to setup
- Gate 3: Log issues, continue if basic setup works
- Gate 4: Flag issues for later, continue to QA

---

## Gate 0: Platform Feature Verification (ShipIt Development Only)

**When:** Before using any Claude Code feature in agent definitions or documentation
**Gatekeeper:** @engineer or @devsecops
**Type:** HARD — do not document features that do not work

### Required Checks

| Check | Pass Criteria |
|-------|---------------|
| Frontmatter fields verified | Every YAML field in agent definitions has been tested to confirm it affects behavior. Untested fields are removed. |
| Hook registration verified | Every hook is confirmed to fire by testing with a trigger action |
| Feature flags verified | Experimental features (e.g., Agent Teams) are tested in a fresh session |
| Eliminated concepts absent | Grep codebase against CLAUDE.md eliminated concepts table — zero matches |

---

## Overriding Gates

Sometimes you need to skip a gate (prototyping, time pressure, etc.). This is allowed but must be documented:

```markdown
### Gate Override

**Gate:** [which gate]
**Reason:** [why skipping]
**Risk accepted:** [what could go wrong]
**User approved:** Yes - [date]
```

Don't make a habit of this. Gates exist because skipping them causes pain later.
